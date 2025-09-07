import React, { useState } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LazyImage } from '@/components/ui/lazy-image';
import { PriceDisplay } from '@/components/store/price-display';
import {
  Heart,
  ShoppingCart,
  Star,
  Zap,
  Crown,
  Music,
  Flame,
  Eye,
  Share2,
  Clock,
  Users,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks/use-cart';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  imageUrl: string;
  images?: string[];
  category?: {
    name: string;
    slug: string;
  };
  tags?: string[];
  isNew?: boolean;
  isFeatured?: boolean;
  isLimitedEdition?: boolean;
  isTourExclusive?: boolean;
  stockLevel?: 'in-stock' | 'low-stock' | 'out-of-stock';
  popularity?: number;
  rating?: number;
  reviewCount?: number;
}

interface EnhancedProductCardProps {
  product: Product;
  variant?: 'default' | 'featured' | 'compact' | 'hero';
  showQuickAdd?: boolean;
  showWishlist?: boolean;
  showShare?: boolean;
  showPreview?: boolean;
  className?: string;
  onQuickView?: (product: Product) => void;
  onAddToWishlist?: (productId: number) => void;
}

export function EnhancedProductCard({
  product,
  variant = 'default',
  showQuickAdd = true,
  showWishlist = true,
  showShare = false,
  showPreview = false,
  className,
  onQuickView,
  onAddToWishlist
}: EnhancedProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart } = useCart();

  const handleAddToCart = async () => {
    await addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: 1
    });
  };

  const getProductBadges = () => {
    const badges = [];
    
    if (product.isNew) {
      badges.push(
        <Badge key="new" className="superhero-badge text-xs">
          <Zap className="h-3 w-3 mr-1" />
          NEW
        </Badge>
      );
    }
    
    if (product.isLimitedEdition) {
      badges.push(
        <Badge key="limited" className="limited-edition-badge text-xs">
          <Crown className="h-3 w-3 mr-1" />
          LIMITED
        </Badge>
      );
    }
    
    if (product.isTourExclusive) {
      badges.push(
        <Badge key="tour" className="tour-exclusive-badge text-xs">
          <Music className="h-3 w-3 mr-1" />
          TOUR
        </Badge>
      );
    }
    
    if (product.stockLevel === 'low-stock') {
      badges.push(
        <Badge key="low-stock" className="anxiety-badge text-xs">
          <Flame className="h-3 w-3 mr-1" />
          LOW STOCK
        </Badge>
      );
    }
    
    return badges;
  };

  const getStockIndicator = () => {
    switch (product.stockLevel) {
      case 'out-of-stock':
        return <Badge variant="destructive" className="text-xs">Out of Stock</Badge>;
      case 'low-stock':
        return <Badge variant="outline" className="text-xs border-energy-orange text-energy-orange">Only few left!</Badge>;
      default:
        return null;
    }
  };

  const cardClasses = cn(
    "product-card-enhanced group relative h-full",
    {
      'hover:-translate-y-2': variant !== 'compact',
      'hover:scale-[1.02]': variant === 'compact',
    },
    className
  );

  const imageClasses = cn(
    "product-image-enhanced",
    {
      'group-hover:scale-110': variant !== 'hero',
      'group-hover:scale-105': variant === 'hero',
    }
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: variant === 'compact' ? 1.02 : 1.0 }}
      className={cardClasses}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="h-full overflow-hidden border-0 shadow-lg">
        <CardContent className="p-0 relative">
          {/* Product Image Container */}
          <div className="product-image-container">
            <Link href={`/store/${product.slug}`}>
              <LazyImage
                src={product.images && product.images[currentImageIndex] 
                  ? product.images[currentImageIndex] 
                  : product.imageUrl}
                alt={product.name}
                className={imageClasses}
                width={400}
                height={400}
                onLoad={() => setImageLoaded(true)}
              />
            </Link>
            
            {/* Loading shimmer effect */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-muted animate-pulse" />
            )}
            
            {/* Hover overlay */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center"
                >
                  <div className="flex gap-2">
                    {showPreview && onQuickView && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onQuickView(product)}
                        className="bg-white/90 text-black hover:bg-white"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {showQuickAdd && product.stockLevel !== 'out-of-stock' && (
                      <Button
                        size="sm"
                        onClick={handleAddToCart}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {showShare && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-white/90 text-black hover:bg-white"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Product Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {getProductBadges()}
            </div>
            
            {/* Wishlist Button */}
            {showWishlist && (
              <div className="absolute top-3 right-3">
                <Button
                  size="sm"
                  variant="ghost"
                  className="bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 rounded-full w-10 h-10 p-0"
                  onClick={() => onAddToWishlist?.(product.id)}
                >
                  <Heart className="h-4 w-4 hover:animate-wishlist-heart" />
                </Button>
              </div>
            )}
            
            {/* Image Navigation for Multiple Images */}
            {product.images && product.images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2">
                <div className="flex gap-1">
                  {product.images.map((_, index) => (
                    <button
                      key={index}
                      className={cn(
                        "w-2 h-2 rounded-full transition-colors",
                        index === currentImageIndex ? "bg-white" : "bg-white/50"
                      )}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div className="p-4 space-y-3">
            {/* Category & Popularity */}
            <div className="flex items-center justify-between">
              {product.category && (
                <Badge variant="outline" className="text-xs">
                  {product.category.name}
                </Badge>
              )}
              
              {product.popularity && product.popularity > 80 && (
                <div className="flex items-center gap-1 text-xs text-primary">
                  <TrendingUp className="h-3 w-3" />
                  Popular
                </div>
              )}
            </div>
            
            {/* Product Name */}
            <Link href={`/store/${product.slug}`}>
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
                {product.name}
              </h3>
            </Link>
            
            {/* Rating & Reviews */}
            {product.rating && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-3 w-3",
                        i < Math.floor(product.rating || 0) 
                          ? "text-energy-orange fill-current" 
                          : "text-muted-foreground"
                      )}
                    />
                  ))}
                </div>
                {product.reviewCount && (
                  <span className="text-xs text-muted-foreground">
                    ({product.reviewCount})
                  </span>
                )}
              </div>
            )}
            
            {/* Price */}
            <div className="flex items-center justify-between">
              <PriceDisplay 
                price={product.price} 
                comparePrice={product.comparePrice}
                className="font-bold"
              />
              
              {/* Stock Indicator */}
              {getStockIndicator()}
            </div>
            
            {/* Quick Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                className="flex-1"
                size="sm"
                onClick={handleAddToCart}
                disabled={product.stockLevel === 'out-of-stock'}
              >
                {product.stockLevel === 'out-of-stock' ? (
                  <>
                    <Clock className="mr-2 h-4 w-4" />
                    Notify Me
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}