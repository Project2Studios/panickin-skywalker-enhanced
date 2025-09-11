import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { validateRequest } from "../middleware/validation";
import { optionalAuth, AuthenticatedRequest } from "../middleware/auth";
import stripeService from "../services/stripe";

const router = Router();

// Validation schemas
const calculateTotalsSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid("Invalid product ID"),
    variantId: z.string().uuid("Invalid variant ID"),
    quantity: z.number().int().min(1, "Quantity must be at least 1"),
  })).min(1, "Must include at least one item"),
  shippingAddress: z.object({
    state: z.string().min(1, "State required for tax calculation"),
    country: z.string().min(1, "Country required"),
    postalCode: z.string().min(1, "Postal code required"),
  }),
  shippingMethod: z.enum(['standard', 'express', 'overnight']).default('standard'),
  promoCode: z.string().optional(),
});

const createPaymentIntentSchema = z.object({
  amount: z.number().min(1, "Amount must be greater than 0"),
  currency: z.string().default('usd'),
  orderItems: z.array(z.object({
    productId: z.string().uuid(),
    variantId: z.string().uuid(),
    quantity: z.number().int().min(1),
  })),
  customerInfo: z.object({
    email: z.string().email("Valid email required"),
    name: z.string().min(1, "Name required"),
  }),
});

const confirmOrderSchema = z.object({
  paymentIntentId: z.string().min(1, "Payment intent ID required"),
  orderData: z.object({
    items: z.array(z.object({
      productId: z.string().uuid(),
      variantId: z.string().uuid(),
      quantity: z.number().int().min(1),
    })),
    customerInfo: z.object({
      email: z.string().email(),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      phone: z.string().optional(),
    }),
    shippingAddress: z.object({
      addressLine1: z.string().min(1),
      addressLine2: z.string().optional(),
      city: z.string().min(1),
      state: z.string().min(1),
      postalCode: z.string().min(1),
      country: z.string().min(1),
    }),
    billingAddress: z.object({
      addressLine1: z.string().min(1),
      addressLine2: z.string().optional(),
      city: z.string().min(1),
      state: z.string().min(1),
      postalCode: z.string().min(1),
      country: z.string().min(1),
    }).optional(),
    shippingMethod: z.enum(['standard', 'express', 'overnight']),
    notes: z.string().optional(),
  }),
});

router.use(optionalAuth);

/**
 * POST /api/checkout/calculate
 * Calculate order totals including tax and shipping
 */
