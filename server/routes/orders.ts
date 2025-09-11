import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { validateRequest, validateParams, validateQuery } from "../middleware/validation";
import { optionalAuth, AuthenticatedRequest } from "../middleware/auth";
import { generateSimpleOrderNumber } from "../utils/orderNumber";

const router = Router();

// Validation schemas
const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid("Invalid product ID"),
    variantId: z.string().uuid("Invalid variant ID"),
    quantity: z.number().int().min(1, "Quantity must be at least 1"),
  })).min(1, "Order must contain at least one item"),
  customerInfo: z.object({
    email: z.string().email("Valid email required"),
    firstName: z.string().min(1, "First name required"),
    lastName: z.string().min(1, "Last name required"),
    phone: z.string().optional(),
  }),
  shippingAddress: z.object({
    addressLine1: z.string().min(1, "Address line 1 required"),
    addressLine2: z.string().optional(),
    city: z.string().min(1, "City required"),
    state: z.string().min(1, "State required"),
    postalCode: z.string().min(1, "Postal code required"),
    country: z.string().min(1, "Country required"),
  }),
  billingAddress: z.object({
    addressLine1: z.string().min(1, "Address line 1 required"),
    addressLine2: z.string().optional(),
    city: z.string().min(1, "City required"),
    state: z.string().min(1, "State required"),
    postalCode: z.string().min(1, "Postal code required"),
    country: z.string().min(1, "Country required"),
  }).optional(),
  paymentMethod: z.enum(['stripe', 'paypal']).default('stripe'),
  notes: z.string().optional(),
});

const getOrderParamsSchema = z.object({
  orderNumber: z.string().min(1, "Order number required"),
});

const getUserOrdersQuerySchema = z.object({
  limit: z.string().transform(val => parseInt(val) || 10).optional(),
  offset: z.string().transform(val => parseInt(val) || 0).optional(),
});

router.use(optionalAuth);

/**
 * POST /api/orders
 * Create new order
 */
