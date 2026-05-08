/**
 * GET /api/auth/me
 * 
 * Route handler that returns the current authenticated user.
 * Reads auth_token from HttpOnly cookie and forwards to Laravel backend.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { User } from '@/types/auth';
import { API_ROUTES } from '@/config/routes';
import { serverFetch } from '@/lib/api/server';
import type { ApiError } from '@/types/api';

interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

/**
 * GET handler for /api/auth/me
 * Returns current user or 401 if not authenticated.
 */
export async function GET(): Promise<NextResponse> {
  const cookieStore = await cookies();
  const hasCookies = cookieStore.getAll().length > 0;
  if (!hasCookies) {
    return NextResponse.json(
      { status: false, message: 'Unauthenticated' },
      { status: 401 }
    );
  }

  try {
    const data = await serverFetch<ApiResponse<User>>(API_ROUTES.auth.me(), {
      method: 'GET',
      cache: 'no-store',
    });

    return NextResponse.json({
      status: true,
      user: data.data,
    });
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.status === 401) {
      return NextResponse.json(
        { status: false, message: 'Unauthenticated' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        status: false,
        message: apiError.message ?? 'Internal server error',
      },
      { status: apiError.status || 500 }
    );
  }
}
