/**
 * Next.js middleware for auth protection.
 * Runs on the Edge runtime.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/logout'];

/**
 * Check if a pathname is a public route.
 */
function isPublicRoute(pathname: string): boolean {
  // Exact match for public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    return true;
  }

  // Starts with special paths
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico'
  ) {
    return true;
  }

  return false;
}

/**
 * Middleware to protect routes and handle auth redirects.
 */
export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Allow public routes without checking auth
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Check for Laravel Sanctum session cookie
  const hasSessionCookie = request.cookies.has('laravel_session');

  // If no session cookie, redirect to login with original URL as redirect param
  if (!hasSessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // User is authenticated, allow access
  return NextResponse.next();
}

/**
 * Configure which routes the middleware runs on.
 */
export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};
