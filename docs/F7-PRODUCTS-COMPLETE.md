# F7 — Products Management Complete

**Date:** 2026-05-02
**Scope:** Products list, create product, and edit product pages

---

## Summary

Built a complete product management system for the multi-store e-commerce admin dashboard. The implementation follows all hard rules established in the project foundation.

---

## Files Created/Modified

### Types
- `src/types/product.ts` — Extended with:
  - `ProductListItemView` — mapped for list UI
  - `ProductDetailView` — mapped for edit form
  - `ProductCreatePayload` — API create body
  - `ProductUpdatePayload` — API update body

### Schemas
- `src/schemas/products.ts` — Zod schemas:
  - `ProductFiltersSchema` — URL param validation
  - `ProductFormSchema` — form validation
  - Types: `ProductFilters`, `ProductFormData`

### Mappers
- `src/lib/mappers/products.ts` — Data transformation:
  - `mapProductListItem()` — formats currency, gets first image
  - `mapProductDetail()` — camelCase transformation for form

### API
- `src/lib/api/products.ts` — API functions:
  - `getProducts()` — list with filters
  - `getProductDetail()` — single product
  - `createProduct()` — POST
  - `updateProduct()` — PATCH
  - `deleteProduct()` — DELETE

### Hooks
- `src/hooks/products/useProducts.ts` — list query
- `src/hooks/products/useProductDetail.ts` — detail query
- `src/hooks/products/useCreateProduct.ts` — create mutation
- `src/hooks/products/useUpdateProduct.ts` — update mutation
- `src/hooks/products/useDeleteProduct.ts` — delete mutation

### Pages & Components

**Products List:**
- `src/app/[locale]/(admin)/stores/[storeId]/products/page.tsx` — RSC with Suspense
- `_components/ProductsContent.tsx` — client, nuqs state + debounce
- `_components/ProductsTable.tsx` — table with pagination
- `_components/ProductFilters.tsx` — search + status filter
- `_components/ProductStatusBadge.tsx` — badge with variants
- `_components/ProductsSkeleton.tsx` — loading state

**Create Product:**
- `src/app/[locale]/(admin)/stores/[storeId]/products/new/page.tsx` — RSC
- `_components/CreateProductForm.tsx` — client form

**Edit Product:**
- `src/app/[locale]/(admin)/stores/[storeId]/products/[productId]/page.tsx` — RSC with Suspense
- `_components/EditProductContent.tsx` — async RSC, fetches data
- `_components/EditProductForm.tsx` — client form with mutations
- `_components/DeleteProductButton.tsx` — delete with confirmation
- `_components/EditProductSkeleton.tsx` — loading state

### Shared Form Components
- `src/components/shared/ProductForm.tsx` — main form component (~145 lines)
- `src/components/shared/product-form/ProductFormBasic.tsx` — name, description
- `src/components/shared/product-form/ProductFormPricing.tsx` — price fields
- `src/components/shared/product-form/ProductFormInventory.tsx` — SKU, quantity
- `src/components/shared/product-form/ProductFormShipping.tsx` — weight fields

### UI Components
- `src/components/ui/textarea.tsx` — created for form

### Translations
- `src/locales/en/common.json` — added `products` namespace
- `src/locales/ar/common.json` — added `products` namespace (Arabic)

---

## Architecture Decisions

### 1. Shared ProductForm Component

Both create and edit use the same `ProductForm` component with a `mode` prop:

```tsx
// Create
<ProductForm mode="create" onSubmit={handleCreate} isPending={false} storeId={storeId} />

// Edit
<ProductForm mode="edit" initialData={product} onSubmit={handleUpdate} isPending={false} storeId={storeId} />
```

**Benefits:**
- Single source of truth for form structure
- Consistent validation across create/edit
- Easier maintenance

### 2. React Hook Form Default Values

Default values are computed differently for create vs edit:

```tsx
const defaultValues = {
  name: initialData?.name ?? '',
  price: initialData?.price ?? 0,
  status: initialData?.status ?? 'draft',
  // ... all fields with fallbacks
};
```

Create gets empty defaults, edit gets mapped product data.

### 3. Form Split Pattern

ProductForm is split into 4 section components to stay under 250 lines:
- `ProductFormBasic` — name, description
- `ProductFormPricing` — price, compare_at_price, cost_per_item
- `ProductFormInventory` — sku, barcode, quantity, track_quantity
- `ProductFormShipping` — weight, weight_unit

