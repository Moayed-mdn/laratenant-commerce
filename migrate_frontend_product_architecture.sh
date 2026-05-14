#!/usr/bin/env bash

# =============================================================================
# Frontend Product Architecture Migration Script
# Old Attribute/AttributeValue → Canonical Options + Semantic Variant Map
# =============================================================================

set -e

BASE="$(cd "$(dirname "$0")" && pwd)"
SRC="$BASE/src"

echo "============================================="
echo " Frontend Product Architecture Migration"
echo "============================================="

# =============================================================================
# PHASE 1 — TYPES
# =============================================================================

echo ""
echo "→ Phase 1: Writing types..."

mkdir -p "$SRC/types"

# -----------------------------------------------------------------------------
# types/product.ts — full replacement
# -----------------------------------------------------------------------------
cat > "$SRC/types/product.ts" << 'EOF'
/**
 * Product types for the admin dashboard.
 * Aligned with new canonical options + semantic variant map architecture.
 */

// ── Primitives ─────────────────────────────────────────────────────────────

export type ProductStatus = 'active' | 'draft';
export type Locale = string;
export type ProductEntityId = number;
export type WeightUnit = 'kg' | 'g' | 'lb' | 'oz';

// ── Images ─────────────────────────────────────────────────────────────────

export interface ProductImage {
  id: number;
  url: string;
  alt: string | null;
  position: number;
}

// ── Translations ───────────────────────────────────────────────────────────

export interface ProductTranslation {
  locale: Locale;
  name: string;
  slug: string;
  description: string | null;
  seo_title: string | null;
  seo_description: string | null;
  is_complete?: boolean;
}

// ── Options (new canonical system) ─────────────────────────────────────────

/**
 * A single option value belonging to a ProductOption.
 * 'value' is the display string (e.g. "Red", "XL").
 * 'id' is present for server-persisted values, null for unsaved ones.
 */
export interface ProductOptionValue {
  id?: ProductEntityId | null;
  value: string;
}

/**
 * A canonical product option (e.g. "Color", "Size").
 * Owned by a product, not global.
 * 'position' controls display order.
 */
export interface ProductOption {
  id?: ProductEntityId | null;
  name: string;
  position: number;
  values: ProductOptionValue[];
}

/**
 * Raw admin product option shape as returned by the backend.
 * Used only in AdminProduct before normalization.
 */
export interface AdminProductOption {
  id?: ProductEntityId | null;
  name?: string | null;
  position?: number | null;
  values?: Array<{
    id?: ProductEntityId | null;
    value?: string | null;
  }> | null;
}

// ── Variants (new semantic map system) ─────────────────────────────────────

/**
 * A single option assignment on a variant.
 * Replaces the old ProductVariantAttribute.
 * e.g. { option_name: "Color", option_value: "Red" }
 */
export interface ProductVariantOption {
  option_name: string;
  option_value: string;
}

/**
 * Raw admin variant shape as returned by the backend resource.
 * Used only in AdminProduct before normalization.
 */
export interface AdminProductVariant {
  id: number;
  sku: string | null;
  barcode?: string | null;
  price: number;
  compare_at_price?: number | null;
  cost_price?: number | null;
  quantity: number;
  low_stock_threshold?: number | null;
  track_inventory?: boolean;
  weight?: number | null;
  weight_unit?: WeightUnit | null;
  is_active: boolean;
  manufacture_date?: string | null;
  expiry_date?: string | null;
  batch_number?: string | null;
  options: ProductVariantOption[];
}

/**
 * Product variant — the core purchasable entity.
 * 'options' is the semantic map of option assignments.
 * Negative 'id' values indicate unsaved (client-only) variants.
 */
export interface ProductVariant {
  id: number;
  sku: string | null;
  barcode?: string | null;
  price: number;
  compare_at_price?: number | null;
  cost_price?: number | null;
  quantity: number;
  low_stock_threshold?: number | null;
  track_inventory?: boolean;
  weight?: number | null;
  weight_unit?: WeightUnit | null;
  is_active: boolean;
  manufacture_date?: string | null;
  expiry_date?: string | null;
  batch_number?: string | null;
  options: ProductVariantOption[];
}

// ── Admin API Response Types ────────────────────────────────────────────────

/**
 * Full admin product shape as returned by the backend.
 * This is the raw API response type — map it before use in UI.
 */
export interface AdminProduct {
  id: number;
  store_id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  cost_per_item: number | null;
  sku: string | null;
  barcode: string | null;
  quantity: number;
  track_quantity: boolean;
  weight: number | null;
  weight_unit: WeightUnit | null;
  status: ProductStatus;
  is_featured?: boolean;
  images: ProductImage[];
  variants: AdminProductVariant[];
  options?: AdminProductOption[] | null;
  category_id: number | null;
  brand_id: number | null;
  available_locales?: Locale[];
  translations?: Record<Locale, ProductTranslation>;
  created_at: string;
  updated_at: string;
}

// ── View Types (post-mapper) ────────────────────────────────────────────────

/**
 * Shaped product list item for UI table rendering.
 */
export interface ProductListItemView {
  id: number;
  name: string;
  slug: string;
  status: ProductStatus;
  price: string;
  compareAtPrice: string | null;
  quantity: number;
  sku: string | null;
  firstImage: string | null;
  category: string | null;
  createdAt: string;
}

/**
 * Shaped product detail for the admin editor.
 * All fields are camelCase and ready for UI consumption.
 */
export interface ProductDetailView {
  id: number;
  storeId: number;
  categoryId: number | null;
  brandId: number | null;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  costPerItem: number | null;
  sku: string | null;
  barcode: string | null;
  quantity: number;
  trackQuantity: boolean;
  weight: number | null;
  weightUnit: WeightUnit | null;
  status: ProductStatus;
  isFeatured: boolean;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
  variants: ProductVariant[];
  options: ProductOption[];
  availableLocales: Locale[];
  translations: Record<Locale, ProductTranslation>;
}

// ── API Payload Types ───────────────────────────────────────────────────────

/**
 * Payload for updating an existing product.
 * All fields are optional — send only what changed.
 */
export interface ProductUpdatePayload {
  category_id?: number | null;
  brand_id?: number | null;
  is_active?: boolean | null;
  is_featured?: boolean | null;
  translations?: Array<{
    locale: string;
    name: string;
    slug: string;
    description?: string | null;
    seo_title?: string | null;
    seo_description?: string | null;
  }>;
  sync_variants?: boolean;
  options?: Array<{
    name: string;
    position: number;
    values: string[];
  }>;
  variants?: Array<{
    id?: number | null;
    sku: string | null;
    barcode?: string | null;
    price: number;
    compare_at_price?: number | null;
    cost_price?: number | null;
    quantity: number;
    low_stock_threshold?: number | null;
    track_inventory?: boolean | null;
    is_active?: boolean | null;
    weight?: number | null;
    weight_unit?: string | null;
    manufacture_date?: string | null;
    expiry_date?: string | null;
    batch_number?: string | null;
    options?: Record<string, string>;
  }>;
  tags?: string[];
}

/**
 * Payload for creating a new product.
 * Follows the new backend contract with translations + options + variants.
 */
export interface ProductCreatePayload {
  status: ProductStatus;
  is_featured?: boolean;
  category_id?: number | null;
  brand_id?: number | null;
  translations: Array<{
    locale: string;
    name: string;
    slug: string;
    description?: string | null;
    seo_title?: string | null;
    seo_description?: string | null;
  }>;
  options?: Array<{
    name: string;
    position: number;
    values: string[];
  }>;
  variants: Array<{
    sku: string | null;
    barcode?: string | null;
    price: number;
    compare_at_price?: number | null;
    cost_price?: number | null;
    quantity: number;
    low_stock_threshold?: number | null;
    track_inventory?: boolean | null;
    is_active: boolean;
    weight?: number | null;
    weight_unit?: string | null;
    manufacture_date?: string | null;
    expiry_date?: string | null;
    batch_number?: string | null;
    options?: Record<string, string>;
  }>;
  images?: Array<{
    url: string;
    alt?: string | null;
    position?: number;
  }>;
  tags?: string[];
}

