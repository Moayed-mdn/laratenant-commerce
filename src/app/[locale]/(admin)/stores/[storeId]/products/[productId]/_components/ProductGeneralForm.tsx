'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ProductEditorState, ProductStatus } from '@/types/product';

interface Props {
  value: ProductEditorState['product'];
  onChange: (value: ProductEditorState['product']) => void;
}

export function ProductGeneralForm({ value, onChange }: Props) {
  const t = useTranslations('products');
  const dashboardT = useTranslations('dashboard');

  const set = <K extends keyof ProductEditorState['product']>(
    key: K,
    next: ProductEditorState['product'][K]
  ) => onChange({ ...value, [key]: next });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t('form.fields.name')}</Label>
        <Input value={value.name} onChange={(e) => set('name', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>{t('form.fields.description')}</Label>
        <Textarea value={value.description} onChange={(e) => set('description', e.target.value)} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{t('form.fields.status')}</Label>
          <Select value={value.status} onValueChange={(v) => set('status', v as ProductStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">{dashboardT('productStatus.active')}</SelectItem>
              <SelectItem value="draft">{dashboardT('productStatus.draft')}</SelectItem>
              <SelectItem value="inactive">{dashboardT('productStatus.inactive')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t('variantEditor.general.featured')}</Label>
          <Select
            value={value.featured ? 'yes' : 'no'}
            onValueChange={(v) => set('featured', v === 'yes')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">{t('variantEditor.shared.yes')}</SelectItem>
              <SelectItem value="no">{t('variantEditor.shared.no')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
