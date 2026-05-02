# F.5 Dashboard Fixes Report

## Date: 2025-05-02

This document reports on the specific fixes applied to the F.5 dashboard implementation.

---

## 1. CSS Token: `--color-success-foreground`

### Status: **ADDED**

The `--color-success-foreground` token was **NOT** present in the original `globals.css` and was added to both the light and dark mode theme blocks.

### Changes Made

**File:** `src/app/globals.css`

**Light mode (`@theme inline {}` block):**
```css
--color-success: hsl(142 71% 45%);
--color-success-foreground: hsl(0 0% 100%);  /* ← ADDED */
--color-success-bg: hsl(142 71% 95%);
```

**Dark mode (`.dark {}` block):**
```css
--color-success-bg: hsl(142 71% 10%);
--color-success-foreground: hsl(0 0% 100%);  /* ← ADDED */
```

### Purpose

This token provides a consistent foreground color for success-themed UI elements (e.g., buttons, badges with success background). It ensures text remains readable on success-colored backgrounds in both light and dark modes.

---

## 2. OrderStatusBadge.tsx: RSC Comment

### Status: **ADDED**

**File:** `src/app/[locale]/(admin)/stores/[storeId]/dashboard/_components/OrderStatusBadge.tsx`

**Comment added after imports:**
```tsx
// RSC ONLY — do not import from client components
// Reason: uses getTranslations from next-intl/server (async RSC)
```

### Purpose

This comment documents why `OrderStatusBadge` must remain a server component:
- It uses `getTranslations` from `next-intl/server`, which is an async function only available in RSC context
- Client components cannot import this directly; they must receive pre-translated props or use a client-side translation hook

---

## 3. Dashboard Hooks: TODO Comments for Currency

### Status: **ADDED TO ALL THREE HOOKS**

The following hooks now include the TODO comment above the currency line:

#### File: `src/hooks/dashboard/useDashboardStats.ts`
```tsx
export function useDashboardStats(storeId: string) {
  // TODO: storeStore currency defaults to 'USD' until store settings
  // endpoint is available. StoreInitializer will populate this later.
  const currency = useStoreStore(selectCurrentStoreCurrency);
  // ...
}
```

#### File: `src/hooks/dashboard/useRecentOrders.ts`
```tsx
export function useRecentOrders(storeId: string) {
  // TODO: storeStore currency defaults to 'USD' until store settings
  // endpoint is available. StoreInitializer will populate this later.
  const currency = useStoreStore(selectCurrentStoreCurrency);
  // ...
}
```

#### File: `src/hooks/dashboard/useTopProducts.ts`
```tsx
export function useTopProducts(storeId: string) {
  // TODO: storeStore currency defaults to 'USD' until store settings
  // endpoint is available. StoreInitializer will populate this later.
  const currency = useStoreStore(selectCurrentStoreCurrency);
  // ...
}
```

### Purpose

These comments document a known limitation:
- Currently, currency defaults to `'USD'` because there is no store settings endpoint yet
- Phase 2 will add a `GET /stores/{id}` endpoint and a `StoreInitializer` component to sync actual store currency to Zustand

---

## 4. Translation Keys: `productStatus`

### Status: **ADDED TO BOTH LOCALES**

**File:** `src/locales/en/common.json`
```json
"productStatus": {
  "active": "Active",
  "draft": "Draft",
  "archived": "Archived"
}
```

**File:** `src/locales/ar/common.json`
```json
"productStatus": {
  "active": "نشط",
  "draft": "مسودة",
  "archived": "مؤرشف"
}
```

### Purpose

These translations enable localized display of product status badges in the Top Products list and other product-related UI.

---

## 5. TopProductsList.tsx: Translated Product Status

### Status: **FIXED**

**File:** `src/app/[locale]/(admin)/stores/[storeId]/dashboard/_components/TopProductsList.tsx`

**Before:**
```tsx
<Badge variant="outline" className="text-xs">
  {product.status}
</Badge>
```

**After:**
```tsx
<Badge variant="outline" className="text-xs">
  {t(`productStatus.${product.status}`)}
</Badge>
```

### Verification

- The component already calls `const t = await getTranslations('dashboard')` at line 22
- The translation key pattern `productStatus.{status}` matches the newly added translation keys
- Works for all three status values: `active`, `draft`, `archived`

---

## 6. DashboardContent.tsx: Verification Results

**File:** `src/app/[locale]/(admin)/stores/[storeId]/dashboard/_components/DashboardContent.tsx`

### Checklist

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Async RSC (no 'use client') | ✅ PASS | No `'use client'` directive; function is `async` |
| Receives `{ storeId: string }` as props | ✅ PASS | Line 18-20: `interface DashboardContentProps { storeId: string; }` |
| Uses `Promise.all` for parallel fetching | ✅ PASS | Lines 30-40: `await Promise.all([statsRaw, recentOrdersRaw, topProductsRaw])` |
| Has try/catch with in-page error using `t('dashboard.error')` | ✅ PASS | Lines 63-77: catch block renders `<p>{t('error')}</p>` |
| Page.tsx renders it inside `<Suspense>` | ✅ PASS | Verified in `page.tsx` lines 37-39 |

### Additional Notes

- Import paths were corrected from `./_components/X` to `./X` since `DashboardContent` is already inside `_components/`
- Error state preserves page header (title + subtitle) for visual consistency
- Logger is used for error logging: `logger.error('[DashboardContent] Failed to fetch dashboard data', error)`

---

## Summary

All six requested fixes have been successfully applied:

1. ✅ `--color-success-foreground` token added to both light and dark mode
2. ✅ RSC comment added to `OrderStatusBadge.tsx`
3. ✅ TODO comments added to all three dashboard hooks
4. ✅ `productStatus` translations added to both English and Arabic locales
5. ✅ `TopProductsList.tsx` now uses translated product status
6. ✅ `DashboardContent.tsx` verified—all five requirements pass

The dashboard is now fully compliant with the hard rules and ready for Phase 2 enhancements.
