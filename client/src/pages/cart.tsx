import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { LazyImage } from '@/components/ui/lazy-image';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProductGrid } from '@/components/store/product-grid';
import { 
  useCart, 
  useUpdateCartItem, 
  useRemoveFromCart, 
  useClearCart, 
  useFormatPrice 
} from '@/hooks/use-cart';
import { useFeaturedProducts } from '@/hooks/use-products';
import { cn } from '@/lib/utils';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  ArrowLeft,
  Package,
  Heart,
  Share2,
  AlertTriangle,
  Truck,
  Shield,
  RotateCcw,
  Tag
} from 'lucide-react';

export default function CartPage() {
  const [, setLocation] = useLocation();
  const [promoCode, setPromoCode] = useState('');
  const [showRecommendations, setShowRecommendations] = useState(true);
  
  const { cart, isLoading } = useCart();
  const updateCartItem = useUpdateCartItem();
  const removeFromCart = useRemoveFromCart();
  const clearCart = useClearCart();
  const formatPrice = useFormatPrice();
  
  // Featured products for recommendations
  const { data: featuredProducts } = useFeaturedProducts(4);
  
  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart.mutate(itemId);
    } else {
      updateCartItem.mutate({ itemId, quantity: newQuantity });
    }
  };
  
  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to remove all items from your cart?')) {
      clearCart.mutate();
    }
  };
  
  const handlePromoCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement promo code functionality
    console.log('Apply promo code:', promoCode);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="h-8 bg-muted animate-pulse rounded w-48 mb-4" />
            <div className="h-4 bg-muted animate-pulse rounded w-96" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-muted rounded" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-muted rounded w-3/4" />
                        <div className="h-4 bg-muted rounded w-1/2" />
                        <div className="h-4 bg-muted rounded w-1/4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="lg:col-span-1">
              <Card className="animate-pulse">
                <CardContent className="p-6 space-y-4">
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded" />
                  </div>
                  <div className="h-10 bg-muted rounded" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Header */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <ShoppingBag className="h-8 w-8" />
                Shopping Cart
              </h1>
              <p className="text-muted-foreground">
                {cart.summary.itemCount === 0 ? (
                  "Your cart is currently empty"
                ) : (
                  `${cart.summary.itemCount} ${cart.summary.itemCount === 1 ? 'item' : 'items'} in your cart`
                )}
              </p>
            </div>
            
            <Button
              variant="ghost"
              onClick={() => setLocation('/store')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {cart.items.length === 0 ? (
            /* Empty Cart State */
            <div className="text-center py-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md mx-auto"
              >
                <Package className="h-24 w-24 mx-auto text-muted-foreground/50 mb-6" />
                <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
                <p className="text-muted-foreground mb-8">
                  Looks like you haven't added any anxious superhero merch yet. 
                  Let's fix that anxiety with some retail therapy!
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg">
                    <Link href="/store">
                      <ShoppingBag className="mr-2 h-5 w-5" />
                      Browse Store
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" size="lg">
                    <Link href="/store?featured=true">
                      <Tag className="mr-2 h-5 w-5" />
                      Shop Featured
                    </Link>
                  </Button>
                </div>

                {/* Featured products for empty cart */}
                {featuredProducts && featuredProducts.length > 0 && (
                  <div className="mt-16">
                    <h3 className="text-xl font-semibold mb-6">You might like these</h3>
                    <ProductGrid
                      products={featuredProducts}
                      columns={{ xs: 1, sm: 2, md: 2, lg: 4 }}
                      variant="compact"
                    />
                  </div>
                )}
              </motion.div>
            </div>
          ) : (
            /* Cart with Items */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Cart Items</h2>
                  
                  {cart.items.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearCart}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Cart
                    </Button>
                  )}
                </div>
                
                <div className="space-y-4">
                  <AnimatePresence>
                    {cart.items.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        layout
                      >
                        <Card>
                          <CardContent className="p-6">
                            <div className="flex gap-4">
                              {/* Product Image */}
                              <Link href={`/store/${item.product.slug}`} className="flex-shrink-0">
                                {item.primaryImage ? (
                                  <LazyImage
                                    src={item.primaryImage.imageUrl}
                                    alt={item.primaryImage.altText || item.product.name}
                                    width={120}
                                    height={120}
                                    className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded border"
                                  />
                                ) : (
                                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-muted rounded border flex items-center justify-center">
                                    <span className="text-lg font-bold text-muted-foreground">PS</span>
                                  </div>
                                )}
                              </Link>

                              {/* Product Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex-1">
                                    <Link 
                                      href={`/store/${item.product.slug}`}
                                      className="font-semibold text-lg hover:text-primary transition-colors line-clamp-2"
                                    >
                                      {item.product.name}
                                    </Link>
                                    
                                    {/* Variant Info */}
                                    {Object.keys(item.variant.attributes).length > 0 && (
                                      <div className="text-sm text-muted-foreground mt-1">
                                        {Object.entries(item.variant.attributes)
                                          .map(([key, value]) => `${key}: ${value}`)
                                          .join(', ')}
                                      </div>
                                    )}
                                    
                                    <div className="text-sm text-muted-foreground mt-1">
                                      SKU: {item.variant.sku}
                                    </div>
                                  </div>
                                  
                                  {/* Actions */}
                                  <div className="flex gap-2 ml-4">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-muted-foreground hover:text-primary"
                                    >
                                      <Heart className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-muted-foreground hover:text-primary"
                                    >
                                      <Share2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Stock Status */}
                                {!item.inStock && (
                                  <Alert className="mb-4">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>
                                      This item is currently out of stock. Remove it or save it for later.
                                    </AlertDescription>
                                  </Alert>
                                )}

                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                  {/* Price */}
                                  <div className="flex flex-col">
                                    <div className="text-xl font-bold">
                                      {formatPrice(item.total)}
                                    </div>
                                    {item.quantity > 1 && (
                                      <div className="text-sm text-muted-foreground">
                                        {formatPrice(item.price)} each
                                      </div>
                                    )}
                                  </div>

                                  {/* Quantity Controls */}
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center border border-border rounded-lg">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                        disabled={updateCartItem.isPending || removeFromCart.isPending}
                                        className="px-3 py-2 h-10"
                                      >
                                        <Minus className="h-4 w-4" />
                                      </Button>
                                      
                                      <Input
                                        type="number"
                                        min="1"
                                        max={item.maxQuantity}
                                        value={item.quantity}
                                        onChange={(e) => {
                                          const newQuantity = parseInt(e.target.value) || 1;
                                          handleQuantityChange(item.id, Math.min(newQuantity, item.maxQuantity));
                                        }}
                                        className="w-16 text-center border-0 focus-visible:ring-0"
                                        disabled={updateCartItem.isPending || removeFromCart.isPending}
                                      />
                                      
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                        disabled={
                                          updateCartItem.isPending || 
                                          removeFromCart.isPending ||
                                          item.quantity >= item.maxQuantity
                                        }
                                        className="px-3 py-2 h-10"
                                      >
                                        <Plus className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    
                                    <div className="text-sm text-muted-foreground">
                                      {item.availableStock} available
                                    </div>
                                    
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeFromCart.mutate(item.id)}
                                      disabled={removeFromCart.isPending}
                                      className="text-destructive hover:text-destructive p-2"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Summary Details */}
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Subtotal ({cart.summary.itemCount} items):</span>
                        <span>{formatPrice(cart.summary.subtotal)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span>
                          {cart.summary.shipping > 0 ? (
                            formatPrice(cart.summary.shipping)
                          ) : (
                            <Badge variant="secondary">FREE</Badge>
                          )}
                        </span>
                      </div>
                      
                      {cart.summary.tax > 0 && (
                        <div className="flex justify-between">
                          <span>Tax:</span>
                          <span>{formatPrice(cart.summary.tax)}</span>
                        </div>
                      )}
                      
                      <Separator />
                      
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span>{formatPrice(cart.summary.total)}</span>
                      </div>
                    </div>

                    {/* Promo Code */}
                    <div className="space-y-2">
                      <form onSubmit={handlePromoCodeSubmit} className="flex gap-2">
                        <Input
                          placeholder="Promo code"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          className="flex-1"
                        />
                        <Button type="submit" variant="outline" size="sm">
                          Apply
                        </Button>
                      </form>
                    </div>

                    {/* Free Shipping Indicator */}
                    {cart.summary.subtotal < 50 && (
                      <Alert>
                        <Truck className="h-4 w-4" />
                        <AlertDescription>
                          Add {formatPrice(50 - cart.summary.subtotal)} more for free shipping!
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Checkout Button */}
                    <Button asChild size="lg" className="w-full">
                      <Link href="/checkout">
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Proceed to Checkout
                      </Link>
                    </Button>

                    {/* Security Features */}
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span>Secure checkout</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <RotateCcw className="h-4 w-4" />
                        <span>30-day return policy</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        <span>Free shipping over $50</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {cart.items.length > 0 && showRecommendations && featuredProducts && featuredProducts.length > 0 && (
            <div className="mt-16">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Complete Your Look</h2>
                  <p className="text-muted-foreground">
                    Other anxious superheroes also bought these items
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRecommendations(false)}
                  className="text-muted-foreground"
                >
                  Hide
                </Button>
              </div>
              
              <ProductGrid
                products={featuredProducts.filter(product => 
                  !cart.items.some(item => item.product.id === product.id)
                )}
                columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}
                variant="compact"
                emptyTitle=""
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
