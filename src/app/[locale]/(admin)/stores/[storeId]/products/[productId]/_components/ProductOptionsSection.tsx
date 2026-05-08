'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import type { ProductOption } from '@/types/product';

interface Props {
  options: ProductOption[];
  onChange: (options: ProductOption[]) => void;
}

export function ProductOptionsSection({ options, onChange }: Props) {
  const t = useTranslations('products');

  const updateOption = (index: number, patch: Partial<ProductOption>) => {
    onChange(options.map((opt, i) => (i === index ? { ...opt, ...patch } : opt)));
  };

  const addValue = (optionIndex: number) => {
    updateOption(optionIndex, {
      values: [...options[optionIndex].values, { label: '' }],
    });
  };

  const removeValue = (optionIndex: number, valueIndex: number) => {
    updateOption(optionIndex, {
      values: options[optionIndex].values.filter((_, vi) => vi !== valueIndex),
    });
  };

  const updateValue = (optionIndex: number, valueIndex: number, label: string) => {
    updateOption(optionIndex, {
      values: options[optionIndex].values.map((v, vi) =>
        vi === valueIndex ? { label } : v
      ),
    });
  };

  const addOption = () => {
    onChange([
      ...options,
      { id: Date.now(), code: '', name: '', values: [{ label: '' }] },
    ]);
  };

  const removeOption = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };

  if (options.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {t('variantEditor.options.noOptions')}
        </p>
        <Button type="button" variant="outline" onClick={addOption}>
          {t('variantEditor.options.addOption')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {options.map((option, optIdx) => (
        <section
          key={option.id ?? `option-${optIdx}`}
          className="space-y-4 rounded-lg border p-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1">
              <h3 className="text-sm font-medium leading-6 wrap-break-word">
                {option.name.trim() || t('variantEditor.options.optionName')}
              </h3>
              <p className="text-xs text-muted-foreground">
                {option.values.length > 0
                  ? t('variantEditor.options.valuesCount', { count: option.values.length })
                  : t('variantEditor.options.noValues')}
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={() => removeOption(optIdx)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <Input
            placeholder={t('variantEditor.options.optionName')}
            value={option.name}
            onChange={(e) => updateOption(optIdx, { name: e.target.value })}
          />

          <div className="flex flex-wrap gap-2">
            {option.values
              .filter((value) => value.label.trim().length > 0)
              .map((value, valueIdx) => (
                <span
                  key={value.id ?? `preview-${optIdx}-${valueIdx}`}
                  className="inline-flex max-w-full items-center rounded-full border bg-muted px-3 py-1 text-sm leading-6 wrap-break-word"
                >
                  {value.label}
                </span>
              ))}
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            {option.values.map((val, valIdx) => (
              <div
                key={val.id ?? `val-${optIdx}-${valIdx}`}
                className="flex min-w-0 items-center gap-2 rounded-lg border bg-background px-3 py-2"
              >
                <Input
                  className="h-auto min-w-0 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:border-transparent focus-visible:ring-0"
                  value={val.label}
                  onChange={(e) => updateValue(optIdx, valIdx, e.target.value)}
                  placeholder={t('variantEditor.options.addValue')}
                />
                <button
                  type="button"
                  onClick={() => removeValue(optIdx, valIdx)}
                  className="rounded-full p-1 transition-colors hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => addValue(optIdx)}
          >
            {t('variantEditor.options.addValue')}
          </Button>
        </section>
      ))}

      <Button type="button" variant="outline" onClick={addOption}>
        {t('variantEditor.options.addOption')}
      </Button>
    </div>
  );
}
