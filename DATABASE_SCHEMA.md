# Panickin' Skywalker E-Commerce Database Schema

## Overview

This document describes the database schema for the Panickin' Skywalker merch store, implemented using PostgreSQL with Drizzle ORM.

## Database Setup

### Environment Variables Required
```env
DATABASE_URL=postgresql://username:password@host:port/database_name
```

### Migration Commands
```bash
# Generate new migration from schema changes
npm run db:generate

# Push schema to database (dev only - bypasses migrations)
npm run db:push

# Run migrations
npm run db:migrate

# Open Drizzle Studio (database GUI)
npm run db:studio

# Seed database with sample data
npm run db:seed
```

## Table Relationships

```
users (existing)
├── cart_items (user_id)
├── shipping_addresses (user_id)
└── orders (user_id)

categories
└── products (category_id)
    ├── product_variants (product_id)
    │   ├── cart_items (variant_id)
    │   ├── order_items (variant_id)
    │   └── inventory (variant_id)
    ├── product_images (product_id)
    ├── cart_items (product_id)
    ├── order_items (product_id)
    └── inventory (product_id)

shipping_addresses
├── orders (shipping_address_id)
└── orders (billing_address_id)

orders
└── order_items (order_id)
```

## Table Specifications

### Core E-Commerce Tables

#### `categories`
Merchandise categories (t-shirts, hoodies, vinyl, etc.)

| Column | Type | Description |
|--------|------|-------------|
| id | varchar (UUID) | Primary key |
| name | text | Category name (e.g., "T-Shirts") |
| slug | text | URL-friendly identifier |
| description | text | Category description |
| image_url | text | Category image URL |
| display_order | integer | Sort order for display |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

**Indexes**: slug, display_order

#### `products`
Main product catalog

| Column | Type | Description |
|--------|------|-------------|
| id | varchar (UUID) | Primary key |
| category_id | varchar | Foreign key to categories |
| name | text | Product name |
| slug | text | URL-friendly identifier |
| description | text | Product description |
| base_price | decimal(10,2) | Base price in USD |
| sale_price | decimal(10,2) | Sale price (nullable) |
| is_featured | boolean | Featured on homepage |
| is_active | boolean | Available for purchase |
| weight | decimal(8,2) | Shipping weight in pounds |
| dimensions | jsonb | Physical dimensions object |
| meta_title | text | SEO meta title |
| meta_description | text | SEO meta description |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

**Indexes**: slug, category_id, is_featured, is_active

#### `product_variants`
Size/color variations for products

| Column | Type | Description |
|--------|------|-------------|
| id | varchar (UUID) | Primary key |
| product_id | varchar | Foreign key to products |
| sku | text | Stock keeping unit (unique) |
| name | text | Variant name (e.g., "Large - Black") |
| price_adjustment | decimal(8,2) | Price modifier (+/-) |
| attributes | jsonb | Size, color, etc. attributes |
| stock_quantity | integer | Current stock level |
| is_active | boolean | Available for purchase |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

**Indexes**: sku, product_id, stock_quantity

#### `product_images`
Product photo gallery

| Column | Type | Description |
|--------|------|-------------|
| id | varchar (UUID) | Primary key |
| product_id | varchar | Foreign key to products |
| image_url | text | Image URL or path |
| alt_text | text | Accessibility alt text |
| display_order | integer | Sort order |
| is_primary | boolean | Main product image |
| created_at | timestamp | Creation timestamp |

**Indexes**: product_id, is_primary

### Shopping & Orders

#### `cart_items`
Persistent shopping cart

| Column | Type | Description |
|--------|------|-------------|
| id | varchar (UUID) | Primary key |
| user_id | varchar | Foreign key to users (nullable) |
| session_id | text | Session ID for guest users |
| product_id | varchar | Foreign key to products |
| variant_id | varchar | Foreign key to product_variants |
| quantity | integer | Quantity in cart |
| created_at | timestamp | Added to cart timestamp |
| updated_at | timestamp | Last modified timestamp |

**Indexes**: user_id, session_id, product_id

#### `shipping_addresses`
Customer shipping information

| Column | Type | Description |
|--------|------|-------------|
| id | varchar (UUID) | Primary key |
| user_id | varchar | Foreign key to users (nullable) |
| first_name | text | First name |
| last_name | text | Last name |
| company | text | Company name (optional) |
| address_line1 | text | Street address |
| address_line2 | text | Apartment, suite, etc. |
| city | text | City |
| state | text | State/province |
| postal_code | text | ZIP/postal code |
| country | text | Country (default: "US") |
| phone | text | Phone number |
| is_default | boolean | Default address |
| created_at | timestamp | Creation timestamp |

