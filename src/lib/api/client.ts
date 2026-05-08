import type { ApiError, HttpMethod } from '@/types/api';
import {
  buildHeaders,
  DEFAULT_JSON_HEADERS,
  parseResponseBody,
  serializeJsonBody,
  toApiError,
} from '@/lib/api/core/transport';

export interface ClientFetchOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: HeadersInit;
  params?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
}

function withQueryParams(
  path: string,
  params?: Record<string, string | number | boolean | undefined>
): string {
  if (!params) return path;

  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) search.set(key, String(value));
  });

  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

export async function clientFetch<T>(
  path: string,
  options: ClientFetchOptions = {}
): Promise<T> {
  const endpoint = withQueryParams(path, options.params);
  const response = await fetch(`/api/proxy?endpoint=${encodeURIComponent(endpoint)}`, {
    method: options.method ?? 'GET',
    credentials: 'include',
    headers: buildHeaders(DEFAULT_JSON_HEADERS, options.headers),
    body: serializeJsonBody(options.body),
    signal: options.signal,
  });

  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    const apiError: ApiError = await toApiError(response, `Request failed with status ${response.status}`);
    throw apiError;
  }

  return parseResponseBody<T>(response);
}

export const clientApi = {
  get: <T>(path: string, options: Omit<ClientFetchOptions, 'method' | 'body'> = {}) =>
    clientFetch<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options: Omit<ClientFetchOptions, 'method' | 'body'> = {}) =>
    clientFetch<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options: Omit<ClientFetchOptions, 'method' | 'body'> = {}) =>
    clientFetch<T>(path, { ...options, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, options: Omit<ClientFetchOptions, 'method' | 'body'> = {}) =>
    clientFetch<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options: Omit<ClientFetchOptions, 'method' | 'body'> = {}) =>
    clientFetch<T>(path, { ...options, method: 'DELETE' }),
};