// ── Legacy Cleanup Targets ──────────────────────────────────────────────────
// The following types remain temporarily for compatibility.
// Remove after CreateProductForm is migrated to the new flow.

/** @deprecated Use ProductVariantOption instead. */
export interface ProductVariantAttribute {
  attribute_id: number | null;
  attribute_value_id: number | null;
  name: string;
  value: string;
  label?: string | null;
  code?: string | null;
}

/**
 * Internal variant representation used by the old flat create form.
 * @deprecated Will be removed when CreateProductForm is migrated.
 */
export interface VariantFormItem {
  key: string;
  id?: number;
  sku: string | null;
  price: number;
  quantity: number;
  is_active: boolean;
  manufacture_date?: string | null;
  expiry_date?: string | null;
  batch_number?: string | null;
  options: ProductVariantOption[];
  barcode?: string | null;
  compare_at_price?: number | null;
  cost_price?: number | null;
  low_stock_threshold?: number | null;
  track_inventory?: boolean;
  weight?: number | null;
  weight_unit?: WeightUnit | null;
}
EOF

# -----------------------------------------------------------------------------
# types/product-editor.ts — update ProductStructureState
# -----------------------------------------------------------------------------
cat > "$SRC/types/product-editor.ts" << 'EOF'
import type {
  Locale,
  ProductImage,
  ProductOption,
  ProductTranslation,
  ProductVariant,
} from '@/types/product';

/**
 * Content tab state — status, locale-keyed translations,
 * category/brand assignments.
 */
export interface ProductContentFormValues {
  status: 'active' | 'draft';
  categoryId: number | null;
  brandId: number | null;
  isFeatured?: boolean;
  translations: Record<Locale, ProductTranslation>;
}

/**
 * Structure tab state — canonical options + generated variants.
 * options[] drives the combination generator.
 * variants[] carries semantic option assignments via options[].
 */
export interface ProductStructureState {
  options: ProductOption[];
  variants: ProductVariant[];
}

/**
 * Media tab state — ordered product images.
 */
export interface ProductMediaState {
  images: ProductImage[];
}

/**
 * Full editor state combining all three tabs.
 */
export interface ProductEditorState {
  content: ProductContentFormValues;
  structure: ProductStructureState;
  media: ProductMediaState;
}

export interface VariantSignature {
  signature: string;
  variant: ProductVariant;
}

export interface BuildVariantsResult {
  variants: ProductVariant[];
  created: number;
}
EOF

echo "   ✓ Types written (2 files)"

# =============================================================================
# PHASE 2 — VARIANT SIGNATURES
# =============================================================================

echo ""
echo "→ Phase 2: Writing variant signatures..."

mkdir -p "$SRC/lib/products"

cat > "$SRC/lib/products/variant-signatures.ts" << 'EOF'
import type { ProductVariantOption } from '@/types/product';

/**
 * Builds a deterministic, order-independent signature for a variant
 * based on its semantic option assignments.
 *
 * Logic:
 * 1. Filter out any entries with empty option_name or option_value.
 * 2. Sort entries alphabetically by option_name.
 * 3. Join as "name:value" pairs separated by "|".
 *
 * Example: [{ option_name: "Size", option_value: "XL" },
 *           { option_name: "Color", option_value: "Red" }]
 *       → "Color:Red|Size:XL"
 *
 * This replaces the old ID-based signature ("1:10|2:20").
 * String-based signatures are stable across re-generation cycles
 * because option names and values are unique per product (DB constraint).
 */
export function buildVariantSignature(
  options: ProductVariantOption[]
): string {
  return [...(options ?? [])]
    .filter(
      (o) =>
        typeof o.option_name === 'string' &&
        o.option_name.trim() !== '' &&
        typeof o.option_value === 'string' &&
        o.option_value.trim() !== ''
    )
    .sort((a, b) =>
      a.option_name.trim().localeCompare(b.option_name.trim())
    )
    .map((o) => `${o.option_name.trim()}:${o.option_value.trim()}`)
    .join('|');
}
EOF

echo "   ✓ variant-signatures.ts written"

# =============================================================================
# PHASE 3 — VARIANT GENERATOR
# =============================================================================

echo ""
echo "→ Phase 3: Writing variant generator..."

cat > "$SRC/lib/products/generateVariants.ts" << 'EOF'
import type { ProductOption, ProductVariant, ProductVariantOption } from '@/types/product';
import { buildVariantSignature } from './variant-signatures';

// ── Internal combination builder ───────────────────────────────────────────

type OptionValueRef = {
  option: ProductOption;
  value: ProductOption['values'][number];
};

/**
 * Builds the cartesian product of all option values.
 * Options with zero values are excluded.
 * Returns an array of combination arrays, each representing
 * one full variant axis assignment.
 */
function buildCombinations(options: ProductOption[]): OptionValueRef[][] {
  const validOptions = (options ?? []).filter(
    (opt) => (opt.values ?? []).length > 0
  );

  if (validOptions.length === 0) return [];

  return validOptions.reduce<OptionValueRef[][]>((acc, option) => {
    const refs = option.values.map((value) => ({ option, value }));

    if (acc.length === 0) {
      return refs.map((r) => [r]);
    }

    const next: OptionValueRef[][] = [];
    for (const existing of acc) {
      for (const r of refs) {
        next.push([...existing, r]);
      }
    }
    return next;
  }, []);
}

// ── Public helpers ─────────────────────────────────────────────────────────

/**
 * Calculates the next safe negative ID for a new unsaved variant.
 * Negative IDs are client-only and never sent to the backend as-is
 * (buildStructurePayload filters them to undefined).
 */
export function getNextNegativeId(existing: { id: number }[]): number {
  const minId = (existing ?? []).reduce<number>(
    (min, v) => Math.min(min, v.id),
    0
  );
  return minId <= 0 ? minId - 1 : -1;
}

/**
 * Generates the full set of variants from the current options.
 *
 * Logic:
 * 1. Build all possible option value combinations (cartesian product).
 * 2. If no combinations exist, return empty array.
 * 3. Deduplicate combinations by signature to guard against
 *    malformed option states (duplicate values).
 * 4. Preserve existing variants whose option signature matches
 *    a required combination (retains id, sku, price, etc.).
 * 5. Create new variants with negative IDs for missing combinations.
 * 6. Stale variants (signature no longer in required set) are omitted.
 *
 * This function is pure and safe to call multiple times.
 */
export function generateVariants(
  options: ProductOption[],
  existingVariants: ProductVariant[]
): ProductVariant[] {
  const existing = existingVariants ?? [];
  const combos = buildCombinations(options);

  if (combos.length === 0) {
    return [];
  }

  const defaultPrice = existing[0]?.price ?? 0;
  let nextNewId = getNextNegativeId(existing);

  // ── Build the required signature set ──────────────────────────
  const validSignatures: string[] = [];
  const signatureToOptions = new Map<string, ProductVariantOption[]>();
  const seenSignatures = new Set<string>();

  for (const combo of combos) {
    const variantOptions: ProductVariantOption[] = combo.map(
      ({ option, value }) => ({
        option_name: option.name,
        option_value: value.value,
      })
    );

    const signature = buildVariantSignature(variantOptions);

    // Guard: skip duplicate combinations from malformed option states
    if (seenSignatures.has(signature)) {
      continue;
    }

    seenSignatures.add(signature);
    validSignatures.push(signature);
    signatureToOptions.set(signature, variantOptions);
  }

  // ── Preserve matching existing variants ────────────────────────
  const kept: ProductVariant[] = [];
  const validSet = new Set(validSignatures);
  const keptSignatures = new Set<string>();

  for (const v of existing) {
    const signature = buildVariantSignature(v.options);
    if (validSet.has(signature) && !keptSignatures.has(signature)) {
      kept.push(v);
      keptSignatures.add(signature);
    }
  }

  // ── Create new variants for missing combinations ───────────────
  for (const signature of validSignatures) {
    if (keptSignatures.has(signature)) continue;

    const variantOptions = signatureToOptions.get(signature);
    if (!variantOptions) continue;

    kept.push({
      id: nextNewId,
      sku: null,
      price: defaultPrice,
      quantity: 0,
      is_active: true,
      options: variantOptions,
    });

    keptSignatures.add(signature);
    nextNewId -= 1;
  }

  return kept;
}
EOF

