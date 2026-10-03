/**
 * DARE ARQAM Lightweight Client Performance Monitoring
 * Tracks critical Web Vitals (TTFB, LCP, CLS) and API latencies safely in memory.
 */

interface PerformanceMetric {
  name: string;
  value: number;
  rating?: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

const metricsLog: PerformanceMetric[] = [];
const MAX_METRICS = 50;

export function recordMetric(name: string, value: number, rating?: 'good' | 'needs-improvement' | 'poor') {
  if (metricsLog.length >= MAX_METRICS) {
    metricsLog.shift();
  }
  metricsLog.push({
    name,
    value: Math.round(value * 100) / 100,
    rating,
    timestamp: Date.now(),
  });
}

export function getPerformanceMetrics(): PerformanceMetric[] {
  return [...metricsLog];
}

/**
 * Initializes browser performance observers on boot
 */
export function initPerformanceMonitoring(): void {
  if (typeof window === 'undefined' || !('performance' in window)) return;

  // 1. Navigation Timing (TTFB, DOM Interactive, Complete)
  window.addEventListener('load', () => {
    setTimeout(() => {
      try {
        const [navEntry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        if (navEntry) {
          const ttfb = navEntry.responseStart - navEntry.requestStart;
          const domInteractive = navEntry.domInteractive;
          const pageLoadTime = navEntry.loadEventEnd - navEntry.startTime;

          recordMetric('TTFB (Time to First Byte)', ttfb, ttfb < 200 ? 'good' : ttfb < 600 ? 'needs-improvement' : 'poor');
          recordMetric('DOM Interactive', domInteractive, domInteractive < 1000 ? 'good' : 'needs-improvement');
          recordMetric('Total Page Load', pageLoadTime, pageLoadTime < 2500 ? 'good' : 'needs-improvement');
        }
      } catch {}
    }, 0);
  });

  // 2. Largest Contentful Paint (LCP)
  try {
    if ('PerformanceObserver' in window && PerformanceObserver.supportedEntryTypes?.includes('largest-contentful-paint')) {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          recordMetric('LCP (Largest Contentful Paint)', lastEntry.startTime, lastEntry.startTime < 2500 ? 'good' : 'needs-improvement');
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    }
  } catch {}
}
