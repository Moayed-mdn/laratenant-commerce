/**
 * Next.js middleware for auth protection and i18n routing.
 * Runs on the Edge runtime.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

// Create next-intl middleware
const intlMiddleware = createMiddleware(routing);

// Public routes that don't require authentication
// Note: These include locale-prefixed versions handled by next-intl
const PUBLIC_ROUTES = ['/login', '/logout'];

/**
 * Check if a pathname is a public route.
 * Handles both prefixed (/en/login) and non-prefixed (/login) paths.
 */
function isPublicRoute(pathname: string): boolean {
  // Strip locale prefix if present for checking
  const pathWithoutLocale = pathname.replace(/^\/(en|ar)/, '');

  // Exact match for public routes
  if (PUBLIC_ROUTES.includes(pathWithoutLocale)) {
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
 * Middleware to handle i18n routing and auth protection.
 */
export default function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Check if this is a public route
  const publicRoute = isPublicRoute(pathname);

  // For public routes, just run i18n middleware
  if (publicRoute) {
    return intlMiddleware(request);
  }

  // Check for Laravel Sanctum session cookie
  const hasSessionCookie = request.cookies.has('laravel_session');

  // If no session cookie, redirect to login with original URL as redirect param
  if (!hasSessionCookie) {
    // Redirect to /login without locale prefix - next-intl will handle locale
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // User is authenticated, run i18n middleware
  return intlMiddleware(request);
}

/**
 * Configure which routes the middleware runs on.
 */
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
