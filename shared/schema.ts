import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, decimal, integer, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name"),
  wantsUpdates: boolean("wants_updates").notNull().default(true),
  subscribedAt: timestamp("subscribed_at").notNull().default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribers).pick({
  email: true,
  name: true,
  wantsUpdates: true,
}).extend({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().optional(),
  wantsUpdates: z.boolean().default(true),
});

// ============================================================================
// E-COMMERCE TABLES
// ============================================================================

// Categories for merchandise (t-shirts, hoodies, vinyl, etc.)
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  imageUrl: text("image_url"),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
}, (table) => {
  return {
    slugIdx: index("categories_slug_idx").on(table.slug),
    displayOrderIdx: index("categories_display_order_idx").on(table.displayOrder),
  };
});

// Main products table
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  salePrice: decimal("sale_price", { precision: 10, scale: 2 }),
  isFeatured: boolean("is_featured").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  weight: decimal("weight", { precision: 8, scale: 2 }), // in pounds
  dimensions: jsonb("dimensions").$type<{ length?: number; width?: number; height?: number }>(),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
}, (table) => {
  return {
    slugIdx: index("products_slug_idx").on(table.slug),
    categoryIdx: index("products_category_idx").on(table.categoryId),
    featuredIdx: index("products_featured_idx").on(table.isFeatured),
    activeIdx: index("products_active_idx").on(table.isActive),
  };
});

// Product variants (sizes, colors, etc.)
export const productVariants = pgTable("product_variants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  sku: text("sku").notNull().unique(),
  name: text("name").notNull(), // e.g., "Large - Black", "Medium - White"
  priceAdjustment: decimal("price_adjustment", { precision: 8, scale: 2 }).notNull().default("0.00"),
  attributes: jsonb("attributes").$type<{ size?: string; color?: string; [key: string]: any }>(),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
}, (table) => {
  return {
    skuIdx: index("variants_sku_idx").on(table.sku),
    productIdx: index("variants_product_idx").on(table.productId),
    stockIdx: index("variants_stock_idx").on(table.stockQuantity),
  };
});

// Product images
export const productImages = pgTable("product_images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  altText: text("alt_text"),
  displayOrder: integer("display_order").notNull().default(0),
  isPrimary: boolean("is_primary").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
}, (table) => {
  return {
    productIdx: index("images_product_idx").on(table.productId),
    primaryIdx: index("images_primary_idx").on(table.isPrimary),
  };
});

// Shopping cart items (persistent across sessions)
export const cartItems = pgTable("cart_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }), // nullable for guest carts
  sessionId: text("session_id"), // for guest users
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  variantId: varchar("variant_id").references(() => productVariants.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
}, (table) => {
  return {
    userIdx: index("cart_user_idx").on(table.userId),
    sessionIdx: index("cart_session_idx").on(table.sessionId),
    productIdx: index("cart_product_idx").on(table.productId),
  };
});

// Shipping addresses
export const shippingAddresses = pgTable("shipping_addresses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }), // nullable for guest orders
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  company: text("company"),
  addressLine1: text("address_line1").notNull(),
  addressLine2: text("address_line2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull().default("US"),
  phone: text("phone"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
}, (table) => {
  return {
    userIdx: index("addresses_user_idx").on(table.userId),
    defaultIdx: index("addresses_default_idx").on(table.isDefault),
  };
});

// Orders
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }), // nullable for guest orders
  orderNumber: text("order_number").notNull().unique(),
  status: text("status").notNull().default("pending"), // pending, processing, shipped, delivered, cancelled
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
  shippingAmount: decimal("shipping_amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  shippingAddressId: varchar("shipping_address_id").notNull().references(() => shippingAddresses.id),
  billingAddressId: varchar("billing_address_id").notNull().references(() => shippingAddresses.id),
  paymentStatus: text("payment_status").notNull().default("pending"), // pending, paid, failed, refunded
  paymentMethod: text("payment_method"), // stripe, paypal, etc.
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
}, (table) => {
  return {
    userIdx: index("orders_user_idx").on(table.userId),
    statusIdx: index("orders_status_idx").on(table.status),
    orderNumberIdx: index("orders_number_idx").on(table.orderNumber),
    paymentStatusIdx: index("orders_payment_status_idx").on(table.paymentStatus),
    createdAtIdx: index("orders_created_at_idx").on(table.createdAt),
  };
});

