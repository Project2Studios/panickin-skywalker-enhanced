import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Cart types
export interface CartItem {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    basePrice: number;
  };
  variant: {
    id: string;
    name: string;
    sku: string;
    priceAdjustment: number;
    attributes: Record<string, any>;
  };
  quantity: number;
  price: number;
  total: number;
  primaryImage?: {
    id: string;
    imageUrl: string;
    altText: string;
  } | null;
  inStock: boolean;
  availableStock: number;
  maxQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartSummary {
  itemCount: number;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

export interface Cart {
  items: CartItem[];
  summary: CartSummary;
}

export interface AddToCartRequest {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

// Session management
function getSessionId(): string {
  let sessionId = localStorage.getItem('cart-session-id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('cart-session-id', sessionId);
  }
  return sessionId;
}

// Cart hooks
export function useCart() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const sessionId = getSessionId();

  const { data: cart, isLoading, error } = useQuery<Cart>({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/cart', {
        headers: {
          'x-session-id': sessionId,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
      return response.json();
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    cart: cart || { items: [], summary: { itemCount: 0, subtotal: 0, tax: 0, shipping: 0, total: 0 } },
    isLoading,
    error,
    sessionId,
  };
}

export function useAddToCart() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const sessionId = getSessionId();

  return useMutation({
    mutationFn: async (request: AddToCartRequest) => {
      const response = await apiRequest('POST', '/api/cart/items', {
        body: JSON.stringify(request),
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add item to cart');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate cart query to refresh data
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      
      toast({
        title: "Added to cart!",
        description: `${data.item.product.name} has been added to your cart.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error adding to cart",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateCartItem() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const sessionId = getSessionId();

  return useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const response = await apiRequest('PUT', `/api/cart/items/${itemId}`, {
        body: JSON.stringify({ quantity }),
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update cart item');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      
      if (data.removed) {
        toast({
          title: "Item removed",
          description: "Item has been removed from your cart.",
        });
      } else {
        toast({
          title: "Cart updated",
          description: "Item quantity has been updated.",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating cart",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useRemoveFromCart() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const sessionId = getSessionId();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const response = await apiRequest('DELETE', `/api/cart/items/${itemId}`, {
        headers: {
          'x-session-id': sessionId,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove item from cart');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error removing item",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useClearCart() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const sessionId = getSessionId();

  return useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', '/api/cart', {
        headers: {
          'x-session-id': sessionId,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to clear cart');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error clearing cart",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Utility hooks
export function useCartItemCount() {
  const { cart } = useCart();
  return cart.summary.itemCount;
}

export function useCartTotal() {
  const { cart } = useCart();
  return cart.summary.total;
}

export function useCartSubtotal() {
  const { cart } = useCart();
  return cart.summary.subtotal;
}

export function useIsInCart(productId: string, variantId: string) {
  const { cart } = useCart();
  return cart.items.some(item => 
    item.product.id === productId && item.variant.id === variantId
  );
}

export function useCartItem(productId: string, variantId: string) {
  const { cart } = useCart();
  return cart.items.find(item => 
    item.product.id === productId && item.variant.id === variantId
  );
}

// Format price utility
export function useFormatPrice() {
  return (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };
}

// Optimistic updates helper
export function useOptimisticCart() {
  const queryClient = useQueryClient();
  const { cart } = useCart();
  
  const optimisticallyAddItem = (productId: string, variantId: string, quantity: number) => {
    queryClient.setQueryData(['cart'], (oldCart: Cart | undefined) => {
      if (!oldCart) return oldCart;
      
      // This is simplified - in a real implementation you'd need product data
      // to create a proper optimistic update
      return {
        ...oldCart,
        summary: {
          ...oldCart.summary,
          itemCount: oldCart.summary.itemCount + quantity,
        },
      };
    });
  };
  
  const optimisticallyUpdateItem = (itemId: string, quantity: number) => {
    queryClient.setQueryData(['cart'], (oldCart: Cart | undefined) => {
      if (!oldCart) return oldCart;
      
      const items = oldCart.items.map(item => {
        if (item.id === itemId) {
          const newTotal = item.price * quantity;
          return { ...item, quantity, total: newTotal };
        }
        return item;
      });
      
      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      
      return {
        ...oldCart,
        items,
        summary: {
          ...oldCart.summary,
          itemCount,
          subtotal,
          total: subtotal, // Simplified - should include tax/shipping
        },
      };
    });
  };
  
  const optimisticallyRemoveItem = (itemId: string) => {
    queryClient.setQueryData(['cart'], (oldCart: Cart | undefined) => {
      if (!oldCart) return oldCart;
      
      const items = oldCart.items.filter(item => item.id !== itemId);
      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      
      return {
        ...oldCart,
        items,
        summary: {
          ...oldCart.summary,
          itemCount,
          subtotal,
          total: subtotal,
        },
      };
    });
  };
  
  return {
    optimisticallyAddItem,
    optimisticallyUpdateItem,
    optimisticallyRemoveItem,
  };
}

// Cart persistence helper
export function useCartPersistence() {
  const { cart } = useCart();
  
  useEffect(() => {
    // Store cart summary in localStorage for quick access
    if (cart) {
      localStorage.setItem('cart-summary', JSON.stringify(cart.summary));
    }
  }, [cart]);
  
  const getPersistedCartSummary = (): CartSummary | null => {
    try {
      const stored = localStorage.getItem('cart-summary');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };
  
  return { getPersistedCartSummary };
}
