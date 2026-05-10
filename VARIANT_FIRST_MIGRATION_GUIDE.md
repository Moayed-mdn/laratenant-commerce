# Variant-First Migration Guide

## Overview

This document describes the migration from a **hybrid product+variant architecture** to a **strict variant-first architecture** for the Next.js admin dashboard.

### Architecture Principles

1. **variants[]** is the PRIMARY source of truth for all inventory, pricing, and SKU data
2. **display_variant** is the explicit default variant (replaces implicit "first variant" logic)
3. **flattened product fields** (price, sku, quantity, etc.) are deprecated compatibility fallbacks
4. **Backend IDs** are the only reliable variant identity (not frontend-generated keys)

---

## Changes Made

### 1. Type Definitions (`src/types/product.ts`)

#### AdminProduct Interface
Added new fields:
```typescript
/** NEW: Explicit default variant for variant-first architecture */
display_variant?: ProductVariant | null;

/** NEW: Aggregate stock across all variants */
total_stock?: number;
```

Deprecated fields marked with JSDoc `@deprecated` tags:
- `price`
- `compare_at_price`
- `cost_per_item`
- `sku`
- `barcode`
- `quantity`
- `track_quantity`
- `weight`
- `weight_unit`

#### ProductDetailView Interface
Reorganized to prioritize variant-first fields:
```typescript
// PRIMARY fields (variant-first)
variants: ProductVariant[];
display_variant?: ProductVariant | null;
total_stock?: number;

// DEPRECATED fields (compatibility only)
/** @deprecated Use display_variant instead */
price: number;
/** @deprecated Use display_variant instead */
compareAtPrice: number | null;
// ... etc
```

#### ProductVariantInput Interface
Made `key` field optional and deprecated:
```typescript
/** 
 * @deprecated Use `id` for identity. 
 * This key field is frontend-only and may be removed in future versions.
 */
key?: string;
```

#### ProductUpdatePayload Interface
Added new field:
```typescript
/** NEW: Explicit default variant ID for variant-first architecture */
display_variant_id?: number | null;
```

All flattened fields marked as `@deprecated`.

---

### 2. DTO Layer (`src/lib/mappers/product.dto.ts`)

**NEW FILE** - Centralized data transformation layer.

#### Key Functions

##### `mapApiProductToViewModel(raw: AdminProduct): ProductDetailView`
Maps raw API response to frontend view model. Preserves deprecated fields for backward compatibility.

##### `mapViewModelToPayload(viewModel, variants, primaryVariantId?): ProductUpdatePayload`
Creates variant-first API payload:
- Primary: `variants` array
- Explicit: `display_variant_id`
- Compatibility: flattened fields extracted from primary variant

##### `initializeVariantsFromProduct(product: ProductDetailView): ProductVariantInput[]`
Initializes form variants with proper priority:
1. `product.variants` if available
2. `product.display_variant` if available
3. Synthetic variant from deprecated fields (TEMPORARY)

##### `getPrimaryVariantId(product: ProductDetailView): number | undefined`
Returns the explicit default variant ID:
1. `display_variant.id` if available
2. First variant's `id` if variants exist
3. `undefined` otherwise

##### `mapVariantToInput(variant, index): ProductVariantInput`
Maps backend `ProductVariant` to form input type.

##### `createCompatibilityFallbackVariant(product): ProductVariantInput`
**TEMPORARY** - Creates synthetic "Default" variant from deprecated flattened fields. Will be removed in v2.0.

---

### 3. EditProductForm Component Refactor

#### Before (Old Pattern)
```typescript
// Inline variant initialization with mixed logic
const [structure, setStructure] = useState({
  variants: product.variants.length > 0
    ? product.variants.map((variant, idx) => ({ /* inline mapping */ }))
    : [{
        key: 'default',
        label: 'Default',
        sku: product.sku ?? null,  // Uses deprecated fields
        price: product.price ?? 0,  // Uses deprecated fields
        // ...
      }],
});
```

#### After (New Pattern)
```typescript
// Use DTO mapper for clean variant-first initialization
const [structure, setStructure] = useState({
  variants: initializeVariantsFromProduct(product),
  // Priority: variants -> display_variant -> deprecated fallback
});

// Get explicit default variant ID
const primaryVariantId = useMemo(
  () => getPrimaryVariantId(product),
  [product]
);

// Submit with variant-first payload
const handleSubmit = () => {
  mutation.mutate({
    variants: structure.variants,
    display_variant_id: primaryVariantId ?? structure.variants[0]?.id ?? null,
    // Flattened fields included only for backward compatibility
    price: structure.variants[0]?.price ?? 0,
    // ...
  });
};
```

#### Benefits
- **Cleaner code**: Removed 50+ lines of inline mapping logic
- **Correct priority**: Properly respects `display_variant` when available
- **Migration-safe**: Maintains backward compatibility during transition
- **Centralized logic**: All transformation logic in DTO layer

---

## Migration Phases

### Phase 1: Foundation (CURRENT)
- [x] Add `display_variant` support to types
- [x] Create DTO mapper layer
- [x] Refactor `EditProductForm` to use DTO
- [x] Maintain backward compatibility

