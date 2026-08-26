'use client';

/**
 * Pricing section content editor.
 * Reads: content.plans[] { name, price, description, currency, period, features[], cta_label, cta_url, featured, badge }
 */

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RepeaterField } from '../RepeaterField';
import { LocalizedTextField } from '../LocalizedTextField';
import { ColorSchemeSelector } from './ColorSchemeSelector';
import type { MarketingPageFormValues } from '@/schemas/marketing-pages';

interface PricingSectionContentProps {
  index: number;
}

type PricingPlan = {
  name: { en: string; ar: string };
  price: string | number;
  description: { en: string; ar: string };
  currency?: string;
  period: { en: string; ar: string };
  features: string[];
  cta_label: { en: string; ar: string };
  cta_url?: string;
  featured?: boolean;
  badge: { en: string; ar: string };
};

export function PricingSectionContent({ index }: PricingSectionContentProps) {
  const t = useTranslations('cmsPages');
  const { watch, setValue, register } = useFormContext<MarketingPageFormValues>();

  const basePath = `sections.${index}.content`;
  const plans = (watch(`${basePath}.plans` as any) ?? []) as PricingPlan[];

  const handleAdd = () => {
    setValue(`${basePath}.plans` as any, [
      ...plans,
      {
        name: { en: '', ar: '' },
        price: '',
        description: { en: '', ar: '' },
        currency: 'USD',
        period: { en: '', ar: '' },
        features: [],
        cta_label: { en: '', ar: '' },
        cta_url: '',
        featured: false,
        badge: { en: '', ar: '' },
      },
    ], { shouldDirty: true });
  };

  const handleRemove = (planIndex: number) => {
    setValue(`${basePath}.plans` as any, plans.filter((_, i) => i !== planIndex), { shouldDirty: true });
  };

  const handleMove = (fromIndex: number, toIndex: number) => {
    const updated = [...plans];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setValue(`${basePath}.plans` as any, updated, { shouldDirty: true });
  };

  return (
    <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
      <h4 className="text-sm font-semibold">
        {t('sections.editors.pricing.heading')}
      </h4>

      {/* Color Scheme */}
      <ColorSchemeSelector
        fieldPath={`sections.${index}.settings.color_scheme`}
        description={t('sections.editors.common.colorSchemeDescription')}
      />

      <RepeaterField
        items={plans}
        onAdd={handleAdd}
        onRemove={handleRemove}
        onMoveUp={(i) => i > 0 && handleMove(i, i - 1)}
        onMoveDown={(i) => i < plans.length - 1 && handleMove(i, i + 1)}
        getItemLabel={(item: any, i) => item?.name?.en || `Plan ${i + 1}`}
        addLabel={t('sections.editors.pricing.addPlan')}
        emptyLabel={t('sections.editors.pricing.noPlans')}
        renderItem={(planIndex) => {
          const plan = plans[planIndex];
          const features = plan?.features ?? [];

          return (
            <div className="space-y-3">
              {/* Name (localized) */}
              <div className="space-y-2">
                <Label>{t('sections.editors.pricing.name')}</Label>
                <LocalizedTextField
                  name={`${basePath}.plans.${planIndex}.name`}
                  placeholder={{ en: 'Plan name', ar: 'اسم الخطة' }}
                />
              </div>

              {/* Price & Currency */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>{t('sections.editors.pricing.price')}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register(`${basePath}.plans.${planIndex}.price` as any, { valueAsNumber: true })}
                    placeholder="29.99"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('sections.editors.pricing.currency')}</Label>
                  <Input
                    {...register(`${basePath}.plans.${planIndex}.currency` as any)}
                    placeholder="USD"
                  />
                </div>
              </div>

              {/* Description (localized) */}
              <div className="space-y-2">
                <Label>{t('sections.editors.pricing.description')}</Label>
                <LocalizedTextField
                  name={`${basePath}.plans.${planIndex}.description`}
                  placeholder={{ en: 'Plan description', ar: 'وصف الخطة' }}
                  multiline
                  rows={2}
                />
              </div>

              {/* Period (localized) */}
              <div className="space-y-2">
                <Label>{t('sections.editors.pricing.period')}</Label>
                <LocalizedTextField
                  name={`${basePath}.plans.${planIndex}.period`}
                  placeholder={{ en: '/month', ar: '/شهر' }}
                />
              </div>

              {/* Features (nested repeater - plain strings) */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">{t('sections.editors.pricing.features')}</Label>
                <div className="space-y-2 rounded border p-2 bg-background/50">
                  {features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2">
                      <Input
                        {...register(`${basePath}.plans.${planIndex}.features.${featureIndex}` as any)}
                        placeholder={t('sections.editors.pricing.featurePlaceholder')}
                        className="flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = features.filter((_, i) => i !== featureIndex);
                          setValue(`${basePath}.plans.${planIndex}.features` as any, updated, { shouldDirty: true });
                        }}
                        className="p-2 rounded hover:bg-destructive/10 text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setValue(`${basePath}.plans.${planIndex}.features` as any, [...features, ''], { shouldDirty: true });
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {t('sections.editors.pricing.addFeature')}
                  </Button>
                </div>
              </div>

              {/* CTA Label & URL */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>{t('sections.editors.pricing.ctaLabel')}</Label>
                  <LocalizedTextField
                    name={`${basePath}.plans.${planIndex}.cta_label`}
                    placeholder={{ en: 'Get started', ar: 'ابدأ الآن' }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('sections.editors.pricing.ctaUrl')}</Label>
                  <Input
                    {...register(`${basePath}.plans.${planIndex}.cta_url` as any)}
                    placeholder="/checkout"
                  />
                </div>
              </div>

              {/* Badge (localized) */}
              <div className="space-y-2">
                <Label>{t('sections.editors.pricing.badge')}</Label>
                <LocalizedTextField
                  name={`${basePath}.plans.${planIndex}.badge`}
                  placeholder={{ en: 'Most popular', ar: 'الأكثر شيوعًا' }}
                />
              </div>

              {/* Featured toggle */}
              <div className="flex items-center justify-between rounded border p-2 bg-background">
                <Label htmlFor={`${basePath}.plans.${planIndex}.featured`} className="text-xs">
                  {t('sections.editors.pricing.featured')}
                </Label>
                <Switch
                  id={`${basePath}.plans.${planIndex}.featured`}
                  checked={plan?.featured ?? false}
                  onCheckedChange={(v) =>
                    setValue(`${basePath}.plans.${planIndex}.featured` as any, v, { shouldDirty: true })
                  }
                />
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}
