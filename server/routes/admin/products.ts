import { Router } from "express";
import { z } from "zod";
import { storage } from "../../storage";
import { validateRequest, validateParams, validateQuery } from "../../middleware/validation";
import { requireAdmin, AuthenticatedRequest } from "../../middleware/auth";

const router = Router();

// Apply admin authentication to all routes
router.use(requireAdmin);

// Validation schemas
const createProductSchema = z.object({
  categoryId: z.string().uuid("Invalid category ID"),
  name: z.string().min(1, "Product name is required"),
  slug: z.string().min(1, "Product slug is required"),
  description: z.string().optional(),
  basePrice: z.string().regex(/^\d+(\.\d{2})?$/, "Base price must be a valid decimal"),
  salePrice: z.string().regex(/^\d+(\.\d{2})?$/, "Sale price must be a valid decimal").optional(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  weight: z.string().regex(/^\d+(\.\d{2})?$/, "Weight must be a valid decimal").optional(),
  dimensions: z.object({
    length: z.number().min(0).optional(),
    width: z.number().min(0).optional(), 
    height: z.number().min(0).optional(),
  }).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

const updateProductSchema = createProductSchema.partial();

const createVariantSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  name: z.string().min(1, "Variant name is required"),
  priceAdjustment: z.string().regex(/^-?\d+(\.\d{2})?$/, "Price adjustment must be a valid decimal").default("0.00"),
  attributes: z.record(z.any()).optional(),
  stockQuantity: z.number().int().min(0, "Stock quantity must be non-negative").default(0),
  isActive: z.boolean().default(true),
});

const updateVariantSchema = createVariantSchema.partial();

const getProductsQuerySchema = z.object({
  category: z.string().optional(),
  featured: z.string().transform(val => val === 'true').optional(),
  active: z.string().transform(val => val === 'true').optional(),
  search: z.string().optional(),
  sort: z.enum(['name_asc', 'name_desc', 'created_asc', 'created_desc', 'price_asc', 'price_desc']).default('created_desc'),
  limit: z.string().transform(val => parseInt(val) || 50).optional(),
  offset: z.string().transform(val => parseInt(val) || 0).optional(),
});

const productParamsSchema = z.object({
  id: z.string().uuid("Invalid product ID"),
});

const variantParamsSchema = z.object({
  id: z.string().uuid("Invalid product ID"),
  variantId: z.string().uuid("Invalid variant ID"),
});

/**
 * GET /api/admin/products
 * List all products with advanced filtering for admin
 */
router.get("/", validateQuery(getProductsQuerySchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { 
      category, 
      featured, 
      active, 
      search, 
      sort, 
      limit = 50, 
      offset = 0 
    } = req.query as any;

    // Get category ID if category slug provided
    let categoryId: string | undefined;
    if (category) {
      const categoryRecord = await storage.getCategoryBySlug(category);
      if (!categoryRecord) {
        return res.status(404).json({
          message: "Category not found"
        });
      }
      categoryId = categoryRecord.id;
    }

    // Get products (including inactive for admin)
    let products = await storage.getProducts(categoryId, featured, active);

    // Apply search filter
    if (search) {
      const searchTerm = search.toLowerCase();
      products = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        (product.description && product.description.toLowerCase().includes(searchTerm)) ||
        product.slug.toLowerCase().includes(searchTerm)
      );
    }

    // Get enhanced product data
    const enhancedProducts = await Promise.all(
      products.map(async (product) => {
        const [variants, images, category] = await Promise.all([
          storage.getProductVariants(product.id),
          storage.getProductImages(product.id),
          storage.getCategory(product.categoryId)
        ]);

        // Calculate total stock across all variants
        const totalStock = variants.reduce((total, variant) => total + variant.stockQuantity, 0);
        const activeVariants = variants.filter(v => v.isActive);

        return {
          ...product,
          basePrice: parseFloat(product.basePrice),
          salePrice: product.salePrice ? parseFloat(product.salePrice) : null,
          category: category ? { 
            id: category.id, 
            name: category.name, 
            slug: category.slug 
          } : null,
          variantCount: variants.length,
          activeVariantCount: activeVariants.length,
          totalStock,
          lowStock: totalStock < 5,
          imageCount: images.length,
          primaryImage: images.find(img => img.displayOrder === 0) || images[0] || null,
        };
      })
    );

    // Apply sorting
    let sortedProducts = [...enhancedProducts];
    switch (sort) {
      case 'name_asc':
        sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price_asc':
        sortedProducts.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case 'price_desc':
        sortedProducts.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case 'created_asc':
        sortedProducts.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'created_desc':
      default:
        sortedProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    // Apply pagination
    const paginatedProducts = sortedProducts.slice(offset, offset + limit);

    res.json({
      products: paginatedProducts,
      pagination: {
        total: sortedProducts.length,
        limit,
        offset,
        hasMore: offset + limit < sortedProducts.length
      },
      summary: {
        total: sortedProducts.length,
        active: sortedProducts.filter(p => p.isActive).length,
        inactive: sortedProducts.filter(p => !p.isActive).length,
        featured: sortedProducts.filter(p => p.isFeatured).length,
        lowStock: sortedProducts.filter(p => p.lowStock).length,
      }
    });
  } catch (error) {
    console.error("Error fetching admin products:", error);
    res.status(500).json({
      message: "Failed to fetch products"
    });
  }
});

