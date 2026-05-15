#!/usr/bin/env bash
# =============================================================================
# fix-variant-media.sh
# Implements variant media in both Create wizard and Edit product flows.
#
# Changes:
#  1.  types/product.ts          — add media to AdminProductVariant + ProductVariant
#  2.  types/product-editor.ts   — no change needed (already correct)
#  3.  lib/mappers/products.ts   — map variant media in normalizeVariant
#  4.  lib/products/buildStructurePayload.ts — include variants[].media
#  5.  lib/products/buildCreatePayload.ts    — include variants[].media
#  6.  lib/products/buildEditorState.ts      — no change needed
#  7.  _components/VariantMediaDialog.tsx    — NEW reusable dialog
#  8.  _components/_components/VariantsTable.tsx — add Media column
#  9.  components/shared/create-product/CreateProductStructureStep.tsx — unchanged (uses VariantsTable)
# 10.  components/shared/create-product/CreateProductReviewStep.tsx    — show variant media summary
# 11.  lib/products/__tests__/buildStructurePayload.test.ts — add media tests
# 12.  lib/products/__tests__/buildCreatePayload.test.ts    — add media tests
# 13.  locales/en/common.json + locales/ar/common.json      — new keys (delegate marker)
# =============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$ROOT/src"

echo "==> Implementing variant media..."

# =============================================================================
# 1. src/types/product.ts
#    Add media?: ProductImage[] to AdminProductVariant and ProductVariant
# =============================================================================
cat > "$SRC/types/product.ts" << 'TYPESCRIPT'
/**
 * Product types for the admin dashboard.
 * Aligned with canonical options + semantic variant map architecture.
 */

// ── Primitives ────────────────────────────────────────────────────────────

export type ProductStatus  = 'active' | 'draft';
export type Locale         = string;
export type ProductEntityId = number;
export type WeightUnit     = 'kg' | 'g' | 'lb' | 'oz';

// ── Images ────────────────────────────────────────────────────────────────

export interface ProductImage {
  id:       number;
  url:      string;
  alt:      string | null;
  position: number;
}

// ── Translations ──────────────────────────────────────────────────────────

export interface ProductTranslation {
  locale:          Locale;
  name:            string;
  slug:            string;
  description:     string | null;
  seo_title:       string | null;
  seo_description: string | null;
  is_complete?:    boolean;
}

// ── Options ───────────────────────────────────────────────────────────────

export interface ProductOptionValue {
  id?:   ProductEntityId | null;
  value: string;
}

export interface ProductOption {
  id?:      ProductEntityId | null;
  name:     string;
  position: number;
  values:   ProductOptionValue[];
}

export interface AdminProductOption {
  id?:       ProductEntityId | null;
  name?:     string | null;
  position?: number | null;
  values?:   Array<{
    id?:    ProductEntityId | null;
    value?: string | null;
  }> | null;
}

// ── Variants ──────────────────────────────────────────────────────────────

export interface ProductVariantOption {
  option_name:  string;
  option_value: string;
}

/**
 * Raw admin variant shape returned by the backend.
 * media[] is optional — not all variants have custom images.
 */
export interface AdminProductVariant {
  id:                   number;
  sku:                  string | null;
  barcode?:             string | null;
  price:                number;
  compare_at_price?:    number | null;
  cost_price?:          number | null;
  quantity:             number;
  low_stock_threshold?: number | null;
  track_inventory?:     boolean;
  weight?:              number | null;
  weight_unit?:         WeightUnit | null;
  is_active:            boolean;
  manufacture_date?:    string | null;
  expiry_date?:         string | null;
  batch_number?:        string | null;
  options:              ProductVariantOption[];
  /** Variant-specific images. Falls back to product-level media when empty. */
  media?:               ProductImage[];
}

/**
 * Client-side variant — mirrors AdminProductVariant but with
 * negative IDs allowed for unsaved records.
 * media[] is always present (normalised to [] when absent).
 */
export interface ProductVariant {
  id:                   number;
  sku:                  string | null;
  barcode?:             string | null;
  price:                number;
  compare_at_price?:    number | null;
  cost_price?:          number | null;
  quantity:             number;
  low_stock_threshold?: number | null;
  track_inventory?:     boolean;
  weight?:              number | null;
  weight_unit?:         WeightUnit | null;
  is_active:            boolean;
  manufacture_date?:    string | null;
  expiry_date?:         string | null;
  batch_number?:        string | null;
  options:              ProductVariantOption[];
  /** Variant-specific images. Empty array = use product media as fallback. */
  media:                ProductImage[];
}

// ── Admin API Response Types ──────────────────────────────────────────────

export interface AdminProduct {
  id:               number;
  store_id:         number;
  name:             string;
  slug:             string;
  description:      string | null;
  price:            number;
  compare_at_price: number | null;
  cost_per_item:    number | null;
  sku:              string | null;
  barcode:          string | null;
  quantity:         number;
  track_quantity:   boolean;
  weight:           number | null;
  weight_unit:      WeightUnit | null;
  status:           ProductStatus;
  is_featured?:     boolean;
  media:            ProductImage[];
  variants:         AdminProductVariant[];
  options?:         AdminProductOption[] | null;
  category_id:      number | null;
  brand_id:         number | null;
  /** Backend returns tag stubs — mapper extracts IDs. */
  tags?:            Array<{ id: number }>;
  available_locales?: Locale[];
  translations?:    Record<Locale, ProductTranslation>;
  created_at:       string;
  updated_at:       string;
}

// ── View Types (post-mapper) ──────────────────────────────────────────────

export interface ProductListItemView {
  id:             number;
  name:           string;
  slug:           string;
  status:         ProductStatus;
  price:          string;
  compareAtPrice: string | null;
  quantity:       number;
  sku:            string | null;
  firstImage:     string | null;
  category:       string | null;
  createdAt:      string;
}

export interface ProductDetailView {
  id:              number;
  storeId:         number;
  categoryId:      number | null;
  brandId:         number | null;
  name:            string;
  slug:            string;
  description:     string;
  price:           number;
  compareAtPrice:  number | null;
  costPerItem:     number | null;
  sku:             string | null;
  barcode:         string | null;
  quantity:        number;
  trackQuantity:   boolean;
  weight:          number | null;
  weightUnit:      WeightUnit | null;
  status:          ProductStatus;
  isFeatured:      boolean;
  tags:            number[];
  media:           ProductImage[];
  createdAt:       string;
  updatedAt:       string;
  variants:        ProductVariant[];
  options:         ProductOption[];
  availableLocales: Locale[];
  translations:    Record<Locale, ProductTranslation>;
}

// ── API Payload Types ─────────────────────────────────────────────────────

