import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { resolveTenant } from '@/lib/tenant/resolver';

const intlMiddleware = createMiddleware(routing);

const SESSION_COOKIE_CANDIDATES = [
  process.env.SANCTUM_SESSION_COOKIE,
  'laravel_session',
  'ecommerce_session',
].filter(Boolean) as string[];

/**
 * SaaS Middleware Foundation.
 * 
 * Responsibilities:
 * 1. Locale handling (via next-intl)
 * 2. Application type resolution (Marketing vs Dashboard vs Storefront)
 * 3. Tenant resolution (Subdomain/Custom Domain)
 * 4. Authentication enforcement
 */
export default function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // 1. Skip static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // 2. Resolve Tenant Context (Architectural abstraction)
  const tenantContext = resolveTenant(hostname);
  const { appType, tenantSlug } = tenantContext;

  // 3. Handle Locale via next-intl
  const response = intlMiddleware(request);

  // 4. Inject Tenant Context into headers for Server Components & API
  // This allows the app to know which "layer" it's rendering
  response.headers.set('x-app-type', appType);
  if (tenantSlug) {
    response.headers.set('x-tenant-slug', tenantSlug);
  }

  // 5. Authentication & Authorization logic
  const hasSessionCookie = SESSION_COOKIE_CANDIDATES.some((cookieName) =>
    request.cookies.has(cookieName)
  );

  const locales = routing.locales;
  const segment = pathname.split('/')[1];
  const locale = locales.includes(segment as typeof locales[number]) ? segment : routing.defaultLocale;
  const strippedPath = locales.includes(segment as typeof locales[number]) 
    ? '/' + pathname.split('/').slice(2).join('/') 
    : pathname;

  // Dashboard Layer Protection
  // Note: For now we assume anything under /stores is dashboard.
  const isDashboardRoute = strippedPath.startsWith('/stores');
  const AUTH_ROUTES = ['/login', '/register', '/signup', '/onboarding', '/create-store'];
  const isAuthRoute = AUTH_ROUTES.includes(strippedPath);

  if (isDashboardRoute && !hasSessionCookie) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = `/${locale}/login`;
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from login
  // But allow them to access onboarding/create-store if they are logged in but don't have a store yet
  if (isAuthRoute && hasSessionCookie) {
    const isOnboarding = strippedPath === '/onboarding' || strippedPath === '/create-store';
    if (!isOnboarding) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}`;
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
