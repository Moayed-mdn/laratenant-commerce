#!/usr/bin/env bash
# =============================================================================
# fix-edit-product-parity.sh
# Applies all edit-product parity fixes + TypeScript error fixes.
# Run from the project root:  bash fix-edit-product-parity.sh
# =============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$ROOT/src"

echo "==> Applying edit-product parity fixes..."

# =============================================================================
# 1. src/types/product.ts
#    - Add tags to AdminProduct
#    - Add tags to ProductDetailView
# =============================================================================
cat > "$SRC/types/product.ts" << 'TYPESCRIPT'
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

export interface ProductOptionValue {
  id?: ProductEntityId | null;
  value: string;
}

export interface ProductOption {
  id?: ProductEntityId | null;
  name: string;
  position: number;
  values: ProductOptionValue[];
}

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

export interface ProductVariantOption {
  option_name: string;
  option_value: string;
}

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
  media: ProductImage[];
  variants: AdminProductVariant[];
  options?: AdminProductOption[] | null;
  category_id: number | null;
  brand_id: number | null;
  /** Backend returns tag stubs — we extract IDs in the mapper. */
  tags?: Array<{ id: number }>;
  available_locales?: Locale[];
  translations?: Record<Locale, ProductTranslation>;
  created_at: string;
  updated_at: string;
}

// ── View Types (post-mapper) ────────────────────────────────────────────────

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
  /** Integer tag IDs extracted from backend stub array. */
  tags: number[];
  media: ProductImage[];
  createdAt: string;
  updatedAt: string;
  variants: ProductVariant[];
  options: ProductOption[];
  availableLocales: Locale[];
  translations: Record<Locale, ProductTranslation>;
}

// ── API Payload Types ───────────────────────────────────────────────────────

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
  tags?: number[];
  media?: Array<{
    id?: number;
    url: string;
    alt?: string | null;
    position?: number;
  }>;
}

export interface ProductCreatePayload {
  status: ProductStatus;
  category_id?: number | null;
  brand_id?: number | null;
  is_featured?: boolean;
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
    id?: number;
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
  media?: Array<{
    url: string;
    alt?: string | null;
    position?: number;
  }>;
  tags?: number[];
}
TYPESCRIPT
echo "  ✓ src/types/product.ts"

# =============================================================================
# 2. src/types/product-editor.ts
#    - isFeatured required (not optional)
#    - tags added to ProductEditorState
# =============================================================================
cat > "$SRC/types/product-editor.ts" << 'TYPESCRIPT'
import type {
  Locale,
  ProductImage,
  ProductOption,
  ProductTranslation,
  ProductVariant,
} from '@/types/product';

/**
 * Content tab state — status, locale-keyed translations,
 * category / brand / isFeatured assignments.
 *
 * isFeatured is required (not optional) so the editor and payload
 * builders never have to handle undefined.
 */
export interface ProductContentFormValues {
  status:       'active' | 'draft';
  categoryId:   number | null;
  brandId:      number | null;
  isFeatured:   boolean;
  translations: Record<Locale, ProductTranslation>;
}

/**
 * Structure tab state — canonical options + generated variants.
 */
export interface ProductStructureState {
  options:  ProductOption[];
  variants: ProductVariant[];
}

/**
 * Media tab state — ordered product images.
 */
export interface ProductMediaState {
  images: ProductImage[];
}

/**
 * Full editor state combining all three tabs + tags.
 *
 * tags: number[] — integer IDs of tags assigned to this product.
 * Tags are edited in the Content tab and saved alongside content.
 */
export interface ProductEditorState {
  content:   ProductContentFormValues;
  structure: ProductStructureState;
  media:     ProductMediaState;
  tags:      number[];
}

export interface VariantSignature {
  signature: string;
  variant:   ProductVariant;
}

export interface BuildVariantsResult {
  variants: ProductVariant[];
  created:  number;
}
TYPESCRIPT
echo "  ✓ src/types/product-editor.ts"

# =============================================================================
# 3. src/lib/mappers/products.ts
#    - Extract tags from AdminProduct.tags in mapProductDetail
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
  ProductListItemView,
  ProductOption,
  ProductOptionValue,
  ProductTranslation,
  ProductVariant,
} from '@/types/product';

import { formatDate, formatCurrency } from '@/lib/utils/date';
import { deriveOptionsFromVariants }  from '@/lib/products/deriveOptionsFromVariants';

// ── Option normalization ───────────────────────────────────────────────────

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

// ── Variant normalization ──────────────────────────────────────────────────

function normalizeVariant(raw: AdminProductVariant): ProductVariant {
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
        typeof o.option_name === 'string' &&
        o.option_name.trim() !== '' &&
        typeof o.option_value === 'string' &&
        o.option_value.trim() !== ''
    ),
  };
}

// ── List item mapper ───────────────────────────────────────────────────────

