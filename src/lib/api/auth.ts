/**
 * Auth API functions for client-side use.
 * These are plain async functions — not hooks.
 */

import apiClient from '@/lib/api/client/axios';
import type { ApiResponse } from '@/types/api';
import type { AdminUser } from '@/types/user';
import { API_ROUTES } from '@/config/routes';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AdminUser;
}

/**
 * Login user with credentials.
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await apiClient.post<ApiResponse<LoginResponse>>(
    API_ROUTES.auth.login(),
    credentials
  );

  // API returns { status, message, data: { token, user } }
  return response.data.data;
}

/**
 * Logout current user.
 */
export async function logout(): Promise<void> {
  await apiClient.post(API_ROUTES.auth.logout());
}

/**
 * Get current authenticated user.
 */
export async function getMe(): Promise<AdminUser> {
  const response = await apiClient.get<ApiResponse<AdminUser>>(API_ROUTES.auth.me());
  return response.data.data;
}