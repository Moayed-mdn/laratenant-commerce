'use client';
// Reason: form with RHF + mutations

/**
 * Edit product form component.
 * Uses shared ProductForm with edit mode.
 */

import { useTranslations } from 'next-intl';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useUpdateProduct } from '@/hooks/products/useUpdateProduct';
import { normalizeProductOptions } from '@/lib/mappers/products';
import DeleteProductButton from './DeleteProductButton';
import type { Locale, ProductDetailView, ProductTranslation, ProductVariantInput } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductContentTab } from './ProductContentTab';
import { ProductMediaTab } from './ProductMediaTab';
import { ProductStructureTab, type ProductStructureState } from './ProductStructureTab';

interface Props {
  product: ProductDetailView;
  storeId: string;
}

export default function EditProductForm({ product, storeId }: Props) {
  const t = useTranslations('products');

  const [tab, setTab] = useState<'content' | 'structure' | 'media'>('content');

  const availableLocales = product.availableLocales;
  const translationsInitial = useMemo(() => {
    const base: Record<Locale, ProductTranslation> = { ...product.translations };

    for (const locale of availableLocales) {
      if (!base[locale]) {
        base[locale] = {
          locale,
          name: '',
          slug: '',
          description: null,
          seo_title: null,
          seo_description: null,
          is_complete: false,
        };
      }
    }

    return base;
  }, [availableLocales, product.translations]);

  const [translations, setTranslations] = useState<Record<Locale, ProductTranslation>>(translationsInitial);

  const [structure, setStructure] = useState<ProductStructureState>({
    basics: {
      status: product.status,
      featured: false,
    },
    variants:
      product.variants.length > 0
        ? product.variants.map<ProductVariantInput>((variant, idx) => ({
            id: variant.id,
            key:
              variant.attributes.map((attr) => `${attr.name}:${attr.value}`).join('|') ||
              `variant-${variant.id}-${idx}`,
            label:
              variant.attributes
                .map((attr) => attr.label?.trim() || attr.value)
                .filter(Boolean)
                .join(' / ') ||
              variant.label ||
              `Variant ${idx + 1}`,
            sku: variant.sku ?? null,
            barcode: variant.barcode ?? null,
            price: variant.price ?? 0,
            compare_at_price: variant.compare_at_price ?? product.compareAtPrice ?? null,
            cost_price: variant.cost_price ?? product.costPerItem ?? null,
            quantity: variant.quantity ?? 0,
            low_stock_threshold: variant.low_stock_threshold ?? null,
            track_inventory: variant.track_inventory ?? product.trackQuantity,
            is_active: variant.is_active,
            weight: variant.weight ?? product.weight ?? null,
            weight_unit: variant.weight_unit ?? product.weightUnit ?? null,
            attributes: variant.attributes ?? [],
          }))
        : [
            {
              key: 'default',
              label: 'Default',
              sku: product.sku ?? null,
              barcode: product.barcode ?? null,
              price: product.price ?? 0,
              compare_at_price: product.compareAtPrice ?? null,
              cost_price: product.costPerItem ?? null,
              quantity: product.quantity ?? 0,
              low_stock_threshold: null,
              track_inventory: product.trackQuantity,
              is_active: true,
              weight: product.weight ?? null,
              weight_unit: product.weightUnit ?? null,
              attributes: [],
            },
          ],
    options: normalizeProductOptions(product.options),
  });

  const [images, setImages] = useState(product.images ?? []);

  const snapshot = useMemo(() => ({ translations, structure, images }), [images, structure, translations]);
  const initialFingerprint = useRef(JSON.stringify(snapshot));
  const isDirty = initialFingerprint.current !== JSON.stringify(snapshot);

  const mutation = useUpdateProduct(storeId, String(product.id), {
    onSuccess: () => {
      toast.success(t('form.updateSuccess'));
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = () => {
    const primaryVariant = structure.variants[0];
    mutation.mutate({
      translations: Object.fromEntries(
        Object.entries(translations).map(([locale, tr]) => [
          locale,
          {
            locale,
            name: tr.name,
            slug: tr.slug,
            description: tr.description,
            seo_title: tr.seo_title,
            seo_description: tr.seo_description,
          },
        ])
      ),
      status: structure.basics.status,
      variants: structure.variants,
      options: structure.options,
      images,
      price: primaryVariant?.price ?? 0,
      compare_at_price: primaryVariant?.compare_at_price ?? null,
      cost_per_item: primaryVariant?.cost_price ?? null,
      sku: primaryVariant?.sku ?? null,
      barcode: primaryVariant?.barcode ?? null,
      quantity: primaryVariant?.quantity ?? 0,
      track_quantity: primaryVariant?.track_inventory ?? true,
      weight: primaryVariant?.weight ?? null,
      weight_unit: primaryVariant?.weight_unit ?? null,
    });
  };

  return (
    <div className="space-y-6">
      <Tabs value={tab} onValueChange={setTab} >
        <TabsList>
          <TabsTrigger value="content">{t('editor.tabs.content')}</TabsTrigger>
          <TabsTrigger value="structure">{t('editor.tabs.structure')}</TabsTrigger>
          <TabsTrigger value="media">{t('editor.tabs.media')}</TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          <ProductContentTab
            availableLocales={availableLocales}
            translations={translations}
            onChange={setTranslations}
          />
        </TabsContent>

        <TabsContent value="structure">
          <ProductStructureTab value={structure} onChange={setStructure} />
        </TabsContent>

        <TabsContent value="media">
          <ProductMediaTab images={images} onChange={setImages} />
        </TabsContent>
      </Tabs>

      {isDirty && (
        <div className="sticky bottom-4 z-10 rounded-md border bg-bg p-3 shadow-sm ">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">{t('variantEditor.unsavedChanges')}</p>
            <Button onClick={handleSubmit} disabled={mutation.isPending}>
              {mutation.isPending ? t('saving') : t('save')}
            </Button>
          </div>
        </div>
      )}
      <div className="flex justify-end">
        <DeleteProductButton
          storeId={storeId}
          productId={String(product.id)}
          productName={product.name}
        />
      </div>
    </div>
  );
}
