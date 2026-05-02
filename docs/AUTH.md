# Frontend Authentication

This document contains the Sanctum auth, httpOnly cookies, middleware, and auth store shape.

---

# 7. Authentication

## How It Works

1. User logs in → backend returns Sanctum token
2. Token stored in httpOnly cookie via Next.js API route
3. Every request sends cookie automatically (`withCredentials: true`)
4. `middleware.ts` protects all admin routes
5. On 401 → redirect to login

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

- Token NEVER stored in localStorage
- Token NEVER stored in sessionStorage
- Token ALWAYS in httpOnly cookie
- Auth state in Zustand (user info only — not token)
- Every admin page is protected by middleware
