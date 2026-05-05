# Dashboard Access Fix Documentation

**Date:** May 3, 2026  
**Issue:** Dashboard not accessible after login (redirect failures and errors)

---

## 1. proxy.ts Changes

### Before:
```typescript
const PUBLIC_ROUTES = ['/login', '/logout'];

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

export default function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const publicRoute = isPublicRoute(pathname);
  if (publicRoute) {
    return intlMiddleware(request);
  }
  // ... auth check
}
```

### After:
```typescript
const SESSION_COOKIE = 'ecommerce_session';
const SUPPORTED_LOCALES = ['en', 'ar'];
const DEFAULT_LOCALE = 'en';

function getLocaleFromPathname(pathname: string): string {
  const segment = pathname.split('/')[1];
  return SUPPORTED_LOCALES.includes(segment) ? segment : DEFAULT_LOCALE;
}

function isPublicPath(pathname: string): boolean {
  // Strip locale prefix for checking
  const segments = pathname.split('/');
  const withoutLocale = SUPPORTED_LOCALES.includes(segments[1])
    ? '/' + segments.slice(2).join('/')
    : pathname;

  if (
    withoutLocale === '/login' ||
    withoutLocale === '/logout' ||
    withoutLocale === '/' ||
    withoutLocale === ''
  ) {
    return true;
  }

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico'
  ) {
    return true;
  }

  return false;
}

export default function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  if (isPublicPath(pathname)) {
    return intlMiddleware(request);
  }
  const session = request.cookies.get(SESSION_COOKIE);
  if (!session) {
    const locale = getLocaleFromPathname(pathname);
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = `/${locale}/login`;
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  return intlMiddleware(request);
}
```

**Changes:**
- Renamed `isPublicRoute` to `isPublicPath` for clarity
- Added proper handling for root path `/` and empty paths
- Added `SESSION_COOKIE` constant for `ecommerce_session`
- Added `getLocaleFromPathname` helper function
- Maintained correct cookie name `ecommerce_session`

---

## 2. Deleted Directories

### Removed: `src/app/(admin)/`
- Content: `stores/` (0 items - empty directory)
- Reason: Duplicate route structure conflicting with locale-based routes

### Removed: `src/app/(auth)/`
- Content: `login/` (0 items - empty directory)
- Reason: Duplicate route structure conflicting with locale-based routes

**Impact:** These empty scaffold directories were created before locale-based routing was implemented. Their presence could cause Next.js routing conflicts.

---

## 3. src/app/page.tsx Changes

### Before:
```typescript
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center...">
      // Default Next.js landing page content
    </div>
  );
}
```

### After:
```typescript
import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect('/en/login')
}
```

**Changes:**
- Removed default Next.js landing page
- Added redirect to `/en/login` as the entry point
- Ensures users land on login page when visiting root URL

---

## 4. Admin Layout Redirect Fix

**File:** `src/app/[locale]/(admin)/layout.tsx`

### Before:
```typescript
interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // ... fetch user ...
  redirect('/login');  // Missing locale prefix!
}
```

### After:
```typescript
interface AdminLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const { locale } = await params;
  // ... fetch user ...
  redirect(`/${locale}/login`);  // Now includes locale!
}
```

**Changes:**
- Added `params` prop to receive locale from route
- Extract locale with `const { locale } = await params`
- Updated both redirect calls to use `/${locale}/login` format
- Fixes redirect loop caused by missing locale prefix

---

## 5. LoginForm onSuccess Fix

**File:** `src/app/[locale]/login/_components/LoginForm.tsx`

### Before:
```typescript
onSuccess: (storeId) => {
  // ... validation ...
  const redirectParam = searchParams.get('redirect');
  const supportedLocales = ['en', 'ar'];
  let destination: string;
  if (redirectParam) {
    const redirectSegments = redirectParam.split('/').filter(Boolean);
    const hasLocalePrefix = supportedLocales.includes(redirectSegments[0] ?? '');
    destination = hasLocalePrefix ? redirectParam : `/${locale}${redirectParam}`;
  } else {
    destination = `/${locale}/stores/${storeId}/dashboard`;
  }
  router.push(destination);
},
```

