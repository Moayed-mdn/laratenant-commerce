# FRONTEND ARCHITECTURE AUDIT: Next.js + TypeScript Admin Dashboard
## Variant-First Compliance Audit for Laravel Multi-Tenant E-Commerce Platform

---

## 1. Critical Issues

### CRITICAL-001: Deprecated Flattened Product Fields Still Used Throughout

**Why it is dangerous:**
The frontend directly depends on `product.price`, `product.sku`, `product.quantity`, `product.compareAtPrice`, `product.costPerItem`, `product.weight`, and `product.trackQuantity` at the product level. These are deprecated compatibility fields that will be removed when the backend fully migrates to variant-first architecture. When the backend removes these fields, the entire edit form will break with undefined values.

**Exact code pattern:**
```typescript
// EditProductForm.tsx lines 77-84, 91-104
compare_at_price: variant.compare_at_price ?? product.compareAtPrice ?? null,
cost_price: variant.cost_price ?? product.costPerItem ?? null,
quantity: variant.quantity ?? 0,
track_inventory: variant.track_inventory ?? product.trackQuantity,
weight: variant.weight ?? product.weight ?? null,
weight_unit: variant.weight_unit ?? product.weightUnit ?? null,

// Fallback default variant uses deprecated fields (lines 91-103)
{
  key: 'default',
  label: 'Default',
  sku: product.sku ?? null,
  barcode: product.barcode ?? null,
  price: product.price ?? 0,
  compare_at_price: product.compareAtPrice ?? null,
  cost_price: product.costPerItem ?? null,
  quantity: product.quantity ?? 0,
  track_inventory: product.trackQuantity,
  weight: product.weight ?? null,
  weight_unit: product.weightUnit ?? null,
}
```

**Future backend break risk:** **CRITICAL** - When backend removes flattened fields, all fallback chains resolve to `undefined`, causing NaN prices, null SKUs, and broken variant initialization.

**Recommended fix:**
1. Introduce `display_variant` as the explicit default variant source
2. Remove all `product.*` fallbacks in variant initialization
3. Require at least one variant; if none exist, create from `display_variant`

```typescript
// NEW PATTERN
const defaultVariant = product.display_variant ?? {
  id: undefined,
  key: 'default',
  label: 'Default Variant',
  sku: null,
  barcode: null,
  price: 0,
  compare_at_price: null,
  cost_price: null,
  quantity: 0,
  track_inventory: true,
  is_active: true,
  weight: null,
  weight_unit: null,
  attributes: [],
};

const variants = product.variants.length > 0 
  ? product.variants.map(...) 
  : [defaultVariant];
```

**Migration safety notes:**
- Add `display_variant` to `ProductDetailView` type as optional first
- During migration, prefer `display_variant` over flattened fields
- Once backend guarantees `display_variant`, remove flattened field fallbacks entirely

---

### CRITICAL-002: Unsafe Variant Fallback Chain Creates Ghost Variants

**Why it is dangerous:**
When a product has no variants, the code creates a synthetic "Default" variant by copying deprecated product-level fields. This creates a mismatch between what the backend expects (explicit variants or `display_variant`) and what the frontend sends (synthetic variant with potentially stale data).

**Exact code pattern:**
```typescript
// EditProductForm.tsx lines 87-104
: [
    {
      key: 'default',
      label: 'Default',
      sku: product.sku ?? null,
      barcode: product.barcode ?? null,
      price: product.price ?? 0,
      // ... more deprecated fields
    },
  ]
```

**Future backend break risk:** **HIGH** - Backend may reject products without explicit variants or may not recognize the synthetic variant structure. The `key` field is frontend-only and may conflict with backend variant identity logic.

**Recommended fix:**
```typescript
// Use display_variant explicitly
const initialVariants = useMemo(() => {
  if (product.variants.length > 0) {
    return product.variants.map(mapToVariantInput);
  }
  if (product.display_variant) {
    return [mapToVariantInput(product.display_variant)];
  }
  // Only create empty default if absolutely necessary
  return [createEmptyVariant('default')];
}, [product.variants, product.display_variant]);
```

**Migration safety notes:**
- Backend should return `display_variant` explicitly before removing flattened fields
- Frontend must handle three states: has variants, has display_variant only, has neither

---

### CRITICAL-003: handleSubmit Sends Redundant Flattened Fields to Backend

**Why it is dangerous:**
The `handleSubmit` function extracts fields from the primary variant and sends them as top-level product fields (`price`, `sku`, `quantity`, etc.). This perpetuates the deprecated pattern and will cause API errors when the backend stops accepting these fields.

