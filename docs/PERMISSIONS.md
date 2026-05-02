# Frontend Permissions

This document contains the roles, permissions, authorization, and feature flags rules.

---

# 19. Authorization (Roles & Permissions)

## How It Works

- Permissions come from the authenticated user object (backend)
- User object includes: `roles`, `permissions`
- Stored in `authStore` on login
- UI conditionally renders based on permissions
- Backend ALWAYS enforces — frontend is UI-only protection

## Auth Store Permission Shape

```ts
interface AuthStore {
  user:        AdminUser | null;
  permissions: string[];
  roles:       string[];
  isAuth:      boolean;
  can:         (permission: string) => boolean;
  hasRole:     (role: string) => boolean;
}
```

## Permission Helper

```ts
// Inside authStore
can: (permission: string) => {
  return get().permissions.includes(permission);
}

hasRole: (role: string) => {
  return get().roles.includes(role);
}
```

## Usage in Components

```tsx
const { can, hasRole } = useAuthStore();

// Hide restricted UI
{can('user.delete') && (
  <DeleteUserButton userId={user.id} />
)}

// Disable restricted actions
<Button disabled={!can('product.update')}>
  Edit Product
</Button>

// Super admin check
{hasRole('super_admin') && (
  <GlobalStatsPanel />
)}
```

## Permission Constants (`src/config/permissions.ts`)

```ts
export const PERMISSIONS = {
  USER_VIEW:           'user.view',
  USER_BLOCK:          'user.block',
  USER_DELETE:         'user.delete',
  USER_RESTORE:        'user.restore',
  PRODUCT_VIEW:        'product.view',
  PRODUCT_CREATE:      'product.create',
  PRODUCT_UPDATE:      'product.update',
  PRODUCT_DELETE:      'product.delete',
  PRODUCT_RESTORE:     'product.restore',
  ORDER_VIEW:          'order.view',
  ORDER_UPDATE_STATUS: 'order.update_status',
  ORDER_CANCEL:        'order.cancel',
  ORDER_REFUND:        'order.refund',
  DASHBOARD_VIEW:      'dashboard.view',
} as const;
```

## Rules

- Never rely on frontend-only protection for security
- Always hide AND disable restricted actions
- Use `PERMISSIONS` constants — never hardcode strings
- Backend is the source of truth for permissions

---

# 48. Feature Flags (Updated)

## Two Types of Flags

| Type | Source | Purpose |
|------|--------|---------|
| Frontend flags | `src/config/features.ts` | UI-only, temporary toggles |
| Backend flags | User object from API | Critical feature gates |

## Frontend Flags (`src/config/features.ts`)

```ts
export const FEATURES = {
  NEW_DASHBOARD_LAYOUT: false,
  PRODUCT_BULK_UPLOAD:  false,
  ORDER_EXPORT_CSV:     false,
} as const;
```

## Backend Flags (from Auth Store)

```ts
interface AuthStore {
  features: string[];
  hasFeature: (flag: string) => boolean;
}

// Inside store
hasFeature: (flag: string) => {
  return get().features.includes(flag);
}
```

## Usage

```tsx
// Frontend flag — UI only
{FEATURES.NEW_DASHBOARD_LAYOUT && <NewLayout />}

// Backend flag — critical gates
const { hasFeature } = useAuthStore();
{hasFeature('analytics_charts') && <RevenueChart />}
```

## Rules

- Critical feature gates MUST come from backend
- Frontend flags are for UI-only or temporary toggles only
- Frontend flags MUST NOT gate security-sensitive features
- Remove frontend flags once feature is stable and released
