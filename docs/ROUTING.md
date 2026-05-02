# Frontend Routing

This document contains the routes config, URL state sync, and navigation rules.

---

# 23. Routing & Navigation Rules

## Rules

- Use `next/link` for all navigation links
- Use `useRouter()` only for programmatic navigation
- No hardcoded URL strings in components
- All routes defined in `src/config/routes.ts`

## Route Config (`src/config/routes.ts`)

```ts
export const ROUTES = {
  LOGIN: '/login',

  DASHBOARD: (storeId: number) =>
    `/stores/${storeId}/dashboard`,

  USERS: (storeId: number) =>
    `/stores/${storeId}/users`,

  USER_DETAIL: (storeId: number, userId: number) =>
    `/stores/${storeId}/users/${userId}`,

  PRODUCTS: (storeId: number) =>
    `/stores/${storeId}/products`,

  PRODUCT_DETAIL: (storeId: number, productId: number) =>
    `/stores/${storeId}/products/${productId}`,

  ORDERS: (storeId: number) =>
    `/stores/${storeId}/orders`,

  ORDER_DETAIL: (storeId: number, orderId: number) =>
    `/stores/${storeId}/orders/${orderId}`,
} as const;
```

## Usage

```tsx
// ✅ Required
import { ROUTES } from '@/config/routes';
<Link href={ROUTES.USERS(storeId)}>Users</Link>

// ❌ Forbidden
<Link href={`/stores/${storeId}/users`}>Users</Link>
```

---

# 26. URL State Synchronization

## Rule

All filter state lives in URL — not in component state.
No hidden filter state.
Sharing a URL must reproduce the exact same view.
Back button must restore previous filter state.
