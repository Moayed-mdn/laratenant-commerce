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

import type { Locale, ProductStatus, ProductTranslation } from '@/types/product';
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
