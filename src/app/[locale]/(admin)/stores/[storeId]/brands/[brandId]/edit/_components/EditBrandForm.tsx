'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useUpdateBrand } from '@/hooks/brands/useUpdateBrand';
import {
  BrandFormSchema,
  type BrandFormValues,
  type BrandFormInput,
} from '@/schemas/brands';
import type { BrandDetailView } from '@/types/brand';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  storeId: string;
  brandId: string;
  brand:   BrandDetailView;
}

export default function EditBrandForm({ storeId, brandId, brand }: Props) {
  const t      = useTranslations('brands');
  const update = useUpdateBrand(storeId, brandId);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<BrandFormInput, unknown, BrandFormValues>({
    resolver:      zodResolver(BrandFormSchema),
    defaultValues: {
      name:        brand.name,
      slug:        brand.slug,
      description: brand.description,
      logo_url:    brand.logoUrl,
      sort_order:  brand.sortOrder,
      is_active:   brand.isActive,
    },
  });

  const isActive = watch('is_active');
  const logoUrl  = watch('logo_url');

  useEffect(() => {
    reset({
      name:        brand.name,
      slug:        brand.slug,
      description: brand.description,
      logo_url:    brand.logoUrl,
      sort_order:  brand.sortOrder,
      is_active:   brand.isActive,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brand.id]);

  const onSubmit = async (values: BrandFormValues) => {
    await update.mutateAsync({
      name:        values.name,
      slug:        values.slug,
      description: values.description,
      logo_url:    values.logo_url,
      sort_order:  values.sort_order,
      is_active:   values.is_active,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('form.editTitle')}</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted-foreground text-sm font-mono">
              {brand.slug}
            </p>
            {brand.deletedAt && (
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
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('form.details')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('form.fields.name')}</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder={t('form.fields.namePlaceholder')}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t('form.fields.description')}</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder={t('form.fields.descriptionPlaceholder')}
                  rows={4}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo_url">{t('form.fields.logoUrl')}</Label>
                <Input
                  id="logo_url"
                  type="url"
                  {...register('logo_url')}
                  placeholder={t('form.fields.logoUrlPlaceholder')}
                />
                {errors.logo_url && (
                  <p className="text-sm text-destructive">{errors.logo_url.message}</p>
                )}
                {logoUrl && (
                  <div className="mt-2 h-16 w-16 rounded-md border bg-muted overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={logoUrl}
                      alt={brand.name}
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

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
                {errors.sort_order && (
                  <p className="text-sm text-destructive">{errors.sort_order.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">{t('form.fields.isActive')}</Label>
                <Switch
                  id="is_active"
                  checked={isActive ?? true}
                  onCheckedChange={(v) =>
                    setValue('is_active', v, { shouldDirty: true })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('form.stats')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t('form.fields.productsCount')}
                </span>
                <span className="font-medium">{brand.productsCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('table.created')}</span>
                <span className="font-medium">{brand.createdAt}</span>
              </div>
              {brand.updatedAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t('form.fields.updatedAt')}
                  </span>
                  <span className="font-medium">{brand.updatedAt}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}