import type { ApiError, HttpMethod } from '@/types/api';

export interface ClientFetchOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: HeadersInit;
  params?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
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
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });

  if (!response.ok) {
    const error = (await parseResponseBody<{
      message?: string;
      code?: string;
      errors?: Record<string, string[]>;
    }>(response).catch(() => undefined)) ?? { message: 'Request failed' };

    if (response.status === 401 && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    const apiError: ApiError = {
      message: error.message ?? `Request failed with status ${response.status}`,
      status: response.status,
      code: error.code ?? String(response.status),
      errors: error.errors ?? {},
    };

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
