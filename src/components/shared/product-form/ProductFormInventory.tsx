'use client';

/**
 * Product form inventory section.
 */

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { Control, FieldErrors } from 'react-hook-form';
import type { ProductFormData } from '@/schemas/products';
import { Controller } from 'react-hook-form';

interface Props {
  control: Control<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
}

export function ProductFormInventory({ control, errors }: Props) {
  const t = useTranslations('products');

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{t('form.sections.inventory')}</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="sku">{t('form.fields.sku')}</Label>
          <Controller
            name="sku"
            control={control}
            render={({ field }) => (
              <Input
                id="sku"
                placeholder={t('form.fields.skuPlaceholder')}
                {...field}
                value={field.value ?? ''}
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="barcode">{t('form.fields.barcode')}</Label>
          <Controller
            name="barcode"
            control={control}
            render={({ field }) => (
              <Input
                id="barcode"
                {...field}
                value={field.value ?? ''}
              />
            )}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="quantity">{t('form.fields.quantity')}</Label>
          <Controller
            name="quantity"
            control={control}
            render={({ field }) => (
              <Input
                id="quantity"
                type="number"
                min="0"
                {...field}
                value={field.value ?? ''}
                onChange={(e) => {
                  const value = e.target.value;
                  field.onChange(value === '' ? null : parseInt(value, 10));
                }}
              />
            )}
          />
          {errors.quantity && (
            <p className="text-sm text-destructive">{errors.quantity.message}</p>
          )}
        </div>

        <div className="flex items-center gap-2 pt-8">
          <Controller
            name="track_quantity"
            control={control}
            render={({ field }) => (
              <Switch
                id="track_quantity"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Label htmlFor="track_quantity">{t('form.fields.trackQuantity')}</Label>
        </div>
      </div>
    </div>
  );
}
