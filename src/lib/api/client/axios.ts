/**
 * Axios client instance for client-side use ONLY.
 * Never use this in RSC (server components).
 * Uses Bearer token authentication (Sanctum token-based auth).
 */

import axios from 'axios';
import { APP_CONFIG } from '@/config/app';
import { normalizeError } from './error';
import { logger } from '@/lib/logger';
import Cookies from 'js-cookie';
import { useLocale } from 'next-intl';

// Auth cookie name for Bearer token
const AUTH_COOKIE_NAME = process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME ?? 'auth_token';

/**
 * Get Bearer token from cookie.
 * Note: This only works if the cookie is NOT HttpOnly.
 * For HttpOnly cookies, use the /api/proxy pattern instead.
 */
function getAuthToken(): string | null {
  const token = Cookies.get(AUTH_COOKIE_NAME);
  return token || null;
}

export const apiClient = axios.create({
  baseURL: APP_CONFIG.apiBaseUrl,
  timeout: APP_CONFIG.requestTimeout, // 10 seconds — hard rule
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
});

// Request interceptor - add Bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const locale = Cookies.get('NEXT_LOCALE');
    if (locale) {
      config.headers['Accept-Language'] = locale;
    }
    
    logger.debug(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.log('[axios.ts] Request interceptor error:', error);
    logger.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log('[axios.ts] Response received:', {
      status: response.status,
      url: response.config?.url,
    });
    return response;
  },
  (error) => {
    console.log('[axios.ts] Response error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
    });

    // If status 401, dispatch custom event for session expiry
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }

    // Always throw normalized error
    throw normalizeError(error);
  }
);

export default apiClient;