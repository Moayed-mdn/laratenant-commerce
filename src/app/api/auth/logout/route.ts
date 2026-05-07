/**
 * POST /api/auth/logout
 * 
 * Route handler for client-side logout.
 * Revokes token on backend and clears the auth cookie.
 */

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { API_ROUTES } from '@/config/routes';
import { APP_CONFIG } from '@/config/app';

/**
 * POST handler for /api/auth/logout
 */
export async function POST(): Promise<NextResponse> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  try {
    await fetch(`${APP_CONFIG.apiBaseUrl}${API_ROUTES.auth.logout()}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        Cookie: cookieHeader,
      },
    });

    return NextResponse.json({ status: true, message: 'Logged out' });
  } catch {
    return NextResponse.json({ status: false, message: 'Logout failed' }, { status: 500 });
  }
}
