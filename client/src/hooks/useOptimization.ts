import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { performanceMonitor } from '@/lib/performance';

/**
 * Performance optimization hooks for React components
 */

// Optimized image loading with lazy loading and format optimization
export function useOptimizedImage(src: string, options?: {
  width?: number;
  height?: number;
  quality?: number;
  lazy?: boolean;
  placeholder?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(options?.placeholder || '');
  const imgRef = useRef<HTMLImageElement>();

  const optimizedSrc = useMemo(() => {
    if (!src) return '';
    
    // Generate WebP and AVIF sources for modern browsers
    const baseUrl = src.split('?')[0];
    const params = new URLSearchParams();
    
    if (options?.width) params.set('w', options.width.toString());
    if (options?.height) params.set('h', options.height.toString());
    params.set('q', (options?.quality || 80).toString());
    
    return {
      avif: `${baseUrl}?format=avif&${params.toString()}`,
      webp: `${baseUrl}?format=webp&${params.toString()}`,
      fallback: `${baseUrl}?${params.toString()}`
    };
  }, [src, options]);

  useEffect(() => {
    if (!options?.lazy) {
      // Load image immediately
      loadImage();
      return;
    }

    // Lazy loading with Intersection Observer
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadImage();
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src, options?.lazy]);

  const loadImage = useCallback(() => {
    if (!src) return;

    const img = new Image();
    
    img.onload = () => {
      setCurrentSrc(src);
      setLoaded(true);
      setError(false);
    };
    
    img.onerror = () => {
      setError(true);
      setLoaded(false);
    };

    // Try AVIF first, then WebP, then fallback
    img.src = optimizedSrc.avif;
    
    // Fallback chain
    img.onerror = () => {
      img.src = optimizedSrc.webp;
      img.onerror = () => {
        img.src = optimizedSrc.fallback;
        img.onerror = () => {
          setError(true);
          setLoaded(false);
        };
      };
    };
  }, [src, optimizedSrc]);

  return {
    src: currentSrc,
    loaded,
    error,
    ref: imgRef,
    optimizedSrc
  };
}

// Debounced callback for search and input optimization
export function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  return useCallback(
    ((...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );
}

// Throttled callback for scroll and resize events
export function useThrottle<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastRan = useRef<number>(0);
  
  return useCallback(
    ((...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      const now = Date.now();
      const timeSinceLastRan = now - lastRan.current;
      
      if (timeSinceLastRan >= delay) {
        callback(...args);
        lastRan.current = now;
      } else {
        timeoutRef.current = setTimeout(() => {
          callback(...args);
          lastRan.current = Date.now();
        }, delay - timeSinceLastRan);
      }
    }) as T,
    [callback, delay]
  );
}

// Virtual scrolling for large lists
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length
    );
    
    return {
      start: Math.max(0, start - overscan),
      end
    };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      item,
      index: visibleRange.start + index
    }));
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  const handleScroll = useThrottle((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, 16); // ~60fps

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll
  };
}

// Intersection Observer hook for tracking visibility
export function useIntersectionObserver(
  options?: IntersectionObserverInit
) {
  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const [node, setNode] = useState<Element | null>(null);

  useEffect(() => {
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setEntry(entry),
      options
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [node, options]);

  return [setNode, entry] as const;
}

// Optimized event handlers with automatic cleanup
export function useOptimizedEventHandler<T extends Event>(
  eventName: string,
  handler: (event: T) => void,
  element?: Element | Window,
  options?: boolean | AddEventListenerOptions
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const target = element || window;
    const optimizedHandler = (event: Event) => handlerRef.current(event as T);

    target.addEventListener(eventName, optimizedHandler, options);

    return () => {
      target.removeEventListener(eventName, optimizedHandler, options);
    };
  }, [eventName, element, options]);
}

