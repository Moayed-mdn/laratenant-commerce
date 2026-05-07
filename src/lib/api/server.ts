import { cookies } from 'next/headers';
import { APP_CONFIG } from '@/config/app';
import type { ApiError, HttpMethod } from '@/types/api';

export interface ServerFetchOptions {
  method?: HttpMethod;
  body?: unknown;
  cache?: RequestCache;
  tags?: string[];
  headers?: HeadersInit;
}

async function parseResponseBody<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

export async function serverFetch<T>(path: string, options: ServerFetchOptions = {}): Promise<T> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const response = await fetch(`${APP_CONFIG.apiBaseUrl}${path}`, {
    method: options.method ?? 'GET',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      Cookie: cookieHeader,
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: options.cache ?? 'no-store',
    ...(options.tags ? { next: { tags: options.tags } } : {}),
  });

  if (!response.ok) {
    const errorData =
      (await parseResponseBody<{ message?: string; errors?: Record<string, string[]> }>(response).catch(
        () => undefined
      )) ?? {};

    const apiError: ApiError = {
      message: errorData.message ?? 'An error occurred',
      errors: errorData.errors ?? {},
      status: response.status,
      code: String(response.status),
    };

    throw apiError;
  }

  return parseResponseBody<T>(response);
}