/**
 * POST /api/admin/products
 * Create new product
 */
router.post("/", validateRequest(createProductSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const productData = req.body;

    // Verify category exists
    const category = await storage.getCategory(productData.categoryId);
    if (!category) {
      return res.status(400).json({
        message: "Category not found",
        field: "categoryId"
      });
    }

    // Check if slug is unique
    const existingProduct = await storage.getProductBySlug(productData.slug);
    if (existingProduct) {
      return res.status(400).json({
        message: "Product slug already exists",
        field: "slug"
      });
    }

    // Create product
    const product = await storage.createProduct(productData);

    res.status(201).json({
      message: "Product created successfully",
      product: {
        ...product,
        basePrice: parseFloat(product.basePrice),
        salePrice: product.salePrice ? parseFloat(product.salePrice) : null,
        category: {
          id: category.id,
          name: category.name,
          slug: category.slug
        }
      }
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      message: "Failed to create product"
    });
  }
});

/**
 * PUT /api/admin/products/:id
 * Update product
 */
router.put("/:id", 
  validateParams(productParamsSchema), 
  validateRequest(updateProductSchema), 
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Verify product exists
      const existingProduct = await storage.getProduct(id);
      if (!existingProduct) {
        return res.status(404).json({
          message: "Product not found"
        });
      }

      // If updating category, verify it exists
      if (updateData.categoryId) {
        const category = await storage.getCategory(updateData.categoryId);
        if (!category) {
          return res.status(400).json({
            message: "Category not found",
            field: "categoryId"
          });
        }
      }

      // If updating slug, verify it's unique (excluding current product)
      if (updateData.slug && updateData.slug !== existingProduct.slug) {
        const existingSlugProduct = await storage.getProductBySlug(updateData.slug);
        if (existingSlugProduct && existingSlugProduct.id !== id) {
          return res.status(400).json({
            message: "Product slug already exists",
            field: "slug"
          });
        }
      }

      // Update product
      const updatedProduct = await storage.updateProduct(id, updateData);
      
      if (!updatedProduct) {
        return res.status(500).json({
          message: "Failed to update product"
        });
      }

      // Get updated category info if changed
      const category = await storage.getCategory(updatedProduct.categoryId);

      res.json({
        message: "Product updated successfully",
        product: {
          ...updatedProduct,
          basePrice: parseFloat(updatedProduct.basePrice),
          salePrice: updatedProduct.salePrice ? parseFloat(updatedProduct.salePrice) : null,
          category: category ? {
            id: category.id,
            name: category.name,
            slug: category.slug
          } : null
        }
      });
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({
        message: "Failed to update product"
      });
    }
  }
);

