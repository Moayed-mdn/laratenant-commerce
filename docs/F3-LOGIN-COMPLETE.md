# F.3 Login Page - Complete Report

## Overview

This document describes all files created or modified for the login page implementation (Phase F.3) of the multi-store e-commerce admin dashboard.

---

## Files Created

### 1. `src/i18n/routing.ts`

**Purpose:** next-intl routing configuration for locale detection and redirection.

**Exports:**
- `routing` - Routing configuration object with locales `['en', 'ar']` and default locale `'en'`

**Key decisions:**
- Uses `defineRouting` from `next-intl/routing` for type-safe locale handling
- Locales match the supported locales in `APP_CONFIG`

---

### 2. `src/lib/api/auth.ts`

**Purpose:** Auth API functions for client-side use.

**Exports:**
- `LoginCredentials` interface - `{ email: string, password: string }`
- `LoginResponse` interface - `{ user: AdminUser, message: string }`
- `login(credentials)` - Async function to authenticate user
- `logout()` - Async function to logout current user
- `getMe()` - Async function to fetch current authenticated user

**CSRF Handling:**
- The `login()` function first calls `GET /sanctum/csrf-cookie` before posting credentials
- This is required for Laravel Sanctum SPA authentication
- The XSRF-TOKEN cookie is set automatically by the backend
- Axios `withCredentials: true` includes it on subsequent requests

**Error handling:**
- No try/catch blocks - errors are normalized by the axios interceptor
- Returns typed responses via `ApiResponse<T>` wrapper

---

### 3. `src/hooks/auth/useLogin.ts`

**Purpose:** Mutation hook for the login flow using TanStack Query.

**Exports:**
- `UseLoginOptions` interface - Optional callbacks for success/error
- `useLogin(options?)` - Hook returning mutation object

**Key behaviors:**
- `retry: 0` - Hard rule enforced (mutations never retry)
- On success:
  1. Updates Zustand auth store with user data
  2. Invalidates `queryKeys.auth.me()` query
  3. Calls `onSuccess` callback with store ID (or empty string if none)
  4. Logs success via logger
- On error:
  1. Logs error via logger
  2. Calls `onError` callback with normalized `ApiError`

**Hard rules followed:**
- NO `useRouter` import (navigation only in component layer)
- NO `toast` import (toasts only in component layer)
- Uses `queryKeys` factory (no inline query keys)

---

### 4. `src/app/[locale]/login/_components/LoginForm.tsx`

**Purpose:** Client-side form component with validation and submission handling.

**Exports:**
- `LoginForm` - Main form component

**Features:**
- React Hook Form for form state management
- Zod schema for validation with translated error messages
- Password visibility toggle (Eye/EyeOff icons)
- Field-level error display from API validation errors
- Toast notifications for success/error states
- Double-submit prevention via disabled button state

**Validation schema:**
```typescript
const LoginSchema = z.object({
  email: z.string().email({ message: t('errors.invalidEmail') }),
  password: z.string().min(8, { message: t('errors.passwordTooShort') }),
});
```

**Error handling flow:**
1. API returns `ApiError` with field errors in `error.errors`
2. `onError` callback extracts field errors and calls `setError()` for each
3. Form displays errors under respective fields
4. Toast always shows general error message

**Hard rules followed:**
- All text via `t()` (next-intl)
- Token classes only (`text-destructive`, `bg-background`, etc.)
- Semantic HTML (`<form>`, `<Button type="submit">`)
- No double submissions (button disabled during pending state)
- Toast only in component layer
- Router only in component layer

---

### 5. `src/app/[locale]/login/_components/LoginCard.tsx`

**Purpose:** Visual wrapper component for the login page.

**Exports:**
- `LoginCard` - Card container component

**Structure:**
- Full viewport height centered layout
- shadcn/ui Card component
- App name header
- Title and subtitle from translations
- LoginForm as child

**Styling:**
- Uses token classes only (`bg-background`, `min-h-screen`, etc.)
- Max width `max-w-md` for card
- Responsive padding

---

### 6. `src/app/[locale]/login/page.tsx`

**Purpose:** Server component page for login route.

**Exports:**
- `generateMetadata()` - Async metadata generator for SEO
- Default page component

**Logic:**
- Checks for existing `ecommerce_session` cookie
- If authenticated, redirects to root `/`
- Otherwise renders `LoginCard`

**Metadata:**
- Title from `t('login.pageTitle')`
- Description from `t('login.pageDescription')`

---

### 7. `src/components/providers/QueryProvider.tsx`

**Purpose:** TanStack Query client provider wrapper.

**Exports:**
- `QueryProvider` - Provider component wrapping children