// Order items (line items)
export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: varchar("product_id").notNull().references(() => products.id),
  variantId: varchar("variant_id").references(() => productVariants.id),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  productSnapshot: jsonb("product_snapshot").$type<{
    name: string;
    description?: string;
    variantName?: string;
    attributes?: Record<string, any>;
  }>(), // Store product data at time of order
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
}, (table) => {
  return {
    orderIdx: index("order_items_order_idx").on(table.orderId),
    productIdx: index("order_items_product_idx").on(table.productId),
  };
});

// Inventory management
export const inventory = pgTable("inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  variantId: varchar("variant_id").references(() => productVariants.id, { onDelete: "cascade" }),
  quantityAvailable: integer("quantity_available").notNull().default(0),
  quantityReserved: integer("quantity_reserved").notNull().default(0), // for pending orders
  lowStockThreshold: integer("low_stock_threshold").notNull().default(5),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
}, (table) => {
  return {
    productIdx: index("inventory_product_idx").on(table.productId),
    variantIdx: index("inventory_variant_idx").on(table.variantId),
    availableIdx: index("inventory_available_idx").on(table.quantityAvailable),
  };
});

// ============================================================================
// MARKETING & ANALYTICS TABLES
// ============================================================================

// Customer analytics and segmentation
export const customerAnalytics = pgTable("customer_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  email: text("email").notNull(), // For guest users
  customerSegment: text("customer_segment").notNull().default("new"), // new, returning, vip, at-risk
  lifetimeValue: decimal("lifetime_value", { precision: 10, scale: 2 }).notNull().default("0.00"),
  totalOrders: integer("total_orders").notNull().default(0),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).notNull().default("0.00"),
  averageOrderValue: decimal("average_order_value", { precision: 10, scale: 2 }).notNull().default("0.00"),
  lastPurchaseAt: timestamp("last_purchase_at"),
  firstPurchaseAt: timestamp("first_purchase_at"),
  engagementScore: integer("engagement_score").notNull().default(0), // 0-100 score
  riskScore: integer("risk_score").notNull().default(0), // churn prediction 0-100
  preferredCategories: jsonb("preferred_categories").$type<string[]>().default([]),
  demographics: jsonb("demographics").$type<{
    ageRange?: string;
    location?: { city?: string; state?: string; country?: string };
    source?: string;
  }>(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
}, (table) => {
  return {
    userIdx: index("customer_analytics_user_idx").on(table.userId),
    emailIdx: index("customer_analytics_email_idx").on(table.email),
    segmentIdx: index("customer_analytics_segment_idx").on(table.customerSegment),
    lifetimeValueIdx: index("customer_analytics_ltv_idx").on(table.lifetimeValue),
    engagementIdx: index("customer_analytics_engagement_idx").on(table.engagementScore),
  };
});

// Customer behavior tracking
export const customerBehavior = pgTable("customer_behavior", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  sessionId: text("session_id").notNull(),
  eventType: text("event_type").notNull(), // page_view, product_view, add_to_cart, purchase, etc.
  eventData: jsonb("event_data").$type<{
    productId?: string;
    categoryId?: string;
    page?: string;
    value?: number;
    metadata?: Record<string, any>;
  }>(),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  referrer: text("referrer"),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  timestamp: timestamp("timestamp").notNull().default(sql`now()`),
}, (table) => {
  return {
    userIdx: index("customer_behavior_user_idx").on(table.userId),
    sessionIdx: index("customer_behavior_session_idx").on(table.sessionId),
    eventTypeIdx: index("customer_behavior_event_type_idx").on(table.eventType),
    timestampIdx: index("customer_behavior_timestamp_idx").on(table.timestamp),
  };
});

// Email marketing campaigns
export const emailCampaigns = pgTable("email_campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // newsletter, abandoned_cart, win_back, product_launch, etc.
  subject: text("subject").notNull(),
  templateId: text("template_id").notNull(),
  segmentCriteria: jsonb("segment_criteria").$type<{
    customerSegments?: string[];
    purchaseHistory?: Record<string, any>;
    engagementLevel?: string;
    location?: string;
    customFilters?: Record<string, any>;
  }>(),
  status: text("status").notNull().default("draft"), // draft, scheduled, sending, sent, paused
  scheduledAt: timestamp("scheduled_at"),
  sentAt: timestamp("sent_at"),
  totalRecipients: integer("total_recipients").notNull().default(0),
  openRate: decimal("open_rate", { precision: 5, scale: 2 }).default("0.00"),
  clickRate: decimal("click_rate", { precision: 5, scale: 2 }).default("0.00"),
  conversionRate: decimal("conversion_rate", { precision: 5, scale: 2 }).default("0.00"),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
}, (table) => {
  return {
    typeIdx: index("email_campaigns_type_idx").on(table.type),
    statusIdx: index("email_campaigns_status_idx").on(table.status),
    scheduledIdx: index("email_campaigns_scheduled_idx").on(table.scheduledAt),
  };
});