echo "   ✓ generateVariants.ts written"

# =============================================================================
# PHASE 4 — DERIVER + LABEL
# =============================================================================

echo ""
echo "→ Phase 4: Writing deriver and label helpers..."

cat > "$SRC/lib/products/deriveOptionsFromVariants.ts" << 'EOF'
import type { ProductOption, ProductVariant } from '@/types/product';

/**
 * Rebuilds the canonical options list from the semantic option assignments
 * on existing variants.
 *
 * Used as a fallback when the API does not return top-level options,
 * or to ensure editor integrity when the options list is empty.
 *
 * Logic:
 * 1. Collect all unique option_name values across all variants.
 * 2. For each option name, collect all unique option_value strings.
 * 3. Return a ProductOption[] sorted by first appearance.
 *
 * Note: Derived options have no DB IDs (id: null) because the mapping
 * from name → DB record is not available client-side.
 */
export function deriveOptionsFromVariants(
  variants: ProductVariant[]
): ProductOption[] {
  if (!variants || variants.length === 0) {
    return [];
  }

  // Preserve insertion order for option names
  const optionOrder: string[] = [];
  const optionMap = new Map<string, Set<string>>();

  variants.forEach((variant) => {
    (variant.options ?? []).forEach((opt) => {
      const name = opt.option_name?.trim();
      const value = opt.option_value?.trim();

      if (!name || !value) return;

      if (!optionMap.has(name)) {
        optionOrder.push(name);
        optionMap.set(name, new Set());
      }

      optionMap.get(name)!.add(value);
    });
  });

  return optionOrder.map((name, index) => ({
    id: null,
    name,
    position: index + 1,
    values: Array.from(optionMap.get(name)!).map((val) => ({
      id: null,
      value: val,
    })),
  }));
}
EOF

cat > "$SRC/lib/products/getVariantLabel.ts" << 'EOF'
import type { ProductVariantOption } from '@/types/product';

/**
 * Builds a human-readable label for a variant from its option assignments.
 *
 * Example:
 *   [{ option_name: "Color", option_value: "Red" },
 *    { option_name: "Size", option_value: "XL" }]
 *   → "Red / XL"
 *
 * Returns "Default Variant" when no options are present.
 */
export function getVariantLabel(
  options: ProductVariantOption[] | null | undefined
): string {
  const parts = (options ?? [])
    .map((o) => o.option_value?.trim() ?? '')
    .filter((x) => x !== '');

  if (parts.length === 0) return 'Default Variant';
  return parts.join(' / ');
}
EOF

echo "   ✓ deriveOptionsFromVariants.ts and getVariantLabel.ts written"

# =============================================================================
# PHASE 5 — MAPPER
# =============================================================================

echo ""
echo "→ Phase 5: Writing product mapper..."

mkdir -p "$SRC/lib/mappers"

cat > "$SRC/lib/mappers/products.ts" << 'EOF'
/**
 * Product data mappers.
 * Transforms raw API types to view/editor types for UI consumption.
 */

import type {
  AdminProduct,
  AdminProductOption,
  AdminProductVariant,
  Locale,
  ProductDetailView,
  ProductListItemView,
  ProductOption,
  ProductOptionValue,
  ProductTranslation,
  ProductVariant,
} from '@/types/product';

import { formatDate, formatCurrency } from '@/lib/utils/date';
import { deriveOptionsFromVariants } from '@/lib/products/deriveOptionsFromVariants';

// ── Option normalization ───────────────────────────────────────────────────

/**
 * Normalizes a raw AdminProductOption value into a ProductOptionValue.
 * Returns null if the value string is empty.
 */
function normalizeOptionValue(
  raw: { id?: unknown; value?: string | null }
): ProductOptionValue | null {
  const value =
    typeof raw.value === 'string' ? raw.value.trim() : '';

  if (!value) return null;

  const id = typeof raw.id === 'number' ? raw.id : null;
  return { id, value };
}

/**
 * Normalizes the raw options array from the backend into ProductOption[].
 * Filters out options with empty names or no valid values.
 */
export function normalizeProductOptions(
  rawOptions: AdminProductOption[] | null | undefined
): ProductOption[] {
  return (rawOptions ?? []).reduce<ProductOption[]>(
    (acc, option, index) => {
      const name =
        typeof option.name === 'string' ? option.name.trim() : '';
      const position =
        typeof option.position === 'number'
          ? option.position
          : index + 1;

      const values = (option.values ?? [])
        .map((v) => normalizeOptionValue(v))
        .filter((v): v is ProductOptionValue => v !== null);

      if (!name || values.length === 0) return acc;

      const id =
        typeof option.id === 'number' ? option.id : null;

      acc.push({ id, name, position, values });
      return acc;
    },
    []
  );
}

// ── Variant normalization ──────────────────────────────────────────────────

/**
 * Maps a raw AdminProductVariant to the internal ProductVariant shape.
 * Ensures options[] is always an array (never undefined).
 */
function normalizeVariant(raw: AdminProductVariant): ProductVariant {
  return {
    id: raw.id,
    sku: raw.sku ?? null,
    barcode: raw.barcode ?? null,
    price: raw.price ?? 0,
    compare_at_price: raw.compare_at_price ?? null,
    cost_price: raw.cost_price ?? null,
    quantity: raw.quantity ?? 0,
    low_stock_threshold: raw.low_stock_threshold ?? null,
    track_inventory: raw.track_inventory ?? true,
    weight: raw.weight ?? null,
    weight_unit: raw.weight_unit ?? null,
    is_active: raw.is_active ?? true,
    manufacture_date: raw.manufacture_date ?? null,
    expiry_date: raw.expiry_date ?? null,
    batch_number: raw.batch_number ?? null,
    options: (raw.options ?? []).filter(
      (o) =>
        typeof o.option_name === 'string' &&
        o.option_name.trim() !== '' &&
        typeof o.option_value === 'string' &&
        o.option_value.trim() !== ''
    ),
  };
}

// ── List item mapper ───────────────────────────────────────────────────────

/**
 * Maps a raw AdminProduct to a ProductListItemView for table rendering.
 */
export function mapProductListItem(
  raw: AdminProduct,
  currency: string = 'USD'
): ProductListItemView {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    status: raw.status,
    price: formatCurrency(raw.price, currency),
    compareAtPrice: raw.compare_at_price
      ? formatCurrency(raw.compare_at_price, currency)
      : null,
    quantity: raw.quantity,
    sku: raw.sku,
    firstImage: raw.images?.[0]?.url ?? null,
    category: null,
    createdAt: formatDate(raw.created_at),
  };
}

// ── Detail mapper ──────────────────────────────────────────────────────────

/**
 * Maps a raw AdminProduct to a ProductDetailView for the admin editor.
 *
 * Normalization steps:
 * 1. Build available locales from server list or translation keys.
 * 2. Fill missing locale translations with empty scaffolds.
 * 3. Normalize variants via normalizeVariant().
 * 4. Normalize options via normalizeProductOptions().
 * 5. Fallback: if options are empty but variants exist, derive options
 *    from variant option assignments to ensure editor integrity.
 */
