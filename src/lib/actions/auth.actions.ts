'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { User } from '@/types/auth';
import { API_ROUTES } from '@/config/routes';
import { APP_CONFIG } from '@/config/app';

interface ApiSuccessResponse<T> {
  status: true;
  message: string;
  data: T;
}

interface ApiErrorResponse {
  status: false;
  message: string;
  error_code?: string;
  errors?: Record<string, string[]>;
}

type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

function isApiError<T>(response: ApiResponse<T>): response is ApiErrorResponse {
  return response.status === false;
}

/**
 * Login user with credentials.
 */
export async function login(formData: FormData): Promise<{ success: true; user: User } | { success: false; error: string; errors?: Record<string, string[]> }> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, error: 'Email and password are required' };
  }

  try {
    await fetch(`${APP_CONFIG.apiBaseUrl}${API_ROUTES.auth.csrfCookie()}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    const response = await fetch(`${APP_CONFIG.apiBaseUrl}${API_ROUTES.auth.login()}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json() as ApiResponse<LoginResponse>;

    if (!response.ok || isApiError(data)) {
      return {
        success: false,
        error: data.message ?? 'Login failed',
        errors: 'errors' in data ? data.errors : undefined,
      };
    }

    const { user } = data.data;
    return { success: true, user };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

/**
 * Logout user.
 */
export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  await fetch(`${APP_CONFIG.apiBaseUrl}${API_ROUTES.auth.logout()}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      Cookie: cookieHeader,
    },
  }).catch(() => null);
  redirect('/login');
}

/**
 * Get current authenticated user.
 */
export async function getMe(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    const response = await fetch(`${APP_CONFIG.apiBaseUrl}${API_ROUTES.auth.me()}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        Cookie: cookieHeader,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json() as ApiResponse<User>;

    if (isApiError(data)) {
      return null;
    }

    return data.data;
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated.
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getMe();
  return user !== null;
}