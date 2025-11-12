import * as React from 'react';
import * as ReactDOMClient from 'react-dom/client';

declare global {
  interface Window {
    React?: typeof React;
    ReactDOM?: typeof ReactDOMClient & {
      createRoot: typeof ReactDOMClient.createRoot;
      hydrateRoot: typeof ReactDOMClient.hydrateRoot;
    };
  }
}

if (!window.React) {
  window.React = React;
}

if (!window.ReactDOM) {
  window.ReactDOM = {
    ...ReactDOMClient,
    createRoot: ReactDOMClient.createRoot,
    hydrateRoot: ReactDOMClient.hydrateRoot,
  } as unknown as Window['ReactDOM'];
}