router.post("/calculate", validateRequest(calculateTotalsSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { items, shippingAddress, shippingMethod, promoCode } = req.body;

    // Validate all items and calculate subtotal
    let subtotal = 0;
    const calculatedItems = [];

    for (const item of items) {
      const [product, variant] = await Promise.all([
        storage.getProduct(item.productId),
        storage.getProductVariant(item.variantId)
      ]);

      if (!product || !product.isActive) {
        return res.status(400).json({
          message: `Product not found or unavailable: ${item.productId}`,
          field: 'items'
        });
      }

      if (!variant || !variant.isActive || variant.productId !== product.id) {
        return res.status(400).json({
          message: `Product variant not found or unavailable: ${item.variantId}`,
          field: 'items'
        });
      }

      // Check stock availability
      const inventory = await storage.getInventory(item.productId, item.variantId);
      const availableStock = inventory.reduce((total, inv) => total + inv.quantityAvailable, variant.stockQuantity);

      if (availableStock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name} - ${variant.name}`,
          field: 'items',
          availableStock,
          requestedQuantity: item.quantity,
          productName: product.name,
          variantName: variant.name
        });
      }

      const unitPrice = parseFloat(product.salePrice || product.basePrice) + parseFloat(variant.priceAdjustment);
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;

      calculatedItems.push({
        productId: item.productId,
        variantId: item.variantId,
        productName: product.name,
        variantName: variant.name,
        sku: variant.sku,
        quantity: item.quantity,
        unitPrice,
        lineTotal,
        attributes: variant.attributes
      });
    }

    // Calculate tax (simplified - real implementation would use tax service)
    const taxRate = calculateTaxRate(shippingAddress.state, shippingAddress.country);
    const tax = subtotal * taxRate;

    // Calculate shipping
    const shipping = calculateShipping(subtotal, shippingMethod, shippingAddress.country);

    // Apply promo code discount
    const discount = await calculateDiscount(promoCode, subtotal);

    // Calculate final total
    const total = subtotal + tax + shipping - discount.amount;

    res.json({
      calculation: {
        items: calculatedItems,
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: {
          rate: taxRate,
          amount: parseFloat(tax.toFixed(2))
        },
        shipping: {
          method: shippingMethod,
          cost: parseFloat(shipping.toFixed(2)),
          estimatedDays: getShippingEstimate(shippingMethod)
        },
        discount: {
          code: promoCode,
          amount: parseFloat(discount.amount.toFixed(2)),
          description: discount.description
        },
        total: parseFloat(total.toFixed(2))
      },
      valid: true,
      message: "Totals calculated successfully"
    });

  } catch (error) {
    console.error("Error calculating checkout totals:", error);
    res.status(500).json({
      message: "Failed to calculate order totals"
    });
  }
});

/**
 * POST /api/checkout/create-payment-intent
 * Create Stripe payment intent
 */
router.post("/create-payment-intent", validateRequest(createPaymentIntentSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { amount, currency, orderItems, customerInfo } = req.body;

    // Create payment intent with Stripe
    const paymentIntent = await stripeService.createPaymentIntent({
      amount,
      currency: currency || 'usd',
      orderItems,
      customerInfo,
      metadata: {
        source: 'panickin_skywalker_checkout',
        itemCount: orderItems.reduce((total: number, item: any) => total + item.quantity, 0).toString(),
      },
    });

    // Log payment intent creation for debugging
    console.log(`Created payment intent ${paymentIntent.id} for ${customerInfo.email}: $${amount}`);

    res.json({
      paymentIntent: {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        metadata: paymentIntent.metadata,
      },
      publishableKey: stripeService.getPublishableKey(),
      message: "Payment intent created successfully"
    });

  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({
      message: "Failed to create payment intent",
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

/**
 * POST /api/checkout/confirm
 * Confirm payment and create order
 */
router.post("/confirm", validateRequest(confirmOrderSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { paymentIntentId, orderData } = req.body;
    const userId = req.user?.id;

    // In a real implementation, you'd verify the payment with Stripe
    // For now, we'll simulate payment confirmation
    const paymentConfirmed = await verifyPayment(paymentIntentId);
    
    if (!paymentConfirmed) {
      return res.status(400).json({
        message: "Payment could not be confirmed",
        paymentIntentId
      });
    }

    // Create the order (reuse logic from orders route)
    const { items, customerInfo, shippingAddress, billingAddress, shippingMethod, notes } = orderData;

    // Validate items and calculate totals again
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const [product, variant] = await Promise.all([
        storage.getProduct(item.productId),
        storage.getProductVariant(item.variantId)
      ]);

      if (!product || !product.isActive) {
        return res.status(400).json({
          message: `Product no longer available: ${item.productId}`
        });
      }

      if (!variant || !variant.isActive) {
        return res.status(400).json({
          message: `Product variant no longer available: ${item.variantId}`
        });
      }

      // Final stock check
      const inventory = await storage.getInventory(item.productId, item.variantId);
      const availableStock = inventory.reduce((total, inv) => total + inv.quantityAvailable, variant.stockQuantity);

      if (availableStock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}`,
          productName: product.name,
          availableStock
        });
      }

      const unitPrice = parseFloat(product.salePrice || product.basePrice) + parseFloat(variant.priceAdjustment);
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;

      validatedItems.push({
        product,
        variant,
        quantity: item.quantity,
        unitPrice,
        lineTotal
      });
    }

    // Calculate final totals
    const taxRate = calculateTaxRate(shippingAddress.state, shippingAddress.country);
    const tax = subtotal * taxRate;
    const shipping = calculateShipping(subtotal, shippingMethod, shippingAddress.country);
    const total = subtotal + tax + shipping;

    // Generate order number
    const orderNumber = `PS${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`;

    // Create the order
    const order = await storage.createOrder({
      userId,
      orderNumber,
      customerEmail: customerInfo.email,
      customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
      customerPhone: customerInfo.phone || null,
      status: 'processing', // Payment confirmed, processing order
      subtotal: subtotal.toFixed(2),
      taxAmount: tax.toFixed(2),
      shippingAmount: shipping.toFixed(2),
      totalAmount: total.toFixed(2),
      currency: 'USD',
      shippingAddressId: 'placeholder', // TODO: Create proper address records
      billingAddressId: 'placeholder', // TODO: Create proper address records
      paymentMethod: 'stripe',
      paymentStatus: 'paid',
      stripePaymentIntentId: paymentIntentId,
      notes,
    });

    // Create order items and reserve inventory
    for (const item of validatedItems) {
      await storage.createOrderItem({
        orderId: order.id,
        productId: item.product.id,
        variantId: item.variant?.id || null,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toFixed(2),
        totalPrice: item.lineTotal.toFixed(2),
        productSnapshot: {
          name: item.product.name,
          description: item.product.description || undefined,
          variantName: item.variant?.name,
          attributes: item.variant?.attributes || {},
        },
      });

      // Reserve inventory
      const inventory = await storage.getInventory(item.product.id, item.variant?.id);
      for (const inv of inventory) {
        if (inv.quantityAvailable >= item.quantity) {
          await storage.updateInventory(inv.id, {
            available: inv.quantityAvailable - item.quantity,
            reserved: inv.quantityReserved + item.quantity
          });
          break;
        }
      }
    }

    // Clear cart if user is logged in
    if (userId) {
      await storage.clearCart(userId);
    }

    res.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        total: parseFloat(order.totalAmount),
        createdAt: order.createdAt,
        estimatedDelivery: new Date(Date.now() + getShippingEstimate(shippingMethod) * 24 * 60 * 60 * 1000).toISOString(),
      },
      message: "Order confirmed and payment processed successfully"
    });

  } catch (error) {
    console.error("Error confirming order:", error);
    res.status(500).json({
      message: "Failed to confirm order and process payment"
    });
  }
});

