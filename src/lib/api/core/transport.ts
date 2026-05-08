import type { ApiError } from '@/types/api';

interface ApiErrorPayload {
  message?: string;
  code?: string;
  errors?: Record<string, string[]>;
}

export const DEFAULT_JSON_HEADERS: HeadersInit = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  'X-Requested-With': 'XMLHttpRequest',
};

export function buildHeaders(base: HeadersInit, overrides?: HeadersInit): Headers {
  const headers = new Headers(base);
  if (!overrides) {
    return headers;
  }

  const overrideHeaders = new Headers(overrides);
  overrideHeaders.forEach((value, key) => {
    headers.set(key, value);
  });

  return headers;
}

export function serializeJsonBody(body?: unknown): string | undefined {
  if (body === undefined || body === null) {
    return undefined;
  }

  return JSON.stringify(body);
}

export function isJsonResponse(response: Response): boolean {
  const contentType = response.headers.get('content-type') ?? '';
  return contentType.includes('application/json') || contentType.includes('+json');
}

export async function parseResponseBody<T>(response: Response): Promise<T> {
  if (response.status === 204 || response.status === 205) {
    return undefined as T;
  }

  if (!isJsonResponse(response)) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

export async function toApiError(
  response: Response,
  fallbackMessage = 'Request failed'
): Promise<ApiError> {
  const payload =
    (await parseResponseBody<ApiErrorPayload>(response).catch(() => undefined)) ?? {};

  return {
    message: payload.message ?? fallbackMessage,
    errors: payload.errors ?? {},
    status: response.status,
    code: payload.code ?? String(response.status),
  };
}
