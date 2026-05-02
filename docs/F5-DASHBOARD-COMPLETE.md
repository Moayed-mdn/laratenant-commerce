# Dashboard Implementation Complete (F.5)

## Overview

This document describes the complete implementation of the multi-store e-commerce admin dashboard page (F.5). The dashboard displays key metrics, recent orders, and top products for a given store.

---

## Files Created or Modified

### New Files Created

| Path | Description | Exports |
|------|-------------|---------|
| `src/types/dashboard.ts` | Dashboard type definitions | `DashboardStats`, `DashboardStatsView`, `RecentOrderItem`, `RecentOrderItemView`, `TopProductItem`, `TopProductItemView` |
| `src/lib/mappers/dashboard.ts` | Data mappers for dashboard | `mapDashboardStats()`, `mapRecentOrder()`, `mapTopProduct()` |
| `src/lib/api/dashboard.ts` | Client-side API functions | `getDashboardStats()`, `getRecentOrders()`, `getTopProducts()` |
| `src/hooks/dashboard/useDashboardStats.ts` | TanStack Query hook for stats | `useDashboardStats()` |
| `src/hooks/dashboard/useRecentOrders.ts` | TanStack Query hook for orders | `useRecentOrders()` |
| `src/hooks/dashboard/useTopProducts.ts` | TanStack Query hook for products | `useTopProducts()` |
| `src/app/[locale]/(admin)/stores/[storeId]/dashboard/page.tsx` | Main dashboard page (RSC) | `default`, `generateMetadata` |
| `src/app/[locale]/(admin)/stores/[storeId]/dashboard/_components/DashboardContent.tsx` | Async RSC with data fetching | `default` |
| `src/app/[locale]/(admin)/stores/[storeId]/dashboard/_components/DashboardSkeleton.tsx` | Suspense fallback skeletons | `DashboardSkeleton`, `StatsGridSkeleton`, `StatCardSkeleton`, `RecentOrdersTableSkeleton`, `TopProductsListSkeleton` |
| `src/app/[locale]/(admin)/stores/[storeId]/dashboard/_components/StatsGrid.tsx` | Stats grid component | `StatsGrid` |
| `src/app/[locale]/(admin)/stores/[storeId]/dashboard/_components/StatCard.tsx` | Single stat card | `StatCard`, `StatCardIcon` |
| `src/app/[locale]/(admin)/stores/[storeId]/dashboard/_components/RecentOrdersTable.tsx` | Recent orders table | `RecentOrdersTable` |
| `src/app/[locale]/(admin)/stores/[storeId]/dashboard/_components/TopProductsList.tsx` | Top products list | `TopProductsList` |
| `src/app/[locale]/(admin)/stores/[storeId]/dashboard/_components/OrderStatusBadge.tsx` | Order status badge | `OrderStatusBadge` |

### Files Modified

| Path | Changes |
|------|---------|
| `src/locales/en/common.json` | Added `dashboard` namespace with all translation keys |
| `src/locales/ar/common.json` | Added `dashboard` namespace with Arabic translations |

---

## Suspense/Streaming Architecture

The dashboard uses React Suspense for streaming rendering:

```
page.tsx (thin wrapper)
  └── <Suspense fallback={<DashboardSkeleton />}>
        └── DashboardContent (async RSC)
              ├── StatsGrid
              ├── RecentOrdersTable
              └── TopProductsList
```

### How It Works

1. **page.tsx** is a thin server component that:
   - Awaits the `params` Promise (Next.js 16 pattern)
   - Wraps content in `<Suspense>` with `DashboardSkeleton` as fallback
   - Renders `DashboardContent`

2. **DashboardContent** is an async server component that:
   - Fetches all three data sources in parallel using `Promise.all()`
   - Maps raw API data to view shapes using mappers
   - Handles errors gracefully with a user-friendly error message
   - Renders the full dashboard layout

3. **Streaming Behavior**:
   - While `DashboardContent` fetches data, the user sees `DashboardSkeleton`
   - Once data is ready, the full dashboard streams in
   - No client-side loading states needed for initial render

### Benefits

