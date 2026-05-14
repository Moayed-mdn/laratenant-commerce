#!/usr/bin/env bash

# =============================================================================
# Create Product Wizard Migration
# Replaces flat ProductForm with multi-step wizard aligned to new backend contract
# =============================================================================

set -e

BASE="$(cd "$(dirname "$0")" && pwd)"
SRC="$BASE/src"

echo "============================================="
echo " Create Product Wizard Migration"
echo "============================================="

# =============================================================================
# PHASE 1 — LOCALE FILES (add new wizard keys)
# =============================================================================

echo ""
echo "→ Phase 1: Updating locale files..."

mkdir -p "$SRC/locales/en"
mkdir -p "$SRC/locales/ar"

# We use Python to merge new keys into existing JSON files cleanly.
# This preserves all existing keys and appends the new create wizard keys
# under products.create.

python3 - << 'PYEOF'
import json, os

base = os.environ.get('SRC', 'src')

# ── New keys to inject ──────────────────────────────────────────────────────
en_create = {
    "back": "Back",
    "next": "Next",
    "steps": {
        "content":   "Content",
        "structure": "Structure",
        "review":    "Review"
    },
    "review": {
        "title":              "Ready to create",
        "subtitle":           "Review your product before creating it.",
        "status":             "Status",
        "translationsCount":  "{count, plural, one {# translation} other {# translations}}",
        "optionsCount":       "{count, plural, one {# option} other {# options}}",
        "variantsCount":      "{count, plural, one {# variant} other {# variants}}",
        "noVariants":         "No variants defined — a default variant will be created.",
        "noOptions":          "No options defined — product has a single default variant.",
        "noTranslations":     "No translations defined."
    }
}

ar_create = {
    "back": "السابق",
    "next": "التالي",
    "steps": {
        "content":   "المحتوى",
        "structure": "البنية",
        "review":    "المراجعة"
    },
    "review": {
        "title":              "جاهز للإنشاء",
        "subtitle":           "راجع المنتج قبل إنشائه.",
        "status":             "الحالة",
        "translationsCount":  "{count, plural, =0 {لا توجد ترجمات} =1 {ترجمة واحدة} =2 {ترجمتان} few {# ترجمات} many {# ترجمة} other {# ترجمة}}",
        "optionsCount":       "{count, plural, =0 {لا توجد خيارات} =1 {خيار واحد} =2 {خياران} few {# خيارات} many {# خيار} other {# خيار}}",
        "variantsCount":      "{count, plural, =0 {لا توجد متغيرات} =1 {متغير واحد} =2 {متغيران} few {# متغيرات} many {# متغير} other {# متغير}}",
        "noVariants":         "لم يتم تحديد متغيرات — سيتم إنشاء متغير افتراضي.",
        "noOptions":          "لم يتم تحديد خيارات — المنتج له متغير افتراضي واحد.",
        "noTranslations":     "لم يتم تحديد ترجمات."
    }
}

for lang, create_keys in [('en', en_create), ('ar', ar_create)]:
    path = os.path.join(base, 'locales', lang, 'common.json')
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Inject under products.create
    if 'products' not in data:
        data['products'] = {}
    data['products']['create'] = create_keys

    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f'  ✓ {lang}/common.json updated')

PYEOF

echo "   ✓ Locale files updated"

# =============================================================================
# PHASE 2 — SCHEMAS (keep ProductFiltersSchema, replace ProductFormSchema)
# =============================================================================

echo ""
echo "→ Phase 2: Updating schemas/products.ts..."

mkdir -p "$SRC/schemas"

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
  description:     z.string().nullable().optional(),
  seo_title:       z.string().max(255).nullable().optional(),
  seo_description: z.string().max(1000).nullable().optional(),
});

export type ProductTranslationFormData = z.infer<typeof ProductTranslationSchema>;

