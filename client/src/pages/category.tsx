import React, { useState, useMemo } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { LazyImage } from '@/components/ui/lazy-image';
import { ProductGrid } from '@/components/store/product-grid';
import { ProductFilters } from '@/components/store/product-filters';
import { useCategory, useProducts, ProductFilters as IProductFilters } from '@/hooks/use-products';
import { CategoryPageMeta } from '@/components/seo/store-meta';
import { cn } from '@/lib/utils';
import { 
  ShoppingBag, 
  ChevronLeft,
  Filter,
  Grid,
  List
} from 'lucide-react';

export default function CategoryPage() {
  const { slug } = useParams();
  const [, setLocation] = useLocation();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<IProductFilters>({
    category: slug,
    limit: 20,
    sort: 'newest',
  });

  // Fetch category and products
  const { data: categoryData, isLoading: categoryLoading, error: categoryError } = useCategory(slug!);
  const { data: productsData, isLoading: productsLoading, error: productsError } = useProducts(filters);

  // Handle filter changes
  const handleFiltersChange = (newFilters: IProductFilters) => {
    setFilters({ ...newFilters, category: slug, limit: 20 });
  };

  // Loading state
  if (categoryLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-48 bg-muted rounded-lg" />
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-2/3" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error or not found state
  if (categoryError || !categoryData) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The category you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link href="/store">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Browse All Products
          </Link>
        </Button>
      </div>
    );
  }

  const category = categoryData.category;
  const products = productsData?.products || [];

  return (
    <div className="bg-background text-foreground min-h-screen">
      <CategoryPageMeta
        categoryName={category.name}
        categoryDescription={category.description}
        categoryImage={category.imageUrl}
        productCount={productsData?.pagination.total}
      />
      
      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link 
              href="/store" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Store
            </Link>
            <span className="text-muted-foreground">›</span>
            <span className="font-medium">{category.name}</span>
          </nav>
        </div>
      </div>

      {/* Back Button */}
      <div className="container mx-auto px-4 py-4">
        <Button
          variant="ghost"
          onClick={() => setLocation('/store')}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Store
        </Button>
      </div>

      {/* Category Header */}
      <section className="py-16 lg:py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Category Info */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                  {category.name}
                </h1>
                {category.description && (
                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                    {category.description}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  <span>
                    {categoryData.productCount || products.length} {(categoryData.productCount || products.length) === 1 ? 'item' : 'items'}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Category Image */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {category.imageUrl ? (
                <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
                  <LazyImage
                    src={category.imageUrl}
                    alt={category.name}
                    className="w-full h-full object-cover"
                    width={600}
                    height={600}
                  />
                </div>
              ) : (
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <ShoppingBag className="h-24 w-24 text-primary/60" />
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 bg-secondary/20">
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
                    <h2 className="text-2xl font-bold mb-2">
                      {category.name} Collection
                    </h2>
                    <p className="text-muted-foreground">
                      {productsData?.pagination.total ? (
                        `Showing ${products.length} of ${productsData.pagination.total} products`
                      ) : (
                        `${products.length} products found`
                      )}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {/* View Mode Toggle */}
                    <div className="hidden sm:flex items-center border border-border rounded-lg p-1">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="px-3 py-1"
                      >
                        <Grid className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="px-3 py-1"
                      >
                        <List className="h-4 w-4" />
                      </Button>
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

              {/* Products Grid/List */}
              <ProductGrid
                products={products}
                isLoading={productsLoading}
                error={productsError}
                variant={viewMode === 'grid' ? 'default' : 'compact'}
                columns={
                  viewMode === 'grid' 
                    ? { xs: 1, sm: 2, md: 2, lg: 3, xl: 3 }
                    : { xs: 2, sm: 3, md: 4, lg: 5, xl: 6 }
                }
                emptyTitle="No products found in this category"
                emptyDescription="Try adjusting your filters or check back later for new items."
                emptyAction={
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      onClick={() => setFilters({ category: slug, limit: 20, sort: 'newest' })}
                      variant="outline"
                    >
                      Clear Filters
                    </Button>
                    <Button asChild>
                      <Link href="/store">Browse All Products</Link>
                    </Button>
                  </div>
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
                        limit: (filters.limit || 20) + 20
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

      {/* Related Categories CTA */}
      <section className="py-16 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold mb-4">Explore More Categories</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Discover more amazing items from our complete collection of anxious superhero gear
            </p>
            <Button size="lg" asChild>
              <Link href="/store">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Browse All Products
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}