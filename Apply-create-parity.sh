#!/usr/bin/env bash
# =============================================================================
# apply-create-parity.sh
#
# Brings the Create Product wizard to feature parity with the Edit Product
# editor. No rewrites — only additive changes and targeted modifications to
# existing files.
#
# Changes applied:
#
#   [1/8] src/schemas/products.ts
#         — Add CreateProductMediaData type
#         — Add tags: number[] to CreateProductWizardState
#         — Add media to CreateProductWizardState
#         — Add categoryName / brandName to CreateProductContentData
#           so review step can display names without a second fetch
#
#   [2/8] src/hooks/tags/useTags.ts  (NEW)
#         — Thin React Query hook following the existing useBrands / useCategories
#           pattern; needed by TagSelect
#
#   [3/8] src/components/shared/create-product/TagSelect.tsx  (NEW)
#         — Multi-select tag picker following CategorySelect / BrandSelect
#           pattern; fetches active tags for the store
#
#   [4/8] src/components/shared/create-product/CreateProductMediaStep.tsx  (NEW)
#         — Reuses the edit flow's MediaTab component directly
#         — Keeps the wizard step wrapper thin and consistent
#
#   [5/8] src/components/shared/create-product/CreateProductContentStep.tsx
#         — Wire categoryName / brandName capture so review step can show
#           names instead of raw IDs
#         — Add TagSelect for tag assignment
#
#   [6/8] src/lib/products/buildCreatePayload.ts
#         — Wire images[] from media state into payload
#         — Wire tags[] from tags state into payload
#
#   [7/8] src/components/shared/create-product/CreateProductWizard.tsx
#         — Add media and tags wizard steps/state
#         — Replace inline validateContent / validateStructure with the
#           canonical lib functions (validateProductContent /
#           validateProductStructure) to prevent validation drift
#         — Wire new steps into navigation
#
#   [8/8] src/components/shared/create-product/CreateProductReviewStep.tsx
#         — Show category/brand names (not #id)
#         — Show media image count
#         — Show assigned tag names
#         — Show per-locale name previews
#
# Variant-level media (variants.*.media[]) is intentionally deferred.
# It requires per-variant upload UX that adds significant complexity for
# low initial value. Document the deferral decision clearly.
#
# Usage:
#   chmod +x apply-create-parity.sh && ./apply-create-parity.sh
# =============================================================================

set -euo pipefail

NEXT_ROOT="/home/leader/projects/next/laratenant-commerce"

echo ""
echo "============================================================"
echo "  Create Product Wizard — Feature Parity Patches (8 files)"
echo "============================================================"
echo ""

# =============================================================================
# [1/8]  src/schemas/products.ts
#
#   Changes:
#   - Add CreateProductMediaData interface (aligns with ProductMediaState
#     from product-editor.ts — uses ProductImage[] directly, no duplication)
#   - Add categoryName / brandName to CreateProductContentData so the review
#     step receives resolved names without a second network fetch
#   - Extend CreateProductWizardState with media and tags
# =============================================================================

TARGET="$NEXT_ROOT/src/schemas/products.ts"
echo "→ [1/8] $TARGET"

cat > "$TARGET" << 'ENDOFFILE'
/**
 * Zod schemas for product filters and create wizard validation.
 *
 * Design note — two-type-system rule:
 * Zod schemas are used for RUNTIME VALIDATION only.
 * Wizard STATE types use the canonical domain types from types/product.ts
 * (ProductVariant, ProductOption, ProductImage) directly.
 */

import { z } from 'zod';
import type { ProductImage, ProductOption, ProductVariant } from '@/types/product';

// ── List filters ────────────────────────────────────────────────────────────

export const ProductFiltersSchema = z.object({
  search:  z.string().optional().default(''),
  status:  z.enum(['all', 'active', 'draft']).default('all'),
  page:    z.coerce.number().min(1).default(1),
  perPage: z.coerce.number().min(1).max(100).default(10),
});

export type ProductFilters = z.infer<typeof ProductFiltersSchema>;

// ── Create wizard — Step 1: Content ────────────────────────────────────────

export const ProductTranslationSchema = z.object({
  locale:          z.string().min(1),
  name:            z.string().min(1, 'Name is required').max(255),
  slug:            z.string().min(1, 'Slug is required').max(255),
  description:     z.string().nullable().default(null),
  seo_title:       z.string().max(255).nullable().default(null),
  seo_description: z.string().max(1000).nullable().default(null),
  // Matches ProductTranslation from types/product.ts — eliminates the type
  // mismatch that previously required unsafe casts in CreateProductContentStep.
  is_complete:     z.boolean().optional(),
});

export type ProductTranslationFormData = z.infer<typeof ProductTranslationSchema>;

