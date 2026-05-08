'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ProductAttribute } from '@/types/product';

interface Props {
  attributes: ProductAttribute[];
  onChange: (attributes: ProductAttribute[]) => void;
}

export function ProductAttributesManager({ attributes, onChange }: Props) {
  const t = useTranslations('products');

  return (
    <div className="space-y-3">
      {attributes.map((attribute, attrIdx) => (
        <div key={`${attribute.name}-${attrIdx}`} className="rounded-md border p-3 space-y-2">
          <Input
            placeholder={t('variantEditor.attributes.attributeName')}
            value={attribute.name}
            onChange={(e) =>
              onChange(
                attributes.map((x, i) => (i === attrIdx ? { ...x, name: e.target.value } : x))
              )
            }
          />
          <div className="flex flex-wrap gap-2">
            {attribute.values.map((value, valueIdx) => (
              <Input
                key={`${value.value}-${valueIdx}`}
                className="w-40"
                placeholder={t('variantEditor.attributes.value')}
                value={value.value}
                onChange={(e) =>
                  onChange(
                    attributes.map((x, i) =>
                      i === attrIdx
                        ? {
                            ...x,
                            values: x.values.map((v, vi) =>
                              vi === valueIdx ? { value: e.target.value } : v
                            ),
                          }
                        : x
                    )
                  )
                }
              />
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                onChange(
                  attributes.map((x, i) =>
                    i === attrIdx ? { ...x, values: [...x.values, { value: '' }] } : x
                  )
                )
              }
            >
              {t('variantEditor.attributes.addValue')}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onChange(attributes.filter((_, i) => i !== attrIdx))}
            >
              {t('delete')}
            </Button>
          </div>
        </div>
      ))}
      <Button
        variant="outline"
        onClick={() => onChange([...attributes, { name: '', values: [{ value: '' }] }])}
      >
        {t('variantEditor.attributes.addAttribute')}
      </Button>
    </div>
  );
}
