import React from 'react';

// Ensure React is available for browser environment
const ReactInstance = window.React || (window as any).React;

export const usePerformanceTracking = (componentName: string) => {
    ReactInstance.useEffect(() => {
      const startTime = performance.now();
      
      return () => {
        const duration = performance.now() - startTime;
        // Performance tracking disabled in production
      };
    });
};

export const useRenderCount = (componentName: string) => {
  const renderCount = ReactInstance.useRef(0);
  
  ReactInstance.useEffect(() => {
    renderCount.current += 1;
    // Render count tracking disabled in production
  });
  
  return renderCount.current;
};

export const useMemoryUsage = () => {
  ReactInstance.useEffect(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      // Memory usage tracking disabled in production
    }
  });
};
