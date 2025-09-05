import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertNewsletterSubscriberSchema, type InsertNewsletterSubscriber } from "@shared/schema";
import { z } from "zod";

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

  const httpServer = createServer(app);
  return httpServer;
}