export function mapProductDetail(raw: AdminProduct): ProductDetailView {
  const rawTranslations: Record<Locale, ProductTranslation> =
    raw.translations ?? {};

  const availableLocales: Locale[] =
    raw.available_locales && raw.available_locales.length > 0
      ? raw.available_locales
      : (Object.keys(rawTranslations) as Locale[]);

  const translations = availableLocales.reduce<
    Record<Locale, ProductTranslation>
  >((acc, locale) => {
    const existing = rawTranslations[locale];
    acc[locale] =
      existing ??
      ({
        locale,
        name: '',
        slug: '',
        description: null,
        seo_title: null,
        seo_description: null,
        is_complete: false,
      } satisfies ProductTranslation);
    return acc;
  }, {});

  const variants: ProductVariant[] = (raw.variants ?? []).map(
    (v) => normalizeVariant(v)
  );

  let options = normalizeProductOptions(raw.options);

  // Fallback: derive options from variant assignments when
  // the server does not return a top-level options list.
  if (options.length === 0 && variants.length > 0) {
    options = deriveOptionsFromVariants(variants);
  }

  return {
    id: raw.id,
    storeId: raw.store_id,
    categoryId: raw.category_id,
    brandId: raw.brand_id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description ?? '',
    price: raw.price,
    compareAtPrice: raw.compare_at_price,
    costPerItem: raw.cost_per_item,
    sku: raw.sku,
    barcode: raw.barcode,
    quantity: raw.quantity,
    trackQuantity: raw.track_quantity,
    weight: raw.weight,
    weightUnit: raw.weight_unit,
    status: raw.status,
    isFeatured: raw.is_featured ?? false,
    images: raw.images ?? [],
    createdAt: formatDate(raw.created_at),
    updatedAt: formatDate(raw.updated_at),
    variants,
    options,
    availableLocales,
    translations,
  };
}
EOF

echo "   ✓ products mapper written"

# =============================================================================
# PHASE 6 — EDITOR STATE BUILDER
# =============================================================================

echo ""
echo "→ Phase 6: Writing editor state builder..."

cat > "$SRC/lib/products/buildEditorState.ts" << 'EOF'
import type { ProductDetailView } from '@/types/product';
import type { ProductEditorState } from '@/types/product-editor';

/**
 * Builds the initial ProductEditorState from a mapped ProductDetailView.
 *
 * The editor has three independent tabs:
 * - content: status, translations, category/brand assignments
 * - structure: canonical options + generated variants
 * - media: ordered images
 *
 * This function is the single entry point for editor initialization
 * and post-save rebasing.
 */
export function buildEditorState(
  product: ProductDetailView
): ProductEditorState {
  return {
    content: {
      status: product.status,
      categoryId: product.categoryId,
      brandId: product.brandId,
      isFeatured: product.isFeatured,
      translations: product.translations,
    },

    structure: {
      options: product.options,
      variants: product.variants,
    },

    media: {
      images: product.images,
    },
  };
}
EOF

echo "   ✓ buildEditorState.ts written"

# =============================================================================
# PHASE 7 — PAYLOAD BUILDERS
# =============================================================================

echo ""
echo "→ Phase 7: Writing payload builders..."

cat > "$SRC/lib/products/buildStructurePayload.ts" << 'EOF'
import type { ProductUpdatePayload } from '@/types/product';
import type { ProductStructureState } from '@/types/product-editor';

type BuildStructurePayloadInput = {
  structure: ProductStructureState;
};

/**
 * Builds the API payload for saving the structure tab.
 *
 * Sends:
 * - sync_variants: true  (tells backend to perform full variant sync)
 * - options[]            (canonical product options with allowed values)
 * - variants[]           (each with a semantic options map)
 *
 * Variant ID handling:
 * - Positive IDs → sent as-is (existing server records)
 * - Negative IDs → sent as undefined (backend creates new record)
 *
 * Option map format:
 *   { "Color": "Red", "Size": "XL" }
 *
 * Empty option_name / option_value entries are filtered out.
 * Options with no valid values are excluded from the payload.
 */
export function buildStructurePayload(
  input: BuildStructurePayloadInput
): ProductUpdatePayload & { sync_variants: true } {
  const { structure } = input;

  // ── Canonical options payload ──────────────────────────────────
  const options = (structure.options ?? [])
    .filter((o) => o.name.trim() !== '' && o.values.length > 0)
    .map((o, index) => ({
      name: o.name.trim(),
      position: typeof o.position === 'number' ? o.position : index + 1,
      values: o.values
        .map((v) => v.value.trim())
        .filter((v) => v !== ''),
    }))
    .filter((o) => o.values.length > 0);

  // ── Variant payloads ───────────────────────────────────────────
  const variants = (structure.variants ?? []).map((v) => {
    // Convert options[] → semantic map { "Color": "Red" }
    const optionsMap: Record<string, string> = {};
    for (const opt of v.options ?? []) {
      const name = opt.option_name?.trim();
      const value = opt.option_value?.trim();
      if (name && value) {
        optionsMap[name] = value;
      }
    }

    return {
      // Only send real server IDs — negative = unsaved, omit
      id: typeof v.id === 'number' && v.id > 0 ? v.id : undefined,
      sku: v.sku ?? null,
      barcode: v.barcode ?? null,
      price: v.price,
      compare_at_price: v.compare_at_price ?? null,
      cost_price: v.cost_price ?? null,
      quantity: v.quantity,
      low_stock_threshold: v.low_stock_threshold ?? null,
      track_inventory: v.track_inventory ?? null,
      is_active: v.is_active,
      weight: v.weight ?? null,
      weight_unit: v.weight_unit ?? null,
      manufacture_date: v.manufacture_date ?? null,
      expiry_date: v.expiry_date ?? null,
      batch_number: v.batch_number ?? null,
      options: optionsMap,
    };
  });

  return {
    sync_variants: true,
    options,
    variants,
  };
}
EOF

cat > "$SRC/lib/products/buildContentPayload.ts" << 'EOF'
import type { ProductUpdatePayload } from '@/types/product';
import type { ProductContentFormValues } from '@/types/product-editor';

type BuildContentPayloadInput = {
  content: ProductContentFormValues;
};

/**
 * Builds the API payload for saving the content tab.
 *
 * Sends:
 * - is_active    (derived from status === 'active')
 * - is_featured  (optional)
 * - category_id
 * - brand_id
 * - translations[]
 *
 * Does NOT send variants or options — content tab is isolated
 * from structure changes by design.
 */
export function buildContentPayload(
  input: BuildContentPayloadInput
): ProductUpdatePayload {
  const { content } = input;

  return {
    is_active: content.status === 'active',
    is_featured: content.isFeatured ?? undefined,
    category_id: content.categoryId,
    brand_id: content.brandId,
    translations: Object.values(content.translations ?? {}).map((t) => ({
      locale: t.locale,
      name: t.name,
      slug: t.slug,
      description: t.description ?? null,
      seo_title: t.seo_title ?? null,
      seo_description: t.seo_description ?? null,
    })),
  };
}
EOF

echo "   ✓ buildStructurePayload.ts and buildContentPayload.ts written"

# =============================================================================
# PHASE 8 — VALIDATOR
# =============================================================================

echo ""
echo "→ Phase 8: Writing structure validator..."

cat > "$SRC/lib/products/validateProductStructure.ts" << 'EOF'
import type { ProductStructureState } from '@/types/product-editor';
import type { ValidationError, ValidationResult } from './validateProductContent';

/**
 * Validates product structure state before sending to the backend.
 *
 * Checks:
 * - SKU uniqueness across variants
 * - Price non-negative
 * - Quantity non-negative
 * - Expiry date not before manufacture date
 * - Every variant has an option assignment for each defined option
 *   (only when options exist)
 */
