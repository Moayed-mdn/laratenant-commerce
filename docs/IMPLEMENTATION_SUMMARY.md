# Implementation Summary

**Date:** May 4, 2026

## Overview

This document summarizes all changes made to implement Bearer Token Authentication and fix related UI errors.

---

## Part 1: Bearer Token Authentication Implementation

### New Files Created

| File | Description |
|------|-------------|
| `src/lib/actions/auth.actions.ts` | Server actions: `login()`, `logout()`, `getMe()`, `getAuthHeaders()`, `getAuthToken()` |
| `src/lib/api/client.ts` | API client with Bearer auth: `serverApiClient`, error classes (`ApiError`, `UnauthorizedError`, `ValidationError`) |
| `src/contexts/AuthContext.tsx` | React Context: `AuthProvider`, `useAuth()`, `useStoreId()` |
| `src/app/api/auth/me/route.ts` | GET handler for client-side auth check |
| `src/app/api/auth/logout/route.ts` | POST handler for client-side logout |
| `docs/Bearer-Token-Auth-Implementation.md` | Full authentication documentation |

### Files Modified for Auth

| File | Changes |
|------|---------|
| `src/middleware.ts` | Changed `SESSION_COOKIE` → `AUTH_COOKIE_NAME`, updated auth checks |
| `src/app/[locale]/login/page.tsx` | Wrapped with `AuthProvider` |
| `src/app/[locale]/login/_components/LoginForm.tsx` | Uses `login()` server action, `useAuth()` hook |
| `src/app/[locale]/(admin)/layout.tsx` | Uses `getMe()` server action, `AuthProvider` wrapper |
| `src/lib/api/server/client.ts` | Updated `serverFetch()` to use `Authorization: Bearer` header |
| `src/types/auth.ts` | Added `User` and `AuthState` interfaces |
| `package.json` | Added `dev:webpack` script |

### Key Features
- **HttpOnly cookies** for XSS protection
- **Bearer token auth** with `Authorization: Bearer <token>` header
- **Server Actions** for secure cookie handling
- **AuthContext** for client-side state management
- **Middleware protection** for authenticated routes

---

## Part 2: UI Bug Fixes

### Issues Fixed

#### 1. Nested `<html>`/`<body>` Tags (Hydration Mismatch)
**File:** `src/app/[locale]/layout.tsx`

**Problem:** Locale layout had `<html>`/`<body>` tags but root layout already had them, causing nested HTML elements.

**Fix:**
```tsx
// Before:
return (
  <html lang={locale} dir={dir} className="...">
    <body className="...">
      ...
    </body>
  </html>
);

// After:
return (
  <div lang={locale} dir={dir} className="...">
    ...
  </div>
);
```

#### 2. Nested Buttons (Invalid HTML)
**File:** `src/app/[locale]/(admin)/_components/topbar/UserMenu.tsx`

**Problem:** `<Button>` inside `DropdownMenuTrigger` created nested `<button>` elements (invalid HTML).

**Fix:**
```tsx
// Before:
<DropdownMenuTrigger>
  <Button variant="ghost" ...>
    <Avatar>...</Avatar>
  </Button>
</DropdownMenuTrigger>

// After:
<DropdownMenuTrigger
  className="relative h-8 w-8 rounded-full flex items-center justify-center hover:bg-accent"
  aria-label={user?.name ?? 'User menu'}
>
  <Avatar className="h-8 w-8">
    <AvatarFallback>{getInitials(user?.name ?? null)}</AvatarFallback>
  </Avatar>
</DropdownMenuTrigger>
```

#### 3. getServerSnapshot Infinite Loop
**Files:** 
- `src/stores/authStore.ts`
- `src/app/[locale]/(admin)/_components/sidebar/SidebarNav.tsx`
- `src/app/[locale]/(admin)/stores/[storeId]/orders/[orderId]/_components/OrderStatusSelect.tsx`
- `src/app/[locale]/(admin)/stores/[storeId]/products/[productId]/_components/DeleteProductButton.tsx`
- `src/app/[locale]/(admin)/stores/[storeId]/users/[userId]/_components/DeleteUserButton.tsx`

**Problem:** `selectCan` selector returned a function, causing React's `useSyncExternalStore` to detect snapshot changes every render.

**Fix:**
```ts
// Before (in authStore.ts):
export const selectCan = (state: AuthStore) => (permission: PermissionKey): boolean => {
  const user = state.user;
  if (!user || !user.role) return false;
  return hasPermission(user.role, permission);
};

// After (in authStore.ts):
export function useCan(permission: PermissionKey): boolean {
  return useAuthStore((state) => {
    const user = state.user;
    if (!user || !user.role) return false;
    return hasPermission(user.role, permission);
  });
}
```

```tsx
// Before (in components):
const can = useAuthStore(selectCan);
if (!can('canManageOrders')) return null;

// After (in components):
const canManageOrders = useCan('canManageOrders');
if (!canManageOrders) return null;
```

---

## Environment Variables

Required `.env.local` or `.env` additions:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
API_URL=http://localhost:8000
AUTH_COOKIE_NAME=auth_token
AUTH_COOKIE_MAX_AGE=604800
```

---

## Testing

All changes verified with:
- `npm run type-check` - Passes
- `npm run lint` - Passes (existing warnings unrelated to changes)
- `npm run dev:webpack` - Runs successfully

---

## Architecture Summary

```
Login Flow:
1. User submits form → `login()` server action
2. Server validates with Laravel API
3. Server receives Bearer token
4. Server sets HttpOnly cookie
5. Client redirects to dashboard

Authenticated Request Flow (RSC):
1. Server Component calls `getMe()` or `serverApiClient.get()`
2. Function reads `auth_token` from cookies
3. Adds `Authorization: Bearer <token>` header
4. Forwards request to Laravel API

Authenticated Request Flow (Client):
1. Client component calls `/api/auth/me`
2. Route handler reads cookie, adds Bearer header
3. Returns user data to client
```

---

## Security Checklist

- ✅ Token stored in HttpOnly cookie (XSS protection)
- ✅ Token never touches localStorage
- ✅ Secure cookie flag in production
- ✅ SameSite=Lax for CSRF protection
- ✅ 7-day expiration on cookies
- ✅ Token revocation on logout
- ✅ Invalid tokens cleared on 401