export interface ProductUpdatePayload {
  category_id?:  number | null;
  brand_id?:     number | null;
  is_active?:    boolean | null;
  is_featured?:  boolean | null;
  translations?: Array<{
    locale:          string;
    name:            string;
    slug:            string;
    description?:    string | null;
    seo_title?:      string | null;
    seo_description?: string | null;
  }>;
  sync_variants?: boolean;
  options?: Array<{
    name:     string;
    position: number;
    values:   string[];
  }>;
  variants?: Array<{
    id?:                  number | null;
    sku:                  string | null;
    barcode?:             string | null;
    price:                number;
    compare_at_price?:    number | null;
    cost_price?:          number | null;
    quantity:             number;
    low_stock_threshold?: number | null;
    track_inventory?:     boolean | null;
    is_active?:           boolean | null;
    weight?:              number | null;
    weight_unit?:         string | null;
    manufacture_date?:    string | null;
    expiry_date?:         string | null;
    batch_number?:        string | null;
    options?:             Record<string, string>;
    /** Variant-level media. Omitted = no change. Empty = clear. */
    media?: Array<{
      id?:       number;
      url:       string;
      alt?:      string | null;
      position?: number;
    }>;
  }>;
  tags?: number[];
  media?: Array<{
    id?:       number;
    url:       string;
    alt?:      string | null;
    position?: number;
  }>;
}

export interface ProductCreatePayload {
  status:        ProductStatus;
  category_id?:  number | null;
  brand_id?:     number | null;
  is_featured?:  boolean;
  translations: Array<{
    locale:           string;
    name:             string;
    slug:             string;
    description?:     string | null;
    seo_title?:       string | null;
    seo_description?: string | null;
  }>;
  options?: Array<{
    name:     string;
    position: number;
    values:   string[];
  }>;
  variants: Array<{
    id?:                  number;
    sku:                  string | null;
    barcode?:             string | null;
    price:                number;
    compare_at_price?:    number | null;
    cost_price?:          number | null;
    quantity:             number;
    low_stock_threshold?: number | null;
    track_inventory?:     boolean | null;
    is_active:            boolean;
    weight?:              number | null;
    weight_unit?:         string | null;
    manufacture_date?:    string | null;
    expiry_date?:         string | null;
    batch_number?:        string | null;
    options?:             Record<string, string>;
    /** Variant-level media. Optional — backend accepts nullable array. */
    media?: Array<{
      url:       string;
      alt?:      string | null;
      position?: number;
    }>;
  }>;
  media?: Array<{
    url:       string;
    alt?:      string | null;
    position?: number;
  }>;
  tags?: number[];
}
TYPESCRIPT
echo "  ✓ src/types/product.ts"

# =============================================================================
# 2. src/lib/mappers/products.ts — map variant media in normalizeVariant
# =============================================================================
cat > "$SRC/lib/mappers/products.ts" << 'TYPESCRIPT'
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
  ProductImage,
  ProductListItemView,
  ProductOption,
  ProductOptionValue,
  ProductTranslation,
  ProductVariant,
} from '@/types/product';

import { formatDate, formatCurrency } from '@/lib/utils/date';
import { deriveOptionsFromVariants }  from '@/lib/products/deriveOptionsFromVariants';

// ── Option normalization ──────────────────────────────────────────────────

function normalizeOptionValue(
  raw: { id?: unknown; value?: string | null }
): ProductOptionValue | null {
  const value = typeof raw.value === 'string' ? raw.value.trim() : '';
  if (!value) return null;
  const id = typeof raw.id === 'number' ? raw.id : null;
  return { id, value };
}

export function normalizeProductOptions(
  rawOptions: AdminProductOption[] | null | undefined
): ProductOption[] {
  return (rawOptions ?? []).reduce<ProductOption[]>((acc, option, index) => {
    const name =
      typeof option.name === 'string' ? option.name.trim() : '';
    const position =
      typeof option.position === 'number' ? option.position : index + 1;

    const values = (option.values ?? [])
      .map((v) => normalizeOptionValue(v))
      .filter((v): v is ProductOptionValue => v !== null);

    if (!name || values.length === 0) return acc;

    const id = typeof option.id === 'number' ? option.id : null;
    acc.push({ id, name, position, values });
    return acc;
  }, []);
}

// ── Variant normalization ─────────────────────────────────────────────────

/**
 * Normalises a raw AdminProductVariant to the client-side ProductVariant.
 * Variant media is always normalised to ProductImage[] (never undefined).
 * Images with no URL are filtered as a safety guard.
 */
function normalizeVariant(raw: AdminProductVariant): ProductVariant {
  const media: ProductImage[] = (raw.media ?? [])
    .filter((img) => typeof img.url === 'string' && img.url.trim() !== '')
    .map((img) => ({
      id:       typeof img.id === 'number' ? img.id : 0,
      url:      img.url,
      alt:      img.alt ?? null,
      position: typeof img.position === 'number' ? img.position : 0,
    }));

  return {
    id:                  raw.id,
    sku:                 raw.sku ?? null,
    barcode:             raw.barcode ?? null,
    price:               raw.price ?? 0,
    compare_at_price:    raw.compare_at_price ?? null,
    cost_price:          raw.cost_price ?? null,
    quantity:            raw.quantity ?? 0,
    low_stock_threshold: raw.low_stock_threshold ?? null,
    track_inventory:     raw.track_inventory ?? true,
    weight:              raw.weight ?? null,
    weight_unit:         raw.weight_unit ?? null,
    is_active:           raw.is_active ?? true,
    manufacture_date:    raw.manufacture_date ?? null,
    expiry_date:         raw.expiry_date ?? null,
    batch_number:        raw.batch_number ?? null,
    options: (raw.options ?? []).filter(
      (o) =>
        typeof o.option_name  === 'string' && o.option_name.trim()  !== '' &&
        typeof o.option_value === 'string' && o.option_value.trim() !== ''
    ),
    media,
  };
}

// ── List item mapper ──────────────────────────────────────────────────────

export function mapProductListItem(
  raw:      AdminProduct,
  currency: string = 'USD'
): ProductListItemView {
  return {
    id:             raw.id,
    name:           raw.name,
    slug:           raw.slug,
    status:         raw.status,
    price:          formatCurrency(raw.price, currency),
    compareAtPrice: raw.compare_at_price
      ? formatCurrency(raw.compare_at_price, currency)
      : null,
    quantity:   raw.quantity,
    sku:        raw.sku,
    firstImage: raw.media?.[0]?.url ?? null,
    category:   null,
    createdAt:  formatDate(raw.created_at),
  };
}

// ── Detail mapper ─────────────────────────────────────────────────────────

export function mapProductDetail(raw: AdminProduct): ProductDetailView {
  const rawTranslations: Record<Locale, ProductTranslation> =
    raw.translations ?? {};

  const availableLocales: Locale[] =
    raw.available_locales && raw.available_locales.length > 0
      ? raw.available_locales
      : (Object.keys(rawTranslations) as Locale[]);

  const translations = availableLocales.reduce<Record<Locale, ProductTranslation>>(
    (acc, locale) => {
      const existing = rawTranslations[locale];
      acc[locale] =
        existing ??
        ({
          locale,
          name:            '',
          slug:            '',
          description:     null,
          seo_title:       null,
          seo_description: null,
          is_complete:     false,
        } satisfies ProductTranslation);
      return acc;
    },
    {}
  );

  const variants: ProductVariant[] = (raw.variants ?? []).map(normalizeVariant);

  let options = normalizeProductOptions(raw.options);
  if (options.length === 0 && variants.length > 0) {
    options = deriveOptionsFromVariants(variants);
  }

  return {
    id:             raw.id,
    storeId:        raw.store_id,
    categoryId:     raw.category_id,
    brandId:        raw.brand_id,
    name:           raw.name,
    slug:           raw.slug,
    description:    raw.description ?? '',
    price:          raw.price,
    compareAtPrice: raw.compare_at_price,
    costPerItem:    raw.cost_per_item,
    sku:            raw.sku,
    barcode:        raw.barcode,
    quantity:       raw.quantity,
    trackQuantity:  raw.track_quantity,
    weight:         raw.weight,
    weightUnit:     raw.weight_unit,
    status:         raw.status,
    isFeatured:     raw.is_featured ?? false,
    tags:           (raw.tags ?? []).map((t) => t.id),
    media:          raw.media ?? [],
    createdAt:      formatDate(raw.created_at),
    updatedAt:      formatDate(raw.updated_at),
    variants,
    options,
    availableLocales,
    translations,
  };
}
TYPESCRIPT
echo "  ✓ src/lib/mappers/products.ts"