export function validateProductStructure(
  state: ProductStructureState
): ValidationResult {
  const errors: ValidationError[] = [];
  const skus = new Set<string>();

  (state.variants ?? []).forEach((v, index) => {
    const prefix = `variants.${index}`;

    // ── SKU uniqueness ───────────────────────────────────────────
    if (v.sku) {
      const normalizedSku = v.sku.trim().toLowerCase();
      if (skus.has(normalizedSku)) {
        errors.push({
          field: `${prefix}.sku`,
          message: `Duplicate SKU: ${v.sku}`,
        });
      }
      skus.add(normalizedSku);
    }

    // ── Price ────────────────────────────────────────────────────
    if (v.price < 0) {
      errors.push({
        field: `${prefix}.price`,
        message: 'Price cannot be negative.',
      });
    }

    // ── Quantity ─────────────────────────────────────────────────
    if (v.quantity < 0) {
      errors.push({
        field: `${prefix}.quantity`,
        message: 'Quantity cannot be negative.',
      });
    }

    // ── Date consistency ─────────────────────────────────────────
    if (v.manufacture_date && v.expiry_date) {
      const mDate = new Date(v.manufacture_date);
      const eDate = new Date(v.expiry_date);
      if (eDate < mDate) {
        errors.push({
          field: `${prefix}.expiry_date`,
          message: 'Expiry date cannot be before manufacture date.',
        });
      }
    }

    // ── Option coverage ──────────────────────────────────────────
    // Every variant must have an option assignment for each
    // option defined at the product level.
    if (state.options.length > 0) {
      const assignedOptionNames = new Set(
        (v.options ?? [])
          .filter(
            (o) =>
              o.option_name?.trim() !== '' &&
              o.option_value?.trim() !== ''
          )
          .map((o) => o.option_name.trim())
      );

      const missingOptions = state.options
        .map((o) => o.name.trim())
        .filter((name) => !assignedOptionNames.has(name));

      if (missingOptions.length > 0) {
        errors.push({
          field: `${prefix}.options`,
          message: `Variant is missing values for: ${missingOptions.join(', ')}.`,
        });
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}
EOF

echo "   ✓ validateProductStructure.ts written"

# =============================================================================
# PHASE 9 — PRODUCT OPTIONS SECTION (UI — value.label → value.value)
# =============================================================================

echo ""
echo "→ Phase 9: Writing ProductOptionsSection..."

mkdir -p "$SRC/app/[locale]/(admin)/stores/[storeId]/products/[productId]/_components"

cat > "$SRC/app/[locale]/(admin)/stores/[storeId]/products/[productId]/_components/ProductOptionsSection.tsx" << 'EOF'
'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import type { ProductOption } from '@/types/product';
import { getNextNegativeId } from '@/lib/products/generateVariants';

interface Props {
  options: ProductOption[];
  onChange: (options: ProductOption[]) => void;
}

/**
 * ProductOptionsSection
 *
 * Renders the canonical product options editor.
 * Each option has a name (e.g. "Color") and a list of values (e.g. "Red", "Blue").
 * Options drive variant combination generation in the Structure tab.
 *
 * Internal state uses ProductOption / ProductOptionValue types:
 * - option.name    → display name
 * - option.position → order
 * - value.value   → the string value (e.g. "Red")
 * - value.id      → null for new, number for persisted
 */
export function ProductOptionsSection({ options, onChange }: Props) {
  const t = useTranslations('products');

  // ── ID generators ────────────────────────────────────────────────────────

  const nextOptionId = () => {
    const existing = (options ?? []).flatMap((o) =>
      typeof o.id === 'number' ? [{ id: o.id }] : []
    );
    return getNextNegativeId(existing);
  };

  const nextValueId = (optionIndex: number) => {
    const existing = (options?.[optionIndex]?.values ?? []).flatMap((v) =>
      typeof v.id === 'number' ? [{ id: v.id }] : []
    );
    return getNextNegativeId(existing);
  };

  const nextGlobalValueId = () => {
    const existing = (options ?? []).flatMap((o) =>
      (o.values ?? []).flatMap((v) =>
        typeof v.id === 'number' ? [{ id: v.id }] : []
      )
    );
    return getNextNegativeId(existing);
  };

  // ── Option mutations ─────────────────────────────────────────────────────

  const updateOption = (index: number, patch: Partial<ProductOption>) => {
    onChange(
      options.map((opt, i) => (i === index ? { ...opt, ...patch } : opt))
    );
  };

  const addOption = () => {
    const nextPos = options.length + 1;
    const newOption: ProductOption = {
      id: nextOptionId(),
      name: '',
      position: nextPos,
      values: [{ id: nextGlobalValueId(), value: '' }],
    };
    onChange([...options, newOption]);
  };

  const removeOption = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };

  // ── Value mutations ──────────────────────────────────────────────────────

  const addValue = (optionIndex: number) => {
    updateOption(optionIndex, {
      values: [
        ...options[optionIndex].values,
        { id: nextValueId(optionIndex), value: '' },
      ],
    });
  };

  const removeValue = (optionIndex: number, valueIndex: number) => {
    updateOption(optionIndex, {
      values: options[optionIndex].values.filter(
        (_, vi) => vi !== valueIndex
      ),
    });
  };

  const updateValue = (
    optionIndex: number,
    valueIndex: number,
    value: string
  ) => {
    updateOption(optionIndex, {
      values: options[optionIndex].values.map((v, vi) =>
        vi === valueIndex ? { ...v, value } : v
      ),
    });
  };

  // ── Empty state ──────────────────────────────────────────────────────────

  if (options.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {t('variantEditor.options.noOptions')}
        </p>
        <Button type="button" variant="outline" onClick={addOption}>
          {t('variantEditor.options.addOption')}
        </Button>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {options.map((option, optIdx) => (
        <section
          key={option.id ?? `option-${optIdx}`}
          className="space-y-4 rounded-lg border p-4"
        >
          {/* Option header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1">
              <h3 className="text-sm font-medium leading-6 wrap-break-word">
                {option.name.trim() ||
                  t('variantEditor.options.optionName')}
              </h3>
              <p className="text-xs text-muted-foreground">
                {option.values.length > 0
                  ? t('variantEditor.options.valuesCount', {
                      count: option.values.length,
                    })
                  : t('variantEditor.options.noValues')}
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={() => removeOption(optIdx)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Option name input */}
          <Input
            placeholder={t('variantEditor.options.optionName')}
            value={option.name}
            onChange={(e) =>
              updateOption(optIdx, { name: e.target.value })
            }
          />

          {/* Value preview badges */}
          <div className="flex flex-wrap gap-2">
            {option.values
              .filter((v) => v.value.trim().length > 0)
              .map((v, valueIdx) => (
                <span
                  key={v.id ?? `preview-${optIdx}-${valueIdx}`}
                  className="inline-flex max-w-full items-center rounded-full border bg-muted px-3 py-1 text-sm leading-6 wrap-break-word"
                >
                  {v.value}
                </span>
              ))}
          </div>

          {/* Value inputs */}
          <div className="grid gap-2 md:grid-cols-2">
            {option.values.map((val, valIdx) => (
              <div
                key={val.id ?? `val-${optIdx}-${valIdx}`}
                className="flex min-w-0 items-center gap-2 rounded-lg border bg-background px-3 py-2"
              >
                <Input
                  className="h-auto min-w-0 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:border-transparent focus-visible:ring-0"
                  value={val.value}
                  onChange={(e) =>
                    updateValue(optIdx, valIdx, e.target.value)
                  }
                  placeholder={t('variantEditor.options.addValue')}
                />
                <button
                  type="button"
                  onClick={() => removeValue(optIdx, valIdx)}
                  className="rounded-full p-1 transition-colors hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => addValue(optIdx)}
          >
            {t('variantEditor.options.addValue')}
          </Button>
        </section>
      ))}

      <Button type="button" variant="outline" onClick={addOption}>
        {t('variantEditor.options.addOption')}
      </Button>
    </div>
  );
}
EOF

echo "   ✓ ProductOptionsSection.tsx written"

# =============================================================================
# PHASE 10 — TESTS
# =============================================================================

echo ""
echo "→ Phase 10: Writing tests..."

mkdir -p "$SRC/lib/products/__tests__"
mkdir -p "$SRC/app/[locale]/(admin)/stores/[storeId]/products/[productId]/_components/__tests__"

# -----------------------------------------------------------------------------
# Test: variant-signatures.test.ts
# -----------------------------------------------------------------------------
cat > "$SRC/lib/products/__tests__/variant-signatures.test.ts" << 'EOF'
import { buildVariantSignature } from '../variant-signatures';
import type { ProductVariantOption } from '@/types/product';

describe('buildVariantSignature', () => {
  it('creates a deterministic signature from option assignments', () => {
    const options: ProductVariantOption[] = [
      { option_name: 'Color', option_value: 'Red' },
      { option_name: 'Size', option_value: 'Large' },
    ];
    expect(buildVariantSignature(options)).toBe('Color:Red|Size:Large');
  });

  it('is option-order independent (sorts by name)', () => {
    const opts1: ProductVariantOption[] = [
      { option_name: 'Color', option_value: 'Red' },
      { option_name: 'Size', option_value: 'Large' },
    ];
    const opts2: ProductVariantOption[] = [
      { option_name: 'Size', option_value: 'Large' },
      { option_name: 'Color', option_value: 'Red' },
    ];
    expect(buildVariantSignature(opts1)).toBe(
      buildVariantSignature(opts2)
    );
  });

  it('filters out entries with empty option_name', () => {
    const options: ProductVariantOption[] = [
      { option_name: 'Color', option_value: 'Red' },
      { option_name: '', option_value: 'Large' },
    ];
    expect(buildVariantSignature(options)).toBe('Color:Red');
  });

  it('filters out entries with empty option_value', () => {
    const options: ProductVariantOption[] = [
      { option_name: 'Color', option_value: 'Red' },
      { option_name: 'Size', option_value: '' },
    ];
    expect(buildVariantSignature(options)).toBe('Color:Red');
  });

  it('trims whitespace from names and values', () => {
    const options: ProductVariantOption[] = [
      { option_name: '  Color  ', option_value: '  Red  ' },
    ];
    expect(buildVariantSignature(options)).toBe('Color:Red');
  });

  it('returns empty string for empty array', () => {
    expect(buildVariantSignature([])).toBe('');
  });

  it('different values produce different signatures', () => {
    const opts1: ProductVariantOption[] = [
      { option_name: 'Color', option_value: 'Red' },
    ];
    const opts2: ProductVariantOption[] = [
      { option_name: 'Color', option_value: 'Blue' },
    ];
    expect(buildVariantSignature(opts1)).not.toBe(
      buildVariantSignature(opts2)
    );
  });
});
EOF

# -----------------------------------------------------------------------------
# Test: generateVariants.test.ts
# -----------------------------------------------------------------------------
cat > "$SRC/lib/products/__tests__/generateVariants.test.ts" << 'EOF'
import { generateVariants, getNextNegativeId } from '../generateVariants';
import type { ProductOption, ProductVariant } from '@/types/product';

const options: ProductOption[] = [
  {
    id: 1,
    name: 'Color',
    position: 1,
    values: [
      { id: 10, value: 'Red' },
      { id: 11, value: 'Blue' },
    ],
  },
  {
    id: 2,
    name: 'Size',
    position: 2,
    values: [
      { id: 20, value: 'S' },
      { id: 21, value: 'M' },
    ],
  },
];

describe('generateVariants', () => {
  it('generates all combinations when no existing variants', () => {
    const variants = generateVariants(options, []);
    expect(variants).toHaveLength(4);
    expect(variants.every((v) => v.id < 0)).toBe(true);
  });

  it('each generated variant has correct options assignments', () => {
    const variants = generateVariants(options, []);
    const signatures = variants.map((v) =>
      v.options
        .slice()
        .sort((a, b) => a.option_name.localeCompare(b.option_name))
        .map((o) => `${o.option_name}:${o.option_value}`)
        .join('|')
    );
    expect(signatures).toContain('Color:Red|Size:S');
    expect(signatures).toContain('Color:Red|Size:M');
    expect(signatures).toContain('Color:Blue|Size:S');
    expect(signatures).toContain('Color:Blue|Size:M');
  });

  it('preserves existing variants by signature', () => {
    const existing: ProductVariant[] = [
      {
        id: 100,
        sku: 'RED-S',
        price: 50,
        quantity: 5,
        is_active: true,
        options: [
          { option_name: 'Color', option_value: 'Red' },
          { option_name: 'Size', option_value: 'S' },
        ],
      },
    ];

    const variants = generateVariants(options, existing);
    expect(variants).toHaveLength(4);

    const preserved = variants.find((v) => v.id === 100);
    expect(preserved).toBeDefined();
    expect(preserved?.sku).toBe('RED-S');
    expect(preserved?.price).toBe(50);
  });

  it('removes stale variants not matching any current combination', () => {
    const existing: ProductVariant[] = [
      {
        id: 101,
        sku: 'OLD-VARIANT',
        price: 50,
        quantity: 5,
        is_active: true,
        options: [
          { option_name: 'Color', option_value: 'Ghost' },
        ],
      },
    ];

    const variants = generateVariants(options, existing);
    expect(variants).toHaveLength(4);
    expect(variants.find((v) => v.id === 101)).toBeUndefined();
  });

  it('assigns stable negative IDs that do not collide', () => {
    const existing = [{ id: -1 } as ProductVariant, { id: 100 } as ProductVariant];
    const nextId = getNextNegativeId(existing);
    expect(nextId).toBe(-2);
  });

  it('handles empty options by returning empty array', () => {
    expect(generateVariants([], [])).toEqual([]);
  });

  it('handles repeated generation cycles without duplication', () => {
    let variants = generateVariants(options, []);
    const firstCycleLength = variants.length;

    variants = generateVariants(options, variants);
    expect(variants).toHaveLength(firstCycleLength);
    // All should be preserved — no new IDs allocated
    expect(variants.every((v) => v.id < 0)).toBe(true);
  });

  it('guards against duplicate signatures from malformed option states', () => {
    const malformedOptions: ProductOption[] = [
      {
        id: 1,
        name: 'Color',
        position: 1,
        values: [
          { id: 10, value: 'Red' },
          { id: 10, value: 'Red' }, // duplicate
        ],
      },
      {
        id: 2,
        name: 'Size',
        position: 2,
        values: [
          { id: 20, value: 'S' },
          { id: 20, value: 'S' }, // duplicate
        ],
      },
    ];

    const variants = generateVariants(malformedOptions, []);
    expect(variants).toHaveLength(1);
    expect(variants[0]?.options).toEqual(
      expect.arrayContaining([
        { option_name: 'Color', option_value: 'Red' },
        { option_name: 'Size', option_value: 'S' },
      ])
    );
  });

  it('new variants inherit price from first existing variant', () => {
    const existing: ProductVariant[] = [
      {
        id: 100,
        sku: 'RED-S',
        price: 75,
        quantity: 3,
        is_active: true,
        options: [
          { option_name: 'Color', option_value: 'Red' },
          { option_name: 'Size', option_value: 'S' },
        ],
      },
    ];

    const variants = generateVariants(options, existing);
    const newVariants = variants.filter((v) => v.id < 0);
    expect(newVariants.every((v) => v.price === 75)).toBe(true);
  });
});
EOF

# -----------------------------------------------------------------------------
# Test: deriveOptionsFromVariants.test.ts
# -----------------------------------------------------------------------------
cat > "$SRC/lib/products/__tests__/deriveOptionsFromVariants.test.ts" << 'EOF'
import { deriveOptionsFromVariants } from '../deriveOptionsFromVariants';
import type { ProductVariant } from '@/types/product';

describe('deriveOptionsFromVariants', () => {
  it('derives options and values from variant option assignments', () => {
    const variants: ProductVariant[] = [
      {
        id: 1,
        sku: null,
        price: 10,
        quantity: 5,
        is_active: true,
        options: [
          { option_name: 'Color', option_value: 'Red' },
          { option_name: 'Size', option_value: 'S' },
        ],
      },
      {
        id: 2,
        sku: null,
        price: 10,
        quantity: 5,
        is_active: true,
        options: [
          { option_name: 'Color', option_value: 'Blue' },
          { option_name: 'Size', option_value: 'S' },
        ],
      },
    ];

    const options = deriveOptionsFromVariants(variants);

    expect(options).toHaveLength(2);

    const colorOption = options.find((o) => o.name === 'Color');
    expect(colorOption).toBeDefined();
    expect(colorOption?.values.map((v) => v.value)).toContain('Red');
    expect(colorOption?.values.map((v) => v.value)).toContain('Blue');
    expect(colorOption?.id).toBeNull();

    const sizeOption = options.find((o) => o.name === 'Size');
    expect(sizeOption).toBeDefined();
    expect(sizeOption?.values).toHaveLength(1);
    expect(sizeOption?.values[0].value).toBe('S');
  });

  it('returns empty array for empty variants', () => {
    expect(deriveOptionsFromVariants([])).toEqual([]);
  });

  it('skips entries with empty option_name or option_value', () => {
    const variants: ProductVariant[] = [
      {
        id: 1,
        sku: null,
        price: 10,
        quantity: 0,
        is_active: true,
        options: [
          { option_name: '', option_value: 'Red' },
          { option_name: 'Size', option_value: '' },
          { option_name: 'Color', option_value: 'Blue' },
        ],
      },
    ];

    const options = deriveOptionsFromVariants(variants);
    expect(options).toHaveLength(1);
    expect(options[0].name).toBe('Color');
  });

  it('deduplicates values for the same option across variants', () => {
    const variants: ProductVariant[] = [
      {
        id: 1,
        sku: null,
        price: 10,
        quantity: 0,
        is_active: true,
        options: [{ option_name: 'Size', option_value: 'S' }],
      },
      {
        id: 2,
        sku: null,
        price: 10,
        quantity: 0,
        is_active: true,
        options: [{ option_name: 'Size', option_value: 'S' }],
      },
    ];

    const options = deriveOptionsFromVariants(variants);
    expect(options[0].values).toHaveLength(1);
  });

  it('assigns positions by insertion order', () => {
    const variants: ProductVariant[] = [
      {
        id: 1,
        sku: null,
        price: 10,
        quantity: 0,
        is_active: true,
        options: [
          { option_name: 'Color', option_value: 'Red' },
          { option_name: 'Size', option_value: 'S' },
        ],
      },
    ];

    const options = deriveOptionsFromVariants(variants);
    expect(options[0].position).toBe(1);
    expect(options[1].position).toBe(2);
  });
});
EOF

# -----------------------------------------------------------------------------
# Test: buildStructurePayload.test.ts
# -----------------------------------------------------------------------------
cat > "$SRC/lib/products/__tests__/buildStructurePayload.test.ts" << 'EOF'
import { buildStructurePayload } from '../buildStructurePayload';
import type { ProductStructureState } from '@/types/product-editor';

describe('buildStructurePayload', () => {
  it('builds sync_variants flag, options, and variant semantic maps', () => {
    const structure: ProductStructureState = {
      options: [
        {
          id: 1,
          name: 'Color',
          position: 1,
          values: [
            { id: 10, value: 'Red' },
            { id: 11, value: 'Blue' },
          ],
        },
        {
          id: 2,
          name: 'Size',
          position: 2,
          values: [
            { id: 20, value: 'S' },
          ],
        },
      ],
      variants: [
        {
          id: 100,
          sku: 'RED-S',
          price: 29.99,
          quantity: 5,
          is_active: true,
          options: [
            { option_name: 'Color', option_value: 'Red' },
            { option_name: 'Size', option_value: 'S' },
          ],
        },
        {
          id: -1, // unsaved
          sku: null,
          price: 29.99,
          quantity: 0,
          is_active: true,
          options: [
            { option_name: 'Color', option_value: 'Blue' },
            { option_name: 'Size', option_value: 'S' },
          ],
        },
      ],
    };

    const payload = buildStructurePayload({ structure });

    expect(payload.sync_variants).toBe(true);

    // Options payload
    expect(payload.options).toHaveLength(2);
    expect(payload.options?.[0]).toEqual({
      name: 'Color',
      position: 1,
      values: ['Red', 'Blue'],
    });
    expect(payload.options?.[1]).toEqual({
      name: 'Size',
      position: 2,
      values: ['S'],
    });

    // Variants payload
    expect(payload.variants).toHaveLength(2);

    // Existing variant — id sent
    const v1 = payload.variants?.[0];
    expect(v1?.id).toBe(100);
    expect(v1?.sku).toBe('RED-S');
    expect(v1?.options).toEqual({ Color: 'Red', Size: 'S' });

    // Unsaved variant — id omitted
    const v2 = payload.variants?.[1];
    expect(v2?.id).toBeUndefined();
    expect(v2?.options).toEqual({ Color: 'Blue', Size: 'S' });
  });

  it('filters options with empty names', () => {
    const structure: ProductStructureState = {
      options: [
        {
          id: null,
          name: '',
          position: 1,
          values: [{ id: null, value: 'Red' }],
        },
        {
          id: 1,
          name: 'Color',
          position: 2,
          values: [{ id: 10, value: 'Red' }],
        },
      ],
      variants: [],
    };

    const payload = buildStructurePayload({ structure });
    expect(payload.options).toHaveLength(1);
    expect(payload.options?.[0].name).toBe('Color');
  });

  it('filters options with no valid values', () => {
    const structure: ProductStructureState = {
      options: [
        {
          id: 1,
          name: 'Color',
          position: 1,
          values: [{ id: null, value: '  ' }], // whitespace only
        },
      ],
      variants: [],
    };

    const payload = buildStructurePayload({ structure });
    expect(payload.options).toHaveLength(0);
  });

  it('filters out empty option_name/option_value from variant map', () => {
    const structure: ProductStructureState = {
      options: [],
      variants: [
        {
          id: 1,
          sku: 'SKU1',
          price: 10,
          quantity: 0,
          is_active: true,
          options: [
            { option_name: 'Color', option_value: 'Red' },
            { option_name: '', option_value: 'Large' },    // filtered
            { option_name: 'Size', option_value: '' },     // filtered
          ],
        },
      ],
    };

    const payload = buildStructurePayload({ structure });
    expect(payload.variants?.[0].options).toEqual({ Color: 'Red' });
  });

  it('handles empty variants', () => {
    const payload = buildStructurePayload({
      structure: { options: [], variants: [] },
    });
    expect(payload.variants).toEqual([]);
    expect(payload.options).toEqual([]);
  });
});
EOF

# -----------------------------------------------------------------------------
# Test: EditProductForm.test.ts
# -----------------------------------------------------------------------------
cat > "$SRC/app/[locale]/(admin)/stores/[storeId]/products/[productId]/_components/__tests__/EditProductForm.test.ts" << 'EOF'
/// <reference types="jest" />

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    message: jest.fn(),
  },
}));

jest.mock('@/hooks/products/useSaveProductContent', () => ({
  useSaveProductContent: () => ({ mutate: jest.fn(), isPending: false }),
}));

jest.mock('@/hooks/products/useSaveProductStructure', () => ({
  useSaveProductStructure: () => ({ mutate: jest.fn(), isPending: false }),
}));

jest.mock('@/hooks/useUnsavedChangesGuard', () => ({
  useUnsavedChangesGuard: () => ({ bypassNextNavigation: jest.fn() }),
}));

jest.mock('@/components/ui/button', () => ({ Button: () => null }));
jest.mock('@/components/ui/tabs', () => ({
  Tabs: () => null,
  TabsContent: () => null,
  TabsList: () => null,
  TabsTrigger: () => null,
}));
jest.mock('../_tabs/ContentTab', () => ({ ContentTab: () => null }));
jest.mock('../_tabs/StructureTab', () => ({ StructureTab: () => null }));
jest.mock('../_tabs/MediaTab', () => ({ MediaTab: () => null }));
jest.mock('../DeleteProductButton', () => ({
  __esModule: true,
  default: () => null,
}));

import type { AdminProduct } from '@/types/product';
import {
  buildDiscardState,
  buildRebasedEditorState,
  isEditorSaveBlocked,
} from '../EditProductForm';

function makeAdminProduct(
  overrides: Partial<AdminProduct> = {}
): AdminProduct {
  return {
    id: 1,
    store_id: 7,
    name: 'Test Product',
    slug: 'test-product',
    description: 'Description',
    price: 99,
    compare_at_price: null,
    cost_per_item: null,
    sku: null,
    barcode: null,
    quantity: 10,
    track_quantity: true,
    weight: null,
    weight_unit: null,
    status: 'draft',
    is_featured: false,
    images: [],
    variants: [
      {
        id: 101,
        sku: 'SKU-101',
        price: 10,
        quantity: 5,
        is_active: true,
        options: [
          { option_name: 'Color', option_value: 'Red' },
        ],
      },
    ],
    options: [
      {
        id: 1,
        name: 'Color',
        position: 1,
        values: [{ id: 10, value: 'Red' }],
      },
    ],
    category_id: 11,
    brand_id: 12,
    available_locales: ['en'],
    translations: {
      en: {
        locale: 'en',
        name: 'Test Product',
        slug: 'test-product',
        description: 'Description',
        seo_title: null,
        seo_description: null,
        is_complete: true,
      },
    },
    created_at: '2026-05-11T10:00:00.000Z',
    updated_at: '2026-05-11T10:00:00.000Z',
    ...overrides,
  };
}

describe('EditProductForm helpers', () => {
  it('rebases baseline so discard restores the latest saved state', () => {
    const initialState = buildRebasedEditorState(makeAdminProduct());

    const savedState = buildRebasedEditorState(
      makeAdminProduct({
        status: 'active',
        images: [{ id: 9, url: '/saved.png', alt: 'saved', position: 1 }],
        variants: [
          {
            id: 201,
            sku: 'SKU-SAVED',
            price: 25,
            quantity: 2,
            is_active: false,
            options: [
              { option_name: 'Color', option_value: 'Blue' },
            ],
          },
        ],
        translations: {
          en: {
            locale: 'en',
            name: 'Saved Product',
            slug: 'saved-product',
            description: 'Saved description',
            seo_title: null,
            seo_description: null,
            is_complete: true,
          },
        },
      })
    );

    const discardState = buildDiscardState(savedState);

    expect(discardState.content).toEqual(savedState.content);
    expect(discardState.structure).toEqual(savedState.structure);
    expect(discardState.images).toEqual(savedState.media.images);
    expect(discardState.content).not.toEqual(initialState.content);
    expect(discardState.contentDirty).toBe(false);
    expect(discardState.structureDirty).toBe(false);
    expect(discardState.mediaDirty).toBe(false);
    expect(discardState.validationErrors).toEqual([]);
  });

  it('blocks save after discard clears dirty state', () => {
    const discardState = buildDiscardState(
      buildRebasedEditorState(makeAdminProduct())
    );
    const dirtyAfterDiscard =
      discardState.contentDirty ||
      discardState.structureDirty ||
      discardState.mediaDirty;

    expect(dirtyAfterDiscard).toBe(false);
    expect(
      isEditorSaveBlocked({
        isDirty: dirtyAfterDiscard,
        isDiscarding: true,
        isPending: false,
      })
    ).toBe(true);
    expect(
      isEditorSaveBlocked({
        isDirty: true,
        isDiscarding: false,
        isPending: false,
      })
    ).toBe(false);
  });

  it('preserves variant active state independently from product status', () => {
    const rebasedState = buildRebasedEditorState(
      makeAdminProduct({
        status: 'active',
        variants: [
          {
            id: 201,
            sku: null,
            price: 10,
            quantity: 0,
            is_active: false,
            options: [{ option_name: 'Color', option_value: 'Red' }],
          },
          {
            id: 202,
            sku: 'SKU-202',
            price: 10,
            quantity: 0,
            is_active: true,
            options: [{ option_name: 'Color', option_value: 'Blue' }],
          },
        ],
        options: [
          {
            id: 1,
            name: 'Color',
            position: 1,
            values: [
              { id: 10, value: 'Red' },
              { id: 11, value: 'Blue' },
            ],
          },
        ],
      })
    );

    expect(rebasedState.content.status).toBe('active');
    expect(rebasedState.structure.variants[0].is_active).toBe(false);
    expect(rebasedState.structure.variants[1].is_active).toBe(true);
  });
});
EOF

# -----------------------------------------------------------------------------
# Test: structure-save-regeneration.test.ts
# -----------------------------------------------------------------------------
cat > "$SRC/app/[locale]/(admin)/stores/[storeId]/products/[productId]/_components/__tests__/structure-save-regeneration.test.ts" << 'EOF'
/// <reference types="jest" />

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn(), message: jest.fn() },
}));

