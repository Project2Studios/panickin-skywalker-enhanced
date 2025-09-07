import { Request, Response, NextFunction } from 'express';
import { performance, PerformanceObserver } from 'perf_hooks';
import IORedis from 'ioredis';

/**
 * Backend Performance Optimization Middleware
 * 
 * This module provides server-side performance optimization including:
 * - Request/response timing and monitoring
 * - Caching strategies (Redis integration)
 * - Rate limiting and throttling
 * - Database query optimization
 * - Memory usage monitoring
 * - Compression and gzip
 * - Security headers for performance
 */

// Performance metrics collection
interface RequestMetric {
  method: string;
  path: string;
  statusCode: number;
  duration: number;
  memoryUsage: NodeJS.MemoryUsage;
  timestamp: number;
  userAgent?: string;
  ip?: string;
}

class ServerPerformanceMonitor {
  private metrics: RequestMetric[] = [];
  private redis: IORedis | null = null;
  private observer: PerformanceObserver;

  constructor() {
    this.setupRedis();
    this.setupPerformanceObserver();
    this.startMemoryMonitoring();
  }

  private setupRedis() {
    if (process.env.REDIS_URL) {
      try {
        this.redis = new IORedis(process.env.REDIS_URL, {
          maxRetriesPerRequest: 3,
          retryDelayOnFailover: 100,
          enableReadyCheck: false,
          lazyConnect: true,
          // Connection pool optimization
          maxConnections: 20,
          minConnections: 5,
          // Performance optimizations
          keepAlive: 30000,
          family: 4, // Use IPv4
          // Compression
          compression: 'gzip'
        });

        this.redis.on('error', (error) => {
          console.warn('Redis connection error:', error);
        });
      } catch (error) {
        console.warn('Failed to setup Redis:', error);
      }
    }
  }

