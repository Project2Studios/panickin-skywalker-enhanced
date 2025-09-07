import { loadStripe } from '@stripe/stripe-js';

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render.
let stripePromise: Promise<any>;

export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = (typeof window !== 'undefined' && window.location.hostname === 'localhost') 
      ? 'pk_test_51HZrHzGZ6Wz5SXZL3nCGZ6Wz5SXZL3nCGZ6Wz5SXZL3nCGZ6Wz5SXZL3nC' 
      : process.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_...'; // This will be set in .env
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

// API endpoints for Stripe operations
export const stripeAPI = {
  createPaymentIntent: async (data: {
    amount: number;
    currency: string;
    orderItems: Array<{
      productId: string;
      variantId: string;
      quantity: number;
    }>;
    customerInfo: {
      email: string;
      name: string;
    };
  }) => {
    const response = await fetch('/api/checkout/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create payment intent');
    }
    
    return await response.json();
  },

  confirmOrder: async (data: {
    paymentIntentId: string;
    orderData: any;
  }) => {
    const response = await fetch('/api/checkout/confirm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to confirm order');
    }
    
    return await response.json();
  },

  calculateTotals: async (data: {
    items: Array<{
      productId: string;
      variantId: string;
      quantity: number;
    }>;
    shippingAddress: {
      state: string;
      country: string;
      postalCode: string;
    };
    shippingMethod: 'standard' | 'express' | 'overnight';
    promoCode?: string;
  }) => {
    const response = await fetch('/api/checkout/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to calculate totals');
    }
    
    return await response.json();
  },
};

// Helper functions for Stripe integration
export const formatStripeAmount = (amount: number): number => {
  // Stripe expects amounts in cents
  return Math.round(amount * 100);
};

export const formatDisplayAmount = (stripeAmount: number): number => {
  // Convert from cents to dollars for display
  return stripeAmount / 100;
};

// Error handling for Stripe-specific errors
export const handleStripeError = (error: any): string => {
  if (error.type === 'card_error' || error.type === 'validation_error') {
    return error.message || 'Your card was declined. Please try a different payment method.';
  }
  
  if (error.type === 'rate_limit_error') {
    return 'Too many requests made to the API too quickly. Please try again in a moment.';
  }
  
  if (error.type === 'invalid_request_error') {
    return 'Invalid parameters were supplied to Stripe\'s API.';
  }
  
  if (error.type === 'api_error') {
    return 'An error occurred with Stripe\'s API. Please try again.';
  }
  
  if (error.type === 'api_connection_error') {
    return 'Network communication with Stripe failed. Please check your internet connection.';
  }
  
  if (error.type === 'authentication_error') {
    return 'Authentication with Stripe\'s API failed. This is likely a configuration error.';
  }
  
  // Generic error message for unknown error types
  return error.message || 'An unexpected error occurred. Please try again.';
};

// Payment method types supported
export const SUPPORTED_PAYMENT_METHODS = [
  'card',
  'apple_pay',
  'google_pay',
  'link',
  'us_bank_account',
] as const;

export type SupportedPaymentMethod = typeof SUPPORTED_PAYMENT_METHODS[number];