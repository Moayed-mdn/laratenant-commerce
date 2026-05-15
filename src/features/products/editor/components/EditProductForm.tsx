'use client';

import { useCallback, useRef, useState } from 'react';
import { useTranslations }               from 'next-intl';
import { toast }                         from 'sonner';

import { mapProductDetail }          from '@/lib/mappers/products';
import { buildEditorState }          from '@/features/products/editor/state/buildEditorState';
import { generateVariants }          from '@/features/products/editor/utils/generateVariants';
import {
  validateProductContent,
  type ValidationError,
}                                    from '@/features/products/editor/validators/validateProductContent';
import { validateProductStructure }  from '@/features/products/editor/validators/validateProductStructure';

import { useSaveProductContent }     from '@/hooks/products/useSaveProductContent';
import { useSaveProductStructure }   from '@/hooks/products/useSaveProductStructure';
import { useSaveProductMedia }       from '@/hooks/products/useSaveProductMedia';
import { useUnsavedChangesGuard }    from '@/hooks/useUnsavedChangesGuard';

import { Button }   from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { ContentTab }        from '@/features/products/editor/tabs/ContentTab';
import { StructureTab }      from '@/features/products/editor/tabs/StructureTab';
import { MediaTab }          from '@/features/products/editor/tabs/MediaTab';
import DeleteProductButton   from './DeleteProductButton';

import type {
  AdminProduct,
  ProductDetailView,
  ProductImage,
} from '@/types/product';
import type {
  ProductContentFormValues,
  ProductEditorState,
  ProductStructureState,
} from '@/features/products/editor/types/product-editor';

interface Props {
  product: ProductDetailView;
  storeId: string;
}

// ── Exported pure helpers (unit-tested independently) ─────────────────────

export function buildNextStructureForSave(
  structure: ProductStructureState
): ProductStructureState {
  return {
    ...structure,
    variants: generateVariants(structure.options, structure.variants),
  };
}

export function buildRebasedEditorState(
  savedProduct: AdminProduct
): ProductEditorState {
  return buildEditorState(mapProductDetail(savedProduct));
}

export function buildDiscardState(baseline: ProductEditorState) {
  return {
    content:         baseline.content,
    structure:       baseline.structure,
    images:          baseline.media.images ?? [],
    tags:            baseline.tags,
    contentDirty:    false,
    structureDirty:  false,
    mediaDirty:      false,
    tagsDirty:       false,
    validationErrors: [] as ValidationError[],
  };
}

export function isEditorSaveBlocked(params: {
  isDirty:      boolean;
  isDiscarding: boolean;
  isPending:    boolean;
}): boolean {
  return params.isDiscarding || params.isPending || !params.isDirty;
}

// ── Component ─────────────────────────────────────────────────────────────

