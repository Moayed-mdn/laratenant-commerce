# Frontend Components

This document contains the component rules, domain isolation, size limits, empty states, suspense, barrel files, and error boundaries.

---

# 9. Component Rules

## Component Layers

| Layer | Location | Purpose |
|-------|----------|---------|
| shadcn primitives | `components/ui/` | Raw UI (Button, Input, etc.) |
| Common components | `components/common/` | Shared across domains |
| Domain components | `components/admin/{domain}/` | Domain-specific UI |
| Page components | `app/(admin)/...` | Route pages |

## Rules

- shadcn components in `components/ui/` are NEVER modified directly
- Override via token system or wrapper components
- Common components are fully reusable and have no domain logic
- Domain components belong to one domain only
- Page files (`page.tsx`) are thin — they compose components only
- No inline styles — use Tailwind classes only
- No hardcoded color classes — use token classes only

## Component File Structure

```tsx
// Every component follows this structure:

// 1. Imports
// 2. Types
// 3. Component
// 4. Export

interface Props {
  storeId: number;
  userId:  number;
}

export function UserCard({ storeId, userId }: Props) {
  // ...
}
```

---

# 20. Domain Isolation

## Rules

- Domains MUST NOT import from each other directly
- Shared logic goes to `components/common/` or `lib/utils/`
- No circular dependencies between domains

## ❌ Forbidden

```ts
// Inside products domain
import { UserCard } from '@/components/admin/users/UserCard';
```

## ✅ Required

```ts
// Move shared component to common
import { UserCard } from '@/components/common/UserCard';
```

## Domain Boundaries

| Domain | Owns |
|--------|------|
| `admin/users` | User table, user detail, block/unblock UI |
| `admin/products` | Product table, product form, variant UI |
| `admin/orders` | Order table, order detail, status UI |
| `admin/dashboard` | Stats cards, charts, recent lists |
| `common` | DataTable, PageHeader, StatusBadge, Modals |
| `layout` | Sidebar, Navbar, Breadcrumbs |

---

# 35. Component Size & Complexity Limits

## Rules

- Maximum 250 lines per component file
- If a component exceeds 250 lines → split it
- Business logic MUST be extracted to hooks
- Components render UI only — no logic inside

## How to Split

```plaintext
// Too big — split this:
UsersPage.tsx (400 lines)

// Into this:
UsersPage.tsx         ← composes only (~30 lines)
UsersTable.tsx        ← table UI
UsersFilters.tsx      ← filter bar
UserActionsMenu.tsx   ← row action dropdown
useUsersPage.ts       ← all page logic
```

## Rules for Hooks

- Hooks MUST be pure (no side effects outside React lifecycle)
- Hooks MAY call hooks from the same domain
- Hooks MAY call hooks from shared/core domains
  (authStore, storeStore, uiStore)
- Hooks MUST NOT call hooks from a different feature domain
  (users hook calling products hook directly is forbidden)

Hooks return a consistent shape:

```typescript
return {
  data,
  isLoading,
  isError,
  error,
  // mutations if applicable
  mutate,
  isPending,
};
```

Query hooks named: `useUsers`, `useProducts`
Mutation hooks named: `useCreateUser`, `useBlockUser`

---

# 36. Empty State Design System

## Rule

Every list, table, or data view MUST have an empty state.
No blank areas. No silent nothing.

## Shared Component

```tsx
// components/common/EmptyState.tsx

interface EmptyStateProps {
  title:        string;
  description?: string;
  action?:      React.ReactNode;
  icon?:        React.ReactNode;
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center
                    justify-center py-16 text-center">
      {icon && (
        <div className="mb-4 text-muted">{icon}</div>
      )}
      <h3 className="text-fore font-medium">{title}</h3>
      {description && (
        <p className="mt-1 text-muted text-sm">{description}</p>
      )}
      {action && (
        <div className="mt-4">{action}</div>
      )}
    </div>
  );
}
```

## Usage

```tsx
<EmptyState
  title={t('users.empty_title')}
  description={t('users.empty_description')}
  icon={<UsersIcon className="w-10 h-10" />}
  action={<CreateUserButton storeId={storeId} />}
/>
```

## Rules

- Use `EmptyState` component — never custom inline empties
- Title is required — description is optional
- Action is optional — only show if user can act
- All text through `t()` — no hardcoded strings

---

# 49. Suspense & Streaming Rules

## Rules

- Use `Suspense` boundaries for slow RSC sections
- Never block the entire page for one slow request
- Each independent section gets its own `Suspense`

## Pattern

```tsx
// app/(admin)/stores/[store]/dashboard/page.tsx

export default function DashboardPage() {
  return (
    <div>
      <PageHeader title={t('dashboard.title')} />

      <Suspense fallback={<StatsSkeleton />}>
        <StatsSection storeId={storeId} />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <RecentOrdersSection storeId={storeId} />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <TopProductsSection storeId={storeId} />
      </Suspense>
    </div>
  );
}
```

## Rules

- Each Suspense boundary has a skeleton fallback
- Skeletons match the shape of the content they replace
- Never use a generic spinner as a Suspense fallback
- Group related data under one Suspense boundary

---

# 50. Barrel File Rules (index.ts)

## Rules

- `index.ts` is allowed ONLY as a public API for a folder
- Deep barrel chains are FORBIDDEN
- Never re-export everything blindly

## ✅ Allowed

```ts
// components/common/index.ts
export { DataTable }   from './DataTable/DataTable';
export { EmptyState }  from './EmptyState';
export { PageHeader }  from './PageHeader';
```

## ❌ Forbidden

```ts
// Barrel that re-exports barrels
export * from './DataTable';
export * from './EmptyState';
export * from './PageHeader';
```

## ❌ Also Forbidden

```ts
// Deep import chain
import { x } from '@/components/common/DataTable/index';
// Then DataTable/index re-exports from DataTable/columns/index
// Then that re-exports from DataTable/columns/helpers/index
```

---

# 53. Client Error Boundaries

## Context

Next.js `error.tsx` files handle both RSC and client errors
at the route segment level. However, complex client components
should have isolated boundaries so one failure does not
crash the entire page.

## When to Use Isolated Error Boundaries

Wrap these components in their own ErrorBoundary:
- DataTable
- Charts and graphs
- Complex forms
- File upload components

## Implementation

```tsx
// components/common/ErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import { EmptyState } from './EmptyState';

interface Props {
  children:  ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  message:  string;
}

export class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <EmptyState
          title="Something went wrong"
          description="Try refreshing the page"
        />
      );
    }
    return this.props.children;
  }
}
```

## Usage

```tsx
<ErrorBoundary>
  <DataTable columns={columns} data={data} />
</ErrorBoundary>

<ErrorBoundary fallback={<ChartErrorState />}>
  <RevenueChart storeId={storeId} />
</ErrorBoundary>
```

## Rules

- Route-level errors → handled by `error.tsx`
- Component-level errors → handled by `ErrorBoundary`
- DataTable MUST always be wrapped in ErrorBoundary
- Charts MUST always be wrapped in ErrorBoundary
- ErrorBoundary fallback MUST use `EmptyState` component
  or a domain-specific fallback — never blank