Each section receives `control` and `errors` from RHF.

---

## Image Placeholders

ProductsTable shows:
- Actual image: Next.js `Image` component with `object-cover`
- Placeholder: `div` with `bg-muted` class when no image

```tsx
{product.firstImage ? (
  <div className="relative h-10 w-10 overflow-hidden rounded">
    <Image src={product.firstImage} alt={product.name} fill sizes="40px" className="object-cover" />
  </div>
) : (
  <div className="h-10 w-10 rounded bg-muted" />
)}
```

---

## ProductStatusBadge Pattern

**Learned from F.6 fix:** This component is a client component because it's used inside `ProductsTable` (a client component). Do NOT make it an async RSC.

```tsx
'use client';
// Reason: used inside ProductsTable client component

export function ProductStatusBadge({ status }: Props) {
  const t = useTranslations('dashboard');
  return <Badge variant={variantMap[status]}>{t(`productStatus.${status}`)}</Badge>;
}
```

---

## Client-Side Validation

Zod schema validates:
- `name`: required, max 255 chars
- `price`: number, min 0
- `quantity`: integer, min 0
- `status`: enum ('active', 'draft', 'archived')
- Optional fields: compare_at_price, cost_per_item, sku, barcode, weight

RHF displays field-level errors under inputs.

---

## What F.8 (Orders) Will Need

Based on this products implementation, orders will need:

1. **Types** (`src/types/order.ts`):
   - `Order`, `OrderItem`, `OrderStatus`, `PaymentStatus`
   - `OrderListItemView`, `OrderDetailView`
   - `OrderUpdatePayload` (status changes)

2. **Schema** (`src/schemas/orders.ts`):
   - `OrderFiltersSchema` — date range, status, payment status
   - No form schema needed (orders are not created manually)

3. **Mappers** (`src/lib/mappers/orders.ts`):
   - `mapOrderListItem()` — format total, status badges
   - `mapOrderDetail()` — for detail view

4. **API** (`src/lib/api/orders.ts`):
   - `getOrders()`, `getOrderDetail()`
   - `updateOrderStatus()` — PATCH status only

5. **Hooks**:
   - `useOrders`, `useOrderDetail`
   - `useUpdateOrderStatus`

6. **Pages**:
   - List page with date filters
   - Detail page with status change UI
   - No create page (orders come from storefront)

7. **Components**:
   - `OrderStatusBadge`, `PaymentStatusBadge`
   - `OrderItemsTable` — list of items in order
   - `OrderTimeline` — status history (optional)

---

## Hard Rules Compliance

| Rule | Implementation |
|------|------------------|
| NO any type | Strict TypeScript throughout |
| NO hardcoded colors | Token classes only (bg-muted, text-destructive) |
| NO hardcoded text | All via `t()` from next-intl |
| NO hardcoded URLs | `ROUTES` and `API_ROUTES` from config |
| NO magic strings | Config constants only |
| NO console.log | `logger` from lib/logger |
| NO alert() | `toast` from sonner |
| NO div buttons | Semantic `<button>` via shadcn Button |
| NO fat components | ProductForm split into 4 sections |
| NO client component without reason | Documented in each 'use client' |
| NO API calls in components | Hooks only |
| NO useEffect for data | RSC + TanStack Query only |
| NO raw API types | Mappers always used |
| NO inline query keys | `queryKeys.products(storeId)` factory |
| NO Zustand for storeId | URL params source of truth |
| NO inline date formatting | `formatDate` utility |
| NO hidden filter state | URL sync via nuqs |
| NO untyped query params | Zod filter schemas |
| NO undebounced search | 300ms debounce |
| NO non-debounced in query keys | Only debounced values |
| NO unvalidated uploads | N/A for products (no upload in form) |
| NO unsanitized HTML | Description is plain text (no rich editor yet) |
| NO double submissions | `disabled={isPending}` on buttons |
| NO navigation in hooks | `router.push` in component layer |
| NO toast in hooks | Toast in component layer only |

---

## Next Steps

1. Test the products flow end-to-end with the Laravel backend
2. Add product image upload (separate feature)
3. Implement orders (F.8) following this patterns
4. Consider adding product categories/tags
