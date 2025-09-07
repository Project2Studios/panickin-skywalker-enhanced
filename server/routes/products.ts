import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { validateParams, validateQuery } from "../middleware/validation";

const router = Router();

// Validation schemas
const getProductsQuerySchema = z.object({
  category: z.string().optional(),
  featured: z.string().transform(val => val === 'true').optional(),
  search: z.string().optional(),
  sort: z.enum(['name_asc', 'name_desc', 'price_asc', 'price_desc', 'newest', 'oldest']).default('newest'),
  limit: z.string().transform(val => parseInt(val) || 20).optional(),
  offset: z.string().transform(val => parseInt(val) || 0).optional(),
  minPrice: z.string().transform(val => parseFloat(val) || 0).optional(),
  maxPrice: z.string().transform(val => parseFloat(val) || Number.MAX_SAFE_INTEGER).optional(),
});

const getProductParamsSchema = z.object({
  slug: z.string().min(1, "Product slug is required"),
});

const getProductByIdSchema = z.object({
  id: z.string().uuid("Invalid product ID"),
});

/**
 * GET /api/products
 * List products with filtering, sorting, and pagination
 */
router.get("/", validateQuery(getProductsQuerySchema), async (req, res) => {
  try {
    const { 
      category, 
      featured, 
      search, 
      sort, 
      limit = 20, 
      offset = 0, 
      minPrice = 0, 
      maxPrice = Number.MAX_SAFE_INTEGER 
    } = req.query as any;

    // Get category ID if category slug is provided
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

    // Get products with basic filters
    let products = await storage.getProducts(categoryId, featured, true); // active products only

    // Apply search filter
    if (search) {
      const searchTerm = search.toLowerCase();
      products = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        (product.description && product.description.toLowerCase().includes(searchTerm))
      );
    }

    // Get enhanced product data with variants, images, and pricing
    const enhancedProducts = await Promise.all(
      products.map(async (product) => {
        const variants = await storage.getProductVariants(product.id);
        const images = await storage.getProductImages(product.id);
        const category = await storage.getCategory(product.categoryId);
        
        // Calculate pricing from variants
        const prices = variants.map(variant => 
          parseFloat(product.basePrice) + parseFloat(variant.priceAdjustment)
        );
        
        const minVariantPrice = prices.length > 0 ? Math.min(...prices) : parseFloat(product.basePrice);
        const maxVariantPrice = prices.length > 0 ? Math.max(...prices) : parseFloat(product.basePrice);
        
        // Use sale price if available
        const displayPrice = product.salePrice ? parseFloat(product.salePrice) : minVariantPrice;
        
        return {
          ...product,
          category: category ? { id: category.id, name: category.name, slug: category.slug } : null,
          price: displayPrice,
          originalPrice: product.salePrice ? parseFloat(product.basePrice) : null,
          priceRange: minVariantPrice !== maxVariantPrice ? { min: minVariantPrice, max: maxVariantPrice } : null,
          variantCount: variants.length,
          images: images,
          primaryImage: images.find(img => img.displayOrder === 0) || images[0] || null,
          inStock: variants.some(variant => variant.stockQuantity > 0),
          totalStock: variants.reduce((total, variant) => total + variant.stockQuantity, 0)
        };
      })
    );

    // Apply price filters
    const filteredProducts = enhancedProducts.filter(product => 
      product.price >= minPrice && product.price <= maxPrice
    );

    // Apply sorting
    let sortedProducts = [...filteredProducts];
    switch (sort) {
      case 'name_asc':
        sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price_asc':
        sortedProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        sortedProducts.sort((a, b) => b.price - a.price);
        break;
      case 'oldest':
        sortedProducts.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'newest':
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
      filters: {
        category,
        featured,
        search,
        sort,
        priceRange: { min: minPrice, max: maxPrice }
      }
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      message: "Failed to fetch products"
    });
  }
});

/**
 * GET /api/products/:slug
 * Get single product by slug with full details
 */
