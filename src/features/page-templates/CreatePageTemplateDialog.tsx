'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useBootstrapStore } from '@/stores/bootstrapStore';
import { useCreatePageTemplate } from '@/hooks/page-templates/usePageTemplateMutations';
import { useSectionSchemas } from '@/hooks/section-schemas/useSectionSchemas';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { getStoreRouteParam } from '@/lib/stores/route-param';
import type { ApiError } from '@/types/api';
import type { SectionSchema, PageTemplateSection } from '@/types/theme';

const TEMPLATE_TYPE_OPTION_KEYS = [
  'page', 'product', 'collection', 'article', 'blog', 'cart',
] as const;

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function buildSectionDefaults(schema: SectionSchema): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};

  for (const setting of schema.settings) {
    if (setting.default !== undefined) {
      defaults[setting.id] = setting.default;
    }
  }

  return defaults;
}

interface CreatePageTemplateDialogProps {
  onClose: () => void;
}

export function CreatePageTemplateDialog({ onClose }: CreatePageTemplateDialogProps) {
  const t = useTranslations();
  const activeStore = useBootstrapStore((state) => state.activeStore);
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<string>('page');
  const [sectionType, setSectionType] = useState('');
  const [sectionIdentifier, setSectionIdentifier] = useState('');

  const activeStoreSlug = activeStore ? getStoreRouteParam(activeStore) : null;

  const createMutation = useCreatePageTemplate(activeStoreSlug!);
  const { data: schemas = [], isLoading: schemasLoading } = useSectionSchemas(activeStoreSlug!);

  const resolvedSectionType = sectionType || schemas[0]?.type || '';

  const handleNameChange = (value: string) => {
    setName(value);
    setHandle((current) => (current ? current : slugify(value)));
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error(t('theme.templates.nameRequired'));
      return;
    }

    const normalizedHandle = slugify(handle || name);
    if (!normalizedHandle) {
      toast.error(t('theme.templates.handleRequired'));
      return;
    }

    const selectedSchema = schemas.find((schema) => schema.type === resolvedSectionType);
    if (!selectedSchema) {
      toast.error(t('theme.templates.initialSectionTypeRequired'));
      return;
    }

    const identifier = slugify(sectionIdentifier) || `${selectedSchema.type}-${Date.now()}`;
    const sections: Record<string, PageTemplateSection> = {
      [identifier]: {
        type: selectedSchema.type,
        settings: buildSectionDefaults(selectedSchema),
      },
    };

    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        handle: normalizedHandle,
        type,
        description: description.trim() || null,
        sections,
        section_order: [identifier],
      });

      toast.success(t('theme.templates.createSuccess'));
      onClose();
    } catch (error) {
      toast.error((error as ApiError).message ?? t('theme.templates.createError'));
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-hidden sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('theme.templates.createTemplate')}</DialogTitle>
          <DialogDescription>
            {t('theme.templates.createDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[calc(90vh-10rem)] space-y-4 overflow-y-auto py-4 pr-1">
          <div className="space-y-2">
            <Label htmlFor="template-name">{t('theme.templates.name')}</Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder={t('theme.templates.namePlaceholder')}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-handle">{t('theme.templates.handle')}</Label>
            <Input
              id="template-handle"
              value={handle}
              onChange={(e) => setHandle(slugify(e.target.value))}
              placeholder={t('theme.templates.handlePlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-type">{t('theme.templates.type')}</Label>
            <Select value={type} onValueChange={(value) => value !== null && setType(value)}>
              <SelectTrigger id="template-type">
                <SelectValue placeholder={t('theme.templates.typePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATE_TYPE_OPTION_KEYS.map((optionKey) => (
                  <SelectItem key={optionKey} value={optionKey}>
                    {t(`theme.templates.typeOptions.${optionKey}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-description">{t('theme.templates.description')}</Label>
            <Textarea
              id="template-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('theme.templates.descriptionPlaceholder')}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="initial-section-type">{t('theme.templates.initialSectionType')}</Label>
            <Select
              value={resolvedSectionType}
              onValueChange={(value) => value !== null && setSectionType(value)}
              disabled={schemasLoading || schemas.length === 0}
            >
              <SelectTrigger id="initial-section-type">
                <SelectValue placeholder={t('theme.templates.initialSectionTypePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {schemas.map((schema) => (
                  <SelectItem key={schema.type} value={schema.type}>
                    {schema.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="initial-section-identifier">{t('theme.templates.initialSectionIdentifier')}</Label>
            <Input
              id="initial-section-identifier"
              value={sectionIdentifier}
              onChange={(e) => setSectionIdentifier(e.target.value)}
              placeholder={t('theme.templates.initialSectionIdentifierPlaceholder')}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!name.trim() || schemasLoading || schemas.length === 0 || createMutation.isPending}
          >
            {createMutation.isPending ? t('theme.templates.creating') : t('theme.templates.createTemplate')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
