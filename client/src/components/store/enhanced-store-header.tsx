import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { LazyImage } from '@/components/ui/lazy-image';
import { 
  ShoppingBag, 
  Star, 
  Zap, 
  TrendingUp, 
  Heart, 
  Music,
  Shirt,
  Package,
  Gift,
  Users,
  Crown,
  Lightning
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedStoreHeaderProps {
  variant?: 'hero' | 'minimal';
  backgroundImage?: string;
  showFeaturedBadge?: boolean;
  showStats?: boolean;
  className?: string;
}

export function EnhancedStoreHeader({ 
  variant = 'hero',
  backgroundImage,
  showFeaturedBadge = true,
  showStats = true,
  className
}: EnhancedStoreHeaderProps) {
  const defaultBackground = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080";

  const stats = [
    { icon: Users, label: '10K+ Customers', value: '10,000+' },
    { icon: Star, label: 'Average Rating', value: '4.9' },
    { icon: Package, label: 'Products', value: '150+' },
    { icon: Lightning, label: 'Fast Shipping', value: '24h' }
  ];

  if (variant === 'minimal') {
    return (
      <section className={cn("relative py-16 bg-gradient-to-r from-primary/10 to-store-accent/10", className)}>
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 superhero-badge mb-6">
            <Crown className="h-4 w-4" />
            OFFICIAL MERCH STORE
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gradient-animated">
            Anxious Superhero Gear
          </h1>
          
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Represent the band with exclusive merch and limited edition collectibles
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={cn("relative py-24 lg:py-32 overflow-hidden", className)}>
      {/* Background */}
      <div className="absolute inset-0">
        <LazyImage
          src={backgroundImage || defaultBackground}
          alt="Store hero background"
          className="w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/80" />
        
        {/* Animated overlay pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-50" />
        
        {/* Floating elements for band atmosphere */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-anxiety-purple/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-40 right-20 w-20 h-20 bg-superhero-blue/10 rounded-full blur-2xl animate-pulse delay-2000" />
      </div>
      
      <div className="relative z-10 container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* Store Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <div className="inline-flex items-center gap-2 superhero-badge">
              <ShoppingBag className="h-4 w-4" />
              OFFICIAL MERCH STORE
              {showFeaturedBadge && (
                <>
                  <span className="text-white/60">•</span>
                  <span className="limited-edition-badge text-xs px-2 py-1">
                    LIMITED DROPS
                  </span>
                </>
              )}
            </div>
          </motion.div>
          
          {/* Main Title */}
          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-white"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            ANXIOUS SUPERHERO
            <br />
            <span className="text-gradient-animated">GEAR</span>
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p 
            className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Express your inner superhero with exclusive band merch, vinyl records, 
            and limited edition collectibles that speak to the anxious soul
          </motion.p>
          
          {/* Stats */}
          {showStats && (
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full mb-2">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-300">{stat.label}</div>
                  </div>
                );
              })}
            </motion.div>
          )}
          
          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Button size="lg" className="punk-button-enhanced bg-primary text-primary-foreground hover:bg-primary/90 group">
              <ShoppingBag className="mr-2 h-5 w-5 group-hover:animate-bounce" />
              Shop All Products
              <Zap className="ml-2 h-4 w-4 group-hover:animate-pulse" />
            </Button>
            
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black group">
              <Star className="mr-2 h-5 w-5 group-hover:animate-spin" />
              Featured Items
              <TrendingUp className="ml-2 h-4 w-4 group-hover:animate-pulse" />
            </Button>
            
            <Button size="lg" variant="ghost" className="text-white hover:bg-white/10 group">
              <Heart className="mr-2 h-5 w-5 group-hover:animate-wishlist-heart text-panic-red" />
              Wishlist
            </Button>
          </motion.div>
          
          {/* Quick Category Links */}
          <motion.div 
            className="flex flex-wrap justify-center gap-4 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            {[
              { icon: Shirt, label: 'Apparel', href: '/store/category/t-shirts' },
              { icon: Music, label: 'Vinyl', href: '/store/category/vinyl' },
              { icon: Package, label: 'Accessories', href: '/store/category/accessories' },
              { icon: Gift, label: 'Limited', href: '/store?featured=true' }
            ].map((category, index) => {
              const IconComponent = category.icon;
              return (
                <Link key={index} href={category.href}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 group"
                  >
                    <IconComponent className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                    {category.label}
                  </Button>
                </Link>
              );
            })}
          </motion.div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </motion.div>
    </section>
  );
}