**Features:**
- Creates QueryClient once per render cycle (SSR-safe)
- Uses `makeQueryClient()` for fresh instance
- Includes ReactQueryDevtools in development only

---

### 8. `src/app/[locale]/layout.tsx`

**Purpose:** Root layout for locale-segmented routes.

**Exports:**
- `generateStaticParams()` - Static params for all locales
- Default layout component

**Features:**
- Sets `lang` and `dir` attributes based on locale
- Arabic (`ar`) gets `dir="rtl"`, English (`en`) gets `dir="ltr"`
- Wraps children with `QueryProvider` and `NextIntlClientProvider`
- Includes `Toaster` for toast notifications
- Uses `setRequestLocale()` for static rendering

---

### 9. `src/middleware.ts` (Modified)

**Purpose:** Combined i18n and auth middleware.

**Changes:**
- Integrated `createMiddleware` from `next-intl/middleware`
- Public route checking now strips locale prefix
- Auth check preserves locale in redirect URL
- Matcher updated to exclude `/api` routes

**Flow:**
1. Check if route is public (login, logout, _next, api, favicon)
2. If public: run i18n middleware only
3. If protected: check for `ecommerce_session` cookie
4. If no cookie: redirect to `/{locale}/login?redirect={pathname}`
5. If authenticated: run i18n middleware

---

### 10. `src/locales/en/common.json` (Modified)

**Added keys:**
```json
{
  "login": {
    "pageTitle": "Login — Admin Dashboard",
    "pageDescription": "Sign in to your admin dashboard",
    "appName": "Admin Dashboard",
    "title": "Sign in to your account",
    "subtitle": "Enter your credentials below to continue",
    "emailLabel": "Email address",
    "emailPlaceholder": "you@example.com",
    "passwordLabel": "Password",
    "passwordPlaceholder": "Enter your password",
    "submitButton": "Sign in",
    "signingIn": "Signing in...",
    "togglePassword": "Toggle password visibility",
    "errors": {
      "invalidEmail": "Please enter a valid email address",
      "passwordTooShort": "Password must be at least 8 characters",
      "noStoreAssigned": "Your account has no store assigned. Contact support.",
      "genericError": "Something went wrong. Please try again."
    },
    "success": {
      "loggedIn": "Welcome back!"
    }
  }
}
```

---

### 11. `src/locales/ar/common.json` (Modified)

**Added keys:**
```json
{
  "login": {
    "pageTitle": "تسجيل الدخول — لوحة التحكم",
    "pageDescription": "سجّل دخولك إلى لوحة التحكم",
    "appName": "لوحة التحكم",
    "title": "تسجيل الدخول إلى حسابك",
    "subtitle": "أدخل بيانات الاعتماد الخاصة بك للمتابعة",
    "emailLabel": "البريد الإلكتروني",
    "emailPlaceholder": "example@domain.com",
    "passwordLabel": "كلمة المرور",
    "passwordPlaceholder": "أدخل كلمة المرور",
    "submitButton": "تسجيل الدخول",
    "signingIn": "جارٍ تسجيل الدخول...",
    "togglePassword": "إظهار أو إخفاء كلمة المرور",
    "errors": {
      "invalidEmail": "يرجى إدخال بريد إلكتروني صحيح",
      "passwordTooShort": "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل",
      "noStoreAssigned": "حسابك غير مرتبط بأي متجر. يرجى التواصل مع الدعم.",
      "genericError": "حدث خطأ ما. يرجى المحاولة مرة أخرى."
    },
    "success": {
      "loggedIn": "مرحباً بعودتك!"
    }
  }
}
```

---

## Error Flow: API → Hook → Component → Toast

```
┌─────────────────┐
│   Backend API   │
│  (Laravel 12)   │
└────────┬────────┘
         │ 422 Validation Error
         ▼
┌─────────────────┐
│  Axios Client   │
│  (interceptor)  │
└────────┬────────┘
         │ normalizeError()
         ▼
┌─────────────────┐
│   ApiError      │
│ { message,      │
│   errors,       │
│   status,       │
│   code }        │
└────────┬────────┘
         │ thrown
         ▼
┌─────────────────┐
│  useLogin hook  │
│  (onError cb)   │
└────────┬────────┘
         │ calls options.onError(error)
         ▼
┌─────────────────┐
│   LoginForm     │
│  (onError cb)   │
└────────┬────────┘
         │ 1. setError() for field errors
         │ 2. toast.error() for general message
         ▼
┌─────────────────┐
│     Sonner      │
│   (Toaster)     │
└─────────────────┘
```

---

## CSRF Handling Details

