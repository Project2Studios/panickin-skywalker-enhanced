import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertNewsletterSubscriberSchema, type InsertNewsletterSubscriber } from "@shared/schema";
import { z } from "zod";

// Import route modules
import categoriesRouter from "./routes/categories";
import productsRouter from "./routes/products";
import cartRouter from "./routes/cart";
import ordersRouter from "./routes/orders";
import checkoutRouter from "./routes/checkout";
import socialRouter from "./routes/social";
import webhooksRouter from "./routes/webhooks";
import emailRouter from "./routes/email";
import analyticsRouter from "./routes/analytics";

// Import admin route modules
import adminProductsRouter from "./routes/admin/products";
import adminCategoriesRouter from "./routes/admin/categories";
import adminOrdersRouter from "./routes/admin/orders";
import adminInventoryRouter from "./routes/admin/inventory";

export async function registerRoutes(app: Express): Promise<Server> {
  // Newsletter signup endpoint
  app.post("/api/newsletter/signup", async (req, res) => {
    try {
      // Validate request body
      const validatedData = insertNewsletterSubscriberSchema.parse(req.body);
      
      // Check if email already exists
      const existingSubscriber = await storage.getNewsletterSubscriber(validatedData.email);
      if (existingSubscriber) {
        return res.status(409).json({ 
          message: "You're already subscribed to our newsletter!" 
        });
      }

      // Create new subscriber
      const subscriber = await storage.createNewsletterSubscriber(validatedData);
      
      res.status(201).json({
        message: "Successfully subscribed to newsletter!",
        subscriber: {
          id: subscriber.id,
          email: subscriber.email,
          name: subscriber.name,
          subscribedAt: subscriber.subscribedAt,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid data provided",
          errors: error.errors,
        });
      }
      
      console.error("Newsletter signup error:", error);
      res.status(500).json({ 
        message: "Failed to subscribe to newsletter. Please try again later." 
      });
    }
  });

  // Get all newsletter subscribers (for admin purposes)
  app.get("/api/newsletter/subscribers", async (req, res) => {
    try {
      const subscribers = await storage.getAllNewsletterSubscribers();
      res.json({ subscribers });
    } catch (error) {
      console.error("Get subscribers error:", error);
      res.status(500).json({ 
        message: "Failed to retrieve subscribers" 
      });
    }
  });

  // Register e-commerce API routes
  app.use("/api/categories", categoriesRouter);
  app.use("/api/products", productsRouter);
  app.use("/api/cart", cartRouter);
  app.use("/api/orders", ordersRouter);
  app.use("/api/checkout", checkoutRouter);
  app.use("/api/social", socialRouter);
  app.use("/api/webhooks", webhooksRouter);
  app.use("/api/email", emailRouter);
  
  // Register marketing and analytics API routes
  app.use("/api/analytics", analyticsRouter);

  // Register admin API routes
  app.use("/api/admin/products", adminProductsRouter);
  app.use("/api/admin/categories", adminCategoriesRouter);
  app.use("/api/admin/orders", adminOrdersRouter);
  app.use("/api/admin/inventory", adminInventoryRouter);

  const httpServer = createServer(app);
  return httpServer;
}
