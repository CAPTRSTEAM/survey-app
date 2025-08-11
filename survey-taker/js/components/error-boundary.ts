import React from 'react';

// Ensure React is available for browser environment
const ReactInstance = window.React || (window as any).React;

export function createErrorBoundary() {
  return class ErrorBoundary extends ReactInstance.Component<any, { hasError: boolean; error?: Error }> {
    constructor(props: any) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
      return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: any) {
      console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
      if (this.state.hasError) {
        return ReactInstance.createElement('div', { className: 'error-boundary' },
          ReactInstance.createElement('div', { className: 'error-content' },
            ReactInstance.createElement('h2', null, 'Something went wrong'),
            ReactInstance.createElement('p', null, 'Please refresh the page to try again.'),
            ReactInstance.createElement('button', { 
              onClick: () => window.location.reload(),
              className: 'button button--primary'
            }, 'Refresh Page')
          )
        );
      }

      return this.props.children;
    }
  };
}
