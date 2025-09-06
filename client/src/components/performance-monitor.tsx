import { useEffect, useState } from 'react';
import { usePerformance, useMemoryMonitor, useNetworkQuality } from '@/hooks/use-performance';

interface PerformanceMonitorProps {
  enabled?: boolean;
  showOverlay?: boolean;
}

export function PerformanceMonitor({ 
  enabled = process.env.NODE_ENV === 'development',
  showOverlay = false 
}: PerformanceMonitorProps) {
  const metrics = usePerformance();
  const memoryInfo = useMemoryMonitor();
  const networkInfo = useNetworkQuality();
  const [showMonitor, setShowMonitor] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    // Toggle monitor visibility with Ctrl+Shift+P
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setShowMonitor(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    // Log performance warnings
    if (metrics.lcp > 2500) {
      console.warn('🐌 Poor LCP detected:', metrics.lcp + 'ms');
    }
    if (metrics.fid > 100) {
      console.warn('🐌 Poor FID detected:', metrics.fid + 'ms');
    }
    if (metrics.cls > 0.1) {
      console.warn('🐌 Poor CLS detected:', metrics.cls);
    }

    // Memory warnings
    if (memoryInfo && memoryInfo.used > memoryInfo.limit * 0.8) {
      console.warn('🧠 High memory usage:', memoryInfo.used + 'MB');
    }

    // Network warnings
    if (networkInfo?.effectiveType === 'slow-2g' || networkInfo?.effectiveType === '2g') {
      console.warn('📶 Slow network detected:', networkInfo.effectiveType);
    }
  }, [enabled, metrics, memoryInfo, networkInfo]);

  if (!enabled || (!showMonitor && !showOverlay)) return null;

  const getScoreColor = (score: number, thresholds: number[]) => {
    if (score === 0) return 'text-gray-400';
    if (score <= thresholds[0]) return 'text-green-500';
    if (score <= thresholds[1]) return 'text-yellow-500';
    return 'text-red-500';
  };

  const formatTime = (time: number) => {
    if (time === 0) return 'N/A';
    return time < 1000 ? `${Math.round(time)}ms` : `${(time / 1000).toFixed(1)}s`;
  };

  return (
    <div className={`fixed ${showOverlay ? 'top-20 right-4' : 'bottom-4 right-4'} z-50 bg-black/90 text-white p-4 rounded-lg text-xs font-mono max-w-xs border border-primary/20 backdrop-blur-sm`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-primary">Performance Monitor</h3>
        <button
          onClick={() => setShowMonitor(false)}
          className="text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>
      
      {/* Core Web Vitals */}
      <div className="space-y-2">
        <div className="text-primary font-semibold">Core Web Vitals</div>
        
        <div className="flex justify-between">
          <span>LCP:</span>
          <span className={getScoreColor(metrics.lcp, [2500, 4000])}>
            {formatTime(metrics.lcp)}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>FID:</span>
          <span className={getScoreColor(metrics.fid, [100, 300])}>
            {formatTime(metrics.fid)}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>CLS:</span>
          <span className={getScoreColor(metrics.cls * 1000, [100, 250])}>
            {metrics.cls === 0 ? 'N/A' : metrics.cls.toFixed(3)}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>FCP:</span>
          <span className={getScoreColor(metrics.fcp, [1800, 3000])}>
            {formatTime(metrics.fcp)}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>TTFB:</span>
          <span className={getScoreColor(metrics.ttfb, [800, 1800])}>
            {formatTime(metrics.ttfb)}
          </span>
        </div>
      </div>

      {/* Memory Info */}
      {memoryInfo && (
        <div className="mt-4 pt-2 border-t border-gray-600">
          <div className="text-primary font-semibold mb-2">Memory</div>
          <div className="flex justify-between">
            <span>Used:</span>
            <span className={memoryInfo.used > memoryInfo.limit * 0.8 ? 'text-red-500' : 'text-green-500'}>
              {memoryInfo.used}MB
            </span>
          </div>
          <div className="flex justify-between">
            <span>Total:</span>
            <span>{memoryInfo.total}MB</span>
          </div>
          <div className="flex justify-between">
            <span>Limit:</span>
            <span>{memoryInfo.limit}MB</span>
          </div>
        </div>
      )}

      {/* Network Info */}
      {networkInfo && (
        <div className="mt-4 pt-2 border-t border-gray-600">
          <div className="text-primary font-semibold mb-2">Network</div>
          <div className="flex justify-between">
            <span>Type:</span>
            <span className={
              networkInfo.effectiveType === 'slow-2g' || networkInfo.effectiveType === '2g' 
                ? 'text-red-500' 
                : networkInfo.effectiveType === '3g' 
                ? 'text-yellow-500' 
                : 'text-green-500'
            }>
              {networkInfo.effectiveType}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Speed:</span>
            <span>{networkInfo.downlink}Mbps</span>
          </div>
          <div className="flex justify-between">
            <span>RTT:</span>
            <span>{networkInfo.rtt}ms</span>
          </div>
          {networkInfo.saveData && (
            <div className="text-yellow-500 mt-1">📱 Data Saver ON</div>
          )}
        </div>
      )}

      <div className="mt-4 pt-2 border-t border-gray-600 text-gray-400 text-center">
        Press Ctrl+Shift+P to toggle
      </div>
    </div>
  );
}

// Performance insights component for production
export function PerformanceInsights() {
  const [insights, setInsights] = useState<string[]>([]);
  const metrics = usePerformance();
  const memoryInfo = useMemoryMonitor();
  const networkInfo = useNetworkQuality();

  useEffect(() => {
    const newInsights: string[] = [];

    // LCP insights
    if (metrics.lcp > 2500 && metrics.lcp > 0) {
      newInsights.push('Consider optimizing your largest image or text block');
    }

    // FID insights
    if (metrics.fid > 100 && metrics.fid > 0) {
      newInsights.push('Reduce JavaScript execution time during page load');
    }

    // CLS insights
    if (metrics.cls > 0.1 && metrics.cls > 0) {
      newInsights.push('Ensure images and ads have defined dimensions');
    }

    // Memory insights
    if (memoryInfo && memoryInfo.used > memoryInfo.limit * 0.7) {
      newInsights.push('High memory usage detected - consider lazy loading');
    }

    // Network insights
    if (networkInfo?.effectiveType === 'slow-2g' || networkInfo?.effectiveType === '2g') {
      newInsights.push('Slow connection detected - loading optimized assets');
    }

    setInsights(newInsights);
  }, [metrics, memoryInfo, networkInfo]);

  // Only show in development or when there are actionable insights
  if (process.env.NODE_ENV === 'production' && insights.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm">
      {insights.map((insight, index) => (
        <div
          key={index}
          className="bg-yellow-900/90 border border-yellow-500/50 text-yellow-100 p-3 rounded-lg mb-2 text-sm backdrop-blur-sm animate-in slide-in-from-left duration-300"
        >
          <div className="flex items-start gap-2">
            <span className="text-yellow-400 mt-0.5">💡</span>
            <span>{insight}</span>
          </div>
        </div>
      ))}
    </div>
  );
}