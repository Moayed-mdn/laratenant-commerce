'use client';
// Reason: form with RHF + mutations

/**
 * Edit product form component.
 * Uses shared ProductForm with edit mode.
 */

import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { useUpdateProduct } from '@/hooks/products/useUpdateProduct';
import DeleteProductButton from './DeleteProductButton';
import type { ProductDetailView, ProductEditorState, ProductVariantInput } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductGeneralForm } from './ProductGeneralForm';
import { ProductVariantsTable } from './ProductVariantsTable';
import { ProductAttributesManager } from './ProductAttributesManager';
import { generateVariantCombinations } from './VariantCombinationGenerator';

interface Props {
  product: ProductDetailView;
  storeId: string;
}

export default function EditProductForm({ product, storeId }: Props) {
  const t = useTranslations('products');
  const [tab, setTab] = useState('general');

  const [editor, setEditor] = useState<ProductEditorState>({
    product: {
      name: product.name,
      description: product.description ?? '',
      status: product.status,
      category_id: null,
      brand_id: null,
      featured: false,
      active: product.status === 'active',
      media: product.images ?? [],
    },
    variants:
      product.variants.length > 0
        ? product.variants.map<ProductVariantInput>((variant, idx) => ({
            id: variant.id,
            key:
              variant.attributes.map((attr) => `${attr.name}:${attr.value}`).join('|') ||
              `variant-${variant.id}-${idx}`,
            label:
              variant.attributes.map((attr) => attr.value).join(' / ') ||
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
    attributes: [],
  });

  const initialFingerprint = useRef(JSON.stringify(editor));
  const isDirty = initialFingerprint.current !== JSON.stringify(editor);

  const mutation = useUpdateProduct(storeId, String(product.id), {
    onSuccess: () => {
      toast.success(t('form.updateSuccess'));
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = () => {
    const primaryVariant = editor.variants[0];
    mutation.mutate({
      name: editor.product.name,
      description: editor.product.description,
      status: editor.product.status,
      // Backward compatibility until backend is fully variant-first
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
      <Tabs value={tab} onValueChange={setTab} className="flex-col">
        <TabsList>
          <TabsTrigger value="general">{t('variantEditor.tabs.general')}</TabsTrigger>
          <TabsTrigger value="variants">{t('variantEditor.tabs.variants')}</TabsTrigger>
          <TabsTrigger value="attributes">{t('variantEditor.tabs.attributes')}</TabsTrigger>
          <TabsTrigger value="seo">{t('variantEditor.tabs.seo')}</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <Card>
            <CardContent className="pt-6">
              <ProductGeneralForm
                value={editor.product}
                onChange={(next) => setEditor((prev) => ({ ...prev, product: next }))}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="variants">
          <Card>
            <CardContent className="pt-6">
              <ProductVariantsTable
                variants={editor.variants}
                onChange={(variants) => setEditor((prev) => ({ ...prev, variants }))}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="attributes">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <ProductAttributesManager
                attributes={editor.attributes}
                onChange={(attributes) => {
                  setEditor((prev) => ({
                    ...prev,
                    attributes,
                    variants: generateVariantCombinations(attributes, prev.variants),
                  }));
                }}
              />
              <Button
                variant="outline"
                onClick={() =>
                  setEditor((prev) => ({
                    ...prev,
                    variants: generateVariantCombinations(prev.attributes, prev.variants),
                  }))
                }
              >
                {t('variantEditor.attributes.generateCombinations')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="seo">
          <Card>
            <CardContent className="pt-6 text-muted-foreground">
              {t('variantEditor.seoPlaceholder')}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isDirty && (
        <div className="sticky bottom-4 z-10 rounded-md border bg-background p-3 shadow-sm">
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
