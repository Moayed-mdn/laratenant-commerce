# CSRF Token Mismatch Fix

## Problem
Frontend received `CSRF token mismatch` (HTTP 419) when trying to login with Laravel Sanctum cookie-based authentication.

## Root Cause
Axios's automatic XSRF token handling (`xsrfCookieName`/`xsrfHeaderName`) doesn't work properly when the backend (localhost:8000) and frontend (localhost:3000) are on different ports/origins. The browser doesn't send the `XSRF-TOKEN` cookie to cross-origin requests, so axios can't read it to set the `X-XSRF-TOKEN` header.

## Solution
Manually extract the `XSRF-TOKEN` cookie and add it as `X-XSRF-TOKEN` header to the login request.

### Changes Made

#### 1. `src/lib/api/auth.ts`

Added `getCookie` helper function to extract cookie value:

```typescript
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}
```

Updated `login()` function to:
1. Fetch CSRF cookie from backend first (`/sanctum/csrf-cookie`)
2. Extract XSRF token from browser cookies
3. Send login request with `X-XSRF-TOKEN` header

```typescript
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  // Step 1: Get CSRF cookie first (required for Laravel Sanctum)
  await axios.get(`${APP_CONFIG.apiBaseUrl}/sanctum/csrf-cookie`, {
    withCredentials: true,
    timeout: APP_CONFIG.requestTimeout,
  });

  // Step 2: Extract XSRF token from cookie (axios auto-XSRF fails cross-domain)
  const xsrfToken = getCookie('XSRF-TOKEN');

  // Step 3: Login with credentials + X-XSRF-TOKEN header
  const response = await apiClient.post<ApiResponse<LoginResponse>>(
    API_ROUTES.auth.login(),
    credentials,
    {
      headers: xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : undefined,
    }
  );

  // API returns { status, message, data: user } - extract user from data
  return response.data.data ?? response.data;
}
```

#### 2. `src/lib/api/client/axios.ts`

Kept the axios configuration with XSRF settings (for same-origin requests):

```typescript
export const apiClient = axios.create({
  baseURL: APP_CONFIG.apiBaseUrl,
  timeout: APP_CONFIG.requestTimeout,
  withCredentials: true, // Sanctum cookies — hard rule
  xsrfCookieName: 'XSRF-TOKEN', // Laravel Sanctum CSRF cookie name
  xsrfHeaderName: 'X-XSRF-TOKEN', // Header sent to backend
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});
```

#### 3. `src/lib/api/auth.ts` - Type Fix

Updated `LoginResponse` interface to match actual API response (user object directly, not wrapped):

```typescript
export interface LoginResponse extends AdminUser {
  message?: string;
}
```

#### 4. `src/hooks/auth/useLogin.ts`

Updated `onSuccess` handler to use `data` directly instead of `data.user`:

```typescript
onSuccess: (data) => {
  // Update auth store with user info (data is now the user object directly)
  setUser(data);

  // Determine redirect based on user's store assignment
  if (data.store_id !== null) {
    options?.onSuccess?.(String(data.store_id));
  } else {
    options?.onSuccess?.('');
  }

  logger.info('Login successful', { userId: data.id });
},
```

## Backend Requirements

Ensure your Laravel backend has these settings:

### `config/cors.php`
```php
'paths' => ['api/*', 'sanctum/csrf-cookie', '*'],
'allowed_origins' => ['http://localhost:3000'], // your frontend URL
'allowed_origins_patterns' => [],
'allowed_headers' => ['*'],
'exposed_headers' => [],
'max_age' => 0,
'supports_credentials' => true, // MUST be true
```

### `.env`
```env
SESSION_DOMAIN=localhost
SANCTUM_STATEFUL_DOMAINS=localhost:3000
SESSION_SECURE_COOKIE=false  # true only if using HTTPS
```

## How It Works

1. **CSRF Cookie Request**: Frontend calls `/sanctum/csrf-cookie` with `withCredentials: true`
   - Backend sets `XSRF-TOKEN` and `ecommerce_session` cookies
   - Browser stores these cookies for `localhost:8000`

2. **Login Request**: Frontend extracts `XSRF-TOKEN` from `document.cookie`
   - Adds `X-XSRF-TOKEN` header with the token value
   - Backend validates CSRF token matches session

3. **Session Cookie**: After successful login, `ecommerce_session` cookie is set
   - Subsequent requests automatically include this cookie
   - Backend recognizes the authenticated user

## Key Points

- `withCredentials: true` is required on ALL requests to send/receive cookies
- The `X-XSRF-TOKEN` header must be manually set because of cross-origin cookie restrictions
- Axios's `xsrfCookieName`/`xsrfHeaderName` settings only work for same-origin requests