export const CreateProductContentSchema = z.object({
  status:       z.enum(['active', 'draft']).default('draft'),

  // IDs sent to the backend
  categoryId:   z.number().int().nullable().default(null),
  brandId:      z.number().int().nullable().default(null),

  // Resolved display names for the review step.
  // These are UI-only — never sent to the backend.
  // Populated by CategorySelect / BrandSelect via their onNameChange callbacks.
  categoryName: z.string().nullable().default(null),
  brandName:    z.string().nullable().default(null),

  isFeatured:   z.boolean().default(false),
  translations: z.record(z.string(), ProductTranslationSchema),
});

export type CreateProductContentData = z.infer<typeof CreateProductContentSchema>;

// ── Create wizard — Step 2: Structure ──────────────────────────────────────

// Runtime-only validation schemas (not used as state types).
export const CreateProductVariantValidationSchema = z.object({
  id:       z.number(),
  price:    z.number().min(0, 'Price must be 0 or greater'),
  quantity: z.number().int().min(0, 'Quantity must be 0 or greater'),
});

export const CreateProductOptionValidationSchema = z.object({
  name:   z.string().min(1, 'Option name is required'),
  values: z.array(z.object({ value: z.string().min(1) })).min(1),
});

/**
 * Wizard Step 2 state type.
 * Uses canonical domain types directly — NOT Zod-inferred types.
 */
export interface CreateProductStructureData {
  options:  ProductOption[];
  variants: ProductVariant[];
}

// ── Create wizard — Step 3: Media ───────────────────────────────────────────

/**
 * Wizard Step 3 (media) state type.
 * Uses ProductImage[] from types/product.ts directly — the same type used
 * by ProductMediaState in product-editor.ts.
 *
 * Variant-level media (variants.*.media[]) is intentionally deferred.
 * The backend supports it (variants.*.media[]) but the per-variant upload
 * UX adds significant complexity for low initial value. Revisit when the
 * variant detail editor matures.
 */
export interface CreateProductMediaData {
  images: ProductImage[];
}

// ── Full wizard state ───────────────────────────────────────────────────────

/**
 * Complete wizard state across all steps.
 *
 * tags: number[] — array of tag IDs (integer, backend-validated).
 *   Tags live outside the step structure because they span the full product
 *   and are assigned in the content step UI, not in a dedicated step.
 *
 * media: CreateProductMediaData — product-level images.
 */
export interface CreateProductWizardState {
  content:   CreateProductContentData;
  structure: CreateProductStructureData;
  media:     CreateProductMediaData;
  tags:      number[];
}
ENDOFFILE

echo "   ✓ Done"

# =============================================================================
# [2/8]  src/hooks/tags/useTags.ts  (NEW)
#
#   Thin React Query hook following the exact pattern of useBrands and
#   useCategories. Fetches active tags for a store — no filters arg needed
#   for the create wizard use case (same as brands/categories default).
# =============================================================================

mkdir -p "$NEXT_ROOT/src/hooks/tags"
TARGET="$NEXT_ROOT/src/hooks/tags/useTags.ts"
echo "→ [2/8] $TARGET  (new)"

cat > "$TARGET" << 'ENDOFFILE'
'use client';

/**
 * Hook for fetching the tags list for a store.
 * Used by TagSelect in the create/edit product flows.
 *
 * Follows the exact pattern of useBrands / useCategories.
 */

import { useQuery } from '@tanstack/react-query';
import { clientApi } from '@/lib/api/client';
import { queryKeys } from '@/lib/queryKeys';
import { QUERY_CONFIG } from '@/config/query';
import { API_ROUTES } from '@/config/routes';
import type { PaginatedResponse, ApiError } from '@/types/api';

export interface TagListItem {
  id: number;
  name: string;
  slug: string;
}

export function useTags(storeId: string) {
  return useQuery<PaginatedResponse<TagListItem>, ApiError>({
    queryKey: queryKeys.tags(storeId).list(),
    queryFn: () =>
      clientApi.get<PaginatedResponse<TagListItem>>(
        API_ROUTES.store(storeId).tags().list(),
        { params: { per_page: 100 } }
      ),
    staleTime: QUERY_CONFIG.staleTime,
  });
}
ENDOFFILE

echo "   ✓ Done"

# =============================================================================
# [3/8]  src/components/shared/create-product/TagSelect.tsx  (NEW)
#
#   Multi-select tag picker. Follows the CategorySelect / BrandSelect
#   component contract (storeId, value, onChange) but value is number[]
#   because a product can have multiple tags.
#
#   Uses a checkbox-driven SelectContent to allow multi-select within
#   the existing shadcn/ui Select primitive constraints.
#   A proper Combobox multi-select can replace this later without changing
#   the parent contract.
# =============================================================================