# =============================================================================
# 3. src/lib/products/generateVariants.ts
#    New variants get media:[] so the type is always satisfied
# =============================================================================
cat > "$SRC/lib/products/generateVariants.ts" << 'TYPESCRIPT'
import type { ProductOption, ProductVariant, ProductVariantOption } from '@/types/product';
import { buildVariantSignature } from './variant-signatures';

type OptionValueRef = {
  option: ProductOption;
  value:  ProductOption['values'][number];
};

function buildCombinations(options: ProductOption[]): OptionValueRef[][] {
  const validOptions = (options ?? []).filter(
    (opt) => (opt.values ?? []).length > 0
  );
  if (validOptions.length === 0) return [];

  return validOptions.reduce<OptionValueRef[][]>((acc, option) => {
    const refs = option.values.map((value) => ({ option, value }));
    if (acc.length === 0) return refs.map((r) => [r]);
    const next: OptionValueRef[][] = [];
    for (const existing of acc) {
      for (const r of refs) next.push([...existing, r]);
    }
    return next;
  }, []);
}

export function getNextNegativeId(existing: { id: number }[]): number {
  const minId = (existing ?? []).reduce<number>(
    (min, v) => Math.min(min, v.id),
    0
  );
  return minId <= 0 ? minId - 1 : -1;
}

export function generateVariants(
  options:          ProductOption[],
  existingVariants: ProductVariant[]
): ProductVariant[] {
  const existing = existingVariants ?? [];
  const combos   = buildCombinations(options);
  if (combos.length === 0) return [];

  const defaultPrice = existing[0]?.price ?? 0;
  let nextNewId = getNextNegativeId(existing);

  const validSignatures:     string[]                            = [];
  const signatureToOptions = new Map<string, ProductVariantOption[]>();
  const seenSignatures     = new Set<string>();

  for (const combo of combos) {
    const variantOptions: ProductVariantOption[] = combo.map(
      ({ option, value }) => ({
        option_name:  option.name,
        option_value: value.value,
      })
    );
    const signature = buildVariantSignature(variantOptions);
    if (seenSignatures.has(signature)) continue;
    seenSignatures.add(signature);
    validSignatures.push(signature);
    signatureToOptions.set(signature, variantOptions);
  }

  const kept:           ProductVariant[] = [];
  const validSet        = new Set(validSignatures);
  const keptSignatures  = new Set<string>();

  for (const v of existing) {
    const signature = buildVariantSignature(v.options);
    if (validSet.has(signature) && !keptSignatures.has(signature)) {
      kept.push(v);
      keptSignatures.add(signature);
    }
  }

  for (const signature of validSignatures) {
    if (keptSignatures.has(signature)) continue;
    const variantOptions = signatureToOptions.get(signature);
    if (!variantOptions) continue;

    kept.push({
      id:               nextNewId,
      sku:              null,
      price:            defaultPrice,
      quantity:         0,
      is_active:        true,
      options:          variantOptions,
      media:            [],   // ✅ always initialise to empty array
    });

    keptSignatures.add(signature);
    nextNewId -= 1;
  }

  return kept;
}
TYPESCRIPT
echo "  ✓ src/lib/products/generateVariants.ts"

# =============================================================================
# 4. src/lib/products/buildStructurePayload.ts — include variants[].media
# =============================================================================
cat > "$SRC/lib/products/buildStructurePayload.ts" << 'TYPESCRIPT'
import type { ProductUpdatePayload } from '@/types/product';
import type { ProductStructureState } from '@/types/product-editor';

type BuildStructurePayloadInput = {
  structure: ProductStructureState;
};

/**
 * Builds the API payload for saving the structure tab.
 *
 * Sends:
 * - sync_variants: true
 * - options[]              (canonical product options)
 * - variants[]             (semantic options map + variant media)
 *
 * Variant ID handling:
 *   Positive  → sent as-is  (existing server record)
 *   Negative  → omitted     (backend creates new record)
 *
 * Variant media:
 *   Images with no URL are filtered.
 *   Positive image IDs → sent (backend updates alt/position).
 *   Negative image IDs → omitted (backend creates new record).
 *   Empty array        → sent explicitly (clears existing media).
 */
export function buildStructurePayload(
  input: BuildStructurePayloadInput
): ProductUpdatePayload & { sync_variants: true } {
  const { structure } = input;

  // ── Canonical options ──────────────────────────────────────────
  const options = (structure.options ?? [])
    .filter((o) => o.name.trim() !== '' && o.values.length > 0)
    .map((o, index) => ({
      name:     o.name.trim(),
      position: typeof o.position === 'number' ? o.position : index + 1,
      values:   o.values
        .map((v) => v.value.trim())
        .filter((v) => v !== ''),
    }))
    .filter((o) => o.values.length > 0);

  // ── Variants ───────────────────────────────────────────────────
  const variants = (structure.variants ?? []).map((v) => {
    // Semantic option map
    const optionsMap: Record<string, string> = {};
    for (const opt of v.options ?? []) {
      const name  = opt.option_name?.trim();
      const value = opt.option_value?.trim();
      if (name && value) optionsMap[name] = value;
    }

    // Variant-level media
    const variantMedia = (v.media ?? [])
      .filter((img) => img.url?.trim() !== '')
      .map((img) => ({
        // Only send real server IDs; negative IDs = unsaved
        ...(typeof img.id === 'number' && img.id > 0 ? { id: img.id } : {}),
        url:      img.url.trim(),
        alt:      img.alt ?? null,
        position: img.position,
      }));

    return {
      ...(typeof v.id === 'number' && v.id > 0 ? { id: v.id } : {}),
      sku:                  v.sku              ?? null,
      barcode:              v.barcode          ?? null,
      price:                v.price,
      compare_at_price:     v.compare_at_price ?? null,
      cost_price:           v.cost_price       ?? null,
      quantity:             v.quantity,
      low_stock_threshold:  v.low_stock_threshold ?? null,
      track_inventory:      v.track_inventory  ?? null,
      is_active:            v.is_active,
      weight:               v.weight           ?? null,
      weight_unit:          v.weight_unit      ?? null,
      manufacture_date:     v.manufacture_date ?? null,
      expiry_date:          v.expiry_date      ?? null,
      batch_number:         v.batch_number     ?? null,
      options:              optionsMap,
      media:                variantMedia,
    };
  });

  return {
    sync_variants: true,
    options,
    variants,
  };
}
TYPESCRIPT
echo "  ✓ src/lib/products/buildStructurePayload.ts"

