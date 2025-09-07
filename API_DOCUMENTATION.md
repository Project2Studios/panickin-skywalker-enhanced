# E-Commerce API Documentation

## Overview

This is the complete API reference for the Panickin Skywalker band merchandise e-commerce system. The API provides endpoints for both customer-facing operations and admin management functionality.

**Base URL**: `http://localhost:5000/api`

## Authentication

### Customer Authentication
- Most customer endpoints support optional authentication
- Use `Authorization: Bearer user:username` header for authenticated requests
- Guest sessions use `X-Session-ID` header for cart management

### Admin Authentication
- Admin endpoints require authentication
- Use `Authorization: Bearer user:admin-username` header
- Admin usernames must contain "admin" for proper authorization

## Public API Endpoints

### Categories

#### GET /api/categories
Get all active categories with optional product counts.

**Query Parameters:**
- `includeProductCount` (boolean) - Include product counts for each category

**Response:**
```json
{
  "categories": [
    {
      "id": "uuid",
      "name": "T-Shirts",
      "slug": "t-shirts", 
      "description": "Band t-shirts and apparel",
      "imageUrl": "https://example.com/image.jpg",
      "displayOrder": 1,
      "productCount": 12,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1
}
```

#### GET /api/categories/:slug
Get category by slug with its products.

**Response:**
```json
{
  "category": { /* category details */ },
  "products": [
    {
      "id": "uuid",
      "name": "Anxious Superhero Tee",
      "slug": "anxious-superhero-tee",
      "minPrice": 24.99,
      "maxPrice": 29.99,
      "variantCount": 3,
      "images": [{ /* image details */ }]
    }
  ],
  "productCount": 12
}
```

### Products

#### GET /api/products
List products with filtering, sorting, and pagination.

**Query Parameters:**
- `category` (string) - Filter by category slug
- `featured` (boolean) - Filter featured products
- `search` (string) - Search in names and descriptions
- `sort` (string) - Sort order: `name_asc`, `name_desc`, `price_asc`, `price_desc`, `newest`, `oldest`
- `limit` (number) - Results per page (default: 20)
- `offset` (number) - Results offset (default: 0)
- `minPrice` (number) - Minimum price filter
- `maxPrice` (number) - Maximum price filter