export default function EditProductForm({ product, storeId }: Props) {
  const t = useTranslations('products');

  const initialState = buildEditorState(product);
  const baselineRef  = useRef<ProductEditorState>(initialState);

  const [content, setContent]     = useState<ProductContentFormValues>(initialState.content);
  const [structure, setStructure] = useState<ProductStructureState>(initialState.structure);
  const [images, setImages]       = useState<ProductImage[]>(initialState.media.images ?? []);
  const [tags, setTags]           = useState<number[]>(initialState.tags);
  const [tab, setTab]             = useState<'content' | 'structure' | 'media'>('content');

  const [contentDirty,   setContentDirty]   = useState(false);
  const [structureDirty, setStructureDirty] = useState(false);
  const [mediaDirty,     setMediaDirty]     = useState(false);
  const [tagsDirty,      setTagsDirty]      = useState(false);
  const [isDiscarding,   setIsDiscarding]   = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const discardInProgressRef  = useRef(false);
  const contentSaveTokenRef   = useRef(0);
  const structureSaveTokenRef = useRef(0);
  const mediaSaveTokenRef     = useRef(0);

  // Tags dirty counts as content dirty — saved together in one PATCH
  const isDirty = contentDirty || structureDirty || mediaDirty || tagsDirty;

  const { bypassNextNavigation } = useUnsavedChangesGuard({ isDirty });

  const rebaseFromProduct = useCallback((savedProduct: AdminProduct) => {
    const nextState = buildRebasedEditorState(savedProduct);
    baselineRef.current = nextState;
    setContent(nextState.content);
    setStructure(nextState.structure);
    setImages(nextState.media.images ?? []);
    setTags(nextState.tags);
    setContentDirty(false);
    setStructureDirty(false);
    setMediaDirty(false);
    setTagsDirty(false);
    setValidationErrors([]);
  }, []);

  const saveContent = useSaveProductContent(storeId, String(product.id), {
    onError: (err) => toast.error(err.message),
  });
  const saveStructure = useSaveProductStructure(storeId, String(product.id), {
    onError: (err) => toast.error(err.message),
  });
  const saveMedia = useSaveProductMedia(storeId, String(product.id), {
    onError: (err) => toast.error(err.message),
  });

  const isSavePending =
    saveContent.isPending || saveStructure.isPending || saveMedia.isPending;

  const handleDiscard = useCallback(() => {
    bypassNextNavigation();
    discardInProgressRef.current = true;
    setIsDiscarding(true);

    const d = buildDiscardState(baselineRef.current);
    setContent(d.content);
    setStructure(d.structure);
    setImages(d.images);
    setTags(d.tags);
    setContentDirty(d.contentDirty);
    setStructureDirty(d.structureDirty);
    setMediaDirty(d.mediaDirty);
    setTagsDirty(d.tagsDirty);
    setValidationErrors(d.validationErrors);

    queueMicrotask(() => {
      discardInProgressRef.current = false;
      setIsDiscarding(false);
    });
  }, [bypassNextNavigation]);

  const handleSaveCurrentTab = useCallback(() => {
    if (
      isEditorSaveBlocked({
        isDirty,
        isDiscarding: discardInProgressRef.current,
        isPending:    isSavePending,
      })
    ) return;

    setValidationErrors([]);

    // ── Content tab ──────────────────────────────────────────────
    if (tab === 'content') {
      const result = validateProductContent(content);
      if (!result.isValid) {
        setValidationErrors(result.errors);
        toast.error(t('form.validationError'));
        return;
      }
      const token = (contentSaveTokenRef.current += 1);
      // Tags are saved together with content in one PATCH call
      saveContent.mutate(
        { content, tags },
        {
          onSuccess: (savedProduct) => {
            if (token !== contentSaveTokenRef.current) return;
            rebaseFromProduct(savedProduct);
            toast.success(t('form.updateSuccess'));
          },
        }
      );
      return;
    }

    // ── Structure tab ────────────────────────────────────────────
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

    // ── Media tab ────────────────────────────────────────────────
    if (tab === 'media') {
      const token = (mediaSaveTokenRef.current += 1);
      saveMedia.mutate(
        { images },
        {
          onSuccess: (savedProduct) => {
            if (token !== mediaSaveTokenRef.current) return;
            rebaseFromProduct(savedProduct);
            toast.success(t('form.updateSuccess'));
          },
        }
      );
    }
  }, [
    content,
    images,
    isDirty,
    isSavePending,
    rebaseFromProduct,
    saveContent,
    saveMedia,
    saveStructure,
    structure,
    t,
    tab,
    tags,
  ]);

  return (
    <div className="space-y-6">

      {/* Validation errors banner */}
      {validationErrors.length > 0 && (
        <div className="rounded-md border border-destructive bg-destructive/10 p-4">
          <p className="mb-2 font-medium text-destructive">
            {t('form.validationErrorsTitle')}
          </p>
          <ul className="list-inside list-disc space-y-1 text-sm text-destructive">
            {validationErrors.map((error, idx) => (
              <li key={idx}>
                <span className="font-semibold">{error.field}:</span>{' '}
                {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v as typeof tab);
          setValidationErrors([]);
        }}
      >
        <TabsList>
          <TabsTrigger value="content">
            {t('editor.tabs.content')}
          </TabsTrigger>
          <TabsTrigger value="structure">
            {t('editor.tabs.structure')}
          </TabsTrigger>
          <TabsTrigger value="media">
            {t('editor.tabs.media')}
          </TabsTrigger>
        </TabsList>

        {/* ── Content ── */}
        <TabsContent value="content">
          <ContentTab
            storeId={storeId}
            availableLocales={product.availableLocales}
            content={content}
            tags={tags}
            onContentChange={(next) => {
              setContent(next);
              setContentDirty(true);
            }}
            onTagsChange={(next) => {
              setTags(next);
              setTagsDirty(true);
            }}
          />
        </TabsContent>

        {/* ── Structure ── */}
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

        {/* ── Media ── */}
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

      {/* Unsaved changes bar */}
      {isDirty && (
        <div className="sticky bottom-4 z-10 rounded-md border bg-background p-3 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {t('variantEditor.unsavedChanges')}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleDiscard}>
                {t('discard')}
              </Button>
              <Button
                onClick={handleSaveCurrentTab}
                disabled={isEditorSaveBlocked({
                  isDirty,
                  isDiscarding,
                  isPending: isSavePending,
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
