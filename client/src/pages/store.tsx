import React, { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LazyImage } from '@/components/ui/lazy-image';
import { ProductGrid } from '@/components/store/product-grid';
import { ProductFilters } from '@/components/store/product-filters';
import { PriceDisplay } from '@/components/store/price-display';
import { useProducts, useFeaturedProducts, useCategories, ProductFilters as IProductFilters } from '@/hooks/use-products';
import { StorePageMeta } from '@/components/seo/store-meta';
import { cn } from '@/lib/utils';
import { 
  ShoppingBag, 
  Star, 
  Zap, 
  TrendingUp, 
  Heart, 
  ArrowRight,
  Shirt,
  Music,
  Package,
  Gift,
  Crown,
  Users,
  Lightning
} from 'lucide-react';

export default function StorePage() {
  const [filters, setFilters] = useState<IProductFilters>({
    limit: 12,
    sort: 'newest',
  });

  // Fetch data
  const { data: productsData, isLoading: productsLoading, error: productsError } = useProducts(filters);
  const { data: featuredProducts, isLoading: featuredLoading } = useFeaturedProducts(6);
  const { data: categories, isLoading: categoriesLoading } = useCategories(true);

  // Handle filter changes
  const handleFiltersChange = (newFilters: IProductFilters) => {
    setFilters({ ...newFilters, limit: 12 });
  };

  // Category data with icons
  const categoryIcons = {
    't-shirts': Shirt,
    'hoodies': Package,
    'vinyl': Music,
    'accessories': Gift,
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
      <StorePageMeta />
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <LazyImage
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080"
            alt="Store hero background"
            className="w-full h-full object-cover"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/80" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="superhero-badge mb-6">
              <ShoppingBag className="h-4 w-4" />
              OFFICIAL MERCH STORE
              <span className="text-white/60">•</span>
              <span className="limited-edition-badge text-xs px-2 py-1">
                LIMITED DROPS
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-white">
              ANXIOUS SUPERHERO
              <br />
              <span className="text-gradient-animated">GEAR</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Express your inner superhero with exclusive band merch, vinyl records, 
              and limited edition collectibles that speak to the anxious soul
            </p>
            
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 max-w-3xl mx-auto">
              {[
                { icon: Users, label: '10K+ Customers', value: '10,000+' },
                { icon: Star, label: 'Average Rating', value: '4.9' },
                { icon: Package, label: 'Products', value: '150+' },
                { icon: Lightning, label: 'Fast Shipping', value: '24h' }
              ].map((stat, index) => {
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
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
                <Heart className="mr-2 h-5 w-5 group-hover:animate-wishlist-heart text-primary" />
                Wishlist
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Products Section */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="py-16 lg:py-20 bg-secondary/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold tracking-widest mb-4">
                  <Star className="h-4 w-4" />
                  FEATURED ITEMS
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gradient">
                  Fan Favorites
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  The most popular items chosen by our community of anxious superheroes
                </p>
              </motion.div>
            </div>

            <ProductGrid
              products={featuredProducts}
              isLoading={featuredLoading}
              variant="featured"
              columns={{ xs: 1, sm: 2, md: 2, lg: 3, xl: 3 }}
              className="max-w-6xl mx-auto"
              emptyTitle="No featured products available"
              emptyDescription="Check back soon for new featured items!"
            />
          </div>
        </section>
      )}

      {/* Categories Grid */}
      {categories && categories.length > 0 && (
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Shop by Category
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Find exactly what you're looking for in our organized collections
                </p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {categories
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((category, index) => {
                  const IconComponent = categoryIcons[category.slug as keyof typeof categoryIcons] || Package;
                  
                  return (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <Link href={`/store/category/${category.slug}`}>
                        <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-primary overflow-hidden">
                          <CardContent className="p-0">
                            {/* Category Image */}
                            <div className="aspect-square relative overflow-hidden">
                              {category.imageUrl ? (
                                <LazyImage
                                  src={category.imageUrl}
                                  alt={category.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  width={400}
                                  height={400}
                                />
                              ) : (
                                <div className="w-full h-full bg-muted flex items-center justify-center group-hover:bg-muted/80 transition-colors">
                                  <IconComponent className="h-16 w-16 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                              
                              {/* Product Count Badge */}
                              {category.productCount && category.productCount > 0 && (
                                <Badge className="absolute top-3 right-3">
                                  {category.productCount} items
                                </Badge>
                              )}
                            </div>
                            
                            {/* Category Info */}
                            <div className="p-6">
                              <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                                {category.name}
                              </h3>
                              {category.description && (
                                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                                  {category.description}
                                </p>
                              )}
                              <div className="flex items-center text-primary font-semibold text-sm group-hover:gap-2 transition-all">
                                Shop Now 
                                <ArrowRight className="h-4 w-4 ml-1 group-hover:ml-0 group-hover:translate-x-1 transition-all" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  );
                })}
            </div>
          </div>
        </section>
      )}

      {/* All Products Section */}
      <section className="py-16 lg:py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters - Desktop */}
            <aside className="lg:w-80 flex-shrink-0">
              <ProductFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                showMobileSheet={false}
                className="sticky top-8"
              />
            </aside>

            {/* Products Grid */}
            <main className="flex-1">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">All Products</h2>
                    <p className="text-muted-foreground">
                      {productsData?.pagination.total && (
                        `Showing ${productsData.products.length} of ${productsData.pagination.total} products`
                      )}
                    </p>
                  </div>
                  
                  {/* Mobile Filters */}
                  <div className="lg:hidden">
                    <ProductFilters
                      filters={filters}
                      onFiltersChange={handleFiltersChange}
                      showSearch={false}
                      showMobileSheet={true}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Mobile Search Bar */}
                <div className="lg:hidden mb-6">
                  <ProductFilters
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    showMobileSheet={false}
                    className="space-y-0"
                  />
                </div>
              </div>

              <ProductGrid
                products={productsData?.products || []}
                isLoading={productsLoading}
                error={productsError}
                emptyTitle="No products found"
                emptyDescription="Try adjusting your filters or search terms to find what you're looking for."
                emptyAction={
                  <Button 
                    onClick={() => setFilters({ limit: 12, sort: 'newest' })}
                    variant="outline"
                  >
                    Clear Filters
                  </Button>
                }
              />

              {/* Load More Button */}
              {productsData?.pagination.hasMore && (
                <div className="text-center mt-12">
                  <Button 
                    size="lg"
                    variant="outline"
                    onClick={() => {
                      setFilters({
                        ...filters,
                        limit: (filters.limit || 12) + 12
                      });
                    }}
                    disabled={productsLoading}
                  >
                    {productsLoading ? 'Loading...' : 'Load More Products'}
                  </Button>
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Be the first to know about new releases, exclusive merch drops, and special fan discounts
            </p>
            <Button size="lg" asChild>
              <Link href="/#contact">
                <Heart className="mr-2 h-5 w-5" />
                Join the Squad
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}