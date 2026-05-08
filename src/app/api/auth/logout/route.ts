/**
 * POST /api/auth/logout
 * 
 * Route handler for client-side logout.
 * Revokes token on backend and clears the auth cookie.
 */

import { NextResponse } from 'next/server';
import { API_ROUTES } from '@/config/routes';
import { serverFetch } from '@/lib/api/server';
import type { ApiError } from '@/types/api';

/**
 * POST handler for /api/auth/logout
 */
export async function POST(): Promise<NextResponse> {
  try {
    await serverFetch<void>(API_ROUTES.auth.logout(), {
      method: 'POST',
    });

    return NextResponse.json({ status: true, message: 'Logged out' });
  } catch (error) {
    const apiError = error as ApiError;
    return NextResponse.json(
      { status: false, message: apiError.message ?? 'Logout failed' },
      { status: apiError.status || 500 }
    );
  }
}
