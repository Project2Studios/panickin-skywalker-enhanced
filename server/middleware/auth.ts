import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
  };
}

/**
 * Simple authentication middleware for protected routes
 * In production, this would validate JWT tokens or session cookies
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      message: "Authentication required" 
    });
  }

  // For now, we'll use a simple token format: Bearer user:username
  // In production, this would be a proper JWT validation
  const token = authHeader.slice(7); // Remove 'Bearer '
  
  if (!token.startsWith('user:')) {
    return res.status(401).json({ 
      message: "Invalid token format" 
    });
  }

  const username = token.slice(5); // Remove 'user:'
  
  // In production, validate the token and get user info
  req.user = { id: `user-${username}`, username };
  next();
}

/**
 * Optional authentication middleware - sets user if authenticated but doesn't require it
 */
export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    
    if (token.startsWith('user:')) {
      const username = token.slice(5);
      req.user = { id: `user-${username}`, username };
    }
  }
  
  next();
}

/**
 * Admin authentication middleware - requires admin privileges
 */
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    // In production, check if user has admin role
    if (!req.user || !req.user.username.includes('admin')) {
      return res.status(403).json({ 
        message: "Admin privileges required" 
      });
    }
    next();
  });
}

/**
 * Session management for guest carts
 */
export function ensureSession(req: Request, res: Response, next: NextFunction) {
  if (!req.headers['x-session-id']) {
    // Generate a simple session ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    res.setHeader('X-Session-ID', sessionId);
    req.headers['x-session-id'] = sessionId;
  }
  next();
}

export { AuthenticatedRequest };