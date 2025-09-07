/**
 * Analytics API Routes for Panickin' Skywalker Marketing System
 * Provides endpoints for customer analytics, behavior tracking, and marketing metrics
 */

import { Router } from 'express';
import { z } from 'zod';
import { analyticsService } from '../services/analytics';
import { storage } from '../storage';

const router = Router();

// =======================
// BEHAVIOR TRACKING
// =======================

/**
 * Track customer behavior event
 * POST /api/analytics/track
 */
router.post('/track', async (req, res) => {
  try {
    const trackingSchema = z.object({
      eventType: z.enum(['page_view', 'product_view', 'add_to_cart', 'remove_from_cart', 'checkout_start', 'purchase', 'email_open', 'email_click', 'social_share']),
      userId: z.string().optional(),
      eventData: z.object({
        productId: z.string().optional(),
        categoryId: z.string().optional(),
        page: z.string().optional(),
        value: z.number().optional(),
        metadata: z.record(z.any()).optional(),
      }).optional(),
    });

    const { eventType, userId, eventData } = trackingSchema.parse(req.body);

    await analyticsService.trackEvent(eventType, req, eventData, userId);

    res.status(200).json({
      success: true,
      message: 'Event tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking event:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tracking data',
        errors: error.errors
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to track event'
    });
  }
});

/**
 * Get analytics metrics for dashboard
 * GET /api/analytics/metrics?timeframe=month
 */
router.get('/metrics', async (req, res) => {
  try {
    const timeframe = req.query.timeframe as 'day' | 'week' | 'month' | 'year' || 'month';
    
    if (!['day', 'week', 'month', 'year'].includes(timeframe)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid timeframe. Must be: day, week, month, or year'
      });
    }
    
    const metrics = await analyticsService.getAnalyticsMetrics(timeframe);
    
    res.json({
      success: true,
      data: metrics,
      timeframe,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting analytics metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics metrics'
    });
  }
});

/**
 * Analytics service health check
 * GET /api/analytics/health
 */
router.get('/health', async (req, res) => {
  try {
    // Test database connectivity
    const testQuery = await storage.getAllCustomerAnalytics();
    
    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        analytics: 'operational'
      },
      metrics: {
        totalCustomers: testQuery.length
      }
    });
  } catch (error) {
    console.error('Analytics health check failed:', error);
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed'
    });
  }
});

export default router;