'use client';

/**
 * CreateProductWizard
 *
 * Three-step wizard for creating a product:
 *   Step 1: Content  (status + category + brand + isFeatured + translations)
 *   Step 2: Structure (options + variants)
 *   Step 3: Review   (summary + submit)
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
    categoryId:   null,
    brandId:      null,
    isFeatured:   false,
    translations: buildDefaultTranslations(locales),
  };
}

function buildDefaultStructure(): CreateProductStructureData {
  return { options: [], variants: [] };
}

// ── Step validation ─────────────────────────────────────────────────────────

function validateContent(
  content: CreateProductContentData,
  t: (key: string) => string
): string | null {
  const translations = Object.values(content.translations);
  const hasValid = translations.some(
    (tr) => tr.name.trim() !== '' && tr.slug.trim() !== ''
  );
  if (!hasValid) {
    return t('form.validation.translationMissingRequired');
  }
  return null;
}

function validateStructure(
  structure: CreateProductStructureData,
  t: (key: string) => string
): string | null {
  for (const variant of structure.variants) {
    if (variant.price < 0) return t('form.validation.variantPriceInvalid');
    if (variant.quantity < 0) return t('form.validation.variantQuantityInvalid');
  }
  return null;
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
      const error = validateContent(content, t);
      if (error) { toast.error(error); return; }
    }
    if (step === 'structure') {
      const error = validateStructure(structure, t);
      if (error) { toast.error(error); return; }
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

  // ── Step labels ───────────────────────────────────────────────────────────

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
        <CreateProductReviewStep state={{ content, structure }} />
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