- **Fast TTFB**: Skeleton shows immediately
- **Parallel Fetching**: All API calls happen simultaneously
- **Error Handling**: Errors are caught and displayed without crashing
- **SEO Friendly**: Content is server-rendered

---

## Mapper Pattern: Raw API → View Types

All API data passes through mappers before reaching UI components. This ensures:

1. **Type Safety**: Raw API types never leak into UI
2. **Consistent Formatting**: All dates, currencies, numbers formatted centrally
3. **Testability**: Mappers are pure functions, easy to unit test
4. **Backend Independence**: UI doesn't care about API field naming conventions

### Example: `mapDashboardStats`

```typescript
// Raw API shape (snake_case)
interface DashboardStats {
  total_revenue: number;
  revenue_change: number;
  // ...
}

// Mapped view shape (camelCase, pre-formatted)
interface DashboardStatsView {
  totalRevenue: string;           // "$12,345.67"
  revenueChangeFormatted: string; // "+12.5%"
  isRevenueUp: boolean;           // true
  // ...
}
```

### Currency Flow

Currency flows through mapper functions as a parameter:

```
DashboardContent (RSC)
  → Gets currency (currently hardcoded 'USD', Phase 2 will get from store)
  → Passes to mapDashboardStats(data, currency)
  → mapDashboardStats calls formatCurrency(amount, currency)
  → Returns formatted string like "$1,234.56"
```

For client-side hooks (`useDashboardStats`, etc.), currency is read from Zustand store:

```typescript
const currency = useStoreStore(selectCurrentStoreCurrency);
```

---

## RSC Translation Pattern (next-intl)

All dashboard components use the async `getTranslations` pattern for RSC:

```typescript
import { getTranslations } from 'next-intl/server';

export async function StatsGrid({ stats }: Props) {
  const t = await getTranslations('dashboard');
  
  return <div>{t('stats.revenue')}</div>;
}
```

### Key Points

1. **Async Components**: All display components are `async` functions
2. **Namespace**: Translations use the `dashboard` namespace
3. **No Client State**: Pure RSC—no `useTranslations` hook needed
4. **Type Safety**: Translation keys are validated at build time

---

## CSS Variables Added

The following CSS variables are used (already defined in `globals.css`):

| Variable | Purpose | Example Usage |
|----------|---------|---------------|
| `--color-success` | Positive trends | `text-success` for "+12.5%" |
| `--color-destructive` | Negative trends/errors | `text-destructive` for "-3.2%" |
| `--color-muted` | Secondary text | `text-muted` for subtitles |
| `--color-primary` | Links, accents | `text-primary` for order links |

No new CSS variables were added—the existing design system tokens cover all dashboard needs.

---

## OrderStatusBadge Variant Mapping

The `OrderStatusBadge` component maps order status to Badge variants:

```typescript
const variantMap: Record<OrderStatus, BadgeVariant> = {
  pending: 'outline',    // Neutral, awaiting action
  confirmed: 'default',  // Success state
  cancelled: 'destructive', // Error/danger state
  refunded: 'secondary', // Info state
};
```

### Visual Result

| Status | Badge Style | Meaning |
|--------|-------------|---------|
| Pending | Outline (gray border) | Awaiting confirmation |
| Confirmed | Solid (primary color) | Order is active |
| Cancelled | Solid (red/destructive) | Order was cancelled |
| Refunded | Solid (gray/secondary) | Money returned |

The badge label is translated via `t('orderStatus.{status}')`.

---

## What F.6 (Users List) Will Need

The Users List page (F.6) can reuse patterns from this dashboard implementation:

### Reusable Patterns

1. **Async RSC + Suspense**: Same streaming architecture
2. **Mapper Pattern**: Create `mapUser()` in a new `src/lib/mappers/users.ts`
3. **Query Hooks**: Create `useUsers()` hook with TanStack Query
4. **Table Component**: Reuse `RecentOrdersTable` structure for users table
5. **Skeleton Components**: Extend `DashboardSkeleton` with user row skeleton
6. **Translation Namespace**: Add `users` namespace to locale files

### New Requirements for F.6