export function mapProductListItem(
  raw: AdminProduct,
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

// ── Detail mapper ──────────────────────────────────────────────────────────

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
    // ✅ Extract integer IDs from backend tag stub array [{ id: number }]
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
# 4. src/lib/products/buildEditorState.ts
#    - Include tags in editor state
# =============================================================================
cat > "$SRC/lib/products/buildEditorState.ts" << 'TYPESCRIPT'
import type { ProductDetailView } from '@/types/product';
import type { ProductEditorState } from '@/types/product-editor';

/**
 * Builds the initial ProductEditorState from a mapped ProductDetailView.
 *
 * The editor has three independent tabs plus tags:
 * - content:   status, translations, category / brand / isFeatured
 * - structure: canonical options + generated variants
 * - media:     ordered images
 * - tags:      integer IDs of assigned tags
 *
 * Single entry point for editor initialisation and post-save rebasing.
 */
export function buildEditorState(
  product: ProductDetailView
): ProductEditorState {
  return {
    content: {
      status:       product.status,
      categoryId:   product.categoryId,
      brandId:      product.brandId,
      isFeatured:   product.isFeatured,
      translations: product.translations,
    },

    structure: {
      options:  product.options,
      variants: product.variants,
    },

    media: {
      images: product.media,
    },

    tags: product.tags,
  };
}
TYPESCRIPT
echo "  ✓ src/lib/products/buildEditorState.ts"

# =============================================================================
# 5. src/lib/products/buildContentPayload.ts
#    - Accept optional tags
#    - Send is_featured correctly
# =============================================================================
cat > "$SRC/lib/products/buildContentPayload.ts" << 'TYPESCRIPT'
import type { ProductUpdatePayload }      from '@/types/product';
import type { ProductContentFormValues }  from '@/types/product-editor';

interface BuildContentPayloadInput {
  content: ProductContentFormValues;
  /** When provided, tag assignments are updated in the same PATCH call.
   *  Absence = no change to existing assignments (backend contract).
   *  Empty array = detach all tags from this product. */
  tags?: number[];
}

/**
 * Builds the API payload for saving the content tab.
 *
 * Sends:
 * - is_active    (derived from status === 'active')
 * - is_featured
 * - category_id
 * - brand_id
 * - translations[]
 * - tags[]        (only when caller provides the argument)
 *
 * Does NOT send variants or options — content tab is isolated
 * from structure changes by design.
 */
export function buildContentPayload(
  input: BuildContentPayloadInput
): ProductUpdatePayload {
  const { content, tags } = input;

  return {
    is_active:   content.status === 'active',
    is_featured: content.isFeatured,
    category_id: content.categoryId,
    brand_id:    content.brandId,
    translations: Object.values(content.translations ?? {}).map((t) => ({
      locale:          t.locale,
      name:            t.name,
      slug:            t.slug,
      description:     t.description     ?? null,
      seo_title:       t.seo_title       ?? null,
      seo_description: t.seo_description ?? null,
    })),
    // Only include the tags key when the caller passes it explicitly.
    ...(tags !== undefined ? { tags } : {}),
  };
}
TYPESCRIPT
echo "  ✓ src/lib/products/buildContentPayload.ts"

# =============================================================================
# 6. src/hooks/products/useSaveProductContent.ts
#    - Accept { content, tags } as mutation input
# =============================================================================
cat > "$SRC/hooks/products/useSaveProductContent.ts" << 'TYPESCRIPT'
'use client';

import { useMutation } from '@tanstack/react-query';

import { updateProduct }       from '@/lib/api/products';
import queryClient             from '@/lib/queryClient';
import { queryKeys }           from '@/lib/queryKeys';
import { logger }              from '@/lib/logger';
import { buildContentPayload } from '@/lib/products/buildContentPayload';

import type { AdminProduct }             from '@/types/product';
import type { ApiError }                 from '@/types/api';
import type { ProductContentFormValues } from '@/types/product-editor';

export interface UseSaveProductContentOptions {
  onSuccess?: (product: AdminProduct) => void;
  onError?:   (error: ApiError)      => void;
}

/** Mutation input — content values plus the current tag selection. */
export interface SaveContentInput {
  content: ProductContentFormValues;
  tags:    number[];
}

export function useSaveProductContent(
  storeId:   string,
  productId: string,
  options?:  UseSaveProductContentOptions
) {
  return useMutation<AdminProduct, ApiError, SaveContentInput>({
    mutationFn: ({ content, tags }) =>
      updateProduct(
        storeId,
        productId,
        buildContentPayload({ content, tags })
      ),
    retry: 0,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.products(storeId).lists(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.products(storeId).detail(productId),
      });
      logger.info('Product content saved', { productId: data.id });
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      logger.error('Save product content failed', { error });
      options?.onError?.(error);
    },
  });
}
TYPESCRIPT
echo "  ✓ src/hooks/products/useSaveProductContent.ts"

# =============================================================================
# 7. src/hooks/products/useSaveProductMedia.ts  (no functional change — clean)
# =============================================================================
cat > "$SRC/hooks/products/useSaveProductMedia.ts" << 'TYPESCRIPT'
'use client';

import { useMutation } from '@tanstack/react-query';

import { updateProduct }     from '@/lib/api/products';
import queryClient           from '@/lib/queryClient';
import { queryKeys }         from '@/lib/queryKeys';
import { logger }            from '@/lib/logger';
import { buildMediaPayload } from '@/lib/products/buildMediaPayload';

