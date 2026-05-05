import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

const intlMiddleware = createMiddleware(routing);

const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? 'auth_token';
const SUPPORTED_LOCALES = ['en', 'ar'];
const DEFAULT_LOCALE = 'en';

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
  console.log('THIS',strippedPath)
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
  console.log('MIDDLEWARE PATHNAME', pathname);
  // Skip static files and API routes
  if (isStaticOrApi(pathname)) {
    return NextResponse.next();
  }
  
  const strippedPath = stripLocale(pathname);
  const locale = getLocaleFromPathname(pathname);
  const authToken = request.cookies.get(AUTH_COOKIE_NAME);
  console.log('this from middleware', 'AUTH_COOKIE_NAME',authToken)
  // If authenticated user visits /login or /register, redirect to dashboard
  if (authToken && isAuthPath(strippedPath)) {
    // Let them stay on logout page (they're logging out)
    if (strippedPath === '/logout') {
      return intlMiddleware(request);
    }
    
    // Redirect logged-in users away from login/register
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}`;
    return NextResponse.redirect(url);
  }
  
  // If NOT authenticated and trying to access protected routes
  if (!authToken && isProtectedPath(strippedPath)) {
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