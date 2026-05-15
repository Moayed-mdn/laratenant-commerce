'use client';

/**
 * Form for editing an existing category.
 */

import { useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useUpdateCategory } from '@/hooks/categories/useUpdateCategory';
import { useCategories } from '@/hooks/categories/useCategories';
import { CategoryFormInput, CategoryFormSchema, type CategoryFormValues } from '@/schemas/categories';
import type { CategoryDetailView } from '@/types/category';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ParentCategorySelect, getDescendantIds } from '@/components/shared/categories/ParentCategorySelect';


interface Props {
  storeId:    string;
  categoryId: string;
  category:   CategoryDetailView;
}

export default function EditCategoryForm({ storeId, categoryId, category }: Props) {
  const t      = useTranslations('categories');
  const update = useUpdateCategory(storeId, categoryId);

  // Fetch all categories to compute descendant exclusion
  const { data: allCategoriesData, isLoading: isAllLoading } = useCategories(storeId, {
    is_active: 'all',
    page: 1,
    perPage: 100,
  });
  const allCategories = allCategoriesData?.data ?? [];

  const excludeIds = useMemo(() => {
    const descendants = getDescendantIds(allCategories, category.id);
    return [category.id, ...descendants];
  }, [allCategories, category.id]);

  // Build translations ensuring both locales present
  const buildTranslations = () => {
    const locales: Array<'en' | 'ar'> = ['en', 'ar'];
    return locales.map((locale) => {
      const existing = category.translations.find((tr) => tr.locale === locale);
      return {
        locale,
        name: existing?.name ?? '',
        slug: existing?.slug ?? '',
      };
    });
  };

  const form = useForm<CategoryFormInput, unknown, CategoryFormValues>({
    resolver:      zodResolver(CategoryFormSchema),
    defaultValues: {
      slug:         category.slug,
      parent_id:    category.parentId,
      sort_order:   category.sortOrder,
      is_active:    category.isActive,
      translations: buildTranslations(),
    },
  });

  const { fields } = useFieldArray({ control: form.control, name: 'translations' });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = form;

  const isActive = watch('is_active');

  // Sync form if category data changes
  useEffect(() => {
    reset({
      slug:         category.slug,
      parent_id:    category.parentId,
      sort_order:   category.sortOrder,
      is_active:    category.isActive,
      translations: buildTranslations(),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category.id]);

  const onSubmit = async (values: CategoryFormValues) => {
    await update.mutateAsync({
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
          <h1 className="text-2xl font-bold">{t('form.editTitle')}</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted-foreground text-sm font-mono">
              {category.slug}
            </p>
            {category.deletedAt && (
              <Badge variant="destructive" className="text-xs">
                {t('status.deleted')}
              </Badge>
            )}
          </div>
        </div>
        <Button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? t('form.saving') : t('form.save')}
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
                  <TabsContent
                    key={field.id}
                    value={field.locale}
                    className="space-y-4 pt-4"
                  >
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

              <div className="space-y-2">
                <Label htmlFor="sort_order">{t('form.fields.sortOrder')}</Label>
                <Input
                  id="sort_order"
                  type="number"
                  min={0}
                  {...register('sort_order', { valueAsNumber: true })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">{t('form.fields.isActive')}</Label>
                <Switch
                  id="is_active"
                  checked={isActive}
                  onCheckedChange={(v) => setValue('is_active', v, { shouldDirty: true })}
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
              {isAllLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <ParentCategorySelect
                  storeId={storeId}
                  value={watch('parent_id') ?? null}
                  onChange={(val) => setValue('parent_id', val, { shouldDirty: true })}
                  excludeIds={excludeIds}
                />
              )}
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
