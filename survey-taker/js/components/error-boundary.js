// Error Boundary Component
// Note: React is loaded globally via script tags

export function createErrorBoundary() {
    const React = window.React;
    if (!React) {
        throw new Error('React is not available');
    }

    return class ErrorBoundary extends React.Component {
        constructor(props) {
            super(props);
            this.state = { hasError: false, error: null, errorInfo: null };
        }

        static getDerivedStateFromError(error) {
            // Update state so the next render will show the fallback UI
            return { hasError: true, error };
        }

        componentDidCatch(error, errorInfo) {
            // Log the error
            console.error('Error caught by boundary:', error, errorInfo);
            this.setState({ errorInfo });
        }

        render() {
            if (this.state.hasError) {
                // You can render any custom fallback UI
                return React.createElement('div', { className: 'error-boundary' },
                    React.createElement('div', { className: 'error-content' },
                        React.createElement('h2', null, 'Something went wrong'),
                        React.createElement('p', null, 'An error occurred while loading the survey. Please refresh the page to try again.'),
                        React.createElement('button', {
                            onClick: () => window.location.reload(),
                            className: 'button button--primary'
                        }, 'Refresh Page'),
                        typeof process !== 'undefined' && process.env.NODE_ENV === 'development' && this.state.error && 
                            React.createElement('details', { style: { marginTop: '1rem', textAlign: 'left' } },
                                React.createElement('summary', null, 'Error Details'),
                                React.createElement('pre', { style: { fontSize: '0.8rem', overflow: 'auto' } },
                                    this.state.error.toString()
                                )
                            )
                    )
                );
            }

            return this.props.children;
        }
    };
}

// Export a default ErrorBoundary for convenience
export const ErrorBoundary = createErrorBoundary();
