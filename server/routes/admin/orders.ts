import { Router } from "express";
import { z } from "zod";
import { storage } from "../../storage";
import { validateRequest, validateParams, validateQuery } from "../../middleware/validation";
import { requireAdmin, AuthenticatedRequest } from "../../middleware/auth";

const router = Router();

// Apply admin authentication to all routes
router.use(requireAdmin);

// Validation schemas
const getOrdersQuerySchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  search: z.string().optional(), // Search by order number, customer email, or name
  sort: z.enum(['newest', 'oldest', 'total_asc', 'total_desc']).default('newest'),
  limit: z.string().transform(val => parseInt(val) || 50).optional(),
  offset: z.string().transform(val => parseInt(val) || 0).optional(),
});

const orderParamsSchema = z.object({
  id: z.string().uuid("Invalid order ID"),
});

const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
  notes: z.string().optional(),
});

/**
 * GET /api/admin/orders
 * List all orders with filtering for admin
 */
router.get("/", validateQuery(getOrdersQuerySchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { 
      status, 
      paymentStatus, 
      dateFrom, 
      dateTo, 
      search, 
      sort, 
      limit = 50, 
      offset = 0 
    } = req.query as any;

    // Get all orders
    let orders = await storage.getOrders();

    // Apply filters
    if (status) {
      orders = orders.filter(order => order.status === status);
    }

    if (paymentStatus) {
      orders = orders.filter(order => order.paymentStatus === paymentStatus);
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      orders = orders.filter(order => new Date(order.createdAt) >= fromDate);
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      orders = orders.filter(order => new Date(order.createdAt) <= toDate);
    }

    if (search) {
      const searchTerm = search.toLowerCase();
      orders = orders.filter(order => 
        order.orderNumber.toLowerCase().includes(searchTerm) ||
        order.customerEmail.toLowerCase().includes(searchTerm) ||
        order.customerName.toLowerCase().includes(searchTerm)
      );
    }

    // Get enhanced order data
    const enhancedOrders = await Promise.all(
      orders.map(async (order) => {
        const orderItems = await storage.getOrderItems(order.id);
        const itemCount = orderItems.reduce((total, item) => total + item.quantity, 0);
        
        return {
          ...order,
          total: parseFloat(order.total),
          subtotal: parseFloat(order.subtotal),
          tax: parseFloat(order.tax),
          shipping: parseFloat(order.shipping),
          itemCount,
          shippingAddress: order.shippingAddress ? JSON.parse(order.shippingAddress) : null,
          billingAddress: order.billingAddress ? JSON.parse(order.billingAddress) : null,
        };
      })
    );

    // Apply sorting
    let sortedOrders = [...enhancedOrders];
    switch (sort) {
      case 'oldest':
        sortedOrders.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'total_asc':
        sortedOrders.sort((a, b) => a.total - b.total);
        break;
      case 'total_desc':
        sortedOrders.sort((a, b) => b.total - a.total);
        break;
      case 'newest':
      default:
        sortedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    // Apply pagination
    const paginatedOrders = sortedOrders.slice(offset, offset + limit);

    // Calculate summary statistics
    const summary = {
      total: sortedOrders.length,
      totalRevenue: sortedOrders.reduce((sum, order) => sum + order.total, 0),
      byStatus: {
        pending: sortedOrders.filter(o => o.status === 'pending').length,
        confirmed: sortedOrders.filter(o => o.status === 'confirmed').length,
        processing: sortedOrders.filter(o => o.status === 'processing').length,
        shipped: sortedOrders.filter(o => o.status === 'shipped').length,
        delivered: sortedOrders.filter(o => o.status === 'delivered').length,
        cancelled: sortedOrders.filter(o => o.status === 'cancelled').length,
      },
      byPaymentStatus: {
        pending: sortedOrders.filter(o => o.paymentStatus === 'pending').length,
        paid: sortedOrders.filter(o => o.paymentStatus === 'paid').length,
        failed: sortedOrders.filter(o => o.paymentStatus === 'failed').length,
        refunded: sortedOrders.filter(o => o.paymentStatus === 'refunded').length,
      },
      averageOrderValue: sortedOrders.length > 0 ? sortedOrders.reduce((sum, order) => sum + order.total, 0) / sortedOrders.length : 0,
    };

    res.json({
      orders: paginatedOrders,
      pagination: {
        total: sortedOrders.length,
        limit,
        offset,
        hasMore: offset + limit < sortedOrders.length
      },
      summary,
      filters: {
        status,
        paymentStatus,
        dateFrom,
        dateTo,
        search,
        sort
      }
    });
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    res.status(500).json({
      message: "Failed to fetch orders"
    });
  }
});

/**
 * GET /api/admin/orders/:id
 * Get order details for admin
 */