**Exact code pattern:**
```typescript
// EditProductForm.tsx lines 123-153
const handleSubmit = () => {
  const primaryVariant = structure.variants[0];
  mutation.mutate({
    translations: ...,
    status: structure.basics.status,
    variants: structure.variants,
    options: structure.options,
    images,
    // DEPRECATED - these should NOT be sent
    price: primaryVariant?.price ?? 0,
    compare_at_price: primaryVariant?.compare_at_price ?? null,
    cost_per_item: primaryVariant?.cost_price ?? null,
    sku: primaryVariant?.sku ?? null,
    barcode: primaryVariant?.barcode ?? null,
    quantity: primaryVariant?.quantity ?? 0,
    track_quantity: primaryVariant?.track_inventory ?? true,
    weight: primaryVariant?.weight ?? null,
    weight_unit: primaryVariant?.weight_unit ?? null,
  });
};
```

**Future backend break risk:** **CRITICAL** - When backend removes support for flattened fields in the update payload, these will either be ignored (silent data loss) or cause validation errors.

**Recommended fix:**
```typescript
const handleSubmit = () => {
  mutation.mutate({
    translations: Object.fromEntries(...),
    status: structure.basics.status,
    variants: structure.variants,  // Backend extracts everything from here
    options: structure.options,
    images,
    // DO NOT send flattened fields
    // If backend needs a "primary" variant, use display_variant_id
    display_variant_id: structure.variants[0]?.id ?? null,
  });
};
```

**Migration safety notes:**
- Coordinate with backend team on exact payload shape for new architecture
- Add feature flag to toggle between old and new payload formats
- Log both payloads during transition for debugging

---

### CRITICAL-004: Type Definitions Perpetuate Deprecated Field Usage

**Why it is dangerous:**
The `ProductDetailView` interface includes both deprecated flattened fields AND variant fields, creating confusion about which source of truth to use. This allows developers to accidentally use the wrong fields.

**Exact code pattern:**
```typescript
// types/product.ts lines 134-158
export interface ProductDetailView {
  id: number;
  storeId: number;
  name: string;
  slug: string;
  description: string;
  price: number;              // DEPRECATED
  compareAtPrice: number | null;  // DEPRECATED
  costPerItem: number | null;     // DEPRECATED
  sku: string | null;         // DEPRECATED
  barcode: string | null;     // DEPRECATED
  quantity: number;           // DEPRECATED
  trackQuantity: boolean;     // DEPRECATED
  weight: number | null;      // DEPRECATED
  weightUnit: WeightUnit | null; // DEPRECATED
  status: ProductStatus;
  images: ProductImage[];
  variants: ProductVariant[];  // CORRECT
  options: ProductOption[];
  availableLocales: Locale[];
  translations: Record<Locale, ProductTranslation>;
}
```

**Future backend break risk:** **HIGH** - Type system allows deprecated usage, providing no compile-time protection against using fields that will disappear.

**Recommended fix:**
```typescript
export interface ProductDetailView {
  id: number;
  storeId: number;
  name: string;
  slug: string;
  description: string;
  status: ProductStatus;
  images: ProductImage[];
  variants: ProductVariant[];
  display_variant?: ProductVariant;  // NEW - explicit default
  total_stock?: number;              // NEW - aggregate only
  options: ProductOption[];
  availableLocales: Locale[];
  translations: Record<Locale, ProductTranslation>;
  // Mark deprecated fields as optional with deprecation comments
  /** @deprecated Use display_variant instead */
  price?: number;
  /** @deprecated Use display_variant instead */
  sku?: string | null;
  // ... other deprecated fields as optional
}
```

**Migration safety notes:**
- Add ESLint rule to warn on deprecated field usage
- Use TypeScript `@deprecated` JSDoc tags
- Create new type `ProductDetailViewV2` for clean migration path

---

### CRITICAL-005: Dirty State Detection Uses Unreliable JSON.stringify Comparison

**Why it is dangerous:**
The dirty state calculation uses `JSON.stringify` snapshots which can produce false positives/negatives due to object property ordering, undefined vs null differences, and reference inequality. This causes the save button to appear/disappear incorrectly.

**Exact code pattern:**
```typescript
// EditProductForm.tsx lines 110-112
const snapshot = useMemo(() => ({ translations, structure, images }), [images, structure, translations]);
const initialFingerprint = useRef(JSON.stringify(snapshot));
const isDirty = initialFingerprint.current !== JSON.stringify(snapshot);
```

