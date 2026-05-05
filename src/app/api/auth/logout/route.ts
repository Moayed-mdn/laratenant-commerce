/**
 * POST /api/auth/logout
 * 
 * Route handler for client-side logout.
 * Revokes token on backend and clears the auth cookie.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { logout } from '@/lib/actions/auth.actions';

/**
 * POST handler for /api/auth/logout
 */
export async function POST(): Promise<NextResponse> {
  try {
    // Call server action to logout
    await logout();
    
    // Note: logout() redirects, so this won't be reached normally
    // But we include it for type safety and edge cases
    return NextResponse.json({ status: true, message: 'Logged out' });
  } catch {
    // If logout fails, still clear the cookie
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');
    
    return NextResponse.json({ status: true, message: 'Logged out' });
  }
}
