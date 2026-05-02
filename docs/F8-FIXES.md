# F.8 Fixes Documentation

## Summary

This document records all fixes applied to the F.8 orders feature files after verification and correction.

---

## 1. Dashboard OrderStatusBadge Verification Result

**File:** `src/app/[locale]/(admin)/stores/[storeId]/dashboard/_components/OrderStatusBadge.tsx`

**Check Required:**
- Must use `getTranslations` from 'next-intl/server' (async RSC)
- Must NOT use `useTranslations` (client hook)

**Verification Result:** ✅ **VERIFIED CORRECT**

The dashboard OrderStatusBadge component was already correctly implemented:
- Uses `import { getTranslations } from 'next-intl/server';`
- Is an async function component (`export async function OrderStatusBadge`)
- Does NOT import or use `useTranslations` from 'next-intl'
- Contains comment: `// RSC ONLY — do not import from client components`

**No changes required.** This component is separate from the orders feature OrderStatusBadge which is a client component.

---

## 2. Mapper Field Name Fixes

**File:** `src/lib/mappers/orders.ts`

**Check Required:**
- `raw.tax_amount` → `raw.tax`
- `raw.shipping_cost` → `raw.shipping`

**Verification Result:** ✅ **ALREADY CORRECT**

The mapper file was already using correct field names matching the `AdminOrder` type:

```typescript
// Current (correct) implementation:
tax: formatCurrency(raw.tax, currency),
shipping: formatCurrency(raw.shipping, currency),
```

**No changes required.** The field names already match the `AdminOrder` type definition in `src/types/order.ts`.

---

## 3. Line Item Total Fix

**File:** `src/lib/mappers/orders.ts`

**Check Required:**
- Change `formatCurrency(raw.price * raw.quantity, currency)` 
- To `formatCurrency(raw.total, currency)`

**Verification Result:** ✅ **ALREADY CORRECT**

The `mapOrderLineItem` function was already using the correct approach:

```typescript
// Current (correct) implementation:
export function mapOrderLineItem(
  raw: OrderLineItem,
  currency: string = 'USD'
): OrderLineItemView {
  return {
    id: raw.id,
    productId: raw.product_id,
    productName: raw.product_name,
    sku: raw.sku,
    quantity: raw.quantity,
    price: formatCurrency(raw.price, currency),
    total: formatCurrency(raw.total, currency), // Already uses raw.total directly
  };
}
```

**No changes required.** The function already uses `raw.total` directly instead of recalculating.

---

## 4. payment_status Key Consistency Verification

**File:** `src/app/[locale]/(admin)/stores/[storeId]/orders/_components/OrdersContent.tsx`

**Check Required:**
- nuqs key must be `'payment_status'` (with underscore)
- OrderFiltersSchema field must be `'payment_status'` (with underscore)
- API param sent must be `'payment_status'` (with underscore)

**Verification Result:** ✅ **VERIFIED CONSISTENT**

All three locations consistently use `'payment_status'` with underscore:

1. **nuqs key (line 41-43):**
   ```typescript
   const [paymentStatus, setPaymentStatus] = useQueryState(
     'payment_status',  // ✅ underscore
     parseAsStringLiteral(paymentStatusOptions)...
   );
   ```

2. **OrderFiltersSchema reference (line 12):**
   ```typescript
   import type { OrderFilters as OrderFiltersType } from '@/schemas/orders';
   // Schema defines: payment_status: z.enum([...]).default('all')
   ```

3. **Filters object (line 55):**
   ```typescript
   const filters: OrderFiltersType = {
     ...
     payment_status: paymentStatus as 'all' | 'pending' | 'paid' | 'failed' | 'refunded',
   };
   ```

4. **API call (via useOrders hook):**
   The hook sends filters directly to `getOrders()` which builds params with `payment_status`.

**No changes required.** All keys are consistent.

---

## 5. Skeleton RSC Conversion Results

### OrdersSkeleton.tsx

**File:** `src/app/[locale]/(admin)/stores/[storeId]/orders/_components/OrdersSkeleton.tsx`

**Check Required:** Must be RSC (no `'use client'`)

**Verification Result:** ✅ **ALREADY CORRECT**

The file starts with:
```typescript
/**
 * Orders skeleton loader.
 * Pure display component - RSC (no 'use client')
 */

import { Skeleton } from '@/components/ui/skeleton';
// No 'use client' directive present
```

**No changes required.**

### OrderDetailSkeleton.tsx

**File:** `src/app/[locale]/(admin)/stores/[storeId]/orders/[orderId]/_components/OrderDetailSkeleton.tsx`

**Check Required:** Must be RSC (no `'use client'`)

**Action Taken:** ✅ **CREATED AS RSC**

This file was missing from the original implementation. Created as a pure RSC:

```typescript
/**
 * Order detail skeleton loader.
 * Pure display component - RSC (no 'use client')
 */

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function OrderDetailSkeleton() {
  // Pure display component - no 'use client'
  ...
}
```