// Helper functions
function calculateTaxRate(state: string, country: string): number {
  // Simplified tax calculation - real implementation would use tax service
  if (country.toLowerCase() !== 'us') return 0;
  
  const stateTaxRates: { [key: string]: number } = {
    'CA': 0.0875, // California
    'NY': 0.08,   // New York  
    'TX': 0.0625, // Texas
    'FL': 0.06,   // Florida
    'WA': 0.065,  // Washington
  };
  
  return stateTaxRates[state.toUpperCase()] || 0.05; // Default 5%
}

function calculateShipping(subtotal: number, method: string, country: string): number {
  // Free shipping over $50
  if (subtotal >= 50) return 0;
  
  if (country.toLowerCase() !== 'us') {
    // International shipping
    return method === 'standard' ? 25 : method === 'express' ? 45 : 75;
  }
  
  // Domestic shipping
  const shippingRates = {
    'standard': 5.99,
    'express': 12.99,
    'overnight': 24.99
  };
  
  return shippingRates[method as keyof typeof shippingRates] || 5.99;
}

function getShippingEstimate(method: string): number {
  const estimates = {
    'standard': 7,    // 5-7 business days
    'express': 3,     // 2-3 business days  
    'overnight': 1    // Next business day
  };
  
  return estimates[method as keyof typeof estimates] || 7;
}

async function calculateDiscount(promoCode?: string, subtotal?: number): Promise<{ amount: number; description: string }> {
  if (!promoCode) {
    return { amount: 0, description: '' };
  }
  
  // Simplified promo code system - real implementation would check database
  const promoCodes: { [key: string]: { type: 'percentage' | 'fixed'; value: number; description: string; minOrder?: number } } = {
    'WELCOME10': { type: 'percentage', value: 0.1, description: '10% off your first order', minOrder: 25 },
    'SAVE5': { type: 'fixed', value: 5, description: '$5 off your order', minOrder: 30 },
    'FREESHIP': { type: 'fixed', value: 0, description: 'Free shipping' }, // Would need special handling
  };
  
  const promo = promoCodes[promoCode.toUpperCase()];
  if (!promo) {
    return { amount: 0, description: 'Invalid promo code' };
  }
  
  if (promo.minOrder && subtotal && subtotal < promo.minOrder) {
    return { amount: 0, description: `Minimum order of $${promo.minOrder} required` };
  }
  
  const amount = promo.type === 'percentage' ? (subtotal || 0) * promo.value : promo.value;
  return { amount, description: promo.description };
}

async function verifyPayment(paymentIntentId: string): Promise<boolean> {
  try {
    console.log(`Verifying payment intent: ${paymentIntentId}`);
    
    // Retrieve payment intent from Stripe
    const paymentIntent = await stripeService.retrievePaymentIntent(paymentIntentId);
    
    // Check if payment was successful
    const isSucceeded = paymentIntent.status === 'succeeded';
    const isPaid = isSucceeded; // For PaymentIntent, succeeded status means paid
    
    console.log(`Payment intent ${paymentIntentId} status: ${paymentIntent.status}, paid: ${isPaid}`);
    
    return isSucceeded && isPaid;
  } catch (error) {
    console.error(`Failed to verify payment intent ${paymentIntentId}:`, error);
    return false;
  }
}

export default router;