import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { validateRequest, validateParams } from "../middleware/validation";
import { optionalAuth, ensureSession, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// Validation schemas
const addToCartSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  variantId: z.string().uuid("Invalid variant ID"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").max(50, "Maximum quantity is 50"),
});

const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0, "Quantity must be at least 0").max(50, "Maximum quantity is 50"),
});

const cartItemParamsSchema = z.object({
  id: z.string().uuid("Invalid cart item ID"),
});

const mergeCartSchema = z.object({
  guestSessionId: z.string().min(1, "Guest session ID is required"),
});

// Apply session and optional auth middleware to all cart routes
router.use(ensureSession);
router.use(optionalAuth);

/**
 * GET /api/cart
 * Get current cart (session or user-based)
 */
router.get("/", async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'] as string;

    const cartItems = await storage.getCartItems(userId, userId ? undefined : sessionId);

    // Get detailed product information for cart items
    const detailedCartItems = await Promise.all(
      cartItems.map(async (item) => {
        const [product, variant, images] = await Promise.all([
          storage.getProduct(item.productId),
          storage.getProductVariant(item.variantId),
          storage.getProductImages(item.productId)
        ]);

        if (!product || !variant) {
          console.warn(`Cart item ${item.id} has invalid product or variant`);
          return null;
        }

        // Check stock availability
        const inventory = await storage.getInventory(item.productId, item.variantId);
        const availableStock = inventory.reduce((total, inv) => total + inv.quantityAvailable, variant.stockQuantity);
        
        const finalPrice = parseFloat(product.basePrice) + parseFloat(variant.priceAdjustment);
        const itemTotal = finalPrice * item.quantity;

        return {
          id: item.id,
          product: {
            id: product.id,
            name: product.name,
            slug: product.slug,
            basePrice: parseFloat(product.basePrice),
          },
          variant: {
            id: variant.id,
            name: variant.name,
            sku: variant.sku,
            priceAdjustment: parseFloat(variant.priceAdjustment),
            attributes: variant.attributes,
          },
          quantity: item.quantity,
          price: finalPrice,
          total: itemTotal,
          primaryImage: images.find(img => img.displayOrder === 0) || images[0] || null,
          inStock: availableStock > 0,
          availableStock,
          maxQuantity: Math.min(50, availableStock),
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        };
      })
    );

    // Filter out null items (invalid products)
    const validCartItems = detailedCartItems.filter(item => item !== null);

    // Calculate totals
    const subtotal = validCartItems.reduce((total, item) => total + item.total, 0);
    const itemCount = validCartItems.reduce((total, item) => total + item.quantity, 0);

    res.json({
      items: validCartItems,
      summary: {
        itemCount,
        subtotal,
        // In a real app, you'd calculate tax and shipping here
        tax: 0,
        shipping: 0,
        total: subtotal
      }
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({
      message: "Failed to fetch cart"
    });
  }
});

/**
 * POST /api/cart/items
 * Add item to cart
 */
router.post("/items", validateRequest(addToCartSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { productId, variantId, quantity } = req.body;
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'] as string;

    // Verify product and variant exist and are active
    const [product, variant] = await Promise.all([
      storage.getProduct(productId),
      storage.getProductVariant(variantId)
    ]);

    if (!product || !product.isActive) {
      return res.status(404).json({
        message: "Product not found or unavailable"
      });
    }

    if (!variant || !variant.isActive || variant.productId !== productId) {
      return res.status(404).json({
        message: "Product variant not found or unavailable"
      });
    }

    // Check stock availability
    const inventory = await storage.getInventory(productId, variantId);
    const availableStock = inventory.reduce((total, inv) => total + inv.quantityAvailable, variant.stockQuantity);

    if (availableStock < quantity) {
      return res.status(400).json({
        message: `Only ${availableStock} items available in stock`,
        availableStock
      });
    }

    // Check if item already exists in cart
    const existingCartItems = await storage.getCartItems(userId, userId ? undefined : sessionId);
    const existingItem = existingCartItems.find(item => 
      item.productId === productId && item.variantId === variantId
    );

    if (existingItem) {
      // Update quantity of existing item
      const newQuantity = existingItem.quantity + quantity;
      
      if (newQuantity > availableStock) {
        return res.status(400).json({
          message: `Cannot add ${quantity} more items. Only ${availableStock - existingItem.quantity} additional items available`,
          availableStock,
          currentQuantity: existingItem.quantity
        });
      }

      const updatedItem = await storage.updateCartItem(existingItem.id, newQuantity);
      
      if (!updatedItem) {
        return res.status(500).json({
          message: "Failed to update cart item"
        });
      }

      return res.json({
        message: "Cart item quantity updated",
        item: {
          id: updatedItem.id,
          quantity: updatedItem.quantity,
          total: (parseFloat(product.basePrice) + parseFloat(variant.priceAdjustment)) * updatedItem.quantity
        }
      });
    }

    // Add new item to cart
    const cartItem = await storage.addToCart({
      productId,
      variantId,
      quantity,
      userId,
      sessionId: userId ? undefined : sessionId,
    });

    const finalPrice = parseFloat(product.basePrice) + parseFloat(variant.priceAdjustment);

    res.status(201).json({
      message: "Item added to cart",
      item: {
        id: cartItem.id,
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
        quantity: cartItem.quantity,
        price: finalPrice,
        total: finalPrice * cartItem.quantity,
        createdAt: cartItem.createdAt
      }
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({
      message: "Failed to add item to cart"
    });
  }
});

/**
 * PUT /api/cart/items/:id
 * Update cart item quantity
 */
router.put("/items/:id", 
  validateParams(cartItemParamsSchema), 
  validateRequest(updateCartItemSchema), 
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      const userId = req.user?.id;
      const sessionId = req.headers['x-session-id'] as string;

      // Verify the cart item exists and belongs to the user/session
      const existingCartItems = await storage.getCartItems(userId, userId ? undefined : sessionId);
      const cartItem = existingCartItems.find(item => item.id === id);

      if (!cartItem) {
        return res.status(404).json({
          message: "Cart item not found"
        });
      }

      // If quantity is 0, remove the item
      if (quantity === 0) {
        const removed = await storage.removeFromCart(id);
        if (!removed) {
          return res.status(500).json({
            message: "Failed to remove cart item"
          });
        }

        return res.json({
          message: "Item removed from cart",
          removed: true
        });
      }

      // Check stock availability for new quantity
      const [product, variant] = await Promise.all([
        storage.getProduct(cartItem.productId),
        storage.getProductVariant(cartItem.variantId)
      ]);

      if (!product || !variant) {
        return res.status(404).json({
          message: "Product or variant no longer available"
        });
      }

      const inventory = await storage.getInventory(cartItem.productId, cartItem.variantId);
      const availableStock = inventory.reduce((total, inv) => total + inv.quantityAvailable, variant.stockQuantity);

      if (availableStock < quantity) {
        return res.status(400).json({
          message: `Only ${availableStock} items available in stock`,
          availableStock,
          requestedQuantity: quantity
        });
      }

      // Update the cart item
      const updatedItem = await storage.updateCartItem(id, quantity);
      
      if (!updatedItem) {
        return res.status(500).json({
          message: "Failed to update cart item"
        });
      }

      const finalPrice = parseFloat(product.basePrice) + parseFloat(variant.priceAdjustment);

      res.json({
        message: "Cart item updated",
        item: {
          id: updatedItem.id,
          quantity: updatedItem.quantity,
          price: finalPrice,
          total: finalPrice * updatedItem.quantity,
          updatedAt: updatedItem.updatedAt
        }
      });
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({
        message: "Failed to update cart item"
      });
    }
  }
);

