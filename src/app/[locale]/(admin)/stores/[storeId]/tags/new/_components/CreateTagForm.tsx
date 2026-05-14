'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useCreateTag } from '@/hooks/tags/useCreateTag';
import { TagFormSchema, type TagFormValues, type TagFormInput } from '@/schemas/tags';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Props { storeId: string }

const LOCALES = ['en', 'ar'] as const;

export default function CreateTagForm({ storeId }: Props) {
  const t      = useTranslations('tags');
  const create = useCreateTag(storeId);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TagFormInput, unknown, TagFormValues>({
    resolver:      zodResolver(TagFormSchema),
    defaultValues: {
      type:         '',
      color:        '',
      is_active:    true,
      translations: LOCALES.map((locale) => ({ locale, name: '', slug: '' })),
    },
  });

  const { fields } = useFieldArray({ control, name: 'translations' });
  const isActive   = watch('is_active');

  const onSubmit = async (values: TagFormValues) => {
    await create.mutateAsync({
      type:      values.type || null,
      color:     values.color || null,
      is_active: values.is_active,
      translations: values.translations
        .filter((tr) => tr.name.trim())
        .map((tr) => ({ ...tr, slug: tr.slug || null })),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('form.createTitle')}</h1>
          <p className="text-muted-foreground">{t('form.createSubtitle')}</p>
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t('form.creating') : t('form.create')}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Translations */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>{t('form.translations')}</CardTitle></CardHeader>
            <CardContent>
              <Tabs defaultValue="en">
                <TabsList>
                  {fields.map((field) => (
                    <TabsTrigger key={field.id} value={field.locale}>
                      {field.locale.toUpperCase()}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {fields.map((field, index) => (
                  <TabsContent key={field.id} value={field.locale} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor={`translations.${index}.name`}>{t('form.fields.name')}</Label>
                      <Input
                        id={`translations.${index}.name`}
                        {...register(`translations.${index}.name`)}
                        placeholder={t('form.fields.namePlaceholder')}
                      />
                      {errors.translations?.[index]?.name && (
                        <p className="text-sm text-destructive">
                          {errors.translations[index]?.name?.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`translations.${index}.slug`}>{t('form.fields.slug')}</Label>
                      <Input
                        id={`translations.${index}.slug`}
                        {...register(`translations.${index}.slug`)}
                        placeholder={t('form.fields.slugPlaceholder')}
                        className="font-mono"
                      />
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
              {errors.translations && !Array.isArray(errors.translations) && (
                <p className="text-sm text-destructive mt-2">
                  {errors.translations.message}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Settings */}
        <div>
          <Card>
            <CardHeader><CardTitle>{t('form.settings')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">{t('form.fields.type')}</Label>
                <Input
                  id="type"
                  {...register('type')}
                  placeholder={t('form.fields.typePlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">{t('form.fields.color')}</Label>
                <Input
                  id="color"
                  {...register('color')}
                  placeholder={t('form.fields.colorPlaceholder')}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">{t('form.fields.isActive')}</Label>
                <Switch
                  id="is_active"
                  checked={isActive ?? true}
                  onCheckedChange={(v) => setValue('is_active', v)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