export const CreateProductContentSchema = z.object({
  status:       z.enum(['active', 'draft']).default('draft'),
  translations: z.record(z.string(), ProductTranslationSchema),
});

export type CreateProductContentData = z.infer<typeof CreateProductContentSchema>;

// ── Create wizard — Step 2: Structure ──────────────────────────────────────

export const CreateProductOptionValueSchema = z.object({
  id:    z.number().nullable().optional(),
  value: z.string().min(1),
});

export const CreateProductOptionSchema = z.object({
  id:       z.number().nullable().optional(),
  name:     z.string().min(1, 'Option name is required'),
  position: z.number().int().min(1),
  values:   z.array(CreateProductOptionValueSchema).min(1),
});

export const CreateProductVariantSchema = z.object({
  id:               z.number(),
  sku:              z.string().nullable().optional(),
  price:            z.number().min(0, 'Price must be 0 or greater'),
  quantity:         z.number().int().min(0, 'Quantity must be 0 or greater'),
  is_active:        z.boolean().default(true),
  manufacture_date: z.string().nullable().optional(),
  expiry_date:      z.string().nullable().optional(),
  batch_number:     z.string().nullable().optional(),
  options:          z.array(z.object({
    option_name:  z.string(),
    option_value: z.string(),
  })),
});

export const CreateProductStructureSchema = z.object({
  options:  z.array(CreateProductOptionSchema),
  variants: z.array(CreateProductVariantSchema),
});

export type CreateProductStructureData = z.infer<typeof CreateProductStructureSchema>;

// ── Full wizard state (union of all steps) ─────────────────────────────────

export interface CreateProductWizardState {
  content:   CreateProductContentData;
  structure: CreateProductStructureData;
}
EOF

echo "   ✓ schemas/products.ts updated"

# =============================================================================
# PHASE 3 — PAYLOAD BUILDER FOR CREATE
# =============================================================================

echo ""
echo "→ Phase 3: Writing buildCreatePayload.ts..."

mkdir -p "$SRC/lib/products"

cat > "$SRC/lib/products/buildCreatePayload.ts" << 'EOF'
import type { ProductCreatePayload } from '@/types/product';
import type { CreateProductWizardState } from '@/schemas/products';

/**
 * Builds the API payload for creating a new product from wizard state.
 *
 * Mapping logic:
 * - content.status          → status
 * - content.translations    → translations[] (values of the locale-keyed record)
 * - structure.options       → options[] (name, position, values as string[])
 * - structure.variants      → variants[] (with semantic options map)
 *
 * Variant ID handling:
 * - Negative IDs are client-only (unsaved). They are omitted from the payload.
 *   The backend creates new records for variants without an id.
 *
 * Default variant fallback:
 * - If no variants exist in the wizard state, a single default variant
 *   is created with price 0 and quantity 0.
 *   This satisfies the backend requirement of at least one variant.
 */
