import '@testing-library/jest-dom';

// Mock React for testing
global.React = {
  createElement: (type: any, props: any, ...children: any[]) => {
    return { type, props: { ...props, children } };
  },
  useState: (initial: any) => [initial, vi.fn()],
  useEffect: vi.fn(),
  useCallback: (fn: any) => fn,
  useMemo: (fn: any) => fn(),
  useRef: (initial: any) => ({ current: initial }),
  Fragment: 'Fragment'
};

// Mock window.parent for platform mode testing
Object.defineProperty(window, 'parent', {
  value: window,
  writable: true
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: () => Date.now(),
    memory: {
      usedJSHeapSize: 1000000,
      totalJSHeapSize: 2000000,
      jsHeapSizeLimit: 4000000
    }
  }
});