// Memory-efficient state for large datasets
export function useMemoryEfficientState<T>(
  initialValue: T,
  cleanup?: (value: T) => void
) {
  const [state, setState] = useState(initialValue);
  
  const optimizedSetState = useCallback((newValue: T | ((prev: T) => T)) => {
    setState(prevState => {
      const nextState = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(prevState) 
        : newValue;
      
      if (cleanup && prevState !== nextState) {
        cleanup(prevState);
      }
      
      return nextState;
    });
  }, [cleanup]);

  useEffect(() => {
    return () => {
      if (cleanup) {
        cleanup(state);
      }
    };
  }, []);

  return [state, optimizedSetState] as const;
}

// Performance monitoring for components
export function useComponentPerformance(componentName: string) {
  const metricsRef = useRef({
    renderCount: 0,
    mountTime: 0,
    updateTimes: [] as number[]
  });

  const recordRender = useCallback(() => {
    metricsRef.current.renderCount++;
    const renderTime = performance.now();
    
    if (metricsRef.current.renderCount === 1) {
      metricsRef.current.mountTime = renderTime;
    } else {
      metricsRef.current.updateTimes.push(renderTime);
    }
    
    performanceMonitor.recordCustomMetric(
      `component-${componentName}-render`,
      renderTime,
      { renderCount: metricsRef.current.renderCount }
    );
  }, [componentName]);

  useEffect(() => {
    recordRender();
  });

  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const unmountTime = performance.now();
      const totalLifetime = unmountTime - startTime;
      
      performanceMonitor.recordCustomMetric(
        `component-${componentName}-lifetime`,
        totalLifetime,
        {
          renderCount: metricsRef.current.renderCount,
          averageUpdateTime: metricsRef.current.updateTimes.length > 0
            ? metricsRef.current.updateTimes.reduce((a, b) => a + b, 0) / metricsRef.current.updateTimes.length
            : 0
        }
      );
    };
  }, [componentName]);

  return {
    renderCount: metricsRef.current.renderCount,
    metrics: metricsRef.current
  };
}

// Optimized API calls with caching and deduplication
export function useOptimizedFetch<T>(
  url: string | null,
  options?: RequestInit & { 
    cacheTTL?: number;
    dedupe?: boolean;
    retry?: number;
  }
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const cache = useRef(new Map<string, { data: T; timestamp: number }>());
  const pendingRequests = useRef(new Map<string, Promise<T>>());

  const fetchData = useCallback(async () => {
    if (!url) return;

    const cacheKey = `${url}-${JSON.stringify(options)}`;
    const cacheTTL = options?.cacheTTL || 300000; // 5 minutes default
    const shouldDedupe = options?.dedupe !== false;
    
    // Check cache first
    const cached = cache.current.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cacheTTL) {
      setData(cached.data);
      setLoading(false);
      return cached.data;
    }

    // Check for pending request
    if (shouldDedupe && pendingRequests.current.has(cacheKey)) {
      const result = await pendingRequests.current.get(cacheKey)!;
      setData(result);
      setLoading(false);
      return result;
    }

    setLoading(true);
    setError(null);

    const fetchPromise = (async () => {
      let attempts = 0;
      const maxRetries = options?.retry || 3;

      while (attempts < maxRetries) {
        try {
          const response = await fetch(url, options);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const result = await response.json();
          
          // Cache the result
          cache.current.set(cacheKey, {
            data: result,
            timestamp: Date.now()
          });

          return result;
        } catch (err) {
          attempts++;
          if (attempts >= maxRetries) {
            throw err;
          }
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
        }
      }
    })();

    if (shouldDedupe) {
      pendingRequests.current.set(cacheKey, fetchPromise);
    }

    try {
      const result = await fetchPromise;
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
      if (shouldDedupe) {
        pendingRequests.current.delete(cacheKey);
      }
    }
  }, [url, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    const cacheKey = `${url}-${JSON.stringify(options)}`;
    cache.current.delete(cacheKey);
    return fetchData();
  }, [url, options, fetchData]);

  return { data, loading, error, refetch };
}

// Bundle splitting and lazy loading helper
export function useLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const [Component, setComponent] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    importFn()
      .then(module => {
        if (isMounted) {
          setComponent(() => module.default);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [importFn]);

  if (loading) return fallback || null;
  if (error) throw error;
  return Component;
}