import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '../index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Scanner root element missing');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Register the service worker only in production builds.
// Dev (vite/vercel dev) skips registration to avoid stale-cache pain
// while iterating.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/scan/sw.js', { scope: '/scan/' })
      .catch(() => {
        // Swallow registration errors — the app still works without the SW.
      });
  });
}
