# Foundation Files Complete

This document describes all 22 foundation files created for the multi-store e-commerce admin dashboard.

## File Summary Table

| # | File Path | Description | Exports |
|---|-----------|-------------|---------|
| 1 | `src/types/api.ts` | Base API types | `ApiResponse<T>`, `PaginatedResponse<T>`, `PaginationMeta`, `PaginationLinks`, `ApiError`, `HttpMethod` |
| 2 | `src/types/user.ts` | User types | `AdminUser`, `UserRole` |
| 3 | `src/types/product.ts` | Product types | `AdminProduct`, `ProductImage`, `ProductStatus`, `WeightUnit` |
| 4 | `src/types/order.ts` | Order types | `AdminOrder`, `OrderCustomer`, `OrderLineItem`, `OrderStatus`, `PaymentStatus`, `FulfillmentStatus` |
| 5 | `src/types/store.ts` | Store types | `Store`, `StoreStatus` |
| 6 | `src/config/app.ts` | Application configuration | `APP_CONFIG`, `UPLOAD_CONFIG` |
| 7 | `src/config/query.ts` | TanStack Query defaults | `QUERY_CONFIG` |
| 8 | `src/config/permissions.ts` | Role-based permissions | `PERMISSIONS`, `PermissionKey`, `hasPermission()` |
| 9 | `src/config/features.ts` | Feature flags | `FEATURES` |
| 10 | `src/config/routes.ts` | Route configuration | `ROUTES`, `API_ROUTES` |
| 11 | `src/lib/api/client/error.ts` | Error normalization | `normalizeError()` |
| 12 | `src/lib/api/client/axios.ts` | Axios client instance | `apiClient` (default) |
| 13 | `src/lib/api/server/client.ts` | Server fetch wrapper | `serverFetch()`, `ServerFetchOptions` |
| 14 | `src/lib/queryClient.ts` | QueryClient setup | `queryClient` (default), `makeQueryClient()` |
| 15 | `src/lib/queryKeys.ts` | Query key factory | `queryKeys` |
| 16 | `src/lib/hooks/useDebounce.ts` | Debounce hook | `useDebounce<T>()` |
| 17 | `src/lib/utils/date.ts` | Date utilities | `formatDate()`, `formatDateTime()`, `formatRelative()`, `formatCurrency()`, `isValidDate()`, `parseApiDate()` |
| 18 | `src/lib/logger.ts` | Logger utility | `logger` (debug, info, warn, error) |
| 19 | `src/stores/authStore.ts` | Auth Zustand store | `useAuthStore`, `AuthState`, `AuthActions`, `AuthStore`, selectors |
| 20 | `src/stores/storeStore.ts` | Store context Zustand store | `useStoreStore`, `StoreState`, `StoreActions`, `StoreStore`, selectors |
| 21 | `src/stores/uiStore.ts` | UI Zustand store | `useUiStore`, `UiState`, `UiActions`, `UiStore`, selectors |
| 22 | `src/middleware.ts` | Next.js auth middleware | `middleware()`, `config` |

---

## TypeScript Decisions

### Strict Typing
- All files use strict TypeScript with no `any` types
- Generic types used where appropriate (`ApiResponse<T>`, `PaginatedResponse<T>`, `useDebounce<T>`)
- Union types for status fields (`OrderStatus`, `PaymentStatus`, `ProductStatus`, etc.)
- `as const` assertions on config objects for literal type inference

### Type Imports
- Used `import type` for type-only imports to avoid bundling type dependencies
- Example: `import type { AdminUser, UserRole } from '@/types/user'`

### Path Aliases
- All imports use `@/` alias pointing to `src/` directory
- Requires proper `tsconfig.json` path configuration (already present in project)

---

## Edge Cases Handled

### Error Normalization (`normalizeError`)
1. **AxiosError with response** - Extracts status, message, errors; maps status to error codes
2. **AxiosError without response** - Returns `NETWORK_ERROR` for connection failures
3. **Plain Error** - Uses error.message with `CLIENT_ERROR` code
4. **Unknown errors** - Fallback with generic message and `UNKNOWN_ERROR` code

### Date Utilities
- Handles both string and Date object inputs
- `isValidDate()` checks for both string parsing and Date instance validity
- `formatCurrency()` uses `Intl.NumberFormat` for locale-aware formatting

### Middleware
- Public routes explicitly allowed: `/login`, `/logout`, `/_next/*`, `/api/*`, `/favicon.ico`
- Redirect preserves original URL via `redirect` query param
- Checks for `ecommerce_session` cookie (Laravel Sanctum default)

### Query Client
- Queries retry up to 2 times with exponential backoff
- Mutations never retry (hard rule enforced)
- Each SSR request gets fresh QueryClient via `makeQueryClient()`