import type { AdminProduct }    from '@/types/product';
import type { ApiError }        from '@/types/api';
import type { ProductMediaState } from '@/types/product-editor';

export interface UseSaveProductMediaOptions {
  onSuccess?: (product: AdminProduct) => void;
  onError?:   (error: ApiError)      => void;
}

export function useSaveProductMedia(
  storeId:   string,
  productId: string,
  options?:  UseSaveProductMediaOptions
) {
  return useMutation<AdminProduct, ApiError, ProductMediaState>({
    mutationFn: (media: ProductMediaState) =>
      updateProduct(storeId, productId, buildMediaPayload({ media })),
    retry: 0,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.products(storeId).lists(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.products(storeId).detail(productId),
      });
      logger.info('Product media saved', { productId: data.id });
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      logger.error('Save product media failed', { error });
      options?.onError?.(error);
    },
  });
}
TYPESCRIPT
echo "  ✓ src/hooks/products/useSaveProductMedia.ts"

# =============================================================================
# 8. ContentTab — add category, brand, isFeatured, tags
# =============================================================================
CONTENT_TAB_DIR="$SRC/app/[locale]/(admin)/stores/[storeId]/products/[productId]/_components/_tabs"
mkdir -p "$CONTENT_TAB_DIR"

cat > "$CONTENT_TAB_DIR/ContentTab.tsx" << 'TYPESCRIPT'
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Label }             from '@/components/ui/label';
import { Switch }            from '@/components/ui/switch';

import type { Locale, ProductStatus, ProductTranslation } from '@/types/product';
import type { ProductContentFormValues }                  from '@/types/product-editor';

import { ProductContentTab } from '../ProductContentTab';
import { StatusSelect }      from '../_components/StatusSelect';
import { CategorySelect }    from '@/components/shared/create-product/CategorySelect';
import { BrandSelect }       from '@/components/shared/create-product/BrandSelect';
import { TagSelect }         from '@/components/shared/create-product/TagSelect';

interface Props {
  storeId:         string;
  availableLocales: Locale[];
  content:         ProductContentFormValues;
  tags:            number[];
  onContentChange: (next: ProductContentFormValues) => void;
  onTagsChange:    (next: number[]) => void;
}

export function ContentTab({
  storeId,
  availableLocales,
  content,
  tags,
  onContentChange,
  onTagsChange,
}: Props) {
  const t = useTranslations('products');

  return (
    <div className="space-y-6">

      {/* ── Status + Category + Brand + Tags + isFeatured ── */}
      <Card>
        <CardContent className="pt-6 space-y-6">

          <StatusSelect
            value={content.status}
            onChange={(status: ProductStatus) =>
              onContentChange({ ...content, status })
            }
          />

          <CategorySelect
            storeId={storeId}
            value={content.categoryId}
            onChange={({ id }) =>
              onContentChange({ ...content, categoryId: id })
            }
          />

          <BrandSelect
            storeId={storeId}
            value={content.brandId}
            onChange={({ id }) =>
              onContentChange({ ...content, brandId: id })
            }
          />

          <TagSelect
            storeId={storeId}
            value={tags}
            onChange={onTagsChange}
          />

          <div className="flex items-start gap-3">
            <Switch
              id="edit-is-featured"
              checked={content.isFeatured}
              onCheckedChange={(checked) =>
                onContentChange({ ...content, isFeatured: checked })
              }
            />
            <div className="space-y-1">
              <Label htmlFor="edit-is-featured" className="cursor-pointer">
                {t('form.fields.isFeatured')}
              </Label>
              <p className="text-xs text-muted-foreground">
                {t('form.fields.isFeaturedHint')}
              </p>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* ── Translations ── */}
      <ProductContentTab
        availableLocales={availableLocales}
        translations={content.translations}
        onChange={(translations) =>
          onContentChange({ ...content, translations })
        }
      />

    </div>
  );
}
TYPESCRIPT
echo "  ✓ _tabs/ContentTab.tsx"

# =============================================================================
# 9. EditProductForm — wire tags state, fix ContentTab props, fix discard
# =============================================================================
EDIT_DIR="$SRC/app/[locale]/(admin)/stores/[storeId]/products/[productId]/_components"

cat > "$EDIT_DIR/EditProductForm.tsx" << 'TYPESCRIPT'
'use client';

import { useCallback, useRef, useState } from 'react';
import { useTranslations }               from 'next-intl';
import { toast }                         from 'sonner';

import { mapProductDetail }          from '@/lib/mappers/products';
import { buildEditorState }          from '@/lib/products/buildEditorState';
import { generateVariants }          from '@/lib/products/generateVariants';
import {
  validateProductContent,
  type ValidationError,
}                                    from '@/lib/products/validateProductContent';
import { validateProductStructure }  from '@/lib/products/validateProductStructure';

import { useSaveProductContent }     from '@/hooks/products/useSaveProductContent';
import { useSaveProductStructure }   from '@/hooks/products/useSaveProductStructure';
import { useSaveProductMedia }       from '@/hooks/products/useSaveProductMedia';
import { useUnsavedChangesGuard }    from '@/hooks/useUnsavedChangesGuard';