// Email campaign recipients and tracking
export const emailCampaignRecipients = pgTable("email_campaign_recipients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").notNull().references(() => emailCampaigns.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("pending"), // pending, sent, bounced, failed
  sentAt: timestamp("sent_at"),
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),
  unsubscribedAt: timestamp("unsubscribed_at"),
  openCount: integer("open_count").notNull().default(0),
  clickCount: integer("click_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
}, (table) => {
  return {
    campaignIdx: index("email_recipients_campaign_idx").on(table.campaignId),
    emailIdx: index("email_recipients_email_idx").on(table.email),
    statusIdx: index("email_recipients_status_idx").on(table.status),
  };
});

// Loyalty program and rewards
export const loyaltyProgram = pgTable("loyalty_program", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  membershipTier: text("membership_tier").notNull().default("anxious_recruit"), // anxious_recruit, superhero_squad, vip_hero
  totalPoints: integer("total_points").notNull().default(0),
  availablePoints: integer("available_points").notNull().default(0),
  lifetimePoints: integer("lifetime_points").notNull().default(0),
  tierProgress: integer("tier_progress").notNull().default(0), // progress to next tier
  nextTierThreshold: integer("next_tier_threshold").notNull().default(100),
  referralCode: text("referral_code").unique(),
  referredBy: varchar("referred_by").references(() => users.id),
  totalReferrals: integer("total_referrals").notNull().default(0),
  anniversaryDate: timestamp("anniversary_date"),
  perks: jsonb("perks").$type<{
    earlyAccess?: boolean;
    freeShipping?: boolean;
    exclusiveProducts?: boolean;
    meetAndGreet?: boolean;
    doublePoints?: boolean;
  }>().default({}),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
}, (table) => {
  return {
    userIdx: index("loyalty_program_user_idx").on(table.userId),
    tierIdx: index("loyalty_program_tier_idx").on(table.membershipTier),
    referralCodeIdx: index("loyalty_program_referral_code_idx").on(table.referralCode),
  };
});

// Loyalty points transactions
export const loyaltyTransactions = pgTable("loyalty_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // earned, redeemed, expired, bonus
  points: integer("points").notNull(),
  reason: text("reason").notNull(), // purchase, referral, review, social_share, etc.
  orderId: varchar("order_id").references(() => orders.id, { onDelete: "set null" }),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
}, (table) => {
  return {
    userIdx: index("loyalty_transactions_user_idx").on(table.userId),
    typeIdx: index("loyalty_transactions_type_idx").on(table.type),
    orderIdx: index("loyalty_transactions_order_idx").on(table.orderId),
    expiresIdx: index("loyalty_transactions_expires_idx").on(table.expiresAt),
  };
});

// Product reviews and ratings
export const productReviews = pgTable("product_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  orderId: varchar("order_id").references(() => orders.id, { onDelete: "set null" }),
  rating: integer("rating").notNull(), // 1-5 stars
  title: text("title").notNull(),
  content: text("content").notNull(),
  photos: jsonb("photos").$type<string[]>().default([]),
  isVerifiedPurchase: boolean("is_verified_purchase").notNull().default(false),
  helpfulCount: integer("helpful_count").notNull().default(0),
  isModerated: boolean("is_moderated").notNull().default(false),
  isApproved: boolean("is_approved").notNull().default(true),
  sentiment: text("sentiment"), // positive, neutral, negative
  moderatorNotes: text("moderator_notes"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
}, (table) => {
  return {
    productIdx: index("product_reviews_product_idx").on(table.productId),
    userIdx: index("product_reviews_user_idx").on(table.userId),
    ratingIdx: index("product_reviews_rating_idx").on(table.rating),
    verifiedIdx: index("product_reviews_verified_idx").on(table.isVerifiedPurchase),
    approvedIdx: index("product_reviews_approved_idx").on(table.isApproved),
  };
});

