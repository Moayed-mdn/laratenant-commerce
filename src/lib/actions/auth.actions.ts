'use server';

/**
 * Auth Server Actions
 * Handles authentication via HttpOnly cookies with Bearer token.
 * These run on the server and can access cookies securely.
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { User, LoginResponse } from '@/types/auth';

// Environment configuration
const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? 'auth_token';
const AUTH_COOKIE_MAX_AGE = parseInt(process.env.AUTH_COOKIE_MAX_AGE ?? '604800', 10); // 7 days

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

/**
 * Get the Bearer token from the auth cookie.
 * Server-side only.
 */
export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null;
  return token;
}

/**
 * Build Authorization headers with Bearer token.
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getAuthToken();
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
 * Check if response is an error.
 */
function isApiError<T>(response: ApiResponse<T>): response is ApiErrorResponse {
  return response.status === false;
}

/**
 * Login user with credentials.
 * Stores token in HttpOnly cookie on success.
 */
export async function login(formData: FormData): Promise<{ success: true; user: User } | { success: false; error: string; errors?: Record<string, string[]> }> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, error: 'Email and password are required' };
  }

  try {
    const response = await fetch(`${API_URL}/api/v1/users/auth/login`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
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

    // Extract token and user from response
    const { token, user } = data.data;
    console.log('this this this ', { token, user });
    // Set accessible cookie with the token (httpOnly: false for client-side axios access)
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, token, {
      httpOnly: false, // Changed to allow axios client to read the token
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: AUTH_COOKIE_MAX_AGE,
    });

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
 * Revokes token on backend and clears the cookie.
 */
export async function logout(): Promise<void> {
  const token = await getAuthToken();

  if (token) {
    try {
      // Revoke token on backend
      await fetch(`${API_URL}/api/v1/users/auth/logout`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch {
      // Ignore errors - we'll clear the cookie anyway
    }
  }

  // Clear the auth cookie
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);

  // Redirect to login page
  redirect('/login');
}

/**
 * Get current authenticated user.
 * Uses Bearer token from cookie.
 */
export async function getMe(): Promise<User | null> {
  const token = await getAuthToken();

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/api/v1/users/auth/me`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token is invalid - clear it
        const cookieStore = await cookies();
        cookieStore.delete(AUTH_COOKIE_NAME);
      }
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