Laravel Sanctum requires a CSRF token for state-changing requests. The flow:

1. **Before login POST:**
   ```typescript
   await apiClient.get('/sanctum/csrf-cookie');
   ```
   This triggers Laravel to set the `XSRF-TOKEN` cookie.

2. **Login POST:**
   ```typescript
   await apiClient.post(API_ROUTES.auth.login(), credentials);
   ```
   Axios automatically includes the XSRF-TOKEN in the `X-XSRF-TOKEN` header.

3. **Session establishment:**
   - On success, Laravel sets `ecommerce_session` cookie (httpOnly)
   - Subsequent requests include this cookie via `withCredentials: true`

---

## Locale Routing + Auth Integration

The middleware handles both concerns:

```
Request → Middleware
    │
    ├─→ Is public route? (login, logout, _next, api, favicon)
    │       └─→ Run i18n middleware only
    │
    ├─→ Has ecommerce_session cookie?
    │       ├─→ No: Redirect to /{locale}/login?redirect={pathname}
    │       └─→ Yes: Run i18n middleware
    │
    └─→ i18n middleware handles locale detection/redirection
```

**Locale preservation:**
- When redirecting unauthenticated users, the locale is extracted from pathname
- Redirect URL: `/{locale}/login?redirect={originalPathname}`
- Example: `/en/stores/1/dashboard` → `/en/login?redirect=/en/stores/1/dashboard`

---

## Edge Cases Handled

| Case | Handling |
|------|----------|
| User already logged in visits /login | Page checks cookie, redirects to `/` |
| User has no store assigned | Shows error toast, does not redirect |
| Network error during login | Normalized to `NETWORK_ERROR`, toast shown |
| Validation errors from API | Field errors displayed under inputs + toast |
| Session expires mid-use | Axios dispatches `auth:unauthorized` event |
| Double-click submit | Button disabled during `isPending` state |
| RTL locale | Layout dir set to `rtl` for Arabic |

---

## Assumptions About Backend API

1. **Login endpoint** (`POST /api/v1/login`):
   - Accepts `{ email, password }`
   - Returns `{ user: AdminUser, message: string }`
   - Sets `ecommerce_session` and `XSRF-TOKEN` cookies on success

2. **CSRF endpoint** (`GET /sanctum/csrf-cookie`):
   - Returns 204 No Content
   - Sets `XSRF-TOKEN` cookie

3. **Validation errors** (422):
   - Response shape: `{ message: string, errors: Record<string, string[]> }`

4. **Auth check** (`GET /api/v1/me`):
   - Returns `{ data: AdminUser, message: string }`
   - Returns 401 if not authenticated

---

## What F.4 (Admin Layout) Will Need

From these files, the admin layout will need:

1. **Auth state:**
   - `useAuthStore` to check if user is authenticated
   - `selectUser` to get user info for sidebar/header
   - `selectCan` for permission-based UI elements

2. **Routing:**
   - `ROUTES.store(storeId)` for navigation
   - URL params for `storeId` (from `[storeId]` dynamic segment)

3. **Translations:**
   - New translation namespaces for dashboard, products, orders, users

4. **API functions:**
   - Dashboard stats, products list, orders list, users list
   - All following the same pattern as `src/lib/api/auth.ts`

5. **Providers:**
   - Already in place via root layout
   - May need additional context for current store

6. **Middleware:**
   - Already protects `/stores/*` routes
   - Will need to handle store access permissions

---

## Hard Rules Verification

| Rule | Status |
|------|--------|
| NO any type | ✅ All types explicit |
| NO hardcoded colors | ✅ Token classes only |
| NO hardcoded text | ✅ All via `t()` |
| NO hardcoded URLs | ✅ ROUTES config only |
| NO magic strings | ✅ Config constants only |
| NO localStorage for auth | ✅ httpOnly cookies only |
| NO console.log | ✅ logger utility only |
| NO alert() | ✅ Toast (sonner) only |
| NO div buttons | ✅ Semantic HTML only |
| NO double submissions | ✅ Disabled on first submit |
| NO useEffect for fetching | ✅ Not used |
| NO navigation in hooks | ✅ router.push in component only |
| NO toast in hooks | ✅ toast in component only |
| NO raw Axios errors | ✅ normalizeError() always |
| NO inline query keys | ✅ queryKeys factory always |

---

## Next Steps (F.4 Admin Layout)

1. Create admin shell layout with sidebar, header, main content area
2. Implement store switcher (for users with multiple stores)
3. Build dashboard stats cards
4. Add recent orders table
5. Add top products chart
6. Implement breadcrumb navigation
7. Add user menu dropdown with logout