// Promotional campaigns and discounts
export const promotionalCampaigns = pgTable("promotional_campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // percentage, fixed_amount, bogo, tiered
  code: text("code").unique(),
  description: text("description"),
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
  minimumOrderValue: decimal("minimum_order_value", { precision: 10, scale: 2 }).default("0.00"),
  maximumDiscountAmount: decimal("maximum_discount_amount", { precision: 10, scale: 2 }),
  usageLimit: integer("usage_limit"),
  usageCount: integer("usage_count").notNull().default(0),
  customerUsageLimit: integer("customer_usage_limit").default(1),
  applicableProducts: jsonb("applicable_products").$type<string[]>().default([]),
  applicableCategories: jsonb("applicable_categories").$type<string[]>().default([]),
  customerSegments: jsonb("customer_segments").$type<string[]>().default([]),
  isActive: boolean("is_active").notNull().default(true),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
}, (table) => {
  return {
    codeIdx: index("promotional_campaigns_code_idx").on(table.code),
    typeIdx: index("promotional_campaigns_type_idx").on(table.type),
    activeIdx: index("promotional_campaigns_active_idx").on(table.isActive),
    startDateIdx: index("promotional_campaigns_start_date_idx").on(table.startDate),
  };
});

// A/B testing experiments
export const abTestExperiments = pgTable("ab_test_experiments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // ui_test, email_test, pricing_test, etc.
  status: text("status").notNull().default("draft"), // draft, running, paused, completed
  trafficAllocation: decimal("traffic_allocation", { precision: 5, scale: 2 }).notNull().default("50.00"), // percentage
  variants: jsonb("variants").$type<{
    control: { name: string; config: Record<string, any> };
    treatment: { name: string; config: Record<string, any> };
  }>().notNull(),
  metrics: jsonb("metrics").$type<{
    primaryMetric: string;
    secondaryMetrics?: string[];
    conversionGoals?: Record<string, any>;
  }>(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  results: jsonb("results").$type<{
    control: Record<string, any>;
    treatment: Record<string, any>;
    significance?: number;
    winner?: string;
  }>(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
}, (table) => {
  return {
    statusIdx: index("ab_test_experiments_status_idx").on(table.status),
    typeIdx: index("ab_test_experiments_type_idx").on(table.type),
  };
});

// Social media integration and user-generated content
export const socialContent = pgTable("social_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  orderId: varchar("order_id").references(() => orders.id, { onDelete: "set null" }),
  productId: varchar("product_id").references(() => products.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(), // instagram, twitter, facebook, tiktok
  contentType: text("content_type").notNull(), // photo, video, story, post
  mediaUrls: jsonb("media_urls").$type<string[]>().default([]),
  caption: text("caption"),
  tags: jsonb("tags").$type<string[]>().default([]),
  externalId: text("external_id"), // platform-specific ID
  engagementMetrics: jsonb("engagement_metrics").$type<{
    likes?: number;
    comments?: number;
    shares?: number;
    views?: number;
  }>().default({}),
  isApproved: boolean("is_approved").notNull().default(false),
  isFeatured: boolean("is_featured").notNull().default(false),
  moderatorNotes: text("moderator_notes"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
}, (table) => {
  return {
    platformIdx: index("social_content_platform_idx").on(table.platform),
    productIdx: index("social_content_product_idx").on(table.productId),
    approvedIdx: index("social_content_approved_idx").on(table.isApproved),
    featuredIdx: index("social_content_featured_idx").on(table.isFeatured),
  };
});

// ============================================================================
// ZOD SCHEMAS FOR VALIDATION
// ============================================================================

// Existing schemas (moved below to avoid duplicates)

// E-commerce schemas
export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  slug: true,
  description: true,
  imageUrl: true,
  displayOrder: true,
}).extend({
  name: z.string().min(1, "Category name is required"),
  slug: z.string().min(1, "Category slug is required"),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  displayOrder: z.number().int().min(0).default(0),
});

