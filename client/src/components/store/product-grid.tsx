import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ProductCard, ProductCardSkeleton } from './product-card';
import { Product } from '@/hooks/use-products';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { RefreshCw, ShoppingBag } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  error?: Error | null;
  className?: string;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  variant?: 'default' | 'compact' | 'featured';
  showQuickView?: boolean;
  showAddToCart?: boolean;
  showWishlist?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  skeletonCount?: number;
  onRetry?: () => void;
  onQuickView?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
}

export function ProductGrid({
  products,
  isLoading = false,
  error = null,
  className,
  columns = { xs: 1, sm: 2, md: 2, lg: 3, xl: 4 },
  variant = 'default',
  showQuickView = true,
  showAddToCart = true,
  showWishlist = true,
  emptyTitle = "No products found",
  emptyDescription = "Try adjusting your filters or search terms.",
  emptyAction,
  skeletonCount = 8,
  onRetry,
  onQuickView,
  onAddToCart,
  onToggleWishlist,
}: ProductGridProps) {
  
  // Generate responsive grid classes
  const gridClasses = useMemo(() => {
    const classes = ['grid', 'gap-4', 'md:gap-6'];
    
    if (columns.xs) classes.push(`grid-cols-${columns.xs}`);
    if (columns.sm) classes.push(`sm:grid-cols-${columns.sm}`);
    if (columns.md) classes.push(`md:grid-cols-${columns.md}`);
    if (columns.lg) classes.push(`lg:grid-cols-${columns.lg}`);
    if (columns.xl) classes.push(`xl:grid-cols-${columns.xl}`);
    
    return classes;
  }, [columns]);

  // Container variants for stagger animation
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  // Item variants for individual product cards
  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  // Error state
  if (error && !isLoading) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
          <ShoppingBag className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Failed to load products
        </h3>
        <p className="text-muted-foreground mb-4 max-w-md">
          {error.message || 'Something went wrong while loading the products. Please try again.'}
        </p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        )}
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <motion.div
        className={cn(gridClasses, className)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <ProductCardSkeleton key={index} variant={variant} />
        ))}
      </motion.div>
    );
  }

  // Empty state
  if (!products || products.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12', className)}>
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
          icon={<ShoppingBag className="h-12 w-12 text-muted-foreground" />}
        />
      </div>
    );
  }

  // Products grid
  return (
    <motion.div
      className={cn(gridClasses, className)}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <AnimatePresence mode="popLayout">
        {products.map((product) => (
          <motion.div
            key={product.id}
            variants={itemVariants}
            layout
            layoutId={product.id}
          >
            <ProductCard
              product={product}
              variant={variant}
              showQuickView={showQuickView}
              showAddToCart={showAddToCart}
              showWishlist={showWishlist}
              onQuickView={onQuickView}
              onAddToCart={onAddToCart}
              onToggleWishlist={onToggleWishlist}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

// Specialized grids for different use cases
export function FeaturedProductGrid({ 
  products, 
  isLoading, 
  className,
  ...props 
}: Omit<ProductGridProps, 'variant' | 'columns'>) {
  return (
    <ProductGrid
      products={products}
      isLoading={isLoading}
      className={className}
      variant="featured"
      columns={{ xs: 1, sm: 2, md: 2, lg: 3, xl: 3 }}
      skeletonCount={3}
      {...props}
    />
  );
}

export function CompactProductGrid({ 
  products, 
  isLoading, 
  className,
  ...props 
}: Omit<ProductGridProps, 'variant' | 'columns'>) {
  return (
    <ProductGrid
      products={products}
      isLoading={isLoading}
      className={className}
      variant="compact"
      columns={{ xs: 2, sm: 3, md: 4, lg: 5, xl: 6 }}
      skeletonCount={12}
      {...props}
    />
  );
}

export function CategoryProductGrid({ 
  products, 
  isLoading, 
  className,
  ...props 
}: Omit<ProductGridProps, 'columns'>) {
  return (
    <ProductGrid
      products={products}
      isLoading={isLoading}
      className={className}
      columns={{ xs: 1, sm: 2, md: 2, lg: 3, xl: 4 }}
      {...props}
    />
  );
}