import './react-globals.ts';
import type { PlatformConfigMessage } from './types/index.ts';

declare global {
  interface Window {
    initializeAppWhenReady?: () => void;
  }
}

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

const configListeners = new Set<(config: PlatformConfigMessage) => void>();
let pendingConfigMessage: PlatformConfigMessage | null = null;

function notifyConfigListeners(config: PlatformConfigMessage) {
  configListeners.forEach((listener) => {
    try {
      listener(config);
    } catch (error) {
      console.error('Error in config listener:', error);
    }
  });
}

function captureConfigMessage(config: PlatformConfigMessage) {
  pendingConfigMessage = config;
  notifyConfigListeners(config);
}

function subscribeToPlatformConfig(listener: (config: PlatformConfigMessage) => void) {
  configListeners.add(listener);

  if (pendingConfigMessage) {
    try {
      listener(pendingConfigMessage);
    } catch (error) {
      console.error('Error delivering pending config:', error);
    }
  }

  return () => {
    configListeners.delete(listener);
  };
}

function resolveInitialConfig(): PlatformConfigMessage | null {
  try {
    const globalConfig = (window as any).__SURVEY_APP_CONFIG__;
    if (globalConfig?.url && globalConfig?.token) {
      return { ...globalConfig };
    }

    const globalUrl = (window as any).__SURVEY_APP_API_URL__;
    const globalToken = (window as any).__SURVEY_APP_API_TOKEN__;
    if (globalUrl && globalToken) {
      return { url: String(globalUrl), token: String(globalToken) };
    }

    const params = new URLSearchParams(window.location.search);
    const urlParam = params.get('apiUrl') ?? params.get('api_url');
    const tokenParam = params.get('token') ?? params.get('apiToken');
    if (urlParam && tokenParam) {
      return {
        url: decodeURIComponent(urlParam),
        token: tokenParam,
      };
    }

    const envUrl = (import.meta as any)?.env?.VITE_PLATFORM_API_URL;
    const envToken = (import.meta as any)?.env?.VITE_PLATFORM_API_TOKEN;
    if (envUrl && envToken) {
      return { url: envUrl, token: envToken };
    }
  } catch (error: any) {
    console.warn('Unable to resolve initial platform configuration:', error);
  }

  return null;
}

window.addEventListener('message', (event) => {
  if (event?.data?.type === 'CONFIG') {
    captureConfigMessage(event.data as PlatformConfigMessage);
  }
});

const initialConfig = resolveInitialConfig();
if (initialConfig) {
  captureConfigMessage(initialConfig);
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
      let spaApiProviderModule: any;
      let SurveyApp: any;
      let createErrorBoundary: any;

      try {
        spaApiProviderModule = await import('spa-api-provider');
      } catch (error) {
        console.error('Failed to load spa-api-provider:', error);
        throw new Error('Failed to load platform API provider module');
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

      const { ApiProvider, useApi } = spaApiProviderModule;
      const ReactInstance = window.React;

      if (!ApiProvider || !useApi) {
        throw new Error('spa-api-provider did not export expected modules');
      }

      const ConfigBridge = () => {
        const { updateProviderConfig } = useApi();
        const platformConfigState = ReactInstance.useState(pendingConfigMessage as PlatformConfigMessage | null);
        const platformConfig = platformConfigState[0] as PlatformConfigMessage | null;
        const setPlatformConfig = platformConfigState[1] as (config: PlatformConfigMessage | null) => void;

        ReactInstance.useEffect(() => {
          const unsubscribe = subscribeToPlatformConfig((config) => {
            if (config?.url && config?.token) {
              try {
                updateProviderConfig(config.url, config.token);
              } catch (error) {
                console.error('Failed to update provider configuration:', error);
              }
            }
            setPlatformConfig(config);
          });

          return unsubscribe;
        }, [updateProviderConfig]);

        return ReactInstance.createElement(SurveyApp, { platformConfig });
      };

      // Create ErrorBoundary component
      const ErrorBoundary = createErrorBoundary();

      // Create and render the survey app
      const root = document.getElementById('root');

      if (!root) {
        throw new Error('Root element not found');
      }

      // Use React 18 createRoot API instead of deprecated render
      const reactRoot = (window.ReactDOM as any).createRoot(root);

      // Render with error boundary and provider
      const app = ReactInstance.createElement(
        ErrorBoundary,
        null,
        ReactInstance.createElement(
          ApiProvider,
          {
            apiUrl: pendingConfigMessage?.url,
            token: pendingConfigMessage?.token,
          },
          ReactInstance.createElement(ConfigBridge)
        )
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
    
  } catch (error: any) {
    console.error('Failed to initialize app:', error);
    
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying initialization (${retryCount + 1}/${MAX_RETRIES})...`);
      setTimeout(() => initializeApp(retryCount + 1), 2000 * (retryCount + 1)); // Exponential backoff
      return;
    }
    
    // Show specific error message based on error type
    let errorMessage = 'Failed to load the survey application. Please refresh the page.';
    const errorMessageText = error instanceof Error ? error.message : String(error ?? '');
    if (errorMessageText.includes('timeout')) {
      errorMessage = 'The application is taking too long to load. Please check your internet connection and refresh the page.';
    } else if (errorMessageText.includes('module')) {
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
