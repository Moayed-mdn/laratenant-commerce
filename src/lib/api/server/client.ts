/**
 * Server-side fetch wrapper for RSC use ONLY.
 * Never use Axios here. Use native fetch only.
 */

import { cookies } from 'next/headers';
import { APP_CONFIG } from '@/config/app';
import type { ApiError } from '@/types/api';
import type { HttpMethod } from '@/types/api';
import { logger } from '@/lib/logger';

export interface ServerFetchOptions {
  method?: HttpMethod;
  body?: unknown;
  cache?: RequestCache;
  tags?: string[];
}

/**
 * Server-side fetch function for use in RSC.
 * Forwards cookies for Sanctum authentication.
 */
export async function serverFetch<T>(
  path: string,
  options?: ServerFetchOptions
): Promise<T> {
  const cookieStore = await cookies();
  const fullUrl = `${APP_CONFIG.apiBaseUrl}${path}`;

  // Build cookie header from all cookies for Sanctum authentication
  const cookieHeader = cookieStore.getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join('; ');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    Cookie: cookieHeader, // Forward all cookies for Sanctum
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
