/**
 * Auth API functions for client-side use.
 * These are plain async functions — not hooks.
 */

import { clientApi } from '@/lib/api/client';
import type { ApiResponse } from '@/types/api';
import type { AdminUser } from '@/types/user';
import { API_ROUTES } from '@/config/routes';

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