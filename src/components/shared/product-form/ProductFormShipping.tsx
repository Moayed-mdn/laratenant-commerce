'use client';

/**
 * Product form shipping section.
 */

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Control } from 'react-hook-form';
import type { ProductFormData } from '@/schemas/products';
import type { WeightUnit } from '@/types/product';
import { Controller } from 'react-hook-form';
import { makeLabelByValue, renderSelectValue, type SelectOption } from '@/lib/selectOptions';

interface Props {
  control: Control<ProductFormData>;
}

const weightUnits: WeightUnit[] = ['kg', 'g', 'lb', 'oz'];

export function ProductFormShipping({ control }: Props) {
  const t = useTranslations('products');

  const weightUnitOptions = weightUnits.map((unit) => ({
    value: unit,
    label: t(`form.weightUnits.${unit}`),
  })) as readonly SelectOption<WeightUnit>[];

  const weightUnitLabelByValue = makeLabelByValue(weightUnitOptions);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{t('form.sections.shipping')}</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="weight">{t('form.fields.weight')}</Label>
          <Controller
            name="weight"
            control={control}
            render={({ field }) => (
              <Input
                id="weight"
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
          <Label htmlFor="weight_unit">{t('form.fields.weightUnit')}</Label>
          <Controller
            name="weight_unit"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value ?? null}
                onValueChange={(value: string | null) =>
                  field.onChange(value === '' || !value ? null : (value as WeightUnit))
                }
              >
                <SelectTrigger id="weight_unit">
                  <SelectValue>
                    {renderSelectValue(weightUnitLabelByValue, '-')}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {weightUnitOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>
    </div>
  );
}
