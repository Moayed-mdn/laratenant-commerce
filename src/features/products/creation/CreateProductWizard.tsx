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

import { buildCreatePayload }       from '@/features/products/editor/payloads/buildCreatePayload';
import { useCreateProduct }         from '@/hooks/products/useCreateProduct';
import { validateProductContent }   from '@/features/products/editor/validators/validateProductContent';
import { validateProductStructure } from '@/features/products/editor/validators/validateProductStructure';

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
  return { media: [] };
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