/**
 * DELETE /api/admin/products/:id
 * Delete product
 */
router.delete("/:id", validateParams(productParamsSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    // Verify product exists
    const product = await storage.getProduct(id);
    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    // Check if product has variants (could prevent deletion)
    const variants = await storage.getProductVariants(id);
    if (variants.length > 0) {
      return res.status(400).json({
        message: "Cannot delete product with variants. Delete variants first.",
        variantCount: variants.length
      });
    }

    const deleted = await storage.deleteProduct(id);
    
    if (!deleted) {
      return res.status(500).json({
        message: "Failed to delete product"
      });
    }

    res.json({
      message: "Product deleted successfully",
      deletedId: id
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      message: "Failed to delete product"
    });
  }
});

/**
 * POST /api/admin/products/:id/variants
 * Create product variant
 */
router.post("/:id/variants", 
  validateParams(productParamsSchema), 
  validateRequest(createVariantSchema), 
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id: productId } = req.params;
      const variantData = req.body;

      // Verify product exists
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({
          message: "Product not found"
        });
      }

      // Check if SKU is unique
      const existingVariants = await storage.getProductVariants(productId);
      if (existingVariants.some(v => v.sku === variantData.sku)) {
        return res.status(400).json({
          message: "SKU already exists",
          field: "sku"
        });
      }

      // Create variant
      const variant = await storage.createProductVariant({
        ...variantData,
        productId
      });

      res.status(201).json({
        message: "Product variant created successfully",
        variant: {
          ...variant,
          priceAdjustment: parseFloat(variant.priceAdjustment)
        }
      });
    } catch (error) {
      console.error("Error creating product variant:", error);
      res.status(500).json({
        message: "Failed to create product variant"
      });
    }
  }
);

/**
 * PUT /api/admin/products/:id/variants/:variantId
 * Update product variant
 */
router.put("/:id/variants/:variantId", 
  validateParams(variantParamsSchema), 
  validateRequest(updateVariantSchema), 
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id: productId, variantId } = req.params;
      const updateData = req.body;

      // Verify variant exists and belongs to product
      const variant = await storage.getProductVariant(variantId);
      if (!variant || variant.productId !== productId) {
        return res.status(404).json({
          message: "Product variant not found"
        });
      }

      // If updating SKU, check uniqueness
      if (updateData.sku && updateData.sku !== variant.sku) {
        const existingVariants = await storage.getProductVariants(productId);
        if (existingVariants.some(v => v.sku === updateData.sku && v.id !== variantId)) {
          return res.status(400).json({
            message: "SKU already exists",
            field: "sku"
          });
        }
      }

      // Update variant
      const updatedVariant = await storage.updateProductVariant(variantId, updateData);
      
      if (!updatedVariant) {
        return res.status(500).json({
          message: "Failed to update variant"
        });
      }

      res.json({
        message: "Product variant updated successfully",
        variant: {
          ...updatedVariant,
          priceAdjustment: parseFloat(updatedVariant.priceAdjustment)
        }
      });
    } catch (error) {
      console.error("Error updating product variant:", error);
      res.status(500).json({
        message: "Failed to update product variant"
      });
    }
  }
);

/**
 * DELETE /api/admin/products/:id/variants/:variantId
 * Delete product variant
 */
router.delete("/:id/variants/:variantId", validateParams(variantParamsSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { id: productId, variantId } = req.params;

    // Verify variant exists and belongs to product
    const variant = await storage.getProductVariant(variantId);
    if (!variant || variant.productId !== productId) {
      return res.status(404).json({
        message: "Product variant not found"
      });
    }

    const deleted = await storage.deleteProductVariant(variantId);
    
    if (!deleted) {
      return res.status(500).json({
        message: "Failed to delete variant"
      });
    }

    res.json({
      message: "Product variant deleted successfully",
      deletedId: variantId
    });
  } catch (error) {
    console.error("Error deleting product variant:", error);
    res.status(500).json({
      message: "Failed to delete product variant"
    });
  }
});

export default router;