import { Button }   from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { ContentTab }        from './_tabs/ContentTab';
import { StructureTab }      from './_tabs/StructureTab';
import { MediaTab }          from './_tabs/MediaTab';
import DeleteProductButton   from './DeleteProductButton';

import type {
  AdminProduct,
  ProductDetailView,
  ProductImage,
} from '@/types/product';
import type {
  ProductContentFormValues,
  ProductEditorState,
  ProductStructureState,
} from '@/types/product-editor';

interface Props {
  product: ProductDetailView;
  storeId: string;
}

// ── Exported pure helpers (unit-tested independently) ─────────────────────

export function buildNextStructureForSave(
  structure: ProductStructureState
): ProductStructureState {
  return {
    ...structure,
    variants: generateVariants(structure.options, structure.variants),
  };
}

export function buildRebasedEditorState(
  savedProduct: AdminProduct
): ProductEditorState {
  return buildEditorState(mapProductDetail(savedProduct));
}

export function buildDiscardState(baseline: ProductEditorState) {
  return {
    content:         baseline.content,
    structure:       baseline.structure,
    images:          baseline.media.images ?? [],
    tags:            baseline.tags,
    contentDirty:    false,
    structureDirty:  false,
    mediaDirty:      false,
    tagsDirty:       false,
    validationErrors: [] as ValidationError[],
  };
}

export function isEditorSaveBlocked(params: {
  isDirty:      boolean;
  isDiscarding: boolean;
  isPending:    boolean;
}): boolean {
  return params.isDiscarding || params.isPending || !params.isDirty;
}

// ── Component ─────────────────────────────────────────────────────────────