/**
 * DELETE /api/cart/items/:id
 * Remove item from cart
 */
router.delete("/items/:id", validateParams(cartItemParamsSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'] as string;

    // Verify the cart item exists and belongs to the user/session
    const existingCartItems = await storage.getCartItems(userId, userId ? undefined : sessionId);
    const cartItem = existingCartItems.find(item => item.id === id);

    if (!cartItem) {
      return res.status(404).json({
        message: "Cart item not found"
      });
    }

    const removed = await storage.removeFromCart(id);
    
    if (!removed) {
      return res.status(500).json({
        message: "Failed to remove cart item"
      });
    }

    res.json({
      message: "Item removed from cart",
      removedItemId: id
    });
  } catch (error) {
    console.error("Error removing cart item:", error);
    res.status(500).json({
      message: "Failed to remove cart item"
    });
  }
});

/**
 * DELETE /api/cart
 * Clear entire cart
 */
router.delete("/", async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'] as string;

    const cleared = await storage.clearCart(userId, userId ? undefined : sessionId);
    
    if (!cleared) {
      return res.status(404).json({
        message: "No cart found to clear"
      });
    }

    res.json({
      message: "Cart cleared successfully"
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({
      message: "Failed to clear cart"
    });
  }
});

/**
 * POST /api/cart/merge
 * Merge guest cart with user cart on login
 */
router.post("/merge", validateRequest(mergeCartSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { guestSessionId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required to merge cart"
      });
    }

    // Get both carts
    const [userCartItems, guestCartItems] = await Promise.all([
      storage.getCartItems(userId),
      storage.getCartItems(undefined, guestSessionId)
    ]);

    let mergedItems = 0;
    let conflictItems = 0;

    // Merge guest cart items into user cart
    for (const guestItem of guestCartItems) {
      // Check if user already has this product/variant combination
      const existingUserItem = userCartItems.find(item => 
        item.productId === guestItem.productId && item.variantId === guestItem.variantId
      );

      if (existingUserItem) {
        // Merge quantities
        const newQuantity = existingUserItem.quantity + guestItem.quantity;
        
        // Check stock limits
        const [product, variant] = await Promise.all([
          storage.getProduct(guestItem.productId),
          storage.getProductVariant(guestItem.variantId)
        ]);

        if (product && variant) {
          const inventory = await storage.getInventory(guestItem.productId, guestItem.variantId);
          const availableStock = inventory.reduce((total, inv) => total + inv.quantityAvailable, variant.stockQuantity);
          
          const finalQuantity = Math.min(newQuantity, availableStock, 50);
          await storage.updateCartItem(existingUserItem.id, finalQuantity);
          
          if (finalQuantity < newQuantity) {
            conflictItems++;
          }
        }
      } else {
        // Add guest item to user cart
        try {
          await storage.addToCart({
            productId: guestItem.productId,
            variantId: guestItem.variantId,
            quantity: guestItem.quantity,
            userId,
            sessionId: undefined,
          });
          mergedItems++;
        } catch (error) {
          console.warn("Failed to merge cart item:", error);
          conflictItems++;
        }
      }
    }

    // Clear guest cart
    await storage.clearCart(undefined, guestSessionId);

    res.json({
      message: "Cart merged successfully",
      merged: mergedItems,
      conflicts: conflictItems,
      total: mergedItems + conflictItems
    });
  } catch (error) {
    console.error("Error merging cart:", error);
    res.status(500).json({
      message: "Failed to merge cart"
    });
  }
});

export default router;