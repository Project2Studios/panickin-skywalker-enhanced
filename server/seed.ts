#!/usr/bin/env tsx

import { config } from "dotenv";
config();

import { db } from "./db";
import { 
  categories, 
  products, 
  productVariants, 
  productImages, 
  inventory 
} from "@shared/schema";

/**
 * Seed script for Panickin' Skywalker merch store
 * 
 * To run: npx tsx server/seed.ts
 */

async function seed() {
  console.log("🌱 Starting seed process...");

  try {
    // 1. Create categories
    console.log("📂 Creating categories...");
    const categoryData = [
      {
        name: "T-Shirts",
        slug: "t-shirts",
        description: "Premium cotton t-shirts with Panickin' Skywalker designs",
        displayOrder: 1,
      },
      {
        name: "Hoodies",
        slug: "hoodies",
        description: "Comfortable hoodies perfect for concerts and daily wear",
        displayOrder: 2,
      },
      {
        name: "Vinyl Records",
        slug: "vinyl",
        description: "Limited edition vinyl releases and classic albums",
        displayOrder: 3,
      },
      {
        name: "Accessories",
        slug: "accessories",
        description: "Stickers, buttons, patches, and other band merchandise",
        displayOrder: 4,
      },
      {
        name: "Digital Downloads",
        slug: "digital",
        description: "High-quality digital music downloads",
        displayOrder: 5,
      },
    ];

    const createdCategories = await db.insert(categories).values(categoryData).returning();
    console.log(`✅ Created ${createdCategories.length} categories`);

    // 2. Create products
    console.log("🎵 Creating products...");
    const productData = [
      // T-Shirts
      {
        categoryId: createdCategories[0].id, // T-Shirts
        name: "Classic Logo T-Shirt",
        slug: "classic-logo-tshirt",
        description: "Our iconic logo printed on premium 100% cotton. Available in multiple colors and sizes.",
        basePrice: "25.00",
        isFeatured: true,
        weight: "0.5",
        metaTitle: "Panickin' Skywalker Classic Logo T-Shirt",
        metaDescription: "Official Panickin' Skywalker band t-shirt with classic logo design",
      },
      {
        categoryId: createdCategories[0].id,
        name: "Tour 2024 T-Shirt",
        slug: "tour-2024-tshirt",
        description: "Exclusive tour merchandise featuring all 2024 tour dates on the back.",
        basePrice: "30.00",
        salePrice: "25.00",
        isFeatured: true,
        weight: "0.5",
      },
      
      // Hoodies
      {
        categoryId: createdCategories[1].id, // Hoodies
        name: "Starfield Hoodie",
        slug: "starfield-hoodie",
        description: "Cozy pullover hoodie with cosmic starfield design. Perfect for chilly nights.",
        basePrice: "55.00",
        isFeatured: true,
        weight: "1.2",
      },
      
      // Vinyl
      {
        categoryId: createdCategories[2].id, // Vinyl
        name: "Cosmic Drifter - Limited Edition Vinyl",
        slug: "cosmic-drifter-vinyl",
        description: "Limited edition transparent blue vinyl with gold splatter. Only 500 copies pressed.",
        basePrice: "35.00",
        isFeatured: true,
        weight: "0.8",
        dimensions: { length: 12.4, width: 12.4, height: 0.5 },
      },
      
      // Accessories
      {
        categoryId: createdCategories[3].id, // Accessories
        name: "Sticker Pack",
        slug: "sticker-pack",
        description: "Set of 5 weather-resistant vinyl stickers featuring album artwork and logos.",
        basePrice: "8.00",
        weight: "0.1",
      },
      {
        categoryId: createdCategories[3].id,
        name: "Embroidered Patch Set",
        slug: "patch-set",
        description: "Three iron-on patches: main logo, cosmic eye, and tour badge.",
        basePrice: "15.00",
        weight: "0.2",
      },
    ];

    const createdProducts = await db.insert(products).values(productData).returning();
    console.log(`✅ Created ${createdProducts.length} products`);

    // 3. Create product variants for clothing items
    console.log("👕 Creating product variants...");
    const variantData = [];
    
    // T-Shirt variants (first two products)
    const tshirtProducts = createdProducts.slice(0, 2);
    const sizes = ["S", "M", "L", "XL", "XXL"];
    const colors = ["Black", "White", "Navy", "Heather Gray"];
    
    for (const product of tshirtProducts) {
      for (const size of sizes) {
        for (const color of colors) {
          const priceAdjustment = size === "XXL" ? "3.00" : "0.00";
          variantData.push({
            productId: product.id,
            sku: `${product.slug.toUpperCase()}-${size}-${color.replace(" ", "").toUpperCase()}`,
            name: `${size} - ${color}`,
            priceAdjustment,
            attributes: { size, color },
            stockQuantity: 25,
          });
        }
      }
    }
    
    // Hoodie variants
    const hoodieProduct = createdProducts[2];
    const hoodieColors = ["Black", "Navy", "Forest Green"];
    for (const size of sizes) {
      for (const color of hoodieColors) {
        const priceAdjustment = size === "XXL" ? "5.00" : "0.00";
        variantData.push({
          productId: hoodieProduct.id,
          sku: `${hoodieProduct.slug.toUpperCase()}-${size}-${color.replace(" ", "").toUpperCase()}`,
          name: `${size} - ${color}`,
          priceAdjustment,
          attributes: { size, color },
          stockQuantity: 15,
        });
      }
    }

    const createdVariants = await db.insert(productVariants).values(variantData).returning();
    console.log(`✅ Created ${createdVariants.length} product variants`);

    // 4. Create product images (mock URLs for now)
    console.log("🖼️ Creating product images...");
    const imageData = [];
    
    for (let i = 0; i < createdProducts.length; i++) {
      const product = createdProducts[i];
      // Main product image
      imageData.push({
        productId: product.id,
        imageUrl: `/api/images/products/${product.slug}/main.jpg`,
        altText: `${product.name} main image`,
        displayOrder: 0,
        isPrimary: true,
      });
      
      // Additional images
      for (let j = 1; j <= 2; j++) {
        imageData.push({
          productId: product.id,
          imageUrl: `/api/images/products/${product.slug}/alt-${j}.jpg`,
          altText: `${product.name} alternative view ${j}`,
          displayOrder: j,
          isPrimary: false,
        });
      }
    }

    const createdImages = await db.insert(productImages).values(imageData).returning();
    console.log(`✅ Created ${createdImages.length} product images`);

    // 5. Create inventory records
    console.log("📦 Creating inventory records...");
    const inventoryData = [];
    
    // For products with variants
    for (const variant of createdVariants) {
      inventoryData.push({
        productId: variant.productId,
        variantId: variant.id,
        quantityAvailable: variant.stockQuantity,
        quantityReserved: 0,
        lowStockThreshold: 5,
      });
    }
    
    // For products without variants (vinyl, accessories)
    const nonClothingProducts = createdProducts.slice(3); // vinyl and accessories
    for (const product of nonClothingProducts) {
      inventoryData.push({
        productId: product.id,
        quantityAvailable: product.name.includes("Vinyl") ? 50 : 100,
        quantityReserved: 0,
        lowStockThreshold: product.name.includes("Vinyl") ? 10 : 20,
      });
    }

    const createdInventory = await db.insert(inventory).values(inventoryData).returning();
    console.log(`✅ Created ${createdInventory.length} inventory records`);

    console.log("🎉 Seed process completed successfully!");
    
    // Summary
    console.log("\n📊 Summary:");
    console.log(`- Categories: ${createdCategories.length}`);
    console.log(`- Products: ${createdProducts.length}`);
    console.log(`- Variants: ${createdVariants.length}`);
    console.log(`- Images: ${createdImages.length}`);
    console.log(`- Inventory records: ${createdInventory.length}`);
    
  } catch (error) {
    console.error("❌ Error during seed process:", error);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (import.meta.url.endsWith(process.argv[1])) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seed };