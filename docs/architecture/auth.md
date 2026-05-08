# Authentication Architecture

## Current Model

- Session/cookie authentication with Laravel Sanctum-style flow.
- middleware (`src/middleware.ts`) is the primary route protection boundary.
- auth state is hydrated in admin layout via `getMe()`.

## Request Flow

1. Login action requests CSRF cookie (`/sanctum/csrf-cookie`).
2. Login request posts credentials to Laravel auth endpoint.
3. Session cookies are set by backend and used on later requests.
4. Middleware checks session cookie presence on protected routes.

## Client State

- `AuthProvider` context is the single source of truth for client-side auth state.
- Unauthorized client responses dispatch `auth:unauthorized` event from `clientFetch`.
- `AuthContext` handles the full logout flow centrally:
  - calls `logoutSession()` to clear HttpOnly cookies server-side
  - clears local auth state
  - invalidates TanStack Query cache
  - redirects to locale-aware login with preserved target

## Runtime Boundaries for 401 Handling

### clientFetch (Browser Runtime Detector)
- detects 401 status codes
- emits `auth:unauthorized` event via `window.dispatchEvent`
- does NOT redirect, mutate state, or clear cookies

### AuthContext (Centralized Handler)
- listens for `auth:unauthorized` events
- performs complete logout flow:
  1. `logoutSession()` - clears HttpOnly cookies via server response
  2. clears local auth state
  3. `queryClient.clear()` - invalidates all cached queries
  4. redirects to `/${locale}/login?redirect=...`

### Server Layouts (SSR Protection)
- `getMe()` returns null when unauthorized
- server-side redirect to `/${locale}/login?redirect=...`
- prevents rendering authenticated shells with null user

## Rules

- no bearer token persistence in localStorage/sessionStorage.
- no auth header assembly in browser components.
- protected route checks must remain locale-aware.
- logout logic lives ONLY in AuthContext (not scattered across hooks/components).
- HttpOnly cookies are cleared ONLY by server response Set-Cookie headers.