router.get("/:id", validateParams(orderParamsSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    
    const order = await storage.getOrder(id);
    
    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    // Get order items with product details
    const orderItems = await storage.getOrderItems(order.id);
    
    const detailedItems = await Promise.all(
      orderItems.map(async (item) => {
        const [product, variant] = await Promise.all([
          storage.getProduct(item.productId),
          storage.getProductVariant(item.variantId)
        ]);

        return {
          ...item,
          unitPrice: parseFloat(item.unitPrice),
          lineTotal: parseFloat(item.lineTotal),
          product: product ? {
            id: product.id,
            name: product.name,
            slug: product.slug,
            isActive: product.isActive
          } : null,
          variant: variant ? {
            id: variant.id,
            name: variant.name,
            sku: variant.sku,
            isActive: variant.isActive,
            attributes: variant.attributes
          } : null,
        };
      })
    );

    // Parse addresses
    const shippingAddress = order.shippingAddress ? JSON.parse(order.shippingAddress) : null;
    const billingAddress = order.billingAddress ? JSON.parse(order.billingAddress) : null;

    const orderDetails = {
      ...order,
      total: parseFloat(order.total),
      subtotal: parseFloat(order.subtotal),
      tax: parseFloat(order.tax),
      shipping: parseFloat(order.shipping),
      items: detailedItems,
      addresses: {
        shipping: shippingAddress,
        billing: billingAddress,
      },
      summary: {
        itemCount: detailedItems.reduce((total, item) => total + item.quantity, 0),
        totalQuantity: detailedItems.reduce((total, item) => total + item.quantity, 0),
        uniqueProducts: new Set(detailedItems.map(item => item.productId)).size,
      }
    };

    res.json({ order: orderDetails });
  } catch (error) {
    console.error("Error fetching admin order details:", error);
    res.status(500).json({
      message: "Failed to fetch order details"
    });
  }
});

/**
 * PUT /api/admin/orders/:id/status
 * Update order status
 */
router.put("/:id/status", 
  validateParams(orderParamsSchema), 
  validateRequest(updateOrderStatusSchema), 
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      // Verify order exists
      const existingOrder = await storage.getOrder(id);
      if (!existingOrder) {
        return res.status(404).json({
          message: "Order not found"
        });
      }

      // Validate status transition (simplified logic)
      const validTransitions = {
        'pending': ['confirmed', 'cancelled'],
        'confirmed': ['processing', 'cancelled'],
        'processing': ['shipped', 'cancelled'],
        'shipped': ['delivered'],
        'delivered': [], // Final state
        'cancelled': [] // Final state
      };

      if (!validTransitions[existingOrder.status as keyof typeof validTransitions].includes(status) && 
          existingOrder.status !== status) {
        return res.status(400).json({
          message: `Cannot transition from ${existingOrder.status} to ${status}`,
          currentStatus: existingOrder.status,
          allowedTransitions: validTransitions[existingOrder.status as keyof typeof validTransitions]
        });
      }

      // Update order status
      const updatedOrder = await storage.updateOrder(id, { 
        status, 
        notes: notes || existingOrder.notes 
      });
      
      if (!updatedOrder) {
        return res.status(500).json({
          message: "Failed to update order status"
        });
      }

      // Log status change for audit trail
      console.log(`Order ${existingOrder.orderNumber} status changed from ${existingOrder.status} to ${status} by admin ${req.user?.username}`);

      // In a real implementation, you might:
      // - Send customer notification emails
      // - Update inventory for cancellations
      // - Trigger shipping notifications
      // - Update analytics/reporting

      res.json({
        message: "Order status updated successfully",
        order: {
          id: updatedOrder.id,
          orderNumber: updatedOrder.orderNumber,
          previousStatus: existingOrder.status,
          currentStatus: updatedOrder.status,
          updatedAt: updatedOrder.updatedAt
        }
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({
        message: "Failed to update order status"
      });
    }
  }
);

/**
 * GET /api/admin/orders/stats
 * Get order statistics for dashboard
 */
router.get("/stats", async (req: AuthenticatedRequest, res) => {
  try {
    const orders = await storage.getOrders();
    
    // Calculate date ranges
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisYear = new Date(now.getFullYear(), 0, 1);

    // Filter orders by date ranges
    const todayOrders = orders.filter(order => new Date(order.createdAt) >= today);
    const weekOrders = orders.filter(order => new Date(order.createdAt) >= thisWeek);
    const monthOrders = orders.filter(order => new Date(order.createdAt) >= thisMonth);
    const yearOrders = orders.filter(order => new Date(order.createdAt) >= thisYear);

    // Calculate revenue
    const calculateRevenue = (orderList: any[]) => 
      orderList.reduce((sum, order) => sum + parseFloat(order.total), 0);

    // Recent orders (last 10)
    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        status: order.status,
        total: parseFloat(order.total),
        createdAt: order.createdAt
      }));

    // Status distribution
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Top customers (by order count)
    const customerOrders = orders.reduce((acc, order) => {
      const key = `${order.customerEmail}|${order.customerName}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCustomers = Object.entries(customerOrders)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([customer, orderCount]) => {
        const [email, name] = customer.split('|');
        return { email, name, orderCount };
      });

    const stats = {
      overview: {
        totalOrders: orders.length,
        totalRevenue: calculateRevenue(orders),
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        completedOrders: orders.filter(o => o.status === 'delivered').length,
        averageOrderValue: orders.length > 0 ? calculateRevenue(orders) / orders.length : 0,
      },
      periods: {
        today: {
          orders: todayOrders.length,
          revenue: calculateRevenue(todayOrders)
        },
        week: {
          orders: weekOrders.length,
          revenue: calculateRevenue(weekOrders)
        },
        month: {
          orders: monthOrders.length,
          revenue: calculateRevenue(monthOrders)
        },
        year: {
          orders: yearOrders.length,
          revenue: calculateRevenue(yearOrders)
        }
      },
      statusDistribution: statusCounts,
      recentOrders,
      topCustomers,
      trends: {
        // Simplified trend calculation - in production you'd want more sophisticated analytics
        weeklyGrowth: weekOrders.length,
        monthlyGrowth: monthOrders.length,
      }
    };

    res.json({ stats });
  } catch (error) {
    console.error("Error fetching order statistics:", error);
    res.status(500).json({
      message: "Failed to fetch order statistics"
    });
  }
});

export default router;