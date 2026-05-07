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
import { APP_CONFIG } from '@/config/app';

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
  const cookieHeader = cookieStore.toString();
  if (!cookieHeader) {
    return NextResponse.json(
      { status: false, message: 'Unauthenticated' },
      { status: 401 }
    );
  }

  try {
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

    if (response.status === 401) {
      return NextResponse.json(
        { status: false, message: 'Unauthenticated' },
        { status: 401 }
      );
    }

    // Handle other errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
      return NextResponse.json(
        { status: false, message: errorData.message ?? 'Request failed' },
        { status: response.status }
      );
    }

    // Return user data
    const data = await response.json() as ApiResponse<User>;
    
    return NextResponse.json({
      status: true,
      user: data.data,
    });
  } catch (error) {
    return NextResponse.json(
      { 
        status: false, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
