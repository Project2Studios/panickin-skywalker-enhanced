import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/use-cart';
import {
  ShoppingBag,
  Heart,
  User,
  Search,
  Menu,
  X,
  Home,
  Shirt,
  Music,
  Package,
  Gift,
  Star,
  Crown,
  Zap,
  Lightning,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BandStoreNavProps {
  variant?: 'full' | 'compact' | 'sticky';
  showCategories?: boolean;
  className?: string;
}

const categories = [
  { name: 'All Products', slug: '', icon: Package, isActive: true },
  { name: 'Apparel', slug: 't-shirts', icon: Shirt, badge: 'Hot' },
  { name: 'Vinyl & Music', slug: 'vinyl', icon: Music, badge: 'New' },
  { name: 'Accessories', slug: 'accessories', icon: Gift },
  { name: 'Limited Edition', slug: 'limited', icon: Crown, badge: 'Limited', special: true },
  { name: 'Tour Merch', slug: 'tour', icon: Lightning, badge: 'Exclusive', special: true },
];

const quickLinks = [
  { name: 'New Arrivals', href: '/store?filter=new', icon: Zap, badge: '12' },
  { name: 'Best Sellers', href: '/store?filter=popular', icon: Star, badge: 'Hot' },
  { name: 'Sale Items', href: '/store?filter=sale', icon: Lightning, badge: '25%' },
  { name: 'Fan Favorites', href: '/store?filter=featured', icon: Users },
];

export function BandStoreNav({ 
  variant = 'full', 
  showCategories = true, 
  className 
}: BandStoreNavProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems } = useCart();

  const isActive = (path: string) => {
    if (path === '/store' && location === '/store') return true;
    if (path !== '/store' && location.startsWith(path)) return true;
    return false;
  };

  if (variant === 'compact') {
    return (
      <nav className={cn("bg-background/95 backdrop-blur-sm border-b border-border", className)}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <Link href="/store">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">PS</span>
                </div>
                <span className="font-bold text-lg">STORE</span>
              </div>
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="h-5 w-5" />
              </Button>
              
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingBag className="h-5 w-5" />
                  {totalItems > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {totalItems}
                    </Badge>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className={cn(
      "bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-40",
      variant === 'sticky' && "shadow-lg",
      className
    )}>
      <div className="container mx-auto px-4">
        {/* Main Navigation */}
        <div className="flex items-center justify-between h-16">
          {/* Brand & Home Link */}
          <div className="flex items-center gap-8">
            <Link href="/store">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-store-accent rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-white font-bold">PS</span>
                </div>
                <div>
                  <div className="font-bold text-xl text-gradient-animated">STORE</div>
                  <div className="text-xs text-muted-foreground">ANXIOUS SUPERHERO GEAR</div>
                </div>
              </div>
            </Link>
            
            {/* Back to Main Site */}
            <Link href="/">
              <Button variant="ghost" size="sm" className="store-nav-item">
                <Home className="mr-2 h-4 w-4" />
                Back to Band Site
              </Button>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder="Search for anxious superhero gear..."
                className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Quick Links - Desktop Only */}
            <div className="hidden lg:flex items-center gap-2">
              {quickLinks.slice(0, 2).map((link) => {
                const IconComponent = link.icon;
                return (
                  <Link key={link.name} href={link.href}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="store-nav-item flex items-center gap-2"
                    >
                      <IconComponent className="h-4 w-4" />
                      <span className="hidden xl:inline">{link.name}</span>
                      {link.badge && (
                        <Badge className={cn(
                          "text-xs",
                          link.badge === 'Hot' && "bg-panic-red",
                          link.badge === '25%' && "bg-calm-green text-black"
                        )}>
                          {link.badge}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                );
              })}
            </div>

            {/* Wishlist */}
            <Button variant="ghost" size="icon" className="relative group">
              <Heart className="h-5 w-5 group-hover:animate-wishlist-heart" />
            </Button>
            
            {/* Account */}
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
            
            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2"
                  >
                    <Badge className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs animate-limited-pulse">
                      {totalItems}
                    </Badge>
                  </motion.div>
                )}
              </Button>
            </Link>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Category Navigation - Desktop */}
        {showCategories && (
          <div className="hidden md:flex items-center justify-between border-t border-border py-4">
            <div className="flex items-center gap-2">
              {categories.map((category) => {
                const IconComponent = category.icon;
                const isActiveCat = isActive(`/store/category/${category.slug}`) || 
                                  (category.slug === '' && location === '/store');
                
                return (
                  <Link 
                    key={category.slug} 
                    href={category.slug ? `/store/category/${category.slug}` : '/store'}
                  >
                    <Button
                      variant={isActiveCat ? "default" : "ghost"}
                      size="sm"
                      className={cn(
                        "store-nav-item flex items-center gap-2",
                        isActiveCat && "active",
                        category.special && "hover:bg-gradient-to-r hover:from-primary/10 hover:to-store-accent/10"
                      )}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span>{category.name}</span>
                      {category.badge && (
                        <Badge className={cn(
                          "text-xs ml-1",
                          category.badge === 'Hot' && "bg-panic-red",
                          category.badge === 'New' && "bg-superhero-blue",
                          category.badge === 'Limited' && "limited-edition-badge",
                          category.badge === 'Exclusive' && "tour-exclusive-badge"
                        )}>
                          {category.badge}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                );
              })}
            </div>

            {/* Secondary Actions */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Lightning className="h-4 w-4 text-energy-orange" />
                Free shipping over $50
              </span>
              <span className="flex items-center gap-1">
                <Crown className="h-4 w-4 text-limited-edition" />
                Member exclusive deals
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="md:hidden border-t border-border bg-card"
        >
          <div className="container mx-auto px-4 py-6 space-y-6">
            {/* Mobile Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg"
              />
            </div>

            {/* Mobile Categories */}
            {showCategories && (
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-3">CATEGORIES</h3>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <Link 
                        key={category.slug} 
                        href={category.slug ? `/store/category/${category.slug}` : '/store'}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button
                          variant="ghost"
                          className="w-full justify-start p-3 h-auto"
                        >
                          <IconComponent className="mr-3 h-5 w-5" />
                          <div className="text-left">
                            <div className="font-medium">{category.name}</div>
                            {category.badge && (
                              <Badge className="text-xs mt-1">
                                {category.badge}
                              </Badge>
                            )}
                          </div>
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Mobile Quick Links */}
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-3">QUICK LINKS</h3>
              <div className="space-y-2">
                {quickLinks.map((link) => {
                  const IconComponent = link.icon;
                  return (
                    <Link 
                      key={link.name} 
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        variant="ghost"
                        className="w-full justify-start p-3"
                      >
                        <IconComponent className="mr-3 h-5 w-5" />
                        {link.name}
                        {link.badge && (
                          <Badge className="ml-auto text-xs">
                            {link.badge}
                          </Badge>
                        )}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
}