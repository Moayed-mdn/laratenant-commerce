# Routes Fix - API_ROUTES Update

## Summary

Updated `src/config/routes.ts` to match the actual Laravel backend routes. The `ROUTES` object (frontend navigation) was not changed; only the `API_ROUTES` object was updated.

## Changes Made

### 1. src/config/routes.ts

Replaced the entire `API_ROUTES` object with the corrected version that matches the Laravel backend:

- **Auth routes**: Added `csrfCookie()` and `register()` endpoints, updated all auth paths to use `/api/v1/users/auth/*` prefix
- **Dashboard routes**: Changed from nested object to function-based structure (`dashboard: () => ({...})`)
- **Users routes**: Added `block()`, `unblock()`, and `restore()` endpoints for user management
- **Products routes**: Added `restore()` endpoint for soft-delete recovery
- **Orders routes**: Added `updateStatus()`, `cancel()`, and `refund()` endpoints matching the three separate PATCH endpoints in the backend

### 2. src/lib/api/auth.ts

Updated the CSRF cookie call to use the config instead of a hardcoded string:

```typescript
// Before
await apiClient.get('/sanctum/csrf-cookie');

// After
await apiClient.get(API_ROUTES.auth.csrfCookie());
```

### 3. src/lib/api/orders.ts

Fixed the `updateOrderStatus` function to use the correct route path:

```typescript
// Before
API_ROUTES.store(storeId).orders.detail(orderId)

// After
API_ROUTES.store(storeId).orders().updateStatus(orderId)
```

## Backend Route Alignment

The updated routes now correctly match the Laravel backend structure:

- Order status updates use `/api/v1/admin/stores/{store}/orders/{order}/status`
- Separate endpoints exist for cancel and refund operations (available for Phase 2)
- User management includes block/unblock/restore endpoints (available for Phase 2)
- Products include restore endpoint for soft-delete recovery (available for Phase 2)

## Verification

All changes maintain type safety through TypeScript's const assertions. The route functions ensure consistent URL generation across the application.