export const insertProductSchema = createInsertSchema(products).pick({
  categoryId: true,
  name: true,
  slug: true,
  description: true,
  basePrice: true,
  salePrice: true,
  isFeatured: true,
  isActive: true,
  weight: true,
  dimensions: true,
  metaTitle: true,
  metaDescription: true,
}).extend({
  name: z.string().min(1, "Product name is required"),
  slug: z.string().min(1, "Product slug is required"),
  basePrice: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, "Price must be a positive number"),
  salePrice: z.string().refine((val) => val === "" || (!isNaN(Number(val)) && Number(val) >= 0), "Sale price must be a positive number").optional(),
  description: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  weight: z.string().refine((val) => val === "" || (!isNaN(Number(val)) && Number(val) >= 0), "Weight must be a positive number").optional(),
  dimensions: z.object({
    length: z.number().positive().optional(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
  }).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

export const insertProductVariantSchema = createInsertSchema(productVariants).pick({
  productId: true,
  sku: true,
  name: true,
  priceAdjustment: true,
  attributes: true,
  stockQuantity: true,
  isActive: true,
}).extend({
  sku: z.string().min(1, "SKU is required"),
  name: z.string().min(1, "Variant name is required"),
  priceAdjustment: z.string().refine((val) => !isNaN(Number(val)), "Price adjustment must be a number").default("0.00"),
  stockQuantity: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  attributes: z.record(z.any()).optional(),
});

export const insertShippingAddressSchema = createInsertSchema(shippingAddresses).pick({
  userId: true,
  firstName: true,
  lastName: true,
  company: true,
  addressLine1: true,
  addressLine2: true,
  city: true,
  state: true,
  postalCode: true,
  country: true,
  phone: true,
  isDefault: true,
}).extend({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  company: z.string().optional(),
  addressLine1: z.string().min(1, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required").default("US"),
  phone: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  userId: true,
  orderNumber: true,
  status: true,
  subtotal: true,
  taxAmount: true,
  shippingAmount: true,
  totalAmount: true,
  currency: true,
  shippingAddressId: true,
  billingAddressId: true,
  paymentStatus: true,
  paymentMethod: true,
  stripePaymentIntentId: true,
  notes: true,
}).extend({
  orderNumber: z.string().min(1, "Order number is required"),
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]).default("pending"),
  subtotal: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, "Subtotal must be a positive number"),
  taxAmount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, "Tax amount must be a positive number").default("0.00"),
  shippingAmount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, "Shipping amount must be a positive number").default("0.00"),
  totalAmount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, "Total amount must be a positive number"),
  currency: z.string().min(1, "Currency is required").default("USD"),
  paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]).default("pending"),
  paymentMethod: z.string().optional(),
  stripePaymentIntentId: z.string().optional(),
  notes: z.string().optional(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertNewsletterSubscriber = z.infer<typeof insertNewsletterSubscriberSchema>;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;

// E-commerce types
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProductVariant = z.infer<typeof insertProductVariantSchema>;
export type ProductVariant = typeof productVariants.$inferSelect;
export type ProductImage = typeof productImages.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertShippingAddress = z.infer<typeof insertShippingAddressSchema>;
export type ShippingAddress = typeof shippingAddresses.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Inventory = typeof inventory.$inferSelect;

// Marketing and analytics schemas
export const insertCustomerAnalyticsSchema = createInsertSchema(customerAnalytics).pick({
  userId: true,
  email: true,
  customerSegment: true,
  demographics: true,
}).extend({
  email: z.string().email(),
  customerSegment: z.enum(["new", "returning", "vip", "at-risk"]).default("new"),
  demographics: z.object({
    ageRange: z.string().optional(),
    location: z.object({
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
    }).optional(),
    source: z.string().optional(),
  }).optional(),
});

export const insertCustomerBehaviorSchema = createInsertSchema(customerBehavior).pick({
  userId: true,
  sessionId: true,
  eventType: true,
  eventData: true,
  userAgent: true,
  ipAddress: true,
  referrer: true,
  utmSource: true,
  utmMedium: true,
  utmCampaign: true,
}).extend({
  sessionId: z.string().min(1),
  eventType: z.enum(["page_view", "product_view", "add_to_cart", "remove_from_cart", "checkout_start", "purchase", "email_open", "email_click", "social_share"]),
  eventData: z.object({
    productId: z.string().optional(),
    categoryId: z.string().optional(),
    page: z.string().optional(),
    value: z.number().optional(),
    metadata: z.record(z.any()).optional(),
  }).optional(),
});

export const insertEmailCampaignSchema = createInsertSchema(emailCampaigns).pick({
  name: true,
  type: true,
  subject: true,
  templateId: true,
  segmentCriteria: true,
  scheduledAt: true,
}).extend({
  name: z.string().min(1, "Campaign name is required"),
  type: z.enum(["newsletter", "abandoned_cart", "win_back", "product_launch", "tour_announcement", "birthday", "welcome"]),
  subject: z.string().min(1, "Subject line is required"),
  templateId: z.string().min(1, "Template ID is required"),
  segmentCriteria: z.object({
    customerSegments: z.array(z.string()).optional(),
    purchaseHistory: z.record(z.any()).optional(),
    engagementLevel: z.string().optional(),
    location: z.string().optional(),
    customFilters: z.record(z.any()).optional(),
  }).optional(),
  scheduledAt: z.date().optional(),
});

export const insertLoyaltyProgramSchema = createInsertSchema(loyaltyProgram).pick({
  userId: true,
  membershipTier: true,
  referralCode: true,
  referredBy: true,
}).extend({
  userId: z.string().min(1),
  membershipTier: z.enum(["anxious_recruit", "superhero_squad", "vip_hero"]).default("anxious_recruit"),
  referralCode: z.string().optional(),
});

export const insertLoyaltyTransactionSchema = createInsertSchema(loyaltyTransactions).pick({
  userId: true,
  type: true,
  points: true,
  reason: true,
  orderId: true,
  metadata: true,
  expiresAt: true,
}).extend({
  userId: z.string().min(1),
  type: z.enum(["earned", "redeemed", "expired", "bonus"]),
  points: z.number().int(),
  reason: z.enum(["purchase", "referral", "review", "social_share", "birthday", "signup", "manual"]),
  metadata: z.record(z.any()).optional(),
  expiresAt: z.date().optional(),
});

export const insertProductReviewSchema = createInsertSchema(productReviews).pick({
  productId: true,
  userId: true,
  orderId: true,
  rating: true,
  title: true,
  content: true,
  photos: true,
}).extend({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1, "Review title is required"),
  content: z.string().min(10, "Review content must be at least 10 characters"),
  photos: z.array(z.string().url()).optional(),
});

