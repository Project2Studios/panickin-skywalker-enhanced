import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useOptimizedImage, useIntersectionObserver } from '@/hooks/useOptimization';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  className?: string;
  lazy?: boolean;
  placeholder?: 'blur' | 'empty' | string;
  sizes?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  fallback?: string;
}

/**
 * High-performance image component with automatic optimization features:
 * - WebP/AVIF format detection and serving
 * - Lazy loading with intersection observer
 * - Responsive image sizing
 * - Progressive loading with blur placeholder
 * - Error handling and fallbacks
 * - Performance monitoring
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  quality = 80,
  className,
  lazy = true,
  placeholder = 'blur',
  sizes,
  priority = false,
  onLoad,
  onError,
  fallback
}) => {
  const [isVisible, setIsVisible] = useState(!lazy || priority);
  const [hasError, setHasError] = useState(false);
  const [loadStartTime, setLoadStartTime] = useState<number>(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Use intersection observer for lazy loading
  const [setIntersectionRef, entry] = useIntersectionObserver({
    rootMargin: '50px',
    threshold: 0.1
  });

  // Use optimized image hook
  const { src: optimizedSrc, loaded, error, optimizedSrc: srcSet } = useOptimizedImage(
    isVisible ? src : '',
    { width, height, quality, lazy: !isVisible }
  );

  useEffect(() => {
    if (lazy && !priority && entry?.isIntersecting && !isVisible) {
      setIsVisible(true);
      setLoadStartTime(performance.now());
    }
  }, [entry?.isIntersecting, lazy, priority, isVisible]);

  useEffect(() => {
    if (!lazy || priority) {
      setIsVisible(true);
      setLoadStartTime(performance.now());
    }
  }, [lazy, priority]);

  // Handle image load events
  const handleLoad = useCallback(() => {
    if (loadStartTime > 0) {
      const loadTime = performance.now() - loadStartTime;
      
      // Report load time for performance monitoring
      if (performance.mark && performance.measure) {
        performance.mark('image-load-end');
        performance.measure('image-load-time', 'image-load-start', 'image-load-end');
      }
      
      // Log slow loading images
      if (loadTime > 2000) {
        console.warn(`Slow image load: ${src} took ${loadTime.toFixed(2)}ms`);
      }
    }
    
    onLoad?.();
  }, [loadStartTime, onLoad, src]);

  const handleError = useCallback(() => {
    setHasError(true);
    console.warn(`Failed to load image: ${src}`);
    onError?.();
  }, [onError, src]);

  // Generate responsive srcSet
  const generateSrcSet = useCallback(() => {
    if (!srcSet || !width) return undefined;

    const breakpoints = [0.5, 0.75, 1, 1.5, 2];
    return breakpoints
      .map(multiplier => {
        const scaledWidth = Math.round(width * multiplier);
        return `${srcSet.fallback.replace(/w=\d+/, `w=${scaledWidth}`)} ${scaledWidth}w`;
      })
      .join(', ');
  }, [srcSet, width]);

  // Generate sizes attribute for responsive images
  const generateSizes = useCallback(() => {
    if (sizes) return sizes;
    if (!width) return undefined;

    // Default responsive sizes
    return `(max-width: 768px) 100vw, (max-width: 1200px) 50vw, ${width}px`;
  }, [sizes, width]);

  // Create blur placeholder data URL
  const createBlurPlaceholder = useCallback(() => {
    if (placeholder !== 'blur') return undefined;
    
    // Simple blur placeholder (you could enhance this with actual blur generation)
    const svg = `
      <svg width="${width || 400}" height="${height || 300}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#e5e7eb;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)" />
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }, [placeholder, width, height]);

  // Combine refs
  const combinedRef = useCallback((node: HTMLDivElement | null) => {
    containerRef.current = node;
    if (lazy && !priority) {
      setIntersectionRef(node);
    }
  }, [lazy, priority, setIntersectionRef]);

  // Performance monitoring
  useEffect(() => {
    if (isVisible && loadStartTime === 0) {
      performance.mark?.('image-load-start');
    }
  }, [isVisible, loadStartTime]);

  // Handle error fallback
  if (hasError && fallback) {
    return (
      <div
        ref={combinedRef}
        className={cn('relative overflow-hidden', className)}
        style={{ width, height }}
      >
        <img
          src={fallback}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => console.warn(`Fallback image also failed: ${fallback}`)}
        />
      </div>
    );
  }

  return (
    <div
      ref={combinedRef}
      className={cn('relative overflow-hidden', className)}
      style={{ width, height }}
    >
      {/* Placeholder */}
      {!loaded && placeholder && (
        <div className="absolute inset-0">
          {placeholder === 'blur' ? (
            <img
              src={createBlurPlaceholder()}
              alt=""
              className="w-full h-full object-cover filter blur-sm scale-105"
              aria-hidden="true"
            />
          ) : placeholder === 'empty' ? (
            <div className="w-full h-full bg-gray-200 animate-pulse" />
          ) : (
            <img
              src={placeholder}
              alt=""
              className="w-full h-full object-cover opacity-50"
              aria-hidden="true"
            />
          )}
        </div>
      )}

      {/* Main image */}
      {isVisible && (
        <picture>
          {srcSet?.avif && (
            <source
              srcSet={srcSet.avif}
              sizes={generateSizes()}
              type="image/avif"
            />
          )}
          {srcSet?.webp && (
            <source
              srcSet={srcSet.webp}
              sizes={generateSizes()}
              type="image/webp"
            />
          )}
          <img
            ref={imgRef}
            src={optimizedSrc || src}
            srcSet={generateSrcSet()}
            sizes={generateSizes()}
            alt={alt}
            width={width}
            height={height}
            className={cn(
              'w-full h-full object-cover transition-opacity duration-300',
              loaded ? 'opacity-100' : 'opacity-0',
              hasError && 'bg-gray-200'
            )}
            onLoad={handleLoad}
            onError={handleError}
            loading={lazy && !priority ? 'lazy' : 'eager'}
            decoding="async"
          />
        </picture>
      )}

      {/* Loading indicator */}
      {isVisible && !loaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      )}

      {/* Error state */}
      {hasError && !fallback && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center text-gray-500">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="mt-2 text-sm">Image unavailable</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Preload utility for critical images
export const preloadImage = (src: string, options?: {
  as?: 'image';
  crossorigin?: 'anonymous' | 'use-credentials';
  type?: string;
}) => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = src;
  link.as = options?.as || 'image';
  
  if (options?.crossorigin) {
    link.crossOrigin = options.crossorigin;
  }
  
  if (options?.type) {
    link.type = options.type;
  }
  
  document.head.appendChild(link);
};

