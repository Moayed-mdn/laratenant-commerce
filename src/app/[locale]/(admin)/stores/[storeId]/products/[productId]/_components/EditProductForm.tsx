'use client';

import { useCallback, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { mapProductDetail } from '@/lib/mappers/products';
import { buildEditorState } from '@/lib/products/buildEditorState';
import { generateVariants } from '@/lib/products/generateVariants';
import { validateProductContent, type ValidationError } from '@/lib/products/validateProductContent';
import { validateProductStructure } from '@/lib/products/validateProductStructure';

import { useSaveProductContent } from '@/hooks/products/useSaveProductContent';
import { useSaveProductStructure } from '@/hooks/products/useSaveProductStructure';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { ContentTab } from './_tabs/ContentTab';
import { StructureTab } from './_tabs/StructureTab';
import { MediaTab } from './_tabs/MediaTab';
import DeleteProductButton from './DeleteProductButton';

import type { AdminProduct, ProductDetailView, ProductImage } from '@/types/product';
import type { ProductContentFormValues, ProductEditorState, ProductStructureState } from '@/types/product-editor';

interface Props {
  product: ProductDetailView;
  storeId: string;
}

export function buildNextStructureForSave(structure: ProductStructureState): ProductStructureState {
  const regeneratedVariants = generateVariants(structure.options, structure.variants);

  return {
    ...structure,
    variants: regeneratedVariants,
  };
}

export function buildRebasedEditorState(savedProduct: AdminProduct): ProductEditorState {
  return buildEditorState(mapProductDetail(savedProduct));
}

export function buildDiscardState(baseline: ProductEditorState) {
  return {
    content: baseline.content,
    structure: baseline.structure,
    images: baseline.media.images ?? [],
    contentDirty: false,
    structureDirty: false,
    mediaDirty: false,
    validationErrors: [] as ValidationError[],
  };
}

export function isEditorSaveBlocked(params: {
  isDirty: boolean;
  isDiscarding: boolean;
  isPending: boolean;
}): boolean {
  return params.isDiscarding || params.isPending || !params.isDirty;
}

export default function EditProductForm({ product, storeId }: Props) {
  const t = useTranslations('products');
  const initialState = buildEditorState(product);

  const baselineRef = useRef<ProductEditorState>(initialState);

  const [content, setContent] = useState<ProductContentFormValues>(initialState.content);
  const [structure, setStructure] = useState<ProductStructureState>(initialState.structure);
  const [images, setImages] = useState<ProductImage[]>(initialState.media.images ?? []);
  const [tab, setTab] = useState<'content' | 'structure' | 'media'>('content');

  const [contentDirty, setContentDirty] = useState(false);
  const [structureDirty, setStructureDirty] = useState(false);
  const [mediaDirty, setMediaDirty] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const discardInProgressRef = useRef(false);

  const contentSaveTokenRef = useRef(0);
  const structureSaveTokenRef = useRef(0);

  const isDirty = contentDirty || structureDirty || mediaDirty;

  const { bypassNextNavigation } = useUnsavedChangesGuard({ isDirty });

  const rebaseFromProduct = useCallback((savedProduct: AdminProduct) => {
    const nextState = buildRebasedEditorState(savedProduct);

    baselineRef.current = nextState;
    setContent(nextState.content);
    setStructure(nextState.structure);
    setImages(nextState.media.images ?? []);
    setContentDirty(false);
    setStructureDirty(false);
    setMediaDirty(false);
    setValidationErrors([]);
  }, []);

  const saveContent = useSaveProductContent(storeId, String(product.id), {
    onError: (err) => toast.error(err.message),
  });

  const saveStructure = useSaveProductStructure(storeId, String(product.id), {
    onError: (err) => toast.error(err.message),
  });
  const isSavePending = saveContent.isPending || saveStructure.isPending;

  const handleDiscard = useCallback(() => {
    bypassNextNavigation();
    discardInProgressRef.current = true;
    setIsDiscarding(true);

    const discardState = buildDiscardState(baselineRef.current);
    setContent(discardState.content);
    setStructure(discardState.structure);
    setImages(discardState.images);
    setContentDirty(discardState.contentDirty);
    setStructureDirty(discardState.structureDirty);
    setMediaDirty(discardState.mediaDirty);
    setValidationErrors(discardState.validationErrors);

    queueMicrotask(() => {
      discardInProgressRef.current = false;
      setIsDiscarding(false);
    });
  }, [bypassNextNavigation]);

  const handleSaveCurrentTab = useCallback(() => {
    if (isEditorSaveBlocked({
      isDirty,
      isDiscarding: discardInProgressRef.current,
      isPending: saveContent.isPending || saveStructure.isPending,
    })) {
      return;
    }

    setValidationErrors([]);

    if (tab === 'content') {
      const result = validateProductContent(content);
      if (!result.isValid) {
        setValidationErrors(result.errors);
        toast.error(t('form.validationError'));
        return;
      }
      const token = (contentSaveTokenRef.current += 1);
      saveContent.mutate(content, {
        onSuccess: (savedProduct) => {
          if (token !== contentSaveTokenRef.current) return;
          rebaseFromProduct(savedProduct);
          toast.success(t('form.updateSuccess'));
        },
      });
      return;
    }

    if (tab === 'structure') {
      const nextStructure = buildNextStructureForSave(structure);
      setStructure(nextStructure);

      const result = validateProductStructure(nextStructure);
      if (!result.isValid) {
        setValidationErrors(result.errors);
        toast.error(t('form.validationError'));
        return;
      }
      const token = (structureSaveTokenRef.current += 1);
      saveStructure.mutate(nextStructure, {
        onSuccess: (savedProduct) => {
          if (token !== structureSaveTokenRef.current) return;
          rebaseFromProduct(savedProduct);
          toast.success(t('form.updateSuccess'));
        },
      });
      return;
    }

    toast.message(t('saving'));
  }, [content, isDirty, saveContent, saveStructure, structure, t, tab]);

  return (
    <div className="space-y-6">
      {validationErrors.length > 0 && (
        <div className="rounded-md border border-destructive bg-destructive/10 p-4">
          <p className="mb-2 font-medium text-destructive">{t('form.validationErrorsTitle') || 'Validation Errors:'}</p>
          <ul className="list-inside list-disc space-y-1 text-sm text-destructive">
            {validationErrors.map((error, idx) => (
              <li key={idx}>
                <span className="font-semibold">{error.field}:</span> {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}
      <Tabs value={tab} onValueChange={(v) => {
        setTab(v as typeof tab);
        setValidationErrors([]);
      }}>
        <TabsList>
          <TabsTrigger value="content">{t('editor.tabs.content')}</TabsTrigger>
          <TabsTrigger value="structure">{t('editor.tabs.structure')}</TabsTrigger>
          <TabsTrigger value="media">{t('editor.tabs.media')}</TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          <ContentTab
            availableLocales={product.availableLocales}
            status={content.status}
            translations={content.translations}
            onStatusChange={(status) => {
              setContent((prev) => ({ ...prev, status }));
              setContentDirty(true);
            }}
            onTranslationsChange={(translations) => {
              setContent((prev) => ({ ...prev, translations }));
              setContentDirty(true);
            }}
          />
        </TabsContent>

        <TabsContent value="structure">
          <StructureTab
            options={structure.options}
            variants={structure.variants}
            onOptionsChange={(options) => {
              setStructure((prev) => ({ ...prev, options }));
              setStructureDirty(true);
            }}
            onVariantsChange={(variants) => {
              setStructure((prev) => ({ ...prev, variants }));
              setStructureDirty(true);
            }}
            onGenerateCombinations={() => {
              setStructure((prev) => ({
                ...prev,
                variants: generateVariants(prev.options, prev.variants),
              }));
              setStructureDirty(true);
            }}
          />
        </TabsContent>

        <TabsContent value="media">
          <MediaTab
            images={images}
            onChange={(next) => {
              setImages(next);
              setMediaDirty(true);
            }}
          />
        </TabsContent>
      </Tabs>

      {isDirty && (
        <div className="sticky bottom-4 z-10 rounded-md border bg-background p-3 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">{t('variantEditor.unsavedChanges')}</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleDiscard}>
                {t('discard')}
              </Button>
              <Button
                onClick={handleSaveCurrentTab}
                disabled={isEditorSaveBlocked({
                  isDirty,
                  isDiscarding,
                  isPending: saveContent.isPending || saveStructure.isPending,
                })}
              >
                {isSavePending ? t('saving') : t('save')}
              </Button>
            </div>
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