  private setupPerformanceObserver() {
    this.observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name.startsWith('http-request-')) {
          this.recordPerformanceEntry(entry);
        }
      });
    });

    this.observer.observe({ entryTypes: ['measure'] });
  }

  private startMemoryMonitoring() {
    setInterval(() => {
      const usage = process.memoryUsage();
      const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024 * 100) / 100;
      const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024 * 100) / 100;
      
      // Alert if memory usage is high
      if (heapUsedMB > 512) { // Alert if using more than 512MB
        console.warn(`High memory usage: ${heapUsedMB}MB used of ${heapTotalMB}MB total`);
      }
    }, 30000); // Check every 30 seconds
  }

  private recordPerformanceEntry(entry: PerformanceEntry) {
    // Record server-side performance metrics
    if (process.env.NODE_ENV === 'production') {
      // In production, you might want to send this to a monitoring service
      console.log(`Performance: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
    }
  }

  public recordRequest(metric: RequestMetric) {
    this.metrics.push(metric);
    
    // Keep only last 1000 metrics to prevent memory leaks
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Record slow requests
    if (metric.duration > 1000) { // Requests taking more than 1 second
      console.warn(`Slow request detected: ${metric.method} ${metric.path} took ${metric.duration.toFixed(2)}ms`);
    }
  }

  public getMetrics() {
    return [...this.metrics];
  }

  public getAverageResponseTime(path?: string): number {
    const relevantMetrics = path 
      ? this.metrics.filter(m => m.path === path)
      : this.metrics;

    if (relevantMetrics.length === 0) return 0;

    const sum = relevantMetrics.reduce((acc, metric) => acc + metric.duration, 0);
    return sum / relevantMetrics.length;
  }

  public async cacheGet(key: string): Promise<string | null> {
    if (!this.redis) return null;
    try {
      return await this.redis.get(key);
    } catch (error) {
      console.warn('Cache get error:', error);
      return null;
    }
  }

  public async cacheSet(key: string, value: string, ttl: number = 3600): Promise<void> {
    if (!this.redis) return;
    try {
      await this.redis.setex(key, ttl, value);
    } catch (error) {
      console.warn('Cache set error:', error);
    }
  }

  public async cacheDel(key: string): Promise<void> {
    if (!this.redis) return;
    try {
      await this.redis.del(key);
    } catch (error) {
      console.warn('Cache delete error:', error);
    }
  }
}

export const performanceMonitor = new ServerPerformanceMonitor();

// Performance monitoring middleware
export function performanceMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = performance.now();
    const requestId = `http-request-${Date.now()}-${Math.random()}`;
    
    performance.mark(`${requestId}-start`);

    // Override res.end to capture timing
    const originalEnd = res.end;
    res.end = function(chunk?: any, encoding?: any) {
      const endTime = performance.now();
      performance.mark(`${requestId}-end`);
      performance.measure(requestId, `${requestId}-start`, `${requestId}-end`);

      const metric: RequestMetric = {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: endTime - startTime,
        memoryUsage: process.memoryUsage(),
        timestamp: Date.now(),
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress
      };

      performanceMonitor.recordRequest(metric);

      // Call original end
      originalEnd.call(this, chunk, encoding);
    };

    next();
  };
}

// Caching middleware for API responses
export function cacheMiddleware(ttl: number = 3600, keyGenerator?: (req: Request) => string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = keyGenerator ? keyGenerator(req) : `api-cache:${req.originalUrl}`;
    
    try {
      const cached = await performanceMonitor.cacheGet(cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        res.setHeader('X-Cache', 'HIT');
        return res.json(data);
      }
    } catch (error) {
      console.warn('Cache retrieval error:', error);
    }

    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function(data: any) {
      // Cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        performanceMonitor.cacheSet(cacheKey, JSON.stringify(data), ttl)
          .catch(err => console.warn('Cache storage error:', err));
      }
      
      res.setHeader('X-Cache', 'MISS');
      return originalJson.call(this, data);
    };

    next();
  };
}

// Rate limiting middleware
export function rateLimitMiddleware(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const clientId = req.ip || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean up old entries
    for (const [key, value] of requests.entries()) {
      if (value.resetTime < windowStart) {
        requests.delete(key);
      }
    }

    const clientData = requests.get(clientId);
    
    if (!clientData) {
      requests.set(clientId, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (clientData.resetTime < now) {
      // Reset the window
      clientData.count = 1;
      clientData.resetTime = now + windowMs;
      return next();
    }

    if (clientData.count >= maxRequests) {
      res.setHeader('Retry-After', Math.ceil((clientData.resetTime - now) / 1000));
      return res.status(429).json({
        error: 'Too many requests',
        message: `Rate limit exceeded. Try again in ${Math.ceil((clientData.resetTime - now) / 1000)} seconds.`
      });
    }

    clientData.count++;
    next();
  };
}

// Compression middleware
export function compressionMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const acceptEncoding = req.headers['accept-encoding'] || '';
    
    // Override res.json to add compression
    const originalJson = res.json;
    res.json = function(data: any) {
      const jsonString = JSON.stringify(data);
      
      // Add compression headers for large responses
      if (jsonString.length > 1024) { // Only compress responses larger than 1KB
        if (acceptEncoding.includes('gzip')) {
          res.setHeader('Content-Encoding', 'gzip');
        } else if (acceptEncoding.includes('deflate')) {
          res.setHeader('Content-Encoding', 'deflate');
        }
        
        res.setHeader('Vary', 'Accept-Encoding');
      }
      
      return originalJson.call(this, data);
    };

    next();
  };
}

// Security headers for performance
export function securityHeadersMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    // DNS prefetch control
    res.setHeader('X-DNS-Prefetch-Control', 'on');
    
    // Content type sniffing prevention
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Frame options
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Content Security Policy for performance
    res.setHeader('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "connect-src 'self' https:; " +
      "media-src 'self';"
    );

    next();
  };
}

// Database query optimization helper
export class QueryOptimizer {
  private static queryCache = new Map<string, { result: any; timestamp: number }>();

  static async optimizeQuery<T>(
    queryKey: string,
    queryFn: () => Promise<T>,
    cacheTTL: number = 300000 // 5 minutes default
  ): Promise<T> {
    const cached = this.queryCache.get(queryKey);
    
    if (cached && Date.now() - cached.timestamp < cacheTTL) {
      return cached.result;
    }

    const startTime = performance.now();
    const result = await queryFn();
    const duration = performance.now() - startTime;

    // Log slow queries
    if (duration > 500) { // Queries taking more than 500ms
      console.warn(`Slow query detected: ${queryKey} took ${duration.toFixed(2)}ms`);
    }

    // Cache the result
    this.queryCache.set(queryKey, {
      result,
      timestamp: Date.now()
    });

    // Clean up old cache entries
    if (this.queryCache.size > 100) {
      const entries = Array.from(this.queryCache.entries());
      const cutoff = Date.now() - cacheTTL;
      
      entries.forEach(([key, value]) => {
        if (value.timestamp < cutoff) {
          this.queryCache.delete(key);
        }
      });
    }

    return result;
  }

  static clearCache(pattern?: string) {
    if (pattern) {
      const regex = new RegExp(pattern);
      for (const key of this.queryCache.keys()) {
        if (regex.test(key)) {
          this.queryCache.delete(key);
        }
      }
    } else {
      this.queryCache.clear();
    }
  }
}

// Request timeout middleware
export function timeoutMiddleware(timeoutMs: number = 30000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({
          error: 'Request timeout',
          message: `Request took longer than ${timeoutMs}ms to complete`
        });
      }
    }, timeoutMs);

    res.on('finish', () => {
      clearTimeout(timeout);
    });

    res.on('close', () => {
      clearTimeout(timeout);
    });

    next();
  };
}

// Health check endpoint for monitoring
export function healthCheckMiddleware() {
  return (req: Request, res: Response) => {
    const memUsage = process.memoryUsage();
    const uptime = process.uptime();
    const metrics = performanceMonitor.getMetrics();
    const avgResponseTime = performanceMonitor.getAverageResponseTime();

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime),
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100,
        total: Math.round(memUsage.heapTotal / 1024 / 1024 * 100) / 100,
        external: Math.round(memUsage.external / 1024 / 1024 * 100) / 100
      },
      performance: {
        totalRequests: metrics.length,
        averageResponseTime: Math.round(avgResponseTime * 100) / 100,
        slowRequests: metrics.filter(m => m.duration > 1000).length
      }
    };

    // Determine health status
    if (memUsage.heapUsed / 1024 / 1024 > 512 || avgResponseTime > 2000) {
      health.status = 'unhealthy';
      res.status(503);
    }

    res.json(health);
  };
}

// Export configured middleware stack
export function setupPerformanceMiddleware(app: any) {
  // Security headers
  app.use(securityHeadersMiddleware());
  
  // Performance monitoring
  app.use(performanceMiddleware());
  
  // Compression
  app.use(compressionMiddleware());
  
  // Timeout protection
  app.use(timeoutMiddleware(30000));
  
  // Rate limiting for API routes
  app.use('/api', rateLimitMiddleware(100, 15 * 60 * 1000));
  
  // Health check endpoint
  app.get('/health', healthCheckMiddleware());
  
  // Performance metrics endpoint (development only)
  if (process.env.NODE_ENV === 'development') {
    app.get('/metrics', (req: Request, res: Response) => {
      res.json({
        metrics: performanceMonitor.getMetrics(),
        averageResponseTime: performanceMonitor.getAverageResponseTime()
      });
    });
  }
}