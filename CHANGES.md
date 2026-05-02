# Frontend Types Update Summary

This document summarizes the changes made to frontend TypeScript types to match the backend contract.

## Changes Made

### 1. src/types/user.ts

**UserListItem interface** - Added missing fields:
- `is_active: boolean`
- `deleted_at: string | null`

**UserDetail interface** - Added missing fields:
- `phone: string | null`
- `is_active: boolean`
- `deleted_at: string | null`
- `orders_count: number`

### 2. src/types/order.ts

**AdminOrder interface** - Added missing fields:
- `discount_amount: number`
- `items_count: number`

### 3. src/types/dashboard.ts

**RecentOrderItem interface** - No changes required. The existing interface already matches the backend contract exactly as specified in the task.

### 4. src/types/product.ts

**ProductVariant interface** - Added new interface:
```typescript
export interface ProductVariant {
  id: number;
  sku: string | null;
  price: number;
  quantity: number;
  is_active: boolean;
  manufacture_date: string | null;
  expiry_date: string | null;
  attributes: { name: string; value: string }[];
}
```

**AdminProduct interface** - Added missing fields:
- `variants: ProductVariant[]`
- `category_id: number | null`
- `brand_id: number | null`

### 5. src/types/store.ts

**UserStore interface** - Added new interface (returned after login):
```typescript
export interface UserStore {
  id: number;
  name: string;
  slug: string;
  role: 'store_admin' | 'staff' | 'super_admin';
}
```

## Files Not Modified

The following type files were not modified as per the task requirements:
- `src/types/api.ts`

## Verification

All changes align with the backend's variant-based product model and the API response shapes.
