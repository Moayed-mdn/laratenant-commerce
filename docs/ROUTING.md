# Frontend Routing

This document contains the routes config, URL state sync, and navigation rules.

---

# 23. Routing & Navigation Rules

## Rules

- Use `next/link` for all navigation links
- Use `useRouter()` only for programmatic navigation
- No hardcoded URL strings in components
- All routes defined in `src/config/routes.ts`
- **All routes MUST include locale parameter for multilingual support**

## Route Config (`src/config/routes.ts`)

```ts
export const ROUTES = {
  auth: {
    login: (locale: string) => `/${locale}/login`,
    logout: (locale: string) => `/${locale}/logout`,
  },
  store: (locale: string, storeId: string) => ({
    dashboard: () => `/${locale}/stores/${storeId}/dashboard`,
    users: {
      list: () => `/${locale}/stores/${storeId}/users`,
      detail: (userId: string) => `/${locale}/stores/${storeId}/users/${userId}`,
    },
    products: {
      list: () => `/${locale}/stores/${storeId}/products`,
      new: () => `/${locale}/stores/${storeId}/products/new`,
      edit: (productId: string) => `/${locale}/stores/${storeId}/products/${productId}`,
    },
    orders: {
      list: () => `/${locale}/stores/${storeId}/orders`,
      detail: (orderId: string) => `/${locale}/stores/${storeId}/orders/${orderId}`,
    },
  }),
} as const;
```

## Usage

### Client Components (with useLocale hook)

```tsx
// ✅ Required - Client Components
import { ROUTES } from '@/config/routes';
import { useLocale } from 'next-intl';

export function MyComponent({ storeId }: { storeId: string }) {
  const locale = useLocale();

  return (
    <Link href={ROUTES.store(locale, storeId).users.list()}>
      Users
    </Link>
  );
}
```

### Server Components (with locale prop)

```tsx
// ✅ Required - Server Components
import { ROUTES } from '@/config/routes';

export function MyServerComponent({
  storeId,
  locale
}: {
  storeId: string;
  locale: string;
}) {
  return (
    <Link href={ROUTES.store(locale, storeId).users.list()}>
      Users
    </Link>
  );
}
```

### Programmatic Navigation

```tsx
// ✅ Required - with useLocale hook
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { ROUTES } from '@/config/routes';

export function MyComponent({ storeId }: { storeId: string }) {
  const router = useRouter();
  const locale = useLocale();

  const handleNavigate = () => {
    router.push(ROUTES.store(locale, storeId).users.list());
  };
}
```

## ❌ Forbidden

```tsx
// ❌ Missing locale prefix
<Link href={`/stores/${storeId}/users`}>Users</Link>

// ❌ Hardcoded locale
<Link href="/en/stores/1/users">Users</Link>

// ❌ Using ROUTES without locale
<Link href={ROUTES.store(storeId).users.list()}>Users</Link>
```

---

# 26. URL State Synchronization

## Rule

All filter state lives in URL — not in component state.
No hidden filter state.
Sharing a URL must reproduce the exact same view.
Back button must restore previous filter state.
