import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { APP_CONFIG } from '@/config/app';

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
  const method = request.method.toUpperCase();
  const rawBody = method === 'GET' || method === 'DELETE' ? undefined : await request.text();
  console.log(`${APP_CONFIG.apiBaseUrl}${endpoint}`);
  const upstream = await fetch(`${APP_CONFIG.apiBaseUrl}${endpoint}`, {
    method,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
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
