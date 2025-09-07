import { Router } from "express";
import { z } from "zod";
import { storage } from "../../storage";
import { validateRequest, validateParams } from "../../middleware/validation";
import { requireAdmin, AuthenticatedRequest } from "../../middleware/auth";

const router = Router();

// Apply admin authentication to all routes
router.use(requireAdmin);

// Validation schemas
const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  slug: z.string().min(1, "Category slug is required"),
  description: z.string().optional(),
  imageUrl: z.string().url("Invalid image URL").optional(),
  displayOrder: z.number().int().min(0, "Display order must be non-negative").default(0),
});

const updateCategorySchema = createCategorySchema.partial();

const categoryParamsSchema = z.object({
  id: z.string().uuid("Invalid category ID"),
});

/**
 * GET /api/admin/categories
 * List all categories for admin
 */
router.get("/", async (req: AuthenticatedRequest, res) => {
  try {
    const categories = await storage.getCategories();

    // Get product counts for each category
    const categoriesWithDetails = await Promise.all(
      categories.map(async (category) => {
        const products = await storage.getProducts(category.id);
        const activeProducts = products.filter(p => p.isActive);
        
        return {
          ...category,
          productCount: products.length,
          activeProductCount: activeProducts.length,
          inactiveProductCount: products.length - activeProducts.length,
        };
      })
    );

    res.json({
      categories: categoriesWithDetails,
      total: categoriesWithDetails.length,
      summary: {
        total: categoriesWithDetails.length,
        withProducts: categoriesWithDetails.filter(c => c.productCount > 0).length,
        empty: categoriesWithDetails.filter(c => c.productCount === 0).length,
      }
    });
  } catch (error) {
    console.error("Error fetching admin categories:", error);
    res.status(500).json({
      message: "Failed to fetch categories"
    });
  }
});

/**
 * POST /api/admin/categories
 * Create new category
 */
router.post("/", validateRequest(createCategorySchema), async (req: AuthenticatedRequest, res) => {
  try {
    const categoryData = req.body;

    // Check if slug is unique
    const existingCategory = await storage.getCategoryBySlug(categoryData.slug);
    if (existingCategory) {
      return res.status(400).json({
        message: "Category slug already exists",
        field: "slug"
      });
    }

    // Create category
    const category = await storage.createCategory(categoryData);

    res.status(201).json({
      message: "Category created successfully",
      category
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({
      message: "Failed to create category"
    });
  }
});

/**
 * PUT /api/admin/categories/:id
 * Update category
 */
router.put("/:id", 
  validateParams(categoryParamsSchema), 
  validateRequest(updateCategorySchema), 
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Verify category exists
      const existingCategory = await storage.getCategory(id);
      if (!existingCategory) {
        return res.status(404).json({
          message: "Category not found"
        });
      }

      // If updating slug, verify it's unique (excluding current category)
      if (updateData.slug && updateData.slug !== existingCategory.slug) {
        const existingSlugCategory = await storage.getCategoryBySlug(updateData.slug);
        if (existingSlugCategory && existingSlugCategory.id !== id) {
          return res.status(400).json({
            message: "Category slug already exists",
            field: "slug"
          });
        }
      }

      // Update category
      const updatedCategory = await storage.updateCategory(id, updateData);
      
      if (!updatedCategory) {
        return res.status(500).json({
          message: "Failed to update category"
        });
      }

      res.json({
        message: "Category updated successfully",
        category: updatedCategory
      });
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({
        message: "Failed to update category"
      });
    }
  }
);

/**
 * DELETE /api/admin/categories/:id
 * Delete category
 */
router.delete("/:id", validateParams(categoryParamsSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    // Verify category exists
    const category = await storage.getCategory(id);
    if (!category) {
      return res.status(404).json({
        message: "Category not found"
      });
    }

    // Check if category has products (prevent deletion if it does)
    const products = await storage.getProducts(id);
    if (products.length > 0) {
      return res.status(400).json({
        message: "Cannot delete category with products. Please move or delete products first.",
        productCount: products.length
      });
    }

    const deleted = await storage.deleteCategory(id);
    
    if (!deleted) {
      return res.status(500).json({
        message: "Failed to delete category"
      });
    }

    res.json({
      message: "Category deleted successfully",
      deletedId: id
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({
      message: "Failed to delete category"
    });
  }
});

export default router;