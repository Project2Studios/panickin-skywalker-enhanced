import React from 'react';
import { cn } from '@/lib/utils';

interface PriceDisplayProps {
  basePrice: number;
  salePrice?: number;
  priceAdjustment?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showCurrency?: boolean;
}

export function PriceDisplay({
  basePrice,
  salePrice,
  priceAdjustment = 0,
  className,
  size = 'md',
  showCurrency = true,
}: PriceDisplayProps) {
  // Calculate final prices
  const finalBasePrice = basePrice + priceAdjustment;
  const finalSalePrice = salePrice ? salePrice + priceAdjustment : undefined;
  const currentPrice = finalSalePrice || finalBasePrice;
  const hasDiscount = finalSalePrice && finalSalePrice < finalBasePrice;

  // Format price
  const formatPrice = (price: number) => {
    if (!showCurrency) {
      return price.toFixed(2);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Calculate discount percentage
  const discountPercent = hasDiscount 
    ? Math.round(((finalBasePrice - finalSalePrice!) / finalBasePrice) * 100)
    : 0;

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const originalPriceSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Current Price */}
      <span 
        className={cn(
          'font-bold text-foreground',
          sizeClasses[size],
          hasDiscount && 'text-primary'
        )}
      >
        {formatPrice(currentPrice)}
      </span>

      {/* Original Price (struck through if on sale) */}
      {hasDiscount && (
        <span 
          className={cn(
            'line-through text-muted-foreground',
            originalPriceSizeClasses[size]
          )}
        >
          {formatPrice(finalBasePrice)}
        </span>
      )}

      {/* Discount Badge */}
      {hasDiscount && discountPercent > 0 && (
        <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-full">
          -{discountPercent}%
        </span>
      )}

      {/* New/Limited Badge */}
      {priceAdjustment > 0 && (
        <span className="bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded-full">
          PREMIUM
        </span>
      )}
    </div>
  );
}

// Variant for displaying price ranges
interface PriceRangeDisplayProps {
  minPrice: number;
  maxPrice: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PriceRangeDisplay({
  minPrice,
  maxPrice,
  className,
  size = 'md',
}: PriceRangeDisplayProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  if (minPrice === maxPrice) {
    return (
      <span className={cn('font-bold text-foreground', sizeClasses[size], className)}>
        {formatPrice(minPrice)}
      </span>
    );
  }

  return (
    <span className={cn('font-bold text-foreground', sizeClasses[size], className)}>
      {formatPrice(minPrice)} - {formatPrice(maxPrice)}
    </span>
  );
}