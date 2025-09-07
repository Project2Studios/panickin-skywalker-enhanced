import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { validateRequest, validateParams, validateQuery } from "../middleware/validation";

const router = Router();

// Validation schemas
const getCategoryParamsSchema = z.object({
  slug: z.string().min(1, "Category slug is required"),
});

const getCategoriesQuerySchema = z.object({
  includeProductCount: z.string().transform(val => val === 'true').optional(),
});

/**
 * GET /api/categories
 * Get all active categories with optional product counts
 */
router.get("/", validateQuery(getCategoriesQuerySchema), async (req, res) => {
  try {
    const { includeProductCount } = req.query as { includeProductCount?: boolean };
    
    const categories = await storage.getCategories();
    
    if (includeProductCount) {
      // Get product counts for each category
      const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
          const products = await storage.getProducts(category.id, undefined, true); // active products only
          return {
            ...category,
            productCount: products.length
          };
        })
      );
      
      return res.json({
        categories: categoriesWithCounts,
        total: categoriesWithCounts.length
      });
    }
    
    res.json({
      categories,
      total: categories.length
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      message: "Failed to fetch categories"
    });
  }
});

/**
 * GET /api/categories/:slug
 * Get category by slug with its products
 */
router.get("/:slug", validateParams(getCategoryParamsSchema), async (req, res) => {
  try {
    const { slug } = req.params;
    
    const category = await storage.getCategoryBySlug(slug);
    
    if (!category) {
      return res.status(404).json({
        message: "Category not found"
      });
    }
    
    // Get products in this category
    const products = await storage.getProducts(category.id, undefined, true); // active products only
    
    // Get product variants for each product to show pricing
    const productsWithVariants = await Promise.all(
      products.map(async (product) => {
        const variants = await storage.getProductVariants(product.id);
        const images = await storage.getProductImages(product.id);
        
        // Calculate min/max prices from variants
        const prices = variants.map(variant => 
          parseFloat(product.basePrice) + parseFloat(variant.priceAdjustment)
        );
        
        return {
          ...product,
          minPrice: prices.length > 0 ? Math.min(...prices) : parseFloat(product.basePrice),
          maxPrice: prices.length > 0 ? Math.max(...prices) : parseFloat(product.basePrice),
          variantCount: variants.length,
          images: images.slice(0, 1), // Just the primary image for listing
        };
      })
    );
    
    res.json({
      category,
      products: productsWithVariants,
      productCount: productsWithVariants.length
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({
      message: "Failed to fetch category"
    });
  }
});

export default router;