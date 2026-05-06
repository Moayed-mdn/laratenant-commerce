/**
 * Server-side fetch wrapper for RSC use ONLY.
 * Never use Axios here. Use native fetch only.
 * Uses Bearer token authentication from HttpOnly cookie.
 */

import { cookies } from 'next/headers';
import { APP_CONFIG } from '@/config/app';
import type { ApiError } from '@/types/api';
import type { HttpMethod } from '@/types/api';
import { logger } from '@/lib/logger';

const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? 'auth_token';

export interface ServerFetchOptions {
  method?: HttpMethod;
  body?: unknown;
  cache?: RequestCache;
  tags?: string[];
}

/**
 * Get Bearer token from auth cookie for server-side use.
 */
export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null;
}

/**
 * Get locale from NEXT_LOCALE cookie for server-side use.
 */
export async function getLocale(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore.get('NEXT_LOCALE')?.value ?? 'en';
}

/**
 * Get auth headers with Bearer token.
 */
export async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'Accept-Language': await getLocale(),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Server-side fetch function for use in RSC.
 * Uses Bearer token authentication from HttpOnly cookie.
 */
export async function serverFetch<T>(
  path: string,
  options?: ServerFetchOptions
): Promise<T> {
  const fullUrl = `${APP_CONFIG.apiBaseUrl}${path}`;
  const authHeaders = await getAuthHeaders();

  const headers: HeadersInit = {
    ...authHeaders,
    'X-Requested-With': 'XMLHttpRequest',
  };

  logger.debug(`[Server Fetch] ${options?.method ?? 'GET'} ${fullUrl}`);

  const response = await fetch(fullUrl, {
    method: options?.method ?? 'GET',
    headers,
    body: options?.body ? JSON.stringify(options.body) : undefined,
    cache: options?.cache ?? 'no-store',
    ...(options?.tags && { next: { tags: options.tags } }),
  });

  if (!response.ok) {
    let errorData: { message?: string; errors?: Record<string, string[]> } = {};
    try {
      errorData = await response.json();
    } catch {
      // Ignore parse errors
    }

    const status = response.status;
    let code: string;
    switch (status) {
      case 401:
        code = 'UNAUTHORIZED';
        break;
      case 403:
        code = 'FORBIDDEN';
        break;
      case 404:
        code = 'NOT_FOUND';
        break;
      case 422:
        code = 'VALIDATION_ERROR';
        break;
      case 500:
        code = 'SERVER_ERROR';
        break;
      default:
        code = 'UNKNOWN_ERROR';
    }

    const apiError: ApiError = {
      message: errorData.message ?? 'An error occurred',
      errors: errorData.errors ?? {},
      status,
      code,
    };

    logger.error(`[Server Fetch Error] ${status} ${fullUrl}`, apiError);
    throw apiError;
  }

  return response.json() as T;
}
