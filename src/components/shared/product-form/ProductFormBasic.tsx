'use client';

/**
 * Product form basic info section.
 */

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Control, FieldErrors } from 'react-hook-form';
import type { ProductFormData } from '@/schemas/products';
import { Controller } from 'react-hook-form';

interface Props {
  control: Control<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
}

export function ProductFormBasic({ control, errors }: Props) {
  const t = useTranslations('products');

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{t('form.sections.basic')}</h3>

      <div className="space-y-2">
        <Label htmlFor="name">{t('form.fields.name')}</Label>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input
              id="name"
              placeholder={t('form.fields.namePlaceholder')}
              {...field}
              value={field.value ?? ''}
            />
          )}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t('form.fields.description')}</Label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Textarea
              id="description"
              placeholder={t('form.fields.descriptionPlaceholder')}
              {...field}
              value={field.value ?? ''}
            />
          )}
        />
      </div>
    </div>
  );
}
