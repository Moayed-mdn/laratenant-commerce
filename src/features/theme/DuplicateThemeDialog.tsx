'use client';

/**
 * Duplicate theme dialog component.
 */

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useBootstrapStore } from '@/stores/bootstrapStore';
import { useDuplicateTheme } from '@/hooks/themes/useThemeMutations';
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
import { toast } from 'sonner';
import type { ThemeListItemView } from '@/types/theme';
import { getStoreRouteParam } from '@/lib/stores/route-param';
import { getThemeRouteParam } from '@/lib/themes/route-param';

interface DuplicateThemeDialogProps {
  theme: ThemeListItemView;
  onClose: () => void;
}

export function DuplicateThemeDialog({
  theme,
  onClose,
}: DuplicateThemeDialogProps) {
  const t = useTranslations();
  const activeStore = useBootstrapStore((state) => state.activeStore);
  const [name, setName] = useState(`${theme.name} (Copy)`);

  const activeStoreSlug = activeStore ? getStoreRouteParam(activeStore) : null;

  const duplicateMutation = useDuplicateTheme(activeStoreSlug!);

  const handleDuplicate = async () => {
    if (!name.trim()) {
      toast.error(t('theme.nameRequired'));
      return;
    }

    try {
      await duplicateMutation.mutateAsync({
        themeSlug: getThemeRouteParam(theme),
        payload: { name: name.trim() },
      });

      toast.success(t('theme.duplicateSuccess'));
      onClose();
    } catch (error: any) {
      toast.error(error?.message ?? t('theme.duplicateError'));
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('theme.duplicateTheme')}</DialogTitle>
          <DialogDescription>
            {t('theme.duplicateDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Original Theme */}
          <div className="rounded-lg border p-3 bg-muted/50">
            <p className="text-sm font-medium">{t('theme.original')}</p>
            <p className="text-sm text-muted-foreground">{theme.name}</p>
          </div>

          {/* New Theme Name */}
          <div className="space-y-2">
            <Label htmlFor="duplicate-name">{t('theme.newName')}</Label>
            <Input
              id="duplicate-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('theme.namePlaceholder')}
              autoFocus
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleDuplicate}
            disabled={!name.trim() || duplicateMutation.isPending}
          >
            {duplicateMutation.isPending
              ? t('common.duplicating')
              : t('theme.duplicate')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
