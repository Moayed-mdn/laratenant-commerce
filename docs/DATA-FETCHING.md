# Frontend Data Fetching

This document contains the RSC strategy, TanStack Query, hydration pattern, query key factory, timeout and cancellation, retry strategy, and debounce rules.

---

# 6. Data Fetching Strategy

## When to Use RSC (React Server Components)

Use RSC when:
- Data is needed for initial page render
- Data is SEO-critical
- Data does not change based on user interaction
- Page-level data fetching (dashboard stats on load)

```tsx
// app/(admin)/stores/[store]/dashboard/page.tsx
export default async function DashboardPage({
  params,
}: {
  params: { store: string };
}) {
  const stats = await getStats(Number(params.store));
  return <DashboardClient initialStats={stats} />;
}
```

## When to Use TanStack Query

Use TanStack Query when:
- Data needs to refetch after mutations
- Paginated tables
- Data changes based on user interaction
- Background refetching is needed

```tsx
// Client component
const { data, isLoading } = useQuery({
  queryKey: ['admin', 'users', storeId, filters],
  queryFn:  () => getUsers(storeId, filters),
});
```

## Rules

- RSC for page-level initial data
- TanStack Query for client interactions and mutations
- NEVER use useEffect + fetch for data fetching
- RSC uses server API layer for initial data
- TanStack Query uses client API layer for revalidation
- Pass RSC data as `initialData` to TanStack Query
- See Section 29 for the hydration pattern
- All TanStack Query hooks live in `src/lib/hooks/`
- Query keys MUST follow: `['domain', 'entity', storeId, ...filters]`

---

# 29. RSC + TanStack Query Hydration Pattern

When a page uses RSC for initial data AND needs
client-side refetching:

```tsx
// page.tsx (RSC)
export default async function UsersPage({ params }) {
  const initialData = await getUsers(Number(params.store));

  return (
    <HydrationBoundary
      state={dehydrate(getQueryClient())}
    >
      <UsersClient
        storeId={Number(params.store)}
        initialData={initialData}
      />
    </HydrationBoundary>
  );
}

// UsersClient.tsx ('use client')
export function UsersClient({ storeId, initialData }) {
  const { data } = useQuery({
    queryKey:    ['admin', 'users', storeId],
    queryFn:     () => getUsers(storeId),
    initialData: initialData,
  });
}
```

## Rules

- RSC provides `initialData` to avoid loading flash
- TanStack Query handles revalidation after that
- This pattern is used for all paginated admin tables

---

# 45. Query Key Factory

## Problem

Inline query keys like `['admin', 'users', storeId]` are
fragile. Typos cause silent bugs. Invalidation breaks.

## Factory (`src/lib/queryKeys.ts`)

```ts
export const queryKeys = {
  // Users
  users: (storeId: number, filters?: unknown) =>
    ['admin', 'users', storeId, filters] as const,

  user: (storeId: number, userId: number) =>
    ['admin', 'users', storeId, userId] as const,

  // Products
  products: (storeId: number, filters?: unknown) =>
    ['admin', 'products', storeId, filters] as const,

  product: (storeId: number, productId: number) =>
    ['admin', 'products', storeId, productId] as const,

  // Orders
  orders: (storeId: number, filters?: unknown) =>
    ['admin', 'orders', storeId, filters] as const,

  order: (storeId: number, orderId: number) =>
    ['admin', 'orders', storeId, orderId] as const,

  // Dashboard
  dashboardStats: (storeId: number) =>
    ['admin', 'dashboard', 'stats', storeId] as const,

  dashboardRecentOrders: (storeId: number) =>
    ['admin', 'dashboard', 'recent-orders', storeId] as const,

  dashboardTopProducts: (storeId: number) =>
    ['admin', 'dashboard', 'top-products', storeId] as const,
} as const;
```

## Usage

```ts
// ✅ Required
const { data } = useQuery({
  queryKey: queryKeys.users(storeId, filters),
  queryFn:  () => getUsers(storeId, filters),
});

// Invalidation
queryClient.invalidateQueries({
  queryKey: queryKeys.users(storeId),
});

// ❌ Forbidden
queryKey: ['admin', 'users', storeId, filters]
```

## Rules

- Query keys MUST be created via `queryKeys` factory
- Never inline query keys anywhere
- Invalidation MUST use the same factory

---

# 52. Axios Timeout & Request Cancellation

## Timeout Configuration

```ts
// src/lib/api/client/axios.ts
const api = axios.create({
  baseURL:         `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
  withCredentials: true,
  timeout:         10_000,   // 10 seconds
  headers: {
    Accept:         'application/json',
    'Content-Type': 'application/json',
  },
});
```

## Request Cancellation

For requests that may be superseded (search, filters):

```ts
export function useUsers(
  storeId: number,
  filters: UsersFilters,
) {
  return useQuery({
    queryKey: queryKeys.users(storeId, filters),
    queryFn:  ({ signal }) =>
      getUsers(storeId, filters, signal),
  });
}

