import Stripe from 'stripe';
// Import cart item types from shared schema if needed
// import type { CartItem } from '../types/cart';

// Initialize Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27.basil',
  typescript: true,
});

// Stripe service interface
export interface CreatePaymentIntentData {
  amount: number;
  currency: string;
  orderItems: Array<{
    productId: string;
    variantId: string;
    quantity: number;
  }>;
  customerInfo: {
    email: string;
    name: string;
  };
  metadata?: { [key: string]: string };
}

export interface CreateCustomerData {
  email: string;
  name: string;
  phone?: string;
}

export interface UpdatePaymentIntentData {
  amount?: number;
  currency?: string;
  metadata?: { [key: string]: string };
}

/**
 * Stripe Service - Handles all Stripe operations
 */
class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = stripe;
  }

  /**
   * Create a payment intent
   */
  async createPaymentIntent(data: CreatePaymentIntentData): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(data.amount * 100), // Convert to cents
        currency: data.currency.toLowerCase(),
        metadata: {
          customerEmail: data.customerInfo.email,
          customerName: data.customerInfo.name,
          itemCount: data.orderItems.reduce((total, item) => total + item.quantity, 0).toString(),
          ...data.metadata,
        },
        automatic_payment_methods: {
          enabled: true,
        },
        receipt_email: data.customerInfo.email,
      });

      return paymentIntent;
    } catch (error) {
      console.error('Failed to create payment intent:', error);
      throw new Error('Payment intent creation failed');
    }
  }

  /**
   * Retrieve a payment intent
   */
  async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      console.error('Failed to retrieve payment intent:', error);
      throw new Error('Payment intent retrieval failed');
    }
  }

  /**
   * Update a payment intent
   */
  async updatePaymentIntent(
    paymentIntentId: string, 
    data: UpdatePaymentIntentData
  ): Promise<Stripe.PaymentIntent> {
    try {
      const updateData: Stripe.PaymentIntentUpdateParams = {};
      
      if (data.amount) {
        updateData.amount = Math.round(data.amount * 100);
      }
      
      if (data.currency) {
        updateData.currency = data.currency.toLowerCase();
      }
      
      if (data.metadata) {
        updateData.metadata = data.metadata;
      }

      return await this.stripe.paymentIntents.update(paymentIntentId, updateData);
    } catch (error) {
      console.error('Failed to update payment intent:', error);
      throw new Error('Payment intent update failed');
    }
  }

  /**
   * Confirm a payment intent
   */
  async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethod?: string
  ): Promise<Stripe.PaymentIntent> {
    try {
      const params: Stripe.PaymentIntentConfirmParams = {};
      
      if (paymentMethod) {
        params.payment_method = paymentMethod;
      }

      return await this.stripe.paymentIntents.confirm(paymentIntentId, params);
    } catch (error) {
      console.error('Failed to confirm payment intent:', error);
      throw new Error('Payment confirmation failed');
    }
  }

  /**
   * Create a customer
   */
  async createCustomer(data: CreateCustomerData): Promise<Stripe.Customer> {
    try {
      return await this.stripe.customers.create({
        email: data.email,
        name: data.name,
        phone: data.phone,
        metadata: {
          source: 'panickin_skywalker_merch',
        },
      });
    } catch (error) {
      console.error('Failed to create customer:', error);
      throw new Error('Customer creation failed');
    }
  }

  /**
   * Retrieve a customer by email
   */
  async getCustomerByEmail(email: string): Promise<Stripe.Customer | null> {
    try {
      const customers = await this.stripe.customers.list({
        email: email,
        limit: 1,
      });

      return customers.data.length > 0 ? customers.data[0] : null;
    } catch (error) {
      console.error('Failed to retrieve customer:', error);
      return null;
    }
  }

  /**
   * Create a refund
   */
  async createRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: Stripe.RefundCreateParams.Reason
  ): Promise<Stripe.Refund> {
    try {
      const refundData: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
        reason: reason || 'requested_by_customer',
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100);
      }

      return await this.stripe.refunds.create(refundData);
    } catch (error) {
      console.error('Failed to create refund:', error);
      throw new Error('Refund creation failed');
    }
  }

  /**
   * Construct webhook event
   */
  constructWebhookEvent(
    payload: string | Buffer,
    signature: string,
    secret: string
  ): Stripe.Event {
    try {
      return this.stripe.webhooks.constructEvent(payload, signature, secret);
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      throw new Error('Invalid webhook signature');
    }
  }

  /**
   * Calculate application fee (if needed for marketplace)
   */
  calculateApplicationFee(amount: number, feePercentage: number = 0.029): number {
    return Math.round(amount * feePercentage * 100); // Convert to cents
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number, currency: string = 'usd'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  }

  /**
   * Validate webhook signature
   */
  isValidWebhookSignature(payload: string | Buffer, signature: string): boolean {
    try {
      const secret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!secret) {
        console.error('STRIPE_WEBHOOK_SECRET not configured');
        return false;
      }

      this.constructWebhookEvent(payload, signature, secret);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get publishable key (for frontend)
   */
  getPublishableKey(): string {
    return process.env.STRIPE_PUBLISHABLE_KEY || '';
  }

  /**
   * Health check - verify Stripe connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.stripe.balance.retrieve();
      return true;
    } catch (error) {
      console.error('Stripe health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const stripeService = new StripeService();
export default stripeService;