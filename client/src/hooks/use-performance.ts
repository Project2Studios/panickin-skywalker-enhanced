import { useEffect, useCallback, useRef, useState } from 'react';

// Performance monitoring hook
export function usePerformance() {
  const [metrics, setMetrics] = useState({
    fcp: 0,
    lcp: 0,
    fid: 0,
    cls: 0,
    ttfb: 0
  });

  useEffect(() => {
    // Core Web Vitals monitoring
    if ('web-vital' in window) {
      return;
    }

    // FCP (First Contentful Paint)
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
        }
      }
    }).observe({ entryTypes: ['paint'] });

    // LCP (Largest Contentful Paint)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // FID (First Input Delay)
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        setMetrics(prev => ({ ...prev, fid: entry.processingStart - entry.startTime }));
      }
    }).observe({ entryTypes: ['first-input'] });

    // CLS (Cumulative Layout Shift)
    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          setMetrics(prev => ({ ...prev, cls: clsValue }));
        }
      }
    }).observe({ entryTypes: ['layout-shift'] });

    // TTFB (Time to First Byte)
    if (performance.timing) {
      const ttfb = performance.timing.responseStart - performance.timing.fetchStart;
      setMetrics(prev => ({ ...prev, ttfb }));
    }
  }, []);

  return metrics;
}

// Image preloader hook for critical images
export function useImagePreloader(imageSrcs: string[]) {
  const [loadedImages, setLoadedImages] = useState(new Set<string>());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (imageSrcs.length === 0) {
      setIsLoading(false);
      return;
    }

    const imagePromises = imageSrcs.map((src) => {
      return new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          setLoadedImages(prev => new Set([...prev, src]));
          resolve(src);
        };
        img.onerror = () => reject(src);
        img.src = src;
      });
    });

    Promise.allSettled(imagePromises).then(() => {
      setIsLoading(false);
    });
  }, [imageSrcs]);

  return { loadedImages, isLoading };
}

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      if (entry.isIntersecting && !hasIntersected) {
        setHasIntersected(true);
      }
    }, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    });

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [hasIntersected, options]);

  return { elementRef, isIntersecting, hasIntersected };
}

// Optimized scroll hook with throttling
export function useOptimizedScroll() {
  const [scrollY, setScrollY] = useState(0);
  const [direction, setDirection] = useState<'up' | 'down'>('down');
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const updateScrollY = useCallback(() => {
    const currentScrollY = window.scrollY;
    
    if (currentScrollY !== lastScrollY.current) {
      setDirection(currentScrollY > lastScrollY.current ? 'down' : 'up');
      setScrollY(currentScrollY);
      lastScrollY.current = currentScrollY;
    }

    ticking.current = false;
  }, []);

  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      requestAnimationFrame(updateScrollY);
      ticking.current = true;
    }
  }, [updateScrollY]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return { scrollY, direction };
}

// Debounced resize hook for performance
export function useDebouncedResize(delay = 250) {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    let timeoutId: number;
    
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, delay);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [delay]);

  return dimensions;
}

// Memory usage monitoring hook
export function useMemoryMonitor() {
  const [memoryInfo, setMemoryInfo] = useState<{
    used: number;
    total: number;
    limit: number;
  } | null>(null);

  useEffect(() => {
    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMemoryInfo({
          used: Math.round(memory.usedJSHeapSize / 1048576), // MB
          total: Math.round(memory.totalJSHeapSize / 1048576), // MB
          limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
        });
      }
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
}

// Network quality detection
export function useNetworkQuality() {
  const [networkInfo, setNetworkInfo] = useState<{
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
  } | null>(null);

  useEffect(() => {
    const updateNetworkInfo = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        setNetworkInfo({
          effectiveType: connection.effectiveType || 'unknown',
          downlink: connection.downlink || 0,
          rtt: connection.rtt || 0,
          saveData: connection.saveData || false,
        });
      }
    };

    updateNetworkInfo();
    
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection.addEventListener('change', updateNetworkInfo);
      return () => connection.removeEventListener('change', updateNetworkInfo);
    }
  }, []);

  return networkInfo;
}

// Battery API hook for mobile optimization
export function useBattery() {
  const [batteryInfo, setBatteryInfo] = useState<{
    charging: boolean;
    level: number;
    chargingTime: number;
    dischargingTime: number;
  } | null>(null);

  useEffect(() => {
    let battery: any = null;

    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((bat: any) => {
        battery = bat;
        
        const updateBatteryInfo = () => {
          setBatteryInfo({
            charging: battery.charging,
            level: battery.level,
            chargingTime: battery.chargingTime,
            dischargingTime: battery.dischargingTime,
          });
        };

        updateBatteryInfo();
        
        battery.addEventListener('chargingchange', updateBatteryInfo);
        battery.addEventListener('levelchange', updateBatteryInfo);
        
        return () => {
          battery.removeEventListener('chargingchange', updateBatteryInfo);
          battery.removeEventListener('levelchange', updateBatteryInfo);
        };
      });
    }
  }, []);

  return batteryInfo;
}