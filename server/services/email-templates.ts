import emailService, { EmailOptions } from './email';
import { storage } from '../storage';

// Import email templates
import OrderConfirmationEmail from '../templates/emails/order-confirmation';
import PaymentConfirmationEmail from '../templates/emails/payment-confirmation';
import ShippingNotificationEmail from '../templates/emails/shipping-notification';
import AdminNewOrderEmail from '../templates/emails/admin-new-order';

// Template data interfaces
export interface OrderEmailData {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  orderDate: string;
  items: Array<{
    id: string;
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    imageUrl?: string;
    variantName?: string;
  }>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  trackingUrl?: string;
  estimatedDelivery?: string;
}

export interface PaymentEmailData {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  paymentAmount: number;
  paymentMethod: string;
  lastFourDigits?: string;
  transactionId: string;
  paymentDate: string;
}

export interface ShippingEmailData {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  trackingNumber: string;
  trackingUrl?: string;
  carrier: string;
  estimatedDelivery: string;
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  shippedItems?: Array<{
    name: string;
    quantity: number;
    imageUrl?: string;
  }>;
}

export interface AdminOrderEmailData {
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  orderTotal: number;
  itemCount: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    variantName?: string;
  }>;
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  priority: 'normal' | 'high' | 'express';
  specialInstructions?: string;
}

class EmailTemplateService {
  
  /**
   * Send order confirmation email to customer
   */
  async sendOrderConfirmation(data: OrderEmailData): Promise<void> {
    try {
      const emailOptions: EmailOptions = {
        to: data.customerEmail,
        subject: `Order Confirmation - ${data.orderNumber} | Panickin' Skywalker`,
        template: {
          component: OrderConfirmationEmail,
          props: data
        },
        tracking: {
          openTracking: true,
          clickTracking: true
        }
      };

      const result = await emailService.sendEmail(emailOptions);
      
      if (!result.success) {
        console.error('Failed to send order confirmation email:', result.error);
      } else {
        console.log(`✅ Order confirmation email sent to ${data.customerEmail}`);
      }
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
      throw error;
    }
  }

  /**
   * Send payment confirmation email to customer
   */
  async sendPaymentConfirmation(data: PaymentEmailData): Promise<void> {
    try {
      const emailOptions: EmailOptions = {
        to: data.customerEmail,
        subject: `Payment Confirmed - Order ${data.orderNumber} | Panickin' Skywalker`,
        template: {
          component: PaymentConfirmationEmail,
          props: data
        },
        tracking: {
          openTracking: true,
          clickTracking: true
        }
      };

      const result = await emailService.sendEmail(emailOptions);
      
      if (!result.success) {
        console.error('Failed to send payment confirmation email:', result.error);
      } else {
        console.log(`✅ Payment confirmation email sent to ${data.customerEmail}`);
      }
    } catch (error) {
      console.error('Error sending payment confirmation email:', error);
      throw error;
    }
  }

  /**
   * Send shipping notification email to customer
   */
  async sendShippingNotification(data: ShippingEmailData): Promise<void> {
    try {
      const emailOptions: EmailOptions = {
        to: data.customerEmail,
        subject: `Your Order Has Shipped! 📦 Order ${data.orderNumber} | Panickin' Skywalker`,
        template: {
          component: ShippingNotificationEmail,
          props: data
        },
        tracking: {
          openTracking: true,
          clickTracking: true
        }
      };

      const result = await emailService.sendEmail(emailOptions);
      
      if (!result.success) {
        console.error('Failed to send shipping notification email:', result.error);
      } else {
        console.log(`✅ Shipping notification email sent to ${data.customerEmail}`);
      }
    } catch (error) {
      console.error('Error sending shipping notification email:', error);
      throw error;
    }
  }

  /**
   * Send new order notification to admin
   */
  async sendAdminNewOrderNotification(data: AdminOrderEmailData): Promise<void> {
    try {
      const priority = data.priority === 'high' ? 'high' : data.priority === 'express' ? 'high' : 'normal';
      const subjectPrefix = priority === 'high' ? '[URGENT] ' : '';
      
      const emailOptions: EmailOptions = {
        to: process.env.ADMIN_EMAIL || 'admin@panickinskywalker.com',
        subject: `${subjectPrefix}New Order ${data.orderNumber} - $${data.orderTotal.toFixed(2)}`,
        template: {
          component: AdminNewOrderEmail,
          props: data
        },
        tracking: {
          openTracking: false,
          clickTracking: true
        }
      };

      const result = await emailService.sendAdminNotification(
        `New Order ${data.orderNumber} - $${data.orderTotal.toFixed(2)}`,
        '', // HTML will be generated from template
        priority as 'low' | 'normal' | 'high'
      );
      
      if (!result.success) {
        console.error('Failed to send admin new order notification:', result.error);
      } else {
        console.log(`✅ Admin new order notification sent for order ${data.orderNumber}`);
      }
    } catch (error) {
      console.error('Error sending admin new order notification:', error);
      throw error;
    }
  }