// API function accepts signal
export const getUsers = async (
  storeId:  number,
  filters:  UsersFilters,
  signal?:  AbortSignal,
): Promise<PaginatedResponse<AdminUser>> => {
  const { data } = await api.get(
    `/admin/stores/${storeId}/users`,
    { params: filters, signal },
  );
  return data;
};
```

## Rules

- ALL Axios requests MUST have a 10 second timeout
- Search and filter queries MUST support cancellation
  via `AbortSignal` (TanStack Query passes `signal` automatically)
- Long-running uploads MAY have extended timeout
  (defined per-request, not globally)
- Timeout errors MUST be handled by `normalizeError()`

---

# 56. QueryClient Retry Strategy

## Problem

Without a smart retry strategy, all failures behave the same.
Network errors should retry. Validation errors should never retry.
Retrying a 422 error wastes requests and confuses users.

## QueryClient Config (`src/lib/queryClient.ts`)

```ts
import { QueryClient } from '@tanstack/react-query';
import { QUERY_CONFIG } from '@/config/query';
import type { ApiError } from '@/types/api';

function shouldRetry(
  failureCount: number,
  error: unknown,
): boolean {
  // Defensive check — unknown errors get retried
  if (!error || typeof error !== 'object') {
    return failureCount < 2;
  }

  const apiError = error as Partial<ApiError>;

  // Never retry validation errors
  if (apiError.error_code === 'VAL_001') return false;

  // Never retry auth errors — redirect handled by Axios interceptor
  if (apiError.error_code?.startsWith?.('AUTH_')) return false;

  // Never retry not found errors
  if (apiError.error_code === 'SYS_002') return false;

  // If error_code is missing (proxy failure, CDN error, malformed response)
  // treat as network error and retry
  if (!apiError.error_code) {
    return failureCount < 2;
  }

  // Only retry known retryable error categories
  const retryableErrorCodes = [
    'NETWORK_ERROR',  // No response from server
    'SYS_001',        // Retryable server error (5xx)
  ];

  if (retryableErrorCodes.includes(apiError.error_code)) {
    return failureCount < 2;
  }

  // All other errors (business logic, rate limits, etc.) — do not retry
  return false;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:           QUERY_CONFIG.staleTime,
      refetchOnWindowFocus: QUERY_CONFIG.refetchOnWindowFocus,
      retry:               shouldRetry,
      retryDelay:          (attempt) =>
        Math.min(1000 * 2 ** attempt, 30_000),
    },
    mutations: {
      retry: false,  // Never retry mutations automatically
    },
  },
});
```

## Rules

- Network errors (`NETWORK_ERROR`) retry up to 2 times
- Generic server errors (`SYS_001`) retry up to 2 times
- Validation errors (`VAL_001`) NEVER retry
- Auth errors (`AUTH_*`) NEVER retry — Axios interceptor handles redirect
- Not found errors (`SYS_002`) NEVER retry
- All business logic errors NEVER retry — they will not resolve on retry
- All unknown error codes NEVER retry — whitelist only
- Retries use exponential backoff: 1s → 2s → 4s (max 30s)
- Mutations NEVER retry automatically
- The `queryClient` instance is created once and shared

## Timeout + Retry Duration Warning

With 10s timeout and 2 retries plus backoff:
- Attempt 1: up to 10s
- Wait: 1s
- Attempt 2: up to 10s
- Wait: 2s
- Attempt 3: up to 10s
- Worst case total: ~33 seconds

Document this in loading UX. Show a user-friendly message
after the first failure, not only after all retries are exhausted.

---

# 58. Search & Filter Debounce Rule

## Problem

Without debouncing, every keystroke in a search field
fires an API request. A user typing "john" sends 4 requests.
This spams the backend and creates race conditions.

## Rule

All search inputs and filter changes that trigger API calls
MUST be debounced by 300ms minimum.

## Implementation

```ts
// src/lib/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

## Usage

```ts
// In filter hook
export function useUsersFilters() {
  const [filters, setFilters] = useQueryStates({
    search:   parseAsString.withDefault(''),
    page:     parseAsInteger.withDefault(1),
    per_page: parseAsInteger.withDefault(15),
  });

  const debouncedSearch = useDebounce(filters.search, 300);

  // Pass debouncedSearch to the query — not raw search
  const query = useUsers(storeId, {
    ...filters,
    search: debouncedSearch,
  });

  return { filters, setFilters, query };
}
```

## Rules

- Search inputs MUST debounce by 300ms minimum
- Filter dropdowns (select, enum) do NOT need debounce
  — they fire once on selection
- Pagination changes do NOT need debounce
  — they fire once on click
- The debounce value is passed to the query
  — the raw input value updates the URL immediately
- useDebounce lives in src/lib/hooks/useDebounce.ts
- Never implement debounce inline — always use the shared hook
- Query keys MUST include the debounced value — not the raw input
- Never pass non-debounced values to queryKey
- The raw input value MUST sync to URL immediately
- The debounced value is what triggers the API call
- Stale responses are automatically cancelled by TanStack Query
  when query key changes — this is why debounced keys matter