export function buildCreatePayload(
  state: CreateProductWizardState
): ProductCreatePayload {
  const { content, structure } = state;

  // ── Translations ───────────────────────────────────────────────
  const translations = Object.values(content.translations)
    .filter((t) => t.name.trim() !== '' && t.slug.trim() !== '')
    .map((t) => ({
      locale:          t.locale,
      name:            t.name.trim(),
      slug:            t.slug.trim(),
      description:     t.description ?? null,
      seo_title:       t.seo_title ?? null,
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
    // Convert options[] → semantic map { "Color": "Red" }
    const optionsMap: Record<string, string> = {};
    for (const opt of v.options ?? []) {
      const name  = opt.option_name?.trim();
      const value = opt.option_value?.trim();
      if (name && value) {
        optionsMap[name] = value;
      }
    }

    return {
      // Omit negative (client-only) IDs — backend creates new records
      ...(typeof v.id === 'number' && v.id > 0 ? { id: v.id } : {}),
      sku:              v.sku ?? null,
      price:            v.price,
      quantity:         v.quantity,
      is_active:        v.is_active,
      manufacture_date: v.manufacture_date ?? null,
      expiry_date:      v.expiry_date ?? null,
      batch_number:     v.batch_number ?? null,
      options:          optionsMap,
    };
  });

  // ── Default variant fallback ───────────────────────────────────
  if (variants.length === 0) {
    variants = [
      {
        sku:              null,
        price:            0,
        quantity:         0,
        is_active:        true,
        manufacture_date: null,
        expiry_date:      null,
        batch_number:     null,
        options:          {},
      },
    ];
  }

  return {
    status:       content.status,
    translations,
    options,
    variants,
  };
}
EOF

echo "   ✓ buildCreatePayload.ts written"

# =============================================================================
# PHASE 4 — WIZARD COMPONENTS
# =============================================================================

echo ""
echo "→ Phase 4: Writing wizard components..."

mkdir -p "$SRC/components/shared/create-product"

# -----------------------------------------------------------------------------
# 4a — CreateProductContentStep
# Reuses StatusSelect + ProductContentTab from the edit editor
# -----------------------------------------------------------------------------
cat > "$SRC/components/shared/create-product/CreateProductContentStep.tsx" << 'EOF'
'use client';

/**
 * Wizard Step 1 — Content
 *
 * Collects:
 * - Product status (active / draft)
 * - Locale-keyed translations (name, slug, description, SEO fields)
 *
 * Reuses the existing StatusSelect and ProductContentTab components
 * that are used in the edit editor, ensuring UX consistency.
 */

import { Card, CardContent } from '@/components/ui/card';
import { StatusSelect } from '@/app/[locale]/(admin)/stores/[storeId]/products/[productId]/_components/_components/StatusSelect';
import { ProductContentTab } from '@/app/[locale]/(admin)/stores/[storeId]/products/[productId]/_components/ProductContentTab';
import type { Locale, ProductStatus, ProductTranslation } from '@/types/product';
import type { CreateProductContentData } from '@/schemas/products';

interface Props {
  availableLocales: Locale[];
  content: CreateProductContentData;
  onChange: (next: CreateProductContentData) => void;
}

export function CreateProductContentStep({
  availableLocales,
  content,
  onChange,
}: Props) {
  return (
    <div className="space-y-6">
      {/* Status */}
      <Card>
        <CardContent className="pt-6">
          <StatusSelect
            value={content.status}
            onChange={(status: ProductStatus) =>
              onChange({ ...content, status })
            }
          />
        </CardContent>
      </Card>

      {/* Translations */}
      <ProductContentTab
        availableLocales={availableLocales}
        translations={content.translations as Record<Locale, ProductTranslation>}
        onChange={(translations) =>
          onChange({
            ...content,
            translations: translations as CreateProductContentData['translations'],
          })
        }
      />
    </div>
  );
}
EOF

# -----------------------------------------------------------------------------
# 4b — CreateProductStructureStep
# Reuses ProductOptionsSection + VariantsTable from the edit editor
# -----------------------------------------------------------------------------
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
  onChange: (next: CreateProductStructureData) => void;
}

