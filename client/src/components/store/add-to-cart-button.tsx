import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAddToCart, useIsInCart, useCartItem } from '@/hooks/use-cart';
import { Product, ProductVariant } from '@/hooks/use-products';
import { cn } from '@/lib/utils';
import { ShoppingBag, Check, Plus, Minus } from 'lucide-react';

interface AddToCartButtonProps {
  product: Product;
  selectedVariant?: ProductVariant;
  quantity?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showQuantityControls?: boolean;
  onSuccess?: () => void;
}

export function AddToCartButton({
  product,
  selectedVariant,
  quantity = 1,
  size = 'md',
  className,
  showQuantityControls = false,
  onSuccess
}: AddToCartButtonProps) {
  const [localQuantity, setLocalQuantity] = useState(quantity);
  const addToCart = useAddToCart();
  
  // Use first variant if no variant is selected but product has variants
  const defaultVariant = selectedVariant || product.variants?.[0];
  
  const isInCart = useIsInCart(
    product.id,
    defaultVariant?.id || ''
  );
  
  const cartItem = useCartItem(
    product.id,
    defaultVariant?.id || ''
  );
  
  const handleAddToCart = () => {
    if (!defaultVariant) {
      // If no variants available, this probably means we need variant selection
      // Redirect to product page
      window.location.href = `/store/${product.slug}`;
      return;
    }
    
    addToCart.mutate(
      {
        productId: product.id,
        variantId: defaultVariant.id,
        quantity: localQuantity
      },
      {
        onSuccess: () => {
          onSuccess?.();
        }
      }
    );
  };
  
  const isOutOfStock = !product.inStock || (defaultVariant && !defaultVariant.inventory.inStock);
  
  if (isOutOfStock) {
    return (
      <Button
        disabled
        size={size}
        className={cn('cursor-not-allowed', className)}
      >
        Out of Stock
      </Button>
    );
  }
  
  if (showQuantityControls && !isInCart) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center border border-border rounded-md">
          <Button
            variant="ghost"
            size="sm"
            className="px-2 py-1"
            onClick={() => setLocalQuantity(Math.max(1, localQuantity - 1))}
            disabled={localQuantity <= 1}
          >
            <Minus className="h-3 w-3" />
          </Button>
          
          <span className="px-3 py-1 text-sm min-w-[2rem] text-center">
            {localQuantity}
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            className="px-2 py-1"
            onClick={() => setLocalQuantity(localQuantity + 1)}
            disabled={localQuantity >= (defaultVariant?.inventory.available || 10)}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        
        <Button
          size={size}
          onClick={handleAddToCart}
          disabled={addToCart.isPending}
          className={className}
        >
          {addToCart.isPending ? (
            <>
              <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-transparent border-t-current" />
              Adding...
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4 mr-2" />
              Add to Cart
            </>
          )}
        </Button>
      </div>
    );
  }
  
  return (
    <Button
      size={size}
      onClick={handleAddToCart}
      disabled={addToCart.isPending}
      className={cn(
        isInCart ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90' : '',
        className
      )}
    >
      {addToCart.isPending ? (
        <>
          <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-transparent border-t-current" />
          Adding...
        </>
      ) : isInCart ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          In Cart ({cartItem?.quantity || 0})
        </>
      ) : (
        <>
          <ShoppingBag className="h-4 w-4 mr-2" />
          Add to Cart
        </>
      )}
    </Button>
  );
}

// Quick add floating button for product cards
export function QuickAddButton({
  product,
  className,
  onSuccess
}: {
  product: Product;
  className?: string;
  onSuccess?: () => void;
}) {
  const addToCart = useAddToCart();
  const defaultVariant = product.variants?.[0];
  const isInCart = useIsInCart(product.id, defaultVariant?.id || '');
  
  if (!defaultVariant || !product.inStock) {
    return null;
  }
  
  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart.mutate(
      {
        productId: product.id,
        variantId: defaultVariant.id,
        quantity: 1
      },
      {
        onSuccess: () => {
          onSuccess?.();
        }
      }
    );
  };
  
  return (
    <Button
      size="sm"
      variant={isInCart ? "secondary" : "default"}
      onClick={handleQuickAdd}
      disabled={addToCart.isPending}
      className={cn(
        'absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200',
        'shadow-lg backdrop-blur-sm',
        className
      )}
    >
      {addToCart.isPending ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-current" />
      ) : isInCart ? (
        <Check className="h-4 w-4" />
      ) : (
        <Plus className="h-4 w-4" />
      )}
    </Button>
  );
}
