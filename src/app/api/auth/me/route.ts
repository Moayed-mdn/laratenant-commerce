/**
 * GET /api/auth/me
 * 
 * Route handler that returns the current authenticated user.
 * Reads auth_token from HttpOnly cookie and forwards to Laravel backend.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import type { User } from '@/types/auth';

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? 'auth_token';

interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

/**
 * GET handler for /api/auth/me
 * Returns current user or 401 if not authenticated.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  // No token = not authenticated
  if (!token) {
    return NextResponse.json(
      { status: false, message: 'Unauthenticated' },
      { status: 401 }
    );
  }

  try {
    // Forward request to Laravel backend with Bearer token
    const response = await fetch(`${API_URL}/api/v1/users/auth/me`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    // Handle 401 from backend - token is invalid
    if (response.status === 401) {
      // Clear the invalid cookie
      cookieStore.delete(AUTH_COOKIE_NAME);
      
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