**Future backend break risk:** **MEDIUM** - Not directly backend-related, but causes poor UX and potential data loss if users think changes are saved when they're not.

**Recommended fix:**
```typescript
// Use deep equality comparison
import { useDeepCompareMemo } from 'use-deep-compare';

const initialSnapshot = useRef({ translations, structure, images });
const currentSnapshot = { translations, structure, images };

const isDirty = !deepEqual(initialSnapshot.current, currentSnapshot);

// OR use RHF's built-in dirty tracking if migrating forms
const { isDirty } = form.formState;
```

**Migration safety notes:**
- Consider migrating entire form to React Hook Form for proper dirty tracking
- Add unit tests for edge cases (null vs undefined, array reordering)

---

## 2. Medium Issues

### MEDIUM-001: Variant Identity Uses Unstable `key` Field

**Why it is dangerous:**
Variants are identified by a frontend-generated `key` field constructed from attribute values. This key can change if attributes are modified, breaking variant identity and causing duplicate variants or lost edits.

**Exact code pattern:**
```typescript
// EditProductForm.tsx lines 64-66
key: variant.attributes.map((attr) => `${attr.name}:${attr.value}`).join('|') ||
  `variant-${variant.id}-${idx}`,
```

**Future backend break risk:** **HIGH** - Backend uses stable numeric IDs; frontend's mutable key conflicts with backend identity model.

**Recommended fix:**
```typescript
// Always use backend ID as primary identity
const getVariantIdentity = (variant: ProductVariant) => ({
  id: variant.id,  // Stable backend ID
  tempKey: variant.id ? undefined : generateTempKey(),  // Only for unsaved
});

// In state management, key by ID when available
const variantsMap = new Map(variants.map(v => [v.id ?? v.tempKey, v]));
```

**Migration safety notes:**
- Preserve `key` for UI purposes only (list rendering)
- Never use `key` for update/delete operations; always use `id`

---

### MEDIUM-002: No Explicit Default Variant Handling

**Why it is dangerous:**
The code assumes `variants[0]` is the primary/default variant, but there's no mechanism to designate or preserve which variant is the default across edits.

**Exact code pattern:**
```typescript
// EditProductForm.tsx line 124
const primaryVariant = structure.variants[0];
```

**Future backend break risk:** **MEDIUM** - Backend will introduce `display_variant` field; frontend currently has no way to set or respect this designation.

**Recommended fix:**
```typescript
interface ProductStructureState {
  basics: ProductStructureBasicsValue;
  variants: ProductVariantInput[];
  options: ProductOption[];
  displayVariantId?: number | string;  // Track explicit default
}

// In submit
const displayVariant = structure.variants.find(
  v => v.id === structure.displayVariantId
) ?? structure.variants[0];
```

**Migration safety notes:**
- Add UI control to designate default variant
- Store `display_variant_id` separately from variant order

---

### MEDIUM-003: Variant Combination Generator Copies From First Variant Blindly

**Why it is dangerous:**
When generating variant combinations, new variants copy pricing/inventory from `currentVariants[0]` without any indication that this is arbitrary. Users may not realize all new variants start with the same values.

**Exact code pattern:**
```typescript
// VariantCombinationGenerator.ts lines 67-83
const base = currentVariants[0];
return {
  key,
  label,
  sku: null,
  barcode: null,
  price: base?.price ?? 0,
  compare_at_price: base?.compare_at_price ?? null,
  cost_price: base?.cost_price ?? null,
  quantity: base?.quantity ?? 0,
  // ...
};
```

**Future backend break risk:** **LOW** - Functional issue, not API contract issue, but causes user confusion.

**Recommended fix:**
```typescript
// Make base variant selection explicit
export function generateVariantCombinations(
  options: ProductOption[],
  currentVariants: ProductVariantInput[],
  baseVariantId?: number  // Explicit base selection
): ProductVariantInput[] {
  const baseVariant = currentVariants.find(v => v.id === baseVariantId) 
    ?? currentVariants[0];
  // ... rest unchanged but documented
}
```

**Migration safety notes:**
- Add UI to select which variant to use as template
- Show warning that new variants inherit values from selected template

---

### MEDIUM-004: Tabs Component Missing Accessibility Attributes

**Why it is dangerous:**
The custom Tabs implementation doesn't properly manage focus, keyboard navigation, or ARIA attributes for screen readers.