export default function EditProductForm({ product, storeId }: Props) {
  const t = useTranslations('products');

  const initialState = buildEditorState(product);
  const baselineRef  = useRef<ProductEditorState>(initialState);

  const [content, setContent]     = useState<ProductContentFormValues>(initialState.content);
  const [structure, setStructure] = useState<ProductStructureState>(initialState.structure);
  const [images, setImages]       = useState<ProductImage[]>(initialState.media.images ?? []);
  const [tags, setTags]           = useState<number[]>(initialState.tags);
  const [tab, setTab]             = useState<'content' | 'structure' | 'media'>('content');

  const [contentDirty,   setContentDirty]   = useState(false);
  const [structureDirty, setStructureDirty] = useState(false);
  const [mediaDirty,     setMediaDirty]     = useState(false);
  const [tagsDirty,      setTagsDirty]      = useState(false);
  const [isDiscarding,   setIsDiscarding]   = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const discardInProgressRef  = useRef(false);
  const contentSaveTokenRef   = useRef(0);
  const structureSaveTokenRef = useRef(0);
  const mediaSaveTokenRef     = useRef(0);

  // Tags dirty counts as content dirty — saved together in one PATCH
  const isDirty = contentDirty || structureDirty || mediaDirty || tagsDirty;

  const { bypassNextNavigation } = useUnsavedChangesGuard({ isDirty });

  const rebaseFromProduct = useCallback((savedProduct: AdminProduct) => {
    const nextState = buildRebasedEditorState(savedProduct);
    baselineRef.current = nextState;
    setContent(nextState.content);
    setStructure(nextState.structure);
    setImages(nextState.media.images ?? []);
    setTags(nextState.tags);
    setContentDirty(false);
    setStructureDirty(false);
    setMediaDirty(false);
    setTagsDirty(false);
    setValidationErrors([]);
  }, []);

  const saveContent = useSaveProductContent(storeId, String(product.id), {
    onError: (err) => toast.error(err.message),
  });
  const saveStructure = useSaveProductStructure(storeId, String(product.id), {
    onError: (err) => toast.error(err.message),
  });
  const saveMedia = useSaveProductMedia(storeId, String(product.id), {
    onError: (err) => toast.error(err.message),
  });

  const isSavePending =
    saveContent.isPending || saveStructure.isPending || saveMedia.isPending;

  const handleDiscard = useCallback(() => {
    bypassNextNavigation();
    discardInProgressRef.current = true;
    setIsDiscarding(true);

    const d = buildDiscardState(baselineRef.current);
    setContent(d.content);
    setStructure(d.structure);
    setImages(d.images);
    setTags(d.tags);
    setContentDirty(d.contentDirty);
    setStructureDirty(d.structureDirty);
    setMediaDirty(d.mediaDirty);
    setTagsDirty(d.tagsDirty);
    setValidationErrors(d.validationErrors);

    queueMicrotask(() => {
      discardInProgressRef.current = false;
      setIsDiscarding(false);
    });
  }, [bypassNextNavigation]);

  const handleSaveCurrentTab = useCallback(() => {
    if (
      isEditorSaveBlocked({
        isDirty,
        isDiscarding: discardInProgressRef.current,
        isPending:    isSavePending,
      })
    ) return;

    setValidationErrors([]);

    // ── Content tab ──────────────────────────────────────────────
    if (tab === 'content') {
      const result = validateProductContent(content);
      if (!result.isValid) {
        setValidationErrors(result.errors);
        toast.error(t('form.validationError'));
        return;
      }
      const token = (contentSaveTokenRef.current += 1);
      // Tags are saved together with content in one PATCH call
      saveContent.mutate(
        { content, tags },
        {
          onSuccess: (savedProduct) => {
            if (token !== contentSaveTokenRef.current) return;
            rebaseFromProduct(savedProduct);
            toast.success(t('form.updateSuccess'));
          },
        }
      );
      return;
    }

    // ── Structure tab ────────────────────────────────────────────
    if (tab === 'structure') {
      const nextStructure = buildNextStructureForSave(structure);
      setStructure(nextStructure);

      const result = validateProductStructure(nextStructure);
      if (!result.isValid) {
        setValidationErrors(result.errors);
        toast.error(t('form.validationError'));
        return;
      }
      const token = (structureSaveTokenRef.current += 1);
      saveStructure.mutate(nextStructure, {
        onSuccess: (savedProduct) => {
          if (token !== structureSaveTokenRef.current) return;
          rebaseFromProduct(savedProduct);
          toast.success(t('form.updateSuccess'));
        },
      });
      return;
    }

    // ── Media tab ────────────────────────────────────────────────
    if (tab === 'media') {
      const token = (mediaSaveTokenRef.current += 1);
      saveMedia.mutate(
        { images },
        {
          onSuccess: (savedProduct) => {
            if (token !== mediaSaveTokenRef.current) return;
            rebaseFromProduct(savedProduct);
            toast.success(t('form.updateSuccess'));
          },
        }
      );
    }
  }, [
    content,
    images,
    isDirty,
    isSavePending,
    rebaseFromProduct,
    saveContent,
    saveMedia,
    saveStructure,
    structure,
    t,
    tab,
    tags,
  ]);

  return (
    <div className="space-y-6">

      {/* Validation errors banner */}
      {validationErrors.length > 0 && (
        <div className="rounded-md border border-destructive bg-destructive/10 p-4">
          <p className="mb-2 font-medium text-destructive">
            {t('form.validationErrorsTitle')}
          </p>
          <ul className="list-inside list-disc space-y-1 text-sm text-destructive">
            {validationErrors.map((error, idx) => (
              <li key={idx}>
                <span className="font-semibold">{error.field}:</span>{' '}
                {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v as typeof tab);
          setValidationErrors([]);
        }}
      >
        <TabsList>
          <TabsTrigger value="content">
            {t('editor.tabs.content')}
          </TabsTrigger>
          <TabsTrigger value="structure">
            {t('editor.tabs.structure')}
          </TabsTrigger>
          <TabsTrigger value="media">
            {t('editor.tabs.media')}
          </TabsTrigger>
        </TabsList>

        {/* ── Content ── */}
        <TabsContent value="content">
          <ContentTab
            storeId={storeId}
            availableLocales={product.availableLocales}
            content={content}
            tags={tags}
            onContentChange={(next) => {
              setContent(next);
              setContentDirty(true);
            }}
            onTagsChange={(next) => {
              setTags(next);
              setTagsDirty(true);
            }}
          />
        </TabsContent>

        {/* ── Structure ── */}
        <TabsContent value="structure">
          <StructureTab
            options={structure.options}
            variants={structure.variants}
            onOptionsChange={(options) => {
              setStructure((prev) => ({ ...prev, options }));
              setStructureDirty(true);
            }}
            onVariantsChange={(variants) => {
              setStructure((prev) => ({ ...prev, variants }));
              setStructureDirty(true);
            }}
            onGenerateCombinations={() => {
              setStructure((prev) => ({
                ...prev,
                variants: generateVariants(prev.options, prev.variants),
              }));
              setStructureDirty(true);
            }}
          />
        </TabsContent>

        {/* ── Media ── */}
        <TabsContent value="media">
          <MediaTab
            images={images}
            onChange={(next) => {
              setImages(next);
              setMediaDirty(true);
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Unsaved changes bar */}
      {isDirty && (
        <div className="sticky bottom-4 z-10 rounded-md border bg-background p-3 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {t('variantEditor.unsavedChanges')}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleDiscard}>
                {t('discard')}
              </Button>
              <Button
                onClick={handleSaveCurrentTab}
                disabled={isEditorSaveBlocked({
                  isDirty,
                  isDiscarding,
                  isPending: isSavePending,
                })}
              >
                {isSavePending ? t('saving') : t('save')}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <DeleteProductButton
          storeId={storeId}
          productId={String(product.id)}
          productName={product.name}
        />
      </div>

    </div>
  );
}
TYPESCRIPT
echo "  ✓ EditProductForm.tsx"

# =============================================================================
# 10. DeleteProductButton — fix DialogTrigger (render prop → asChild)
# =============================================================================
cat > "$EDIT_DIR/DeleteProductButton.tsx" << 'TYPESCRIPT'
'use client';

import { useState }        from 'react';
import { useRouter }       from '@/lib/navigation';
import { useTranslations } from 'next-intl';
import { toast }           from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { useDeleteProduct } from '@/hooks/products/useDeleteProduct';
import { useCan }           from '@/stores/authStore';
import { ROUTES }           from '@/config/routes';

interface Props {
  storeId:     string;
  productId:   string;
  productName: string;
}

export default function DeleteProductButton({
  storeId,
  productId,
  productName,
}: Props) {
  const t      = useTranslations('products');
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const canManageProducts = useCan('canManageProducts');

  const mutation = useDeleteProduct(storeId, productId, {
    onSuccess: () => {
      toast.success(t('form.deleteSuccess'));
      setOpen(false);
      router.push(ROUTES.store(storeId).products.list());
    },
    onError: () => {
      toast.error(t('form.deleteError'));
    },
  });

  if (!canManageProducts) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* ✅ Standard Radix pattern — asChild renders Button as the trigger */}
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          {t('form.delete')}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('form.delete')}</DialogTitle>
          <DialogDescription>{t('form.deleteConfirm')}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t('cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? t('loading') : t('delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
TYPESCRIPT
echo "  ✓ DeleteProductButton.tsx"

# =============================================================================
# 11. CreateProductMediaStep — bridge media.media ↔ MediaTab images prop
# =============================================================================
cat > "$SRC/components/shared/create-product/CreateProductMediaStep.tsx" << 'TYPESCRIPT'
'use client';

/**
 * Wizard Step 3 — Media
 *
 * Bridges CreateProductMediaData (key: 'media') to MediaTab (prop: images).
 * Reuses the edit flow's MediaTab for UX consistency.
 */

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MediaTab }        from '@/app/[locale]/(admin)/stores/[storeId]/products/[productId]/_components/_tabs/MediaTab';
import type { ProductImage }           from '@/types/product';
import type { CreateProductMediaData } from '@/schemas/products';

interface Props {
  media:    CreateProductMediaData;
  onChange: (next: CreateProductMediaData) => void;
}

export function CreateProductMediaStep({ media, onChange }: Props) {
  const t = useTranslations('products');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('editor.tabs.media')}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <MediaTab
            images={media.media}
            onChange={(next: ProductImage[]) => onChange({ media: next })}
          />
        </CardContent>
      </Card>
    </div>
  );
}
TYPESCRIPT
echo "  ✓ CreateProductMediaStep.tsx"

# =============================================================================
# 12. Fix validateProductContent test — add isFeatured to every fixture
# =============================================================================
cat > "$SRC/lib/products/__tests__/validateProductContent.test.ts" << 'TYPESCRIPT'
import { validateProductContent } from '../validateProductContent';
import type { ProductContentFormValues } from '@/types/product-editor';

describe('validateProductContent', () => {
  it('should detect missing translations', () => {
    const values: ProductContentFormValues = {
      status:       'active',
      categoryId:   null,
      brandId:      null,
      isFeatured:   false,
      translations: {},
    };
    const result = validateProductContent(values);
    expect(result.isValid).toBe(false);
    expect(result.errors.find((e) => e.field === 'translations')).toBeDefined();
  });

  it('should detect missing name and slug in translations', () => {
    const values: ProductContentFormValues = {
      status:       'active',
      categoryId:   null,
      brandId:      null,
      isFeatured:   false,
      translations: {
        en: {
          locale:          'en',
          name:            '',
          slug:            '',
          description:     null,
          seo_title:       null,
          seo_description: null,
        },
      },
    };
    const result = validateProductContent(values);
    expect(result.isValid).toBe(false);
    expect(result.errors.find((e) => e.field === 'translations.en.name')).toBeDefined();
    expect(result.errors.find((e) => e.field === 'translations.en.slug')).toBeDefined();
  });

  it('should detect invalid slug format', () => {
    const values: ProductContentFormValues = {
      status:       'active',
      categoryId:   null,
      brandId:      null,
      isFeatured:   false,
      translations: {
        en: {
          locale:          'en',
          name:            'Test',
          slug:            'Invalid Slug!',
          description:     null,
          seo_title:       null,
          seo_description: null,
        },
      },
    };
    const result = validateProductContent(values);
    expect(result.isValid).toBe(false);
    expect(result.errors.find((e) => e.field === 'translations.en.slug')).toBeDefined();
  });

  it('should allow unicode slugs (e.g. Arabic) with hyphens', () => {
    const values: ProductContentFormValues = {
      status:       'active',
      categoryId:   null,
      brandId:      null,
      isFeatured:   false,
      translations: {
        ar: {
          locale:          'ar',
          name:            'ساعة',
          slug:            'ساعة-حائط-عصرية',
          description:     null,
          seo_title:       null,
          seo_description: null,
        },
      },
    };
    const result = validateProductContent(values);
    expect(result.isValid).toBe(true);
  });

  it('should pass for valid content', () => {
    const values: ProductContentFormValues = {
      status:       'active',
      categoryId:   1,
      brandId:      1,
      isFeatured:   true,
      translations: {
        en: {
          locale:          'en',
          name:            'Product',
          slug:            'product-slug',
          description:     'Desc',
          seo_title:       'SEO',
          seo_description: 'SEO Desc',
        },
      },
    };
    const result = validateProductContent(values);
    expect(result.isValid).toBe(true);
  });
});
TYPESCRIPT
echo "  ✓ validateProductContent.test.ts"

# =============================================================================
# 13. Fix buildCreatePayload test — media key is 'media' not 'images'
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
          id:       1,
          name:     'Color',
          position: 1,
          values: [
            { id: 10, value: 'Red' },
            { id: 11, value: 'Blue' },
          ],
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
    // ✅ CreateProductMediaData uses key 'media' (not 'images')
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
      name:     'Color',
      position: 1,
      values:   ['Red', 'Blue'],
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
      sku:       null,
      price:     0,
      quantity:  0,
      is_active: true,
      options:   {},
    });
  });

  it('filters translations with empty name and slug', () => {
    const state = makeState();
    state.content.translations['ar'] = {
      locale:          'ar',
      name:            '',
      slug:            '',
      description:     null,
      seo_title:       null,
      seo_description: null,
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
});
TYPESCRIPT
echo "  ✓ buildCreatePayload.test.ts"

# =============================================================================
# 14. Fix useUnsavedChangesGuard test — cast errors
# =============================================================================
cat > "$SRC/hooks/__tests__/useUnsavedChangesGuard.test.ts" << 'TYPESCRIPT'
/// <reference types="jest" />

jest.mock('next/navigation', () => ({
  usePathname:     () => '/current',
  useSearchParams: () => new URLSearchParams(''),
}));

jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    useRef:      (initial: unknown) => ({ current: initial }),
    useMemo:     (fn: () => unknown) => fn(),
    useCallback: (fn: (...args: unknown[]) => unknown) => fn,
    useEffect:   (fn: () => void) => fn(),
  };
});

