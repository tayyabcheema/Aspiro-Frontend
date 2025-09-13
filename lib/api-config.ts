// Centralized API configuration
// This ensures all API calls use the same base URL from environment variables

export const API_CONFIG = {
  // Use NEXT_PUBLIC_API_BASE_URL if available, otherwise fallback to NEXT_PUBLIC_API_URL
  // This provides flexibility for different naming conventions
  BASE_URL: (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/$/, ''),
  
  // Backend origin for server-side proxy (used in API routes)
  BACKEND_ORIGIN: process.env.BACKEND_ORIGIN || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000',
  
  // Default headers for all API requests
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
  
  // Timeout for API requests (in milliseconds)
  TIMEOUT: 30000,
} as const;

// Helper function to get the full API URL
export function getApiUrl(endpoint: string): string {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_CONFIG.BASE_URL}${path}`;
}

// Helper function to get backend origin URL
export function getBackendOrigin(): string {
  return API_CONFIG.BACKEND_ORIGIN.replace(/\/$/, '');
}

// Helper function to get backend API URL
export function getBackendApiUrl(endpoint: string): string {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${getBackendOrigin()}/api${path}`;
}