**Response:**
```json
{
  "products": [
    {
      "id": "uuid",
      "name": "Anxious Superhero Hoodie",
      "slug": "anxious-superhero-hoodie",
      "price": 49.99,
      "originalPrice": 59.99,
      "category": {
        "id": "uuid",
        "name": "Hoodies",
        "slug": "hoodies"
      },
      "primaryImage": {
        "id": "uuid",
        "imageUrl": "https://example.com/image.jpg",
        "altText": "Black hoodie with logo"
      },
      "inStock": true,
      "totalStock": 15
    }
  ],
  "pagination": {
    "total": 50,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

#### GET /api/products/:slug
Get single product by slug with full details.

**Response:**
```json
{
  "product": {
    "id": "uuid",
    "name": "Anxious Superhero Hoodie",
    "slug": "anxious-superhero-hoodie",
    "description": "Premium hoodie featuring the Anxious Superhero design",
    "basePrice": 49.99,
    "salePrice": 44.99,
    "variants": [
      {
        "id": "uuid",
        "name": "Medium - Black",
        "sku": "ASH-M-BLK",
        "priceAdjustment": 0,
        "attributes": {
          "size": "Medium",
          "color": "Black"
        },
        "inventory": {
          "available": 5,
          "reserved": 2,
          "inStock": true
        }
      }
    ],
    "images": [/* image details */],
    "relatedProducts": [/* related product summaries */]
  }
}
```

#### GET /api/products/:id/variants
Get all variants for a product.

#### GET /api/products/:id/related
Get related products (same category).

### Shopping Cart

#### GET /api/cart
Get current cart contents.

**Headers:**
- `X-Session-ID` (required for guests)
- `Authorization` (optional for authenticated users)

**Response:**
```json
{
  "items": [
    {
      "id": "uuid",
      "product": {
        "id": "uuid",
        "name": "Band Tee",
        "slug": "band-tee"
      },
      "variant": {
        "id": "uuid", 
        "name": "Large - Black",
        "sku": "BT-L-BLK",
        "attributes": {
          "size": "Large",
          "color": "Black"
        }
      },
      "quantity": 2,
      "price": 24.99,
      "total": 49.98,
      "inStock": true,
      "availableStock": 10
    }
  ],
  "summary": {
    "itemCount": 2,
    "subtotal": 49.98,
    "tax": 0,
    "shipping": 0,
    "total": 49.98
  }
}
```

#### POST /api/cart/items
Add item to cart.

**Request Body:**
```json
{
  "productId": "uuid",
  "variantId": "uuid", 
  "quantity": 2
}
```

#### PUT /api/cart/items/:id
Update cart item quantity.

**Request Body:**
```json
{
  "quantity": 3
}
```

#### DELETE /api/cart/items/:id
Remove item from cart.

#### DELETE /api/cart
Clear entire cart.

#### POST /api/cart/merge
Merge guest cart with user cart on login.

**Request Body:**
```json
{
  "guestSessionId": "session_id"
}
```

### Orders

#### POST /api/orders
Create new order.

**Request Body:**
```json
{
  "items": [
    {
      "productId": "uuid",
      "variantId": "uuid",
      "quantity": 2
    }
  ],
  "customerInfo": {
    "email": "customer@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  },
  "shippingAddress": {
    "addressLine1": "123 Main St",
    "city": "Anytown",
    "state": "CA", 
    "postalCode": "12345",
    "country": "US"
  },
  "paymentMethod": "stripe"
}
```

#### GET /api/orders/:orderNumber
Get order by order number (public lookup).

#### GET /api/orders (authenticated)
Get user's order history.

### Checkout

#### POST /api/checkout/calculate
Calculate order totals including tax and shipping.

**Request Body:**
```json
{
  "items": [/* order items */],
  "shippingAddress": {
    "state": "CA",
    "country": "US", 
    "postalCode": "90210"
  },
  "shippingMethod": "standard",
  "promoCode": "WELCOME10"
}
```

#### POST /api/checkout/create-payment-intent
Create Stripe payment intent.

#### POST /api/checkout/confirm
Confirm payment and create order.

## Admin API Endpoints

All admin endpoints require authentication with admin privileges.

### Admin Products

#### GET /api/admin/products
List all products with advanced filtering.

**Query Parameters:**
- `category` (string) - Filter by category slug
- `featured` (boolean) - Filter featured products
- `active` (boolean) - Filter by active status
- `search` (string) - Search products
- `sort` (string) - Sort order
- `limit` (number) - Results per page
- `offset` (number) - Results offset

#### POST /api/admin/products
Create new product.

#### PUT /api/admin/products/:id
Update product.

#### DELETE /api/admin/products/:id
Delete product.

#### POST /api/admin/products/:id/variants
Create product variant.

#### PUT /api/admin/products/:id/variants/:variantId
Update product variant.

#### DELETE /api/admin/products/:id/variants/:variantId
Delete product variant.

### Admin Categories

#### GET /api/admin/categories
List all categories.

#### POST /api/admin/categories
Create category.

#### PUT /api/admin/categories/:id
Update category.

#### DELETE /api/admin/categories/:id
Delete category.

### Admin Orders

#### GET /api/admin/orders
List all orders with filtering.

**Query Parameters:**
- `status` (string) - Filter by order status
- `paymentStatus` (string) - Filter by payment status
- `dateFrom` (datetime) - Start date filter
- `dateTo` (datetime) - End date filter
- `search` (string) - Search orders
- `sort` (string) - Sort order

#### GET /api/admin/orders/:id
Get order details.

#### PUT /api/admin/orders/:id/status
Update order status.

**Request Body:**
```json
{
  "status": "shipped",
  "notes": "Shipped via UPS tracking: 1Z123456789"
}
```

#### GET /api/admin/orders/stats
Get order statistics for dashboard.

### Admin Inventory

#### GET /api/admin/inventory
Get inventory levels.

**Query Parameters:**
- `productId` (string) - Filter by product
- `lowStock` (boolean) - Filter low stock items
- `threshold` (number) - Low stock threshold (default: 5)

#### PUT /api/admin/inventory/:id
Update inventory levels.

**Request Body:**
```json
{
  "available": 25,
  "reserved": 5
}
```

#### GET /api/admin/inventory/alerts
Get low stock alerts.

## Error Handling

All endpoints return consistent error responses:

```json
{
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Valid email required"
    }
  ]
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden (admin required)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

## Rate Limiting

API endpoints are rate limited to prevent abuse:
- Public endpoints: 100 requests per minute
- Authenticated endpoints: 200 requests per minute
- Admin endpoints: 500 requests per minute

## Testing

Use the included test script to verify API functionality:

```bash
node test-api.js
```

This will test basic connectivity to all major endpoints and verify authentication is working correctly.

## Development Notes

### Database Schema
The API uses a PostgreSQL database with the following main tables:
- `categories` - Product categories
- `products` - Product catalog
- `product_variants` - Product variants (sizes, colors, etc.)
- `product_images` - Product images
- `cart_items` - Shopping cart items
- `orders` - Customer orders
- `order_items` - Order line items
- `inventory` - Inventory tracking

### Security Features
- Input validation using Zod schemas
- SQL injection protection via parameterized queries
- Authentication middleware for protected routes
- Session management for guest carts
- Admin role verification

### Performance Features
- Database indexing on commonly queried fields
- Pagination for large data sets
- Efficient inventory stock checking
- Related product caching

### Future Enhancements
- Redis caching for frequently accessed data
- Real-time inventory updates via WebSocket
- Advanced search with Elasticsearch
- Image optimization and CDN integration
- Payment processing with multiple providers
- Shipping rate calculation with carrier APIs