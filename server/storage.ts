import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { db } from "./db";
import {
  type User,
  type InsertUser,
  type NewsletterSubscriber,
  type InsertNewsletterSubscriber,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type ProductVariant,
  type InsertProductVariant,
  type ProductImage,
  type CartItem,
  type ShippingAddress,
  type InsertShippingAddress,
  type Order,
  type InsertOrder,
  type OrderItem,
  type Inventory,
  // Marketing and analytics types
  type CustomerAnalytics,
  type InsertCustomerAnalytics,
  type CustomerBehavior,
  type InsertCustomerBehavior,
  type EmailCampaign,
  type InsertEmailCampaign,
  type EmailCampaignRecipient,
  type LoyaltyProgram,
  type InsertLoyaltyProgram,
  type LoyaltyTransaction,
  type InsertLoyaltyTransaction,
  type ProductReview,
  type InsertProductReview,
  type PromotionalCampaign,
  type InsertPromotionalCampaign,
  type SocialContent,
  type InsertSocialContent,
  users,
  newsletterSubscribers,
  categories,
  products,
  productVariants,
  productImages,
  cartItems,
  shippingAddresses,
  orders,
  orderItems,
  inventory,
  // Marketing and analytics tables
  customerAnalytics,
  customerBehavior,
  emailCampaigns,
  emailCampaignRecipients,
  loyaltyProgram,
  loyaltyTransactions,
  productReviews,
  promotionalCampaigns,
  socialContent,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Newsletter management
  getNewsletterSubscriber(email: string): Promise<NewsletterSubscriber | undefined>;
  createNewsletterSubscriber(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber>;
  getAllNewsletterSubscribers(): Promise<NewsletterSubscriber[]>;

  // Category management
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;

  // Product management
  getProducts(categoryId?: string, featured?: boolean, active?: boolean): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  // Product variant management
  getProductVariants(productId: string): Promise<ProductVariant[]>;
  getProductVariant(id: string): Promise<ProductVariant | undefined>;
  createProductVariant(variant: InsertProductVariant): Promise<ProductVariant>;
  updateProductVariant(id: string, variant: Partial<InsertProductVariant>): Promise<ProductVariant | undefined>;
  deleteProductVariant(id: string): Promise<boolean>;

  // Product image management
  getProductImages(productId: string): Promise<ProductImage[]>;
  createProductImage(image: Omit<ProductImage, 'id' | 'createdAt'>): Promise<ProductImage>;
  deleteProductImage(id: string): Promise<boolean>;

  // Shopping cart management
  getCartItems(userId?: string, sessionId?: string): Promise<CartItem[]>;
  addToCart(item: Omit<CartItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<CartItem>;
  updateCartItem(id: string, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: string): Promise<boolean>;
  clearCart(userId?: string, sessionId?: string): Promise<boolean>;

  // Shipping address management
  getShippingAddresses(userId: string): Promise<ShippingAddress[]>;
  getShippingAddress(id: string): Promise<ShippingAddress | undefined>;
  createShippingAddress(address: InsertShippingAddress): Promise<ShippingAddress>;
  updateShippingAddress(id: string, address: Partial<InsertShippingAddress>): Promise<ShippingAddress | undefined>;
  deleteShippingAddress(id: string): Promise<boolean>;

  // Order management
  getOrders(userId?: string): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrderByNumber(orderNumber: string): Promise<Order | undefined>;
  getOrderByPaymentIntent(paymentIntentId: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order | undefined>;
  updateOrderStatus(orderId: string, status: string, paymentStatus?: string): Promise<Order | undefined>;

  // Order item management
  getOrderItems(orderId: string): Promise<OrderItem[]>;
  createOrderItem(item: Omit<OrderItem, 'id' | 'createdAt'>): Promise<OrderItem>;

  // Inventory management
  getInventory(productId: string, variantId?: string): Promise<Inventory[]>;
  updateInventory(id: string, quantities: { available?: number; reserved?: number }): Promise<Inventory | undefined>;
  createInventory(inventory: Omit<Inventory, 'id' | 'createdAt' | 'updatedAt'>): Promise<Inventory>;

  // Marketing and Analytics
  // Customer Analytics
  getCustomerAnalytics(userId: string): Promise<CustomerAnalytics | undefined>;
  createCustomerAnalytics(analytics: InsertCustomerAnalytics): Promise<CustomerAnalytics>;
  updateCustomerAnalytics(userId: string, updates: Partial<CustomerAnalytics>): Promise<CustomerAnalytics | undefined>;
  getAllCustomerAnalytics(): Promise<CustomerAnalytics[]>;
  getCustomersBySegment(segment: string, limit?: number): Promise<CustomerAnalytics[]>;
  getCustomersByRiskScore(minRiskScore: number): Promise<CustomerAnalytics[]>;

  // Customer Behavior
  createCustomerBehavior(behavior: InsertCustomerBehavior): Promise<CustomerBehavior>;
  getCustomerBehaviorByUser(userId: string, startDate?: Date | null, limit?: number): Promise<CustomerBehavior[]>;
  getCustomerBehaviorByDateRange(startDate: Date, endDate: Date): Promise<CustomerBehavior[]>;
  getCustomerBehaviorByEvent(eventType: string, startDate?: Date, endDate?: Date): Promise<CustomerBehavior[]>;

  // Email Campaigns
  createEmailCampaign(campaign: InsertEmailCampaign): Promise<EmailCampaign>;
  getEmailCampaign(id: string): Promise<EmailCampaign | undefined>;
  getEmailCampaigns(status?: string): Promise<EmailCampaign[]>;
  updateEmailCampaign(id: string, updates: Partial<EmailCampaign>): Promise<EmailCampaign | undefined>;
  
  // Email Campaign Recipients
  createEmailCampaignRecipient(recipient: Omit<EmailCampaignRecipient, 'id' | 'createdAt'>): Promise<EmailCampaignRecipient>;
  getEmailCampaignRecipients(campaignId: string): Promise<EmailCampaignRecipient[]>;
  updateEmailCampaignRecipient(id: string, updates: Partial<EmailCampaignRecipient>): Promise<EmailCampaignRecipient | undefined>;

  // Loyalty Program
  getLoyaltyProgram(userId: string): Promise<LoyaltyProgram | undefined>;
  createLoyaltyProgram(loyalty: InsertLoyaltyProgram): Promise<LoyaltyProgram>;
  updateLoyaltyProgram(userId: string, updates: Partial<LoyaltyProgram>): Promise<LoyaltyProgram | undefined>;
  getLoyaltyProgramByReferralCode(referralCode: string): Promise<LoyaltyProgram | undefined>;
  
  // Loyalty Transactions
  createLoyaltyTransaction(transaction: InsertLoyaltyTransaction): Promise<LoyaltyTransaction>;
  getLoyaltyTransactions(userId: string, limit?: number): Promise<LoyaltyTransaction[]>;
  getLoyaltyTransactionsByType(userId: string, type: string): Promise<LoyaltyTransaction[]>;

  // Product Reviews
  createProductReview(review: InsertProductReview): Promise<ProductReview>;
  getProductReviews(productId: string, approved?: boolean): Promise<ProductReview[]>;
  getProductReview(id: string): Promise<ProductReview | undefined>;
  updateProductReview(id: string, updates: Partial<ProductReview>): Promise<ProductReview | undefined>;
  getReviewsByUser(userId: string): Promise<ProductReview[]>;

  // Promotional Campaigns
  createPromotionalCampaign(campaign: InsertPromotionalCampaign): Promise<PromotionalCampaign>;
  getPromotionalCampaign(id: string): Promise<PromotionalCampaign | undefined>;
  getPromotionalCampaignByCode(code: string): Promise<PromotionalCampaign | undefined>;
  getActivePromotionalCampaigns(): Promise<PromotionalCampaign[]>;
  updatePromotionalCampaign(id: string, updates: Partial<PromotionalCampaign>): Promise<PromotionalCampaign | undefined>;

  // Social Content
  createSocialContent(content: InsertSocialContent): Promise<SocialContent>;
  getSocialContent(productId?: string, platform?: string, approved?: boolean): Promise<SocialContent[]>;
  updateSocialContent(id: string, updates: Partial<SocialContent>): Promise<SocialContent | undefined>;
  getFeaturedSocialContent(limit?: number): Promise<SocialContent[]>;

  // Helper methods
  getUserById(id: string): Promise<User | undefined>;
  getOrdersByUser(userId: string): Promise<Order[]>;
}

class MemStorage implements IStorage {
  private users: Map<string, User>;
  private newsletterSubscribers: Map<string, NewsletterSubscriber>;

  constructor() {
    this.users = new Map();
    this.newsletterSubscribers = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getNewsletterSubscriber(email: string): Promise<NewsletterSubscriber | undefined> {
    return Array.from(this.newsletterSubscribers.values()).find(
      (subscriber) => subscriber.email === email,
    );
  }

  async createNewsletterSubscriber(insertSubscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber> {
    const id = randomUUID();
    const subscriber: NewsletterSubscriber = {
      ...insertSubscriber,
      id,
      name: insertSubscriber.name || null,
      subscribedAt: new Date(),
    };
    this.newsletterSubscribers.set(id, subscriber);
    return subscriber;
  }

  async getAllNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
    return Array.from(this.newsletterSubscribers.values());
  }

  // E-commerce methods - basic implementations for in-memory fallback
  async getCategories(): Promise<Category[]> { return []; }
  async getCategory(id: string): Promise<Category | undefined> { return undefined; }
  async getCategoryBySlug(slug: string): Promise<Category | undefined> { return undefined; }
  async createCategory(category: InsertCategory): Promise<Category> { throw new Error("Not implemented in MemStorage"); }
  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined> { return undefined; }
  async deleteCategory(id: string): Promise<boolean> { return false; }

  async getProducts(): Promise<Product[]> { return []; }
  async getProduct(id: string): Promise<Product | undefined> { return undefined; }
  async getProductBySlug(slug: string): Promise<Product | undefined> { return undefined; }
  async createProduct(product: InsertProduct): Promise<Product> { throw new Error("Not implemented in MemStorage"); }
  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> { return undefined; }
  async deleteProduct(id: string): Promise<boolean> { return false; }

  async getProductVariants(productId: string): Promise<ProductVariant[]> { return []; }
  async getProductVariant(id: string): Promise<ProductVariant | undefined> { return undefined; }
  async createProductVariant(variant: InsertProductVariant): Promise<ProductVariant> { throw new Error("Not implemented in MemStorage"); }
  async updateProductVariant(id: string, variant: Partial<InsertProductVariant>): Promise<ProductVariant | undefined> { return undefined; }
  async deleteProductVariant(id: string): Promise<boolean> { return false; }

  async getProductImages(productId: string): Promise<ProductImage[]> { return []; }
  async createProductImage(image: Omit<ProductImage, 'id' | 'createdAt'>): Promise<ProductImage> { throw new Error("Not implemented in MemStorage"); }
  async deleteProductImage(id: string): Promise<boolean> { return false; }

  async getCartItems(): Promise<CartItem[]> { return []; }
  async addToCart(item: Omit<CartItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<CartItem> { throw new Error("Not implemented in MemStorage"); }
  async updateCartItem(id: string, quantity: number): Promise<CartItem | undefined> { return undefined; }
  async removeFromCart(id: string): Promise<boolean> { return false; }
  async clearCart(): Promise<boolean> { return false; }

  async getShippingAddresses(userId: string): Promise<ShippingAddress[]> { return []; }
  async getShippingAddress(id: string): Promise<ShippingAddress | undefined> { return undefined; }
  async createShippingAddress(address: InsertShippingAddress): Promise<ShippingAddress> { throw new Error("Not implemented in MemStorage"); }
  async updateShippingAddress(id: string, address: Partial<InsertShippingAddress>): Promise<ShippingAddress | undefined> { return undefined; }
  async deleteShippingAddress(id: string): Promise<boolean> { return false; }

  async getOrders(): Promise<Order[]> { return []; }
  async getOrder(id: string): Promise<Order | undefined> { return undefined; }
  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> { return undefined; }
  async createOrder(order: InsertOrder): Promise<Order> { throw new Error("Not implemented in MemStorage"); }
  async updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order | undefined> { return undefined; }
  async getOrderByPaymentIntent(paymentIntentId: string): Promise<Order | undefined> { return undefined; }
  async updateOrderStatus(orderId: string, status: string, paymentStatus?: string): Promise<Order | undefined> { return undefined; }

  async getOrderItems(orderId: string): Promise<OrderItem[]> { return []; }
  async createOrderItem(item: Omit<OrderItem, 'id' | 'createdAt'>): Promise<OrderItem> { throw new Error("Not implemented in MemStorage"); }

  async getInventory(): Promise<Inventory[]> { return []; }
  async updateInventory(id: string, quantities: { available?: number; reserved?: number }): Promise<Inventory | undefined> { return undefined; }
  async createInventory(inventory: Omit<Inventory, 'id' | 'createdAt' | 'updatedAt'>): Promise<Inventory> { throw new Error("Not implemented in MemStorage"); }

  // Marketing and Analytics stub implementations
  async getCustomerAnalytics(userId: string): Promise<CustomerAnalytics | undefined> { throw new Error("Not implemented in MemStorage"); }
  async createCustomerAnalytics(analytics: InsertCustomerAnalytics): Promise<CustomerAnalytics> { throw new Error("Not implemented in MemStorage"); }
  async updateCustomerAnalytics(userId: string, updates: Partial<CustomerAnalytics>): Promise<CustomerAnalytics | undefined> { throw new Error("Not implemented in MemStorage"); }
  async getAllCustomerAnalytics(): Promise<CustomerAnalytics[]> { throw new Error("Not implemented in MemStorage"); }
  async getCustomersBySegment(segment: string, limit?: number): Promise<CustomerAnalytics[]> { throw new Error("Not implemented in MemStorage"); }
  async getCustomersByRiskScore(minRiskScore: number): Promise<CustomerAnalytics[]> { throw new Error("Not implemented in MemStorage"); }
  async createCustomerBehavior(behavior: InsertCustomerBehavior): Promise<CustomerBehavior> { throw new Error("Not implemented in MemStorage"); }
  async getCustomerBehaviorByUser(userId: string, startDate?: Date | null, limit?: number): Promise<CustomerBehavior[]> { throw new Error("Not implemented in MemStorage"); }
  async getCustomerBehaviorByDateRange(startDate: Date, endDate: Date): Promise<CustomerBehavior[]> { throw new Error("Not implemented in MemStorage"); }
  async getCustomerBehaviorByEvent(eventType: string, startDate?: Date, endDate?: Date): Promise<CustomerBehavior[]> { throw new Error("Not implemented in MemStorage"); }
  async createEmailCampaign(campaign: InsertEmailCampaign): Promise<EmailCampaign> { throw new Error("Not implemented in MemStorage"); }
  async getEmailCampaign(id: string): Promise<EmailCampaign | undefined> { throw new Error("Not implemented in MemStorage"); }
  async getEmailCampaigns(status?: string): Promise<EmailCampaign[]> { throw new Error("Not implemented in MemStorage"); }
  async updateEmailCampaign(id: string, updates: Partial<EmailCampaign>): Promise<EmailCampaign | undefined> { throw new Error("Not implemented in MemStorage"); }
  async createEmailCampaignRecipient(recipient: Omit<EmailCampaignRecipient, 'id' | 'createdAt'>): Promise<EmailCampaignRecipient> { throw new Error("Not implemented in MemStorage"); }
  async getEmailCampaignRecipients(campaignId: string): Promise<EmailCampaignRecipient[]> { throw new Error("Not implemented in MemStorage"); }
  async updateEmailCampaignRecipient(id: string, updates: Partial<EmailCampaignRecipient>): Promise<EmailCampaignRecipient | undefined> { throw new Error("Not implemented in MemStorage"); }
  async getLoyaltyProgram(userId: string): Promise<LoyaltyProgram | undefined> { throw new Error("Not implemented in MemStorage"); }
  async createLoyaltyProgram(loyalty: InsertLoyaltyProgram): Promise<LoyaltyProgram> { throw new Error("Not implemented in MemStorage"); }
  async updateLoyaltyProgram(userId: string, updates: Partial<LoyaltyProgram>): Promise<LoyaltyProgram | undefined> { throw new Error("Not implemented in MemStorage"); }
  async getLoyaltyProgramByReferralCode(referralCode: string): Promise<LoyaltyProgram | undefined> { throw new Error("Not implemented in MemStorage"); }
  async createLoyaltyTransaction(transaction: InsertLoyaltyTransaction): Promise<LoyaltyTransaction> { throw new Error("Not implemented in MemStorage"); }
  async getLoyaltyTransactions(userId: string, limit?: number): Promise<LoyaltyTransaction[]> { throw new Error("Not implemented in MemStorage"); }
  async getLoyaltyTransactionsByType(userId: string, type: string): Promise<LoyaltyTransaction[]> { throw new Error("Not implemented in MemStorage"); }
  async createProductReview(review: InsertProductReview): Promise<ProductReview> { throw new Error("Not implemented in MemStorage"); }
  async getProductReviews(productId: string, approved?: boolean): Promise<ProductReview[]> { throw new Error("Not implemented in MemStorage"); }
  async getProductReview(id: string): Promise<ProductReview | undefined> { throw new Error("Not implemented in MemStorage"); }
  async updateProductReview(id: string, updates: Partial<ProductReview>): Promise<ProductReview | undefined> { throw new Error("Not implemented in MemStorage"); }
  async getReviewsByUser(userId: string): Promise<ProductReview[]> { throw new Error("Not implemented in MemStorage"); }
  async createPromotionalCampaign(campaign: InsertPromotionalCampaign): Promise<PromotionalCampaign> { throw new Error("Not implemented in MemStorage"); }
  async getPromotionalCampaign(id: string): Promise<PromotionalCampaign | undefined> { throw new Error("Not implemented in MemStorage"); }
  async getPromotionalCampaignByCode(code: string): Promise<PromotionalCampaign | undefined> { throw new Error("Not implemented in MemStorage"); }
  async getActivePromotionalCampaigns(): Promise<PromotionalCampaign[]> { throw new Error("Not implemented in MemStorage"); }
  async updatePromotionalCampaign(id: string, updates: Partial<PromotionalCampaign>): Promise<PromotionalCampaign | undefined> { throw new Error("Not implemented in MemStorage"); }
  async createSocialContent(content: InsertSocialContent): Promise<SocialContent> { throw new Error("Not implemented in MemStorage"); }
  async getSocialContent(productId?: string, platform?: string, approved?: boolean): Promise<SocialContent[]> { throw new Error("Not implemented in MemStorage"); }
  async updateSocialContent(id: string, updates: Partial<SocialContent>): Promise<SocialContent | undefined> { throw new Error("Not implemented in MemStorage"); }
  async getFeaturedSocialContent(limit?: number): Promise<SocialContent[]> { throw new Error("Not implemented in MemStorage"); }
  async getUserById(id: string): Promise<User | undefined> { throw new Error("Not implemented in MemStorage"); }
  async getOrdersByUser(userId: string): Promise<Order[]> { throw new Error("Not implemented in MemStorage"); }
}

// PostgreSQL-based storage implementation
export class PostgreSQLStorage implements IStorage {
  // User management
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Newsletter management
  async getNewsletterSubscriber(email: string): Promise<NewsletterSubscriber | undefined> {
    const result = await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.email, email)).limit(1);
    return result[0];
  }

  async createNewsletterSubscriber(insertSubscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber> {
    const result = await db.insert(newsletterSubscribers).values(insertSubscriber).returning();
    return result[0];
  }

  async getAllNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
    return await db.select().from(newsletterSubscribers);
  }

  // Category management
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.displayOrder, categories.name);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
    return result[0];
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
    return result[0];
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(category).returning();
    return result[0];
  }

  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const result = await db.update(categories).set({ ...category, updatedAt: new Date() }).where(eq(categories.id, id)).returning();
    return result[0];
  }

  async deleteCategory(id: string): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return result.rowCount > 0;
  }

  // Product management
  async getProducts(categoryId?: string, featured?: boolean, active?: boolean): Promise<Product[]> {
    let query = db.select().from(products);
    
    const conditions: any[] = [];
    if (categoryId) conditions.push(eq(products.categoryId, categoryId));
    if (featured !== undefined) conditions.push(eq(products.isFeatured, featured));
    if (active !== undefined) conditions.push(eq(products.isActive, active));
    
    if (conditions.length > 0) {
      query = query.where(conditions.length === 1 ? conditions[0] : conditions.reduce((acc, condition) => acc && condition));
    }
    
    return await query;
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
    return result[0];
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(product).returning();
    return result[0];
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const result = await db.update(products).set({ ...product, updatedAt: new Date() }).where(eq(products.id, id)).returning();
    return result[0];
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return result.rowCount > 0;
  }

  // Product variant management
  async getProductVariants(productId: string): Promise<ProductVariant[]> {
    return await db.select().from(productVariants).where(eq(productVariants.productId, productId));
  }

  async getProductVariant(id: string): Promise<ProductVariant | undefined> {
    const result = await db.select().from(productVariants).where(eq(productVariants.id, id)).limit(1);
    return result[0];
  }

  async createProductVariant(variant: InsertProductVariant): Promise<ProductVariant> {
    const result = await db.insert(productVariants).values(variant).returning();
    return result[0];
  }

  async updateProductVariant(id: string, variant: Partial<InsertProductVariant>): Promise<ProductVariant | undefined> {
    const result = await db.update(productVariants).set({ ...variant, updatedAt: new Date() }).where(eq(productVariants.id, id)).returning();
    return result[0];
  }

  async deleteProductVariant(id: string): Promise<boolean> {
    const result = await db.delete(productVariants).where(eq(productVariants.id, id));
    return result.rowCount > 0;
  }

  // Product image management
  async getProductImages(productId: string): Promise<ProductImage[]> {
    return await db.select().from(productImages).where(eq(productImages.productId, productId)).orderBy(productImages.displayOrder);
  }

  async createProductImage(image: Omit<ProductImage, 'id' | 'createdAt'>): Promise<ProductImage> {
    const result = await db.insert(productImages).values(image).returning();
    return result[0];
  }

  async deleteProductImage(id: string): Promise<boolean> {
    const result = await db.delete(productImages).where(eq(productImages.id, id));
    return result.rowCount > 0;
  }

  // Shopping cart management
  async getCartItems(userId?: string, sessionId?: string): Promise<CartItem[]> {
    if (userId) {
      return await db.select().from(cartItems).where(eq(cartItems.userId, userId));
    } else if (sessionId) {
      return await db.select().from(cartItems).where(eq(cartItems.sessionId, sessionId));
    }
    return [];
  }

  async addToCart(item: Omit<CartItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<CartItem> {
    const result = await db.insert(cartItems).values(item).returning();
    return result[0];
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem | undefined> {
    const result = await db.update(cartItems).set({ quantity, updatedAt: new Date() }).where(eq(cartItems.id, id)).returning();
    return result[0];
  }

  async removeFromCart(id: string): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.id, id));
    return result.rowCount > 0;
  }

  async clearCart(userId?: string, sessionId?: string): Promise<boolean> {
    if (userId) {
      const result = await db.delete(cartItems).where(eq(cartItems.userId, userId));
      return result.rowCount > 0;
    } else if (sessionId) {
      const result = await db.delete(cartItems).where(eq(cartItems.sessionId, sessionId));
      return result.rowCount > 0;
    }
    return false;
  }

  // Shipping address management
  async getShippingAddresses(userId: string): Promise<ShippingAddress[]> {
    return await db.select().from(shippingAddresses).where(eq(shippingAddresses.userId, userId));
  }

  async getShippingAddress(id: string): Promise<ShippingAddress | undefined> {
    const result = await db.select().from(shippingAddresses).where(eq(shippingAddresses.id, id)).limit(1);
    return result[0];
  }

  async createShippingAddress(address: InsertShippingAddress): Promise<ShippingAddress> {
    const result = await db.insert(shippingAddresses).values(address).returning();
    return result[0];
  }

  async updateShippingAddress(id: string, address: Partial<InsertShippingAddress>): Promise<ShippingAddress | undefined> {
    const result = await db.update(shippingAddresses).set(address).where(eq(shippingAddresses.id, id)).returning();
    return result[0];
  }

  async deleteShippingAddress(id: string): Promise<boolean> {
    const result = await db.delete(shippingAddresses).where(eq(shippingAddresses.id, id));
    return result.rowCount > 0;
  }

  // Order management
  async getOrders(userId?: string): Promise<Order[]> {
    if (userId) {
      return await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(orders.createdAt);
    }
    return await db.select().from(orders).orderBy(orders.createdAt);
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return result[0];
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
    return result[0];
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const result = await db.insert(orders).values(order).returning();
    return result[0];
  }

  async updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order | undefined> {
    const result = await db.update(orders).set({ ...order, updatedAt: new Date() }).where(eq(orders.id, id)).returning();
    return result[0];
  }
  async getOrderByPaymentIntent(paymentIntentId: string): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.paymentIntentId, paymentIntentId)).limit(1);
    return result[0];
  }
  async updateOrderStatus(orderId: string, status: string, paymentStatus?: string): Promise<Order | undefined> {
    const updateData: Partial<InsertOrder> = { status, updatedAt: new Date() };
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }
    const result = await db.update(orders).set(updateData).where(eq(orders.id, orderId)).returning();
    return result[0];
  }

  // Order item management
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(item: Omit<OrderItem, 'id' | 'createdAt'>): Promise<OrderItem> {
    const result = await db.insert(orderItems).values(item).returning();
    return result[0];
  }

  // Inventory management
  async getInventory(productId: string, variantId?: string): Promise<Inventory[]> {
    if (variantId) {
      return await db.select().from(inventory).where(eq(inventory.productId, productId) && eq(inventory.variantId, variantId));
    }
    return await db.select().from(inventory).where(eq(inventory.productId, productId));
  }

  async updateInventory(id: string, quantities: { available?: number; reserved?: number }): Promise<Inventory | undefined> {
    const updateData: any = { updatedAt: new Date() };
    if (quantities.available !== undefined) updateData.quantityAvailable = quantities.available;
    if (quantities.reserved !== undefined) updateData.quantityReserved = quantities.reserved;
    
    const result = await db.update(inventory).set(updateData).where(eq(inventory.id, id)).returning();
    return result[0];
  }

  async createInventory(inventoryData: Omit<Inventory, 'id' | 'createdAt' | 'updatedAt'>): Promise<Inventory> {
    const result = await db.insert(inventory).values(inventoryData).returning();
    return result[0];
  }

  // =======================
  // MARKETING & ANALYTICS METHODS
  // =======================

  // Customer Analytics
  async getCustomerAnalytics(userId: string): Promise<CustomerAnalytics | undefined> {
    const result = await db.select().from(customerAnalytics).where(eq(customerAnalytics.userId, userId));
    return result[0];
  }

  async createCustomerAnalytics(analytics: InsertCustomerAnalytics): Promise<CustomerAnalytics> {
    const result = await db.insert(customerAnalytics).values(analytics).returning();
    return result[0];
  }

  async updateCustomerAnalytics(userId: string, updates: Partial<CustomerAnalytics>): Promise<CustomerAnalytics | undefined> {
    const updateData = { ...updates, updatedAt: new Date() };
    const result = await db.update(customerAnalytics)
      .set(updateData)
      .where(eq(customerAnalytics.userId, userId))
      .returning();
    return result[0];
  }

  async getAllCustomerAnalytics(): Promise<CustomerAnalytics[]> {
    return await db.select().from(customerAnalytics);
  }

  async getCustomersBySegment(segment: string, limit: number = 100): Promise<CustomerAnalytics[]> {
    return await db.select().from(customerAnalytics)
      .where(eq(customerAnalytics.customerSegment, segment))
      .limit(limit);
  }

  async getCustomersByRiskScore(minRiskScore: number): Promise<CustomerAnalytics[]> {
    return await db.select().from(customerAnalytics)
      .where(gte(customerAnalytics.riskScore, minRiskScore))
      .orderBy(desc(customerAnalytics.riskScore));
  }

  // Customer Behavior
  async createCustomerBehavior(behavior: InsertCustomerBehavior): Promise<CustomerBehavior> {
    const result = await db.insert(customerBehavior).values(behavior).returning();
    return result[0];
  }

  async getCustomerBehaviorByUser(userId: string, startDate?: Date | null, limit?: number): Promise<CustomerBehavior[]> {
    let query = db.select().from(customerBehavior).where(eq(customerBehavior.userId, userId));
    
    if (startDate) {
      query = query.where(and(eq(customerBehavior.userId, userId), gte(customerBehavior.timestamp, startDate)));
    }
    
    query = query.orderBy(desc(customerBehavior.timestamp));
    
    if (limit) {
      query = query.limit(limit);
    }
    
    return await query;
  }

  async getCustomerBehaviorByDateRange(startDate: Date, endDate: Date): Promise<CustomerBehavior[]> {
    return await db.select().from(customerBehavior)
      .where(and(gte(customerBehavior.timestamp, startDate), lte(customerBehavior.timestamp, endDate)))
      .orderBy(desc(customerBehavior.timestamp));
  }

  async getCustomerBehaviorByEvent(eventType: string, startDate?: Date, endDate?: Date): Promise<CustomerBehavior[]> {
    let conditions = [eq(customerBehavior.eventType, eventType)];
    
    if (startDate) conditions.push(gte(customerBehavior.timestamp, startDate));
    if (endDate) conditions.push(lte(customerBehavior.timestamp, endDate));
    
    return await db.select().from(customerBehavior)
      .where(and(...conditions))
      .orderBy(desc(customerBehavior.timestamp));
  }

  // Email Campaigns
  async createEmailCampaign(campaign: InsertEmailCampaign): Promise<EmailCampaign> {
    const result = await db.insert(emailCampaigns).values(campaign).returning();
    return result[0];
  }

  async getEmailCampaign(id: string): Promise<EmailCampaign | undefined> {
    const result = await db.select().from(emailCampaigns).where(eq(emailCampaigns.id, id));
    return result[0];
  }

  async getEmailCampaigns(status?: string): Promise<EmailCampaign[]> {
    if (status) {
      return await db.select().from(emailCampaigns).where(eq(emailCampaigns.status, status));
    }
    return await db.select().from(emailCampaigns).orderBy(desc(emailCampaigns.createdAt));
  }

  async updateEmailCampaign(id: string, updates: Partial<EmailCampaign>): Promise<EmailCampaign | undefined> {
    const updateData = { ...updates, updatedAt: new Date() };
    const result = await db.update(emailCampaigns)
      .set(updateData)
      .where(eq(emailCampaigns.id, id))
      .returning();
    return result[0];
  }

  // Email Campaign Recipients
  async createEmailCampaignRecipient(recipient: Omit<EmailCampaignRecipient, 'id' | 'createdAt'>): Promise<EmailCampaignRecipient> {
    const result = await db.insert(emailCampaignRecipients).values(recipient).returning();
    return result[0];
  }

  async getEmailCampaignRecipients(campaignId: string): Promise<EmailCampaignRecipient[]> {
    return await db.select().from(emailCampaignRecipients).where(eq(emailCampaignRecipients.campaignId, campaignId));
  }

  async updateEmailCampaignRecipient(id: string, updates: Partial<EmailCampaignRecipient>): Promise<EmailCampaignRecipient | undefined> {
    const result = await db.update(emailCampaignRecipients)
      .set(updates)
      .where(eq(emailCampaignRecipients.id, id))
      .returning();
    return result[0];
  }

  // Loyalty Program
  async getLoyaltyProgram(userId: string): Promise<LoyaltyProgram | undefined> {
    const result = await db.select().from(loyaltyProgram).where(eq(loyaltyProgram.userId, userId));
    return result[0];
  }

  async createLoyaltyProgram(loyalty: InsertLoyaltyProgram): Promise<LoyaltyProgram> {
    const result = await db.insert(loyaltyProgram).values(loyalty).returning();
    return result[0];
  }

  async updateLoyaltyProgram(userId: string, updates: Partial<LoyaltyProgram>): Promise<LoyaltyProgram | undefined> {
    const updateData = { ...updates, updatedAt: new Date() };
    const result = await db.update(loyaltyProgram)
      .set(updateData)
      .where(eq(loyaltyProgram.userId, userId))
      .returning();
    return result[0];
  }

  async getLoyaltyProgramByReferralCode(referralCode: string): Promise<LoyaltyProgram | undefined> {
    const result = await db.select().from(loyaltyProgram).where(eq(loyaltyProgram.referralCode, referralCode));
    return result[0];
  }

  // Loyalty Transactions
  async createLoyaltyTransaction(transaction: InsertLoyaltyTransaction): Promise<LoyaltyTransaction> {
    const result = await db.insert(loyaltyTransactions).values(transaction).returning();
    return result[0];
  }

  async getLoyaltyTransactions(userId: string, limit: number = 50): Promise<LoyaltyTransaction[]> {
    return await db.select().from(loyaltyTransactions)
      .where(eq(loyaltyTransactions.userId, userId))
      .orderBy(desc(loyaltyTransactions.createdAt))
      .limit(limit);
  }

  async getLoyaltyTransactionsByType(userId: string, type: string): Promise<LoyaltyTransaction[]> {
    return await db.select().from(loyaltyTransactions)
      .where(and(eq(loyaltyTransactions.userId, userId), eq(loyaltyTransactions.type, type)))
      .orderBy(desc(loyaltyTransactions.createdAt));
  }

  // Product Reviews
  async createProductReview(review: InsertProductReview): Promise<ProductReview> {
    const result = await db.insert(productReviews).values(review).returning();
    return result[0];
  }

  async getProductReviews(productId: string, approved?: boolean): Promise<ProductReview[]> {
    let conditions = [eq(productReviews.productId, productId)];
    if (approved !== undefined) {
      conditions.push(eq(productReviews.isApproved, approved));
    }
    
    return await db.select().from(productReviews)
      .where(and(...conditions))
      .orderBy(desc(productReviews.createdAt));
  }

  async getProductReview(id: string): Promise<ProductReview | undefined> {
    const result = await db.select().from(productReviews).where(eq(productReviews.id, id));
    return result[0];
  }

  async updateProductReview(id: string, updates: Partial<ProductReview>): Promise<ProductReview | undefined> {
    const updateData = { ...updates, updatedAt: new Date() };
    const result = await db.update(productReviews)
      .set(updateData)
      .where(eq(productReviews.id, id))
      .returning();
    return result[0];
  }

  async getReviewsByUser(userId: string): Promise<ProductReview[]> {
    return await db.select().from(productReviews)
      .where(eq(productReviews.userId, userId))
      .orderBy(desc(productReviews.createdAt));
  }

  // Promotional Campaigns
  async createPromotionalCampaign(campaign: InsertPromotionalCampaign): Promise<PromotionalCampaign> {
    const campaignData = {
      ...campaign,
      applicableProducts: campaign.applicableProducts || [],
      applicableCategories: campaign.applicableCategories || [],
      customerSegments: campaign.customerSegments || [],
    };
    const result = await db.insert(promotionalCampaigns).values(campaignData).returning();
    return result[0];
  }

  async getPromotionalCampaign(id: string): Promise<PromotionalCampaign | undefined> {
    const result = await db.select().from(promotionalCampaigns).where(eq(promotionalCampaigns.id, id));
    return result[0];
  }

  async getPromotionalCampaignByCode(code: string): Promise<PromotionalCampaign | undefined> {
    const result = await db.select().from(promotionalCampaigns).where(eq(promotionalCampaigns.code, code));
    return result[0];
  }

  async getActivePromotionalCampaigns(): Promise<PromotionalCampaign[]> {
    const now = new Date();
    return await db.select().from(promotionalCampaigns)
      .where(
        and(
          eq(promotionalCampaigns.isActive, true),
          lte(promotionalCampaigns.startDate, now),
          sql`(${promotionalCampaigns.endDate} IS NULL OR ${promotionalCampaigns.endDate} > ${now})`
        )
      )
      .orderBy(desc(promotionalCampaigns.startDate));
  }

  async updatePromotionalCampaign(id: string, updates: Partial<PromotionalCampaign>): Promise<PromotionalCampaign | undefined> {
    const updateData = { ...updates, updatedAt: new Date() };
    const result = await db.update(promotionalCampaigns)
      .set(updateData)
      .where(eq(promotionalCampaigns.id, id))
      .returning();
    return result[0];
  }

  // Social Content
  async createSocialContent(content: InsertSocialContent): Promise<SocialContent> {
    const result = await db.insert(socialContent).values(content).returning();
    return result[0];
  }

  async getSocialContent(productId?: string, platform?: string, approved?: boolean): Promise<SocialContent[]> {
    let conditions: any[] = [];
    
    if (productId) conditions.push(eq(socialContent.productId, productId));
    if (platform) conditions.push(eq(socialContent.platform, platform));
    if (approved !== undefined) conditions.push(eq(socialContent.isApproved, approved));
    
    const baseQuery = db.select().from(socialContent);
    const filteredQuery = conditions.length > 0 
      ? baseQuery.where(and(...conditions))
      : baseQuery;
    
    return await filteredQuery.orderBy(desc(socialContent.createdAt));
  }

  async updateSocialContent(id: string, updates: Partial<SocialContent>): Promise<SocialContent | undefined> {
    const updateData = { ...updates, updatedAt: new Date() };
    const result = await db.update(socialContent)
      .set(updateData)
      .where(eq(socialContent.id, id))
      .returning();
    return result[0];
  }

  async getFeaturedSocialContent(limit: number = 10): Promise<SocialContent[]> {
    return await db.select().from(socialContent)
      .where(and(eq(socialContent.isFeatured, true), eq(socialContent.isApproved, true)))
      .orderBy(desc(socialContent.createdAt))
      .limit(limit);
  }

  // Helper methods
  async getUserById(id: string): Promise<User | undefined> {
    return await this.getUser(id);
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    return await db.select().from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }
}

// Use PostgreSQL storage if DATABASE_URL is provided, otherwise fallback to in-memory
export const storage: IStorage = process.env.DATABASE_URL 
  ? new PostgreSQLStorage() 
  : new MemStorage();

// Keep the MemStorage class for fallback/testing
export { MemStorage };
