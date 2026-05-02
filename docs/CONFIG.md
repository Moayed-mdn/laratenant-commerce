# Frontend Configuration

This document contains the environment variables, config layer, logger, feature flags, and date handling rules.

---

# 13. Environment Variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=Admin Dashboard
```

- All public vars prefixed with `NEXT_PUBLIC_`
- Never expose secret keys on client side
- `.env.local` for local development
- `.env.production` for production

---

# 24. Config & Constants Layer

## Structure

```plaintext
src/config/
 ├── app.ts           ← App name, version, defaults
 ├── routes.ts        ← All route definitions
 ├── permissions.ts   ← Permission constants
 └── query.ts         ← TanStack Query default config
```

## App Config (`src/config/app.ts`)

```ts
export const APP_CONFIG = {
  name:           process.env.NEXT_PUBLIC_APP_NAME ?? 'Admin',
  apiUrl:         process.env.NEXT_PUBLIC_API_URL  ?? '',
  defaultPerPage: 15,
  toastDuration:  4000,
} as const;
```

## Query Config (`src/config/query.ts`)

```ts
export const QUERY_CONFIG = {
  staleTime: 1000 * 60 * 5,    // 5 minutes
  retry:     1,
  refetchOnWindowFocus: false,
} as const;
```

## Rules

- No magic strings or numbers in components
- All configuration lives in `src/config/`
- Use constants from config — never hardcode values

---

# 33. Logging & Debug Strategy

## Logger Utility (`src/lib/logger.ts`)

```typescript
export const logger = {
  info: (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[INFO]', ...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[WARN]', ...args);
    }
  },
  error: (...args: unknown[]) => {
    console.error('[ERROR]', ...args);
  },
};
```

## Usage

```typescript
import { logger } from '@/lib/logger';

logger.info('Fetching users for store', storeId);
logger.error('Failed to block user', error);
```

## Rules

- `console.log` is FORBIDDEN in committed code
- Use `logger.info()` for development debugging
- Use `logger.error()` for real errors — these log in production
- NEVER log: tokens, passwords, full user objects
- NEVER log: API responses that contain sensitive data
- Logger is the only allowed debug output

---

# 34. Feature Flags

> ⚠️ This section is superseded by Section 48.
> See Section 48 for the complete feature flag system.
> Section 48 covers both frontend flags and backend-driven flags.

---

# 39. Date & Time Handling

## Rules

- All dates come from backend in ISO 8601 format
- All date formatting via shared utility — never inline
- Never use `new Date().toLocaleString()` directly in components
- Timezone: display in user's local timezone by default

## Date Utility (`src/lib/utils/date.ts`)

```typescript
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

const localeMap = {
  en: enUS,
  ar: ar,
};

export function formatDate(
  isoString: string,
  locale: string = 'en',
): string {
  return format(
    parseISO(isoString),
    'MMM dd, yyyy',
    { locale: localeMap[locale] ?? enUS },
  );
}

export function formatDateTime(
  isoString: string,
  locale: string = 'en',
): string {
  return format(
    parseISO(isoString),
    'MMM dd, yyyy — HH:mm',
    { locale: localeMap[locale] ?? enUS },
  );
}

export function timeAgo(
  isoString: string,
  locale: string = 'en',
): string {
  return formatDistanceToNow(parseISO(isoString), {
    addSuffix: true,
    locale: localeMap[locale] ?? enUS,
  });
}
```

## Usage

```tsx
// ✅ Required
import { formatDate } from '@/lib/utils/date';
<span>{formatDate(user.created_at, locale)}</span>

// ❌ Forbidden
<span>{new Date(user.created_at).toLocaleDateString()}</span>
```