import { useUnsavedChangesGuard } from '../useUnsavedChangesGuard';

describe('useUnsavedChangesGuard', () => {
  it('bypasses beforeunload once after user confirms navigation (no double confirmation)', () => {
    const windowListeners:   Record<string, EventListener> = {};
    const documentListeners: Record<string, EventListener> = {};

    const setTimeoutSpy = jest.fn();

    // ✅ Cast through unknown to avoid the Window shape incompatibility
    (global as unknown as Record<string, unknown>)['window'] = {
      location: {
        pathname: '/current',
        search:   '',
        hash:     '',
        href:     'http://example.com/current',
        origin:   'http://example.com',
      },
      addEventListener: jest.fn((evt: string, handler: EventListener) => {
        windowListeners[evt] = handler;
      }),
      removeEventListener: jest.fn(),
      confirm:     jest.fn(() => true),
      setTimeout:  setTimeoutSpy,
      history: {
        pushState: jest.fn(),
      },
    };

    (global as unknown as Record<string, unknown>)['history'] =
      (global as unknown as Record<string, unknown>)['window'] &&
      ((global as unknown as Record<string, { history: unknown }>)['window']).history;

    (global as unknown as Record<string, unknown>)['document'] = {
      addEventListener: jest.fn((evt: string, handler: EventListener) => {
        documentListeners[evt] = handler;
      }),
      removeEventListener: jest.fn(),
    };

    useUnsavedChangesGuard({ isDirty: true });

    const clickHandler       = documentListeners['click'];
    const beforeUnloadHandler = windowListeners['beforeunload'];

    expect(typeof clickHandler).toBe('function');
    expect(typeof beforeUnloadHandler).toBe('function');

    const anchor = {
      href:         'http://example.com/next',
      target:       undefined,
      hasAttribute: (_name: string) => false,
      getAttribute: (name: string) => {
        if (name === 'href') return '/next';
        if (name === 'rel')  return null;
        return null;
      },
    };

    const clickEvent = {
      metaKey:  false,
      altKey:   false,
      ctrlKey:  false,
      shiftKey: false,
      button:   0,
      target: {
        closest: (selector: string) =>
          selector === 'a[href]' ? anchor : null,
      },
      preventDefault:  jest.fn(),
      stopPropagation: jest.fn(),
    } as unknown as MouseEvent;

    clickHandler(clickEvent);

    expect(
      (global as unknown as Record<string, { confirm: jest.Mock }>)['window'].confirm
    ).toHaveBeenCalledTimes(1);
    expect(setTimeoutSpy).toHaveBeenCalledTimes(1);

    // ✅ Cast through unknown to avoid BeforeUnloadEvent shape mismatch
    const beforeUnloadEvent = {
      preventDefault: jest.fn(),
      returnValue:    undefined,
    } as unknown as BeforeUnloadEvent;

    beforeUnloadHandler(beforeUnloadEvent);

    expect(beforeUnloadEvent.preventDefault).not.toHaveBeenCalled();
    expect(beforeUnloadEvent.returnValue).toBeUndefined();
  });
});
TYPESCRIPT
echo "  ✓ useUnsavedChangesGuard.test.ts"

