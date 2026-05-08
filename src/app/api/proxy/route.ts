import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { APP_CONFIG } from '@/config/app';
import { logger } from '@/lib/logger';

function resolveRequestLocale(cookieStore: Awaited<ReturnType<typeof cookies>>, request: Request): string {
  const localeFromCookie = cookieStore.get(APP_CONFIG.sessionCookieName)?.value;
  if (localeFromCookie && APP_CONFIG.supportedLocales.includes(localeFromCookie as (typeof APP_CONFIG.supportedLocales)[number])) {
    return localeFromCookie;
  }

  const acceptLanguage = request.headers.get('accept-language');
  if (!acceptLanguage) {
    return APP_CONFIG.defaultLocale;
  }

  const preferredLocale = acceptLanguage
    .split(',')
    .map((part) => part.trim().split(';')[0]?.toLowerCase().split('-')[0])
    .find((locale): locale is string =>
      Boolean(locale) && APP_CONFIG.supportedLocales.includes(locale as (typeof APP_CONFIG.supportedLocales)[number])
    );

  return preferredLocale ?? APP_CONFIG.defaultLocale;
}

function getEndpoint(request: Request): string | null {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  if (!endpoint || !endpoint.startsWith('/')) {
    return null;
  }
  return endpoint;
}

async function handleProxy(request: Request): Promise<NextResponse> {
  const endpoint = getEndpoint(request);
  if (!endpoint) {
    return NextResponse.json(
      { status: false, message: 'Missing or invalid endpoint query parameter' },
      { status: 400 }
    );
  }

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const xsrfToken = cookieStore.get('XSRF-TOKEN')?.value;
  const requestLocale = resolveRequestLocale(cookieStore, request);
  logger.debug('Proxy request locale resolved', { requestLocale });
  const method = request.method.toUpperCase();
  const rawBody = method === 'GET' || method === 'DELETE' ? undefined : await request.text();
  const upstream = await fetch(`${APP_CONFIG.apiBaseUrl}${endpoint}`, {
    method,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'locale': requestLocale,
      Cookie: cookieHeader,
      ...(xsrfToken && method !== 'GET' ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrfToken) } : {}),
    },
    body: rawBody && rawBody.length > 0 ? rawBody : undefined,
    cache: 'no-store',
  });

  const status = upstream.status;
  const contentType = upstream.headers.get('content-type');
  const bodyText = await upstream.text();
  const hasBody = ![204, 205, 304].includes(status) && bodyText.length > 0;

  const responseHeaders = new Headers();
  if (contentType && hasBody) {
    responseHeaders.set('Content-Type', contentType);
  }

  const response = new NextResponse(hasBody ? bodyText : null, {
    status,
    headers: responseHeaders,
  });

  const setCookies = (upstream.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie?.() ?? [];
  setCookies.forEach((value) => response.headers.append('set-cookie', value));

  return response;
}

export async function GET(request: Request): Promise<NextResponse> {
  return handleProxy(request);
}

export async function POST(request: Request): Promise<NextResponse> {
  return handleProxy(request);
}

export async function PUT(request: Request): Promise<NextResponse> {
  return handleProxy(request);
}

export async function PATCH(request: Request): Promise<NextResponse> {
  return handleProxy(request);
}

export async function DELETE(request: Request): Promise<NextResponse> {
  return handleProxy(request);
}
