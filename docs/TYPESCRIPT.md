# Frontend TypeScript

This document contains the strict mode, API response types, cross-layer imports, and DTO mapping layer rules.

---

# 10. TypeScript Rules

- Strict mode ON — no exceptions
- No `any` type — ever
- All API responses have typed interfaces in `src/types/`
- All component props have explicit interfaces
- All Zustand stores have explicit interfaces

## API Response Types (`src/types/api.ts`)

```ts
export interface ApiResponse<T> {
  status:  boolean;
  message: string;
  data:    T;
}

export interface PaginatedResponse<T> {
  status:  boolean;
  message: string;
  data:    T[];
  meta: {
    current_page: number;
    last_page:    number;
    per_page:     number;
    total:        number;
  };
}

export interface ApiError {
  status:     false;
  message:    string;
  error_code: string;
  errors:     Record<string, string[]> | null;
}
```

## API Error Contract

- All backend errors MUST include `error_code`
- `error_code` is required — never optional
- Frontend retry logic depends on `error_code` being present
- If `error_code` is missing → treated as network error → retried
- Backend MUST NOT return errors without `error_code`

---

# 46. Cross-Layer Import Rules

## Import Direction (STRICT)

```
pages
  → components
    → hooks
      → API layer
        → types

Each layer may only import from layers below it.
Reverse imports are forbidden.
```

## Rules

| Layer | May Import |
|-------|-----------|
| `app/` pages | `components/`, `hooks/`, `stores/`, `types/`, `config/` |
| `components/` | `hooks/`, `lib/utils/`, `types/`, `config/`, `components/ui/` |
| `lib/hooks/` | `lib/api/client/`, `lib/utils/`, `types/`, `config/` |
| `lib/api/client/` | `types/`, `config/` |
| `lib/api/server/` | `types/`, `config/` |
| `stores/` | `types/`, `config/` |
| `types/` | nothing |
| `config/` | `types/` only |

## ❌ Forbidden

```ts
// Component importing API directly
import { getUsers } from '@/lib/api/client/admin/users';

// Hook importing a component
import { UserCard } from '@/components/admin/users/UserCard';

// API importing a store
import { useAuthStore } from '@/stores/authStore';
```

## ✅ Required

```ts
// Component uses hook — hook uses API
import { useUsers } from '@/lib/hooks/admin/useUsers';
```

---

# 47. DTO Mapping Layer

## Problem

If UI depends directly on backend response shape,
any backend change breaks the entire UI.

## Solution

Map API responses to frontend types before they reach UI.

## Location

```plaintext
src/lib/mappers/
 ├── user.mapper.ts
 ├── product.mapper.ts
 ├── order.mapper.ts
 └── dashboard.mapper.ts
```

## Example

```ts
// src/lib/mappers/user.mapper.ts

import type { AdminUserApi }  from '@/types/api/user';
import type { AdminUser }     from '@/types/user';

export function mapUser(raw: AdminUserApi): AdminUser {
  return {
    id:        raw.id,
    name:      raw.name,
    email:     raw.email,
    isActive:  raw.is_active,
    createdAt: raw.created_at,
    role:      raw.store_role ?? 'customer',
  };
}

export function mapUsers(raw: AdminUserApi[]): AdminUser[] {
  return raw.map(mapUser);
}
```

## Usage in API Layer

```ts
// src/lib/api/client/admin/users.ts
import { mapUsers } from '@/lib/mappers/user.mapper';

export const getUsers = async (
  storeId: number,
): Promise<AdminUser[]> => {
  const { data } = await api.get(
    `/admin/stores/${storeId}/users`,
  );
  return mapUsers(data.data);
};
```

## Rules

- API responses MUST be mapped before reaching hooks or UI
- UI types live in `src/types/`
- Raw API types live in `src/types/api/`
- Mappers live in `src/lib/mappers/`
- UI MUST NOT depend on raw backend field names