# =============================================================================
# 15. EditProductForm test — add tags to makeAdminProduct + buildDiscardState
# =============================================================================
cat > "$EDIT_DIR/__tests__/EditProductForm.test.ts" << 'TYPESCRIPT'
/// <reference types="jest" />

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn(), message: jest.fn() },
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

jest.mock('@/components/ui/button',   () => ({ Button: () => null }));
jest.mock('@/components/ui/tabs',     () => ({
  Tabs: () => null, TabsContent: () => null,
  TabsList: () => null, TabsTrigger: () => null,
}));
jest.mock('../_tabs/ContentTab',   () => ({ ContentTab: () => null }));
jest.mock('../_tabs/StructureTab', () => ({ StructureTab: () => null }));
jest.mock('../_tabs/MediaTab',     () => ({ MediaTab: () => null }));
jest.mock('../DeleteProductButton', () => ({ __esModule: true, default: () => null }));

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
    id:               1,
    store_id:         7,
    name:             'Test Product',
    slug:             'test-product',
    description:      'Description',
    price:            99,
    compare_at_price: null,
    cost_per_item:    null,
    sku:              null,
    barcode:          null,
    quantity:         10,
    track_quantity:   true,
    weight:           null,
    weight_unit:      null,
    status:           'draft',
    is_featured:      false,
    media:            [],
    tags:             [],
    variants: [
      {
        id:        101,
        sku:       'SKU-101',
        price:     10,
        quantity:  5,
        is_active: true,
        options:   [{ option_name: 'Color', option_value: 'Red' }],
      },
    ],
    options: [
      {
        id:       1,
        name:     'Color',
        position: 1,
        values:   [{ id: 10, value: 'Red' }],
      },
    ],
    category_id:       11,
    brand_id:          12,
    available_locales: ['en'],
    translations: {
      en: {
        locale:          'en',
        name:            'Test Product',
        slug:            'test-product',
        description:     'Description',
        seo_title:       null,
        seo_description: null,
        is_complete:     true,
      },
    },
    created_at: '2026-05-11T10:00:00.000Z',
    updated_at: '2026-05-11T10:00:00.000Z',
    ...overrides,
  };
}

