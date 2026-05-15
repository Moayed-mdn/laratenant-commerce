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
