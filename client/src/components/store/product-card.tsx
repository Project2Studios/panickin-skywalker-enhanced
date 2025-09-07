import React, { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LazyImage } from '@/components/ui/lazy-image';
import { PriceDisplay, PriceRangeDisplay } from './price-display';
import { Product } from '@/hooks/use-products';
import { useAddToCart, useIsInCart } from '@/hooks/use-cart';
import { Heart, ShoppingBag, Eye, Zap, Star, Clock, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  className?: string;
  showQuickView?: boolean;
  showAddToCart?: boolean;
  showWishlist?: boolean;
  variant?: 'default' | 'compact' | 'featured';
  onQuickView?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
}

export function ProductCard({
  product,
  className,
  showQuickView = true,
  showAddToCart = true,
  showWishlist = true,
  variant = 'default',
  onQuickView,
  onAddToCart,
  onToggleWishlist,
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Cart integration
  const addToCart = useAddToCart();
  
  // Check if product has variants and get default variant
  const defaultVariant = product.variants?.[0];
  const isInCart = useIsInCart(
    product.id, 
    defaultVariant?.id || ''
  );

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    onToggleWishlist?.(product);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!defaultVariant) {
      // If no variants, redirect to product page for selection
      window.location.href = `/store/${product.slug}`;
      return;
    }
    
    addToCart.mutate({
      productId: product.id,
      variantId: defaultVariant.id,
      quantity: 1
    });
    
    // Still call the optional callback
    onAddToCart?.(product);
  };

  // Calculate price range if product has variants
  const priceRange = product.variants?.length ? {
    min: Math.min(product.basePrice, ...product.variants.map(v => product.basePrice + v.priceAdjustment)),
    max: Math.max(product.basePrice, ...product.variants.map(v => product.basePrice + v.priceAdjustment)),
  } : null;

  const currentPrice = product.salePrice || product.basePrice;
  const hasDiscount = product.salePrice && product.salePrice < product.basePrice;

  const cardVariants = {
    default: 'aspect-[3/4] group hover:shadow-lg transition-all duration-300',
    compact: 'aspect-square group hover:shadow-md transition-all duration-200',
    featured: 'aspect-[4/5] group hover:shadow-xl transition-all duration-400',
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={className}
    >
      <Link href={`/store/${product.slug}`}>
        <Card className={cn(
          'overflow-hidden border-border bg-card cursor-pointer',
          cardVariants[variant],
          !product.inStock && 'opacity-75'
        )}>
          <CardContent className="p-0 h-full flex flex-col">
            {/* Image Container */}
            <div className="relative overflow-hidden flex-1">
              {/* Badges */}
              <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                {product.isNew && (
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    NEW
                  </span>
                )}
                {product.isFeatured && (
                  <span className="bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    FEATURED
                  </span>
                )}
                {hasDiscount && (
                  <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-full">
                    SALE
                  </span>
                )}
                {!product.inStock && (
                  <span className="bg-muted text-muted-foreground text-xs font-bold px-2 py-1 rounded-full">
                    SOLD OUT
                  </span>
                )}
                {product.inStock && product.totalStock <= 5 && (
                  <span className="bg-warning text-warning-foreground text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    LOW STOCK
                  </span>
                )}
              </div>

              {/* Wishlist Button */}
              {showWishlist && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "absolute top-3 right-3 z-10 bg-background/80 backdrop-blur-sm",
                    "opacity-0 group-hover:opacity-100 transition-opacity",
                    isWishlisted && "opacity-100 text-primary"
                  )}
                  onClick={handleWishlistToggle}
                >
                  <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
                </Button>
              )}

              {/* Product Image */}
              <div className="w-full h-full relative">
                {product.primaryImage ? (
                  <LazyImage
                    src={product.primaryImage.imageUrl}
                    alt={product.primaryImage.altText || product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    width={400}
                    height={400}
                    onLoad={() => setImageLoaded(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground text-4xl font-bold">
                      PS
                    </span>
                  </div>
                )}
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              </div>

              {/* Quick Actions Overlay */}
              <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                {showQuickView && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1 backdrop-blur-sm bg-background/90"
                    onClick={handleQuickView}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Quick View
                  </Button>
                )}
                {showAddToCart && product.inStock && (
                  <Button
                    variant={isInCart ? "secondary" : "default"}
                    size="sm"
                    className={cn(
                      "flex-1",
                      !showQuickView && "w-full",
                      isInCart ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"
                    )}
                    onClick={handleAddToCart}
                    disabled={addToCart.isPending}
                  >
                    {addToCart.isPending ? (
                      <>
                        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-transparent border-t-current" />
                        Adding...
                      </>
                    ) : isInCart ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        In Cart
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="p-4 space-y-2">
              {/* Category */}
              <div className="text-xs text-primary font-semibold tracking-wider uppercase">
                {product.category.name}
              </div>

              {/* Product Name */}
              <h3 className="font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                {product.name}
              </h3>

              {/* Price */}
              <div className="flex items-center justify-between">
                {priceRange ? (
                  <PriceRangeDisplay
                    minPrice={priceRange.min}
                    maxPrice={priceRange.max}
                    size={variant === 'compact' ? 'sm' : 'md'}
                  />
                ) : (
                  <PriceDisplay
                    basePrice={product.basePrice}
                    salePrice={product.salePrice}
                    size={variant === 'compact' ? 'sm' : 'md'}
                  />
                )}

                {/* Variant count */}
                {product.variants && product.variants.length > 1 && (
                  <span className="text-xs text-muted-foreground">
                    {product.variants.length} variants
                  </span>
                )}
              </div>

              {/* Stock Status */}
              {product.inStock && product.totalStock <= 10 && (
                <div className="text-xs text-warning">
                  Only {product.totalStock} left in stock
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

// Skeleton loader for product cards
export function ProductCardSkeleton({ variant = 'default' }: { variant?: 'default' | 'compact' | 'featured' }) {
  const aspectClasses = {
    default: 'aspect-[3/4]',
    compact: 'aspect-square',
    featured: 'aspect-[4/5]',
  };

  return (
    <Card className={cn('overflow-hidden border-border bg-card animate-pulse', aspectClasses[variant])}>
      <CardContent className="p-0 h-full flex flex-col">
        <div className="relative flex-1 bg-muted" />
        <div className="p-4 space-y-2">
          <div className="h-3 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-2/3" />
          <div className="h-5 bg-muted rounded w-1/2" />
        </div>
      </CardContent>
    </Card>
  );
}