### After:
```typescript
onSuccess: (storeId) => {
  // ... validation ...
  const redirectParam = searchParams.get('redirect');
  const destination = redirectParam && redirectParam.startsWith(`/${locale}`)
    ? redirectParam
    : `/${locale}/stores/${storeId}/dashboard`;
  router.push(destination);
},
```

**Changes:**
- Simplified redirect logic
- Only accept redirectParam if it starts with current locale prefix
- Prevents redirect to paths without proper locale
- Falls back to dashboard route if redirectParam is invalid

---

## 6. serverFetch Cookie Verification

**File:** `src/lib/api/server/client.ts`

### Verified Correct:
```typescript
import { cookies } from 'next/headers';

export async function serverFetch<T>(
  path: string,
  options?: ServerFetchOptions
): Promise<T> {
  const cookieStore = await cookies();
  
  // Build cookie header from all cookies for Sanctum authentication
  const cookieHeader = cookieStore.getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join('; ');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    Cookie: cookieHeader, // Forward all cookies for Sanctum
  };
  // ...
}
```

**Status:** ✅ VERIFIED CORRECT
- Uses `await cookies()` from `next/headers`
- Builds proper `Cookie` header with all cookies
- Forwards `ecommerce_session` cookie to Laravel backend
- No changes required

---

## 7. Expected Auth Flow After Fixes

```
1. User visits http://localhost:3000
   → src/app/page.tsx → redirect('/en/login')
   → Should land at /en/login ✓

2. User logs in successfully
   → POST /api/v1/users/auth/login → 200
   → ecommerce_session cookie set by Laravel
   → onSuccess fires → router.push('/en/stores/1/dashboard')
   → Should land at /en/stores/1/dashboard ✓

3. Middleware runs on /en/stores/1/dashboard
   → isPublicPath('/en/stores/1/dashboard') → false
   → Checks ecommerce_session cookie → exists
   → Runs intlMiddleware → passes through ✓

4. Admin layout runs (RSC)
   → serverFetch('/api/v1/users/auth/me') with cookie forwarded
   → Returns user data
   → Renders dashboard ✓

5. If step 4 fails (401)
   → redirect('/en/login') with locale ✓
```

---

## Test Credentials

- **Email:** super@test.com
- **Password:** password
- **Backend:** http://localhost:8000
- **Frontend:** http://localhost:3000
- **Session Cookie:** `ecommerce_session`

---

## Files Modified

1. `src/proxy.ts` - Improved middleware with correct cookie handling
2. `src/app/page.tsx` - Added redirect to login
3. `src/app/[locale]/page.tsx` - **NEW** Added locale root redirect to login
4. `src/app/[locale]/(admin)/layout.tsx` - Added locale to redirects
5. `src/app/[locale]/login/_components/LoginForm.tsx` - Simplified redirect logic

## Files Deleted

1. `src/app/(admin)/` - Empty duplicate route directory
2. `src/app/(auth)/` - Empty duplicate route directory

## Files Verified (No Changes)

1. `src/lib/api/server/client.ts` - Cookie forwarding already correct

---

## 8. Test Results

**Test Date:** May 3, 2026  
**Test Environment:** Local dev server (http://localhost:3000)

### Automated Test Results

| Test | Request | Expected | Result |
|------|---------|----------|--------|
| **1** | `GET /` | Redirect to `/en/login` | ✓ **PASS** - Final: `http://localhost:3000/en/login` |
| **2** | `GET /en/login` | HTTP 200 | ✓ **PASS** - Status: 200 |
| **3** | `GET /en/stores/1/dashboard` (no cookie) | Redirect to login with redirect param | ✓ **PASS** - `307 → /en/login?redirect=%2Fen%2Fstores%2F1%2Fdashboard` |

### Manual Test Steps (Pending)

1. Visit http://localhost:3000 → ✓ Redirects to /en/login
2. Login with super@test.com / password → Pending actual login test
3. Should redirect to /en/stores/{storeId}/dashboard → Pending

**Note:** Full login flow test requires:
- Backend running at http://localhost:8000
- Valid credentials (super@test.com / password)
- Browser with cookie support for Sanctum session
