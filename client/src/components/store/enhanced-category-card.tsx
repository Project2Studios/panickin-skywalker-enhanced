import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LazyImage } from '@/components/ui/lazy-image';
import {
  ArrowRight,
  Shirt,
  Music,
  Package,
  Gift,
  Crown,
  Zap,
  Star,
  TrendingUp,
  Users,
  Flame
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  productCount: number;
  displayOrder: number;
  isFeatured?: boolean;
  isNew?: boolean;
  theme?: 'default' | 'limited' | 'tour' | 'vintage' | 'new';
}

interface EnhancedCategoryCardProps {
  category: Category;
  variant?: 'default' | 'large' | 'compact' | 'hero';
  showStats?: boolean;
  showDescription?: boolean;
  className?: string;
  index?: number;
}

const categoryIcons = {
  't-shirts': Shirt,
  'hoodies': Package,
  'vinyl': Music,
  'accessories': Gift,
  'limited': Crown,
  'tour': Zap,
  'apparel': Shirt,
  'music': Music,
  'collectibles': Star,
  'default': Package,
};

const themeStyles = {
  default: {
    gradient: 'from-primary/20 to-store-accent/20',
    border: 'border-primary/30',
    glow: 'shadow-primary/20',
  },
  limited: {
    gradient: 'from-limited-edition/20 to-energy-orange/20',
    border: 'border-limited-edition/50',
    glow: 'shadow-limited-edition/30',
  },
  tour: {
    gradient: 'from-tour-exclusive/20 to-anxiety-purple/20',
    border: 'border-tour-exclusive/30',
    glow: 'shadow-tour-exclusive/20',
  },
  vintage: {
    gradient: 'from-superhero-blue/20 to-anxiety-purple/20',
    border: 'border-superhero-blue/30',
    glow: 'shadow-superhero-blue/20',
  },
  new: {
    gradient: 'from-primary/20 to-panic-red/20',
    border: 'border-panic-red/30',
    glow: 'shadow-panic-red/20',
  },
};

export function EnhancedCategoryCard({
  category,
  variant = 'default',
  showStats = true,
  showDescription = true,
  className,
  index = 0
}: EnhancedCategoryCardProps) {
  const IconComponent = categoryIcons[category.slug as keyof typeof categoryIcons] || categoryIcons.default;
  const theme = themeStyles[category.theme || 'default'];

  const getCategoryBadges = () => {
    const badges = [];
    
    if (category.isNew) {
      badges.push(
        <Badge key="new" className="superhero-badge text-xs">
          <Zap className="h-3 w-3 mr-1" />
          NEW
        </Badge>
      );
    }
    
    if (category.isFeatured) {
      badges.push(
        <Badge key="featured" className="limited-edition-badge text-xs">
          <Star className="h-3 w-3 mr-1" />
          FEATURED
        </Badge>
      );
    }
    
    return badges;
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'large':
        return 'aspect-[4/3] md:col-span-2';
      case 'compact':
        return 'aspect-square';
      case 'hero':
        return 'aspect-[16/9] md:col-span-3';
      default:
        return 'aspect-square';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className={cn(getVariantClasses(), className)}
    >
      <Link href={`/store/category/${category.slug}`}>
        <Card className={cn(
          "category-card-band h-full overflow-hidden border-2 hover:border-opacity-80 transition-all duration-300",
          theme.border,
          `hover:shadow-xl hover:${theme.glow}`
        )}>
          <CardContent className="p-0 relative h-full">
            {/* Background Image or Gradient */}
            <div className="relative h-full">
              {category.imageUrl ? (
                <>
                  <LazyImage
                    src={category.imageUrl}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    width={400}
                    height={400}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </>
              ) : (
                <div className={cn(
                  "w-full h-full bg-gradient-to-br flex items-center justify-center",
                  theme.gradient
                )}>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full mb-4 group-hover:scale-110 transition-transform">
                      <IconComponent className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Badges */}
              {getCategoryBadges().length > 0 && (
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {getCategoryBadges()}
                </div>
              )}
              
              {/* Product Count Badge */}
              {showStats && category.productCount > 0 && (
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="bg-black/40 backdrop-blur-sm text-white border-0">
                    {category.productCount} items
                  </Badge>
                </div>
              )}
              
              {/* Content Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="space-y-3">
                  {/* Category Name */}
                  <h3 className={cn(
                    "font-bold group-hover:text-primary transition-colors",
                    variant === 'hero' ? 'text-3xl' : 
                    variant === 'large' ? 'text-2xl' : 
                    'text-xl'
                  )}>
                    {category.name}
                  </h3>
                  
                  {/* Description */}
                  {showDescription && category.description && variant !== 'compact' && (
                    <p className={cn(
                      "text-gray-200 leading-relaxed",
                      variant === 'hero' ? 'text-lg' : 'text-sm'
                    )}>
                      {category.description}
                    </p>
                  )}
                  
                  {/* Shop Now Button */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-primary font-semibold text-sm group-hover:gap-2 transition-all">
                      <span>Shop Now</span>
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:ml-0 group-hover:translate-x-1 transition-all" />
                    </div>
                    
                    {/* Popularity Indicator */}
                    {showStats && category.productCount > 20 && (
                      <div className="flex items-center gap-1 text-xs text-gray-300">
                        <TrendingUp className="h-3 w-3" />
                        Popular
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Hover Effects */}
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-all duration-300" />
              
              {/* Special Effects for Different Themes */}
              {category.theme === 'limited' && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300">
                  <div className="w-full h-full bg-gradient-to-r from-limited-edition/20 to-energy-orange/20 animate-pulse" />
                </div>
              )}
              
              {category.theme === 'tour' && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-30 transition-opacity duration-300">
                  <Zap className="h-32 w-32 text-tour-exclusive animate-pulse" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}