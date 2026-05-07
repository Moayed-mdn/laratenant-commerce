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

- `AuthProvider` context and `authStore` currently coexist.
- unauthorized client responses dispatch `auth:unauthorized`.
- listeners clear local auth state and UI falls back to login flow.

## Rules

- no bearer token persistence in localStorage/sessionStorage.
- no auth header assembly in browser components.
- protected route checks must remain locale-aware.
