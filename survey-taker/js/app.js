// Main Survey App Entry Point
// Note: Components are imported dynamically after React is loaded

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    showErrorBoundary('An unexpected error occurred. Please refresh the page.');
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    showErrorBoundary('An unexpected error occurred. Please refresh the page.');
});

function showErrorBoundary(message) {
    const errorBoundary = document.getElementById('error-boundary');
    const errorContent = errorBoundary.querySelector('.error-content');
    const errorMessage = errorContent.querySelector('p');
    
    if (errorMessage) {
        errorMessage.textContent = message;
    }
    
    errorBoundary.style.display = 'flex';
}

// Load React and ReactDOM from CDN with fallback
async function loadReact() {
    try {
        // Try to load React from CDN
        const React = await import('https://esm.sh/react@18');
        const ReactDOM = await import('https://esm.sh/react-dom@18');
        
        // Make React available globally
        window.React = React.default || React;
        window.ReactDOM = ReactDOM.default || ReactDOM;
        
        return true;
    } catch (error) {
        console.error('Failed to load React from CDN:', error);
        
        // Try alternative CDN
        try {
            const React = await import('https://unpkg.com/react@18/umd/react.production.min.js');
            const ReactDOM = await import('https://unpkg.com/react-dom@18/umd/react-dom.production.min.js');
            
            window.React = React.default || React;
            window.ReactDOM = ReactDOM.default || ReactDOM;
            
            return true;
        } catch (fallbackError) {
            console.error('Failed to load React from fallback CDN:', fallbackError);
            showErrorBoundary('Failed to load required dependencies. Please check your internet connection and refresh the page.');
            return false;
        }
    }
}

// Initialize the application
async function initializeApp() {
    try {
        // Dynamically import components after React is loaded
        const { ApiProvider } = await import('./utils/api-provider.js');
        const { SurveyApp } = await import('./components/survey-app.js');
        const { ErrorBoundary } = await import('./components/error-boundary.js');
        
        // Create API provider
        const apiProvider = new ApiProvider();
        
        // Create and render the survey app
        const root = document.getElementById('root');
        
        if (!root) {
            throw new Error('Root element not found');
        }
        
        // Render with error boundary
        const app = React.createElement(ErrorBoundary, null,
            React.createElement(SurveyApp, { apiProvider })
        );
        
        ReactDOM.render(app, root);
        
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showErrorBoundary('Failed to load the survey application. Please refresh the page.');
    }
}

// Start the application
async function startApp() {
    const reactLoaded = await loadReact();
    
    if (reactLoaded) {
        await initializeApp();
    }
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
} else {
    startApp();
}
