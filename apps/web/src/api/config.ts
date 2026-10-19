/**
 * Backend API configuration for Shanthi Sivakasi Crackers
 * In production on Vercel: VITE_API_URL=https://YOUR-RENDER-BACKEND.onrender.com
 * In local development: defaults to relative /api (proxied by Vite) or localhost:3007 fallback.
 */
const rawBaseUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim() || "";
export const API_BASE_URL = rawBaseUrl.replace(/\/$/, "");

/**
 * Returns prioritized API endpoints for fetching data.
 */
export function getApiEndpoints(path: string): string[] {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (API_BASE_URL) {
    return [`${API_BASE_URL}${cleanPath}`];
  }
  if (import.meta.env.PROD) {
    return [cleanPath];
  }
  return [cleanPath, `http://localhost:3007${cleanPath}`];
}

/**
 * Returns the primary API URL for single fetch requests (e.g. orders, contact).
 */
export function getApiUrl(path: string): string {
  const endpoints = getApiEndpoints(path);
  return endpoints[0] || path;
}
