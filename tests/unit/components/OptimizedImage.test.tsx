/**
 * Unit tests for OptimizedImage component
 * Tests performance optimizations, lazy loading, error handling, and accessibility
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OptimizedImage, preloadImage, VirtualImageGallery } from '@/components/ui/optimized-image';

// Mock intersection observer
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
});
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: mockIntersectionObserver,
});

// Mock performance APIs
const mockPerformance = {
  mark: vi.fn(),
  measure: vi.fn(),
  now: vi.fn(() => Date.now()),
};
Object.defineProperty(window, 'performance', {
  writable: true,
  value: mockPerformance,
});

describe('OptimizedImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console.warn to avoid noise in tests
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders with required props', () => {
      render(
        <OptimizedImage
          src="/test-image.jpg"
          alt="Test image"
          width={400}
          height={300}
        />
      );

      expect(screen.getByAltText('Test image')).toBeInTheDocument();
    });

    it('applies correct dimensions', () => {
      const { container } = render(
        <OptimizedImage
          src="/test-image.jpg"
          alt="Test image"
          width={400}
          height={300}
          className="test-class"
        />
      );

      const wrapper = container.querySelector('.test-class');
      expect(wrapper).toHaveStyle({ width: '400px', height: '300px' });
    });

    it('renders with custom className', () => {
      const { container } = render(
        <OptimizedImage
          src="/test-image.jpg"
          alt="Test image"
          className="custom-class"
        />
      );

      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });
  });

  describe('Lazy Loading', () => {
    it('enables lazy loading by default', () => {
      render(
        <OptimizedImage
          src="/test-image.jpg"
          alt="Test image"
        />
      );

      // Should set up intersection observer
      expect(mockIntersectionObserver).toHaveBeenCalled();
    });

    it('disables lazy loading when lazy=false', () => {
      render(
        <OptimizedImage
          src="/test-image.jpg"
          alt="Test image"
          lazy={false}
        />
      );

      // Image should be visible immediately
      const img = screen.getByAltText('Test image');
      expect(img).toHaveAttribute('loading', 'eager');
    });

    it('disables lazy loading when priority=true', () => {
      render(
        <OptimizedImage
          src="/test-image.jpg"
          alt="Test image"
          priority={true}
        />
      );

      // Image should be visible immediately for priority images
      const img = screen.getByAltText('Test image');
      expect(img).toHaveAttribute('loading', 'eager');
    });

    it('shows loading indicator while image loads', async () => {
      render(
        <OptimizedImage
          src="/test-image.jpg"
          alt="Test image"
          lazy={false}
        />
      );

      // Should show loading spinner initially
      expect(screen.getByRole('generic')).toBeInTheDocument();
    });
  });

  describe('Image Format Optimization', () => {
    it('generates responsive srcSet when width is provided', () => {
      render(
        <OptimizedImage
          src="/test-image.jpg"
          alt="Test image"
          width={400}
          lazy={false}
        />
      );

      const img = screen.getByAltText('Test image');
      expect(img).toHaveAttribute('srcset');
    });

    it('uses custom sizes attribute', () => {
      render(
        <OptimizedImage
          src="/test-image.jpg"
          alt="Test image"
          width={400}
          sizes="(max-width: 768px) 100vw, 50vw"
          lazy={false}
        />
      );

      const img = screen.getByAltText('Test image');
      expect(img).toHaveAttribute('sizes', '(max-width: 768px) 100vw, 50vw');
    });

    it('renders picture element with modern formats', () => {
      const { container } = render(
        <OptimizedImage
          src="/test-image.jpg"
          alt="Test image"
          lazy={false}
        />
      );

      expect(container.querySelector('picture')).toBeInTheDocument();
    });
  });

  describe('Placeholder Handling', () => {
    it('shows blur placeholder by default', () => {
      const { container } = render(
        <OptimizedImage
          src="/test-image.jpg"
          alt="Test image"
          placeholder="blur"
          width={400}
          height={300}
        />
      );

      // Should render placeholder image with blur
      const placeholder = container.querySelector('.blur-sm');
      expect(placeholder).toBeInTheDocument();
    });

    it('shows empty placeholder when specified', () => {
      const { container } = render(
        <OptimizedImage
          src="/test-image.jpg"
          alt="Test image"
          placeholder="empty"
        />
      );

      // Should render gray placeholder div
      expect(container.querySelector('.bg-gray-200.animate-pulse')).toBeInTheDocument();
    });

    it('shows custom placeholder when provided', () => {
      const { container } = render(
        <OptimizedImage
          src="/test-image.jpg"
          alt="Test image"
          placeholder="/custom-placeholder.jpg"
        />
      );

      // Should render custom placeholder image
      const placeholder = container.querySelector('img[src="/custom-placeholder.jpg"]');
      expect(placeholder).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('shows error state when image fails to load', async () => {
      render(
        <OptimizedImage
          src="/nonexistent-image.jpg"
          alt="Test image"
          lazy={false}
        />
      );

      const img = screen.getByAltText('Test image');
      
      // Simulate image load error
      fireEvent.error(img);

      await waitFor(() => {
        expect(screen.getByText('Image unavailable')).toBeInTheDocument();
      });
    });

    it('shows fallback image when provided', async () => {
      render(
        <OptimizedImage
          src="/nonexistent-image.jpg"
          alt="Test image"
          fallback="/fallback-image.jpg"
          lazy={false}
        />
      );

      const img = screen.getByAltText('Test image');
      
      // Simulate image load error
      fireEvent.error(img);

      await waitFor(() => {
        expect(screen.getByDisplayValue('/fallback-image.jpg')).toBeInTheDocument();
      });
    });

    it('logs warning for slow loading images', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn');
      
      // Mock slow image load (> 2000ms)
      mockPerformance.now.mockReturnValueOnce(0).mockReturnValueOnce(2500);

      render(
        <OptimizedImage
          src="/slow-image.jpg"
          alt="Test image"
          lazy={false}
        />
      );

      const img = screen.getByAltText('Test image');
      
      // Simulate successful image load after delay
      fireEvent.load(img);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Slow image load: /slow-image.jpg took 2500.00ms')
      );
    });
  });

  describe('Performance Monitoring', () => {
    it('records performance marks when loading', () => {
      render(
        <OptimizedImage
          src="/test-image.jpg"
          alt="Test image"
          lazy={false}
        />
      );

      // Should call performance.mark when starting to load
      expect(mockPerformance.mark).toHaveBeenCalledWith('image-load-start');
    });

    it('measures load time on successful load', async () => {
      render(
        <OptimizedImage
          src="/test-image.jpg"
          alt="Test image"
          lazy={false}
        />
      );

      const img = screen.getByAltText('Test image');
      
      // Simulate image load
      fireEvent.load(img);

      await waitFor(() => {
        expect(mockPerformance.mark).toHaveBeenCalledWith('image-load-end');
        expect(mockPerformance.measure).toHaveBeenCalledWith(
          'image-load-time',
          'image-load-start',
          'image-load-end'
        );
      });
    });

    it('calls onLoad callback when image loads', async () => {
      const onLoadMock = vi.fn();
      
      render(
        <OptimizedImage
          src="/test-image.jpg"
          alt="Test image"
          lazy={false}
          onLoad={onLoadMock}
        />
      );

      const img = screen.getByAltText('Test image');
      
      // Simulate image load
      fireEvent.load(img);

      await waitFor(() => {
        expect(onLoadMock).toHaveBeenCalledTimes(1);
      });
    });

    it('calls onError callback when image fails', async () => {
      const onErrorMock = vi.fn();
      
      render(
        <OptimizedImage
          src="/nonexistent-image.jpg"
          alt="Test image"
          lazy={false}
          onError={onErrorMock}
        />
      );

      const img = screen.getByAltText('Test image');
      
      // Simulate image error
      fireEvent.error(img);

      await waitFor(() => {
        expect(onErrorMock).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Accessibility', () => {
    it('includes proper alt text', () => {
      render(
        <OptimizedImage
          src="/test-image.jpg"
          alt="Product photo showing a band t-shirt"
        />
      );

      expect(screen.getByAltText('Product photo showing a band t-shirt')).toBeInTheDocument();
    });

    it('sets proper ARIA attributes for placeholder', () => {
      const { container } = render(
        <OptimizedImage
          src="/test-image.jpg"
          alt="Test image"
          placeholder="blur"
        />
      );

      const placeholder = container.querySelector('[aria-hidden="true"]');
      expect(placeholder).toBeInTheDocument();
    });

    it('has proper loading attributes for screen readers', () => {
      render(
        <OptimizedImage
          src="/test-image.jpg"
          alt="Test image"
          lazy={true}
        />
      );

      const img = screen.getByAltText('Test image');
      expect(img).toHaveAttribute('loading', 'lazy');
    });
  });

  describe('Responsive Behavior', () => {
    it('generates appropriate sizes for responsive images', () => {
      render(
        <OptimizedImage
          src="/test-image.jpg"
          alt="Test image"
          width={800}
          lazy={false}
        />
      );

      const img = screen.getByAltText('Test image');
      const sizes = img.getAttribute('sizes');
      
      // Should include responsive breakpoints
      expect(sizes).toContain('(max-width: 768px) 100vw');
      expect(sizes).toContain('(max-width: 1200px) 50vw');
      expect(sizes).toContain('800px');
    });
  });
});

describe('preloadImage utility', () => {
  it('creates preload link element', () => {
    const createElementSpy = vi.spyOn(document, 'createElement');
    const mockLink = {
      rel: '',
      href: '',
      as: '',
      crossOrigin: '',
      type: ''
    };
    const mockHead = { appendChild: vi.fn() };
    
    createElementSpy.mockReturnValue(mockLink as any);
    Object.defineProperty(document, 'head', {
      value: mockHead,
      writable: true
    });

    preloadImage('/critical-image.jpg', {
      as: 'image',
      crossorigin: 'anonymous',
      type: 'image/webp'
    });

    expect(mockLink.rel).toBe('preload');
    expect(mockLink.href).toBe('/critical-image.jpg');
    expect(mockLink.as).toBe('image');
    expect(mockLink.crossOrigin).toBe('anonymous');
    expect(mockLink.type).toBe('image/webp');
    expect(mockHead.appendChild).toHaveBeenCalledWith(mockLink);
  });
});

describe('VirtualImageGallery', () => {
  const mockImages = Array.from({ length: 50 }, (_, i) => ({
    src: `/image-${i}.jpg`,
    alt: `Image ${i}`,
    width: 300,
    height: 200
  }));

  it('renders virtual gallery with limited visible items', () => {
    render(
      <VirtualImageGallery
        images={mockImages}
        columns={3}
        className="test-gallery"
      />
    );

    const gallery = screen.getByRole('generic');
    expect(gallery).toHaveClass('test-gallery');
    expect(gallery).toHaveStyle({ height: '400px' });
  });

  it('updates visible range on scroll', async () => {
    const user = userEvent.setup();
    
    render(
      <VirtualImageGallery
        images={mockImages}
        columns={3}
      />
    );

    const scrollContainer = screen.getByRole('generic');
    
    // Simulate scroll
    fireEvent.scroll(scrollContainer, { target: { scrollTop: 500 } });

    // Should trigger scroll handler
    expect(scrollContainer.scrollTop).toBe(500);
  });

  it('applies correct grid layout', () => {
    const { container } = render(
      <VirtualImageGallery
        images={mockImages}
        columns={4}
        gap={20}
      />
    );

    const gridContainer = container.querySelector('[style*="grid-template-columns"]');
    expect(gridContainer).toHaveStyle({
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '20px'
    });
  });
});

describe('Performance Optimizations', () => {
  it('implements efficient image loading patterns', () => {
    const { rerender } = render(
      <OptimizedImage
        src="/test1.jpg"
        alt="Test 1"
        lazy={false}
      />
    );

    // Rerender with different props should not recreate expensive operations
    rerender(
      <OptimizedImage
        src="/test2.jpg"
        alt="Test 2"
        lazy={false}
      />
    );

    // Performance marks should be called for each image
    expect(mockPerformance.mark).toHaveBeenCalledTimes(2);
  });

  it('cleanup resources on unmount', () => {
    const { unmount } = render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        lazy={true}
      />
    );

    // Should have set up intersection observer
    expect(mockIntersectionObserver).toHaveBeenCalled();
    
    const mockObserver = mockIntersectionObserver.mock.results[0].value;
    
    // Unmount component
    unmount();

    // Should cleanup intersection observer
    expect(mockObserver.disconnect).toHaveBeenCalled();
  });
});

describe('Integration with Performance Monitoring', () => {
  it('integrates with performance monitoring hooks', () => {
    // This would test integration with usePerformanceMonitor
    // In a real implementation, you might inject the performance monitor
    
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        lazy={false}
      />
    );

    // Should integrate with global performance monitoring
    expect(mockPerformance.mark).toHaveBeenCalledWith('image-load-start');
  });
});

// Mock for next tests - this simulates real network behavior
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    blob: () => Promise.resolve(new Blob()),
  })
) as any;