**Result:** Both skeleton components are now RSC-only.

---

## 6. nuqs Version and Parser API Fix

**File:** `src/app/[locale]/(admin)/stores/[storeId]/orders/_components/OrdersContent.tsx`

**Check Required:**
- Check package.json for nuqs version
- If v2+: use `parseAsStringLiteral` with `as const`
- If v1.x: `parseAsStringEnum` is correct

**Verification Result:** ✅ **FIX APPLIED**

**Version Found:** `nuqs@^2.8.9` (v2+)

**Before (incorrect for v2+):**
```typescript
import { parseAsString, parseAsInteger } from 'nuqs/parsers';

const [status, setStatus] = useQueryState(
  'status',
  parseAsString.withDefault(initialFilters.status)
);
const [paymentStatus, setPaymentStatus] = useQueryState(
  'payment_status',
  parseAsString.withDefault(initialFilters.payment_status)
);
```

**After (correct for v2+):**
```typescript
import { useQueryState, parseAsString, parseAsInteger, parseAsStringLiteral } from 'nuqs';

// Status options as const arrays for parseAsStringLiteral
const statusOptions = ['all', 'pending', 'confirmed', 'cancelled', 'refunded'] as const;
const paymentStatusOptions = ['all', 'pending', 'paid', 'failed', 'refunded'] as const;

const [status, setStatus] = useQueryState(
  'status',
  parseAsStringLiteral(statusOptions).withDefault(initialFilters.status as typeof statusOptions[number])
);
const [paymentStatus, setPaymentStatus] = useQueryState(
  'payment_status',
  parseAsStringLiteral(paymentStatusOptions).withDefault(initialFilters.payment_status as typeof paymentStatusOptions[number])
);
```

**Changes Made:**
1. Updated import to include `parseAsStringLiteral` from 'nuqs' (not 'nuqs/parsers')
2. Defined `statusOptions` and `paymentStatusOptions` as `const` arrays with `as const`
3. Changed from `parseAsString` to `parseAsStringLiteral(options)` for type-safe enum parsing
4. Added proper type casting with `typeof options[number]`

---

## Summary Table

| # | Check | Status | Action Required |
|---|-------|--------|-----------------|
| 1 | Dashboard OrderStatusBadge uses `getTranslations` | ✅ Pass | None |
| 2 | mapOrderDetail uses `raw.tax` and `raw.shipping` | ✅ Pass | None |
| 3 | mapOrderLineItem uses `raw.total` | ✅ Pass | None |
| 4 | `payment_status` key consistency | ✅ Pass | None |
| 5 | Skeleton components are RSC | ✅ Pass | Created missing OrderDetailSkeleton.tsx |
| 6 | nuqs v2+ uses `parseAsStringLiteral` | ✅ Fixed | Updated OrdersContent.tsx |

---

## Files Modified

1. **Created:** `src/app/[locale]/(admin)/stores/[storeId]/orders/[orderId]/_components/OrderDetailSkeleton.tsx`
   - New RSC skeleton component for order detail page

2. **Modified:** `src/app/[locale]/(admin)/stores/[storeId]/orders/_components/OrdersContent.tsx`
   - Updated nuqs imports to use `parseAsStringLiteral`
   - Added const arrays for status options
   - Changed parser from `parseAsString` to `parseAsStringLiteral` for status and payment_status

---

## Architecture Notes

### Two OrderStatusBadge Components

The codebase contains two separate `OrderStatusBadge` components serving different contexts:

1. **Dashboard Badge** (`src/app/[locale]/(admin)/stores/[storeId]/dashboard/_components/OrderStatusBadge.tsx`)
   - Async RSC
   - Uses `getTranslations` from 'next-intl/server'
   - Used in server-rendered dashboard tables

2. **Orders Badge** (`src/app/[locale]/(admin)/stores/[storeId]/orders/_components/OrderStatusBadge.tsx`)
   - Client component ('use client')
   - Uses `useTranslations` from 'next-intl'
   - Used in client-side orders table with interactive features

These components coexist without conflict because they serve different rendering contexts.

### PaymentStatusBadge Success Styling

The `PaymentStatusBadge` component applies success styling for 'paid' status without creating a new Badge variant:

```typescript
if (status === 'paid') {
  return (
    <Badge variant="outline" className="border-success text-success">
      {t('paymentStatus.paid')}
    </Badge>
  );
}
```

This approach uses CSS class override instead of extending the variant system.

---

## Session Handoff

**Complete:**
- ✅ All 6 verification checks passed or fixed
- ✅ OrderDetailSkeleton.tsx created
- ✅ OrdersContent.tsx updated for nuqs v2+
- ✅ Documentation written to docs/F8-FIXES.md

**Remains:**
- Future enhancements (export, bulk actions, advanced filters)
- Integration testing
- E2E tests for order status updates
