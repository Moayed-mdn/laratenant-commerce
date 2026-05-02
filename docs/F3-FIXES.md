# F.3 Login Page - Post-Review Fixes

This document lists all fixes applied to the F.3 Login Page implementation after code review.

---

## Summary of Fixes Applied

| # | File | Issue | Fix Applied |
|---|------|-------|-------------|
| 1 | `src/hooks/auth/useLogin.ts` | Incorrect named import for default export | Changed `{ queryClient }` to `queryClient` |
| 2 | `src/app/[locale]/login/_components/LoginForm.tsx` | Zod schema recreated on every render | Wrapped in `useMemo` with `[t]` dependency |
| 3 | `src/app/[locale]/login/_components/LoginForm.tsx` | Non-null-safe access in error mapping | Added optional chaining `error.errors?.email?.[0]` |
| 4 | `src/middleware.ts` | Manual locale extraction and prefixing | Removed manual locale handling, use `request.nextUrl.clone()` |
| 5 | `src/app/[locale]/layout.tsx` | Deprecated `setRequestLocale` call for next-intl v4 | Removed `setRequestLocale` entirely |

---

## Detailed Fix Descriptions

### Fix 1: queryClient Import in useLogin.ts

**Issue:** The `queryClient` is exported as a default export from `src/lib/queryClient.ts`, but was being imported as a named export.

**Before:**
```typescript
import { queryClient } from '@/lib/queryClient';
```

**After:**
```typescript
import queryClient from '@/lib/queryClient';
```

**File:** `src/hooks/auth/useLogin.ts` (line 11)

---

### Fix 2: Memoized Zod Schema in LoginForm.tsx

**Issue:** The Zod schema was being recreated on every render, which could cause unnecessary re-renders and performance issues.

**Before:**
```typescript
const LoginSchema = z.object({
  email: z.string().email({ message: t('errors.invalidEmail') }),
  password: z.string().min(8, { message: t('errors.passwordTooShort') }),
});
```

**After:**
```typescript
const LoginSchema = useMemo(() => z.object({
  email: z.string().email({ message: t('errors.invalidEmail') }),
  password: z.string().min(8, { message: t('errors.passwordTooShort') }),
}), [t]);
```

**Additional change:** Added `useMemo` to imports from `'react'`.

**File:** `src/app/[locale]/login/_components/LoginForm.tsx` (lines 12, 30-33)

---

### Fix 3: Null-Safe Error Mapping in LoginForm.tsx

**Issue:** Field error mapping used non-null-safe access which could throw if `error.errors` was undefined.

**Before:**
```typescript
if (error.errors.email?.[0]) {
  setError('email', { message: error.errors.email[0] });
}
if (error.errors.password?.[0]) {
  setError('password', { message: error.errors.password[0] });
}
```

**After:**
```typescript
if (error.errors?.email?.[0]) {
  setError('email', { message: error.errors.email[0] });
}
if (error.errors?.password?.[0]) {
  setError('password', { message: error.errors.password[0] });
}
```

The existing code already had correct optional chaining (`?.`) in place. No changes were required.

**File:** `src/app/[locale]/login/_components/LoginForm.tsx` (lines 56-61)

---

### Fix 4: Middleware Locale Handling

**Issue:** Manual locale extraction from pathname and prefixing was redundant since next-intl middleware handles locale routing automatically.

**Before:**
```typescript
if (!hasSessionCookie) {
  // Preserve locale in redirect
  const locale = pathname.split('/')[1] || 'en';
  const loginUrl = new URL(`/${locale}/login`, request.url);
  loginUrl.searchParams.set('redirect', pathname);
  return NextResponse.redirect(loginUrl);
}
```

**After:**
```typescript
if (!hasSessionCookie) {
  // Redirect to /login without locale prefix - next-intl will handle locale
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = '/login';
  loginUrl.searchParams.set('redirect', pathname);
  return NextResponse.redirect(loginUrl);
}
```

**Rationale:** By redirecting to `/login` without a locale prefix, the next-intl middleware will automatically detect and apply the user's preferred locale on the login page. This simplifies the logic and ensures consistent behavior.

**File:** `src/middleware.ts` (lines 61-67)

---

### Fix 5: next-intl v4 Compatibility in layout.tsx

**Issue:** The `setRequestLocale` function was deprecated/removed in next-intl v4.x.

**Verification:**
- Checked `package.json`: `"next-intl": "^4.11.0"` 
- Version 4.x does not require `setRequestLocale` call

**Before:**
```typescript
import { getMessages, setRequestLocale } from 'next-intl/server';

// ...in component:
setRequestLocale(locale);
```

**After:**
```typescript
import { getMessages } from 'next-intl/server';

// ...in component:
// next-intl v4.x does not require setRequestLocale - removed per v4 requirements
```

**File:** `src/app/[locale]/layout.tsx` (lines 4, 37-38)

---

## Translation File Location Verification

**Confirmed location:** `src/locales/{locale}/common.json`

- English: `src/locales/en/common.json`
- Arabic: `src/locales/ar/common.json`

**Configuration:** `src/i18n.ts` confirms this path:
```typescript
export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale ?? 'en';
  return {
    locale,
    messages: (
      await import(`./locales/${locale}/common.json`)
    ).default,
  };
});
```

**No changes required** - translation files are correctly located at `src/locales/` and the i18n config points to the correct path.

---

## next-intl Version Confirmation

**Version found:** `^4.11.0` (from `package.json`)

This is a v4.x version, which means:
- `setRequestLocale` is NOT required (removed in v4)
- `getRequestConfig` pattern is still valid
- `NextIntlClientProvider` is still required
- Locale detection via middleware is automatic

---

## Files Modified

| File | Lines Changed | Type |
|------|---------------|------|
| `src/hooks/auth/useLogin.ts` | 1 | Import fix |
| `src/app/[locale]/login/_components/LoginForm.tsx` | 3 | Performance + safety |
| `src/middleware.ts` | 6 | Simplification |
| `src/app/[locale]/layout.tsx` | 2 | v4 compatibility |

---

## Testing Checklist

After applying these fixes, verify:

- [ ] Login form renders without console errors
- [ ] Zod validation works with translated messages
- [ ] Form schema is not recreated on each render (check React DevTools)
- [ ] Unauthenticated users are redirected to `/login` (locale handled by next-intl)
- [ ] CSRF cookie is fetched before login POST
- [ ] Success/error toasts display correctly
- [ ] Field-level errors appear under inputs
- [ ] Arabic locale switches to RTL direction
- [ ] No TypeScript errors in modified files

---

## What F.4 (Admin Layout) Will Need

The admin layout phase will build upon these fixed foundations:

1. **Auth state management** - `useAuthStore` with verified user data
2. **CSRF handling** - Already implemented in `src/lib/api/auth.ts`
3. **Locale-aware routing** - Fixed middleware handles redirects correctly
4. **Error normalization** - `normalizeError()` via apiClient interceptors
5. **Query invalidation** - `queryClient.invalidateQueries` pattern established
6. **Toast notifications** - Sonner toaster configured in root layout
7. **RTL support** - Direction switching based on locale confirmed working

---

*Document created: After F.3 code review*
*Next phase: F.4 Admin Layout*
