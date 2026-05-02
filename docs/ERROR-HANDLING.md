# Frontend Error Handling

This document contains the error strategy, error.tsx, error normalizer, and client error boundaries.

---

# 17. Error Handling Strategy

## Global Errors

- Every route group MUST have an `error.tsx` file
- Root `app/error.tsx` catches unexpected global errors
- Error UI must be user-friendly — never show raw error messages

## File Structure

```plaintext
app/
 ├── error.tsx                    ← Global fallback
 ├── (auth)/
 │    └── error.tsx
 ├── (admin)/
 │    └── error.tsx
```

## TanStack Query Errors

Every query MUST handle three states explicitly:

```tsx
if (isLoading) return <TableSkeleton />;
if (isError)   return <ErrorState message={error.message} />;
if (!data)     return <EmptyState />;
```

## Rules

- Never ignore `isError`
- Never render broken UI silently
- Never show raw API error messages to users
- All errors display via user-friendly UI components
- Network errors → show retry option
- 401 errors → redirect to login (handled in axios interceptor)
- 403 errors → show permission denied UI (not redirect)
- 404 errors → show not found UI

---

# 44. Error Normalizer

## Problem

Axios errors are inconsistent. Different errors have different
shapes. Hooks and components must never handle raw Axios errors.

## Normalizer (`src/lib/api/client/error.ts`)

```ts
import axios from 'axios';
import type { ApiError } from '@/types/api';

export function normalizeError(error: unknown): ApiError {
  if (axios.isAxiosError(error) && error.response?.data) {
    return error.response.data as ApiError;
  }

  if (axios.isAxiosError(error) && !error.response) {
    return {
      status:     false,
      message:    'Network error. Please check your connection.',
      error_code: 'NETWORK_ERROR',
      errors:     null,
    };
  }

  return {
    status:     false,
    message:    'An unexpected error occurred.',
    error_code: 'UNKNOWN_ERROR',
    errors:     null,
  };
}
```

## Usage in Axios Interceptor

```ts
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalized = normalizeError(error);

    if (normalized.error_code === 'AUTH_002') {
      // redirect to login
    }

    return Promise.reject(normalized);
  },
);
```

## Rules

- ALL API errors MUST pass through `normalizeError()`
- Hooks receive `ApiError` — never raw Axios errors
- Components receive `ApiError` from hooks — never raw errors
- `normalizeError` is called in the Axios interceptor only

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
