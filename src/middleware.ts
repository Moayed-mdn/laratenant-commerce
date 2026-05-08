import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

const intlMiddleware = createMiddleware(routing);

const SUPPORTED_LOCALES = ['en', 'ar'];
const DEFAULT_LOCALE = 'en';
const SESSION_COOKIE_CANDIDATES = [
  process.env.SANCTUM_SESSION_COOKIE,
  'laravel_session',
  'ecommerce_session',
].filter(Boolean) as string[];

function getLocaleFromPathname(pathname: string): string {
  const segment = pathname.split('/')[1];
  return SUPPORTED_LOCALES.includes(segment) ? segment : DEFAULT_LOCALE;
}

/**
 * Strip locale prefix and return the path after it.
 * e.g. /en/stores/1/dashboard → /stores/1/dashboard
 *      /login → /login
 */
function stripLocale(pathname: string): string {
  const segments = pathname.split('/');
  if (SUPPORTED_LOCALES.includes(segments[1])) {
    return '/' + segments.slice(2).join('/');
  }
  return pathname;
}

function isAuthPath(strippedPath: string): boolean {
  return strippedPath === '/login' || strippedPath === '/logout' || strippedPath === '/register';
}

/**
 * Check if path requires authentication.
 * Protected: /dashboard/*, /profile/*, /checkout/*, /stores/*, /admin/*
 * Public: /, /login, /register, /products/*, /logout
 */
function isProtectedPath(strippedPath: string): boolean {
  // Public paths that don't need auth
  if (strippedPath === '/') return false;
  if (strippedPath === '/login') return false;
  if (strippedPath === '/logout') return false;
  if (strippedPath === '/register') return false;
  if (strippedPath.startsWith('/products')) return false;
  
  // Everything else is protected
  return true;
}

function isStaticOrApi(pathname: string): boolean {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico'
  );
}

export default function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  // Skip static files and API routes
  if (isStaticOrApi(pathname)) {
    return NextResponse.next();
  }
  
  const strippedPath = stripLocale(pathname);
  const locale = getLocaleFromPathname(pathname);
  const hasSessionCookie = SESSION_COOKIE_CANDIDATES.some((cookieName) =>
    request.cookies.has(cookieName)
  );
  // If authenticated user visits /login or /register, redirect to dashboard
  // EXCEPTION: Allow login access if there's a `redirect` param (unauthorized flow)
  if (hasSessionCookie && isAuthPath(strippedPath)) {
    // Let them stay on logout page (they're logging out)
    if (strippedPath === '/logout') {
      return intlMiddleware(request);
    }
    
    // Check if this is an unauthorized redirect flow (has redirect param)
    const searchParams = request.nextUrl.searchParams;
    const hasRedirectParam = searchParams.has('redirect');
    
    // If there's a redirect param, allow access to login page
    // This handles the case where session expired and user is being redirected back to login
    if (hasRedirectParam && strippedPath === '/login') {
      return intlMiddleware(request);
    }
    
    // Redirect logged-in users away from login/register (normal case)
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}`;
    return NextResponse.redirect(url);
  }
  
  // If NOT authenticated and trying to access protected routes
  if (!hasSessionCookie && isProtectedPath(strippedPath)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = `/${locale}/login`;
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  

  // All other cases — let intl middleware handle locale routing
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};


// import createMiddleware from 'next-intl/middleware';
// import {routing} from './i18n/routing';
 
// export default createMiddleware(routing);
 
// export const config = {
//   // Match all pathnames except for
//   // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
//   // - … the ones containing a dot (e.g. `favicon.ico`)
//   matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
// };