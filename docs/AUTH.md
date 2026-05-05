# Frontend Authentication

This document contains the Sanctum auth, httpOnly cookies, middleware, and auth store shape.

---

# 7. Authentication

## How It Works

1. User logs in → backend returns a Bearer token.
2. Token is stored in a client-accessible cookie.
3. Every request reads the token from the cookie and sends it in the `Authorization` header.
4. `middleware.ts` protects all admin routes.
5. On 401 → redirect to login.

## Zustand Auth Store

```ts
// src/stores/authStore.ts
interface AuthStore {
  user:      AdminUser | null;
  storeId:   number | null;
  isAuth:    boolean;
  setUser:   (user: AdminUser) => void;
  setStore:  (storeId: number) => void;
  logout:    () => void;
}
```

## Middleware (`src/middleware.ts`)

Protects all routes under `/(admin)`.
Redirects to `/login` if no valid session.

## Rules

- Token is stored in a client-accessible cookie.
- Auth state in Zustand (user info only — not token).
- Every admin page is protected by middleware.