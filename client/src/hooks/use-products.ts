import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Types for product data
export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  basePrice: number;
  salePrice?: number;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  primaryImage?: {
    id: string;
    imageUrl: string;
    altText: string;
  };
  images?: Array<{
    id: string;
    imageUrl: string;
    altText: string;
  }>;
  variants?: ProductVariant[];
  inStock: boolean;
  totalStock: number;
  isFeatured?: boolean;
  isNew?: boolean;
  relatedProducts?: Product[];
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  priceAdjustment: number;
  attributes: {
    size?: string;
    color?: string;
    [key: string]: any;
  };
  inventory: {
    available: number;
    reserved: number;
    inStock: boolean;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  displayOrder: number;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  sort?: 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc' | 'newest' | 'oldest';
  limit?: number;
  offset?: number;
}

// Fetch all products with filtering
export function useProducts(filters: ProductFilters = {}) {
  const queryParams = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });

  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/products?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json() as Promise<ProductsResponse>;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Fetch single product by slug
export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/products/${slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Product not found');
        }
        throw new Error('Failed to fetch product');
      }
      const data = await response.json();
      return data.product as Product;
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Fetch featured products for homepage
export function useFeaturedProducts(limit: number = 4) {
  return useQuery({
    queryKey: ['products', 'featured', limit],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/products?featured=true&limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch featured products');
      const data = await response.json();
      return data.products as Product[];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Fetch product variants
export function useProductVariants(productId: string) {
  return useQuery({
    queryKey: ['product-variants', productId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/products/${productId}/variants`);
      if (!response.ok) throw new Error('Failed to fetch product variants');
      return response.json() as Promise<ProductVariant[]>;
    },
    enabled: !!productId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Fetch related products
export function useRelatedProducts(productId: string, limit: number = 4) {
  return useQuery({
    queryKey: ['related-products', productId, limit],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/products/${productId}/related?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch related products');
      return response.json() as Promise<Product[]>;
    },
    enabled: !!productId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Fetch all categories
export function useCategories(includeProductCount: boolean = true) {
  return useQuery({
    queryKey: ['categories', includeProductCount],
    queryFn: async () => {
      const response = await apiRequest(
        'GET', 
        `/api/categories${includeProductCount ? '?includeProductCount=true' : ''}`
      );
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      return data.categories as Category[];
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

// Fetch category by slug with products
export function useCategory(slug: string) {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/categories/${slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Category not found');
        }
        throw new Error('Failed to fetch category');
      }
      return response.json();
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Infinite query for paginated products (useful for infinite scroll)
export function useInfiniteProducts(filters: Omit<ProductFilters, 'offset'> = {}) {
  const limit = filters.limit || 20;
  
  return useInfiniteQuery({
    queryKey: ['products-infinite', filters],
    queryFn: async ({ pageParam = 0 }) => {
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== 'offset') {
          queryParams.append(key, String(value));
        }
      });
      
      queryParams.append('offset', String(pageParam));
      queryParams.append('limit', String(limit));

      const response = await apiRequest('GET', `/api/products?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json() as Promise<ProductsResponse>;
    },
    getNextPageParam: (lastPage, pages) => {
      const nextOffset = pages.length * limit;
      return lastPage.pagination.hasMore ? nextOffset : undefined;
    },
    initialPageParam: 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Search products with debouncing support
export function useProductSearch(query: string, filters: Omit<ProductFilters, 'search'> = {}) {
  return useQuery({
    queryKey: ['products-search', query, filters],
    queryFn: async () => {
      const searchFilters = { ...filters, search: query };
      const queryParams = new URLSearchParams();
      
      Object.entries(searchFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });

      const response = await apiRequest('GET', `/api/products?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Failed to search products');
      return response.json() as Promise<ProductsResponse>;
    },
    enabled: query.length >= 2, // Only search when query is at least 2 characters
    staleTime: 1000 * 60 * 2, // 2 minutes for search results
  });
}

// Utility hook for price formatting
export function useFormatPrice() {
  return (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };
}

// Utility hook for stock status
export function useStockStatus(product: Product, selectedVariant?: ProductVariant) {
  const getStockStatus = () => {
    if (selectedVariant) {
      if (!selectedVariant.inventory.inStock) return 'out-of-stock';
      if (selectedVariant.inventory.available <= 5) return 'low-stock';
      return 'in-stock';
    }
    
    if (!product.inStock) return 'out-of-stock';
    if (product.totalStock <= 5) return 'low-stock';
    return 'in-stock';
  };

  const stockStatus = getStockStatus();
  
  return {
    status: stockStatus,
    isInStock: stockStatus !== 'out-of-stock',
    isLowStock: stockStatus === 'low-stock',
    stockCount: selectedVariant ? selectedVariant.inventory.available : product.totalStock,
  };
}