**Exact code pattern:**
```typescript
// Tabs.tsx - TabsTrigger
<TabsPrimitive.Tab
  data-slot="tabs-trigger"
  className={cn(...)}
  {...props}
/>
```

**Future backend break risk:** **N/A** - Accessibility issue, not backend-related.

**Recommended fix:**
```typescript
// Ensure Base UI primitives are used correctly
<TabsPrimitive.Tab
  data-slot="tabs-trigger"
  aria-selected={isSelected}
  tabIndex={isSelected ? 0 : -1}
  onKeyDown={handleKeyDown}
  className={cn(...)}
  {...props}
/>
```

**Migration safety notes:**
- Run accessibility audit with screen reader testing
- Add keyboard navigation tests

---

### MEDIUM-005: Translation State Initialization May Lose Data

**Why it is dangerous:**
The translation state initialization merges available locales with existing translations, but if a locale is removed from `availableLocales`, its translation data is silently dropped from state.

**Exact code pattern:**
```typescript
// EditProductForm.tsx lines 33-51
const availableLocales = product.availableLocales;
const translationsInitial = useMemo(() => {
  const base: Record<Locale, ProductTranslation> = { ...product.translations };
  for (const locale of availableLocales) {
    if (!base[locale]) {
      base[locale] = { /* empty translation */ };
    }
  }
  return base;
}, [availableLocales, product.translations]);
```

**Future backend break risk:** **LOW** - Doesn't affect backend directly, but may cause data loss if locale availability changes.

**Recommended fix:**
```typescript
// Preserve all translations, even for unavailable locales
const translationsInitial = useMemo(() => {
  const base: Record<Locale, ProductTranslation> = {};
  // Start with all existing translations
  for (const [locale, translation] of Object.entries(product.translations)) {
    base[locale] = translation;
  }
  // Add empty slots for available locales without translations
  for (const locale of availableLocales) {
    if (!base[locale]) {
      base[locale] = createEmptyTranslation(locale);
    }
  }
  return base;
}, [availableLocales, product.translations]);
```

**Migration safety notes:**
- Consider soft-deleting translations rather than hard-deleting
- Add confirmation dialog before removing locale translations

---

## 3. Recommended Refactors

### REFACTOR-001: Migrate Entire Form to React Hook Form

**Current state:** Manual state management with `useState` for translations, structure, images.

**Recommended approach:**
```typescript
const form = useForm<ProductEditorFormData>({
  resolver: zodResolver(ProductEditorSchema),
  defaultValues: mapProductToFormValues(product),
});

const { isDirty, isValid } = form.formState;  // Proper dirty tracking
```

**Benefits:**
- Built-in dirty state detection (no JSON.stringify hacks)
- Type-safe form validation
- Better performance with selective re-renders
- Integration with existing `ProductForm.tsx` patterns

---

### REFACTOR-002: Extract Variant State Management to Custom Hook

**Current state:** Variant state managed inline in `EditProductForm` with complex initialization logic.

**Recommended approach:**
```typescript
function useVariantManager(initialProduct: ProductDetailView) {
  const [variants, setVariants] = useState<ProductVariantInput[]>(() => 
    initializeVariants(initialProduct)
  );
  const [displayVariantId, setDisplayVariantId] = useState<number | undefined>(
    initialProduct.display_variant?.id
  );

  const addVariant = useCallback(...);
  const updateVariant = useCallback(...);
  const deleteVariant = useCallback(...);
  const generateCombinations = useCallback(...);

  return { variants, displayVariantId, setDisplayVariantId, addVariant, updateVariant, deleteVariant, generateCombinations };
}
```

**Benefits:**
- Separation of concerns
- Testable variant logic
- Reusable across create/edit forms

---

### REFACTOR-003: Normalize State Structure to Prevent Stale Closures

**Current state:** `snapshot` useMemo depends on `translations, structure, images` but `initialFingerprint` is captured once and never updated.

**Recommended approach:**
```typescript
const initialStateRef = useRef<ProductEditorState | null>(null);
if (!initialStateRef.current) {
  initialStateRef.current = { translations, structure, images };
}

const currentState = { translations, structure, images };
const isDirty = !deepEqual(initialStateRef.current, currentState);
```

**Benefits:**
- Clearer intent
- Avoids accidental fingerprint updates
- Easier to reset "dirty" state after save

---

### REFACTOR-004: Split EditProductForm into Smaller Tab Components

**Current state:** Single 200-line component handling all tabs internally.

