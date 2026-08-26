'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useUpdateBlock } from '@/hooks/blocks/useBlockMutations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ImageUrlOrUpload } from '@/components/media/ImageUrlOrUpload';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';
import type { ThemeBlock } from '@/types/theme';

interface BlockSettingsDialogProps {
  block: ThemeBlock | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeSlug: string;
  themeIdentifier: string;
  sectionId: number;
}

export function BlockSettingsDialog({
  block,
  open,
  onOpenChange,
  storeSlug,
  themeIdentifier,
  sectionId,
}: BlockSettingsDialogProps) {
  const t = useTranslations();
  const updateMutation = useUpdateBlock(storeSlug, themeIdentifier, sectionId.toString());

  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [content, setContent] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (block) {
      setSettings({ ...block.settings });
      setContent(block.content ? { ...block.content } : {});
    }
  }, [block?.id]);

  if (!block) return null;

  const updateSetting = (key: string, value: unknown) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const updateContent = (key: string, value: unknown) => {
    setContent((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      const payload: { settings?: Record<string, unknown>; content?: Record<string, unknown> } = {};
      if (Object.keys(settings).length > 0) payload.settings = settings;
      if (Object.keys(content).length > 0) payload.content = content;

      await updateMutation.mutateAsync({
        blockId: block.id.toString(),
        payload,
      });

      toast.success(t('systemTemplates.blockSettings.updateSuccess'));
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.message ?? t('systemTemplates.blockSettings.updateError'));
    }
  };

  const IMAGE_URL_KEYS = new Set(['src', 'url', 'image_url', 'logo_url', 'background_url', 'avatar_url', 'thumbnail_url']);

  const settingKeys = Object.keys(settings);
  const contentKeys = Object.keys(content);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{block.name}</DialogTitle>
          <DialogDescription>
            {t('systemTemplates.blockSettings.typeAndPosition', { type: block.type, position: block.position })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {settingKeys.length === 0 && contentKeys.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t('systemTemplates.blockSettings.noSettings')}
            </p>
          )}

          {settingKeys.map((key) => {
            const value = settings[key];
            const label = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
            const isImageUrl = IMAGE_URL_KEYS.has(key) && typeof value === 'string';

            if (isImageUrl) {
              return (
                <ImageUrlOrUpload
                  key={key}
                  value={value}
                  onChange={(v) => updateSetting(key, v)}
                  storeSlug={storeSlug}
                  context="cms"
                  label={label}
                />
              );
            }

            return (
              <div key={key} className="space-y-2">
                <Label htmlFor={`setting-${key}`}>{label}</Label>
                {typeof value === 'boolean' ? (
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`setting-${key}`}
                      checked={value}
                      onCheckedChange={(checked) => updateSetting(key, checked)}
                    />
                    <span className="text-sm text-muted-foreground">{value ? t('systemTemplates.blockSettings.enabled') : t('systemTemplates.blockSettings.disabled')}</span>
                  </div>
                ) : typeof value === 'number' ? (
                  <Input
                    id={`setting-${key}`}
                    type="number"
                    value={String(value)}
                    onChange={(e) => updateSetting(key, Number(e.target.value))}
                  />
                ) : key === 'html' && typeof value === 'string' && value.length > 50 ? (
                  <Textarea
                    id={`setting-${key}`}
                    value={String(value)}
                    onChange={(e) => updateSetting(key, e.target.value)}
                    rows={6}
                    className="font-mono text-xs"
                  />
                ) : key === 'text' && typeof value === 'string' ? (
                  <Textarea
                    id={`setting-${key}`}
                    value={String(value)}
                    onChange={(e) => updateSetting(key, e.target.value)}
                    rows={3}
                  />
                ) : Array.isArray(value) ? (
                  <div>
                    <Textarea
                      id={`setting-${key}`}
                      value={JSON.stringify(value, null, 2)}
                      onChange={(e) => {
                        try {
                          updateSetting(key, JSON.parse(e.target.value));
                        } catch {
                          updateSetting(key, e.target.value);
                        }
                      }}
                      rows={3}
                      className="font-mono text-xs"
                    />
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Info className="h-3 w-3" />
                      {t('systemTemplates.blockSettings.jsonArray')}
                    </p>
                  </div>
                ) : (
                  <Input
                    id={`setting-${key}`}
                    value={String(value ?? '')}
                    onChange={(e) => updateSetting(key, e.target.value)}
                  />
                )}
              </div>
            );
          })}

          {contentKeys.map((key) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={`content-${key}`}>
                {key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </Label>
              <Textarea
                id={`content-${key}`}
                value={String(content[key] ?? '')}
                onChange={(e) => updateContent(key, e.target.value)}
                rows={4}
              />
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
