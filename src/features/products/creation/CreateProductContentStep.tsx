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

import { StatusSelect } from '@/features/products/editor/components/StatusSelect';
import { ProductContentTab } from '@/features/products/editor/components/ProductContentTab';
import { CategorySelect } from './CategorySelect';
import { BrandSelect }    from './BrandSelect';
import { TagSelect }      from './TagSelect';

import type { Locale, ProductStatus, ProductTranslation } from '@/types/product';
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
            onChange={({ id, name }) =>
              onChange({ ...content, categoryId: id, categoryName: name })
            }
          />

          {/* Brand — captures resolved name alongside ID */}
          <BrandSelect
            storeId={storeId}
            value={content.brandId}
            onChange={({ id, name }) =>
              onChange({ ...content, brandId: id, brandName: name })
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
        onChange={(translations: Record<string, ProductTranslation>) => onChange({ ...content, translations })}
      />

    </div>
  );
}