describe('EditProductForm helpers', () => {
  it('rebases baseline so discard restores the latest saved state', () => {
    const savedState = buildRebasedEditorState(
      makeAdminProduct({
        status: 'active',
        tags:   [{ id: 5 }, { id: 9 }],
        media:  [{ id: 9, url: '/saved.png', alt: 'saved', position: 1 }],
        variants: [
          {
            id:        201,
            sku:       'SKU-SAVED',
            price:     25,
            quantity:  2,
            is_active: false,
            options:   [{ option_name: 'Color', option_value: 'Blue' }],
          },
        ],
        translations: {
          en: {
            locale:          'en',
            name:            'Saved Product',
            slug:            'saved-product',
            description:     'Saved description',
            seo_title:       null,
            seo_description: null,
            is_complete:     true,
          },
        },
      })
    );

    const discardState = buildDiscardState(savedState);

    expect(discardState.content).toEqual(savedState.content);
    expect(discardState.structure).toEqual(savedState.structure);
    expect(discardState.images).toEqual(savedState.media.images);
    expect(discardState.tags).toEqual([5, 9]);
    expect(discardState.contentDirty).toBe(false);
    expect(discardState.structureDirty).toBe(false);
    expect(discardState.mediaDirty).toBe(false);
    expect(discardState.tagsDirty).toBe(false);
    expect(discardState.validationErrors).toEqual([]);
  });

  it('blocks save after discard clears dirty state', () => {
    const discardState = buildDiscardState(
      buildRebasedEditorState(makeAdminProduct())
    );
    const dirtyAfterDiscard =
      discardState.contentDirty ||
      discardState.structureDirty ||
      discardState.mediaDirty    ||
      discardState.tagsDirty;

    expect(dirtyAfterDiscard).toBe(false);
    expect(
      isEditorSaveBlocked({
        isDirty:      dirtyAfterDiscard,
        isDiscarding: true,
        isPending:    false,
      })
    ).toBe(true);
    expect(
      isEditorSaveBlocked({
        isDirty:      true,
        isDiscarding: false,
        isPending:    false,
      })
    ).toBe(false);
  });

  it('preserves variant active state independently from product status', () => {
    const rebasedState = buildRebasedEditorState(
      makeAdminProduct({
        status: 'active',
        variants: [
          {
            id:        201,
            sku:       null,
            price:     10,
            quantity:  0,
            is_active: false,
            options:   [{ option_name: 'Color', option_value: 'Red' }],
          },
          {
            id:        202,
            sku:       'SKU-202',
            price:     10,
            quantity:  0,
            is_active: true,
            options:   [{ option_name: 'Color', option_value: 'Blue' }],
          },
        ],
        options: [
          {
            id:       1,
            name:     'Color',
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

  it('extracts tag ids from AdminProduct.tags stubs', () => {
    const rebasedState = buildRebasedEditorState(
      makeAdminProduct({ tags: [{ id: 1 }, { id: 7 }, { id: 42 }] })
    );
    expect(rebasedState.tags).toEqual([1, 7, 42]);
  });
});
TYPESCRIPT
echo "  ✓ EditProductForm.test.ts"

echo ""
echo "==> All files written successfully."
echo ""
echo "Translation keys required — delegate to you:"
echo ""
echo "  No new keys needed. All keys used in the updated ContentTab"
echo "  (form.fields.isFeatured, form.fields.isFeaturedHint, form.fields.tags,"
echo "  form.fields.category, form.fields.brand) already exist in both"
echo "  en/common.json and ar/common.json."
echo ""
echo "Run:  npx tsc --noEmit"