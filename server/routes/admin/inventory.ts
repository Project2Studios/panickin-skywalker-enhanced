import { Router } from "express";
import { z } from "zod";
import { storage } from "../../storage";
import { validateRequest, validateParams, validateQuery } from "../../middleware/validation";
import { requireAdmin, AuthenticatedRequest } from "../../middleware/auth";

const router = Router();

// Apply admin authentication to all routes
router.use(requireAdmin);

// Validation schemas
const getInventoryQuerySchema = z.object({
  productId: z.string().uuid("Invalid product ID").optional(),
  lowStock: z.string().transform(val => val === 'true').optional(),
  threshold: z.string().transform(val => parseInt(val) || 5).optional(), // Low stock threshold
  sort: z.enum(['stock_asc', 'stock_desc', 'product_name', 'updated_desc']).default('updated_desc'),
  limit: z.string().transform(val => parseInt(val) || 50).optional(),
  offset: z.string().transform(val => parseInt(val) || 0).optional(),
});

const updateInventorySchema = z.object({
  available: z.number().int().min(0, "Available quantity must be non-negative").optional(),
  reserved: z.number().int().min(0, "Reserved quantity must be non-negative").optional(),
});

const inventoryParamsSchema = z.object({
  id: z.string().uuid("Invalid inventory ID"),
});

/**
 * GET /api/admin/inventory
 * Get inventory levels with filtering and alerts
 */
router.get("/", validateQuery(getInventoryQuerySchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { 
      productId, 
      lowStock, 
      threshold = 5, 
      sort, 
      limit = 50, 
      offset = 0 
    } = req.query as any;

    // Get all products to build comprehensive inventory view
    const products = await storage.getProducts();
    
    // Build inventory data with product and variant info
    const inventoryData = [];
    
    for (const product of products) {
      const variants = await storage.getProductVariants(product.id);
      
      for (const variant of variants) {
        const inventory = await storage.getInventory(product.id, variant.id);
        
        // Combine multiple inventory records if they exist
        const totalAvailable = inventory.reduce((sum, inv) => sum + inv.quantityAvailable, variant.stockQuantity);
        const totalReserved = inventory.reduce((sum, inv) => sum + inv.quantityReserved, 0);
        
        const inventoryItem = {
          id: inventory[0]?.id || `${product.id}-${variant.id}`, // Use first inventory ID or generate one
          product: {
            id: product.id,
            name: product.name,
            slug: product.slug,
            isActive: product.isActive,
          },
          variant: {
            id: variant.id,
            name: variant.name,
            sku: variant.sku,
            isActive: variant.isActive,
            attributes: variant.attributes,
          },
          quantityAvailable: totalAvailable,
          quantityReserved: totalReserved,
          quantityTotal: totalAvailable + totalReserved,
          isLowStock: totalAvailable < threshold,
          stockStatus: totalAvailable === 0 ? 'out_of_stock' : 
                      totalAvailable < threshold ? 'low_stock' : 'in_stock',
          updatedAt: inventory[0]?.updatedAt || variant.updatedAt,
        };
        
        inventoryData.push(inventoryItem);
      }
    }

    // Apply filters
    let filteredInventory = inventoryData;
    
    if (productId) {
      filteredInventory = filteredInventory.filter(item => item.product.id === productId);
    }
    
    if (lowStock) {
      filteredInventory = filteredInventory.filter(item => item.isLowStock);
    }

    // Apply sorting
    let sortedInventory = [...filteredInventory];
    switch (sort) {
      case 'stock_asc':
        sortedInventory.sort((a, b) => a.quantityAvailable - b.quantityAvailable);
        break;
      case 'stock_desc':
        sortedInventory.sort((a, b) => b.quantityAvailable - a.quantityAvailable);
        break;
      case 'product_name':
        sortedInventory.sort((a, b) => a.product.name.localeCompare(b.product.name));
        break;
      case 'updated_desc':
      default:
        sortedInventory.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
    }

    // Apply pagination
    const paginatedInventory = sortedInventory.slice(offset, offset + limit);

    // Calculate summary statistics
    const summary = {
      total: sortedInventory.length,
      inStock: sortedInventory.filter(item => item.stockStatus === 'in_stock').length,
      lowStock: sortedInventory.filter(item => item.stockStatus === 'low_stock').length,
      outOfStock: sortedInventory.filter(item => item.stockStatus === 'out_of_stock').length,
      totalValue: sortedInventory.reduce((sum, item) => {
        const product = products.find(p => p.id === item.product.id);
        if (product) {
          const unitPrice = parseFloat(product.basePrice);
          return sum + (item.quantityAvailable * unitPrice);
        }
        return sum;
      }, 0),
      totalQuantity: sortedInventory.reduce((sum, item) => sum + item.quantityAvailable, 0),
      totalReserved: sortedInventory.reduce((sum, item) => sum + item.quantityReserved, 0),
    };

    res.json({
      inventory: paginatedInventory,
      pagination: {
        total: sortedInventory.length,
        limit,
        offset,
        hasMore: offset + limit < sortedInventory.length
      },
      summary,
      filters: {
        productId,
        lowStock,
        threshold,
        sort
      }
    });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({
      message: "Failed to fetch inventory"
    });
  }
});

