/**
 * API Response Types and Interfaces
 * Consistent response formats for the e-commerce API
 */

// Base API response interface
export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Array<{ field?: string; message: string }>;
}

// Pagination interface
export interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  page?: number;
  pages?: number;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  pagination: PaginationInfo;
}

// Product-related response types
export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  primaryImage?: {
    id: string;
    imageUrl: string;
    altText?: string;
  } | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  inStock: boolean;
  isFeatured?: boolean;
}

export interface ProductDetails extends ProductSummary {
  description?: string;
  basePrice: number;
  salePrice?: number;
  priceRange?: {
    min: number;
    max: number;
  } | null;
  variants: ProductVariant[];
  images: ProductImage[];
  totalStock: number;
  relatedProducts: ProductSummary[];
  metaTitle?: string;
  metaDescription?: string;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  priceAdjustment: number;
  attributes?: Record<string, any>;
  inventory?: {
    available: number;
    reserved: number;
    inStock: boolean;
  };
  isActive: boolean;
}

export interface ProductImage {
  id: string;
  imageUrl: string;
  altText?: string;
  displayOrder: number;
}

// Category response types
export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  productCount?: number;
  displayOrder: number;
}

export interface CategoryDetails extends CategorySummary {
  products: ProductSummary[];
  productCount: number;
}

// Cart response types
export interface CartItem {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    basePrice: number;
  };
  variant: {
    id: string;
    name: string;
    sku: string;
    priceAdjustment: number;
    attributes?: Record<string, any>;
  };
  quantity: number;
  price: number;
  total: number;
  primaryImage?: ProductImage | null;
  inStock: boolean;
  availableStock: number;
  maxQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartSummary {
  itemCount: number;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

export interface CartResponse {
  items: CartItem[];
  summary: CartSummary;
}

// Order response types
export interface OrderItem {
  id: string;
  productName: string;
  variantName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  total: number;
  itemCount: number;
  createdAt: string;
  estimatedDelivery?: string;
}

export interface OrderDetails extends OrderSummary {
  customerInfo: {
    email: string;
    name: string;
    phone?: string;
  };
  items: OrderItem[];
  totals: {
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
  };
  addresses: {
    shipping: OrderAddress;
    billing?: OrderAddress;
  };
  paymentMethod: string;
  notes?: string;
  dates: {
    createdAt: string;
    updatedAt: string;
    estimatedDelivery?: string;
  };
  timeline: Array<{
    status: string;
    title: string;
    description: string;
    timestamp?: string;
    completed: boolean;
  }>;
}

// Checkout response types
export interface CheckoutCalculation {
  items: Array<{
    productId: string;
    variantId: string;
    productName: string;
    variantName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    attributes?: Record<string, any>;
  }>;
  subtotal: number;
  tax: {
    rate: number;
    amount: number;
  };
  shipping: {
    method: string;
    cost: number;
    estimatedDays: number;
  };
  discount: {
    code?: string;
    amount: number;
    description: string;
  };
  total: number;
}

export interface PaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
  customer: string;
  metadata: Record<string, any>;
  created: number;
}

// Admin response types
export interface AdminProductSummary extends ProductSummary {
  variantCount: number;
  activeVariantCount: number;
  totalStock: number;
  lowStock: boolean;
  imageCount: number;
  basePrice: number;
  salePrice?: number;
  isActive: boolean;
}

export interface AdminOrderSummary extends OrderSummary {
  customerName: string;
  customerEmail: string;
  subtotal: number;
  tax: number;
  shipping: number;
  shippingAddress?: OrderAddress;
  billingAddress?: OrderAddress;
}

export interface InventoryItem {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
  };
  variant: {
    id: string;
    name: string;
    sku: string;
    isActive: boolean;
    attributes?: Record<string, any>;
  };
  quantityAvailable: number;
  quantityReserved: number;
  quantityTotal: number;
  isLowStock: boolean;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  updatedAt: string;
}

export interface InventoryAlert {
  type: 'out_of_stock' | 'low_stock' | 'reserved_stock_high';
  severity: 'critical' | 'high' | 'medium' | 'low';
  product: {
    id: string;
    name: string;
    slug: string;
  };
  variant: {
    id: string;
    name: string;
    sku: string;
  };
  currentStock: number;
  reservedStock: number;
  threshold?: number;
  message: string;
  actionRequired: string;
}

// Error response types
export interface ValidationError {
  field?: string;
  message: string;
  code?: string;
}

export interface ErrorResponse {
  message: string;
  errors?: ValidationError[];
  code?: string;
  field?: string;
}

// Common filter and sort types
export type SortDirection = 'asc' | 'desc';
export type ProductSortField = 'name' | 'price' | 'created' | 'updated';
export type OrderSortField = 'created' | 'total' | 'status';
export type InventorySortField = 'stock' | 'product_name' | 'updated';

export interface ProductFilters {
  category?: string;
  featured?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

export interface OrderFilters {
  status?: OrderSummary['status'];
  paymentStatus?: OrderSummary['paymentStatus'];
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface InventoryFilters {
  productId?: string;
  lowStock?: boolean;
  threshold?: number;
}