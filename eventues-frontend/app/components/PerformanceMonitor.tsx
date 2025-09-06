'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

const PerformanceMonitor = () => {
  useEffect(() => {
    // Web Vitals monitoring
    const reportWebVitals = (metric: any) => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', metric.name, {
          event_category: 'Web Vitals',
          event_label: metric.id,
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          non_interaction: true,
        });
      }
    };

    // Performance API fallback for core web vitals
    if ('PerformanceObserver' in window) {
      try {
        // Monitor Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry && window.gtag) {
            window.gtag('event', 'LCP', {
              event_category: 'Web Vitals',
              value: Math.round(lastEntry.startTime),
              non_interaction: true,
            });
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // Monitor First Contentful Paint
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.name === 'first-contentful-paint' && window.gtag) {
              window.gtag('event', 'FCP', {
                event_category: 'Web Vitals',
                value: Math.round(entry.startTime),
                non_interaction: true,
              });
            }
          });
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
      } catch (error) {
        console.warn('Performance monitoring not supported');
      }
    }

    // Performance observer for additional metrics
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              console.log('Navigation timing:', {
                domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
                loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
                totalTime: navEntry.loadEventEnd - navEntry.fetchStart
              });
            }
          });
        });
        
        observer.observe({ entryTypes: ['navigation', 'paint'] });
        
        return () => observer.disconnect();
      } catch (error) {
        console.warn('Performance Observer not supported');
      }
    }
  }, []);

  return null;
};

export default PerformanceMonitor;
