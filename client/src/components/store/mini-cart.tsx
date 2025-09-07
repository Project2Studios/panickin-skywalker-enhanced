import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LazyImage } from '@/components/ui/lazy-image';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useCart, useUpdateCartItem, useRemoveFromCart, useFormatPrice } from '@/hooks/use-cart';
import { CartIcon } from './cart-icon';
import { cn } from '@/lib/utils';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  ArrowRight,
  Package
} from 'lucide-react';

interface MiniCartProps {
  variant?: 'dropdown' | 'sheet';
  trigger?: React.ReactNode;
  className?: string;
}

export function MiniCart({ variant = 'sheet', trigger, className }: MiniCartProps) {
  const { cart, isLoading } = useCart();
  const updateCartItem = useUpdateCartItem();
  const removeFromCart = useRemoveFromCart();
  const formatPrice = useFormatPrice();
  
  const defaultTrigger = (
    <CartIcon variant="header" />
  );
  
  const content = (
    <div className={cn('w-full max-w-md', className)}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart
          </h3>
          <span className="text-sm text-muted-foreground">
            {cart.summary.itemCount} {cart.summary.itemCount === 1 ? 'item' : 'items'}
          </span>
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-16 h-16 bg-muted rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : cart.items.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-2">Your cart is empty</p>
            <p className="text-sm text-muted-foreground mb-6">
              Add some anxious superhero merch to get started!
            </p>
            <Button asChild size="sm">
              <Link href="/store">
                Browse Store
              </Link>
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="p-4 space-y-4">
              <AnimatePresence>
                {cart.items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex gap-3 p-3 bg-muted/30 rounded-lg"
                  >
                    {/* Product Image */}
                    <Link href={`/store/${item.product.slug}`} className="flex-shrink-0">
                      {item.primaryImage ? (
                        <LazyImage
                          src={item.primaryImage.imageUrl}
                          alt={item.primaryImage.altText || item.product.name}
                          width={64}
                          height={64}
                          className="w-16 h-16 object-cover rounded border"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-muted rounded border flex items-center justify-center">
                          <span className="text-xs font-bold text-muted-foreground">PS</span>
                        </div>
                      )}
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <Link 
                        href={`/store/${item.product.slug}`}
                        className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors"
                      >
                        {item.product.name}
                      </Link>
                      
                      {/* Variant Info */}
                      {Object.keys(item.variant.attributes).length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {Object.entries(item.variant.attributes)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(', ')}
                        </div>
                      )}

                      {/* Price and Quantity Controls */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-sm font-medium">
                          {formatPrice(item.total)}
                          {item.quantity > 1 && (
                            <span className="text-xs text-muted-foreground ml-1">
                              ({formatPrice(item.price)} each)
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => {
                              if (item.quantity > 1) {
                                updateCartItem.mutate({
                                  itemId: item.id,
                                  quantity: item.quantity - 1
                                });
                              } else {
                                removeFromCart.mutate(item.id);
                              }
                            }}
                            disabled={updateCartItem.isPending || removeFromCart.isPending}
                          >
                            {item.quantity > 1 ? (
                              <Minus className="h-3 w-3" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </Button>
                          
                          <span className="text-xs w-6 text-center">
                            {item.quantity}
                          </span>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => {
                              updateCartItem.mutate({
                                itemId: item.id,
                                quantity: item.quantity + 1
                              });
                            }}
                            disabled={
                              updateCartItem.isPending ||
                              removeFromCart.isPending ||
                              item.quantity >= item.maxQuantity
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Stock Warning */}
                      {!item.inStock && (
                        <div className="text-xs text-destructive mt-1">
                          Out of stock
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Footer */}
      {cart.items.length > 0 && (
        <div className="p-4 border-t border-border space-y-4">
          {/* Cart Summary */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>{formatPrice(cart.summary.subtotal)}</span>
            </div>
            {cart.summary.shipping > 0 && (
              <div className="flex justify-between text-sm">
                <span>Shipping:</span>
                <span>{formatPrice(cart.summary.shipping)}</span>
              </div>
            )}
            {cart.summary.tax > 0 && (
              <div className="flex justify-between text-sm">
                <span>Tax:</span>
                <span>{formatPrice(cart.summary.tax)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total:</span>
              <span>{formatPrice(cart.summary.total)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link href="/checkout">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Checkout
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/cart">
                View Cart
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Free shipping indicator */}
          {cart.summary.subtotal > 0 && cart.summary.subtotal < 50 && (
            <div className="text-xs text-center text-muted-foreground p-2 bg-muted/30 rounded">
              Add {formatPrice(50 - cart.summary.subtotal)} more for free shipping!
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (variant === 'sheet') {
    return (
      <Sheet>
        <SheetTrigger asChild>
          {trigger || defaultTrigger}
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:w-[400px] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Shopping Cart</SheetTitle>
          </SheetHeader>
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  // For dropdown variant (could be implemented with Popover)
  return (
    <div className="relative">
      {trigger || defaultTrigger}
      {/* Dropdown implementation would go here */}
    </div>
  );
}

// Quick add animation component
export function QuickAddAnimation({ 
  isVisible, 
  productName 
}: { 
  isVisible: boolean;
  productName: string;
}) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          className="fixed bottom-4 right-4 bg-primary text-primary-foreground p-4 rounded-lg shadow-lg z-50 max-w-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Added to cart!</p>
              <p className="text-xs opacity-90 truncate">{productName}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