jest.mock('@/lib/navigation', () => ({
  Link: () => null,
  redirect: jest.fn(),
  usePathname: jest.fn(),
  useRouter: jest.fn(),
  getPathname: jest.fn(),
}));

jest.mock('@/lib/products/generateVariants', () => ({
  generateVariants: jest.fn(),
}));

import { generateVariants } from '@/lib/products/generateVariants';
import { buildNextStructureForSave } from '../EditProductForm';
import type { ProductStructureState } from '@/types/product-editor';

describe('structure save regeneration', () => {
  it('regenerates variants from current options before save serialization', () => {
    const structure: ProductStructureState = {
      options: [
        {
          id: 1,
          name: 'Color',
          position: 1,
          values: [{ id: 10, value: 'Red' }],
        },
      ],
      variants: [
        {
          id: 101,
          sku: 'SKU-OLD',
          price: 10,
          quantity: 5,
          is_active: true,
          options: [],
        },
      ],
    };

    const regenerated = [
      {
        id: 102,
        sku: 'SKU-NEW',
        price: 10,
        quantity: 5,
        is_active: true,
        options: [{ option_name: 'Color', option_value: 'Red' }],
      },
    ];

    (generateVariants as jest.Mock).mockReturnValue(regenerated);

    const nextStructure = buildNextStructureForSave(structure);

    expect(generateVariants).toHaveBeenCalledTimes(1);
    expect(generateVariants).toHaveBeenCalledWith(
      structure.options,
      structure.variants
    );
    expect(nextStructure.variants).toBe(regenerated);
  });
});
EOF