---

## Backend API Assumptions

### Response Structure
- Single resource responses: `{ data: T, message: string }`
- Paginated responses: `{ data: T[], meta: PaginationMeta, links: PaginationLinks }`
- Error responses: `{ message: string, errors?: Record<string, string[]>, status: number }`

### Authentication
- Laravel Sanctum with httpOnly cookies (`ecommerce_session`)
- CSRF token handled automatically by Sanctum's `X-Requested-With` header
- Session expiry signaled via 401 response

### API Endpoints
- Base URL from `NEXT_PUBLIC_API_URL` or `http://localhost:8000`
- API prefix: `/api/v1`
- Admin routes under `/api/v1/admin/stores/{storeId}/...`

### Field Naming
- Snake_case for API fields (`store_id`, `created_at`, etc.)
- Consistent timestamp format (ISO 8601 strings)

---

## Hard Rules Enforced

| Rule | Implementation |
|------|----------------|
| NO any type | All types explicitly defined |
| NO hardcoded colors | Token classes only (not applicable in these files) |
| NO hardcoded text | t() only (not applicable in these files) |
| NO hardcoded URLs | ROUTES and API_ROUTES config only |
| NO magic strings | Config constants only |
| NO localStorage for auth | httpOnly cookies via withCredentials |
| NO manual cookie reading on client | withCredentials handles it |
| NO Axios in RSC | serverFetch uses native fetch |
| NO fetch in client components | apiClient uses Axios |
| NO raw Axios errors | normalizeError() always |
| NO inline query keys | queryKeys factory always |
| NO console.log | logger utility only |
| NO request without timeout | 10s timeout in APP_CONFIG |
| NO mutation auto-retry | mutations.retry = 0 |
| NO instant retries | Exponential backoff in QUERY_CONFIG |
| NO Zustand for storeId | URL params are source of truth |
| NO derived state in Zustand | Selectors derive values |

---

## What the Next Prompt (F.3 Login Page) Will Need

The login page implementation will require:

### From These Files
1. **Types**: `AdminUser` for user data shape
2. **Config**: `APP_CONFIG.apiBaseUrl` for API calls
3. **Routes**: `ROUTES.auth.login()`, `ROUTES.auth.logout()`, redirect handling
4. **API Routes**: `API_ROUTES.auth.login()`, `API_ROUTES.auth.me()`
5. **Error Handling**: `normalizeError()` for form errors
6. **Client**: `apiClient` for POST login request
7. **Query Keys**: `queryKeys.auth.me()` for invalidation
8. **Stores**: `useAuthStore` to set user after successful login
9. **Logger**: `logger` for debug/error logging
10. **Middleware**: Will handle redirect after login success

### Additional Needs
- Login form component with email/password fields
- Form validation (likely using react-hook-form + zod)
- Translation keys for labels/errors
- Loading states during authentication
- Error display for failed logins
- Redirect logic using `redirect` query param

---

## Notes

- No UI components were created — these are pure foundation files
- All stores marked with `'use client'` for Zustand compatibility
- Server fetch does NOT have `'use server'` — it's a regular module imported by RSC
- Custom event `auth:unauthorized` dispatched on 401 for session expiry handling
- RTL support controlled by `FEATURES.enableRTL` flag

---

## Post-Review Fixes

The following corrections were made after initial review:

### 1. `src/lib/api/server/client.ts` - Cookie Header Construction

**Issue**: Used `cookieStore.toString()` which may not properly serialize cookies in Next.js 15+.

**Fix**: Changed to use `cookieStore.getAll()` with proper mapping:
```typescript
const cookieHeader = cookieStore.getAll()
  .map(({ name, value }) => `${name}=${value}`)
  .join('; ');
```

**Also confirmed**: `cookies()` is called with `await` as required by Next.js 15+.

### 2. `src/lib/api/client/axios.ts` - Event Dispatch Type

**Issue**: Used `CustomEvent` which requires additional typing and may cause issues in some environments.

**Fix**: Changed from `new CustomEvent('auth:unauthorized')` to `new Event('auth:unauthorized')`:
```typescript
if (typeof window !== 'undefined') {
  window.dispatchEvent(new Event('auth:unauthorized'));
}
```

**Note**: The `typeof window !== 'undefined'` guard was already present and correctly implemented.

### 3. `src/middleware.ts` - Cookie Name Verification

**Issue**: Needed to confirm exact cookie name for Laravel Sanctum.

**Fix verified**: Already uses `request.cookies.has('ecommerce_session')` which is the correct Laravel default session cookie name.

No change was needed — the implementation was already correct per the requirement.
