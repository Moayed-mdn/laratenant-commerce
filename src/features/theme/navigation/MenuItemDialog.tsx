'use client';

/**
 * Menu Item Dialog Component.
 * Modal for creating or editing a menu item with multilingual support.
 */

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  useCreateMenuItem,
  useUpdateMenuItem,
} from '@/hooks/navigation/useNavigationMenuMutations';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { serializeNavigationLabel } from '@/lib/mappers/navigation';
import { useValidateNavigationUrl, useNavigationPages } from '@/hooks/navigation/useNavigationResources';
import ResourcePicker from './ResourcePicker';
import type {
  LocalizedNavigationLabel,
  NavigationMenuItemView,
  CreateMenuItemPayload,
  UpdateMenuItemPayload
} from '@/types/navigation';

const DEFAULT_MENU_ITEM_TYPE: CreateMenuItemPayload['type'] = 'link';

interface MenuItemFormValues {
  parent_id: number | null;
  label: LocalizedNavigationLabel;
  type: CreateMenuItemPayload['type'];
  url: string;
  resource_id?: number | null;
  resource_type?: string | null;
  target: '_self' | '_blank';
  settings?: Record<string, unknown> | null;
  position: number;
  is_active: boolean;
}

const EMPTY_LABEL: LocalizedNavigationLabel = { en: '', ar: '' };

