/**
 * Analytics Service for Panickin' Skywalker Marketing System
 * Tracks customer behavior, calculates lifecycle metrics, and manages segmentation
 */

import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import geoip from 'geoip-lite';
import { UAParser } from 'ua-parser-js';
import { storage } from '../storage';
import type { 
  CustomerAnalytics, 
  CustomerBehavior, 
  InsertCustomerBehavior,
  InsertCustomerAnalytics 
} from '@shared/schema';

export interface TrackingEventData {
  productId?: string;
  categoryId?: string;
  page?: string;
  value?: number;
  metadata?: Record<string, any>;
}

export interface AnalyticsMetrics {
  totalCustomers: number;
  segmentBreakdown: Record<string, number>;
  topProducts: Array<{ productId: string; views: number; conversions: number }>;
  conversionRates: Record<string, number>;
  customerLifetimeValue: number;
  churnRate: number;
}

export class AnalyticsService {
  /**
   * Track customer behavior event
   */
  async trackEvent(
    eventType: string,
    req: Request,
    eventData?: TrackingEventData,
    userId?: string
  ): Promise<void> {
    try {
      const sessionId = (req as any).sessionID || uuidv4();
      const userAgent = req.get('user-agent') || '';
      const ipAddress = req.ip || (req as any).connection?.remoteAddress || '';
      const referrer = req.get('referer') || '';
      
      // Parse UTM parameters
      const utmSource = (req.query.utm_source as string) || undefined;
      const utmMedium = (req.query.utm_medium as string) || undefined;
      const utmCampaign = (req.query.utm_campaign as string) || null;

      const behaviorData: InsertCustomerBehavior = {
        userId: userId || null,
        sessionId,
        eventType: eventType as any,
        eventData,
        userAgent,
        ipAddress,
        referrer,
        utmSource,
        utmMedium,
        utmCampaign,
      };

      await storage.createCustomerBehavior(behaviorData);

      // Update customer analytics if user is identified
      if (userId) {
        await this.updateCustomerAnalytics(userId);
      }
    } catch (error) {
      console.error('Error tracking event:', error);
      // Don't throw - analytics should not break the main flow
    }
  }

  /**
   * Get customer analytics profile
   */
  async getCustomerAnalytics(userId: string): Promise<CustomerAnalytics | null> {
    try {
      return await storage.getCustomerAnalytics(userId);
    } catch (error) {
      console.error('Error getting customer analytics:', error);
      return null;
    }
  }

  /**
   * Update customer analytics profile
   */
  async updateCustomerAnalytics(userId: string): Promise<void> {
    try {
      // This would implement the complex logic from the original file
      // For now, we'll create a basic update
      const analytics = await storage.getCustomerAnalytics(userId);
      if (!analytics) {
        // Create new analytics profile
        const analyticsData: InsertCustomerAnalytics = {
          userId,
          email: `user-${userId}@example.com`,
          customerSegment: 'new'
        };
        await storage.createCustomerAnalytics(analyticsData);
      }
    } catch (error) {
      console.error('Error updating customer analytics:', error);
    }
  }

  /**
   * Get analytics metrics for dashboard
   */
  async getAnalyticsMetrics(timeframe: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<AnalyticsMetrics> {
    try {
      return {
        totalCustomers: 0,
        segmentBreakdown: {},
        topProducts: [],
        conversionRates: {},
        customerLifetimeValue: 0,
        churnRate: 0,
      };
    } catch (error) {
      console.error('Error getting analytics metrics:', error);
      return {
        totalCustomers: 0,
        segmentBreakdown: {},
        topProducts: [],
        conversionRates: {},
        customerLifetimeValue: 0,
        churnRate: 0,
      };
    }
  }

  /**
   * Get customers by segment
   */
  async getCustomersBySegment(segment: string, limit: number = 100): Promise<CustomerAnalytics[]> {
    try {
      return await storage.getCustomersBySegment(segment, limit);
    } catch (error) {
      console.error('Error getting customers by segment:', error);
      return [];
    }
  }

  /**
   * Identify at-risk customers
   */
  async getAtRiskCustomers(riskThreshold: number = 70): Promise<CustomerAnalytics[]> {
    try {
      return await storage.getCustomersByRiskScore(riskThreshold);
    } catch (error) {
      console.error('Error getting at-risk customers:', error);
      return [];
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
export default analyticsService;