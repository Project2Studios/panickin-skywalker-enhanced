import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Register service worker for PWA functionality
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully:', registration);
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content available, reload page
              if (confirm('New version available! Reload to update?')) {
                window.location.reload();
              }
            }
          });
        }
      });
      
      // Periodic cache cleanup
      setInterval(() => {
        if (registration.active) {
          registration.active.postMessage({ type: 'CACHE_CLEANUP' });
        }
      }, 30 * 60 * 1000); // Every 30 minutes
      
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  });
}

// Performance monitoring
if (import.meta.env.PROD) {
  // Monitor Core Web Vitals
  const observePerformance = () => {
    // FCP (First Contentful Paint)
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          console.log('FCP:', entry.startTime);
        }
      }
    }).observe({ entryTypes: ['paint'] });
    
    // LCP (Largest Contentful Paint)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('LCP:', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });
    
    // CLS (Cumulative Layout Shift)
    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          console.log('CLS:', clsValue);
        }
      }
    }).observe({ entryTypes: ['layout-shift'] });
  };
  
  // Start monitoring after page load
  if (document.readyState === 'complete') {
    observePerformance();
  } else {
    window.addEventListener('load', observePerformance);
  }
}

// Preload critical resources
const preloadCriticalResources = () => {
  const criticalImages = [
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
    'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400'
  ];
  
  criticalImages.forEach((src) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
};

preloadCriticalResources();

createRoot(document.getElementById("root")!).render(<App />);
