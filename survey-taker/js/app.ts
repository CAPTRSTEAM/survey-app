// Main Survey App Entry Point
// Note: React and ReactDOM are loaded via script tags in HTML

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
let earlyConfigMessage: any = null;
let apiProviderInstance: any = null;

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
function registerApiProvider(apiProvider: any) {
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

// Initialize the application with retry logic and timeout
async function initializeApp(retryCount = 0) {
  const MAX_RETRIES = 3;
  const INIT_TIMEOUT = 10000; // 10 seconds
  
  // Check if React is available
  if (!window.React || !window.ReactDOM) {
    console.error('React or ReactDOM not available');
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying initialization (${retryCount + 1}/${MAX_RETRIES})...`);
      setTimeout(() => initializeApp(retryCount + 1), 1000);
      return;
    }
    showErrorBoundary('Failed to load required dependencies. Please refresh the page.');
    return;
  }
  
  try {
    // Set up timeout for initialization
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Initialization timeout')), INIT_TIMEOUT);
    });
    
    const initPromise = (async () => {
      // Dynamically import components with retry logic
      let ApiProvider, SurveyApp, createErrorBoundary;
      
      try {
        const apiProviderModule = await import('./utils/api-provider.js');
        ApiProvider = apiProviderModule.ApiProvider;
      } catch (error) {
        console.error('Failed to load ApiProvider:', error);
        throw new Error('Failed to load API provider module');
      }
      
      try {
        const surveyAppModule = await import('./components/survey-app.js');
        SurveyApp = surveyAppModule.SurveyApp;
      } catch (error) {
        console.error('Failed to load SurveyApp:', error);
        throw new Error('Failed to load survey app module');
      }
      
      try {
        const errorBoundaryModule = await import('./components/error-boundary.js');
        createErrorBoundary = errorBoundaryModule.createErrorBoundary;
      } catch (error) {
        console.error('Failed to load ErrorBoundary:', error);
        throw new Error('Failed to load error boundary module');
      }
      
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
      
      // Hide loading indicator
      const loadingIndicator = document.getElementById('loading-indicator');
      if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
      }
      
      console.log('Survey app initialized successfully');
    })();
    
    // Race between initialization and timeout
    await Promise.race([initPromise, timeoutPromise]);
    
  } catch (error) {
    console.error('Failed to initialize app:', error);
    
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying initialization (${retryCount + 1}/${MAX_RETRIES})...`);
      setTimeout(() => initializeApp(retryCount + 1), 2000 * (retryCount + 1)); // Exponential backoff
      return;
    }
    
    // Show specific error message based on error type
    let errorMessage = 'Failed to load the survey application. Please refresh the page.';
    if (error.message.includes('timeout')) {
      errorMessage = 'The application is taking too long to load. Please check your internet connection and refresh the page.';
    } else if (error.message.includes('module')) {
      errorMessage = 'Failed to load application modules. Please refresh the page.';
    }
    
    showErrorBoundary(errorMessage);
  }
}

// Start the application
async function startApp() {
  await initializeApp();
}

// Make initializeApp available globally for React availability check
let appInitialized = false;

window.initializeAppWhenReady = () => {
  if (!appInitialized) {
    appInitialized = true;
    startApp();
  }
};

// Start when DOM is ready (fallback if React check doesn't work)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (!appInitialized) {
      appInitialized = true;
      startApp();
    }
  });
} else {
  if (!appInitialized) {
    appInitialized = true;
    startApp();
  }
}