**Recommended approach:**
```typescript
// Each tab is its own component with typed props
function ContentTab({ 
  translations, 
  onChange,
  availableLocales 
}: ContentTabProps) {}

function StructureTab({
  structure,
  onChange,
}: StructureTabProps) {}

function MediaTab({
  images,
  onChange,
}: MediaTabProps) {}
```

**Benefits:**
- Better code organization
- Easier to test each tab independently
- Reduced re-render scope

---

### REFACTOR-005: Create DTO Layer for API Contract Translation

**Current state:** Direct mapping in `mapProductDetail` mixes view logic with API transformation.

**Recommended approach:**
```typescript
// api/product.dto.ts
export class ProductDetailDTO {
  static fromApi(raw: AdminProduct): ProductDetailView {
    return {
      id: raw.id,
      displayVariant: raw.display_variant ? VariantDTO.fromApi(raw.display_variant) : undefined,
      variants: raw.variants.map(VariantDTO.fromApi),
      totalStock: raw.variants.reduce((sum, v) => sum + v.quantity, 0),
      // ...
    };
  }

  static toApi(view: ProductDetailView): ProductUpdatePayload {
    return {
      variants: view.variants.map(VariantDTO.toApi),
      display_variant_id: view.displayVariant?.id,
      // NO flattened fields
    };
  }
}
```

**Benefits:**
- Clear separation between API and view models
- Single source of truth for transformations
- Easier to maintain during API migrations

---

## 4. Future Backend Compatibility Risks

### RISK-001: Backend Will Remove Flattened Fields Entirely

**Timeline:** Expected in next major API version

**Impact:** All code paths using `product.price`, `product.sku`, etc. will break

**Mitigation priority:** **P0**

**Action items:**
1. Add `display_variant` support immediately
2. Deprecate all flattened field usage with warnings
3. Remove fallback chains progressively
4. Update type definitions to reflect new reality

---

### RISK-002: Backend Will Enforce Variant ID Immutability

**Timeline:** Already enforced, but frontend doesn't respect it

**Impact:** Frontend's key-based variant identification conflicts with backend ID-based identity

**Mitigation priority:** **P1**

**Action items:**
1. Always use backend `id` for variant operations
2. Generate temporary IDs only for unsaved variants
3. On save, map temp IDs to real IDs from response

---

### RISK-003: Backend Will Replace Destructive Updates with Smart Sync

**Timeline:** Planned for next quarter

**Impact:** Current approach sends full variant array; backend will want diff-based updates

**Mitigation priority:** **P2**

**Action items:**
1. Track variant operations (create, update, delete) separately
2. Send operations list instead of full array
3. Handle partial failures gracefully

```typescript
interface VariantOperation {
  type: 'create' | 'update' | 'delete';
  variant: ProductVariantInput;
}

// Payload becomes
{
  variant_operations: VariantOperation[];
}
```

---

### RISK-004: SKU Uniqueness Will Be Store-Scoped, Not Global

**Timeline:** Backend migration in progress

**Impact:** Frontend validation may incorrectly reject valid SKUs

**Mitigation priority:** **P2**

**Action items:**
1. Move SKU uniqueness validation to backend
2. Remove frontend SKU uniqueness checks
3. Display store-specific error messages

---

### RISK-005: Slug Uniqueness Will Be Store-Scoped

**Timeline:** Same as SKU scoping

**Impact:** Similar to SKU issue

**Mitigation priority:** **P2**

---

## 5. Variant-First Migration Strategy

### Phase 1: Foundation (Week 1-2)

**Goal:** Add `display_variant` support without breaking existing functionality

**Tasks:**
1. Update `ProductDetailView` type to include optional `display_variant`
2. Update `mapProductDetail` to extract `display_variant` from API response
3. Modify variant initialization to prefer `display_variant` over flattened fields
4. Keep flattened field fallbacks as safety net

**Code changes:**
```typescript
// types/product.ts
export interface ProductDetailView {
  // ... existing fields
  display_variant?: ProductVariant;  // NEW
  total_stock?: number;              // NEW
}

// EditProductForm.tsx
const initialVariants = useMemo(() => {
  if (product.variants.length > 0) {
    return product.variants.map(mapToVariantInput);
  }
  if (product.display_variant) {
    return [mapToVariantInput(product.display_variant)];
  }
  // Fallback to deprecated fields (temporary)
  return [createDefaultFromDeprecated(product)];
}, [product.variants, product.display_variant]);
```

**Testing:**
- Verify products with variants load correctly
- Verify products with only `display_variant` load correctly
- Verify products with neither still work (fallback)

---

### Phase 2: Cleanup (Week 3-4)

