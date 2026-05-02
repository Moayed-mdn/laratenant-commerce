# Frontend Performance

This document contains the RSC preference, dynamic imports, memoization, and suspense streaming rules.

---

# 28. Performance Rules

## Component Optimization

- Prefer RSC over client components when no interactivity
- Use `dynamic()` imports for heavy components
- Use `React.memo` for expensive list items

```ts
const HeavyChart = dynamic(
  () => import('@/components/admin/dashboard/RevenueChart'),
  { loading: () => <CardSkeleton /> },
);
```

## Rules

- No unnecessary `'use client'` directives
- Every `'use client'` must have a reason
- Avoid prop drilling more than 2 levels — use Zustand
- No anonymous functions in JSX for expensive renders

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
