import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Howler for audio testing
vi.mock('howler', () => ({
  Howl: vi.fn().mockImplementation(() => ({
    play: vi.fn(),
    pause: vi.fn(),
    stop: vi.fn(),
    volume: vi.fn(),
    seek: vi.fn(),
    duration: vi.fn(() => 180), // 3 minutes
    on: vi.fn(),
    off: vi.fn(),
    unload: vi.fn(),
    state: vi.fn(() => 'loaded'),
    playing: vi.fn(() => false)
  }))
}));

// Mock window.matchMedia for responsive testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver for lazy loading tests
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver for responsive components
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock performance APIs
if (!global.performance) {
  global.performance = {
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByType: vi.fn(() => []),
    getEntriesByName: vi.fn(() => []),
    clearMarks: vi.fn(),
    clearMeasures: vi.fn(),
    now: vi.fn(() => Date.now())
  } as any;
}

// Mock requestIdleCallback
if (!global.requestIdleCallback) {
  global.requestIdleCallback = vi.fn((callback: IdleRequestCallback) => {
    return setTimeout(() => callback({ 
      didTimeout: false, 
      timeRemaining: () => 50 
    } as IdleDeadline), 0);
  });
}

// Mock Web Vitals
vi.mock('web-vitals', () => ({
  getCLS: vi.fn(),
  getFID: vi.fn(),
  getFCP: vi.fn(),
  getLCP: vi.fn(),
  getTTFB: vi.fn(),
}));

// Setup global test utilities
export const mockPerformanceEntry = (name: string, startTime: number, duration: number) => ({
  name,
  entryType: 'measure',
  startTime,
  duration,
  detail: {}
});

export const createMockResponse = (data: any, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
};