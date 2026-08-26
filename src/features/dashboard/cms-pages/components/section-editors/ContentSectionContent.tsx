'use client';

/**
 * Content section editor.
 * Reads: content.body, content.stats[], content.promises[], content.metrics[], content.disclosure
 */

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RepeaterField } from '../RepeaterField';
import { LocalizedTextField } from '../LocalizedTextField';
import { ColorSchemeSelector } from './ColorSchemeSelector';
import type { MarketingPageFormValues } from '@/schemas/marketing-pages';

interface ContentSectionContentProps {
  index: number;
}

export function ContentSectionContent({ index }: ContentSectionContentProps) {
  const t = useTranslations('cmsPages');
  const { watch, setValue, register } = useFormContext<MarketingPageFormValues>();

  const basePath = `sections.${index}.content`;
  const stats = (watch(`${basePath}.stats` as any) ?? []) as Array<{ value: string; label: string }>;
  const promises = (watch(`${basePath}.promises` as any) ?? []) as Array<{ title: { en: string; ar: string }; body: { en: string; ar: string } }>;
  const metrics = (watch(`${basePath}.metrics` as any) ?? []) as Array<{ label: { en: string; ar: string }; value: string; note?: { en: string; ar: string } }>;

  return (
    <div className="space-y-6 rounded-lg border p-4 bg-muted/30">
      <h4 className="text-sm font-semibold">
        {t('sections.editors.content.heading')}
      </h4>

      {/* Color Scheme */}
      <ColorSchemeSelector
        fieldPath={`sections.${index}.settings.color_scheme`}
        description={t('sections.editors.common.colorSchemeDescription')}
      />

      {/* Body (localized, main content) */}
      <div className="space-y-2">
        <Label>{t('sections.editors.content.body')}</Label>
        <LocalizedTextField
          name={`${basePath}.body`}
          placeholder={{ en: 'Main content', ar: 'المحتوى الرئيسي' }}
          multiline
          rows={6}
        />
      </div>

      {/* Stats repeater */}
      <div className="space-y-2">
        <Label>{t('sections.editors.content.stats')}</Label>
        <RepeaterField
          items={stats}
          onAdd={() =>
            setValue(`${basePath}.stats` as any, [...stats, { value: '', label: '' }], { shouldDirty: true })
          }
          onRemove={(i) =>
            setValue(`${basePath}.stats` as any, stats.filter((_, idx) => idx !== i), { shouldDirty: true })
          }
          onMoveUp={(i) => {
            if (i > 0) {
              const updated = [...stats];
              [updated[i - 1], updated[i]] = [updated[i], updated[i - 1]];
              setValue(`${basePath}.stats` as any, updated, { shouldDirty: true });
            }
          }}
          onMoveDown={(i) => {
            if (i < stats.length - 1) {
              const updated = [...stats];
              [updated[i], updated[i + 1]] = [updated[i + 1], updated[i]];
              setValue(`${basePath}.stats` as any, updated, { shouldDirty: true });
            }
          }}
          getItemLabel={(item: any, i) => item?.label || `Stat ${i + 1}`}
          addLabel={t('sections.editors.content.addStat')}
          emptyLabel={t('sections.editors.content.noStats')}
          renderItem={(i) => (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">{t('sections.editors.content.statValue')}</Label>
                <Input {...register(`${basePath}.stats.${i}.value` as any)} placeholder="100+" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('sections.editors.content.statLabel')}</Label>
                <Input {...register(`${basePath}.stats.${i}.label` as any)} placeholder={t('sections.editors.content.statLabelPlaceholder')} />
              </div>
            </div>
          )}
        />
      </div>

      {/* Promises repeater */}
      <div className="space-y-2">
        <Label>{t('sections.editors.content.promises')}</Label>
        <RepeaterField
          items={promises}
          onAdd={() =>
            setValue(`${basePath}.promises` as any, [...promises, { title: { en: '', ar: '' }, body: { en: '', ar: '' } }], { shouldDirty: true })
          }
          onRemove={(i) =>
            setValue(`${basePath}.promises` as any, promises.filter((_, idx) => idx !== i), { shouldDirty: true })
          }
          onMoveUp={(i) => {
            if (i > 0) {
              const updated = [...promises];
              [updated[i - 1], updated[i]] = [updated[i], updated[i - 1]];
              setValue(`${basePath}.promises` as any, updated, { shouldDirty: true });
            }
          }}
          onMoveDown={(i) => {
            if (i < promises.length - 1) {
              const updated = [...promises];
              [updated[i], updated[i + 1]] = [updated[i + 1], updated[i]];
              setValue(`${basePath}.promises` as any, updated, { shouldDirty: true });
            }
          }}
          getItemLabel={(item: any, i) => item?.title?.en || `Promise ${i + 1}`}
          addLabel={t('sections.editors.content.addPromise')}
          emptyLabel={t('sections.editors.content.noPromises')}
          renderItem={(i) => (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs">{t('sections.editors.content.promiseTitle')}</Label>
                <LocalizedTextField name={`${basePath}.promises.${i}.title`} placeholder={{ en: 'Promise title', ar: 'عنوان الوعد' }} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('sections.editors.content.promiseBody')}</Label>
                <LocalizedTextField name={`${basePath}.promises.${i}.body`} placeholder={{ en: 'Promise details', ar: 'تفاصيل الوعد' }} multiline rows={2} />
              </div>
            </div>
          )}
        />
      </div>

      {/* Metrics repeater */}
      <div className="space-y-2">
        <Label>{t('sections.editors.content.metrics')}</Label>
        <RepeaterField
          items={metrics}
          onAdd={() =>
            setValue(`${basePath}.metrics` as any, [...metrics, { label: { en: '', ar: '' }, value: '', note: { en: '', ar: '' } }], { shouldDirty: true })
          }
          onRemove={(i) =>
            setValue(`${basePath}.metrics` as any, metrics.filter((_, idx) => idx !== i), { shouldDirty: true })
          }
          onMoveUp={(i) => {
            if (i > 0) {
              const updated = [...metrics];
              [updated[i - 1], updated[i]] = [updated[i], updated[i - 1]];
              setValue(`${basePath}.metrics` as any, updated, { shouldDirty: true });
            }
          }}
          onMoveDown={(i) => {
            if (i < metrics.length - 1) {
              const updated = [...metrics];
              [updated[i], updated[i + 1]] = [updated[i + 1], updated[i]];
              setValue(`${basePath}.metrics` as any, updated, { shouldDirty: true });
            }
          }}
          getItemLabel={(item: any, i) => item?.label?.en || `Metric ${i + 1}`}
          addLabel={t('sections.editors.content.addMetric')}
          emptyLabel={t('sections.editors.content.noMetrics')}
          renderItem={(i) => (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs">{t('sections.editors.content.metricLabel')}</Label>
                <LocalizedTextField name={`${basePath}.metrics.${i}.label`} placeholder={{ en: 'Metric name', ar: 'اسم المقياس' }} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('sections.editors.content.metricValue')}</Label>
                <Input {...register(`${basePath}.metrics.${i}.value` as any)} placeholder="99.9%" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('sections.editors.content.metricNote')}</Label>
                <LocalizedTextField name={`${basePath}.metrics.${i}.note`} placeholder={{ en: 'Optional note', ar: 'ملاحظة اختيارية' }} />
              </div>
            </div>
          )}
        />
      </div>

      {/* Disclosure (localized) */}
      <div className="space-y-2">
        <Label>{t('sections.editors.content.disclosure')}</Label>
        <LocalizedTextField
          name={`${basePath}.disclosure`}
          placeholder={{ en: 'Legal disclosure or note', ar: 'إفصاح قانوني أو ملاحظة' }}
          multiline
          rows={2}
        />
      </div>
    </div>
  );
}
