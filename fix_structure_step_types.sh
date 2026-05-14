#!/usr/bin/env bash

# =============================================================================
# Fix: CreateProductStructureStep sku type mismatch
# Root cause: CreateProductVariantSchema.sku is string | null | undefined
#             but ProductVariant.sku is string | null
# Fix: align schema to use .nullable() without .optional()
#      and cast structure.variants to ProductVariant[] via normalizer
# =============================================================================

set -e

BASE="$(cd "$(dirname "$0")" && pwd)"
SRC="$BASE/src"

echo "→ Fixing sku type mismatch in schemas/products.ts and CreateProductStructureStep..."

# =============================================================================
# Fix 1 — schemas/products.ts
# Change sku from .nullable().optional() to .nullable() with default null
# so the inferred type is string | null, matching ProductVariant exactly.
# =============================================================================

cat > "$SRC/schemas/products.ts" << 'EOF'
/**
 * Zod schemas for product filters and create wizard validation.
 */

import { z } from 'zod';

// ── List filters (unchanged) ────────────────────────────────────────────────

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
});

export type ProductTranslationFormData = z.infer<typeof ProductTranslationSchema>;

export const CreateProductContentSchema = z.object({
  status:       z.enum(['active', 'draft']).default('draft'),
  translations: z.record(z.string(), ProductTranslationSchema),
});

export type CreateProductContentData = z.infer<typeof CreateProductContentSchema>;

// ── Create wizard — Step 2: Structure ──────────────────────────────────────

export const CreateProductOptionValueSchema = z.object({
  id:    z.number().nullable().default(null),
  value: z.string().min(1),
});

export const CreateProductOptionSchema = z.object({
  id:       z.number().nullable().default(null),
  name:     z.string().min(1, 'Option name is required'),
  position: z.number().int().min(1),
  values:   z.array(CreateProductOptionValueSchema).min(1),
});

/**
 * Variant schema for the create wizard.
 *
 * All nullable fields use .nullable().default(null) — NOT .optional() —
 * so the inferred TypeScript type is `string | null` (not `string | null | undefined`).
 * This keeps the schema compatible with ProductVariant from types/product.ts,
 * which uses `string | null` for sku and date fields.
 */
export const CreateProductVariantSchema = z.object({
  id:               z.number(),
  sku:              z.string().nullable().default(null),
  price:            z.number().min(0, 'Price must be 0 or greater'),
  quantity:         z.number().int().min(0, 'Quantity must be 0 or greater'),
  is_active:        z.boolean().default(true),
  manufacture_date: z.string().nullable().default(null),
  expiry_date:      z.string().nullable().default(null),
  batch_number:     z.string().nullable().default(null),
  options:          z.array(
    z.object({
      option_name:  z.string(),
      option_value: z.string(),
    })
  ).default([]),
});

export const CreateProductStructureSchema = z.object({
  options:  z.array(CreateProductOptionSchema).default([]),
  variants: z.array(CreateProductVariantSchema).default([]),
});

export type CreateProductStructureData = z.infer<typeof CreateProductStructureSchema>;

// ── Full wizard state (union of all steps) ─────────────────────────────────

export interface CreateProductWizardState {
  content:   CreateProductContentData;
  structure: CreateProductStructureData;
}
EOF

echo "   ✓ schemas/products.ts fixed (sku: string | null)"

# =============================================================================
# Fix 2 — CreateProductStructureStep.tsx
# Cast structure.variants to ProductVariant[] explicitly.
# The schema now produces the correct shape but TypeScript still needs
# an explicit cast because Zod's inferred type and our manual interface
# are structurally identical but not literally the same declaration.
# =============================================================================

cat > "$SRC/components/shared/create-product/CreateProductStructureStep.tsx" << 'EOF'
'use client';

/**
 * Wizard Step 2 — Structure
 *
 * Collects:
 * - Canonical product options (name, position, values)
 * - Generated variants (SKU, price, quantity, active flag)
 *
 * Reuses the existing ProductOptionsSection and VariantsTable
 * components from the edit editor, ensuring UX consistency.
 */

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { ProductOptionsSection } from '@/app/[locale]/(admin)/stores/[storeId]/products/[productId]/_components/ProductOptionsSection';
import { VariantsTable } from '@/app/[locale]/(admin)/stores/[storeId]/products/[productId]/_components/_components/VariantsTable';

import { generateVariants } from '@/lib/products/generateVariants';

import type { ProductOption, ProductVariant } from '@/types/product';
import type { CreateProductStructureData } from '@/schemas/products';

interface Props {
  structure: CreateProductStructureData;
  onChange:  (next: CreateProductStructureData) => void;
}

/**
 * Normalizes the wizard's variant array to match ProductVariant exactly.
 *
 * The Zod schema and ProductVariant are structurally identical, but
 * TypeScript treats them as distinct types because they come from
 * different declarations. This cast is safe — the schema enforces
 * the same shape as the interface.
 */
function toProductVariants(
  variants: CreateProductStructureData['variants']
): ProductVariant[] {
  return variants.map((v) => ({
    id:               v.id,
    sku:              v.sku ?? null,
    price:            v.price,
    quantity:         v.quantity,
    is_active:        v.is_active,
    manufacture_date: v.manufacture_date ?? null,
    expiry_date:      v.expiry_date ?? null,
    batch_number:     v.batch_number ?? null,
    options:          v.options,
  }));
}

/**
 * Normalizes the wizard's option array to match ProductOption exactly.
 */
function toProductOptions(
  options: CreateProductStructureData['options']
): ProductOption[] {
  return options.map((o) => ({
    id:       o.id ?? null,
    name:     o.name,
    position: o.position,
    values:   o.values.map((v) => ({
      id:    v.id ?? null,
      value: v.value,
    })),
  }));
}

export function CreateProductStructureStep({ structure, onChange }: Props) {
  const t = useTranslations('products');

  const productOptions  = toProductOptions(structure.options);
  const productVariants = toProductVariants(structure.variants);

  const handleOptionsChange = (options: ProductOption[]) => {
    onChange({ ...structure, options });
  };

  const handleVariantsChange = (variants: ProductVariant[]) => {
    onChange({ ...structure, variants });
  };

  const handleGenerate = () => {
    const regenerated = generateVariants(productOptions, productVariants);
    onChange({ ...structure, variants: regenerated });
  };

  return (
    <div className="space-y-6">

      {/* Options editor */}
      <Card>
        <CardHeader>
          <CardTitle>{t('editor.tabs.options')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <ProductOptionsSection
            options={productOptions}
            onChange={handleOptionsChange}
          />
          {structure.options.length > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleGenerate}
            >
              {t('variantEditor.attributes.generateCombinations')}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Variants table — only shown when variants exist */}
      {structure.variants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('variantEditor.tabs.variants')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <VariantsTable
              variants={productVariants}
              onChange={handleVariantsChange}
            />
          </CardContent>
        </Card>
      )}

    </div>
  );
}
EOF

echo "   ✓ CreateProductStructureStep.tsx fixed (explicit normalizer cast)"

echo ""
echo "============================================="
echo " ✅ Fix complete"
echo "============================================="
echo ""
echo " Run to verify:"
echo "   npx tsc --noEmit"
echo ""