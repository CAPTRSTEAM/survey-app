import React from 'react';

// Ensure React is available for browser environment
const ReactInstance = window.React || (window as any).React;

// Detect if we're on Mac to reduce performance overhead
const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

export const usePerformanceTracking = (componentName: string) => {
    ReactInstance.useEffect(() => {
      // Skip performance tracking on Mac to prevent performance issues
      if (isMac) return;
      
      const startTime = performance.now();
      
      return () => {
        const duration = performance.now() - startTime;
        // Performance tracking disabled in production
      };
    }, []); // Empty dependency array to run only once
};

export const useRenderCount = (componentName: string) => {
  const renderCount = ReactInstance.useRef(0);
  
  ReactInstance.useEffect(() => {
    // Skip render count tracking on Mac to prevent performance issues
    if (isMac) return;
    
    renderCount.current += 1;
    // Render count tracking disabled in production
  });
  
  return renderCount.current;
};

export const useMemoryUsage = () => {
  ReactInstance.useEffect(() => {
    // Skip memory usage tracking on Mac to prevent performance issues
    if (isMac) return;
    
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      // Memory usage tracking disabled in production
    }
  }, []); // Empty dependency array to run only once
};
