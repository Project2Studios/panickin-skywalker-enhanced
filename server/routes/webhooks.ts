import { Router } from "express";
import { storage } from "../storage";
import stripeService from "../services/stripe";
import emailTemplateService from "../services/email-templates";
import type { Request, Response } from "express";
import Stripe from "stripe";

const router = Router();

// Raw body parser middleware for Stripe webhook
router.use('/stripe', (req: Request, res: Response, next) => {
  let data = '';
  req.setEncoding('utf8');
  req.on('data', (chunk) => {
    data += chunk;
  });
  req.on('end', () => {
    req.body = data;
    next();
  });
});

/**
 * Stripe webhook endpoint
 * Handles payment events from Stripe
 */
router.post("/stripe", async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;
  
  if (!signature) {
    console.error('Missing stripe-signature header');
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripeService.constructWebhookEvent(req.body, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  console.log(`Received webhook event: ${event.type} (${event.id})`);

  try {
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.requires_action':
        await handlePaymentRequiresAction(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.dispute.created':
        await handleChargeDispute(event.data.object as Stripe.Dispute);
        break;

      case 'invoice.payment_succeeded':
        // Handle subscription payments if needed
        console.log('Invoice payment succeeded:', event.data.object.id);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        // Handle subscription changes for fan club memberships
        console.log(`Subscription ${event.type}:`, event.data.object.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true, event: event.type });
  } catch (error) {
    console.error(`Error processing webhook event ${event.type}:`, error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log(`Payment succeeded: ${paymentIntent.id} for $${paymentIntent.amount / 100}`);

    // Find the order by payment intent ID
    const order = await storage.getOrderByPaymentIntent(paymentIntent.id);
    
    if (!order) {
      console.error(`Order not found for payment intent: ${paymentIntent.id}`);
      return;
    }

    // Update order status to confirmed and paid
    await storage.updateOrderStatus(order.id, 'confirmed', 'paid');

    // Send payment confirmation email
    try {
      const orderData = await emailTemplateService.getOrderEmailData(order.orderNumber);
      if (orderData) {
        await emailTemplateService.sendPaymentConfirmation({
          customerName: orderData.customerName,
          customerEmail: orderData.customerEmail,
          orderNumber: order.orderNumber,
          paymentAmount: paymentIntent.amount / 100,
          paymentMethod: paymentIntent.payment_method_types?.[0] || 'card',
          transactionId: paymentIntent.id,
          paymentDate: new Date().toISOString()
        });
        
        // Also send order confirmation if it wasn't sent yet
        await emailTemplateService.sendOrderConfirmation(orderData);
      }
    } catch (emailError) {
      console.error('Failed to send payment confirmation emails:', emailError);
      // Don't throw - we don't want email failures to break payment processing
    }
    
    // Send admin notification
    try {
      const orderData = await emailTemplateService.getOrderEmailData(order.orderNumber);
      if (orderData) {
        let customer = null;
        if (order.userId) {
          customer = await storage.getUserById(order.userId);
        }
        await emailTemplateService.sendAdminNewOrderNotification({
          orderNumber: order.orderNumber,
          orderDate: order.createdAt.toISOString(),
          customerName: orderData.customerName,
          customerEmail: orderData.customerEmail,
          orderTotal: orderData.total,
          itemCount: orderData.items.length,
          items: orderData.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.unitPrice,
            variantName: item.variantName
          })),
          shippingAddress: orderData.shippingAddress,
          paymentMethod: paymentIntent.payment_method_types?.[0] || 'card',
          priority: orderData.total > 200 ? 'high' : 'normal'
        });
      }
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError);
    }
    
    // Add any post-payment processing here
    // - Update inventory
    // - Trigger fulfillment
    // - Analytics tracking
    
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
    throw error;
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log(`Payment failed: ${paymentIntent.id}`, paymentIntent.last_payment_error?.message);

    // Find the order by payment intent ID
    const order = await storage.getOrderByPaymentIntent(paymentIntent.id);
    
    if (!order) {
      console.error(`Order not found for payment intent: ${paymentIntent.id}`);
      return;
    }

    // Update order status to failed
    await storage.updateOrderStatus(order.id, 'failed', 'failed');

    // Release reserved inventory
    await releaseOrderInventory(order.id);

    // Send payment failure notification
    try {
      const customer = await storage.getUserById(order.userId);
      if (customer) {
        await emailTemplateService.sendPaymentFailureNotification(
          order.orderNumber,
          customer.email,
          customer.name || customer.email,
          paymentIntent.last_payment_error?.message
        );
      }
    } catch (emailError) {
      console.error('Failed to send payment failure notification:', emailError);
    }
    
  } catch (error) {
    console.error('Error handling payment failed:', error);
    throw error;
  }
}

/**
 * Handle canceled payment
 */
async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log(`Payment canceled: ${paymentIntent.id}`);

    // Find the order by payment intent ID
    const order = await storage.getOrderByPaymentIntent(paymentIntent.id);
    
    if (!order) {
      console.error(`Order not found for payment intent: ${paymentIntent.id}`);
      return;
    }

    // Update order status to canceled
    await storage.updateOrderStatus(order.id, 'cancelled', 'cancelled');

    // Release reserved inventory
    await releaseOrderInventory(order.id);
    
  } catch (error) {
    console.error('Error handling payment canceled:', error);
    throw error;
  }
}

/**
 * Handle payment requiring action (3D Secure, etc.)
 */
async function handlePaymentRequiresAction(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log(`Payment requires action: ${paymentIntent.id}`);

    // Find the order by payment intent ID
    const order = await storage.getOrderByPaymentIntent(paymentIntent.id);
    
    if (!order) {
      console.error(`Order not found for payment intent: ${paymentIntent.id}`);
      return;
    }

    // Update order status to processing (awaiting customer action)
    await storage.updateOrderStatus(order.id, 'processing', 'requires_action');
    
    // Could send notification to customer about required action
    
  } catch (error) {
    console.error('Error handling payment requires action:', error);
    throw error;
  }
}

/**
 * Handle charge dispute
 */
async function handleChargeDispute(dispute: Stripe.Dispute) {
  try {
    console.log(`Charge dispute created: ${dispute.id} for charge ${dispute.charge}`);

    // Find the order related to this charge
    // This would require storing the charge ID in orders table
    console.log('Processing dispute - manual review required');
    
    // Could create admin notification for dispute handling
    
  } catch (error) {
    console.error('Error handling charge dispute:', error);
    throw error;
  }
}

/**
 * Release inventory for a failed/canceled order
 */
async function releaseOrderInventory(orderId: string) {
  try {
    const orderItems = await storage.getOrderItems(orderId);
    
    for (const item of orderItems) {
      // Find inventory entries and release reserved quantity
      const inventory = await storage.getInventory(item.productId, item.variantId);
      
      for (const inv of inventory) {
        if (inv.quantityReserved >= item.quantity) {
          await storage.updateInventory(inv.id, {
            available: inv.quantityAvailable + item.quantity,
            reserved: inv.quantityReserved - item.quantity
          });
          break;
        }
      }
    }
    
    console.log(`Released inventory for order: ${orderId}`);
  } catch (error) {
    console.error('Error releasing inventory:', error);
  }
}

export default router;