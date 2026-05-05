# Bearer Token Authentication Implementation

**Date:** May 4, 2026

This document describes the Bearer Token authentication system implemented for Next.js with Laravel Sanctum backend.

## Overview

The system uses **Sanctum Bearer tokens** stored in **HttpOnly cookies** for secure authentication. This approach:
- Prevents XSS attacks (HttpOnly cookies are inaccessible to JavaScript)
- Works with both React Server Components (RSC) and Client Components
- Uses `Authorization: Bearer <token>` headers for all protected API calls

---

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Client Comp    │────▶│  /api/auth/me    │────▶│  Laravel API    │
│  (Browser)      │     │  (Route Handler)   │     │  (Sanctum)      │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │
         │                       │ reads auth_token from HttpOnly cookie
         │                       │ forwards with Authorization: Bearer
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌──────────────────┐
│  AuthContext    │     │  Server Action   │
│  (React Context)│     │  (lib/actions)   │
└─────────────────┘     └──────────────────┘
```

---

## Files Created/Modified

### 1. Server Actions - `src/lib/actions/auth.actions.ts`

Server-side authentication functions that can read HttpOnly cookies:

- **`login(formData)`** - Authenticates user, receives token from Laravel, sets HttpOnly cookie
- **`logout()`** - Revokes token on backend, clears auth cookie, redirects to /login
- **`getMe()`** - Returns current user using Bearer token from cookie
- **`getAuthToken()`** - Helper to read token from cookies
- **`getAuthHeaders()`** - Returns headers with Authorization: Bearer token

**Key features:**
- Uses `'use server'` directive
- Reads `auth_token` from `cookies()` (Next.js headers)
- Sets cookie with `httpOnly: true, secure, sameSite: 'lax'`

### 2. API Client - `src/lib/api/client.ts`

Universal API client with Bearer token support:

- **`serverApiClient`** - For Server Components with automatic Bearer auth
  - `get()`, `post()`, `put()`, `patch()`, `delete()` methods
  - Automatically attaches Authorization header
  - Throws `UnauthorizedError` on 401, `ValidationError` on 422

- **`getAuthHeaders()`** - Server-side helper for manual fetch calls

- **`ApiError`, `UnauthorizedError`, `ValidationError`** - Typed error classes

### 3. Auth Context - `src/contexts/AuthContext.tsx`

React Context for client-side auth state:

- **`AuthProvider`** - Wraps app, hydrates user on mount via `/api/auth/me`
- **`useAuth()`** - Hook returning `{ user, isLoading, isAuthenticated, refreshUser, setUser, logout }`
- **`useHasRole(role)`** - Check user role
- **`useStoreId()`** - Get user's store ID

### 4. Route Handlers

#### `src/app/api/auth/me/route.ts`
GET handler that:
- Reads `auth_token` from HttpOnly cookie
- Forwards to Laravel `/api/v1/users/auth/me` with `Authorization: Bearer` header
- Returns user JSON or 401
- Clears invalid tokens

#### `src/app/api/auth/logout/route.ts`
POST handler for client-side logout.

### 5. Middleware - `src/middleware.ts`

Updated to check for Bearer token auth:

- Reads `auth_token` cookie
- Redirects to `/login` if missing on protected routes
- Redirects authenticated users away from `/login`, `/register`
- Protected routes: `/dashboard/*`, `/stores/*`, `/admin/*` (everything except public routes)
- Public routes: `/`, `/login`, `/register`, `/products/*`, `/logout`

### 6. Login Page - `src/app/[locale]/login/page.tsx` & `LoginForm.tsx`

Updated to use server actions:

- Wraps with `AuthProvider`
- `LoginForm` calls `login()` server action with FormData
- On success: updates auth context, redirects to dashboard
- On error: displays field errors and toast

### 7. Admin Layout - `src/app/[locale]/(admin)/layout.tsx`

Updated for Bearer auth:

- Uses `getMe()` server action to authenticate
- Wraps with `AuthProvider` for client state
- Uses `AuthInitializer` to sync with Zustand store

### 8. Types - `src/types/auth.ts`

Added interfaces:

```typescript
export interface User {
  id: number
  name: string
  email: string
  phone: string | null
  avatar: string | null
  email_verified_at: string | null
  has_password: boolean
  has_google_linked: boolean
  role: string | null
  store_id: number | null
  created_at: string
  updated_at: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}
```

### 9. Server Fetch - `src/lib/api/server/client.ts`

Updated to use Bearer token:

- `getAuthToken()` - Reads token from cookie
- `getAuthHeaders()` - Returns headers with Authorization: Bearer
- `serverFetch()` - Uses Bearer auth instead of cookie forwarding

---

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
API_URL=http://localhost:8000                 # server-side
AUTH_COOKIE_NAME=auth_token
AUTH_COOKIE_MAX_AGE=604800                     # 7 days in seconds
```

---

## Usage Examples

### Server Component (RSC)

```typescript
import { serverApiClient } from '@/lib/api/client';
import { getMe } from '@/lib/actions/auth.actions';

// Option 1: Use server action
const user = await getMe();

// Option 2: Use serverApiClient
const orders = await serverApiClient.get(`/api/v1/admin/stores/${storeId}/orders`);
```

### Client Component

```typescript
'use client';
import { useAuth } from '@/contexts/AuthContext';

export function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <Loading />;
  if (!isAuthenticated) return <Redirect to="/login" />;
  
  return <div>Welcome {user.name}</div>;
}
```

### Manual Fetch with Bearer Token

```typescript
import { getAuthHeaders } from '@/lib/api/client';

const headers = await getAuthHeaders();
const response = await fetch(`${API_URL}/api/v1/some-endpoint`, {
  headers,
});
```

---

## Security Features

1. **HttpOnly Cookies** - Token is never accessible to JavaScript
2. **Secure Flag** - Cookie only sent over HTTPS in production
3. **SameSite=Lax** - CSRF protection
4. **Token Expiration** - 7 day max age, cleared on logout
5. **Automatic Cleanup** - Invalid tokens are cleared on 401 responses

---

## Migration from Session/Cookie Auth

### Old (Stateful Session)
- CSRF token required
- `withCredentials: true` for all requests
- Cookie forwarding in RSC

### New (Bearer Token)
- No CSRF token needed
- `Authorization: Bearer <token>` header
- Token read from HttpOnly cookie server-side
- Works seamlessly with RSC and Client Components

---

## Definition of Done (All Completed)

- ✅ Login stores token in HttpOnly cookie via server action
- ✅ All API calls attach `Authorization: Bearer` header
- ✅ `/me` works in RSC via cookie → Bearer
- ✅ `/me` works in client component via `/api/auth/me` route handler
- ✅ Logout revokes token on backend + clears cookie
- ✅ Middleware protects dashboard routes
- ✅ No token ever touches localStorage
- ✅ Works with both RSC and client components
