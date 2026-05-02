# F7 — Products Fixes Verification Report

**Date:** 2026-05-02

---

## 1. queryClient Import Verification (All 3 Hooks)

### Files Checked:
- `src/hooks/products/useCreateProduct.ts`
- `src/hooks/products/useUpdateProduct.ts`
- `src/hooks/products/useDeleteProduct.ts`

### Finding:
**ALL 3 HOOKS HAD WRONG IMPORT** — Used named import `{ queryClient }` instead of default import.

### Fix Applied:
Changed from:
```ts
import { queryClient } from '@/lib/queryClient';
```

To:
```ts
import queryClient from '@/lib/queryClient';
```

**Status: ✅ FIXED**

---

## 2. EditProductContent.tsx ServerFetch Verification

### File: `src/app/[locale]/(admin)/stores/[storeId]/products/[productId]/_components/EditProductContent.tsx`

### Verification:
- ✅ Imports `serverFetch` from `@/lib/api/server/client`
- ✅ Does NOT import `apiClient`
- ✅ Does NOT use `useProductDetail` hook (it's an RSC)

**Status: ✅ VERIFIED CORRECT**

---

## 3. new/page.tsx Verification

### File: `src/app/[locale]/(admin)/stores/[storeId]/products/new/page.tsx`

### Verification:
- ✅ Exports `generateMetadata` function
- ✅ Does NOT have 'use client' directive (RSC)
- ✅ Uses `getTranslations` from `next-intl/server`

**Status: ✅ VERIFIED CORRECT**

---

## 4. ProductForm.tsx Form Reset useEffect

### File: `src/components/shared/ProductForm.tsx`

### Finding:
**NEEDED ADDITION** — Form reset on initialData change was missing.

### Fix Applied:
Added after `useForm` call:

```tsx
// Documented useEffect exception: reset form when initialData changes
// Reason: same component reused across edit pages, needs re-initialization
useEffect(() => {
  if (initialData) {
    form.reset({
      name: initialData.name,
      description: initialData.description ?? '',
      price: initialData.price,
      compare_at_price: initialData.compareAtPrice ?? null,
      cost_per_item: initialData.costPerItem ?? null,
      sku: initialData.sku ?? null,
      barcode: initialData.barcode ?? null,
      quantity: initialData.quantity,
      track_quantity: initialData.trackQuantity,
      weight: initialData.weight ?? null,
      weight_unit: initialData.weightUnit ?? null,
      status: initialData.status,
    });
  }
}, [initialData, form]);
```

Also added imports:
```tsx
import { useEffect, useMemo } from 'react';
```

**Status: ✅ ADDED**

---

## 5. ProductForm.tsx Zod Schema with Translations

### File: `src/components/shared/ProductForm.tsx`

### Finding:
**NEEDED ADDITION** — Was using `ProductFormSchema` directly without translations.

### Fix Applied:
Created translated schema inside component using `useMemo`:

```tsx
// Translated schema for UI validation errors
const schema = useMemo(() => z.object({
  name: z.string().min(1, { message: t('form.errors.nameRequired') }).max(255),
  description: z.string().optional(),
  price: z.coerce.number().min(0, { message: t('form.errors.priceMin') }),
  compare_at_price: z.coerce.number().min(0).optional().nullable(),
  cost_per_item: z.coerce.number().min(0).optional().nullable(),
  sku: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  quantity: z.coerce.number().int().min(0, { message: t('form.errors.quantityMin') }),
  track_quantity: z.boolean().default(true),
  weight: z.coerce.number().min(0).optional().nullable(),
  weight_unit: z.enum(['kg', 'g', 'lb', 'oz']).optional().nullable(),
  status: z.enum(['active', 'draft', 'archived']).default('draft'),
}), [t]);
```

Updated resolver to use translated schema:
```tsx
const form = useForm({
  resolver: zodResolver(schema),
  defaultValues,
});
```

Added translation keys to `src/locales/en/common.json` and `src/locales/ar/common.json`:
```json
"errors": {
  "nameRequired": "Product name is required",
  "priceMin": "Price must be 0 or greater",
  "quantityMin": "Quantity must be 0 or greater"
}
```

**Status: ✅ ADDED**

---

## 6. DeleteProductButton Permission Check

### File: `src/app/[locale]/(admin)/stores/[storeId]/products/[productId]/_components/DeleteProductButton.tsx`

### Verification:
- ✅ Imports `useAuthStore` and `selectCan` from `@/stores/authStore`
- ✅ Has permission check at top of component:
  ```tsx
  const can = useAuthStore(selectCan);
  if (!can('canManageProducts')) return null;
  ```

**Status: ✅ VERIFIED CORRECT**

---

## 7. ProductFiltersSchema perPage Field

### File: `src/schemas/products.ts`

### Verification:
- ✅ `ProductFiltersSchema` includes `perPage` field:
  ```ts
  perPage: z.coerce.number().min(1).max(100).default(10)
  ```

**Status: ✅ VERIFIED CORRECT**

---

## Summary

| Check | Status |
|-------|--------|
| queryClient imports (3 hooks) | ✅ FIXED |
| EditProductContent serverFetch | ✅ VERIFIED |
| new/page.tsx generateMetadata | ✅ VERIFIED |
| ProductForm reset useEffect | ✅ ADDED |
| ProductForm translated schema | ✅ ADDED |
| DeleteProductButton permission | ✅ VERIFIED |
| ProductFiltersSchema perPage | ✅ VERIFIED |

---

## Pre-existing Type Issues (Non-blocking)

The following type issues exist due to React Hook Form + Zod v4 compatibility:

1. `Control` type mismatches in sub-components — using `Control<FieldValues>` vs inferred types
2. These are type-level warnings that don't affect runtime behavior
3. Known issue with strict TypeScript + RHF + Zod v4 combination

**Recommendation:** These can be addressed in a future refactor with explicit type annotations or by using `as` type assertions for the control prop.