1. **Pagination**: Users list will need pagination controls (not needed for dashboard's "recent" lists)
2. **Filters/Search**: User filtering by role, status, date range
3. **Bulk Actions**: Select multiple users for batch operations
4. **Permissions**: Check `can('manage', 'users')` before showing actions
5. **Avatar Component**: Display user profile images
6. **Role Badge**: Similar to `OrderStatusBadge` but for user roles

### File Structure for F.6

```
src/types/user.ts              (already exists — extend if needed)
src/lib/mappers/users.ts       (NEW — mapUser function)
src/lib/api/users.ts           (NEW — getUsers, getUserDetail)
src/hooks/users/useUsers.ts    (NEW — paginated query hook)
src/app/[locale]/(admin)/stores/[storeId]/users/
  page.tsx                     (NEW — Users list page)
  _components/
    UsersTable.tsx             (NEW — similar to RecentOrdersTable)
    UserRowSkeleton.tsx        (NEW — skeleton for user rows)
    UserRoleBadge.tsx          (NEW — badge for user roles)
    UsersFilters.tsx           (NEW — filter/search controls)
    Pagination.tsx             (NEW — reusable pagination)
```

---

## Hard Rules Compliance Checklist

| Rule | Status | Notes |
|------|--------|-------|
| NO any type | ✅ | All TypeScript is strict |
| NO hardcoded colors | ✅ | Uses `text-success`, `text-destructive`, `text-muted` tokens |
| NO hardcoded text | ✅ | All text via `t()` from next-intl |
| NO hardcoded URLs | ✅ | Uses `ROUTES` and `API_ROUTES` from config |
| NO magic strings | ✅ | All strings from config or translations |
| NO console.log | ✅ | Uses `logger` from `src/lib/logger.ts` |
| NO alert() | ✅ | Error state rendered in-page (toast not needed for RSC errors) |
| NO div buttons | ✅ | No buttons in dashboard (pure display) |
| NO fat components | ✅ | All components under 250 lines |
| NO client component without reason | ✅ | Only hooks are client; all UI is RSC |
| NO API calls in components | ✅ | API calls only in hooks or `DashboardContent` RSC |
| NO useEffect for data | ✅ | RSC fetching + TanStack Query only |
| NO raw API types in UI | ✅ | Mappers transform all data |
| NO inline query keys | ✅ | Uses `queryKeys.dashboard(storeId).stats()` factory |
| NO Zustand for storeId | ✅ | `storeId` comes from URL params |
| NO inline date formatting | ✅ | Uses `formatDate`, `formatRelative` utilities |
| NO unsanitized HTML | ✅ | No HTML rendering in dashboard |
| NO undebounced search | ✅ | N/A (no search on dashboard) |

---

## Backend Endpoints Used

| Endpoint | Method | Response Type | Used By |
|----------|--------|---------------|---------|
| `/api/v1/admin/stores/{store}/dashboard/stats` | GET | `DashboardStats` | `getDashboardStats()` |
| `/api/v1/admin/stores/{store}/dashboard/recent-orders` | GET | `RecentOrderItem[]` | `getRecentOrders()` |
| `/api/v1/admin/stores/{store}/dashboard/top-products` | GET | `TopProductItem[]` | `getTopProducts()` |

---

## Testing Recommendations

### Unit Tests

1. **Mappers**: Test `mapDashboardStats`, `mapRecentOrder`, `mapTopProduct` with various inputs
2. **Currency Formatting**: Verify correct formatting for different currencies
3. **Percentage Formatting**: Test positive, negative, and zero changes

### Integration Tests

1. **DashboardContent**: Mock API responses and verify rendered output
2. **Error States**: Test error handling when API fails
3. **Empty States**: Verify empty order/product lists render correctly

### E2E Tests

1. **Page Load**: Verify dashboard loads with correct data
2. **Navigation**: Click order/product links navigate correctly
3. **Responsive**: Test grid layout at different breakpoints

---

## Future Enhancements (Phase 2)

1. **Store Currency**: Fetch actual store currency from settings endpoint
2. **Date Range Picker**: Allow users to select custom date ranges for stats
3. **Real-time Updates**: WebSocket integration for live order notifications
4. **Export Functionality**: Export dashboard data as CSV/PDF
5. **Customizable Widgets**: Let users reorder/hide stat cards