### Phase 2: Backend Coordination (NEXT)
- [ ] Backend adds `display_variant` to API responses
- [ ] Backend accepts `display_variant_id` in update payloads
- [ ] Backend begins ignoring flattened fields in favor of variants array

### Phase 3: Frontend Cleanup (FUTURE)
- [ ] Remove `createCompatibilityFallbackVariant()` function
- [ ] Remove flattened field extraction from `mapViewModelToPayload()`
- [ ] Remove deprecated fields from `ProductUpdatePayload` interface
- [ ] Update `ProductDetailView` to make deprecated fields optional

### Phase 4: Complete Migration (v2.0)
- [ ] Backend removes flattened fields entirely
- [ ] Frontend removes all deprecated field usage
- [ ] `display_variant` becomes required for products without variants

---

## Backward Compatibility Notes

### Current Behavior
The system currently supports THREE data states:

1. **Products with variants** (preferred)
   - Uses `product.variants` array
   - No fallback needed

2. **Products with display_variant only** (transition state)
   - Uses `product.display_variant`
   - Single variant initialized from explicit default

3. **Products with deprecated flattened fields only** (legacy)
   - Creates synthetic "Default" variant
   - **TEMPORARY** - will be removed in v2.0

### Breaking Changes Timeline

| Version | Change | Impact |
|---------|--------|--------|
| Current | Add `display_variant` support | None - additive change |
| v1.x | Backend ignores flattened fields | Low - frontend still sends them |
| v2.0 | Remove flattened fields from API | **HIGH** - requires frontend update |
| v2.0 | Remove compatibility fallback | Medium - products without variants break |

### Mitigation Strategy
1. Monitor backend API version before removing compatibility code
2. Add runtime checks for `display_variant` availability
3. Provide clear error messages if legacy products are encountered after v2.0

---

## TODO Comments for Future Removal

Search for these comments in the codebase to identify temporary compatibility logic:

```typescript
// TODO: Remove this fallback when backend guarantees display_variant (v2.0)
// TODO: Remove these fields when backend v2.0 is deployed.
```

Files containing TODOs:
- `src/lib/mappers/product.dto.ts` - `createCompatibilityFallbackVariant()`
- `src/lib/mappers/product.dto.ts` - `mapViewModelToPayload()` flattened fields
- `src/app/.../EditProductForm.tsx` - handleSubmit flattened fields

---

## Testing Checklist

### Unit Tests Needed
- [ ] `initializeVariantsFromProduct()` with variants present
- [ ] `initializeVariantsFromProduct()` with only `display_variant`
- [ ] `initializeVariantsFromProduct()` with only deprecated fields
- [ ] `getPrimaryVariantId()` priority order
- [ ] `mapViewModelToPayload()` includes `display_variant_id`
- [ ] `mapViewModelToPayload()` excludes `key` field from variants

### Integration Tests Needed
- [ ] Edit product with existing variants
- [ ] Edit product with only `display_variant`
- [ ] Edit legacy product (no variants, no `display_variant`)
- [ ] Save creates correct API payload
- [ ] Backend response correctly mapped to view model

### Manual Testing
- [ ] Products with multiple variants display correctly
- [ ] Default variant properly identified
- [ ] Variant edits persist correctly
- [ ] New variants can be added
- [ ] Variants can be deleted
- [ ] Form dirty state works correctly

---

## Developer Guidelines

### DO
- Use `initializeVariantsFromProduct()` for variant initialization
- Use `getPrimaryVariantId()` to identify default variant
- Use `display_variant_id` in API payloads
- Reference variants by backend `id`, not frontend `key`
- Mark deprecated field usage with TODO comments

### DON'T
- Access `product.price`, `product.sku`, etc. directly in components
- Create synthetic variants manually (use DTO mapper)
- Use `key` field for variant identity (use `id`)
- Remove backward compatibility until v2.0
- Assume all products have variants (handle legacy cases)

---

## API Contract

### Request (Product Update)
```json
{
  "translations": { ... },
  "status": "active",
  "variants": [
    {
      "id": 123,
      "sku": "SKU-001",
      "price": 29.99,
      "quantity": 100,
      "attributes": [...]
    }
  ],
  "options": [...],
  "images": [...],
  "display_variant_id": 123,
  
  // DEPRECATED - kept for backward compatibility
  "price": 29.99,
  "sku": "SKU-001",
  "quantity": 100
}
```

### Response (Product Detail)
```json
{
  "id": 456,
  "status": "active",
  "variants": [...],
  "display_variant": {
    "id": 123,
    "sku": "SKU-001",
    "price": 29.99
  },
  "total_stock": 500,
  "translations": { ... },
  
  // DEPRECATED - will be removed in v2.0
  "price": 29.99,
  "sku": "SKU-001",
  "quantity": 100
}
```

---

## Related Files

- `src/types/product.ts` - Type definitions
- `src/lib/mappers/product.dto.ts` - DTO layer (NEW)
- `src/lib/mappers/products.ts` - Legacy mappers (deprecated)
- `src/app/[locale]/(admin)/stores/[storeId]/products/[productId]/_components/EditProductForm.tsx` - Main form component

---

## Questions?

Contact the frontend architecture team or refer to the main audit document at `frontend-architecture-audit.md`.
