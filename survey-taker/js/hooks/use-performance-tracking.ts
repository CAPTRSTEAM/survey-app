import React from 'react';

// Ensure React is available for browser environment
const ReactInstance = window.React || (window as any).React;

// Performance tracking disabled in production to prevent crashes
export const usePerformanceTracking = (componentName: string) => {
    // Disabled to prevent performance issues and browser crashes
};

export const useRenderCount = (componentName: string) => {
  // Disabled to prevent performance issues and browser crashes
  return 0;
};

export const useMemoryUsage = () => {
  // Disabled to prevent performance issues and browser crashes
};
