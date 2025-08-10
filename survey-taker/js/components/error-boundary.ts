import { React } from '../utils/react-wrapper.js';

export function createErrorBoundary() {
  return class ErrorBoundary extends React.Component<any, { hasError: boolean; error?: Error }> {
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
        return React.createElement('div', { className: 'error-boundary' },
          React.createElement('div', { className: 'error-content' },
            React.createElement('h2', null, 'Something went wrong'),
            React.createElement('p', null, 'Please refresh the page to try again.'),
            React.createElement('button', { 
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
