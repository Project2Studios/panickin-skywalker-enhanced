import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCategories, ProductFilters } from '@/hooks/use-products';
import { Search, Filter, X, SlidersHorizontal, ChevronDown, Star } from 'lucide-react';

interface ProductFiltersProps {
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  className?: string;
  showSearch?: boolean;
  showMobileSheet?: boolean;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'name_asc', label: 'Name A-Z' },
  { value: 'name_desc', label: 'Name Z-A' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

export function ProductFilters({
  filters,
  onFiltersChange,
  className,
  showSearch = true,
  showMobileSheet = true,
}: ProductFiltersProps) {
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.minPrice || 0,
    filters.maxPrice || 200,
  ]);
  const [isOpen, setIsOpen] = useState(false);

  const { data: categories, isLoading: categoriesLoading } = useCategories(true);

  // Debounce search input
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery !== (filters.search || '')) {
        onFiltersChange({ ...filters, search: searchQuery || undefined });
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, filters, onFiltersChange]);

  // Handle price range changes
  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
  };

  const applyPriceRange = () => {
    onFiltersChange({
      ...filters,
      minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
      maxPrice: priceRange[1] < 200 ? priceRange[1] : undefined,
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setPriceRange([0, 200]);
    onFiltersChange({});
  };

  // Count active filters
  const activeFilterCount = Object.keys(filters).filter(key => 
    filters[key as keyof ProductFilters] !== undefined && 
    key !== 'limit' && 
    key !== 'offset'
  ).length;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Categories
        </h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="all-categories"
              checked={!filters.category}
              onCheckedChange={() => {
                onFiltersChange({ ...filters, category: undefined });
              }}
            />
            <Label htmlFor="all-categories" className="text-sm font-medium">
              All Categories
            </Label>
          </div>
          {categories?.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={filters.category === category.slug}
                onCheckedChange={(checked) => {
                  onFiltersChange({
                    ...filters,
                    category: checked ? category.slug : undefined,
                  });
                }}
              />
              <Label htmlFor={`category-${category.id}`} className="text-sm">
                {category.name}
                {category.productCount && (
                  <span className="text-muted-foreground ml-1">
                    ({category.productCount})
                  </span>
                )}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <div className="space-y-4">
          <div className="px-3">
            <Slider
              value={priceRange}
              onValueChange={handlePriceRangeChange}
              max={200}
              min={0}
              step={5}
              className="w-full"
            />
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={applyPriceRange}
            className="w-full"
          >
            Apply Price Range
          </Button>
        </div>
      </div>

      {/* Featured Products */}
      <div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="featured"
            checked={filters.featured === true}
            onCheckedChange={(checked) => {
              onFiltersChange({
                ...filters,
                featured: checked ? true : undefined,
              });
            }}
          />
          <Label htmlFor="featured" className="text-sm flex items-center gap-2">
            <Star className="h-4 w-4" />
            Featured Products Only
          </Label>
        </div>
      </div>

      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <Button
          variant="outline"
          onClick={clearFilters}
          className="w-full flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Clear All Filters ({activeFilterCount})
        </Button>
      )}
    </div>
  );

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search and Sort Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        {showSearch && (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Sort */}
        <Select
          value={filters.sort || 'newest'}
          onValueChange={(value) => {
            onFiltersChange({
              ...filters,
              sort: value as ProductFilters['sort'],
            });
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Mobile Filter Button */}
        {showMobileSheet && (
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="sm:hidden flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>Filter Products</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>

      {/* Active Filters */}
      <AnimatePresence>
        {activeFilterCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2"
          >
            {filters.category && (
              <Badge 
                variant="secondary" 
                className="flex items-center gap-2"
              >
                Category: {categories?.find(c => c.slug === filters.category)?.name}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFiltersChange({ ...filters, category: undefined })}
                  className="h-4 w-4 p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filters.search && (
              <Badge 
                variant="secondary" 
                className="flex items-center gap-2"
              >
                Search: "{filters.search}"
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    onFiltersChange({ ...filters, search: undefined });
                  }}
                  className="h-4 w-4 p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {(filters.minPrice || filters.maxPrice) && (
              <Badge 
                variant="secondary" 
                className="flex items-center gap-2"
              >
                Price: ${filters.minPrice || 0} - ${filters.maxPrice || 200}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPriceRange([0, 200]);
                    onFiltersChange({ 
                      ...filters, 
                      minPrice: undefined, 
                      maxPrice: undefined 
                    });
                  }}
                  className="h-4 w-4 p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filters.featured && (
              <Badge 
                variant="secondary" 
                className="flex items-center gap-2"
              >
                <Star className="h-3 w-3" />
                Featured
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFiltersChange({ ...filters, featured: undefined })}
                  className="h-4 w-4 p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Filters */}
      <div className="hidden sm:block">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Products
              {activeFilterCount > 0 && (
                <Badge variant="secondary">{activeFilterCount}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FilterContent />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}