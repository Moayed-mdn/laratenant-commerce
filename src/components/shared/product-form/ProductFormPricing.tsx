'use client';

/**
 * Product form pricing section.
 */

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Control, FieldErrors } from 'react-hook-form';
import type { ProductFormData } from '@/schemas/products';
import { Controller } from 'react-hook-form';

interface Props {
  control: Control<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
}

export function ProductFormPricing({ control, errors }: Props) {
  const t = useTranslations('products');

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{t('form.sections.pricing')}</h3>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="price">{t('form.fields.price')}</Label>
          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                {...field}
              />
            )}
          />
          {errors.price && (
            <p className="text-sm text-destructive">{errors.price.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="compare_at_price">{t('form.fields.compareAtPrice')}</Label>
          <Controller
            name="compare_at_price"
            control={control}
            render={({ field }) => (
              <Input
                id="compare_at_price"
                type="number"
                min="0"
                step="0.01"
                {...field}
                value={field.value ?? ''}
                onChange={(e) => {
                  const value = e.target.value;
                  field.onChange(value === '' ? null : parseFloat(value));
                }}
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cost_per_item">{t('form.fields.costPerItem')}</Label>
          <Controller
            name="cost_per_item"
            control={control}
            render={({ field }) => (
              <Input
                id="cost_per_item"
                type="number"
                min="0"
                step="0.01"
                {...field}
                value={field.value ?? ''}
                onChange={(e) => {
                  const value = e.target.value;
                  field.onChange(value === '' ? null : parseFloat(value));
                }}
              />
            )}
          />
        </div>
      </div>
    </div>
  );
}
