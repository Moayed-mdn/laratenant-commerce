#!/usr/bin/env bash
# =============================================================================
# apply-fixes.sh
#
# Applies 5 targeted patches to the commerce platform:
#
#   [1/5] UpdateProductRequest.php  — variants.*.sku: required→nullable + distinct
#   [2/5] schemas/products.ts       — add is_complete to ProductTranslationSchema
#   [3/5] CreateProductContentStep  — remove unsafe type casts on translations
#   [4/5] ProductOptionsSection     — remove dead nextValueId function
#   [5/5] ProductContentTab         — remove no-op useMemo
#
# Usage:
#   chmod +x apply-fixes.sh && ./apply-fixes.sh
#
# Adjust LARAVEL_ROOT below if your backend lives elsewhere.
# =============================================================================

set -euo pipefail

NEXT_ROOT="/home/leader/projects/next/laratenant-commerce"

# ── Adjust this to your Laravel project root ──────────────────────────────────
LARAVEL_ROOT="/home/leader/projects/laravel/laratenant-commerce"
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo "============================================================"
echo "  Commerce Platform — Applying 5 patches"
echo "============================================================"
echo ""

# =============================================================================
# [1/5]  UpdateProductRequest.php
#        variants.*.sku: 'required' → 'nullable', add 'distinct'
#        This aligns the update contract with the create contract and prevents
#        422 errors when saving structure with auto-generated null-SKU variants.
# =============================================================================

TARGET="$LARAVEL_ROOT/app/Http/Requests/Admin/Product/UpdateProductRequest.php"
echo "→ [1/5] $TARGET"

cat > "$TARGET" << 'ENDOFFILE'
<?php

namespace App\Http\Requests\Admin\Product;