router.post("/", validateRequest(createOrderSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { items, customerInfo, shippingAddress, billingAddress, paymentMethod, notes } = req.body;
    const userId = req.user?.id;

    // Validate all items and calculate totals
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const [product, variant] = await Promise.all([
        storage.getProduct(item.productId),
        storage.getProductVariant(item.variantId)
      ]);

      if (!product || !product.isActive) {
        return res.status(400).json({
          message: `Product not found or unavailable: ${item.productId}`
        });
      }

      if (!variant || !variant.isActive || variant.productId !== product.id) {
        return res.status(400).json({
          message: `Product variant not found or unavailable: ${item.variantId}`
        });
      }

      // Check stock availability
      const inventory = await storage.getInventory(item.productId, item.variantId);
      const availableStock = inventory.reduce((total, inv) => total + inv.quantityAvailable, variant.stockQuantity);

      if (availableStock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name} - ${variant.name}. Available: ${availableStock}`,
          productName: product.name,
          variantName: variant.name,
          availableStock,
          requestedQuantity: item.quantity
        });
      }

      const unitPrice = parseFloat(product.basePrice) + parseFloat(variant.priceAdjustment);
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

    // Calculate tax and shipping (simplified for demo)
    const taxRate = 0.08; // 8% tax
    const tax = subtotal * taxRate;
    const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
    const total = subtotal + tax + shipping;

    // Generate order number
    const orderNumber = generateSimpleOrderNumber();

    // Create the order
    const order = await storage.createOrder({
      userId: userId || undefined,
      orderNumber,
      customerEmail: customerInfo.email as string,
      customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
      customerPhone: customerInfo.phone || undefined,
      status: 'pending',
      subtotal: subtotal.toFixed(2),
      taxAmount: tax.toFixed(2),
      shippingAmount: shipping.toFixed(2),
      totalAmount: total.toFixed(2),
      currency: 'USD',
      shippingAddressId: 'placeholder', // TODO: Create proper address records
      billingAddressId: 'placeholder', // TODO: Create proper address records
      paymentMethod: paymentMethod as string,
      paymentStatus: 'pending',
      stripePaymentIntentId: undefined,
      notes: notes || undefined,
    });

    // Create order items
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

      // Reserve inventory (simplified)
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

    // Clear user's cart if they're logged in
    if (userId) {
      await storage.clearCart(userId);
    }

    res.status(201).json({
      message: "Order created successfully",
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: parseFloat(order.totalAmount),
        createdAt: order.createdAt,
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      }
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      message: "Failed to create order"
    });
  }
});

/**
 * GET /api/orders/:orderNumber
 * Get order by order number (public endpoint for order lookup)
 */
router.get("/:orderNumber", validateParams(getOrderParamsSchema), async (req, res) => {
  try {
    const { orderNumber } = req.params;
    
    const order = await storage.getOrderByNumber(orderNumber);
    
    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    // Get order items
    const orderItems = await storage.getOrderItems(order.id);
    
    // TODO: Get addresses from shippingAddressId and billingAddressId
    const shippingAddress = null; // order.shippingAddressId
    const billingAddress = null; // order.billingAddressId

    // Calculate estimated delivery date
    const createdDate = new Date(order.createdAt);
    const estimatedDelivery = new Date(createdDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    const orderDetails = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      customerInfo: {
        email: order.customerEmail,
        name: order.customerName,
        phone: order.customerPhone,
      },
      items: orderItems.map(item => ({
        id: item.id,
        productName: item.productSnapshot?.name || 'Unknown Product',
        variantName: item.productSnapshot?.variantName || null,
        sku: null, // Not stored in productSnapshot
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice),
        lineTotal: parseFloat(item.totalPrice),
      })),
      totals: {
        subtotal: parseFloat(order.subtotal),
        tax: parseFloat(order.taxAmount),
        shipping: parseFloat(order.shippingAmount),
        total: parseFloat(order.totalAmount),
      },
      addresses: {
        shipping: shippingAddress,
        billing: billingAddress,
      },
      paymentMethod: order.paymentMethod,
      notes: order.notes,
      dates: {
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        estimatedDelivery: estimatedDelivery.toISOString(),
      },
      timeline: generateOrderTimeline(order)
    };

    res.json({ order: orderDetails });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({
      message: "Failed to fetch order"
    });
  }
});

/**
 * GET /api/orders (authenticated)
 * Get user's order history
 */
router.get("/", validateQuery(getUserOrdersQuerySchema), async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        message: "Authentication required to view order history"
      });
    }

    const { limit = 10, offset = 0 } = req.query as any;

    const allOrders = await storage.getOrders(userId);
    const paginatedOrders = allOrders.slice(offset, offset + limit);

    // Get basic order info with item counts
    const ordersWithDetails = await Promise.all(
      paginatedOrders.map(async (order) => {
        const orderItems = await storage.getOrderItems(order.id);
        const itemCount = orderItems.reduce((total, item) => total + item.quantity, 0);
        
        return {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.paymentStatus,
          total: parseFloat(order.totalAmount),
          itemCount,
          createdAt: order.createdAt,
          estimatedDelivery: new Date(new Date(order.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };
      })
    );

    res.json({
      orders: ordersWithDetails,
      pagination: {
        total: allOrders.length,
        limit,
        offset,
        hasMore: offset + limit < allOrders.length
      }
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({
      message: "Failed to fetch orders"
    });
  }
});

// Helper function to generate order timeline
function generateOrderTimeline(order: any) {
  const timeline = [
    {
      status: 'pending',
      title: 'Order Placed',
      description: 'Your order has been received and is being processed',
      timestamp: order.createdAt,
      completed: true
    }
  ];

  if (order.status === 'confirmed' || order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered') {
    timeline.push({
      status: 'confirmed',
      title: 'Order Confirmed',
      description: 'Payment processed and order confirmed',
      timestamp: order.updatedAt,
      completed: true
    });
  }

  if (order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered') {
    timeline.push({
      status: 'processing',
      title: 'Processing',
      description: 'Your items are being prepared for shipment',
      timestamp: null,
      completed: order.status !== 'processing'
    });
  }

  if (order.status === 'shipped' || order.status === 'delivered') {
    timeline.push({
      status: 'shipped',
      title: 'Shipped',
      description: 'Your order is on its way',
      timestamp: null,
      completed: order.status !== 'shipped'
    });
  }

  if (order.status === 'delivered') {
    timeline.push({
      status: 'delivered',
      title: 'Delivered',
      description: 'Order has been delivered',
      timestamp: null,
      completed: true
    });
  }

  if (order.status === 'cancelled') {
    timeline.push({
      status: 'cancelled',
      title: 'Cancelled',
      description: 'Order has been cancelled',
      timestamp: order.updatedAt,
      completed: true
    });
  }

  return timeline;
}

export default router;