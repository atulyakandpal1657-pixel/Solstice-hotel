import { createRoot } from 'react-dom/client';
import { setBaseUrl } from '@workspace/api-client-react';

import App from './App';
import { ErrorBoundary } from '@/components/error-boundary';

import './index.css';

// Initialize API client base URL before any components or queries render.
// When VITE_API_BASE_URL is configured (e.g. cross-domain Vercel deployment),
// it prepends this URL to relative endpoints (/api/...).
// When omitted (local development), relative paths are preserved.
const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (rawApiBaseUrl && typeof rawApiBaseUrl === 'string') {
  let normalizedBaseUrl = rawApiBaseUrl.trim().replace(/\/+$/, '');
  try {
    const parsed = new URL(normalizedBaseUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      console.warn(
        `[API Config] VITE_API_BASE_URL protocol "${parsed.protocol}" may be invalid; expected http: or https:`,
      );
    }
    // Prevent accidental double /api prefix (e.g. https://api.domain.com/api)
    if (parsed.pathname.endsWith('/api')) {
      console.warn(
        '[API Config] VITE_API_BASE_URL ends with "/api". Stripping "/api" suffix because generated API client paths already include the "/api" prefix.',
      );
      normalizedBaseUrl = normalizedBaseUrl.slice(0, -4).replace(/\/+$/, '');
    }
    setBaseUrl(normalizedBaseUrl);
  } catch (err) {
    console.error(
      `[API Config] Invalid VITE_API_BASE_URL "${rawApiBaseUrl}". Falling back to relative API paths.`,
      err,
    );
    setBaseUrl(null);
  }
} else {
  // Preserve relative /api/... calls for local development when not set
  setBaseUrl(null);
}

createRoot(document.getElementById('root')!, {
  // Keeps caught errors off reportError(), which would raise the dev overlay.
  onCaughtError: (error, errorInfo) => {
    console.error(error, errorInfo.componentStack);
  },
}).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);

