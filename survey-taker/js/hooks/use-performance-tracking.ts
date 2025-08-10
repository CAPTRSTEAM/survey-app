import { React } from '../utils/react-wrapper.js';

export const usePerformanceTracking = (componentName: string) => {
  React.useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      // Performance tracking disabled in production
    };
  });
};

export const useRenderCount = (componentName: string) => {
  const renderCount = React.useRef(0);
  
  React.useEffect(() => {
    renderCount.current += 1;
    // Render count tracking disabled in production
  });
  
  return renderCount.current;
};

export const useMemoryUsage = () => {
  React.useEffect(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      // Memory usage tracking disabled in production
    }
  });
};
