'use client';

import { useCallback, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

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

import type { ProductDetailView, ProductImage } from '@/types/product';
import type { ProductContentFormValues, ProductStructureState } from '@/types/product-editor';

interface Props {
  product: ProductDetailView;
  storeId: string;
}

export default function EditProductForm({ product, storeId }: Props) {
  const t = useTranslations('products');

  const initialRef = useRef(() => buildEditorState(product));
  const initial = initialRef.current();

  const [content, setContent] = useState<ProductContentFormValues>(initial.content);
  const [structure, setStructure] = useState<ProductStructureState>(initial.structure);
  const [images, setImages] = useState<ProductImage[]>(initial.media.images ?? []);
  const [tab, setTab] = useState<'content' | 'structure' | 'media'>('content');

  const [contentDirty, setContentDirty] = useState(false);
  const [structureDirty, setStructureDirty] = useState(false);
  const [mediaDirty, setMediaDirty] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const isDirty = contentDirty || structureDirty || mediaDirty;

  const { bypassNextNavigation } = useUnsavedChangesGuard({ isDirty });

  const saveContent = useSaveProductContent(storeId, String(product.id), {
    onSuccess: () => {
      toast.success(t('form.updateSuccess'));
      setContentDirty(false);
      setValidationErrors([]);
    },
    onError: (err) => toast.error(err.message),
  });

  const saveStructure = useSaveProductStructure(storeId, String(product.id), {
    onSuccess: () => {
      toast.success(t('form.updateSuccess'));
      setStructureDirty(false);
      setValidationErrors([]);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleDiscard = useCallback(() => {
    bypassNextNavigation();
    setContent(initial.content);
    setStructure(initial.structure);
    setImages(initial.media.images ?? []);
    setContentDirty(false);
    setStructureDirty(false);
    setMediaDirty(false);
    setValidationErrors([]);
  }, [bypassNextNavigation, initial.content, initial.media.images, initial.structure]);

  const handleSaveCurrentTab = useCallback(() => {
    setValidationErrors([]);

    if (tab === 'content') {
      const result = validateProductContent(content);
      if (!result.isValid) {
        setValidationErrors(result.errors);
        toast.error(t('form.validationError'));
        return;
      }
      saveContent.mutate(content);
      return;
    }

    if (tab === 'structure') {
      const result = validateProductStructure(structure);
      if (!result.isValid) {
        setValidationErrors(result.errors);
        toast.error(t('form.validationError'));
        return;
      }
      saveStructure.mutate(structure);
      return;
    }

    toast.message(t('saving'));
  }, [content, saveContent, saveStructure, structure, t, tab]);

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
                disabled={saveContent.isPending || saveStructure.isPending}
              >
                {saveContent.isPending || saveStructure.isPending ? t('saving') : t('save')}
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