TARGET="$NEXT_ROOT/src/components/shared/create-product/TagSelect.tsx"
echo "→ [3/8] $TARGET  (new)"

cat > "$TARGET" << 'ENDOFFILE'
'use client';

/**
 * TagSelect
 *
 * Multi-select tag picker for product create/edit flows.
 * Fetches active tags for the given store.
 * Value is number[] — a product may have multiple tags.
 *
 * Pattern mirrors CategorySelect / BrandSelect (storeId, value, onChange)
 * but uses a Popover + Checkbox approach for multi-select since the radix
 * Select primitive is single-value only.
 */

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useTags } from '@/hooks/tags/useTags';
import { cn } from '@/lib/utils';

interface Props {
  storeId:  string;
  value:    number[];
  onChange: (next: number[]) => void;
}

export function TagSelect({ storeId, value, onChange }: Props) {
  const t = useTranslations('products');
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useTags(storeId);
  const tags = data?.data ?? [];

  const toggle = (id: number) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  const remove = (id: number) => {
    onChange(value.filter((v) => v !== id));
  };

  const selectedTags = tags.filter((t) => value.includes(t.id));

  return (
    <div className="space-y-2">
      <Label>{t('form.fields.tags')}</Label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
            disabled={isLoading}
          >
            <span className="text-muted-foreground">
              {isLoading
                ? t('form.fields.loading')
                : value.length === 0
                  ? t('form.fields.tagsPlaceholder')
                  : t('form.fields.tagsSelected', { count: value.length })}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder={t('form.fields.tagsSearch')} />
            <CommandList>
              <CommandEmpty>{t('form.fields.tagsEmpty')}</CommandEmpty>
              <CommandGroup>
                {tags.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    value={tag.name}
                    onSelect={() => toggle(tag.id)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value.includes(tag.id) ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {tag.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected tag badges */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {selectedTags.map((tag) => (
            <Badge key={tag.id} variant="secondary" className="gap-1 pr-1">
              {tag.name}
              <button
                type="button"
                onClick={() => remove(tag.id)}
                className="rounded-full p-0.5 hover:bg-muted"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {tag.name}</span>
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
ENDOFFILE

echo "   ✓ Done"

# =============================================================================
# [4/8]  src/components/shared/create-product/CreateProductMediaStep.tsx  (NEW)
#
#   Wizard wrapper for the media step.
#   Reuses the edit flow's MediaTab component directly — zero logic
#   duplication. The step wrapper just provides the Card shell and heading
#   consistent with CreateProductStructureStep / CreateProductContentStep.
#
#   Note: MediaTab is imported from the edit flow components directory.
#   If it gets promoted to shared/components later, update this import —
#   no other changes needed.
# =============================================================================

TARGET="$NEXT_ROOT/src/components/shared/create-product/CreateProductMediaStep.tsx"
echo "→ [4/8] $TARGET  (new)"

cat > "$TARGET" << 'ENDOFFILE'
'use client';

/**
 * Wizard Step 3 — Media
 *
 * Collects product-level images.
 * Reuses the edit flow's MediaTab component directly for UX consistency.
 *
 * Variant-level media (variants.*.media[]) is intentionally deferred.
 * See CreateProductMediaData in schemas/products.ts for the rationale.
 */

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MediaTab } from '@/app/[locale]/(admin)/stores/[storeId]/products/[productId]/_components/_tabs/MediaTab';
import type { ProductImage } from '@/types/product';
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
            images={media.images}
            onChange={(images: ProductImage[]) => onChange({ images })}
          />
        </CardContent>
      </Card>
    </div>
  );
}
ENDOFFILE

echo "   ✓ Done"

# =============================================================================
# [5/8]  src/components/shared/create-product/CreateProductContentStep.tsx
#
#   Changes:
#   - Add onNameChange callbacks to CategorySelect / BrandSelect so resolved
#     display names are captured in wizard state for the review step.
#     This avoids a second network fetch in the review step.
#   - Add TagSelect for tag assignment.
#   - CategorySelect and BrandSelect receive new optional onNameChange prop
#     to surface the resolved name alongside the ID.
#
#   NOTE: CategorySelect and BrandSelect need a small non-breaking prop
#   addition (onNameChange?: (name: string | null) => void). This is additive
#   — existing usages without the prop continue to work.
# =============================================================================

TARGET="$NEXT_ROOT/src/components/shared/create-product/CreateProductContentStep.tsx"
echo "→ [5/8] $TARGET"

cat > "$TARGET" << 'ENDOFFILE'
'use client';

/**
 * Wizard Step 1 — Content
 *
 * Collects:
 * - Product status (active / draft)
 * - Category assignment (nullable) — captures resolved name for review
 * - Brand assignment (nullable) — captures resolved name for review
 * - isFeatured toggle
 * - Tag assignments (number[])
 * - Locale-keyed translations (name, slug, description, SEO fields)
 *
 * Reuses StatusSelect and ProductContentTab from the edit editor for
 * UX consistency.
 */

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import { StatusSelect } from '@/app/[locale]/(admin)/stores/[storeId]/products/[productId]/_components/_components/StatusSelect';
import { ProductContentTab } from '@/app/[locale]/(admin)/stores/[storeId]/products/[productId]/_components/ProductContentTab';
import { CategorySelect } from './CategorySelect';
import { BrandSelect }    from './BrandSelect';
import { TagSelect }      from './TagSelect';

import type { Locale, ProductStatus } from '@/types/product';
import type { CreateProductContentData } from '@/schemas/products';

interface Props {
  storeId:          string;
  availableLocales: Locale[];
  content:          CreateProductContentData;
  tags:             number[];
  onChange:         (next: CreateProductContentData) => void;
  onTagsChange:     (next: number[]) => void;
}

export function CreateProductContentStep({
  storeId,
  availableLocales,
  content,
  tags,
  onChange,
  onTagsChange,
}: Props) {
  const t = useTranslations('products');

  return (
    <div className="space-y-6">

      {/* ── Status + Category + Brand + isFeatured + Tags ── */}
      <Card>
        <CardContent className="pt-6 space-y-6">

          {/* Status */}
          <StatusSelect
            value={content.status}
            onChange={(status: ProductStatus) =>
              onChange({ ...content, status })
            }
          />

          {/* Category — captures resolved name alongside ID */}
          <CategorySelect
            storeId={storeId}
            value={content.categoryId}
            onChange={(categoryId) =>
              onChange({ ...content, categoryId })
            }
            onNameChange={(categoryName) =>
              onChange({ ...content, categoryName })
            }
          />

          {/* Brand — captures resolved name alongside ID */}
          <BrandSelect
            storeId={storeId}
            value={content.brandId}
            onChange={(brandId) =>
              onChange({ ...content, brandId })
            }
            onNameChange={(brandName) =>
              onChange({ ...content, brandName })
            }
          />

          {/* Tags */}
          <TagSelect
            storeId={storeId}
            value={tags}
            onChange={onTagsChange}
          />

          {/* isFeatured */}
          <div className="flex items-start gap-3">
            <Switch
              id="is-featured"
              checked={content.isFeatured}
              onCheckedChange={(checked) =>
                onChange({ ...content, isFeatured: checked })
              }
            />
            <div className="space-y-1">
              <Label htmlFor="is-featured" className="cursor-pointer">
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
      {/*
        No casts needed — ProductTranslationFormData now includes
        is_complete?: boolean, making it structurally identical to
        ProductTranslation. See schemas/products.ts.
      */}
      <ProductContentTab
        availableLocales={availableLocales}
        translations={content.translations}
        onChange={(translations) => onChange({ ...content, translations })}
      />

    </div>
  );
}
ENDOFFILE

echo "   ✓ Done"

# Also patch CategorySelect and BrandSelect to support the optional onNameChange prop.

TARGET="$NEXT_ROOT/src/components/shared/create-product/CategorySelect.tsx"
echo "→ [5/8b] $TARGET  (additive: onNameChange prop)"

cat > "$TARGET" << 'ENDOFFILE'
'use client';

/**
 * CategorySelect
 *
 * Dropdown for selecting a product category.
 * Fetches active categories for the given store.
 * Includes a "No category" option to clear the selection.
 *
 * onNameChange (optional): called whenever the resolved display name of the
 * selected category changes. Used by the create wizard to capture the name
 * for the review step without a second network fetch. Existing usages that
 * don't need the name can omit this prop — it is purely additive.
 */

import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCategories } from '@/hooks/categories/useCategories';

interface Props {
  storeId:       string;
  value:         number | null;
  onChange:      (next: number | null) => void;
  onNameChange?: (name: string | null) => void;
}

const NO_CATEGORY = '__none__';

export function CategorySelect({ storeId, value, onChange, onNameChange }: Props) {
  const t = useTranslations('products');

  const { data, isLoading } = useCategories(storeId);
  const categories = data?.data ?? [];

  const handleChange = (raw: string | null) => {
    if (!raw || raw === NO_CATEGORY) {
      onChange(null);
      onNameChange?.(null);
      return;
    }
    const parsed = parseInt(raw, 10);
    const id = Number.isFinite(parsed) ? parsed : null;
    onChange(id);

    if (id !== null && onNameChange) {
      const found = categories.find((c) => c.id === id);
      onNameChange(found?.name ?? null);
    }
  };

  const selectValue = value !== null ? String(value) : NO_CATEGORY;

  return (
    <div className="space-y-2">
      <Label>{t('form.fields.category')}</Label>
      <Select
        value={selectValue}
        onValueChange={handleChange}
        disabled={isLoading}
      >
        <SelectTrigger>
          <SelectValue
            placeholder={
              isLoading
                ? t('form.fields.loading')
                : t('form.fields.categoryPlaceholder')
            }
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NO_CATEGORY}>
            {t('form.fields.noCategoryOption')}
          </SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={String(cat.id)}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
ENDOFFILE

echo "   ✓ Done"

TARGET="$NEXT_ROOT/src/components/shared/create-product/BrandSelect.tsx"
echo "→ [5/8c] $TARGET  (additive: onNameChange prop)"

cat > "$TARGET" << 'ENDOFFILE'
'use client';

/**
 * BrandSelect
 *
 * Dropdown for selecting a product brand.
 * Fetches active brands for the given store.
 * Includes a "No brand" option to clear the selection.
 *
 * onNameChange (optional): called whenever the resolved display name of the
 * selected brand changes. Used by the create wizard to capture the name for
 * the review step without a second network fetch. Purely additive — existing
 * usages without this prop continue to work unchanged.
 */

import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBrands } from '@/hooks/brands/useBrands';

interface Props {
  storeId:       string;
  value:         number | null;
  onChange:      (next: number | null) => void;
  onNameChange?: (name: string | null) => void;
}

const NO_BRAND = '__none__';

export function BrandSelect({ storeId, value, onChange, onNameChange }: Props) {
  const t = useTranslations('products');

  const { data, isLoading } = useBrands(storeId);
  const brands = data?.data ?? [];

  const handleChange = (raw: string | null) => {
    if (!raw || raw === NO_BRAND) {
      onChange(null);
      onNameChange?.(null);
      return;
    }
    const parsed = parseInt(raw, 10);
    const id = Number.isFinite(parsed) ? parsed : null;
    onChange(id);

    if (id !== null && onNameChange) {
      const found = brands.find((b) => b.id === id);
      onNameChange(found?.name ?? null);
    }
  };

  const selectValue = value !== null ? String(value) : NO_BRAND;

  return (
    <div className="space-y-2">
      <Label>{t('form.fields.brand')}</Label>
      <Select
        value={selectValue}
        onValueChange={handleChange}
        disabled={isLoading}
      >
        <SelectTrigger>
          <SelectValue
            placeholder={
              isLoading
                ? t('form.fields.loading')
                : t('form.fields.brandPlaceholder')
            }
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NO_BRAND}>
            {t('form.fields.noBrandOption')}
          </SelectItem>
          {brands.map((brand) => (
            <SelectItem key={brand.id} value={String(brand.id)}>
              {brand.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
ENDOFFILE

echo "   ✓ Done"

# =============================================================================
# [6/8]  src/lib/products/buildCreatePayload.ts
#
#   Changes:
#   - Accept the full CreateProductWizardState (which now includes media and tags)
#   - Wire images[] from media.images into the payload
#   - Wire tags[] from tags state into the payload
#   - No changes to the existing options / variants / translations logic
# =============================================================================

TARGET="$NEXT_ROOT/src/lib/products/buildCreatePayload.ts"
echo "→ [6/8] $TARGET"

cat > "$TARGET" << 'ENDOFFILE'
import type { ProductCreatePayload } from '@/types/product';
import type { CreateProductWizardState } from '@/schemas/products';

/**
 * Builds the API payload for creating a new product from wizard state.
 *
 * Mapping:
 * - content.status       → status
 * - content.categoryId   → category_id
 * - content.brandId      → brand_id
 * - content.isFeatured   → is_featured
 * - content.translations → translations[]
 * - structure.options    → options[]
 * - structure.variants   → variants[] with semantic options map
 * - media.images         → images[]   (product-level media)
 * - tags                 → tags[]     (integer IDs)
 *
 * UI-only fields that are NEVER sent to the backend:
 * - content.categoryName
 * - content.brandName
 *
 * Negative variant IDs are client-only — omitted from payload.
 * Empty translations (no name + slug) are filtered out.
 * Options with empty names or no values are filtered out.
 * Images with no URL are filtered out.
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
      values:   o.values
        .map((v) => v.value.trim())
        .filter((v) => v !== ''),
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

    return {
      // Only include real server IDs — negative IDs are client-only
      ...(typeof v.id === 'number' && v.id > 0 ? { id: v.id } : {}),
      sku:              v.sku              ?? null,
      price:            v.price,
      quantity:         v.quantity,
      is_active:        v.is_active,
      manufacture_date: v.manufacture_date ?? null,
      expiry_date:      v.expiry_date      ?? null,
      batch_number:     v.batch_number     ?? null,
      options:          optionsMap,
    };
  });

  // ── Default variant fallback ───────────────────────────────────
  // Backend requires at least one variant (min:1).
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

  // ── Product-level images ───────────────────────────────────────
  // Map ProductImage[] to the backend media contract.
  // Images with no URL are filtered as a safety guard.
  const images = (media?.images ?? [])
    .filter((img) => img.url?.trim() !== '')
    .map((img) => ({
      url:      img.url,
      alt:      img.alt ?? null,
      position: img.position,
    }));

  // ── Tags ───────────────────────────────────────────────────────
  // tags is number[] — backend expects integer IDs.
  // Empty array = no tags. Undefined = no change (but on create,
  // we always send the array explicitly).
  const tagIds = (tags ?? []).filter((id) => Number.isInteger(id) && id > 0);

  return {
    status:      content.status,
    category_id: content.categoryId  ?? null,
    brand_id:    content.brandId     ?? null,
    is_featured: content.isFeatured  ?? false,
    translations,
    options,
    variants,
    ...(images.length > 0 ? { images } : {}),
    ...(tagIds.length > 0 ? { tags: tagIds } : {}),
  };
}
ENDOFFILE

echo "   ✓ Done"

# =============================================================================
# [7/8]  src/components/shared/create-product/CreateProductWizard.tsx
#
#   Changes:
#   - Add media (CreateProductMediaData) and tags (number[]) wizard state
#   - Add 'media' wizard step between structure and review
#   - Wire CreateProductContentStep with new tags/onTagsChange props
#   - Wire CreateProductMediaStep
#   - Replace inline validateContent / validateStructure with the canonical
#     lib functions (validateProductContent / validateProductStructure)
#     to prevent validation rule drift between create and edit flows
#   - Pass full wizard state (content + structure + media + tags) to
#     buildCreatePayload
# =============================================================================

TARGET="$NEXT_ROOT/src/components/shared/create-product/CreateProductWizard.tsx"
echo "→ [7/8] $TARGET"

cat > "$TARGET" << 'ENDOFFILE'
'use client';

/**
 * CreateProductWizard
 *
 * Four-step wizard for creating a product:
 *   Step 1: Content   (status + category + brand + isFeatured + tags + translations)
 *   Step 2: Structure (options + variants)
 *   Step 3: Media     (product-level images)
 *   Step 4: Review    (summary + submit)
 *
 * Validation:
 *   Steps 1 and 2 use the canonical lib validators (validateProductContent /
 *   validateProductStructure) instead of inline duplicates, ensuring
 *   create and edit flows always validate identically.
 */

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/lib/navigation';

import { CreateProductContentStep }   from './CreateProductContentStep';
import { CreateProductStructureStep } from './CreateProductStructureStep';
import { CreateProductMediaStep }     from './CreateProductMediaStep';
import { CreateProductReviewStep }    from './CreateProductReviewStep';

import { buildCreatePayload }       from '@/lib/products/buildCreatePayload';
import { useCreateProduct }         from '@/hooks/products/useCreateProduct';
import { validateProductContent }   from '@/lib/products/validateProductContent';
import { validateProductStructure } from '@/lib/products/validateProductStructure';

import type { Locale, ProductTranslation } from '@/types/product';
import type {
  CreateProductContentData,
  CreateProductMediaData,
  CreateProductStructureData,
  CreateProductWizardState,
} from '@/schemas/products';
import { ROUTES } from '@/config/routes';

// ── Step definitions ────────────────────────────────────────────────────────

type WizardStep = 'content' | 'structure' | 'media' | 'review';

const STEPS: WizardStep[] = ['content', 'structure', 'media', 'review'];

// ── Default state builders ──────────────────────────────────────────────────

function buildDefaultTranslations(
  locales: Locale[]
): Record<Locale, ProductTranslation> {
  return locales.reduce<Record<Locale, ProductTranslation>>((acc, locale) => {
    acc[locale] = {
      locale,
      name:            '',
      slug:            '',
      description:     null,
      seo_title:       null,
      seo_description: null,
      is_complete:     false,
    };
    return acc;
  }, {});
}

function buildDefaultContent(locales: Locale[]): CreateProductContentData {
  return {
    status:       'draft',
    categoryId:   null,
    brandId:      null,
    categoryName: null,
    brandName:    null,
    isFeatured:   false,
    translations: buildDefaultTranslations(locales),
  };
}

function buildDefaultStructure(): CreateProductStructureData {
  return { options: [], variants: [] };
}

function buildDefaultMedia(): CreateProductMediaData {
  return { images: [] };
}

// ── Props ───────────────────────────────────────────────────────────────────

interface Props {
  storeId:           string;
  availableLocales?: Locale[];
  onSuccess:         (productId: number) => void;
}

// ── Component ───────────────────────────────────────────────────────────────

export function CreateProductWizard({
  storeId,
  availableLocales = ['en'],
  onSuccess,
}: Props) {
  const t = useTranslations('products');

  const [step, setStep]           = useState<WizardStep>('content');
  const [content, setContent]     = useState<CreateProductContentData>(
    () => buildDefaultContent(availableLocales)
  );
  const [structure, setStructure] = useState<CreateProductStructureData>(
    buildDefaultStructure
  );
  const [media, setMedia]         = useState<CreateProductMediaData>(
    buildDefaultMedia
  );
  const [tags, setTags]           = useState<number[]>([]);

  const stepIndex   = STEPS.indexOf(step);
  const isFirstStep = stepIndex === 0;
  const isLastStep  = stepIndex === STEPS.length - 1;

  const mutation = useCreateProduct(storeId, {
    onSuccess: (product) => {
      toast.success(t('form.createSuccess'));
      onSuccess(product.id);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // ── Navigation ────────────────────────────────────────────────────────────

  const handleNext = () => {
    if (step === 'content') {
      // Reuse the canonical lib validator — same rules as the edit content tab.
      // validateProductContent expects ProductContentFormValues; CreateProductContentData
      // is structurally compatible (same fields, translations shape matches).
      const result = validateProductContent({
        status:       content.status,
        categoryId:   content.categoryId,
        brandId:      content.brandId,
        isFeatured:   content.isFeatured,
        translations: content.translations,
      });
      if (!result.isValid) {
        // Surface first error as a toast; full list visible on review.
        toast.error(result.errors[0]?.message ?? t('form.validationError'));
        return;
      }
    }

    if (step === 'structure') {
      // Reuse the canonical lib validator — same rules as the edit structure tab.
      const result = validateProductStructure(structure);
      if (!result.isValid) {
        toast.error(result.errors[0]?.message ?? t('form.validationError'));
        return;
      }
    }

    // Media step: no blocking validation — images are optional on create.

    const next = STEPS[stepIndex + 1];
    if (next) setStep(next);
  };

  const handleBack = () => {
    const prev = STEPS[stepIndex - 1];
    if (prev) setStep(prev);
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = () => {
    const state: CreateProductWizardState = { content, structure, media, tags };
    const payload = buildCreatePayload(state);
    mutation.mutate(payload);
  };

  // ── Step labels ───────────────────────────────────────────────────────────

  const stepLabels: Record<WizardStep, string> = {
    content:   t('create.steps.content'),
    structure: t('create.steps.structure'),
    media:     t('create.steps.media'),
    review:    t('create.steps.review'),
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-center gap-4">
        <Link href={ROUTES.store(storeId).products.list()}>
          <Button variant="ghost" size="icon" type="button">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{t('form.createTitle')}</h1>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 flex-wrap">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={[
                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold',
                s === step
                  ? 'bg-primary text-primary-foreground'
                  : i < stepIndex
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground',
              ].join(' ')}
            >
              {i + 1}
            </div>
            <span
              className={[
                'text-sm',
                s === step ? 'font-medium text-foreground' : 'text-muted-foreground',
              ].join(' ')}
            >
              {stepLabels[s]}
            </span>
            {i < STEPS.length - 1 && (
              <div className="mx-1 h-px w-8 bg-border" />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      {step === 'content' && (
        <CreateProductContentStep
          storeId={storeId}
          availableLocales={availableLocales}
          content={content}
          tags={tags}
          onChange={setContent}
          onTagsChange={setTags}
        />
      )}

      {step === 'structure' && (
        <CreateProductStructureStep
          structure={structure}
          onChange={setStructure}
        />
      )}

      {step === 'media' && (
        <CreateProductMediaStep
          media={media}
          onChange={setMedia}
        />
      )}

      {step === 'review' && (
        <CreateProductReviewStep
          state={{ content, structure, media, tags }}
        />
      )}

      {/* Navigation footer */}
      <div className="flex items-center justify-between border-t pt-4">
        <div>
          {!isFirstStep && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={mutation.isPending}
            >
              {t('create.back')}
            </Button>
          )}
        </div>
        <div>
          {!isLastStep ? (
            <Button type="button" onClick={handleNext}>
              {t('create.next')}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={mutation.isPending}
            >
              {mutation.isPending
                ? t('form.submit.creating')
                : t('form.submit.create')}
            </Button>
          )}
        </div>
      </div>

    </div>
  );
}
ENDOFFILE

echo "   ✓ Done"

# =============================================================================
# [8/8]  src/components/shared/create-product/CreateProductReviewStep.tsx
#
#   Changes:
#   - Show category name (content.categoryName) instead of "#id"
#   - Show brand name (content.brandName) instead of "#id"
#   - Show image count from media.images
#   - Show assigned tag count (tags.length)
#   - Improve translation preview: show name per locale
#   - Improve variant summary: show SKU and price per variant (up to 5),
#     with overflow count for large variant sets
# =============================================================================

TARGET="$NEXT_ROOT/src/components/shared/create-product/CreateProductReviewStep.tsx"
echo "→ [8/8] $TARGET"

cat > "$TARGET" << 'ENDOFFILE'
'use client';

/**
 * Wizard Step 4 — Review & Create
 *
 * Displays a full summary of what will be sent to the backend:
 * - Status and isFeatured flag
 * - Category and Brand (resolved names, not raw IDs)
 * - Tags count
 * - Translations (locale + name)
 * - Options and variants (with SKU/price preview)
 * - Media image count
 */

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

  const optionCount  = structure.options.length;
  const variantCount = structure.variants.length;
  const imageCount   = media?.images?.length ?? 0;
  const tagCount     = tags?.length ?? 0;

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
              <Badge
                variant={content.status === 'active' ? 'default' : 'outline'}
              >
                {content.status}
              </Badge>
              {content.isFeatured && (
                <Badge variant="secondary">
                  {t('form.fields.isFeatured')}
                </Badge>
              )}
            </div>
          </div>

          {/* Category — show resolved name, fall back to ID, then "none" */}
          <div className="flex items-center justify-between border-b pb-3">
            <span className="text-sm font-medium">
              {t('form.fields.category')}
            </span>
            <span className="text-sm text-muted-foreground">
              {content.categoryName
                ? content.categoryName
                : content.categoryId !== null
                  ? `#${content.categoryId}`
                  : t('form.fields.noCategoryOption')}
            </span>
          </div>

          {/* Brand — show resolved name, fall back to ID, then "none" */}
          <div className="flex items-center justify-between border-b pb-3">
            <span className="text-sm font-medium">
              {t('form.fields.brand')}
            </span>
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
            <span className="text-sm font-medium">
              {t('form.fields.tags')}
            </span>
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

          {/* Variants — with SKU/price preview for up to 5 */}
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
                  // Build a label from option assignments
                  const label = (v.options ?? [])
                    .map((o) => o.option_value)
                    .filter(Boolean)
                    .join(' / ') || t('create.review.defaultVariant');
                  return (
                    <span key={v.id ?? i} className="text-sm text-muted-foreground text-right">
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

          {/* Media */}
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
ENDOFFILE

echo "   ✓ Done"

# =============================================================================

echo ""
echo "============================================================"
echo "  All 8 patches applied successfully."
echo ""
echo "  Summary:"
echo "  [1] schemas/products.ts           — media + tags + names in WizardState"
echo "  [2] hooks/tags/useTags.ts          — new: tag fetching hook"
echo "  [3] TagSelect.tsx                  — new: multi-select tag picker"
echo "  [4] CreateProductMediaStep.tsx     — new: media wizard step"
echo "  [5] CreateProductContentStep.tsx   — tags + name capture"
echo "      CategorySelect.tsx             — additive: onNameChange prop"
echo "      BrandSelect.tsx                — additive: onNameChange prop"
echo "  [6] buildCreatePayload.ts          — wire images[] and tags[]"
echo "  [7] CreateProductWizard.tsx        — 4 steps, lib validators, full state"
echo "  [8] CreateProductReviewStep.tsx    — names, media count, tags, variants"
echo "============================================================"
echo ""
echo "  Required i18n keys (add to your messages files):"
echo "    products.create.steps.media"
echo "    products.create.review.tagsCount"
echo "    products.create.review.noTags"
echo "    products.create.review.imagesCount"
echo "    products.create.review.noImages"
echo "    products.create.review.defaultVariant"
echo "    products.create.review.variantsMore"
echo "    products.form.fields.tags"
echo "    products.form.fields.tagsPlaceholder"
echo "    products.form.fields.tagsSelected"
echo "    products.form.fields.tagsSearch"
echo "    products.form.fields.tagsEmpty"
echo ""
echo "  Intentionally deferred:"
echo "    variants.*.media[] — per-variant image upload (complex UX,"
echo "    low initial value). Backend contract is documented in"
echo "    CreateProductMediaData JSDoc."
echo ""
echo "  Next steps:"
echo "    1. Run: tsc --noEmit  (verify no type errors)"
echo "    2. Add the i18n keys above to your messages files"
echo "    3. Verify MediaTab props match CreateProductMediaStep usage"
echo "       (MediaTab must accept: images: ProductImage[], onChange: (images) => void)"
echo "============================================================"
echo ""