use App\Enums\RoleEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole(RoleEnum::SUPER_ADMIN->value)
            || $this->user()->hasPermissionTo(
                'product.update',
                $this->route('store'),
            );
    }

    public function rules(): array
    {
        return [

            /*
            |------------------------------------------------------------------
            | Product
            |------------------------------------------------------------------
            */

            'category_id' => [
                'nullable',
                'integer',
                'exists:categories,id',
            ],

            'brand_id' => [
                'nullable',
                'integer',
                'exists:brands,id',
            ],

            'is_active' => [
                'sometimes',
                'nullable',
                'boolean',
            ],

            'is_featured' => [
                'sometimes',
                'nullable',
                'boolean',
            ],

            'sync_variants' => [
                'sometimes',
                'nullable',
                'boolean',
            ],

            /*
            |------------------------------------------------------------------
            | Translations
            |------------------------------------------------------------------
            */

            'translations' => [
                'sometimes',
                'nullable',
                'array',
                'min:1',
            ],

            'translations.*.locale' => [
                'required_with:translations',
                'string',
                'size:2',
                Rule::in(
                    config(
                        'content.editable_locales',
                        config('app.supported_locales', [])
                    )
                ),
            ],

            'translations.*.name' => [
                'required_with:translations',
                'string',
                'max:255',
            ],

            'translations.*.slug' => [
                'required_with:translations',
                'string',
                'max:255',
            ],

            'translations.*.description' => [
                'nullable',
                'string',
            ],

            'translations.*.seo_title' => [
                'nullable',
                'string',
                'max:255',
            ],

            'translations.*.seo_description' => [
                'nullable',
                'string',
                'max:1000',
            ],

            /*
            |------------------------------------------------------------------
            | Canonical Product Options
            |------------------------------------------------------------------
            */

            'options' => [
                'sometimes',
                'nullable',
                'array',
                'max:3',
            ],

            'options.*.name' => [
                'required',
                'string',
                'max:100',
            ],

            'options.*.position' => [
                'required',
                'integer',
                'min:1',
            ],

            'options.*.values' => [
                'required',
                'array',
                'min:1',
            ],

            'options.*.values.*' => [
                'required',
                'string',
                'max:100',
            ],

            /*
            |------------------------------------------------------------------
            | Variants
            |------------------------------------------------------------------
            */

            'variants' => [
                'sometimes',
                'nullable',
                'array',
            ],

            'variants.*.id' => [
                'sometimes',
                'nullable',
                'integer',
            ],

            /*
            |------------------------------------------------------------------
            | Variant Core
            |------------------------------------------------------------------
            */

            // FIX: was ['required', 'string', 'max:100']
            // Changed to nullable + distinct to match CreateProductRequest
            // and to prevent 422 on structure saves with auto-generated variants
            // that have no SKU yet.
            'variants.*.sku' => [
                'nullable',
                'string',
                'max:100',
                'distinct',
            ],

            'variants.*.barcode' => [
                'nullable',
                'string',
                'max:100',
            ],

            'variants.*.price' => [
                'required',
                'numeric',
                'min:0',
            ],

            'variants.*.compare_at_price' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'variants.*.cost_price' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'variants.*.quantity' => [
                'required',
                'integer',
                'min:0',
            ],

            'variants.*.low_stock_threshold' => [
                'nullable',
                'integer',
                'min:0',
            ],

            'variants.*.track_inventory' => [
                'sometimes',
                'nullable',
                'boolean',
            ],

            'variants.*.is_active' => [
                'sometimes',
                'nullable',
                'boolean',
            ],

            /*
            |------------------------------------------------------------------
            | Physical / Shipping
            |------------------------------------------------------------------
            */

            'variants.*.weight' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'variants.*.weight_unit' => [
                'nullable',
                'string',
                Rule::in(['g', 'kg', 'lb']),
            ],

            /*
            |------------------------------------------------------------------
            | Batch / Expiry
            |------------------------------------------------------------------
            */

            'variants.*.manufacture_date' => [
                'nullable',
                'date',
            ],

            'variants.*.expiry_date' => [
                'nullable',
                'date',
                'after_or_equal:variants.*.manufacture_date',
            ],

            'variants.*.batch_number' => [
                'nullable',
                'string',
                'max:100',
            ],

            /*
            |------------------------------------------------------------------
            | Variant Option Mapping
            |------------------------------------------------------------------
            */

            'variants.*.options' => [
                'sometimes',
                'nullable',
                'array',
            ],

            'variants.*.options.*' => [
                'sometimes',
                'string',
                'max:100',
            ],

            /*
            |------------------------------------------------------------------
            | Variant Media
            |------------------------------------------------------------------
            */

            'variants.*.media' => [
                'sometimes',
                'nullable',
                'array',
            ],

            'variants.*.media.*.url' => [
                'required',
                'string',
            ],

            'variants.*.media.*.alt' => [
                'nullable',
                'string',
                'max:255',
            ],

            'variants.*.media.*.position' => [
                'nullable',
                'integer',
                'min:0',
            ],

            /*
            |------------------------------------------------------------------
            | Product-Level Media
            |------------------------------------------------------------------
            */

            'media' => [
                'sometimes',
                'nullable',
                'array',
            ],

            'media.*.url' => [
                'required',
                'string',
            ],

            'media.*.alt' => [
                'nullable',
                'string',
                'max:255',
            ],

            'media.*.position' => [
                'nullable',
                'integer',
                'min:0',
            ],

            /*
            |------------------------------------------------------------------
            | Tags
            |------------------------------------------------------------------
            |
            | Products reference tags by integer ID only.
            | Tag creation and translation management are handled by the
            | dedicated tag management API, not by product endpoints.
            | Absence of this key = no change to existing tag assignments.
            | Sending an empty array = detach all tags from this product.
            |------------------------------------------------------------------
            */

            'tags' => [
                'sometimes',
                'nullable',
                'array',
            ],

            'tags.*' => [
                'integer',
                'exists:tags,id',
            ],
        ];
    }
}
ENDOFFILE

echo "   ✓ Done"

# =============================================================================
# [2/5]  src/schemas/products.ts
#        Add is_complete: z.boolean().optional() to ProductTranslationSchema.
#        This makes ProductTranslationFormData structurally identical to
#        ProductTranslation, eliminating the type mismatch that forced the
#        unsafe casts in CreateProductContentStep.
# =============================================================================

TARGET="$NEXT_ROOT/src/schemas/products.ts"
echo "→ [2/5] $TARGET"

