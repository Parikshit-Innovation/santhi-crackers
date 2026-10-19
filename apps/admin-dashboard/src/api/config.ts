/**
 * Backend API configuration for Shanthi Sivakasi Crackers Admin Dashboard
 * In production: VITE_API_URL=https://YOUR-RENDER-BACKEND.onrender.com
 * In local dev: defaults to relative /api or localhost:3007
 */
const rawBaseUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim() || "";
export const API_BASE_URL = rawBaseUrl.replace(/\/$/, "");

/**
 * Returns prioritized API endpoints for admin fetching.
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
 * Returns primary API URL for single fetch requests.
 */
export function getApiUrl(path: string): string {
  const endpoints = getApiEndpoints(path);
  return endpoints[0] || path;
}