echo "   ✓ Tests written (5 files)"

# =============================================================================
# DONE
# =============================================================================

echo ""
echo "============================================="
echo " ✅ Frontend migration script complete"
echo "============================================="
echo ""
echo " Files written:"
echo ""
echo " Types (2):"
echo "   src/types/product.ts                    (UPDATED)"
echo "   src/types/product-editor.ts             (UPDATED)"
echo ""
echo " Core logic (6):"
echo "   src/lib/products/variant-signatures.ts  (UPDATED)"
echo "   src/lib/products/generateVariants.ts    (UPDATED)"
echo "   src/lib/products/deriveOptionsFromVariants.ts (UPDATED)"
echo "   src/lib/products/getVariantLabel.ts     (UPDATED)"
echo "   src/lib/products/buildEditorState.ts    (UPDATED)"
echo "   src/lib/products/validateProductStructure.ts (UPDATED)"
echo ""
echo " Payload builders (2):"
echo "   src/lib/products/buildStructurePayload.ts (UPDATED)"
echo "   src/lib/products/buildContentPayload.ts   (UPDATED)"
echo ""
echo " Mapper (1):"
echo "   src/lib/mappers/products.ts             (UPDATED)"
echo ""
echo " UI component (1):"
echo "   ...products/[productId]/_components/ProductOptionsSection.tsx (UPDATED)"
echo ""
echo " Tests (5):"
echo "   src/lib/products/__tests__/variant-signatures.test.ts    (UPDATED)"
echo "   src/lib/products/__tests__/generateVariants.test.ts      (UPDATED)"
echo "   src/lib/products/__tests__/deriveOptionsFromVariants.test.ts (UPDATED)"
echo "   src/lib/products/__tests__/buildStructurePayload.test.ts (UPDATED)"
echo "   .../_components/__tests__/EditProductForm.test.ts        (UPDATED)"
echo "   .../_components/__tests__/structure-save-regeneration.test.ts (UPDATED)"
echo ""
echo "============================================="
echo " Next steps:"
echo "============================================="
echo ""
echo " 1. Run the test suite:"
echo "    npm test"
echo ""
echo " 2. Check TypeScript:"
echo "    npx tsc --noEmit"
echo ""
echo " 3. Verify in browser:"
echo "    - Load existing product editor"
echo "    - Confirm options display correctly"
echo "    - Add an option + values → Generate Combinations"
echo "    - Edit SKU/price in VariantsTable"
echo "    - Save structure → inspect network payload"
echo "    - Reload page → confirm rebased state matches"
echo "    - Discard → confirm reverts to last saved"
echo ""
echo " 4. Out of scope (separate migration):"
echo "    - CreateProductForm (still uses flat payload)"
echo "    - ProductFormSchema (still flat form schema)"
echo "    - VariantFormItem / ProductVariantInput (legacy cleanup)"
echo ""