export function CreateProductStructureStep({ structure, onChange }: Props) {
  const t = useTranslations('products');

  const handleOptionsChange = (options: ProductOption[]) => {
    onChange({ ...structure, options });
  };

  const handleVariantsChange = (variants: ProductVariant[]) => {
    onChange({ ...structure, variants });
  };

  const handleGenerate = () => {
    const regenerated = generateVariants(
      structure.options,
      structure.variants
    );
    onChange({ ...structure, variants: regenerated });
  };

  return (
    <div className="space-y-6">
      {/* Options */}
      <Card>
        <CardHeader>
          <CardTitle>{t('editor.tabs.options')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <ProductOptionsSection
            options={structure.options}
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

      {/* Variants */}
      {structure.variants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('variantEditor.tabs.variants')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <VariantsTable
              variants={structure.variants}
              onChange={handleVariantsChange}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
EOF

# -----------------------------------------------------------------------------
# 4c — CreateProductReviewStep
# Summary before final submission
# -----------------------------------------------------------------------------
cat > "$SRC/components/shared/create-product/CreateProductReviewStep.tsx" << 'EOF'
'use client';

/**
 * Wizard Step 3 — Review & Create
 *
 * Displays a summary of what will be sent to the backend:
 * - Status
 * - Number of translations (with locale codes)
 * - Number of options defined
 * - Number of variants to be created
 *
 * The create button is in the wizard shell (CreateProductWizard),
 * not here. This step is purely informational.
 */

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { CreateProductWizardState } from '@/schemas/products';

interface Props {
  state: CreateProductWizardState;
}

export function CreateProductReviewStep({ state }: Props) {
  const t = useTranslations('products');

  const { content, structure } = state;

  const translationEntries = Object.values(content.translations).filter(
    (tr) => tr.name.trim() !== '' || tr.slug.trim() !== ''
  );

  const optionCount  = structure.options.length;
  const variantCount = structure.variants.length;

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

          {/* Status */}
          <div className="flex items-center justify-between border-b pb-3">
            <span className="text-sm font-medium">
              {t('create.review.status')}
            </span>
            <Badge variant={content.status === 'active' ? 'default' : 'outline'}>
              {content.status}
            </Badge>
          </div>

          {/* Translations */}
          <div className="flex items-center justify-between border-b pb-3">
            <span className="text-sm font-medium">
              {t('create.steps.content')}
            </span>
            {translationEntries.length > 0 ? (
              <div className="flex flex-wrap gap-1 justify-end">
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
              {t('create.steps.structure')}
            </span>
            <div className="flex flex-col items-end gap-1">
              {optionCount > 0 ? (
                <span className="text-sm text-muted-foreground">
                  {t('create.review.optionsCount', { count: optionCount })}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">
                  {t('create.review.noOptions')}
                </span>
              )}
              {variantCount > 0 ? (
                <span className="text-sm text-muted-foreground">
                  {t('create.review.variantsCount', { count: variantCount })}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">
                  {t('create.review.noVariants')}
                </span>
              )}
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
EOF

# -----------------------------------------------------------------------------
# 4d — CreateProductWizard (shell — step state + navigation + submit)
# -----------------------------------------------------------------------------
cat > "$SRC/components/shared/create-product/CreateProductWizard.tsx" << 'EOF'
'use client';

/**
 * CreateProductWizard
 *
 * Three-step wizard for creating a product:
 *   Step 1: Content  (status + translations)
 *   Step 2: Structure (options + variants)
 *   Step 3: Review   (summary + submit)
 *
 * Design decisions:
 * - State lives entirely in this component (no external store).
 * - Each step validates before advancing.
 * - The submit button only appears on Step 3.
 * - Reuses existing editor step components for UX consistency.
 * - Available locales are derived from the store's supported locales
 *   passed in as a prop (defaults to ['en'] if not provided).
 */

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/lib/navigation';

import { CreateProductContentStep }   from './CreateProductContentStep';
import { CreateProductStructureStep } from './CreateProductStructureStep';
import { CreateProductReviewStep }    from './CreateProductReviewStep';

import { buildCreatePayload } from '@/lib/products/buildCreatePayload';
import { useCreateProduct }   from '@/hooks/products/useCreateProduct';

import type { Locale, ProductTranslation } from '@/types/product';
import type {
  CreateProductContentData,
  CreateProductStructureData,
  CreateProductWizardState,
} from '@/schemas/products';
import { ROUTES } from '@/config/routes';

// ── Step definitions ────────────────────────────────────────────────────────

type WizardStep = 'content' | 'structure' | 'review';

const STEPS: WizardStep[] = ['content', 'structure', 'review'];

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
    translations: buildDefaultTranslations(locales),
  };
}

function buildDefaultStructure(): CreateProductStructureData {
  return {
    options:  [],
    variants: [],
  };
}

// ── Step validation ─────────────────────────────────────────────────────────

function validateContent(
  content: CreateProductContentData,
  t: (key: string) => string
): string | null {
  const translations = Object.values(content.translations);
  const hasValidTranslation = translations.some(
    (tr) => tr.name.trim() !== '' && tr.slug.trim() !== ''
  );

  if (!hasValidTranslation) {
    return t('form.validation.translationMissingRequired');
  }

  return null;
}

function validateStructure(
  structure: CreateProductStructureData,
  t: (key: string) => string
): string | null {
  for (const variant of structure.variants) {
    if (variant.price < 0) {
      return t('form.validation.variantPriceInvalid');
    }
    if (variant.quantity < 0) {
      return t('form.validation.variantQuantityInvalid');
    }
  }
  return null;
}

// ── Props ───────────────────────────────────────────────────────────────────

interface Props {
  storeId: string;
  availableLocales?: Locale[];
  onSuccess: (productId: number) => void;
}

// ── Component ───────────────────────────────────────────────────────────────

export function CreateProductWizard({
  storeId,
  availableLocales = ['en'],
  onSuccess,
}: Props) {
  const t = useTranslations('products');

  const [step, setStep]         = useState<WizardStep>('content');
  const [content, setContent]   = useState<CreateProductContentData>(
    () => buildDefaultContent(availableLocales)
  );
  const [structure, setStructure] = useState<CreateProductStructureData>(
    buildDefaultStructure
  );

  const stepIndex    = STEPS.indexOf(step);
  const isFirstStep  = stepIndex === 0;
  const isLastStep   = stepIndex === STEPS.length - 1;

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
      const error = validateContent(content, t);
      if (error) {
        toast.error(error);
        return;
      }
    }

    if (step === 'structure') {
      const error = validateStructure(structure, t);
      if (error) {
        toast.error(error);
        return;
      }
    }

    const next = STEPS[stepIndex + 1];
    if (next) setStep(next);
  };

  const handleBack = () => {
    const prev = STEPS[stepIndex - 1];
    if (prev) setStep(prev);
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = () => {
    const state: CreateProductWizardState = { content, structure };
    const payload = buildCreatePayload(state);
    mutation.mutate(payload);
  };

  // ── Step indicator ────────────────────────────────────────────────────────

  const stepLabels: Record<WizardStep, string> = {
    content:   t('create.steps.content'),
    structure: t('create.steps.structure'),
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
      <div className="flex items-center gap-2">
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
                s === step
                  ? 'font-medium text-foreground'
                  : 'text-muted-foreground',
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
          availableLocales={availableLocales}
          content={content}
          onChange={setContent}
        />
      )}

      {step === 'structure' && (
        <CreateProductStructureStep
          structure={structure}
          onChange={setStructure}
        />
      )}

      {step === 'review' && (
        <CreateProductReviewStep
          state={{ content, structure }}
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
EOF

echo "   ✓ Wizard components written (4 files)"

# =============================================================================
# PHASE 5 — CreateProductForm (new — thin wrapper around wizard)
# =============================================================================

echo ""
echo "→ Phase 5: Writing new CreateProductForm..."

mkdir -p "$SRC/app/[locale]/(admin)/stores/[storeId]/products/new/_components"

cat > "$SRC/app/[locale]/(admin)/stores/[storeId]/products/new/_components/CreateProductForm.tsx" << 'EOF'
'use client';
// Reason: wizard with client state + mutations

/**
 * Create product page entry point.
 *
 * Thin wrapper — wires CreateProductWizard to:
 * - storeId from page props
 * - available locales (defaults to ['en', 'ar'] matching the app config)
 * - onSuccess redirect to the edit page
 */

import { useRouter } from '@/lib/navigation';
import { ROUTES } from '@/config/routes';
import { CreateProductWizard } from '@/components/shared/create-product/CreateProductWizard';

interface Props {
  storeId: string;
}

// Locales supported by the admin editor.
// Must match config('content.editable_locales') on the backend.
const EDITOR_LOCALES = ['en', 'ar'];

export default function CreateProductForm({ storeId }: Props) {
  const router = useRouter();

  return (
    <CreateProductWizard
      storeId={storeId}
      availableLocales={EDITOR_LOCALES}
      onSuccess={(productId) => {
        router.push(ROUTES.store(storeId).products.edit(String(productId)));
      }}
    />
  );
}
EOF

echo "   ✓ CreateProductForm.tsx (new wizard wrapper) written"

# =============================================================================
# PHASE 6 — REMOVE OLD FLAT FORM FILES
# =============================================================================

echo ""
echo "→ Phase 6: Removing old flat form files..."

# Old shared ProductForm
rm -f "$SRC/components/shared/ProductForm.tsx"

# Old sub-components
rm -f "$SRC/components/shared/product-form/ProductFormBasic.tsx"
rm -f "$SRC/components/shared/product-form/ProductFormPricing.tsx"
rm -f "$SRC/components/shared/product-form/ProductFormInventory.tsx"
rm -f "$SRC/components/shared/product-form/ProductFormShipping.tsx"

# Remove empty directory if it exists
rmdir "$SRC/components/shared/product-form" 2>/dev/null || true

echo "   ✓ Old flat form files removed (5 files)"

# =============================================================================
# PHASE 7 — CLEAN LEGACY TYPES FROM product.ts
# =============================================================================

echo ""
echo "→ Phase 7: Cleaning legacy types from types/product.ts..."

# Remove VariantFormItem, ProductVariantInput, ProductEditorState (old duplicate),
# ProductFormState, ProductAttribute, ProductAttributeValue from the types file.
# These were already marked @deprecated in the migration script.
# We rewrite the legacy section to be empty.

python3 - << 'PYEOF'
import re, os

src = os.environ.get('SRC', 'src')
path = os.path.join(src, 'types', 'product.ts')

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the legacy cleanup section with a clean tombstone comment.
# The section starts with "// ── Legacy Cleanup Targets" and runs to end of file.
marker = '// ── Legacy Cleanup Targets ──'
idx = content.find(marker)
if idx != -1:
    content = content[:idx].rstrip() + '\n'

# Append clean end-of-file note
content += '''
// ── Removed legacy types ───────────────────────────────────────────────────
// The following types were removed as part of the create-flow migration:
//   - ProductVariantAttribute  (replaced by ProductVariantOption)
//   - VariantFormItem          (replaced by ProductVariant)
//   - ProductVariantInput      (replaced by ProductVariant)
//   - ProductEditorState       (old duplicate — use types/product-editor.ts)
//   - ProductFormState         (old flat form state)
//   - ProductAttribute         (old global attribute system)
//   - ProductAttributeValue    (old global attribute system)
'''

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('  ✓ types/product.ts legacy section cleaned')
PYEOF

echo "   ✓ Legacy types cleaned"

# =============================================================================
# PHASE 8 — WIZARD TEST
# =============================================================================

echo ""
echo "→ Phase 8: Writing wizard tests..."

mkdir -p "$SRC/lib/products/__tests__"

cat > "$SRC/lib/products/__tests__/buildCreatePayload.test.ts" << 'EOF'
import { buildCreatePayload } from '../buildCreatePayload';
import type { CreateProductWizardState } from '@/schemas/products';

function makeState(
  overrides: Partial<CreateProductWizardState> = {}
): CreateProductWizardState {
  return {
    content: {
      status: 'draft',
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
        {
          id:       -1,
          sku:      'RED-DEFAULT',
          price:    29.99,
          quantity: 5,
          is_active: true,
          options: [{ option_name: 'Color', option_value: 'Red' }],
        },
        {
          id:       -2,
          sku:      null,
          price:    29.99,
          quantity: 0,
          is_active: true,
          options: [{ option_name: 'Color', option_value: 'Blue' }],
        },
      ],
    },
    ...overrides,
  };
}

describe('buildCreatePayload', () => {
  it('maps status from content', () => {
    const payload = buildCreatePayload(makeState());
    expect(payload.status).toBe('draft');
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
    state.structure.variants[0] = {
      ...state.structure.variants[0],
      id: 999,
    };
    const payload = buildCreatePayload(state);
    expect(payload.variants[0]).toHaveProperty('id', 999);
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
    // Only 'en' passes — 'ar' is empty
    expect(payload.translations).toHaveLength(1);
    expect(payload.translations[0].locale).toBe('en');
  });

  it('filters options with empty name or no values', () => {
    const state = makeState();
    state.structure.options.push({
      id:       null,
      name:     '',
      position: 2,
      values:   [{ id: null, value: 'X' }],
    });
    state.structure.options.push({
      id:       null,
      name:     'Material',
      position: 3,
      values:   [],
    });
    const payload = buildCreatePayload(state);
    expect(payload.options).toHaveLength(1);
    expect(payload.options?.[0].name).toBe('Color');
  });

  it('filters empty option_name/option_value from variant map', () => {
    const state = makeState();
    state.structure.variants[0].options = [
      { option_name: 'Color', option_value: 'Red' },
      { option_name: '',      option_value: 'X'   },
      { option_name: 'Size',  option_value: ''    },
    ];
    const payload = buildCreatePayload(state);
    expect(payload.variants[0].options).toEqual({ Color: 'Red' });
  });
});
EOF

echo "   ✓ buildCreatePayload.test.ts written"

# =============================================================================
# DONE
# =============================================================================

echo ""
echo "============================================="
echo " ✅ Create Product Wizard migration complete"
echo "============================================="
echo ""
echo " Files written / updated:"
echo ""
echo " Locale files (2 updated):"
echo "   src/locales/en/common.json   (products.create.* keys added)"
echo "   src/locales/ar/common.json   (products.create.* keys added)"
echo ""
echo " Schemas (1 updated):"
echo "   src/schemas/products.ts      (wizard step schemas added)"
echo ""
echo " Payload builder (1 new):"
echo "   src/lib/products/buildCreatePayload.ts"
echo ""
echo " Wizard components (4 new):"
echo "   src/components/shared/create-product/CreateProductContentStep.tsx"
echo "   src/components/shared/create-product/CreateProductStructureStep.tsx"
echo "   src/components/shared/create-product/CreateProductReviewStep.tsx"
echo "   src/components/shared/create-product/CreateProductWizard.tsx"
echo ""
echo " Page component (1 updated):"
echo "   src/app/.../products/new/_components/CreateProductForm.tsx"
echo ""
echo " Tests (1 new):"
echo "   src/lib/products/__tests__/buildCreatePayload.test.ts"
echo ""
echo " Files removed (5):"
echo "   src/components/shared/ProductForm.tsx"
echo "   src/components/shared/product-form/ProductFormBasic.tsx"
echo "   src/components/shared/product-form/ProductFormPricing.tsx"
echo "   src/components/shared/product-form/ProductFormInventory.tsx"
echo "   src/components/shared/product-form/ProductFormShipping.tsx"
echo ""
echo " Types cleaned:"
echo "   src/types/product.ts  (legacy section removed)"
echo ""
echo "============================================="
echo " Next steps:"
echo "============================================="
echo ""
echo " 1. Check TypeScript:"
echo "    npx tsc --noEmit"
echo ""
echo " 2. Verify in browser:"
echo "    - Navigate to /stores/{id}/products/new"
echo "    - Step 1: fill name + slug in at least one locale"
echo "    - Step 2: add options, generate combinations, edit variants"
echo "    - Step 3: review summary, click Create"
echo "    - Should redirect to edit page on success"
echo ""