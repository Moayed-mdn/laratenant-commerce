'use client';

/**
 * Wizard Step 3 — Review & Create
 *
 * Displays a summary of what will be sent to the backend:
 * - Status and isFeatured flag
 * - Category and Brand IDs (if selected)
 * - Number of translations (with locale + name)
 * - Number of options and variants
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

          {/* Category */}
          <div className="flex items-center justify-between border-b pb-3">
            <span className="text-sm font-medium">
              {t('form.fields.category')}
            </span>
            <span className="text-sm text-muted-foreground">
              {content.categoryId !== null
                ? `#${content.categoryId}`
                : t('form.fields.noCategoryOption')}
            </span>
          </div>

          {/* Brand */}
          <div className="flex items-center justify-between border-b pb-3">
            <span className="text-sm font-medium">
              {t('form.fields.brand')}
            </span>
            <span className="text-sm text-muted-foreground">
              {content.brandId !== null
                ? `#${content.brandId}`
                : t('form.fields.noBrandOption')}
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

          {/* Structure */}
          <div className="flex items-center justify-between">
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