# =============================================================================
# 5. src/lib/products/buildCreatePayload.ts — include variants[].media
# =============================================================================
cat > "$SRC/lib/products/buildCreatePayload.ts" << 'TYPESCRIPT'
import type { ProductCreatePayload } from '@/types/product';
import type { CreateProductWizardState } from '@/schemas/products';

/**
 * Builds the API payload for creating a new product from wizard state.
 *
 * Variant media is included per-variant when present.
 * Images with no URL are filtered.
 * Negative image IDs (client-only) are omitted — backend creates records.
 */
export function buildCreatePayload(
  state: CreateProductWizardState
): ProductCreatePayload {
  const { content, structure, media, tags } = state;

  // ── Translations ───────────────────────────────────────────────
  const translations = Object.values(content.translations)
    .filter((t) => t.name.trim() !== '' && t.slug.trim() !== '')
    .map((t) => ({
      locale:          t.locale,
      name:            t.name.trim(),
      slug:            t.slug.trim(),
      description:     t.description     ?? null,
      seo_title:       t.seo_title       ?? null,
      seo_description: t.seo_description ?? null,
    }));

  // ── Canonical options ──────────────────────────────────────────
  const options = (structure.options ?? [])
    .filter((o) => o.name.trim() !== '' && o.values.length > 0)
    .map((o, index) => ({
      name:     o.name.trim(),
      position: typeof o.position === 'number' ? o.position : index + 1,
      values:   o.values.map((v) => v.value.trim()).filter((v) => v !== ''),
    }))
    .filter((o) => o.values.length > 0);

  // ── Variants ───────────────────────────────────────────────────
  let variants = (structure.variants ?? []).map((v) => {
    const optionsMap: Record<string, string> = {};
    for (const opt of v.options ?? []) {
      const name  = opt.option_name?.trim();
      const value = opt.option_value?.trim();
      if (name && value) optionsMap[name] = value;
    }

    // Variant-level media — filter empty URLs, strip negative IDs
    const variantMedia = (v.media ?? [])
      .filter((img) => img.url?.trim() !== '')
      .map((img) => ({
        url:      img.url.trim(),
        alt:      img.alt ?? null,
        position: img.position,
      }));

    return {
      ...(typeof v.id === 'number' && v.id > 0 ? { id: v.id } : {}),
      sku:              v.sku              ?? null,
      price:            v.price,
      quantity:         v.quantity,
      is_active:        v.is_active,
      manufacture_date: v.manufacture_date ?? null,
      expiry_date:      v.expiry_date      ?? null,
      batch_number:     v.batch_number     ?? null,
      options:          optionsMap,
      ...(variantMedia.length > 0 ? { media: variantMedia } : {}),
    };
  });

  // ── Default variant fallback ───────────────────────────────────
  if (variants.length === 0) {
    variants = [{
      sku:              null,
      price:            0,
      quantity:         0,
      is_active:        true,
      manufacture_date: null,
      expiry_date:      null,
      batch_number:     null,
      options:          {},
    }];
  }

  // ── Product-level media ────────────────────────────────────────
  const mediaItems = (media?.media ?? [])
    .filter((img) => img.url?.trim() !== '')
    .map((img) => ({
      url:      img.url,
      alt:      img.alt ?? null,
      position: img.position,
    }));

  // ── Tags ───────────────────────────────────────────────────────
  const tagIds = (tags ?? []).filter((id) => Number.isInteger(id) && id > 0);

  return {
    status:      content.status,
    category_id: content.categoryId  ?? null,
    brand_id:    content.brandId     ?? null,
    is_featured: content.isFeatured  ?? false,
    translations,
    options,
    variants,
    ...(mediaItems.length > 0 ? { media: mediaItems } : {}),
    ...(tagIds.length > 0    ? { tags: tagIds }       : {}),
  };
}
TYPESCRIPT
echo "  ✓ src/lib/products/buildCreatePayload.ts"

# =============================================================================
# 6. VariantMediaDialog — NEW reusable component
#    Used in both VariantsTable (edit) and CreateProductStructureStep (create)
# =============================================================================
EDIT_COMP="$SRC/app/[locale]/(admin)/stores/[storeId]/products/[productId]/_components"
mkdir -p "$EDIT_COMP"

cat > "$EDIT_COMP/VariantMediaDialog.tsx" << 'TYPESCRIPT'
'use client';

/**
 * VariantMediaDialog
 *
 * Reusable dialog for managing variant-specific images.
 * Opened per-variant row from VariantsTable (edit) and
 * CreateProductStructureStep (create wizard).
 *
 * Props:
 *   variantLabel  — human-readable name shown in the dialog title
 *   images        — current ProductImage[] for this variant
 *   onChange      — called with the updated ProductImage[] on every change
 *   trigger       — the element that opens the dialog (Button, etc.)
 */

import { useState }        from 'react';
import { useTranslations } from 'next-intl';
import { Plus, X }         from 'lucide-react';

import { Button }   from '@/components/ui/button';
import { Input }    from '@/components/ui/input';
import { Label }    from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import type { ProductImage } from '@/types/product';

interface Props {
  variantLabel: string;
  images:       ProductImage[];
  onChange:     (next: ProductImage[]) => void;
  trigger:      React.ReactNode;
}

/** Generates the next safe client-only negative ID for a new unsaved image. */
function nextNegativeId(images: ProductImage[]): number {
  const min = images.reduce((acc, img) => Math.min(acc, img.id), 0);
  return min <= 0 ? min - 1 : -1;
}