router.get("/:slug", validateParams(getProductParamsSchema), async (req, res) => {
  try {
    const { slug } = req.params;
    
    const product = await storage.getProductBySlug(slug);
    
    if (!product || !product.isActive) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    // Get full product details
    const [variants, images, category] = await Promise.all([
      storage.getProductVariants(product.id),
      storage.getProductImages(product.id),
      storage.getCategory(product.categoryId)
    ]);

    // Get inventory for all variants
    const variantsWithInventory = await Promise.all(
      variants.map(async (variant) => {
        const inventory = await storage.getInventory(product.id, variant.id);
        const totalStock = inventory.reduce((total, inv) => total + inv.quantityAvailable, variant.stockQuantity);
        const reserved = inventory.reduce((total, inv) => total + inv.quantityReserved, 0);
        
        return {
          ...variant,
          inventory: {
            available: totalStock,
            reserved,
            inStock: totalStock > 0
          }
        };
      })
    );

    // Calculate pricing
    const prices = variantsWithInventory.map(variant => 
      parseFloat(product.basePrice) + parseFloat(variant.priceAdjustment)
    );
    
    const minPrice = prices.length > 0 ? Math.min(...prices) : parseFloat(product.basePrice);
    const maxPrice = prices.length > 0 ? Math.max(...prices) : parseFloat(product.basePrice);

    // Get related products (same category, excluding current product)
    const relatedProducts = await getRelatedProducts(product.id, product.categoryId);

    const enhancedProduct = {
      ...product,
      category: category ? { id: category.id, name: category.name, slug: category.slug } : null,
      basePrice: parseFloat(product.basePrice),
      salePrice: product.salePrice ? parseFloat(product.salePrice) : null,
      priceRange: minPrice !== maxPrice ? { min: minPrice, max: maxPrice } : null,
      variants: variantsWithInventory.filter(v => v.isActive),
      images,
      inStock: variantsWithInventory.some(variant => variant.inventory.available > 0),
      totalStock: variantsWithInventory.reduce((total, variant) => total + variant.inventory.available, 0),
      relatedProducts
    };

    res.json({ product: enhancedProduct });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      message: "Failed to fetch product"
    });
  }
});

/**
 * GET /api/products/:id/variants
 * Get all variants for a product
 */
router.get("/:id/variants", validateParams(getProductByIdSchema), async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await storage.getProduct(id);
    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    const variants = await storage.getProductVariants(id);
    
    // Get inventory for each variant
    const variantsWithInventory = await Promise.all(
      variants.map(async (variant) => {
        const inventory = await storage.getInventory(product.id, variant.id);
        const totalStock = inventory.reduce((total, inv) => total + inv.quantityAvailable, variant.stockQuantity);
        const reserved = inventory.reduce((total, inv) => total + inv.quantityReserved, 0);
        
        return {
          ...variant,
          finalPrice: parseFloat(product.basePrice) + parseFloat(variant.priceAdjustment),
          inventory: {
            available: totalStock,
            reserved,
            inStock: totalStock > 0
          }
        };
      })
    );

    res.json({
      variants: variantsWithInventory.filter(v => v.isActive),
      product: {
        id: product.id,
        name: product.name,
        basePrice: parseFloat(product.basePrice)
      }
    });
  } catch (error) {
    console.error("Error fetching product variants:", error);
    res.status(500).json({
      message: "Failed to fetch product variants"
    });
  }
});

/**
 * GET /api/products/:id/related
 * Get related products
 */
router.get("/:id/related", validateParams(getProductByIdSchema), async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await storage.getProduct(id);
    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    const relatedProducts = await getRelatedProducts(id, product.categoryId);

    res.json({
      related: relatedProducts,
      total: relatedProducts.length
    });
  } catch (error) {
    console.error("Error fetching related products:", error);
    res.status(500).json({
      message: "Failed to fetch related products"
    });
  }
});

// Helper function to get related products
async function getRelatedProducts(productId: string, categoryId: string, limit: number = 4) {
  try {
    const categoryProducts = await storage.getProducts(categoryId, undefined, true);
    
    // Filter out current product and limit results
    const related = categoryProducts
      .filter(p => p.id !== productId)
      .slice(0, limit);

    // Get enhanced data for related products
    const enhancedRelated = await Promise.all(
      related.map(async (product) => {
        const [variants, images] = await Promise.all([
          storage.getProductVariants(product.id),
          storage.getProductImages(product.id)
        ]);

        const prices = variants.map(variant => 
          parseFloat(product.basePrice) + parseFloat(variant.priceAdjustment)
        );

        const minPrice = prices.length > 0 ? Math.min(...prices) : parseFloat(product.basePrice);
        
        return {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.salePrice ? parseFloat(product.salePrice) : minPrice,
          originalPrice: product.salePrice ? parseFloat(product.basePrice) : null,
          primaryImage: images.find(img => img.displayOrder === 0) || images[0] || null,
          inStock: variants.some(variant => variant.stockQuantity > 0)
        };
      })
    );

    return enhancedRelated;
  } catch (error) {
    console.error("Error getting related products:", error);
    return [];
  }
}

export default router;