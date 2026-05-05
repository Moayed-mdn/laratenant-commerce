/**
 * API Client with Bearer Token Authentication
 * 
 * SERVER-SIDE (RSC/Server Actions): Use getAuthHeaders() from 'next/headers' cookies
 * CLIENT-SIDE: Uses Next.js API routes which forward cookies to backend
 */

import { cookies } from 'next/headers';
import { APP_CONFIG } from '@/config/app';

// Environment configuration
const API_URL = process.env.API_URL ?? APP_CONFIG.apiBaseUrl;
const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? 'auth_token';

/**
 * Get auth headers with Bearer token for server-side use.
 * Reads token from HttpOnly cookie.
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Get auth token from cookie (server-side only).
 */
export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null;
}

// API Error classes
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ValidationError extends ApiError {
  constructor(message = 'Validation failed', errors?: Record<string, string[]>) {
    super(message, 422, 'VALIDATION_ERROR', errors);
    this.name = 'ValidationError';
  }
}

interface RequestConfig {
  headers?: Record<string, string>;
  cache?: RequestCache;
  next?: { revalidate?: number; tags?: string[] };
}

interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

/**
 * Server-side API client with Bearer token auth.
 * Use this in Server Components and Server Actions.
 */
export const serverApiClient = {
  /**
   * Make a GET request with Bearer auth.
   */
  async get<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        ...headers,
        ...config.headers,
      },
      cache: config.cache ?? 'no-store',
      next: config.next,
    });

    return handleResponse<T>(response);
  },

  /**
   * Make a POST request with Bearer auth.
   */
  async post<T>(endpoint: string, body: unknown, config: RequestConfig = {}): Promise<T> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...headers,
        ...config.headers,
      },
      body: JSON.stringify(body),
    });

    return handleResponse<T>(response);
  },

  /**
   * Make a PUT request with Bearer auth.
   */
  async put<T>(endpoint: string, body: unknown, config: RequestConfig = {}): Promise<T> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        ...headers,
        ...config.headers,
      },
      body: JSON.stringify(body),
    });

    return handleResponse<T>(response);
  },

  /**
   * Make a PATCH request with Bearer auth.
   */
  async patch<T>(endpoint: string, body: unknown, config: RequestConfig = {}): Promise<T> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PATCH',
      headers: {
        ...headers,
        ...config.headers,
      },
      body: JSON.stringify(body),
    });

    return handleResponse<T>(response);
  },

  /**
   * Make a DELETE request with Bearer auth.
   */
  async delete<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        ...headers,
        ...config.headers,
      },
    });

    return handleResponse<T>(response);
  },
};

/**
 * Handle API response and throw appropriate errors.
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    throw new UnauthorizedError('Authentication required');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    if (response.status === 422) {
      throw new ValidationError(
        errorData.message ?? 'Validation failed',
        errorData.errors
      );
    }

    throw new ApiError(
      errorData.message ?? `Request failed with status ${response.status}`,
      response.status,
      errorData.error_code,
      errorData.errors
    );
  }

  const data = await response.json() as ApiResponse<T>;
  return data.data;
}

/**
 * Client-side API client.
 * Calls Next.js API routes which forward to backend with Bearer token.
 */
export const clientApiClient = {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`/api/proxy?endpoint=${encodeURIComponent(endpoint)}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    return handleClientResponse<T>(response);
  },

  async post<T>(endpoint: string, body: unknown): Promise<T> {
    const response = await fetch('/api/proxy', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint, method: 'POST', body }),
    });
    return handleClientResponse<T>(response);
  },

  async put<T>(endpoint: string, body: unknown): Promise<T> {
    const response = await fetch('/api/proxy', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint, method: 'PUT', body }),
    });
    return handleClientResponse<T>(response);
  },

  async patch<T>(endpoint: string, body: unknown): Promise<T> {
    const response = await fetch('/api/proxy', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint, method: 'PATCH', body }),
    });
    return handleClientResponse<T>(response);
  },

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch('/api/proxy', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint, method: 'DELETE' }),
    });
    return handleClientResponse<T>(response);
  },
};

async function handleClientResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    
    if (response.status === 401) {
      window.dispatchEvent(new Event('auth:unauthorized'));
      throw new UnauthorizedError(error.message);
    }
    
    throw new ApiError(error.message, response.status, error.code, error.errors);
  }

  return response.json();
}

// Default export - serverApiClient for RSC, but client components should use clientApiClient
export default serverApiClient;