export function VariantMediaDialog({
  variantLabel,
  images,
  onChange,
  trigger,
}: Props) {
  const t = useTranslations('products');
  const [open, setOpen]       = useState(false);
  const [urlDraft, setUrlDraft] = useState('');

  // ── Add ──────────────────────────────────────────────────────

  const handleAdd = () => {
    const url = urlDraft.trim();
    if (!url) return;
    onChange([
      ...images,
      {
        id:       nextNegativeId(images),
        url,
        alt:      null,
        position: images.length,
      },
    ]);
    setUrlDraft('');
  };

  // ── Remove ────────────────────────────────────────────────────

  const handleRemove = (id: number) =>
    onChange(
      images
        .filter((img) => img.id !== id)
        .map((img, idx) => ({ ...img, position: idx }))
    );

  // ── Alt text ──────────────────────────────────────────────────

  const handleAlt = (id: number, alt: string) =>
    onChange(images.map((img) => (img.id === id ? { ...img, alt } : img)));

  // ── Reorder ───────────────────────────────────────────────────

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next.map((img, idx) => ({ ...img, position: idx })));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t('variantEditor.media.dialogTitle', { variant: variantLabel })}
          </DialogTitle>
        </DialogHeader>

        {/* URL input */}
        <div className="space-y-2">
          <Label>{t('editor.media.imageUrl')}</Label>
          <div className="flex gap-2">
            <Input
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); handleAdd(); }
              }}
              placeholder={t('editor.media.imageUrlPlaceholder')}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAdd}
              disabled={!urlDraft.trim()}
            >
              <Plus className="h-4 w-4 mr-1" />
              {t('editor.media.addImage')}
            </Button>
          </div>
        </div>

        {/* Image list */}
        {images.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            {t('variantEditor.media.noImages')}
          </p>
        ) : (
          <div className="space-y-3 mt-2">
            {images.map((img, idx) => (
              <div key={img.id} className="rounded-md border p-3 space-y-3">
                <div className="flex items-start gap-3">
                  {/* Preview */}
                  <img
                    src={img.url}
                    alt={img.alt ?? ''}
                    className="h-14 w-14 rounded object-cover border shrink-0"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />

                  {/* Alt */}
                  <div className="flex-1 space-y-1 min-w-0">
                    <Label className="text-xs">{t('editor.media.altText')}</Label>
                    <Input
                      value={img.alt ?? ''}
                      onChange={(e) => handleAlt(img.id, e.target.value)}
                      className="h-7 text-sm"
                    />
                    <p className="text-xs text-muted-foreground truncate">
                      {img.url}
                    </p>
                  </div>

                  {/* Remove */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(img.id)}
                    className="shrink-0 text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">{t('editor.media.removeImage')}</span>
                  </Button>
                </div>

                {/* Reorder */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => move(idx, idx - 1)}
                    disabled={idx === 0}
                  >
                    {t('editor.media.moveUp')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => move(idx, idx + 1)}
                    disabled={idx === images.length - 1}
                  >
                    {t('editor.media.moveDown')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
TYPESCRIPT
echo "  ✓ VariantMediaDialog.tsx"

# =============================================================================
# 7. VariantsTable — add Media column with VariantMediaDialog per row
# =============================================================================
cat > "$EDIT_COMP/_components/VariantsTable.tsx" << 'TYPESCRIPT'
'use client';

import { useState }        from 'react';
import { useTranslations } from 'next-intl';
import { ImageIcon }       from 'lucide-react';

import { Button }   from '@/components/ui/button';
import { Input }    from '@/components/ui/input';
import { Switch }   from '@/components/ui/switch';
import { Badge }    from '@/components/ui/badge';
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

import { VariantMediaDialog } from '../VariantMediaDialog';
import { getVariantLabel }    from '@/lib/products/getVariantLabel';

import type { ProductImage, ProductVariant } from '@/types/product';

interface Props {
  variants: ProductVariant[];
  onChange: (next: ProductVariant[]) => void;
}

function parseNumericInput(value: string): number {
  const normalized = value.trim();
  if (normalized === '') return 0;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function VariantsTable({ variants, onChange }: Props) {
  const t = useTranslations('products');
  const [numericDrafts, setNumericDrafts] = useState<Record<string, string>>({});

  const patch = (id: ProductVariant['id'], next: Partial<ProductVariant>) =>
    onChange(variants.map((v) => (v.id === id ? { ...v, ...next } : v)));

  const patchMedia = (id: ProductVariant['id'], media: ProductImage[]) =>
    patch(id, { media });

  const updateDraft = (key: string, value: string) =>
    setNumericDrafts((prev) => ({ ...prev, [key]: value }));

  const clearDraft = (key: string) =>
    setNumericDrafts((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });

  const handleNumericChange = (
    id:       ProductVariant['id'],
    field:    'price' | 'quantity',
    rawValue: string
  ) => {
    const draftKey = `${id}:${field}`;
    updateDraft(draftKey, rawValue);
    if (rawValue.trim() === '') return;
    const parsed = Number(rawValue.trim());
    if (!Number.isFinite(parsed)) return;
    patch(id, { [field]: parsed } as Pick<ProductVariant, 'price' | 'quantity'>);
  };

  const handleNumericBlur = (
    id:    ProductVariant['id'],
    field: 'price' | 'quantity'
  ) => {
    const draftKey   = `${id}:${field}`;
    const draftValue = numericDrafts[draftKey];
    if (draftValue === undefined) return;
    patch(id, { [field]: parseNumericInput(draftValue) } as Pick<ProductVariant, 'price' | 'quantity'>);
    clearDraft(draftKey);
  };

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('variantEditor.variants.variant')}</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>{t('variantEditor.variants.price')}</TableHead>
            <TableHead>{t('variantEditor.variants.quantity')}</TableHead>
            <TableHead>{t('variantEditor.media.column')}</TableHead>
            <TableHead className="text-right">
              {t('variantEditor.variants.active')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {variants.map((variant) => {
            const label      = getVariantLabel(variant.options);
            const mediaCount = (variant.media ?? []).length;

            return (
              <TableRow key={variant.id}>
                {/* Variant label */}
                <TableCell className="min-w-32 text-sm font-medium">
                  {label}
                </TableCell>

                {/* SKU */}
                <TableCell className="min-w-40">
                  <Input
                    value={variant.sku ?? ''}
                    onChange={(e) => patch(variant.id, { sku: e.target.value })}
                  />
                </TableCell>

                {/* Price */}
                <TableCell className="min-w-28">
                  <Input
                    inputMode="decimal"
                    value={
                      numericDrafts[`${variant.id}:price`] ??
                      String(variant.price ?? 0)
                    }
                    onChange={(e) =>
                      handleNumericChange(variant.id, 'price', e.target.value)
                    }
                    onBlur={() => handleNumericBlur(variant.id, 'price')}
                  />
                </TableCell>

                {/* Quantity */}
                <TableCell className="min-w-28">
                  <Input
                    inputMode="numeric"
                    value={
                      numericDrafts[`${variant.id}:quantity`] ??
                      String(variant.quantity ?? 0)
                    }
                    onChange={(e) =>
                      handleNumericChange(variant.id, 'quantity', e.target.value)
                    }
                    onBlur={() => handleNumericBlur(variant.id, 'quantity')}
                  />
                </TableCell>

                {/* Variant media */}
                <TableCell className="min-w-28">
                  <VariantMediaDialog
                    variantLabel={label}
                    images={variant.media ?? []}
                    onChange={(media) => patchMedia(variant.id, media)}
                    trigger={
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                      >
                        <ImageIcon className="h-3.5 w-3.5" />
                        {mediaCount > 0 ? (
                          <Badge
                            variant="secondary"
                            className="px-1.5 py-0 text-xs"
                          >
                            {mediaCount}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            {t('variantEditor.media.add')}
                          </span>
                        )}
                      </Button>
                    }
                  />
                </TableCell>

                {/* Active toggle */}
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <Switch
                      checked={variant.is_active}
                      onCheckedChange={(checked) =>
                        patch(variant.id, { is_active: checked })
                      }
                    />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
TYPESCRIPT
echo "  ✓ _components/VariantsTable.tsx"

# =============================================================================
# 8. CreateProductReviewStep — variant media summary
# =============================================================================
cat > "$SRC/components/shared/create-product/CreateProductReviewStep.tsx" << 'TYPESCRIPT'
'use client';

/**
 * Wizard Step 4 — Review & Create
 *
 * Summary of what will be submitted. Does NOT re-render full editors.
 * Variant media shown as aggregate counts only.
 */

import { useTranslations }   from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge }             from '@/components/ui/badge';
import type { CreateProductWizardState } from '@/schemas/products';

const MAX_VARIANT_PREVIEW = 5;

interface Props {
  state: CreateProductWizardState;
}

export function CreateProductReviewStep({ state }: Props) {
  const t = useTranslations('products');

  const { content, structure, media, tags } = state;

  const translationEntries = Object.values(content.translations).filter(
    (tr) => tr.name.trim() !== '' || tr.slug.trim() !== ''
  );

  const optionCount   = structure.options.length;
  const variantCount  = structure.variants.length;
  const imageCount    = media?.media?.length ?? 0;
  const tagCount      = tags?.length ?? 0;

  // Variant media summary
  const variantsWithMedia = structure.variants.filter(
    (v) => (v.media ?? []).length > 0
  ).length;
  const variantsWithoutMedia = variantCount - variantsWithMedia;
  const totalVariantImages = structure.variants.reduce(
    (sum, v) => sum + (v.media ?? []).length,
    0
  );

  const variantPreview  = structure.variants.slice(0, MAX_VARIANT_PREVIEW);
  const variantOverflow = Math.max(0, variantCount - MAX_VARIANT_PREVIEW);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('create.review.title')}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t('create.review.subtitle')}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Status + isFeatured */}
          <div className="flex items-center justify-between border-b pb-3">
            <span className="text-sm font-medium">
              {t('create.review.status')}
            </span>
            <div className="flex items-center gap-2">
              <Badge variant={content.status === 'active' ? 'default' : 'outline'}>
                {content.status}
              </Badge>
              {content.isFeatured && (
                <Badge variant="secondary">
                  {t('form.fields.isFeatured')}
                </Badge>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="flex items-center justify-between border-b pb-3">
            <span className="text-sm font-medium">{t('form.fields.category')}</span>
            <span className="text-sm text-muted-foreground">
              {content.categoryName
                ? content.categoryName
                : content.categoryId !== null
                  ? `#${content.categoryId}`
                  : t('form.fields.noCategoryOption')}
            </span>
          </div>

          {/* Brand */}
          <div className="flex items-center justify-between border-b pb-3">
            <span className="text-sm font-medium">{t('form.fields.brand')}</span>
            <span className="text-sm text-muted-foreground">
              {content.brandName
                ? content.brandName
                : content.brandId !== null
                  ? `#${content.brandId}`
                  : t('form.fields.noBrandOption')}
            </span>
          </div>

          {/* Tags */}
          <div className="flex items-center justify-between border-b pb-3">
            <span className="text-sm font-medium">{t('form.fields.tags')}</span>
            <span className="text-sm text-muted-foreground">
              {tagCount > 0
                ? t('create.review.tagsCount', { count: tagCount })
                : t('create.review.noTags')}
            </span>
          </div>

          {/* Translations */}
          <div className="flex items-start justify-between border-b pb-3">
            <span className="text-sm font-medium">
              {t('create.steps.content')}
            </span>
            {translationEntries.length > 0 ? (
              <div className="flex flex-wrap gap-1 justify-end max-w-xs">
                {translationEntries.map((tr) => (
                  <Badge key={tr.locale} variant="secondary">
                    {tr.locale}: {tr.name || '—'}
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">
                {t('create.review.noTranslations')}
              </span>
            )}
          </div>

          {/* Options */}
          <div className="flex items-center justify-between border-b pb-3">
            <span className="text-sm font-medium">
              {t('editor.tabs.options')}
            </span>
            <span className="text-sm text-muted-foreground">
              {optionCount > 0
                ? t('create.review.optionsCount', { count: optionCount })
                : t('create.review.noOptions')}
            </span>
          </div>

          {/* Variants */}
          <div className="flex items-start justify-between border-b pb-3">
            <span className="text-sm font-medium">
              {t('variantEditor.tabs.variants')}
            </span>
            {variantCount === 0 ? (
              <span className="text-sm text-muted-foreground">
                {t('create.review.noVariants')}
              </span>
            ) : (
              <div className="flex flex-col items-end gap-1 max-w-xs">
                {variantPreview.map((v, i) => {
                  const label = (v.options ?? [])
                    .map((o) => o.option_value)
                    .filter(Boolean)
                    .join(' / ') || t('create.review.defaultVariant');
                  return (
                    <span
                      key={v.id ?? i}
                      className="text-sm text-muted-foreground text-right"
                    >
                      {label}
                      {v.sku ? ` · ${v.sku}` : ''}
                      {` · $${v.price}`}
                    </span>
                  );
                })}
                {variantOverflow > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {t('create.review.variantsMore', { count: variantOverflow })}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Variant media summary */}
          {variantCount > 0 && (
            <div className="flex items-start justify-between border-b pb-3">
              <span className="text-sm font-medium">
                {t('create.review.variantMedia')}
              </span>
              <div className="flex flex-col items-end gap-1 text-sm text-muted-foreground">
                {variantsWithMedia > 0 ? (
                  <>
                    <span>
                      {t('create.review.variantsWithMedia', {
                        count: variantsWithMedia,
                        images: totalVariantImages,
                      })}
                    </span>
                    {variantsWithoutMedia > 0 && (
                      <span className="text-xs text-amber-600 dark:text-amber-400">
                        {t('create.review.variantsFallback', {
                          count: variantsWithoutMedia,
                        })}
                      </span>
                    )}
                  </>
                ) : (
                  <span>{t('create.review.noVariantMedia')}</span>
                )}
              </div>
            </div>
          )}

          {/* Product-level media */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {t('editor.tabs.media')}
            </span>
            <span className="text-sm text-muted-foreground">
              {imageCount > 0
                ? t('create.review.imagesCount', { count: imageCount })
                : t('create.review.noImages')}
            </span>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
TYPESCRIPT
echo "  ✓ CreateProductReviewStep.tsx"

# =============================================================================
# 9. buildStructurePayload test — add variant media cases
# =============================================================================
cat > "$SRC/lib/products/__tests__/buildStructurePayload.test.ts" << 'TYPESCRIPT'
import { buildStructurePayload } from '../buildStructurePayload';
import type { ProductStructureState } from '@/types/product-editor';

describe('buildStructurePayload', () => {
  it('builds sync_variants flag, options, and variant semantic maps', () => {
    const structure: ProductStructureState = {
      options: [
        {
          id: 1, name: 'Color', position: 1,
          values: [{ id: 10, value: 'Red' }, { id: 11, value: 'Blue' }],
        },
        {
          id: 2, name: 'Size', position: 2,
          values: [{ id: 20, value: 'S' }],
        },
      ],
      variants: [
        {
          id: 100, sku: 'RED-S', price: 29.99, quantity: 5,
          is_active: true, media: [],
          options: [
            { option_name: 'Color', option_value: 'Red' },
            { option_name: 'Size',  option_value: 'S'   },
          ],
        },
        {
          id: -1, sku: null, price: 29.99, quantity: 0,
          is_active: true, media: [],
          options: [
            { option_name: 'Color', option_value: 'Blue' },
            { option_name: 'Size',  option_value: 'S'    },
          ],
        },
      ],
    };

    const payload = buildStructurePayload({ structure });
    expect(payload.sync_variants).toBe(true);

    expect(payload.options).toHaveLength(2);
    expect(payload.options?.[0]).toEqual({ name: 'Color', position: 1, values: ['Red', 'Blue'] });
    expect(payload.options?.[1]).toEqual({ name: 'Size',  position: 2, values: ['S'] });

    expect(payload.variants).toHaveLength(2);

    const v1 = payload.variants?.[0];
    expect(v1?.id).toBe(100);
    expect(v1?.sku).toBe('RED-S');
    expect(v1?.options).toEqual({ Color: 'Red', Size: 'S' });
    expect(v1?.media).toEqual([]);

    const v2 = payload.variants?.[1];
    expect(v2?.id).toBeUndefined();
    expect(v2?.options).toEqual({ Color: 'Blue', Size: 'S' });
  });

  it('includes variant media images in payload', () => {
    const structure: ProductStructureState = {
      options: [],
      variants: [
        {
          id:        1,
          sku:       'SKU-A',
          price:     10,
          quantity:  5,
          is_active: true,
          options:   [],
          media: [
            { id: 50, url: 'https://cdn.example.com/red.jpg', alt: 'Red shirt', position: 0 },
            { id: 51, url: 'https://cdn.example.com/red2.jpg', alt: null,       position: 1 },
          ],
        },
      ],
    };

    const payload = buildStructurePayload({ structure });
    expect(payload.variants?.[0].media).toHaveLength(2);
    expect(payload.variants?.[0].media?.[0]).toMatchObject({
      id:  50,
      url: 'https://cdn.example.com/red.jpg',
      alt: 'Red shirt',
    });
    expect(payload.variants?.[0].media?.[1]).toMatchObject({
      id:  51,
      url: 'https://cdn.example.com/red2.jpg',
      alt: null,
    });
  });

  it('omits negative image IDs (unsaved) from variant media payload', () => {
    const structure: ProductStructureState = {
      options: [],
      variants: [
        {
          id:        1,
          sku:       'SKU-B',
          price:     10,
          quantity:  0,
          is_active: true,
          options:   [],
          media: [
            { id: -1, url: 'https://cdn.example.com/new.jpg', alt: null, position: 0 },
          ],
        },
      ],
    };

    const payload = buildStructurePayload({ structure });
    const mediaItem = payload.variants?.[0].media?.[0];
    expect(mediaItem).toBeDefined();
    expect(mediaItem).not.toHaveProperty('id');
    expect(mediaItem?.url).toBe('https://cdn.example.com/new.jpg');
  });

  it('sends empty media array when variant has no images (clears existing)', () => {
    const structure: ProductStructureState = {
      options: [],
      variants: [
        {
          id: 1, sku: null, price: 10, quantity: 0,
          is_active: true, options: [], media: [],
        },
      ],
    };

    const payload = buildStructurePayload({ structure });
    expect(payload.variants?.[0].media).toEqual([]);
  });

  it('filters options with empty names', () => {
    const structure: ProductStructureState = {
      options: [
        { id: null, name: '',      position: 1, values: [{ id: null, value: 'Red' }] },
        { id: 1,    name: 'Color', position: 2, values: [{ id: 10,   value: 'Red' }] },
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
        { id: 1, name: 'Color', position: 1, values: [{ id: null, value: '  ' }] },
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
          id: 1, sku: 'SKU1', price: 10, quantity: 0,
          is_active: true, media: [],
          options: [
            { option_name: 'Color', option_value: 'Red' },
            { option_name: '',      option_value: 'Large' },
            { option_name: 'Size',  option_value: '' },
          ],
        },
      ],
    };
    const payload = buildStructurePayload({ structure });
    expect(payload.variants?.[0].options).toEqual({ Color: 'Red' });
  });

  it('handles empty variants', () => {
    const payload = buildStructurePayload({ structure: { options: [], variants: [] } });
    expect(payload.variants).toEqual([]);
    expect(payload.options).toEqual([]);
  });
});
TYPESCRIPT
echo "  ✓ buildStructurePayload.test.ts"

# =============================================================================
# 10. buildCreatePayload test — add variant media cases, fix media key
# =============================================================================
cat > "$SRC/lib/products/__tests__/buildCreatePayload.test.ts" << 'TYPESCRIPT'
import { buildCreatePayload } from '../buildCreatePayload';
import type { CreateProductWizardState } from '@/schemas/products';
import type { ProductVariant } from '@/types/product';

// ── Fixture helpers ──────────────────────────────────────────────────────────

function makeVariant(
  overrides: Partial<ProductVariant> & { id: number }
): ProductVariant {
  return {
    sku:              null,
    price:            29.99,
    quantity:         0,
    is_active:        true,
    manufacture_date: null,
    expiry_date:      null,
    batch_number:     null,
    options:          [],
    media:            [],
    ...overrides,
  };
}

function makeState(
  overrides: Partial<CreateProductWizardState> = {}
): CreateProductWizardState {
  return {
    content: {
      status:       'draft',
      categoryId:   null,
      categoryName: null,
      brandId:      null,
      brandName:    null,
      isFeatured:   false,
      translations: {
        en: {
          locale:          'en',
          name:            'Test Product',
          slug:            'test-product',
          description:     'A description',
          seo_title:       null,
          seo_description: null,
        },
      },
    },
    structure: {
      options: [
        {
          id: 1, name: 'Color', position: 1,
          values: [{ id: 10, value: 'Red' }, { id: 11, value: 'Blue' }],
        },
      ],
      variants: [
        makeVariant({
          id:       -1,
          sku:      'RED-DEFAULT',
          price:    29.99,
          quantity: 5,
          options:  [{ option_name: 'Color', option_value: 'Red' }],
        }),
        makeVariant({
          id:       -2,
          sku:      null,
          price:    29.99,
          quantity: 0,
          options:  [{ option_name: 'Color', option_value: 'Blue' }],
        }),
      ],
    },
    media: { media: [] },
    tags:  [],
    ...overrides,
  };
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('buildCreatePayload', () => {
  it('maps status from content', () => {
    expect(buildCreatePayload(makeState()).status).toBe('draft');
  });

  it('maps category_id from content.categoryId', () => {
    const state = makeState();
    state.content.categoryId = 5;
    expect(buildCreatePayload(state).category_id).toBe(5);
  });

  it('maps category_id as null when not selected', () => {
    expect(buildCreatePayload(makeState()).category_id).toBeNull();
  });

  it('maps brand_id from content.brandId', () => {
    const state = makeState();
    state.content.brandId = 3;
    expect(buildCreatePayload(state).brand_id).toBe(3);
  });

  it('maps brand_id as null when not selected', () => {
    expect(buildCreatePayload(makeState()).brand_id).toBeNull();
  });

  it('maps is_featured from content.isFeatured', () => {
    const state = makeState();
    state.content.isFeatured = true;
    expect(buildCreatePayload(state).is_featured).toBe(true);
  });

  it('defaults is_featured to false', () => {
    expect(buildCreatePayload(makeState()).is_featured).toBe(false);
  });

  it('maps translations array from locale-keyed record', () => {
    const payload = buildCreatePayload(makeState());
    expect(payload.translations).toHaveLength(1);
    expect(payload.translations[0]).toMatchObject({
      locale: 'en',
      name:   'Test Product',
      slug:   'test-product',
    });
  });

  it('maps canonical options with name, position, values[]', () => {
    const payload = buildCreatePayload(makeState());
    expect(payload.options).toHaveLength(1);
    expect(payload.options?.[0]).toEqual({
      name: 'Color', position: 1, values: ['Red', 'Blue'],
    });
  });

  it('maps variants with semantic options map', () => {
    const payload = buildCreatePayload(makeState());
    expect(payload.variants).toHaveLength(2);
    expect(payload.variants[0].options).toEqual({ Color: 'Red' });
    expect(payload.variants[1].options).toEqual({ Color: 'Blue' });
  });

  it('omits id for negative (unsaved) variants', () => {
    const payload = buildCreatePayload(makeState());
    expect(payload.variants[0]).not.toHaveProperty('id');
    expect(payload.variants[1]).not.toHaveProperty('id');
  });

  it('includes id for positive (existing) variants', () => {
    const state = makeState();
    state.structure.variants[0] = makeVariant({
      ...state.structure.variants[0],
      id: 999,
    });
    expect(buildCreatePayload(state).variants[0]).toHaveProperty('id', 999);
  });

  it('injects a default variant when no variants defined', () => {
    const state = makeState();
    state.structure.variants = [];
    state.structure.options  = [];
    const payload = buildCreatePayload(state);
    expect(payload.variants).toHaveLength(1);
    expect(payload.variants[0]).toMatchObject({
      sku: null, price: 0, quantity: 0, is_active: true, options: {},
    });
  });

  it('filters translations with empty name and slug', () => {
    const state = makeState();
    state.content.translations['ar'] = {
      locale: 'ar', name: '', slug: '',
      description: null, seo_title: null, seo_description: null,
    };
    const payload = buildCreatePayload(state);
    expect(payload.translations).toHaveLength(1);
    expect(payload.translations[0].locale).toBe('en');
  });

  it('filters options with empty name or no values', () => {
    const state = makeState();
    state.structure.options.push(
      { id: null, name: '',         position: 2, values: [{ id: null, value: 'X' }] },
      { id: null, name: 'Material', position: 3, values: [] }
    );
    const payload = buildCreatePayload(state);
    expect(payload.options).toHaveLength(1);
    expect(payload.options?.[0].name).toBe('Color');
  });

  it('filters empty option_name/option_value from variant map', () => {
    const state = makeState();
    state.structure.variants[0] = makeVariant({
      ...state.structure.variants[0],
      id:      -1,
      options: [
        { option_name: 'Color', option_value: 'Red' },
        { option_name: '',      option_value: 'X'   },
        { option_name: 'Size',  option_value: ''    },
      ],
    });
    expect(buildCreatePayload(state).variants[0].options).toEqual({ Color: 'Red' });
  });

  it('passes manufacture and expiry dates through', () => {
    const state = makeState();
    state.structure.variants[0] = makeVariant({
      ...state.structure.variants[0],
      id:               100,
      manufacture_date: '2026-01-01',
      expiry_date:      '2027-01-01',
    });
    const payload = buildCreatePayload(state);
    expect(payload.variants[0].manufacture_date).toBe('2026-01-01');
    expect(payload.variants[0].expiry_date).toBe('2027-01-01');
  });

  it('includes tag ids in payload when tags are set', () => {
    const state = makeState({ tags: [1, 2, 3] });
    expect(buildCreatePayload(state).tags).toEqual([1, 2, 3]);
  });

  it('omits tags from payload when tags array is empty', () => {
    const state = makeState({ tags: [] });
    expect(buildCreatePayload(state)).not.toHaveProperty('tags');
  });

  // ── Variant media ──────────────────────────────────────────────

  it('includes variant media in payload when images are present', () => {
    const state = makeState();
    state.structure.variants[0] = makeVariant({
      ...state.structure.variants[0],
      id:    -1,
      media: [
        { id: -10, url: 'https://cdn.example.com/red.jpg', alt: 'Red', position: 0 },
      ],
    });
    const payload = buildCreatePayload(state);
    expect(payload.variants[0].media).toHaveLength(1);
    expect(payload.variants[0].media?.[0]).toMatchObject({
      url: 'https://cdn.example.com/red.jpg',
      alt: 'Red',
    });
  });

  it('omits variant media key when variant has no images', () => {
    const payload = buildCreatePayload(makeState());
    // All variants have media:[] → key should be absent
    expect(payload.variants[0]).not.toHaveProperty('media');
    expect(payload.variants[1]).not.toHaveProperty('media');
  });

  it('filters variant media images with empty URLs', () => {
    const state = makeState();
    state.structure.variants[0] = makeVariant({
      ...state.structure.variants[0],
      id:    -1,
      media: [
        { id: -10, url: '',                               alt: null, position: 0 },
        { id: -11, url: 'https://cdn.example.com/ok.jpg', alt: null, position: 1 },
      ],
    });
    const payload = buildCreatePayload(state);
    expect(payload.variants[0].media).toHaveLength(1);
    expect(payload.variants[0].media?.[0].url).toBe('https://cdn.example.com/ok.jpg');
  });
});
TYPESCRIPT
echo "  ✓ buildCreatePayload.test.ts"

# =============================================================================
# 11. Translation keys to add — print instructions for the user
# =============================================================================
echo ""
echo "============================================================"
echo "  TRANSLATION KEYS — delegate to you"
echo "============================================================"
echo ""
echo "Add the following under products.variantEditor.media in BOTH"
echo "src/locales/en/common.json and src/locales/ar/common.json:"
echo ""
echo "  EN:"
cat << 'KEYS'
"variantEditor": {
  ...existing keys...,
  "media": {
    "column":      "Media",
    "add":         "Add",
    "dialogTitle": "{variant} — Images",
    "noImages":    "No images yet. Add a URL above."
  }
}
KEYS
echo ""
echo "  AR:"
cat << 'KEYS'
"variantEditor": {
  ...existing keys...,
  "media": {
    "column":      "الصور",
    "add":         "إضافة",
    "dialogTitle": "{variant} — الصور",
    "noImages":    "لا توجد صور بعد. أضف رابطاً أعلاه."
  }
}
KEYS
echo ""
echo "Add the following under products.create.review in BOTH files:"
echo ""
echo "  EN:"
cat << 'KEYS'
"create": {
  "review": {
    ...existing keys...,
    "variantMedia":       "Variant Media",
    "variantsWithMedia":  "{count, plural, one {# variant} other {# variants}} · {images, plural, one {# image} other {# images}}",
    "variantsFallback":   "{count, plural, one {# variant uses} other {# variants use}} product media",
    "noVariantMedia":     "No variant-specific media"
  }
}
KEYS
echo ""
echo "  AR:"
cat << 'KEYS'
"create": {
  "review": {
    ...existing keys...,
    "variantMedia":      "صور المتغيرات",
    "variantsWithMedia": "{count, plural, =0 {لا متغيرات} =1 {متغير واحد} other {# متغيرات}} · {images, plural, =0 {لا صور} =1 {صورة واحدة} other {# صور}}",
    "variantsFallback":  "{count, plural, =0 {لا متغيرات} =1 {متغير واحد} other {# متغيرات}} يستخدم صور المنتج",
    "noVariantMedia":    "لا توجد صور خاصة بالمتغيرات"
  }
}
KEYS
echo ""
echo "  Also add under products.variantEditor.variants in EN:"
echo '    "active": "Active"'
echo "  and in AR:"
echo '    "active": "نشط"'
echo ""
echo "============================================================"
echo "==> Script complete. Run: npx tsc --noEmit"
echo "============================================================"