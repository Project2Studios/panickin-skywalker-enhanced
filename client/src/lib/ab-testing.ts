// A/B Testing Framework for Panickin' Skywalker
import { z } from "zod";

// Test configuration schema
const ABTestSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(['draft', 'running', 'paused', 'completed']),
  variants: z.array(z.object({
    id: z.string(),
    name: z.string(),
    weight: z.number().min(0).max(100),
    config: z.record(z.any())
  })),
  segments: z.array(z.string()).optional(),
  startDate: z.date(),
  endDate: z.date().optional(),
  metrics: z.array(z.object({
    name: z.string(),
    type: z.enum(['conversion', 'click', 'view', 'time'])
  }))
});

export type ABTest = z.infer<typeof ABTestSchema>;

// Test variants for newsletter signup optimization
export const NEWSLETTER_SIGNUP_TEST: ABTest = {
  id: 'newsletter-signup-optimization',
  name: 'Newsletter Signup Optimization',
  status: 'running',
  startDate: new Date('2024-03-01'),
  variants: [
    {
      id: 'control',
      name: 'Control - Current Design',
      weight: 50,
      config: {
        position: 'contact-section',
        design: 'card',
        urgency: false,
        socialProof: true
      }
    },
    {
      id: 'variant-a',
      name: 'Top Banner with Urgency',
      weight: 25,
      config: {
        position: 'top-banner',
        design: 'banner',
        urgency: true,
        socialProof: true
      }
    },
    {
      id: 'variant-b',
      name: 'Exit Intent Popup',
      weight: 25,
      config: {
        position: 'exit-intent',
        design: 'modal',
        urgency: true,
        socialProof: false
      }
    }
  ],
  metrics: [
    { name: 'signup_conversion', type: 'conversion' },
    { name: 'form_views', type: 'view' },
    { name: 'form_interactions', type: 'click' }
  ]
};

// Test for ticket purchase CTAs
export const TICKET_CTA_TEST: ABTest = {
  id: 'ticket-cta-optimization',
  name: 'Ticket Purchase CTA Optimization',
  status: 'running',
  startDate: new Date('2024-03-01'),
  variants: [
    {
      id: 'control',
      name: 'Standard CTA',
      weight: 33.33,
      config: {
        text: 'GET TICKETS',
        color: 'primary',
        urgency: false,
        scarcity: false
      }
    },
    {
      id: 'urgency',
      name: 'Urgency CTA',
      weight: 33.33,
      config: {
        text: 'SECURE YOUR SPOT NOW',
        color: 'accent',
        urgency: true,
        scarcity: false
      }
    },
    {
      id: 'scarcity',
      name: 'Scarcity CTA',
      weight: 33.34,
      config: {
        text: 'ONLY 47 TICKETS LEFT',
        color: 'destructive',
        urgency: false,
        scarcity: true
      }
    }
  ],
  metrics: [
    { name: 'ticket_click_through', type: 'click' },
    { name: 'purchase_intent', type: 'conversion' }
  ]
};

// A/B Testing Manager Class
class ABTestManager {
  private static instance: ABTestManager;
  private userId: string;
  private assignments: Map<string, string> = new Map();
  private metrics: Array<{ testId: string; variant: string; metric: string; timestamp: Date; value?: number }> = [];

  private constructor() {
    this.userId = this.getUserId();
    this.loadAssignments();
  }

  static getInstance(): ABTestManager {
    if (!ABTestManager.instance) {
      ABTestManager.instance = new ABTestManager();
    }
    return ABTestManager.instance;
  }

  private getUserId(): string {
    let userId = localStorage.getItem('ps_user_id');
    if (!userId) {
      userId = crypto.randomUUID();
      localStorage.setItem('ps_user_id', userId);
    }
    return userId;
  }

  private loadAssignments(): void {
    const saved = localStorage.getItem('ps_ab_assignments');
    if (saved) {
      try {
        const assignments = JSON.parse(saved);
        this.assignments = new Map(Object.entries(assignments));
      } catch (e) {
        console.warn('Failed to load A/B test assignments:', e);
      }
    }
  }

  private saveAssignments(): void {
    const assignments = Object.fromEntries(this.assignments);
    localStorage.setItem('ps_ab_assignments', JSON.stringify(assignments));
  }

  // Get variant for a test
  getVariant(testId: string, test?: ABTest): string {
    // Check if user is already assigned
    if (this.assignments.has(testId)) {
      return this.assignments.get(testId)!;
    }

    if (!test) {
      return 'control';
    }

    // Only assign to running tests
    if (test.status !== 'running') {
      return 'control';
    }

    // Assign variant based on weights
    const hash = this.hashUserId(testId);
    const normalized = hash / 0xFFFFFFFF; // Normalize to 0-1
    let cumulative = 0;

    for (const variant of test.variants) {
      cumulative += variant.weight / 100;
      if (normalized <= cumulative) {
        this.assignments.set(testId, variant.id);
        this.saveAssignments();
        return variant.id;
      }
    }

    // Fallback
    const defaultVariant = test.variants[0]?.id || 'control';
    this.assignments.set(testId, defaultVariant);
    this.saveAssignments();
    return defaultVariant;
  }

  private hashUserId(testId: string): number {
    const str = `${this.userId}-${testId}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Track metrics
  trackMetric(testId: string, metricName: string, value?: number): void {
    const variant = this.assignments.get(testId);
    if (!variant) return;

    const metric = {
      testId,
      variant,
      metric: metricName,
      timestamp: new Date(),
      value
    };

    this.metrics.push(metric);
    
    // Send to analytics (implement based on your analytics provider)
    this.sendToAnalytics(metric);
    
    // Persist locally as backup
    this.persistMetrics();
  }

  private sendToAnalytics(metric: any): void {
    // Send to your analytics provider (Google Analytics, Mixpanel, etc.)
    if (typeof gtag !== 'undefined') {
      gtag('event', 'ab_test_metric', {
        test_id: metric.testId,
        variant: metric.variant,
        metric_name: metric.metric,
        metric_value: metric.value
      });
    }
  }

  private persistMetrics(): void {
    // Keep only recent metrics to avoid storage bloat
    const recentMetrics = this.metrics.filter(m => 
      Date.now() - m.timestamp.getTime() < 7 * 24 * 60 * 60 * 1000 // 7 days
    );
    this.metrics = recentMetrics;
    
    localStorage.setItem('ps_ab_metrics', JSON.stringify(recentMetrics));
  }

  // Get current assignments for debugging
  getAssignments(): Record<string, string> {
    return Object.fromEntries(this.assignments);
  }
}

// Hook for React components
export function useABTest(testId: string, test?: ABTest) {
  const manager = ABTestManager.getInstance();
  const variant = manager.getVariant(testId, test);

  const trackMetric = (metricName: string, value?: number) => {
    manager.trackMetric(testId, metricName, value);
  };

  return { variant, trackMetric };
}

// Utility function to get test configuration
export function getTestConfig(test: ABTest, variantId: string): any {
  const variant = test.variants.find(v => v.id === variantId);
  return variant?.config || {};
}

export default ABTestManager;