  /**
   * Send payment failure notification to customer
   */
  async sendPaymentFailureNotification(orderNumber: string, customerEmail: string, customerName: string, reason?: string): Promise<void> {
    try {
      const subject = `Payment Issue - Order ${orderNumber} | Panickin' Skywalker`;
      const html = this.generatePaymentFailureHTML(orderNumber, customerName, reason);

      const emailOptions: EmailOptions = {
        to: customerEmail,
        subject,
        html,
        tracking: {
          openTracking: true,
          clickTracking: true
        }
      };

      const result = await emailService.sendEmail(emailOptions);
      
      if (!result.success) {
        console.error('Failed to send payment failure notification:', result.error);
      } else {
        console.log(`✅ Payment failure notification sent to ${customerEmail}`);
      }
    } catch (error) {
      console.error('Error sending payment failure notification:', error);
      throw error;
    }
  }

  /**
   * Send order status update email to customer
   */
  async sendOrderStatusUpdate(orderNumber: string, status: string, customerEmail: string, customerName: string, additionalInfo?: string): Promise<void> {
    try {
      const statusMessages = {
        confirmed: 'Your order has been confirmed and is being prepared! 📦',
        processing: 'Great news! Your order is now being processed by our superhero team! ⚡',
        shipped: 'Your order is on its way to you! 🚚',
        delivered: 'Your order has been delivered! We hope you love your new gear! 🎉',
        cancelled: 'Your order has been cancelled. Don\t panic - we\'re here to help! 😔'
      };

      const subject = `Order Update - ${orderNumber} | Panickin' Skywalker`;
      const message = statusMessages[status as keyof typeof statusMessages] || `Your order status has been updated to: ${status}`;
      
      const html = this.generateStatusUpdateHTML(orderNumber, customerName, status, message, additionalInfo);

      const emailOptions: EmailOptions = {
        to: customerEmail,
        subject,
        html,
        tracking: {
          openTracking: true,
          clickTracking: true
        }
      };

      const result = await emailService.sendEmail(emailOptions);
      
      if (!result.success) {
        console.error('Failed to send order status update:', result.error);
      } else {
        console.log(`✅ Order status update sent to ${customerEmail}`);
      }
    } catch (error) {
      console.error('Error sending order status update:', error);
      throw error;
    }
  }

  /**
   * Get order data from database and format for email templates
   */
  async getOrderEmailData(orderNumber: string): Promise<OrderEmailData | null> {
    try {
      const order = await storage.getOrderByNumber(orderNumber);
      if (!order) {
        console.error(`Order not found: ${orderNumber}`);
        return null;
      }

      const orderItems = await storage.getOrderItems(order.id);
      let customer = null;
      if (order.userId) {
        customer = await storage.getUserById(order.userId);
      }

      // Format items for email template
      const items = await Promise.all(orderItems.map(async (item) => {
        const product = await storage.getProduct(item.productId);
        let variant = null;
        
        if (item.variantId) {
          variant = await storage.getProductVariant(item.variantId);
        }

        return {
          id: item.id,
          name: product?.name || 'Unknown Product',
          description: product?.description,
          quantity: item.quantity,
          unitPrice: parseFloat(item.unitPrice.toString()),
          totalPrice: parseFloat(item.totalPrice.toString()),
          imageUrl: undefined, // Product images would need separate query
          variantName: variant?.name
        };
      }));

      // Get shipping address
      const shippingAddress = await storage.getShippingAddress(order.shippingAddressId);
      
      return {
        customerName: customer?.name || order.customerName || order.customerEmail,
        customerEmail: customer?.email || order.customerEmail,
        orderNumber: order.orderNumber,
        orderDate: order.createdAt.toISOString(),
        items,
        subtotal: parseFloat(order.subtotal.toString()),
        shipping: parseFloat(order.shippingAmount.toString()),
        tax: parseFloat(order.taxAmount.toString()),
        total: parseFloat(order.totalAmount.toString()),
        shippingAddress: shippingAddress ? {
          name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
          line1: shippingAddress.addressLine1,
          line2: shippingAddress.addressLine2 || undefined,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country
        } : {
          name: order.customerName,
          line1: 'Address not available',
          city: 'Unknown',
          state: 'Unknown',
          postalCode: '00000',
          country: 'US'
        },
        trackingUrl: undefined, // Would need tracking number field
        estimatedDelivery: undefined // Would need estimated delivery field
      };
    } catch (error) {
      console.error('Error getting order email data:', error);
      return null;
    }
  }