cat > "$TARGET" << 'ENDOFFILE'
/**
 * Zod schemas for product filters and create wizard validation.
 *
 * Design note — two-type-system rule:
 * Zod schemas are used for RUNTIME VALIDATION only.
 * Wizard STATE types use the canonical domain types from types/product.ts
 * (ProductVariant, ProductOption) directly.
 */

import { z } from 'zod';
import type { ProductOption, ProductVariant } from '@/types/product';

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
  // FIX: added to match ProductTranslation from types/product.ts.
  // Removes the structural mismatch that forced unsafe casts in
  // CreateProductContentStep when passing translations to ProductContentTab.
  is_complete:     z.boolean().optional(),
});

export type ProductTranslationFormData = z.infer<typeof ProductTranslationSchema>;

export const CreateProductContentSchema = z.object({
  status:       z.enum(['active', 'draft']).default('draft'),
  categoryId:   z.number().int().nullable().default(null),
  brandId:      z.number().int().nullable().default(null),
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

// ── Full wizard state ───────────────────────────────────────────────────────

export interface CreateProductWizardState {
  content:   CreateProductContentData;
  structure: CreateProductStructureData;
}
ENDOFFILE

echo "   ✓ Done"

# =============================================================================
# [3/5]  CreateProductContentStep.tsx
#        Remove the two unsafe type casts on translations now that
#        ProductTranslationFormData is structurally identical to
#        ProductTranslation (both include is_complete?: boolean).
#        Also drops the now-unused ProductTranslation import.
# =============================================================================

TARGET="$NEXT_ROOT/src/components/shared/create-product/CreateProductContentStep.tsx"
echo "→ [3/5] $TARGET"

cat > "$TARGET" << 'ENDOFFILE'
'use client';

/**
 * Wizard Step 1 — Content
 *
 * Collects:
 * - Product status (active / draft)
 * - Category assignment (nullable)
 * - Brand assignment (nullable)
 * - isFeatured toggle
 * - Locale-keyed translations (name, slug, description, SEO fields)
 *
 * Reuses the existing StatusSelect and ProductContentTab components
 * from the edit editor for UX consistency.
 */

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import { StatusSelect } from '@/app/[locale]/(admin)/stores/[storeId]/products/[productId]/_components/_components/StatusSelect';
import { ProductContentTab } from '@/app/[locale]/(admin)/stores/[storeId]/products/[productId]/_components/ProductContentTab';
import { CategorySelect } from './CategorySelect';
import { BrandSelect }    from './BrandSelect';

// FIX: removed ProductTranslation — no longer needed after type cast removal.
// ProductTranslationFormData (from Zod schema) now includes is_complete?: boolean,
// making it structurally identical to ProductTranslation. The casts below
// that required an explicit ProductTranslation annotation are gone.
import type { Locale, ProductStatus } from '@/types/product';
import type { CreateProductContentData } from '@/schemas/products';

interface Props {
  storeId:          string;
  availableLocales: Locale[];
  content:          CreateProductContentData;
  onChange:         (next: CreateProductContentData) => void;
}

export function CreateProductContentStep({
  storeId,
  availableLocales,
  content,
  onChange,
}: Props) {
  const t = useTranslations('products');

  return (
    <div className="space-y-6">

      {/* ── Status + Category + Brand + isFeatured ── */}
      <Card>
        <CardContent className="pt-6 space-y-6">

          {/* Status */}
          <StatusSelect
            value={content.status}
            onChange={(status: ProductStatus) =>
              onChange({ ...content, status })
            }
          />

          {/* Category */}
          <CategorySelect
            storeId={storeId}
            value={content.categoryId}
            onChange={(categoryId) =>
              onChange({ ...content, categoryId })
            }
          />

          {/* Brand */}
          <BrandSelect
            storeId={storeId}
            value={content.brandId}
            onChange={(brandId) =>
              onChange({ ...content, brandId })
            }
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
        FIX: casts removed.
        Before:
          translations={content.translations as Record<Locale, ProductTranslation>}
          onChange={(translations) =>
            onChange({ ...content, translations: translations as CreateProductContentData['translations'] })
          }

        After: no casts needed — ProductTranslationFormData is now structurally
        identical to ProductTranslation (both have is_complete?: boolean),
        so Record<string, ProductTranslationFormData> satisfies
        Record<Locale, ProductTranslation> natively.
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

# =============================================================================
# [4/5]  ProductOptionsSection.tsx
#        Remove dead `nextValueId` function.
#        It was defined but never called — nextGlobalValueId is used for all
#        new value ID generation. Zero behavior change.
# =============================================================================

TARGET="$NEXT_ROOT/src/app/[locale]/(admin)/stores/[storeId]/products/[productId]/_components/ProductOptionsSection.tsx"
echo "→ [4/5] $TARGET"

cat > "$TARGET" << 'ENDOFFILE'
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

  // FIX: removed nextValueId — it was defined but never called.
  // nextGlobalValueId is used for all new value ID generation.

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
        { id: nextGlobalValueId(), value: '' },
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
ENDOFFILE

echo "   ✓ Done"

# =============================================================================
# [5/5]  ProductContentTab.tsx
#        Remove the no-op useMemo wrapping availableLocales.
#        The memo performed no transformation — it memoized an array reference
#        that changes on every parent render anyway, doing nothing useful.
#        Also removes useMemo from the React import.
# =============================================================================

TARGET="$NEXT_ROOT/src/app/[locale]/(admin)/stores/[storeId]/products/[productId]/_components/ProductContentTab.tsx"
echo "→ [5/5] $TARGET"

cat > "$TARGET" << 'ENDOFFILE'
'use client';

// FIX: removed useMemo — it was wrapping availableLocales with no transformation,
// memoizing an array reference that changes on every parent render anyway.
import { useEffect, useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import type { Locale, ProductTranslation } from '@/types/product';
import { LocaleTabs } from './LocaleTabs';
import { TranslationForm } from './TranslationForm';

interface Props {
  availableLocales: Locale[];
  translations: Record<Locale, ProductTranslation>;
  onChange: (next: Record<Locale, ProductTranslation>) => void;
}

export function ProductContentTab({ availableLocales, translations, onChange }: Props) {
  // FIX: was `const locales = useMemo(() => availableLocales, [availableLocales]);`
  // No transformation was happening — direct assignment is correct here.
  const locales = availableLocales;
  const [activeLocale, setActiveLocale] = useState<Locale>(locales[0] ?? '');

  useEffect(() => {
    if (!activeLocale && locales[0]) setActiveLocale(locales[0]);
    if (activeLocale && locales.length > 0 && !locales.includes(activeLocale)) setActiveLocale(locales[0]);
  }, [activeLocale, locales]);

  if (locales.length === 0) return null;

  const current = translations[activeLocale];

  return (
    <Tabs value={activeLocale} onValueChange={(v) => setActiveLocale(v as Locale)} className="space-y-4">
      <LocaleTabs locales={locales} translations={translations} />
      <TabsContent value={activeLocale}>
        <Card>
          <CardContent className="pt-6">
            {current && (
              <TranslationForm
                locale={activeLocale}
                value={current}
                onChange={(next) => onChange({ ...translations, [activeLocale]: next })}
              />
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
ENDOFFILE

echo "   ✓ Done"

# =============================================================================

echo ""
echo "============================================================"
echo "  All 5 patches applied successfully."
echo ""
echo "  Summary of changes:"
echo "  [1] UpdateProductRequest.php  — variants.*.sku: nullable + distinct"
echo "  [2] schemas/products.ts       — is_complete added to Zod schema"
echo "  [3] CreateProductContentStep  — type casts removed"
echo "  [4] ProductOptionsSection     — dead nextValueId removed"
echo "  [5] ProductContentTab         — no-op useMemo removed"
echo "============================================================"
echo ""
echo "  Next steps:"
echo "  • Run your Laravel test suite to confirm no regression on"
echo "    the SKU validation change (UpdateProductRequest)."
echo "  • Run tsc --noEmit in the Next.js project to confirm the"
echo "    translation type alignment resolves cleanly."
echo "============================================================"
echo ""