**Goal:** Remove deprecated field dependencies

**Tasks:**
1. Remove flattened field fallbacks from variant initialization
2. Remove flattened fields from submit payload
3. Update types to mark deprecated fields as optional
4. Add ESLint warnings for deprecated field usage

**Code changes:**
```typescript
// EditProductForm.tsx - handleSubmit
mutation.mutate({
  translations: ...,
  status: structure.basics.status,
  variants: structure.variants,
  options: structure.options,
  images,
  display_variant_id: structure.displayVariantId,
  // REMOVED: price, sku, quantity, etc.
});
```

**Testing:**
- Verify API accepts new payload format
- Verify backend returns correct data with new format
- Rollback plan ready if backend not ready

---

### Phase 3: Optimization (Week 5-6)

**Goal:** Implement smart sync and performance improvements

**Tasks:**
1. Track variant operations (create/update/delete)
2. Send diff-based updates instead of full arrays
3. Implement optimistic updates
4. Add proper loading states

**Code changes:**
```typescript
interface VariantChangeSet {
  created: ProductVariantInput[];
  updated: ProductVariantInput[];
  deleted: number[];  // IDs
}

// Track changes
const [variantChanges, setVariantChanges] = useState<VariantChangeSet>({
  created: [],
  updated: [],
  deleted: [],
});
```

**Testing:**
- Verify partial updates work correctly
- Test rollback on failed updates
- Performance benchmark

---

## 6. Safe Incremental Refactor Plan

### Week 1: Type Safety Foundation

**Day 1-2:** Update type definitions
- Add `display_variant` to `ProductDetailView`
- Add `total_stock` to `ProductDetailView`
- Mark deprecated fields with `@deprecated` JSDoc

**Day 3-4:** Update mapper functions
- Modify `mapProductDetail` to handle `display_variant`
- Add unit tests for mapper

**Day 5:** Code review and merge

---

### Week 2: Variant Initialization Refactor

**Day 1-2:** Extract variant initialization logic
- Create `useVariantManager` hook
- Move initialization logic to hook

**Day 3-4:** Add `display_variant` preference
- Update initialization to prefer `display_variant`
- Keep deprecated fallback temporarily

**Day 5:** Testing and merge

---

### Week 3: Form Submission Refactor

**Day 1-2:** Update submit payload
- Remove flattened fields from payload
- Add `display_variant_id` to payload

**Day 3-4:** Backend coordination
- Verify backend accepts new payload
- Test round-trip data flow

**Day 5:** Deploy behind feature flag

---

### Week 4: State Management Improvements

**Day 1-2:** Fix dirty state detection
- Replace JSON.stringify with deep equality
- Or migrate to RHF

**Day 3-4:** Improve variant identity handling
- Use backend IDs consistently
- Fix temp ID handling for new variants

**Day 5:** Testing and cleanup

---

### Week 5-6: Polish and Documentation

**Day 1-3:** Accessibility improvements
- Fix Tabs keyboard navigation
- Add ARIA attributes
- Screen reader testing

**Day 4-5:** Documentation
- Update component documentation
- Add migration guide for team
- Document variant-first patterns

---

## 7. Type System Audit

### Current Type Issues

| Issue | Location | Severity | Fix |
|-------|----------|----------|-----|
| Flattened fields in `ProductDetailView` | `types/product.ts:141-149` | High | Make optional, add deprecation |
| `ProductVariantInput.key` is required but frontend-generated | `types/product.ts:185` | Medium | Make optional, use `id` for identity |
| No `display_variant` type | N/A | Critical | Add to `ProductDetailView` |
| No `total_stock` type | N/A | Low | Add to `ProductDetailView` |
| `AdminProduct` has flattened fields | `types/product.ts:96-104` | High | This is API type, keep but document |
| `ProductUpdatePayload` has flattened fields | `types/product.ts:239-247` | Critical | Remove in next version |

### Recommended Type Changes

