'use client';
// Reason: form with RHF + mutations

/**
 * Edit product form component.
 * Uses shared ProductForm with edit mode.
 * 
 * Architecture: Variant-First
 * - variants[] is the PRIMARY source of truth
 * - display_variant is the explicit default variant
 * - flattened product fields are deprecated compatibility fallbacks
 */

import { useTranslations } from 'next-intl';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useUpdateProduct } from '@/hooks/products/useUpdateProduct';
import { normalizeProductOptions } from '@/lib/mappers/products';
import { initializeVariantsFromProduct, getPrimaryVariantId } from '@/lib/mappers/product.dto';
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

  /**
   * Initialize variants using variant-first architecture.
   * 
   * Priority order:
   * 1. product.variants - use all existing variants
   * 2. product.display_variant - use explicit default variant
   * 3. deprecated flattened fields - temporary compatibility fallback
   */
  const [structure, setStructure] = useState<ProductStructureState>({
    basics: {
      status: product.status,
      featured: false,
    },
    // Use DTO mapper for proper variant initialization
    variants: initializeVariantsFromProduct(product),
    options: normalizeProductOptions(product.options),
  });

  const [images, setImages] = useState(product.images ?? []);

  // Get primary variant ID from display_variant or first variant
  const primaryVariantId = useMemo(
    () => getPrimaryVariantId(product),
    [product]
  );

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
    // Use DTO mapper to create variant-first payload
    const payload = {
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
      // Explicit default variant ID (variant-first architecture)
      display_variant_id: primaryVariantId ?? structure.variants[0]?.id ?? null,
      /**
       * DEPRECATED: Flattened fields for backward compatibility.
       * These are extracted from the primary variant to maintain compatibility
       * with older backend versions during migration.
       * 
       * TODO: Remove these fields when backend v2.0 is deployed.
       * The backend should extract all data from the variants array.
       */
      price: structure.variants[0]?.price ?? 0,
      compare_at_price: structure.variants[0]?.compare_at_price ?? null,
      cost_per_item: structure.variants[0]?.cost_price ?? null,
      sku: structure.variants[0]?.sku ?? null,
      barcode: structure.variants[0]?.barcode ?? null,
      quantity: structure.variants[0]?.quantity ?? 0,
      track_quantity: structure.variants[0]?.track_inventory ?? true,
      weight: structure.variants[0]?.weight ?? null,
      weight_unit: structure.variants[0]?.weight_unit ?? null,
    };
    
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
