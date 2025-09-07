import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/use-cart';

// Checkout types
export interface ShippingAddress {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface BillingAddress extends ShippingAddress {
  sameAsShipping: boolean;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  isDefault: boolean;
}

export interface PaymentMethod {
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
  data?: any; // Stripe payment method or other payment data
}

export interface CheckoutSession {
  id: string;
  cartId: string;
  customerEmail?: string;
  shippingAddress?: ShippingAddress;
  billingAddress?: BillingAddress;
  shippingMethod?: ShippingMethod;
  paymentMethod?: PaymentMethod;
  orderNotes?: string;
  termsAccepted: boolean;
  totals: {
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    total: number;
  };
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export interface OrderCreationRequest {
  sessionId: string;
  paymentMethodId?: string;
  savePaymentMethod?: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  customerEmail: string;
  shippingAddress: ShippingAddress;
  billingAddress: BillingAddress;
  items: Array<{
    id: string;
    productId: string;
    variantId: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  totals: CheckoutSession['totals'];
  createdAt: string;
  estimatedDelivery?: string;
}

// Session management
function getSessionId(): string {
  let sessionId = localStorage.getItem('checkout-session-id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('checkout-session-id', sessionId);
  }
  return sessionId;
}

// Checkout hooks
export function useCheckoutSession() {
  const { toast } = useToast();
  const sessionId = getSessionId();

  const { data: session, isLoading, error } = useQuery<CheckoutSession>({
    queryKey: ['checkout-session', sessionId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/checkout/session/${sessionId}`);
      if (!response.ok) {
        if (response.status === 404) {
          // Create new session if none exists
          const createResponse = await apiRequest('POST', '/api/checkout/session', {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          });
          if (!createResponse.ok) {
            throw new Error('Failed to create checkout session');
          }
          return createResponse.json();
        }
        throw new Error('Failed to fetch checkout session');
      }
      return response.json();
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    session,
    isLoading,
    error,
    sessionId,
  };
}

export function useUpdateCheckoutSession() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const sessionId = getSessionId();

  return useMutation({
    mutationFn: async (updates: Partial<CheckoutSession>) => {
      const response = await apiRequest('PUT', `/api/checkout/session/${sessionId}`, {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update checkout session');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['checkout-session', sessionId], data);
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating checkout",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useShippingMethods() {
  const { session } = useCheckoutSession();

  return useQuery<ShippingMethod[]>({
    queryKey: ['shipping-methods', session?.shippingAddress?.postalCode],
    queryFn: async () => {
      const response = await apiRequest('POST', '/api/checkout/shipping-methods', {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: session?.shippingAddress,
          items: session ? [] : [], // Would include cart items
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch shipping methods');
      }
      
      return response.json();
    },
    enabled: !!session?.shippingAddress,
    refetchOnWindowFocus: false,
  });
}

export function useValidateAddress() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (address: ShippingAddress) => {
      const response = await apiRequest('POST', '/api/checkout/validate-address', {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(address),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to validate address');
      }
      
      return response.json();
    },
    onError: (error: Error) => {
      toast({
        title: "Address validation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useCalculateTax() {
  const { session } = useCheckoutSession();

  return useQuery({
    queryKey: ['tax-calculation', session?.shippingAddress, session?.totals?.subtotal],
    queryFn: async () => {
      if (!session?.shippingAddress) return { tax: 0 };

      const response = await apiRequest('POST', '/api/checkout/calculate-tax', {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: session.shippingAddress,
          amount: session.totals.subtotal,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to calculate tax');
      }
      
      return response.json();
    },
    enabled: !!session?.shippingAddress && !!session?.totals?.subtotal,
    refetchOnWindowFocus: false,
  });
}

export function useCreateOrder() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { sessionId } = useCheckoutSession();

  return useMutation({
    mutationFn: async (request: OrderCreationRequest) => {
      const response = await apiRequest('POST', '/api/checkout/create-order', {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create order');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Clear cart and checkout session
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.removeQueries({ queryKey: ['checkout-session', sessionId] });
      localStorage.removeItem('checkout-session-id');
      localStorage.removeItem('cart-session-id');
      
      toast({
        title: "Order placed successfully!",
        description: `Your order #${data.orderNumber} has been confirmed.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to place order",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Checkout step management
export type CheckoutStep = 'cart' | 'shipping' | 'payment' | 'confirmation';

export function useCheckoutStep() {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('cart');
  const [completedSteps, setCompletedSteps] = useState<Set<CheckoutStep>>(new Set());

  const goToStep = useCallback((step: CheckoutStep) => {
    setCurrentStep(step);
  }, []);

  const completeStep = useCallback((step: CheckoutStep) => {
    setCompletedSteps(prev => new Set([...prev, step]));
  }, []);

  const isStepCompleted = useCallback((step: CheckoutStep) => {
    return completedSteps.has(step);
  }, [completedSteps]);

  const canAccessStep = useCallback((step: CheckoutStep) => {
    const stepOrder: CheckoutStep[] = ['cart', 'shipping', 'payment', 'confirmation'];
    const stepIndex = stepOrder.indexOf(step);
    const currentIndex = stepOrder.indexOf(currentStep);
    
    // Can access current step or any completed step
    if (step === currentStep || isStepCompleted(step)) {
      return true;
    }
    
    // Can access next step if current is completed
    if (stepIndex === currentIndex + 1 && isStepCompleted(currentStep)) {
      return true;
    }
    
    return false;
  }, [currentStep, isStepCompleted]);

  return {
    currentStep,
    completedSteps: Array.from(completedSteps),
    goToStep,
    completeStep,
    isStepCompleted,
    canAccessStep,
  };
}

// Form validation helpers
export function useCheckoutValidation() {
  const validateEmail = useCallback((email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const validatePhone = useCallback((phone: string) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }, []);

  const validatePostalCode = useCallback((postalCode: string, country: string) => {
    const patterns: Record<string, RegExp> = {
      US: /^\d{5}(-\d{4})?$/,
      CA: /^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/,
      GB: /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/,
    };
    
    const pattern = patterns[country];
    if (!pattern) return true; // Allow unknown countries
    
    return pattern.test(postalCode);
  }, []);

  return {
    validateEmail,
    validatePhone,
    validatePostalCode,
  };
}

// Guest checkout helpers
export function useGuestCheckout() {
  const [isGuest, setIsGuest] = useState(true);
  const [guestEmail, setGuestEmail] = useState('');

  const toggleGuestMode = useCallback(() => {
    setIsGuest(!isGuest);
  }, [isGuest]);

  return {
    isGuest,
    guestEmail,
    setGuestEmail,
    toggleGuestMode,
  };
}

// Checkout persistence
export function useCheckoutPersistence() {
  const { session } = useCheckoutSession();
  
  const saveFormData = useCallback((step: string, data: any) => {
    const key = `checkout-form-${step}`;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save form data:', error);
    }
  }, []);

  const loadFormData = useCallback((step: string) => {
    const key = `checkout-form-${step}`;
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to load form data:', error);
      return null;
    }
  }, []);

  const clearFormData = useCallback((step?: string) => {
    if (step) {
      localStorage.removeItem(`checkout-form-${step}`);
    } else {
      // Clear all checkout form data
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith('checkout-form-')
      );
      keys.forEach(key => localStorage.removeItem(key));
    }
  }, []);

  return {
    saveFormData,
    loadFormData,
    clearFormData,
  };
}

// Format helpers
export function useFormatPrice() {
  return (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };
}

// Checkout totals calculation
export function useCheckoutTotals() {
  const { cart } = useCart();
  const { session } = useCheckoutSession();
  const { data: taxData } = useCalculateTax();

  const subtotal = cart.summary.subtotal;
  const shipping = session?.shippingMethod?.price || 0;
  const tax = taxData?.tax || 0;
  const discount = 0; // TODO: Implement discount calculation
  const total = subtotal + shipping + tax - discount;

  return {
    subtotal,
    shipping,
    tax,
    discount,
    total,
  };
}