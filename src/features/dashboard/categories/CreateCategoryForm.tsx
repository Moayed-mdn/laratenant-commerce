'use client';

/**
 * Form for creating a new category.
 * Handles translations for EN + AR locales.
 */

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useCreateCategory } from '@/hooks/categories/useCreateCategory';
import { CategoryFormInput, CategoryFormSchema, type CategoryFormValues } from '@/schemas/categories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ParentCategorySelect } from '@/components/shared/categories/ParentCategorySelect';

interface Props {
  storeId: string;
}

const DEFAULT_TRANSLATIONS = [
  { locale: 'en' as const, name: '', slug: '' },
  { locale: 'ar' as const, name: '', slug: '' },
];

export default function CreateCategoryForm({ storeId }: Props) {
  const t      = useTranslations('categories');
  const create = useCreateCategory(storeId);

  const form = useForm<CategoryFormInput, unknown, CategoryFormValues>({
    resolver:      zodResolver(CategoryFormSchema),
    defaultValues: {
      slug:         '',
      parent_id:    null,
      sort_order:   0,
      is_active:    true,
      translations: DEFAULT_TRANSLATIONS,
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name:    'translations',
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  const isActive = watch('is_active');

  const onSubmit = async (values: CategoryFormValues) => {
    await create.mutateAsync({
      slug:         values.slug,
      parent_id:    values.parent_id,
      sort_order:   values.sort_order,
      is_active:    values.is_active,
      translations: values.translations,
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
        {/* Left — Translations */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('form.translations')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="en">
                <TabsList>
                  <TabsTrigger value="en">English</TabsTrigger>
                  <TabsTrigger value="ar">العربية</TabsTrigger>
                </TabsList>

                {fields.map((field, index) => (
                  <TabsContent key={field.id} value={field.locale} className="space-y-4 pt-4">
                    {/* Name */}
                    <div className="space-y-2">
                      <Label htmlFor={`translations.${index}.name`}>
                        {t('form.fields.name')}
                      </Label>
                      <Input
                        id={`translations.${index}.name`}
                        {...register(`translations.${index}.name`)}
                        placeholder={t('form.fields.namePlaceholder')}
                        dir={field.locale === 'ar' ? 'rtl' : 'ltr'}
                      />
                      {errors.translations?.[index]?.name && (
                        <p className="text-sm text-destructive">
                          {errors.translations[index]?.name?.message}
                        </p>
                      )}
                    </div>

                    {/* Slug */}
                    <div className="space-y-2">
                      <Label htmlFor={`translations.${index}.slug`}>
                        {t('form.fields.translationSlug')}
                      </Label>
                      <Input
                        id={`translations.${index}.slug`}
                        {...register(`translations.${index}.slug`)}
                        placeholder={t('form.fields.slugPlaceholder')}
                        className="font-mono"
                      />
                      {errors.translations?.[index]?.slug && (
                        <p className="text-sm text-destructive">
                          {errors.translations[index]?.slug?.message}
                        </p>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right — Settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('form.settings')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Global slug */}
              <div className="space-y-2">
                <Label htmlFor="slug">{t('form.fields.slug')}</Label>
                <Input
                  id="slug"
                  {...register('slug')}
                  placeholder={t('form.fields.slugPlaceholder')}
                  className="font-mono"
                />
                {errors.slug && (
                  <p className="text-sm text-destructive">{errors.slug.message}</p>
                )}
              </div>

              {/* Sort order */}
              <div className="space-y-2">
                <Label htmlFor="sort_order">{t('form.fields.sortOrder')}</Label>
                <Input
                  id="sort_order"
                  type="number"
                  min={0}
                  {...register('sort_order', { valueAsNumber: true })}
                />
                {errors.sort_order && (
                  <p className="text-sm text-destructive">{errors.sort_order.message}</p>
                )}
              </div>

              {/* Is active */}
              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">{t('form.fields.isActive')}</Label>
                <Switch
                  id="is_active"
                  checked={isActive}
                  onCheckedChange={(v) => setValue('is_active', v)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Parent category selector */}
          <Card>
            <CardHeader>
              <CardTitle>{t('form.parentCategory')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ParentCategorySelect
                storeId={storeId}
                value={watch('parent_id') ?? null }
                onChange={(val) => setValue('parent_id', val, { shouldDirty: true })}
              />
              {errors.parent_id && (
                <p className="text-sm text-destructive mt-2">{errors.parent_id.message}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
