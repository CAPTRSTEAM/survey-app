// Main Survey App Entry Point
// Note: React and ReactDOM are loaded via script tags in HTML

console.log('Survey App: app.js loaded successfully');

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  showErrorBoundary('An unexpected error occurred. Please refresh the page.');
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  showErrorBoundary('An unexpected error occurred. Please refresh the page.');
});

// Global message listener setup - ensure it's ready before any components
// Store early CONFIG messages to deliver to ApiProvider when ready
let earlyConfigMessage = null;
let apiProviderInstance = null;

window.addEventListener('message', (event) => {
  if (event.data.type === 'CONFIG') {
    earlyConfigMessage = event.data;
    
    // If ApiProvider is already ready, deliver the message immediately
    if (apiProviderInstance) {
      apiProviderInstance.handleConfigMessage(event.data);
    }
  }
});

// Function to register ApiProvider and deliver any early messages
function registerApiProvider(apiProvider) {
  apiProviderInstance = apiProvider;
  
  // Deliver any early CONFIG message if we have one
  if (earlyConfigMessage) {
    apiProviderInstance.handleConfigMessage(earlyConfigMessage);
    earlyConfigMessage = null; // Clear after delivery
  }
}

function showErrorBoundary(message: string) {
  const errorBoundary = document.getElementById('error-boundary');
  const errorContent = errorBoundary?.querySelector('.error-content');
  const errorMessage = errorContent?.querySelector('p');
  
  if (errorMessage) {
    errorMessage.textContent = message;
  }
  
  if (errorBoundary) {
    errorBoundary.style.display = 'flex';
  }
}

// Initialize the application
async function initializeApp() {
  console.log('Survey App: Initializing application...');
  
  // Check if React is available
  if (!window.React || !window.ReactDOM) {
    console.error('React or ReactDOM not available');
    showErrorBoundary('Failed to load required dependencies. Please refresh the page.');
    return;
  }
  
  try {
    // Dynamically import components
    const { ApiProvider } = await import('./utils/api-provider.js');
    const { SurveyApp } = await import('./components/survey-app.ts');
    const { createErrorBoundary } = await import('./components/error-boundary.js');
    
    console.log('Survey App: Components imported successfully');
    
    // Create API provider
    const apiProvider = new ApiProvider();
    
    // Register the API provider with the global message listener
    registerApiProvider(apiProvider);
    
    // Create ErrorBoundary component
    const ErrorBoundary = createErrorBoundary();
    
    // Create and render the survey app
    const root = document.getElementById('root');
    
    if (!root) {
      throw new Error('Root element not found');
    }
    
    // Use React 18 createRoot API instead of deprecated render
    const reactRoot = (window.ReactDOM as any).createRoot(root);
    
    // Render with error boundary
    const app = window.React.createElement(ErrorBoundary, null,
      window.React.createElement(SurveyApp, { apiProvider })
    );
    
    reactRoot.render(app);
    
    console.log('Survey App: Application rendered successfully');
    
  } catch (error) {
    console.error('Failed to initialize app:', error);
    showErrorBoundary('Failed to load the survey application. Please refresh the page.');
  }
}

// Start the application
async function startApp() {
  console.log('Survey App: Starting application...');
  await initializeApp();
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
