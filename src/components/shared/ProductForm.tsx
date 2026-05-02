'use client';
// Reason: RHF form with complex interactions

/**
 * Shared product form component.
 * Used by both create and edit product pages.
 * Max 250 lines — split into sub-components.
 */

import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ProductFormSchema, type ProductFormData } from '@/schemas/products';
import type { ProductDetailView } from '@/types/product';
import { ROUTES } from '@/config/routes';
import { ProductFormBasic } from './product-form/ProductFormBasic';
import { ProductFormPricing } from './product-form/ProductFormPricing';
import { ProductFormInventory } from './product-form/ProductFormInventory';
import { ProductFormShipping } from './product-form/ProductFormShipping';

interface Props {
  mode: 'create' | 'edit';
  initialData?: ProductDetailView;
  onSubmit: (data: ProductFormData) => void;
  isPending: boolean;
  storeId: string;
}

export default function ProductForm({
  mode,
  initialData,
  onSubmit,
  isPending,
  storeId,
}: Props) {
  const t = useTranslations('products');
  const dashboardT = useTranslations('dashboard');

  const defaultValues: ProductFormData = {
    name: initialData?.name ?? '',
    description: initialData?.description ?? '',
    price: initialData?.price ?? 0,
    compare_at_price: initialData?.compareAtPrice ?? null,
    cost_per_item: initialData?.costPerItem ?? null,
    sku: initialData?.sku ?? null,
    barcode: initialData?.barcode ?? null,
    quantity: initialData?.quantity ?? 0,
    track_quantity: initialData?.trackQuantity ?? true,
    weight: initialData?.weight ?? null,
    weight_unit: initialData?.weightUnit ?? null,
    status: initialData?.status ?? 'draft',
  };

  const form = useForm<ProductFormData>({
    resolver: zodResolver(ProductFormSchema) as any,
    defaultValues,
  });

  // Documented useEffect exception: reset form when initialData changes
  // Reason: same component reused across edit pages, needs re-initialization
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description ?? '',
        price: initialData.price,
        compare_at_price: initialData.compareAtPrice ?? null,
        cost_per_item: initialData.costPerItem ?? null,
        sku: initialData.sku ?? null,
        barcode: initialData.barcode ?? null,
        quantity: initialData.quantity,
        track_quantity: initialData.trackQuantity,
        weight: initialData.weight ?? null,
        weight_unit: initialData.weightUnit ?? null,
        status: initialData.status,
      });
    }
  }, [initialData, form]);

  const status = form.watch('status');

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={ROUTES.store(storeId).products.list()}>
          <Button variant="ghost" size="icon" type="button">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">
          {mode === 'create' ? t('form.createTitle') : t('form.editTitle')}
        </h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <ProductFormBasic control={form.control} errors={form.formState.errors} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <ProductFormPricing control={form.control} errors={form.formState.errors} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <ProductFormInventory control={form.control} errors={form.formState.errors} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <ProductFormShipping control={form.control} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('form.sections.status')}</h3>
            <div className="space-y-2">
              <Label htmlFor="status">{t('form.fields.status')}</Label>
              <Select
                value={status}
                onValueChange={(value) =>
                  form.setValue('status', value as 'active' | 'draft' | 'archived')
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">
                    {dashboardT('productStatus.active')}
                  </SelectItem>
                  <SelectItem value="draft">
                    {dashboardT('productStatus.draft')}
                  </SelectItem>
                  <SelectItem value="archived">
                    {dashboardT('productStatus.archived')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Link href={ROUTES.store(storeId).products.list()}>
          <Button variant="outline" type="button">
            {t('cancel')}
          </Button>
        </Link>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? mode === 'create'
              ? t('form.submit.creating')
              : t('form.submit.updating')
            : mode === 'create'
              ? t('form.submit.create')
              : t('form.submit.update')}
        </Button>
      </div>
    </form>
  );
}
