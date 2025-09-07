/**
 * Performance Monitoring and Optimization Utilities
 * 
 * This module provides comprehensive performance monitoring capabilities including:
 * - Web Vitals tracking (LCP, FID, CLS, FCP, TTFB)
 * - Custom performance metrics
 * - Resource loading optimization
 * - Memory usage monitoring
 * - User experience tracking
 */

import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

// Performance thresholds based on Core Web Vitals
export const PERFORMANCE_THRESHOLDS = {
  LCP: { good: 2500, needs_improvement: 4000 },
  FID: { good: 100, needs_improvement: 300 },
  CLS: { good: 0.1, needs_improvement: 0.25 },
  FCP: { good: 1800, needs_improvement: 3000 },
  TTFB: { good: 800, needs_improvement: 1800 }
} as const;

export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  url: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  connectionType: string;
}

export interface CustomMetric {
  name: string;
  value: number;
  startTime?: number;
  endTime?: number;
  details?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private customMetrics: CustomMetric[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();
  private isEnabled: boolean = true;

  constructor() {
    this.init();
  }

  private init() {
    // Only enable in production or when explicitly requested
    this.isEnabled = __PERFORMANCE_MONITORING__ || localStorage.getItem('perf-monitoring') === 'true';
    
    if (!this.isEnabled) return;

    this.setupWebVitals();
    this.setupResourceObserver();
    this.setupNavigationObserver();
    this.setupMemoryMonitoring();
    this.setupLongTaskObserver();
  }

  private setupWebVitals() {
    const reportMetric = (metric: any) => {
      const performanceMetric: PerformanceMetric = {
        name: metric.name,
        value: metric.value,
        rating: this.getRating(metric.name, metric.value),
        timestamp: Date.now(),
        url: window.location.pathname,
        deviceType: this.getDeviceType(),
        connectionType: this.getConnectionType()
      };
      
      this.metrics.push(performanceMetric);
      this.reportMetric(performanceMetric);
    };

    getCLS(reportMetric);
    getFID(reportMetric);
    getFCP(reportMetric);
    getLCP(reportMetric);
    getTTFB(reportMetric);
  }

  private setupResourceObserver() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            this.trackResourceLoading(entry as PerformanceResourceTiming);
          }
        }
      });

      observer.observe({ entryTypes: ['resource'] });
      this.observers.set('resource', observer);
    } catch (error) {
      console.warn('Failed to setup resource observer:', error);
    }
  }

  private setupNavigationObserver() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            this.trackPageLoad(entry as PerformanceNavigationTiming);
          }
        }
      });

      observer.observe({ entryTypes: ['navigation'] });
      this.observers.set('navigation', observer);
    } catch (error) {
      console.warn('Failed to setup navigation observer:', error);
    }
  }

  private setupLongTaskObserver() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'longtask') {
            this.trackLongTask(entry);
          }
        }
      });

      observer.observe({ entryTypes: ['longtask'] });
      this.observers.set('longtask', observer);
    } catch (error) {
      console.warn('Failed to setup long task observer:', error);
    }
  }

  private setupMemoryMonitoring() {
    // Monitor memory usage periodically
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.recordCustomMetric('memory-usage', memory.usedJSHeapSize, {
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          utilizationPercentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
        });
      }, 30000); // Every 30 seconds
    }
  }

  private trackResourceLoading(entry: PerformanceResourceTiming) {
    const duration = entry.responseEnd - entry.startTime;
    const size = entry.transferSize || 0;
    
    // Track slow loading resources
    if (duration > 1000) { // Resources taking more than 1 second
      this.recordCustomMetric('slow-resource', duration, {
        name: entry.name,
        type: this.getResourceType(entry.name),
        size,
        initiatorType: entry.initiatorType
      });
    }

    // Track large resources
    if (size > 500 * 1024) { // Resources larger than 500KB
      this.recordCustomMetric('large-resource', size, {
        name: entry.name,
        type: this.getResourceType(entry.name),
        duration,
        initiatorType: entry.initiatorType
      });
    }
  }

  private trackPageLoad(entry: PerformanceNavigationTiming) {
    const metrics = {
      domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      domComplete: entry.domComplete - entry.navigationStart,
      loadComplete: entry.loadEventEnd - entry.loadEventStart,
      firstByte: entry.responseStart - entry.requestStart,
      dnsTiming: entry.domainLookupEnd - entry.domainLookupStart,
      connectionTiming: entry.connectEnd - entry.connectStart,
      renderingTime: entry.domComplete - entry.responseEnd
    };

    Object.entries(metrics).forEach(([name, value]) => {
      if (value > 0) {
        this.recordCustomMetric(`page-${name}`, value);
      }
    });
  }

  private trackLongTask(entry: PerformanceEntry) {
    this.recordCustomMetric('long-task', entry.duration, {
      startTime: entry.startTime,
      type: (entry as any).attribution?.[0]?.name || 'unknown'
    });
  }

  private getRating(metricName: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = PERFORMANCE_THRESHOLDS[metricName as keyof typeof PERFORMANCE_THRESHOLDS];
    if (!thresholds) return 'good';

    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.needs_improvement) return 'needs-improvement';
    return 'poor';
  }

  private getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private getConnectionType(): string {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    return connection?.effectiveType || 'unknown';
  }

  private getResourceType(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase() || '';
    
    if (['js', 'mjs', 'ts'].includes(extension)) return 'script';
    if (['css', 'scss', 'sass'].includes(extension)) return 'stylesheet';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg'].includes(extension)) return 'image';
    if (['woff', 'woff2', 'ttf', 'eot', 'otf'].includes(extension)) return 'font';
    if (['mp4', 'webm', 'ogg', 'avi'].includes(extension)) return 'video';
    if (['mp3', 'wav', 'ogg', 'aac'].includes(extension)) return 'audio';
    if (['json', 'xml'].includes(extension)) return 'data';
    
    return 'other';
  }

  public recordCustomMetric(name: string, value: number, details?: Record<string, any>) {
    const metric: CustomMetric = {
      name,
      value,
      startTime: performance.now(),
      details
    };

    this.customMetrics.push(metric);
    
    // Report immediately for important metrics
    if (this.isImportantMetric(name)) {
      this.reportCustomMetric(metric);
    }
  }

  public startTiming(name: string): () => void {
    const startTime = performance.now();
    performance.mark(`${name}-start`);

    return () => {
      const endTime = performance.now();
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
      
      this.recordCustomMetric(`timing-${name}`, endTime - startTime, {
        startTime,
        endTime
      });
    };
  }

  public measureFunction<T extends (...args: any[]) => any>(
    name: string,
    fn: T
  ): T {
    return ((...args: any[]) => {
      const endTiming = this.startTiming(`function-${name}`);
      try {
        const result = fn(...args);
        if (result instanceof Promise) {
          return result.finally(endTiming);
        }
        endTiming();
        return result;
      } catch (error) {
        endTiming();
        throw error;
      }
    }) as T;
  }

  public measureComponent(componentName: string) {
    return {
      onMount: () => this.startTiming(`component-${componentName}-mount`),
      onRender: () => this.startTiming(`component-${componentName}-render`),
      onUpdate: () => this.startTiming(`component-${componentName}-update`),
      onUnmount: () => this.recordCustomMetric(`component-${componentName}-unmount`, performance.now())
    };
  }

  private isImportantMetric(name: string): boolean {
    return ['long-task', 'slow-resource', 'large-resource', 'memory-usage'].includes(name);
  }

  private reportMetric(metric: PerformanceMetric) {
    // Send to analytics service in production
    if (__PERFORMANCE_MONITORING__ && typeof window !== 'undefined') {
      // This would integrate with your analytics service
      console.log('Performance Metric:', metric);
      
      // Example: Send to analytics
      // analytics.track('performance-metric', metric);
    }
  }

  private reportCustomMetric(metric: CustomMetric) {
    // Send custom metrics to analytics service
    if (__PERFORMANCE_MONITORING__ && typeof window !== 'undefined') {
      console.log('Custom Metric:', metric);
    }
  }

  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  public getCustomMetrics(): CustomMetric[] {
    return [...this.customMetrics];
  }

  public getPerformanceScore(): number {
    if (this.metrics.length === 0) return 100;

    const scores = this.metrics.map(metric => {
      switch (metric.rating) {
        case 'good': return 100;
        case 'needs-improvement': return 75;
        case 'poor': return 50;
        default: return 100;
      }
    });

    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }

  public generateReport(): string {
    const score = this.getPerformanceScore();
    const criticalIssues = this.metrics.filter(m => m.rating === 'poor').length;
    const warnings = this.metrics.filter(m => m.rating === 'needs-improvement').length;

    return `
Performance Report
==================
Overall Score: ${score}/100
Critical Issues: ${criticalIssues}
Warnings: ${warnings}
Total Metrics: ${this.metrics.length}

Web Vitals:
${this.metrics.map(m => `- ${m.name}: ${m.value.toFixed(2)}ms (${m.rating})`).join('\n')}

Custom Metrics: ${this.customMetrics.length}
    `.trim();
  }

  public cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.metrics.length = 0;
    this.customMetrics.length = 0;
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for component performance monitoring
export function usePerformanceMonitor(componentName: string) {
  const monitor = performanceMonitor.measureComponent(componentName);
  
  React.useEffect(() => {
    const endMount = monitor.onMount();
    return () => {
      endMount();
      monitor.onUnmount();
    };
  }, []);

  React.useEffect(() => {
    const endRender = monitor.onRender();
    return endRender;
  });

  return {
    startTiming: (name: string) => performanceMonitor.startTiming(`${componentName}-${name}`),
    recordMetric: (name: string, value: number, details?: Record<string, any>) => 
      performanceMonitor.recordCustomMetric(`${componentName}-${name}`, value, details)
  };
}

// Utility functions for common performance optimizations
export const optimizeImage = (src: string, options: { 
  width?: number; 
  height?: number; 
  format?: 'webp' | 'avif' | 'auto'; 
  quality?: number;
} = {}) => {
  const { width, height, format = 'auto', quality = 80 } = options;
  
  // In a real implementation, this would integrate with an image optimization service
  // For now, return the original src with query parameters for manual optimization
  const params = new URLSearchParams();
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  if (format !== 'auto') params.set('format', format);
  params.set('q', quality.toString());
  
  return `${src}?${params.toString()}`;
};

export const preloadResource = (href: string, as: string) => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
};

export const preconnectToDomain = (href: string) => {
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = href;
  document.head.appendChild(link);
};

// Critical resource hints for better performance
if (typeof window !== 'undefined') {
  // Preconnect to external domains used by the app
  const domains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    // Add other external domains used by your app
  ];
  
  domains.forEach(preconnectToDomain);
}

declare global {
  const __PERFORMANCE_MONITORING__: boolean;
  const React: any;
}