interface Props {
  storeSlug: string;
  menuId: string;
  item?: NavigationMenuItemView; // If provided, edit mode
  parentId?: number | null; // For creating child items
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MenuItemDialog({
  storeSlug,
  menuId,
  item,
  parentId,
  open,
  onOpenChange,
}: Props) {
  const t = useTranslations('theme.navigation.itemDialog');
  const isEditMode = !!item;

  const createMutation = useCreateMenuItem(storeSlug, menuId);
  const updateMutation = item
    ? useUpdateMenuItem(storeSlug, menuId, String(item.id))
    : null;

  const [formData, setFormData] = useState<MenuItemFormValues>({
    parent_id: parentId || null,
    label: EMPTY_LABEL,
    type: DEFAULT_MENU_ITEM_TYPE,
    url: '',
    target: '_self',
    position: 0,
    is_active: true,
  });
  // Validate URL for custom links (debounced)
  const shouldValidateUrl = formData.url.length > 1 && 
                            !formData.url.startsWith('http') && (
                              formData.type === 'link' ||
                              formData.type === 'custom'
                            );
  
  const { data: pages } = useNavigationPages(storeSlug);
  const hasPages = pages && pages.length > 0;

  const { data: urlValidation } = useValidateNavigationUrl(
    storeSlug,
    formData.url,
    shouldValidateUrl
  );

  // Initialize form data when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        parent_id: item.parentId,
        label: item.label,
        type: item.type,
        url: item.url ?? '',
        target: item.target,
        position: item.position,
        resource_id: item.resourceId != null ? Number(item.resourceId) : null,
        resource_type: item.resourceType ?? null,
        settings: item.settings ?? null,
        is_active: item.isActive,
      });
    } else {
      setFormData({
        parent_id: parentId || null,
        label: EMPTY_LABEL,
        type: DEFAULT_MENU_ITEM_TYPE,
        url: '',
        target: '_self',
        position: 0,
        is_active: true,
      });
    }
  }, [item, parentId, open]);

  const buildPayload = (): CreateMenuItemPayload | UpdateMenuItemPayload => ({
    parent_id: formData.parent_id,
    label: serializeNavigationLabel(formData.label),
    type: formData.type,
    url: formData.url,
    resource_id: formData.resource_id,
    resource_type: formData.resource_type,
    target: formData.target,
    settings: formData.settings || {},
    position: formData.position,
    is_active: formData.is_active,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = buildPayload();

    if (isEditMode && updateMutation) {
      updateMutation.mutate(payload as UpdateMenuItemPayload, {
        onSuccess: () => {
          toast.success(t('updateSuccess'));
          onOpenChange(false);
        },
        onError: (err: any) => {
          logger.error('Failed to update menu item', { error: err });
          toast.error(err?.message ?? t('updateError'));
        },
      });
    } else {
      createMutation.mutate(payload as CreateMenuItemPayload, {
        onSuccess: () => {
          toast.success(t('createSuccess'));
          onOpenChange(false);
        },
        onError: (err: any) => {
          logger.error('Failed to create menu item', { error: err });
          toast.error(err?.message ?? t('createError'));
        },
      });
    }
  };

  const isPending = isEditMode ? updateMutation?.isPending : createMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-3 max-h-[80vh] overflow-y-auto overflow-x-hidden">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? t('editTitle') : t('createTitle')}
            </DialogTitle>
            <DialogDescription>
              {isEditMode ? t('editDescription') : t('createDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="py-1">
            <div className="space-y-2">
              <Label>{t('form.label')}</Label>

              <div className="space-y-2">
                <Label htmlFor="label-en" className="text-sm text-muted-foreground">
                  {t('form.labelEn')}
                </Label>
                <Input
                  id="label-en"
                  value={formData.label.en}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      label: { ...formData.label, en: e.target.value },
                    })
                  }
                  placeholder={t('form.labelEnPlaceholder')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="label-ar" className="text-sm text-muted-foreground">
                  {t('form.labelAr')}
                </Label>
                <Input
                  id="label-ar"
                  value={formData.label.ar}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      label: { ...formData.label, ar: e.target.value },
                    })
                  }
                  placeholder={t('form.labelArPlaceholder')}
                  dir="rtl"
                  required
                />
              </div>
            </div>

            <Separator />

            {/* Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="type">{t('form.type')}</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => {
                  if (!value) return;
                  setFormData({ 
                    ...formData, 
                    type: value as CreateMenuItemPayload['type'],
                    // Clear URL and resource when switching types
                    url: value === 'group' ? '' : formData.url,
                    resource_id: null,
                    resource_type: null,
                  });
                }}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="page">{t('form.typePage')}</SelectItem>
                  <SelectItem value="category">{t('form.typeCategory')}</SelectItem>
                  <SelectItem value="product">{t('form.typeProduct')}</SelectItem>
                  <SelectItem value="link">{t('form.typeLink')}</SelectItem>
                  <SelectItem value="group">{t('form.typeGroup')}</SelectItem>
                  <SelectItem value="external">{t('form.typeExternal')}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {formData.type === 'group' 
                  ? t('form.typeGroupHelp')
                  : formData.type === 'page'
                  ? t('form.typePageHelp')
                  : formData.type === 'category'
                  ? t('form.typeCategoryHelp')
                  : formData.type === 'product'
                  ? t('form.typeProductHelp')
                  : formData.type === 'link'
                  ? t('form.typeLinkHelp')
                  : t('form.typeHelp')
                }
              </p>
            </div>

            <Separator />

            {/* Resource Picker for page, category, product */}
            {(formData.type === 'page' || formData.type === 'category' || formData.type === 'product') && (
              <div className="space-y-2">
                <Label>{t('form.selectResource', { type: t(`form.type${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}`) })}</Label>
                <ResourcePicker
                  storeSlug={storeSlug}
                  type={formData.type as 'page' | 'category' | 'product'}
                  selectedId={formData.resource_id || null}
                  onSelect={(resource) => {
                    setFormData({
                      ...formData,
                      resource_id: resource.id,
                      resource_type: resource.resourceType,
                      url: resource.url,
                      // Auto-populate label if empty
                      label: formData.label.en === '' && formData.label.ar === ''
                        ? resource.label
                        : formData.label,
                    });
                  }}
                />
              </div>
            )}

            {/* Page Picker + custom URL for 'link' type */}
            {formData.type === 'link' && (
              <div className="space-y-4">
                {hasPages ? (
                  <>
                    {/* Primary Option: Page Selector */}
                    <div className="space-y-2">
                      <Label>{t('form.selectPage')}</Label>
                      <ResourcePicker
                        storeSlug={storeSlug}
                        type="page"
                        selectedId={formData.resource_id || null}
                        onSelect={(resource) => {
                          setFormData({
                            ...formData,
                            resource_id: resource.id,
                            resource_type: resource.resourceType,
                            url: resource.url,
                            label: formData.label.en === '' && formData.label.ar === ''
                              ? resource.label
                              : formData.label,
                          });
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        {t('form.typePageHelp')}
                      </p>
                    </div>

                    {/* Divider with "OR" */}
                    <div className="relative">
                      <Separator />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="bg-background px-2 text-xs text-muted-foreground">
                          {t('form.or')}
                        </span>
                      </div>
                    </div>

                    {/* Secondary Option: Custom URL */}
                    <div className="space-y-2">
                      <Label htmlFor="url">{t('form.customUrl')}</Label>
                      <Input
                        id="url"
                        value={formData.url}
                        onChange={(e) => {
                          setFormData({ ...formData, url: e.target.value, resource_id: null, resource_type: null });
                        }}
                        placeholder={t('form.customUrlPlaceholder')}
                        className={urlValidation && !urlValidation.exists ? 'border-warning' : ''}
                      />
                      <p className="text-xs text-muted-foreground">{t('form.customUrlHelp')}</p>

                      {/* URL Validation Feedback */}
                      {urlValidation && !urlValidation.exists && formData.url.length > 1 && (
                        <div className="rounded-lg border border-warning/30 bg-warning-bg p-3">
                          <div className="flex items-start gap-2">
                            <span className="text-lg">⚠️</span>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-warning">
                                {t('form.urlWarningTitle')}
                              </p>
                              <p className="text-xs text-warning mt-1">
                                {t('form.urlWarningMessage')}
                              </p>
                              {urlValidation.suggestion && (
                                <p className="text-xs text-warning mt-2">
                                  💡 {t('form.createPageSuggestion', { slug: urlValidation.suggestion })}
                                </p>
                              )}
                              <div className="mt-3 flex gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="text-xs"
                                  onClick={() => {
                                    window.open(`/merchant/cms/pages/create?slug=${encodeURIComponent(formData.url)}`, '_blank');
                                  }}
                                >
                                  🆕 {t('form.createPage')}
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="text-xs"
                                  onClick={() => {
                                    setFormData({ ...formData, url: '', resource_id: null, resource_type: null });
                                  }}
                                >
                                  ↑ {t('form.selectFromAbove')}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {urlValidation && urlValidation.exists && (
                        <div className="flex items-center gap-2 text-xs text-success">
                          <span>✅</span>
                          <span>{t('form.urlExists')}</span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  /* No pages exist - show simplified custom URL input */
                  <div className="space-y-2">
                    <Label htmlFor="url">{t('form.url')}</Label>
                    <Input
                      id="url"
                      value={formData.url}
                      onChange={(e) => {
                        setFormData({ ...formData, url: e.target.value });
                      }}
                      placeholder={t('form.urlPlaceholder')}
                      className={urlValidation && !urlValidation.exists ? 'border-warning' : ''}
                    />
                    <p className="text-xs text-muted-foreground">{t('form.urlHelp')}</p>

                    {/* No pages info box */}
                    <div className="rounded-lg border border-info/30 bg-info-bg p-3">
                      <p className="text-sm text-info">
                        💡 {t('form.noPagesInfo')}
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="mt-2 text-xs"
                        onClick={() => {
                          window.open('/merchant/cms/pages/create', '_blank');
                        }}
                      >
                        {t('form.createFirstPage')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Manual URL for 'custom' (legacy) and 'external' types */}
            {(formData.type === 'custom' || formData.type === 'external') && (
              <div className="space-y-2">
                <Label htmlFor="url">{t('form.url')}</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder={formData.type === 'external' ? 'https://example.com' : '/custom-page'}
                  required={formData.type === 'external'}
                />
                <p className="text-xs text-muted-foreground">{t('form.urlHelp')}</p>
              </div>
            )}

            {/* Info for group type */}
            {formData.type === 'group' && (
              <div className="rounded-lg border border-info/30 bg-info-bg p-3">
                <p className="text-sm text-info">
                  ℹ️ {t('form.groupInfo')}
                </p>
              </div>
            )}

            {/* Target */}
            <div className="space-y-2">
              <Label htmlFor="target">{t('form.target')}</Label>
              <Select
                value={formData.target}
                onValueChange={(value) => {
                  if (!value) return;
                  setFormData({ ...formData, target: value });
                }}
              >
                <SelectTrigger id="target">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_self">{t('form.targetSelf')}</SelectItem>
                  <SelectItem value="_blank">{t('form.targetBlank')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Position */}
            <div className="space-y-2">
              <Label htmlFor="position">{t('form.position')}</Label>
              <Input
                id="position"
                type="number"
                value={formData.position}
                onChange={(e) =>
                  setFormData({ ...formData, position: parseInt(e.target.value) || 0 })
                }
                min="0"
              />
              <p className="text-xs text-muted-foreground">{t('form.positionHelp')}</p>
            </div>

            {/* Enabled */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="h-4 w-4"
              />
              <Label htmlFor="is_active" className="font-normal">
                {t('form.enabled')}
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {t('form.cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? isEditMode
                  ? t('form.updating')
                  : t('form.creating')
                : isEditMode
                ? t('form.update')
                : t('form.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
