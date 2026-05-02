# Frontend API Layer

This document contains the Axios instance, server/client API split, error normalizer, API versioning, and cookie forwarding rules.

---

# 5. API Layer

## Axios Instance (`src/lib/api/axios.ts`)

One typed Axios instance. All API calls go through it.

```ts
const api = axios.create({
  baseURL:         `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
  withCredentials: true,
  timeout:         10_000,
  headers: {
    Accept:         'application/json',
    'Content-Type': 'application/json',
  },
});
```

## How Sanctum Auth Works

- Authentication uses httpOnly cookies
- Cookies are sent automatically by the browser
  via `withCredentials: true`
- No manual token attachment is needed or allowed
- Never attempt to read httpOnly cookies client-side

Interceptors handle:
- Redirecting to login on 401 response
- Normalizing all errors through `normalizeError()`
- Formatting error responses consistently

## API Layer Split

The API layer is split into two environments:

```plaintext
src/lib/api/
 ├── client/          ← Axios (browser + client components only)
 │    ├── axios.ts    ← Axios instance
 │    ├── error.ts    ← Error normalizer
 │    └── admin/
 │         ├── users.ts
 │         ├── products.ts
 │         ├── orders.ts
 │         └── dashboard.ts
 └── server/          ← fetch (RSC + server components only)
      └── admin/
           ├── users.ts
           ├── products.ts
           ├── orders.ts
           └── dashboard.ts
```

### Client API (Axios — browser only)

```ts
// src/lib/api/client/admin/users.ts
export const getUsers = async (
  storeId: number,
  params: GetUsersParams,
): Promise<PaginatedResponse<AdminUser>> => {
  const { data } = await api.get(
    `/admin/stores/${storeId}/users`,
    { params },
  );
  return data;
};
```

### Server API (fetch — RSC only)

```ts
// src/lib/api/server/admin/users.ts
import { cookies } from 'next/headers';

export async function getUsersServer(
  storeId: number,
  params: GetUsersParams,
): Promise<PaginatedResponse<AdminUser>> {
  const cookieStore = cookies();

  const res = await fetch(
    `${process.env.API_URL}/api/v1/admin/stores/${storeId}/users`,
    {
      headers: {
        Cookie:  cookieStore.toString(),
        Accept:  'application/json',
      },
      cache: 'no-store',
    },
  );

  if (!res.ok) {
    throw new Error(`Server fetch failed: ${res.status}`);
  }

  return res.json();
}
```

## Server API Rules

- Server API MUST forward cookies manually using
  `cookies()` from `next/headers`
- NEVER rely on `credentials: 'include'` alone in RSC
  — it does not work for cross-origin APIs
- `credentials: 'include'` is for same-origin only
- Always set `cache: 'no-store'` for admin data
- Always check `res.ok` before parsing response

## Rules

- RSC MUST use server API layer only (`lib/api/server/`)
- Client components MUST use Axios layer only (`lib/api/client/`)
- NEVER use Axios inside RSC — it is browser-only
- NEVER use server API inside client components

## Rules

- All API functions are typed with TypeScript
- All API functions live in `src/lib/api/`
- No fetch/axios calls inside components
- No fetch/axios calls inside Zustand stores
- API base URL comes from `NEXT_PUBLIC_API_URL` env variable

---

# 30. API Versioning

## Rule

All API calls MUST use the `/api/v1/` prefix.
The version is controlled by the backend.
Never hardcode version strings in individual API functions.

```ts
// src/lib/api/axios.ts
const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
});

// src/lib/api/admin/users.ts
// ✅ Correct — version handled by baseURL
export const getUsers = (storeId: number) =>
  api.get(`/admin/stores/${storeId}/users`);

// ❌ Forbidden — hardcoded version
export const getUsers = (storeId: number) =>
  api.get(`/api/v1/admin/stores/${storeId}/users`);
```

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