/**
 * PUT /api/admin/inventory/:id
 * Update inventory levels
 */
router.put("/:id", 
  validateParams(inventoryParamsSchema), 
  validateRequest(updateInventorySchema), 
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { available, reserved } = req.body;

      // Build update object
      const updateData: { available?: number; reserved?: number } = {};
      if (available !== undefined) updateData.available = available;
      if (reserved !== undefined) updateData.reserved = reserved;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          message: "At least one field (available or reserved) must be provided"
        });
      }

      // Update inventory
      const updatedInventory = await storage.updateInventory(id, updateData);
      
      if (!updatedInventory) {
        return res.status(404).json({
          message: "Inventory record not found"
        });
      }

      // Get product and variant info for response
      const [product, variant] = await Promise.all([
        storage.getProduct(updatedInventory.productId),
        storage.getProductVariant(updatedInventory.variantId || '')
      ]);

      res.json({
        message: "Inventory updated successfully",
        inventory: {
          id: updatedInventory.id,
          product: product ? {
            id: product.id,
            name: product.name,
            slug: product.slug
          } : null,
          variant: variant ? {
            id: variant.id,
            name: variant.name,
            sku: variant.sku
          } : null,
          quantityAvailable: updatedInventory.quantityAvailable,
          quantityReserved: updatedInventory.quantityReserved,
          updatedAt: updatedInventory.updatedAt
        }
      });
    } catch (error) {
      console.error("Error updating inventory:", error);
      res.status(500).json({
        message: "Failed to update inventory"
      });
    }
  }
);

/**
 * GET /api/admin/inventory/alerts
 * Get low stock alerts and inventory warnings
 */
router.get("/alerts", async (req: AuthenticatedRequest, res) => {
  try {
    const threshold = parseInt(req.query.threshold as string) || 5;
    
    // Get all products and their variants
    const products = await storage.getProducts();
    
    const alerts = [];
    
    for (const product of products) {
      const variants = await storage.getProductVariants(product.id);
      
      for (const variant of variants) {
        if (!variant.isActive) continue; // Skip inactive variants
        
        const inventory = await storage.getInventory(product.id, variant.id);
        const totalAvailable = inventory.reduce((sum, inv) => sum + inv.quantityAvailable, variant.stockQuantity);
        const totalReserved = inventory.reduce((sum, inv) => sum + inv.quantityReserved, 0);
        
        // Generate alerts based on stock levels
        if (totalAvailable === 0) {
          alerts.push({
            type: 'out_of_stock',
            severity: 'critical',
            product: {
              id: product.id,
              name: product.name,
              slug: product.slug
            },
            variant: {
              id: variant.id,
              name: variant.name,
              sku: variant.sku
            },
            currentStock: totalAvailable,
            reservedStock: totalReserved,
            message: `${product.name} - ${variant.name} is out of stock`,
            actionRequired: 'Restock immediately or disable variant'
          });
        } else if (totalAvailable < threshold) {
          alerts.push({
            type: 'low_stock',
            severity: totalAvailable < threshold / 2 ? 'high' : 'medium',
            product: {
              id: product.id,
              name: product.name,
              slug: product.slug
            },
            variant: {
              id: variant.id,
              name: variant.name,
              sku: variant.sku
            },
            currentStock: totalAvailable,
            reservedStock: totalReserved,
            threshold,
            message: `${product.name} - ${variant.name} is low on stock (${totalAvailable} remaining)`,
            actionRequired: 'Consider restocking soon'
          });
        }
        
        // Check for high reserved stock that might indicate fulfillment issues
        if (totalReserved > totalAvailable && totalReserved > 0) {
          alerts.push({
            type: 'reserved_stock_high',
            severity: 'medium',
            product: {
              id: product.id,
              name: product.name,
              slug: product.slug
            },
            variant: {
              id: variant.id,
              name: variant.name,
              sku: variant.sku
            },
            currentStock: totalAvailable,
            reservedStock: totalReserved,
            message: `${product.name} - ${variant.name} has high reserved stock (${totalReserved} reserved vs ${totalAvailable} available)`,
            actionRequired: 'Review pending orders for fulfillment delays'
          });
        }
      }
    }

    // Sort alerts by severity
    const severityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
    alerts.sort((a, b) => severityOrder[a.severity as keyof typeof severityOrder] - severityOrder[b.severity as keyof typeof severityOrder]);

    // Group alerts by type for summary
    const alertSummary = alerts.reduce((summary, alert) => {
      summary[alert.type] = (summary[alert.type] || 0) + 1;
      return summary;
    }, {} as Record<string, number>);

    res.json({
      alerts,
      summary: {
        total: alerts.length,
        critical: alerts.filter(a => a.severity === 'critical').length,
        high: alerts.filter(a => a.severity === 'high').length,
        medium: alerts.filter(a => a.severity === 'medium').length,
        byType: alertSummary
      },
      threshold
    });
  } catch (error) {
    console.error("Error fetching inventory alerts:", error);
    res.status(500).json({
      message: "Failed to fetch inventory alerts"
    });
  }
});

export default router;