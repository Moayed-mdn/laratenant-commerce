/**
 * Axios client instance for client-side use ONLY.
 * Never use this in RSC (server components).
 */

import axios from 'axios';
import { APP_CONFIG } from '@/config/app';
import { normalizeError } from './error';
import { logger } from '@/lib/logger';

export const apiClient = axios.create({
  baseURL: APP_CONFIG.apiBaseUrl,
  timeout: APP_CONFIG.requestTimeout, // 10 seconds — hard rule
  withCredentials: true, // Sanctum cookies — hard rule
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    logger.debug(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    logger.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    logger.error('[API Response Error]', {
      status: error.response?.status,
      url: error.config?.url,
    });

    // If status 401, dispatch custom event for session expiry
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    }

    // Always throw normalized error
    throw normalizeError(error);
  }
);

export default apiClient;