```typescript
// types/product.ts

export interface ProductDetailView {
  id: number;
  storeId: number;
  name: string;
  slug: string;
  description: string;
  status: ProductStatus;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
  
  // Variant-first fields (PRIMARY)
  variants: ProductVariant[];
  display_variant?: ProductVariant;  // NEW: explicit default
  total_stock?: number;              // NEW: aggregate stock
  
  options: ProductOption[];
  availableLocales: Locale[];
  translations: Record<Locale, ProductTranslation>;
  
  /** @deprecated Use display_variant instead. Will be removed in v2.0 */
  price?: number;
  /** @deprecated Use display_variant instead. Will be removed in v2.0 */
  compareAtPrice?: number | null;
  /** @deprecated Use display_variant instead. Will be removed in v2.0 */
  costPerItem?: number | null;
  /** @deprecated Use display_variant instead. Will be removed in v2.0 */
  sku?: string | null;
  /** @deprecated Use display_variant instead. Will be removed in v2.0 */
  barcode?: string | null;
  /** @deprecated Use display_variant instead. Will be removed in v2.0 */
  quantity?: number;
  /** @deprecated Use display_variant instead. Will be removed in v2.0 */
  trackQuantity?: boolean;
  /** @deprecated Use display_variant instead. Will be removed in v2.0 */
  weight?: number | null;
  /** @deprecated Use display_variant instead. Will be removed in v2.0 */
  weightUnit?: WeightUnit | null;
}

export interface ProductUpdatePayload {
  translations?: Record<Locale, Omit<ProductTranslation, 'is_complete'>>;
  status?: ProductStatus;
  variants?: ProductVariantInput[];
  options?: ProductOption[];
  images?: ProductImage[];
  display_variant_id?: number | null;  // NEW: explicit default variant
  
  /** @deprecated Backend now extracts these from variants. Will be removed in v2.0 */
  price?: number;
  /** @deprecated Backend now extracts these from variants. Will be removed in v2.0 */
  compare_at_price?: number | null;
  /** @deprecated Backend now extracts these from variants. Will be removed in v2.0 */
  cost_per_item?: number | null;
  /** @deprecated Backend now extracts these from variants. Will be removed in v2.0 */
  sku?: string | null;
  /** @deprecated Backend now extracts these from variants. Will be removed in v2.0 */
  barcode?: string | null;
  /** @deprecated Backend now extracts these from variants. Will be removed in v2.0 */
  quantity?: number;
  /** @deprecated Backend now extracts these from variants. Will be removed in v2.0 */
  track_quantity?: boolean;
  /** @deprecated Backend now extracts these from variants. Will be removed in v2.0 */
  weight?: number | null;
  /** @deprecated Backend now extracts these from variants. Will be removed in v2.0 */
  weight_unit?: WeightUnit | null;
}
```

---

## 8. Form State Audit

### Current State Architecture Problems

**Problem 1: Mixed Responsibilities**
```typescript
// EditProductForm.tsx manages:
// - translations state
// - structure state (basics, variants, options)
// - images state
// - dirty state calculation
// - form submission logic
```

This violates single responsibility principle.

**Problem 2: Expensive Snapshot Calculation**
```typescript
const snapshot = useMemo(() => ({ translations, structure, images }), [images, structure, translations]);
```
This creates a new object on every render where any dependency changes, triggering downstream recalculations.

**Problem 3: Reference Inequality**
```typescript
const initialFingerprint = useRef(JSON.stringify(snapshot));
```
The `snapshot` reference changes every render, but `JSON.stringify` result may not. This is inefficient.

### Recommended State Architecture

```typescript
// hooks/useProductEditor.ts
interface ProductEditorState {
  translations: Record<Locale, ProductTranslation>;
  basics: { status: ProductStatus; featured: boolean };
  variants: ProductVariantInput[];
  options: ProductOption[];
  images: ProductImage[];
  displayVariantId?: number;
}

interface ProductEditorActions {
  setTranslation: (locale: Locale, translation: Partial<ProductTranslation>) => void;
  setBasics: (basics: Partial<{ status: ProductStatus; featured: boolean }>) => void;
  addVariant: (variant: ProductVariantInput) => void;
  updateVariant: (id: number, updates: Partial<ProductVariantInput>) => void;
  deleteVariant: (id: number) => void;
  setImages: (images: ProductImage[]) => void;
  setDisplayVariantId: (id: number) => void;
  reset: () => void;
}

function useProductEditor(initialProduct: ProductDetailView): ProductEditorState & ProductEditorActions & { isDirty: boolean } {
  const initialState = useMemo(() => mapProductToState(initialProduct), [initialProduct]);
  const [state, dispatch] = useReducer(productEditorReducer, initialState);
  
  const isDirty = useDeepCompareMemoize(!deepEqual(state, initialState));
  
  // Actions implemented with dispatch
  // ...
  
  return { ...state, ...actions, isDirty };
}
```

---

## 9. API Contract Audit

### Current Contract Violations

