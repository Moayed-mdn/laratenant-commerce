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
import type { Locale, ProductDetailView, ProductTranslation, ProductUpdatePayload, ProductVariantInput } from '@/types/product';
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

  const initialTranslationsFingerprint = useRef(JSON.stringify(translationsInitial));
  const initialBasicsFingerprint = useRef(JSON.stringify(structure.basics));
  const initialVariantsFingerprint = useRef(JSON.stringify(structure.variants));

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
    const translationsChanged = initialTranslationsFingerprint.current !== JSON.stringify(translations);
    const basicsChanged = initialBasicsFingerprint.current !== JSON.stringify(structure.basics);
    const variantsChanged = initialVariantsFingerprint.current !== JSON.stringify(structure.variants);

    const payload: ProductUpdatePayload = {};

    if (translationsChanged) {
      const entries = Object.values(translations);
      const nextTranslations = entries
        .filter((tr) => {
          const hasAny =
            (tr.name ?? '').trim().length > 0 ||
            (tr.slug ?? '').trim().length > 0 ||
            (tr.description ?? '').trim().length > 0 ||
            (tr.seo_title ?? '').trim().length > 0 ||
            (tr.seo_description ?? '').trim().length > 0;
          if (!hasAny) return false;
          const hasRequired = (tr.name ?? '').trim().length > 0 && (tr.slug ?? '').trim().length > 0;
          if (!hasRequired) {
            toast.error(t('form.validation.translationMissingRequired'));
          }
          return hasRequired;
        })
        .map((tr) => ({
          locale: tr.locale,
          name: tr.name,
          slug: tr.slug,
          description: tr.description,
          seo_title: tr.seo_title,
          seo_description: tr.seo_description,
        }));

      const hasAnyTranslations = Object.values(translations).some(
        (tr) =>
          (tr.name ?? '').trim().length > 0 ||
          (tr.slug ?? '').trim().length > 0 ||
          (tr.description ?? '').trim().length > 0 ||
          (tr.seo_title ?? '').trim().length > 0 ||
          (tr.seo_description ?? '').trim().length > 0
      );

      if (hasAnyTranslations && nextTranslations.length === 0) {
        return;
      }

      if (nextTranslations.length > 0) {
        payload.translations = nextTranslations;
      }
    }

    if (basicsChanged) {
      const status = structure.basics.status;
      payload.is_active = status === 'draft' ? null : status === 'active';
    }

    if (variantsChanged) {
      const variants = structure.variants;
      for (const variant of variants) {
        if (!variant.sku || variant.sku.trim().length === 0) {
          toast.error(t('form.validation.variantSkuRequired'));
          return;
        }
        if (Number.isNaN(variant.price) || variant.price < 0) {
          toast.error(t('form.validation.variantPriceInvalid'));
          return;
        }
        if (!Number.isInteger(variant.quantity) || variant.quantity < 0) {
          toast.error(t('form.validation.variantQuantityInvalid'));
          return;
        }
      }

      payload.variants = variants.map((variant: ProductVariantInput) => ({
        id: variant.id ?? null,
        sku: variant.sku ?? '',
        price: variant.price,
        quantity: variant.quantity,
        is_active: variant.is_active,
        attributes:
          variant.attributes?.length > 0
            ? variant.attributes
                .filter((attr) => attr.attribute_id != null && attr.attribute_value_id != null)
                .map((attr) => ({
                  attribute_id: attr.attribute_id as number | string,
                  attribute_value_id: attr.attribute_value_id as number | string,
                }))
            : undefined,
      }));
    }

    if (Object.keys(payload).length === 0) {
      return;
    }

    mutation.mutate(payload);
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