  /**
   * Generate simple HTML for payment failure notification
   */
  private generatePaymentFailureHTML(orderNumber: string, customerName: string, reason?: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; background: #fef2f2; padding: 30px; border-radius: 8px; border: 2px solid #ef4444; margin-bottom: 30px;">
          <h1 style="color: #991b1b; margin-bottom: 10px;">⚠️ Payment Issue</h1>
          <h2 style="color: #991b1b; font-size: 24px;">Don't Panic, ${customerName}!</h2>
          <p style="color: #991b1b; font-size: 18px;">We had a small hiccup processing your payment for order ${orderNumber}.</p>
        </div>
        
        <div style="background: #fef3c7; padding: 25px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 30px;">
          <h3 style="color: #92400e; margin-top: 0;">What happened?</h3>
          <p style="color: #92400e;">${reason || 'Your payment could not be processed at this time. This could be due to insufficient funds, an expired card, or a temporary issue with your payment method.'}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.BASE_URL || 'https://panickinskywalker.com'}/account/orders/${orderNumber}" 
             style="background: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
            💳 Retry Payment
          </a>
        </div>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; text-align: center;">
          <p style="color: #0c4a6e; margin: 0;">Need help? Our anxious but helpful support team is here for you!</p>
          <p style="color: #0c4a6e; margin: 10px 0 0 0;">
            Email: <a href="mailto:support@panickinskywalker.com" style="color: #0c4a6e;">support@panickinskywalker.com</a>
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Generate simple HTML for status updates
   */
  private generateStatusUpdateHTML(orderNumber: string, customerName: string, status: string, message: string, additionalInfo?: string): string {
    const statusColors = {
      confirmed: '#059669',
      processing: '#f59e0b', 
      shipped: '#3b82f6',
      delivered: '#10b981',
      cancelled: '#ef4444'
    };

    const statusColor = statusColors[status as keyof typeof statusColors] || '#64748b';

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; background: #f8fafc; padding: 30px; border-radius: 8px; border-left: 4px solid ${statusColor}; margin-bottom: 30px;">
          <h1 style="color: ${statusColor}; margin-bottom: 10px;">Order Update</h1>
          <h2 style="color: #1e293b; font-size: 24px;">Hi ${customerName}!</h2>
          <p style="color: #475569; font-size: 18px;">${message}</p>
        </div>
        
        <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="color: #1e293b; margin-top: 0;">Order #${orderNumber}</h3>
          <p style="color: #475569; margin: 5px 0;"><strong>Status:</strong> ${status.charAt(0).toUpperCase() + status.slice(1)}</p>
          ${additionalInfo ? `<p style="color: #475569; margin: 10px 0 0 0;">${additionalInfo}</p>` : ''}
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.BASE_URL || 'https://panickinskywalker.com'}/track/${orderNumber}" 
             style="background: ${statusColor}; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-right: 10px; display: inline-block;">
            🔍 Track Order
          </a>
          <a href="${process.env.BASE_URL || 'https://panickinskywalker.com'}/account/orders/${orderNumber}" 
             style="background: #64748b; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
            📋 View Details
          </a>
        </div>
        
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; text-align: center;">
          <p style="color: #92400e; margin: 0;">Thanks for being an awesome fan!</p>
          <p style="color: #92400e; margin: 10px 0 0 0;">
            <strong>The Panickin' Skywalker Team</strong> 🦸‍♂️🎸
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Test email sending functionality
   */
  async testEmailSystem(): Promise<boolean> {
    try {
      console.log('🧪 Testing email system...');
      
      const testResult = await emailService.testConnection();
      if (!testResult) {
        console.error('❌ Email connection test failed');
        return false;
      }

      // Send a test email
      const testEmail: EmailOptions = {
        to: process.env.ADMIN_EMAIL || 'admin@panickinskywalker.com',
        subject: '[TEST] Email System Check - Panickin\' Skywalker',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #3b82f6;">🧪 Email System Test</h1>
            <p>This is a test email from the Panickin' Skywalker email system.</p>
            <p><strong>Time:</strong> ${new Date().toISOString()}</p>
            <p><strong>Status:</strong> Email system is working correctly! ✅</p>
            <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
              This email was sent automatically to verify the email system is functioning.
            </p>
          </div>
        `
      };

      const result = await emailService.sendEmail(testEmail);
      
      if (result.success) {
        console.log('✅ Email system test passed');
        return true;
      } else {
        console.error('❌ Email system test failed:', result.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Email system test error:', error);
      return false;
    }
  }
}

// Create singleton instance
const emailTemplateService = new EmailTemplateService();

export default emailTemplateService;