export const insertPromotionalCampaignSchema = createInsertSchema(promotionalCampaigns).pick({
  name: true,
  type: true,
  code: true,
  description: true,
  discountValue: true,
  minimumOrderValue: true,
  maximumDiscountAmount: true,
  usageLimit: true,
  customerUsageLimit: true,
  applicableProducts: true,
  applicableCategories: true,
  customerSegments: true,
  startDate: true,
  endDate: true,
}).extend({
  name: z.string().min(1, "Campaign name is required"),
  type: z.enum(["percentage", "fixed_amount", "bogo", "tiered"]),
  code: z.string().min(3, "Promo code must be at least 3 characters").optional(),
  discountValue: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Discount value must be positive"),
  minimumOrderValue: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, "Minimum order value must be non-negative").optional(),
  startDate: z.date(),
  endDate: z.date().optional(),
});

export const insertSocialContentSchema = createInsertSchema(socialContent).pick({
  userId: true,
  orderId: true,
  productId: true,
  platform: true,
  contentType: true,
  mediaUrls: true,
  caption: true,
  tags: true,
  externalId: true,
}).extend({
  platform: z.enum(["instagram", "twitter", "facebook", "tiktok", "youtube"]),
  contentType: z.enum(["photo", "video", "story", "post", "reel"]),
  mediaUrls: z.array(z.string().url()).optional(),
  caption: z.string().optional(),
  tags: z.array(z.string()).optional(),
  externalId: z.string().optional(),
});

// Marketing and analytics type exports
export type CustomerAnalytics = typeof customerAnalytics.$inferSelect;
export type InsertCustomerAnalytics = z.infer<typeof insertCustomerAnalyticsSchema>;
export type CustomerBehavior = typeof customerBehavior.$inferSelect;
export type InsertCustomerBehavior = z.infer<typeof insertCustomerBehaviorSchema>;
export type EmailCampaign = typeof emailCampaigns.$inferSelect;
export type InsertEmailCampaign = z.infer<typeof insertEmailCampaignSchema>;
export type EmailCampaignRecipient = typeof emailCampaignRecipients.$inferSelect;
export type LoyaltyProgram = typeof loyaltyProgram.$inferSelect;
export type InsertLoyaltyProgram = z.infer<typeof insertLoyaltyProgramSchema>;
export type LoyaltyTransaction = typeof loyaltyTransactions.$inferSelect;
export type InsertLoyaltyTransaction = z.infer<typeof insertLoyaltyTransactionSchema>;
export type ProductReview = typeof productReviews.$inferSelect;
export type InsertProductReview = z.infer<typeof insertProductReviewSchema>;
export type PromotionalCampaign = typeof promotionalCampaigns.$inferSelect;
export type InsertPromotionalCampaign = z.infer<typeof insertPromotionalCampaignSchema>;
export type AbTestExperiment = typeof abTestExperiments.$inferSelect;
export type SocialContent = typeof socialContent.$inferSelect;
export type InsertSocialContent = z.infer<typeof insertSocialContentSchema>;