| Violation | Location | Risk | Fix |
|-----------|----------|------|-----|
| Sending flattened fields in update | `EditProductForm.tsx:143-151` | Critical | Remove from payload |
| Depending on flattened fields in response | `EditProductForm.tsx:77-103` | Critical | Use `display_variant` |
| No `display_variant` in request | N/A | High | Add `display_variant_id` |
| No `display_variant` in response | `types/product.ts` | Critical | Backend must add |

### Recommended API Contract

**Request (ProductUpdatePayload):**
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
  "display_variant_id": 123
}
```

**Response (ProductDetailView):**
```json
{
  "id": 456,
  "status": "active",
  "variants": [...],
  "display_variant": {
    "id": 123,
    "sku": "SKU-001",
    "price": 29.99,
    ...
  },
  "total_stock": 500,
  "translations": { ... }
}
```

---

## 10. Performance Audit

### Current Performance Issues

**Issue 1: Unnecessary Re-renders from JSON.stringify**
```typescript
const isDirty = initialFingerprint.current !== JSON.stringify(snapshot);
```
This runs on every render, serializing potentially large objects.

**Fix:** Use deep equality comparison with memoization.

**Issue 2: Tabs Re-render All Content**
```typescript
<Tabs value={tab} onValueChange={setTab}>
  <TabsContent value="content">...</TabsContent>
  <TabsContent value="structure">...</TabsContent>
  <TabsContent value="media">...</TabsContent>
</Tabs>
```
All tab contents render even when not active.

**Fix:** Lazy render tab content or use `keepMounted={false}` if supported.

**Issue 3: Variant Table Re-renders on Every Change**
```typescript
// ProductVariantsTable receives all variants on every change
<ProductVariantsTable variants={value.variants} onChange={...} />
```

**Fix:** Memoize table rows, use virtualization for large variant lists.

---

## 11. Accessibility Audit

### Tabs Component Issues

| Issue | Impact | Fix |
|-------|--------|-----|
| No keyboard navigation between tabs | High | Add arrow key handlers |
| Missing `aria-selected` | High | Add to trigger |
| Missing `role="tablist"` | Medium | Ensure Base UI provides |
| Missing `role="tabpanel"` | Medium | Ensure Base UI provides |
| Focus not managed on tab change | Medium | Move focus to panel |

### Recommended Fixes for Tabs.tsx

```typescript
function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      // Base UI should handle ARIA, but verify:
      // aria-selected is automatic
      // role="tab" is automatic
      className={cn(...)}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      // role="tabpanel" should be automatic
      // aria-labelledby should link to trigger
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  );
}
```

---

## 12. Final Recommended Frontend Architecture

### Target Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    EditProductPage                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   useProductEditor                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ translations │  │   variants   │  │    images    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │    basics    │  │   options    │                         │
│  └──────────────┘  └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│  ContentTab   │  │ StructureTab  │  │   MediaTab    │
│               │  │               │  │               │
│ - translations│  │ - basics      │  │ - images      │
│ - locales     │  │ - variants    │  │ - upload      │
└───────────────┘  │ - options     │  └───────────────┘
                   └───────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  ProductDTO (API Layer)                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  fromApi(): Convert AdminProduct → ProductDetailView │   │
│  │  toApi():   Convert ProductDetailView → UpdatePayload│   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Client                             │
│            (Sends variant-first payloads only)              │
└─────────────────────────────────────────────────────────────┘
```

### Key Principles

1. **Variant-First Everything**: All data flows through variants; no flattened shortcuts
2. **Explicit Default**: `display_variant` is the single source of truth for "primary" variant
3. **Stable Identity**: Backend IDs are the only reliable variant identifiers
4. **Type Safety**: TypeScript enforces variant-first patterns at compile time
5. **Separation of Concerns**: Hooks manage state, components render, DTOs transform
6. **Progressive Enhancement**: Graceful degradation during backend migration

### Migration Checklist

- [ ] Add `display_variant` to type definitions
- [ ] Update mappers to extract `display_variant`
- [ ] Modify variant initialization to prefer `display_variant`
- [ ] Remove flattened field fallbacks
- [ ] Update submit payload to exclude flattened fields
- [ ] Add `display_variant_id` to submit payload
- [ ] Fix dirty state detection
- [ ] Improve variant identity handling
- [ ] Add accessibility improvements to Tabs
- [ ] Write integration tests for variant-first flow
- [ ] Document new patterns for team

---

This audit identifies **5 critical issues**, **5 medium issues**, and provides a complete 6-week migration plan to achieve full variant-first compliance while maintaining backward compatibility during the transition period.
