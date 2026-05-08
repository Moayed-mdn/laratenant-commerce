'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Locale, ProductTranslation } from '@/types/product';

interface Props {
  locale: Locale;
  value: ProductTranslation;
  onChange: (next: ProductTranslation) => void;
}

export function TranslationForm({ locale, value, onChange }: Props) {
  const t = useTranslations('products');

  const set = <K extends keyof ProductTranslation>(key: K, next: ProductTranslation[K]) =>
    onChange({ ...value, [key]: next });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t('editor.translation.fields.name')}</Label>
        <Input value={value.name ?? ''} onChange={(e) => set('name', e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>{t('editor.translation.fields.slug')}</Label>
        <Input value={value.slug ?? ''} onChange={(e) => set('slug', e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>{t('editor.translation.fields.description')}</Label>
        <Textarea value={value.description ?? ''} onChange={(e) => set('description', e.target.value)} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{t('editor.translation.fields.seoTitle')}</Label>
          <Input value={value.seo_title ?? ''} onChange={(e) => set('seo_title', e.target.value || null)} />
        </div>
        <div className="space-y-2">
          <Label>{t('editor.translation.fields.seoDescription')}</Label>
          <Textarea
            value={value.seo_description ?? ''}
            onChange={(e) => set('seo_description', e.target.value || null)}
          />
        </div>
      </div>

      <input type="hidden" value={locale} />
    </div>
  );
}
