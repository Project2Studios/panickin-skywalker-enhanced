import { Request, Response, NextFunction } from "express";
import { z } from "zod";

/**
 * Middleware to validate request body against a Zod schema
 */
export function validateRequest<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid data provided",
          errors: error.errors,
        });
      }
      
      console.error("Validation error:", error);
      return res.status(500).json({ 
        message: "Internal server error" 
      });
    }
  };
}

/**
 * Middleware to validate query parameters against a Zod schema
 */
export function validateQuery<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.query);
      req.query = validatedData as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid query parameters",
          errors: error.errors,
        });
      }
      
      console.error("Query validation error:", error);
      return res.status(500).json({ 
        message: "Internal server error" 
      });
    }
  };
}

/**
 * Middleware to validate URL parameters against a Zod schema
 */
export function validateParams<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.params);
      req.params = validatedData as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid URL parameters",
          errors: error.errors,
        });
      }
      
      console.error("Params validation error:", error);
      return res.status(500).json({ 
        message: "Internal server error" 
      });
    }
  };
}