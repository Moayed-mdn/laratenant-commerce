/**
 * Auth API functions for client-side use.
 * These are plain async functions — not hooks.
 */

import { clientApi } from '@/lib/api/client';
import type { ApiResponse } from '@/types/api';
import type { AdminUser } from '@/types/user';
import type { User } from '@/types/auth';
import { API_ROUTES } from '@/config/routes';
import {
  buildHeaders,
  DEFAULT_JSON_HEADERS,
  parseResponseBody,
  toApiError,
} from '@/lib/api/core/transport';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AdminUser;
}

/**
 * Login user with credentials.
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  await clientApi.get<void>(API_ROUTES.auth.csrfCookie());
  const response = await clientApi.post<ApiResponse<LoginResponse>>(API_ROUTES.auth.login(), credentials);
  return response.data;
}

/**
 * Logout current user.
 */
export async function logout(): Promise<void> {
  await clientApi.post(API_ROUTES.auth.logout());
}

/**
 * Get current authenticated user.
 */
export async function getMe(): Promise<AdminUser> {
  const response = await clientApi.get<ApiResponse<AdminUser>>(API_ROUTES.auth.me());
  return response.data;
}

interface SessionMeResponse {
  status: boolean;
  user?: User;
  message?: string;
}

/**
 * Get current session user through internal Next auth route.
 * Used by AuthContext to keep browser auth hydration centralized.
 */
export async function getSessionMe(): Promise<User | null> {
  const response = await fetch('/api/auth/me', {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
    headers: buildHeaders(DEFAULT_JSON_HEADERS),
  });

  if (!response.ok) {
    if (response.status === 401) {
      return null;
    }
    throw await toApiError(response, 'Failed to fetch current user');
  }

  const data = await parseResponseBody<SessionMeResponse>(response);
  return data?.user ?? null;
}

/**
 * Logout current session through internal Next auth route.
 */
export async function logoutSession(): Promise<void> {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
    headers: buildHeaders(DEFAULT_JSON_HEADERS),
  });

  if (!response.ok) {
    throw await toApiError(response, 'Logout failed');
  }
}