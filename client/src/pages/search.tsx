import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchBar } from '@/components/store/search-bar';
import { ProductGrid } from '@/components/store/product-grid';
import { ProductFilters } from '@/components/store/product-filters';
import { StoreMeta } from '@/components/seo/store-meta';
import { useProducts, ProductFilters as IProductFilters } from '@/hooks/use-products';
import { cn } from '@/lib/utils';
import { 
  Search, 
  ChevronLeft,
  Filter,
  X,
  TrendingUp,
  Clock,
  AlertCircle 
} from 'lucide-react';

export default function SearchPage() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<IProductFilters>({
    search: initialQuery,
    limit: 20,
    sort: 'relevance',
  });

  // Update filters when query changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, search: query }));
  }, [query]);

  // Update URL when query changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    const newUrl = `/store/search${params.toString() ? `?${params.toString()}` : ''}`;
    if (location !== newUrl) {
      setLocation(newUrl, { replace: true });
    }
  }, [query, location, setLocation]);

  // Fetch search results
  const { data: productsData, isLoading, error } = useProducts(filters);

  // Handle search from search bar
  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters: IProductFilters) => {
    setFilters({ ...newFilters, search: query, limit: 20 });
  };

  // Clear search
  const clearSearch = () => {
    setQuery('');
    setFilters({ limit: 20, sort: 'newest' });
  };

  const products = productsData?.products || [];
  const totalResults = productsData?.pagination.total || 0;
  const hasResults = products.length > 0;
  const hasQuery = query.trim().length > 0;

  return (
    <div className="bg-background text-foreground min-h-screen">
      <StoreMeta
        title={hasQuery ? `Search Results for "${query}"` : "Search Products"}
        description={hasQuery 
          ? `Search results for "${query}" - Find Panickin' Skywalker merchandise, vinyl records, and exclusive items.`
          : "Search Panickin' Skywalker merchandise, vinyl records, t-shirts, hoodies, and exclusive band items."
        }
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
            <span className="font-medium">Search</span>
            {hasQuery && (
              <>
                <span className="text-muted-foreground">›</span>
                <span className="text-muted-foreground truncate max-w-xs">"{query}"</span>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Search Header */}
      <section className="py-8 lg:py-12 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold tracking-widest mb-4">
                <Search className="h-4 w-4" />
                SEARCH STORE
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {hasQuery ? (
                  <>Find Your Perfect <span className="text-primary">Anxious Superhero Gear</span></>
                ) : (
                  <>Search Our <span className="text-primary">Merchandise</span></>
                )}
              </h1>
              {hasQuery ? (
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  {totalResults > 0 ? (
                    `Found ${totalResults} result${totalResults !== 1 ? 's' : ''} for "${query}"`
                  ) : (
                    `No results found for "${query}". Try different keywords or browse our categories.`
                  )}
                </p>
              ) : (
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Search through our exclusive collection of band merchandise, vinyl records, and limited edition items
                </p>
              )}
            </motion.div>
          </div>

          {/* Enhanced Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search for t-shirts, vinyl, hoodies, accessories..."
              showRecentSearches={true}
              className="w-full"
            />
          </motion.div>

          {/* Active Search Display */}
          {hasQuery && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="flex items-center justify-center gap-4 mt-6"
            >
              <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
                <span className="text-sm font-medium">Searching for:</span>
                <Badge variant="secondary" className="font-mono">
                  {query}
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearSearch}
                  className="h-6 w-6 p-0 ml-1"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Search Results */}
      <section className="py-8 lg:py-12">
        <div className="container mx-auto px-4">
          {hasQuery ? (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar Filters - Desktop */}
              <aside className="lg:w-80 flex-shrink-0">
                <ProductFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  showSearch={false}
                  showMobileSheet={false}
                  className="sticky top-8"
                />
              </aside>

              {/* Results Grid */}
              <main className="flex-1">
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Search Results</h2>
                      <p className="text-muted-foreground">
                        {isLoading ? (
                          'Searching...'
                        ) : hasResults ? (
                          `Showing ${products.length} of ${totalResults} results for "${query}"`
                        ) : (
                          'No products found'
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
                </div>

                {/* Results or Empty State */}
                {hasResults ? (
                  <ProductGrid
                    products={products}
                    isLoading={isLoading}
                    error={error}
                    emptyTitle="No products found"
                    emptyDescription={`No products match your search for "${query}". Try different keywords or browse our categories.`}
                    emptyAction={
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button onClick={clearSearch} variant="outline">
                          Clear Search
                        </Button>
                        <Button asChild>
                          <Link href="/store">Browse All Products</Link>
                        </Button>
                      </div>
                    }
                  />
                ) : !isLoading && hasQuery ? (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12"
                  >
                    <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                    <h3 className="text-2xl font-bold mb-4">No Results Found</h3>
                    <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
                      We couldn't find any products matching "{query}". Try different keywords or browse our categories.
                    </p>
                    
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button onClick={clearSearch} variant="outline">
                          <X className="mr-2 h-4 w-4" />
                          Clear Search
                        </Button>
                        <Button asChild>
                          <Link href="/store">
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Browse All Products
                          </Link>
                        </Button>
                      </div>

                      {/* Search suggestions */}
                      <div className="pt-6">
                        <p className="text-sm text-muted-foreground mb-3">Popular searches:</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {['t-shirts', 'vinyl records', 'hoodies', 'accessories', 'limited edition'].map((suggestion) => (
                            <Button
                              key={suggestion}
                              size="sm"
                              variant="outline"
                              onClick={() => setQuery(suggestion)}
                              className="text-xs"
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : null}

                {/* Load More Button */}
                {hasResults && productsData?.pagination.hasMore && (
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
                      disabled={isLoading}
                    >
                      {isLoading ? 'Loading...' : 'Load More Results'}
                    </Button>
                  </div>
                )}
              </main>
            </div>
          ) : (
            /* Browse Categories when no search query */
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl font-bold mb-4">Popular Categories</h2>
                <p className="text-muted-foreground text-lg">
                  Not sure what to search for? Browse our popular categories
                </p>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { name: 'T-Shirts', slug: 't-shirts', icon: '👕' },
                  { name: 'Vinyl Records', slug: 'vinyl', icon: '🎵' },
                  { name: 'Hoodies', slug: 'hoodies', icon: '🧥' },
                  { name: 'Accessories', slug: 'accessories', icon: '🎁' },
                ].map((category, index) => (
                  <motion.div
                    key={category.slug}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Link href={`/store/category/${category.slug}`}>
                      <div className="group p-6 bg-card border border-border rounded-lg hover:border-primary hover:shadow-lg transition-all duration-300 cursor-pointer">
                        <div className="text-4xl mb-4 text-center">{category.icon}</div>
                        <h3 className="font-bold text-lg text-center group-hover:text-primary transition-colors">
                          {category.name}
                        </h3>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}