// Image gallery with virtual scrolling
interface ImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    width?: number;
    height?: number;
  }>;
  columns?: number;
  gap?: number;
  className?: string;
}

export const VirtualImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  columns = 3,
  gap = 16,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  
  const itemHeight = 300; // Approximate height per row
  const rowCount = Math.ceil(images.length / columns);
  const totalHeight = rowCount * (itemHeight + gap);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const containerHeight = e.currentTarget.clientHeight;
    
    const startRow = Math.floor(scrollTop / (itemHeight + gap));
    const endRow = Math.min(
      startRow + Math.ceil(containerHeight / (itemHeight + gap)) + 2,
      rowCount
    );
    
    const start = Math.max(0, startRow * columns - columns);
    const end = Math.min(endRow * columns, images.length);
    
    setVisibleRange({ start, end });
  }, [columns, itemHeight, gap, rowCount, images.length]);

  const visibleImages = images.slice(visibleRange.start, visibleRange.end);
  const offsetY = Math.floor(visibleRange.start / columns) * (itemHeight + gap);

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto', className)}
      onScroll={handleScroll}
      style={{ height: '400px' }} // Set a fixed height for virtual scrolling
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: `${gap}px`
          }}
        >
          {visibleImages.map((image, index) => (
            <OptimizedImage
              key={visibleRange.start + index}
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height || 300}
              className="rounded-lg"
              lazy={true}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OptimizedImage;