**Indexes**: user_id, is_default

#### `orders`
Order management

| Column | Type | Description |
|--------|------|-------------|
| id | varchar (UUID) | Primary key |
| user_id | varchar | Foreign key to users (nullable) |
| order_number | text | Human-readable order number |
| status | text | Order status enum |
| subtotal | decimal(10,2) | Pre-tax, pre-shipping total |
| tax_amount | decimal(10,2) | Tax amount |
| shipping_amount | decimal(10,2) | Shipping cost |
| total_amount | decimal(10,2) | Final total |
| currency | text | Currency code (default: "USD") |
| shipping_address_id | varchar | Foreign key to shipping_addresses |
| billing_address_id | varchar | Foreign key to shipping_addresses |
| payment_status | text | Payment status enum |
| payment_method | text | Payment method used |
| stripe_payment_intent_id | text | Stripe integration |
| notes | text | Order notes |
| created_at | timestamp | Order placement timestamp |
| updated_at | timestamp | Last update timestamp |

**Status Values**: pending, processing, shipped, delivered, cancelled
**Payment Status Values**: pending, paid, failed, refunded

**Indexes**: user_id, status, order_number, payment_status, created_at

#### `order_items`
Individual line items in orders

| Column | Type | Description |
|--------|------|-------------|
| id | varchar (UUID) | Primary key |
| order_id | varchar | Foreign key to orders |
| product_id | varchar | Foreign key to products |
| variant_id | varchar | Foreign key to product_variants |
| quantity | integer | Quantity ordered |
| unit_price | decimal(10,2) | Price per unit at time of order |
| total_price | decimal(10,2) | Line total (unit_price × quantity) |
| product_snapshot | jsonb | Product data at time of order |
| created_at | timestamp | Creation timestamp |

**Indexes**: order_id, product_id

### Inventory Management

#### `inventory`
Stock tracking and management

| Column | Type | Description |
|--------|------|-------------|
| id | varchar (UUID) | Primary key |
| product_id | varchar | Foreign key to products |
| variant_id | varchar | Foreign key to product_variants |
| quantity_available | integer | Available stock |
| quantity_reserved | integer | Reserved for pending orders |
| low_stock_threshold | integer | Alert threshold |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

**Indexes**: product_id, variant_id, quantity_available

## Key Features

### Multi-Variant Support
Products can have multiple variants (size, color, etc.) with individual SKUs, pricing, and inventory tracking.

### Guest Checkout
Cart items and orders support both registered users and guest checkout via session management.

### Flexible Pricing
Products support base pricing with variant-specific adjustments and optional sale pricing.

### Comprehensive Indexing
All frequently queried fields are indexed for optimal performance.

### Audit Trail
All major entities include created_at and updated_at timestamps for tracking changes.

### JSON Attributes
Product dimensions and variant attributes use JSONB for flexible schema-less data storage.

## Sample Data Structure

### Product with Variants Example
```json
{
  "product": {
    "name": "Classic Logo T-Shirt",
    "slug": "classic-logo-tshirt",
    "base_price": "25.00",
    "category": "T-Shirts"
  },
  "variants": [
    {
      "sku": "CLASSIC-TSHIRT-M-BLACK",
      "name": "Medium - Black",
      "attributes": { "size": "M", "color": "Black" },
      "price_adjustment": "0.00"
    },
    {
      "sku": "CLASSIC-TSHIRT-XXL-BLACK", 
      "name": "2XL - Black",
      "attributes": { "size": "XXL", "color": "Black" },
      "price_adjustment": "3.00"
    }
  ]
}
```

### Order Structure Example
```json
{
  "order": {
    "order_number": "PS-2024-001",
    "status": "processing",
    "subtotal": "55.00",
    "tax_amount": "4.95",
    "shipping_amount": "8.00",
    "total_amount": "67.95"
  },
  "items": [
    {
      "product_name": "Classic Logo T-Shirt",
      "variant_name": "Medium - Black",
      "quantity": 2,
      "unit_price": "25.00",
      "total_price": "50.00"
    }
  ]
}
```

## Migration History

- `0000_natural_white_queen.sql`: Initial e-commerce schema with all tables, relationships, and indexes

## Next Steps

1. **Set up DATABASE_URL** in your environment
2. **Run migrations**: `npm run db:push` or `npm run db:migrate`
3. **Seed sample data**: `npm run db:seed`
4. **Explore with Drizzle Studio**: `npm run db:studio`

This schema provides a solid foundation for a full-featured e-commerce system with support for complex product catalogs, inventory management, and order processing.