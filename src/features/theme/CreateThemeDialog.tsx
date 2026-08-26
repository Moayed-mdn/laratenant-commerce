'use client';

/**
 * Create theme dialog component.
 */

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useBootstrapStore } from '@/stores/bootstrapStore';
import { useCreateTheme } from '@/hooks/themes/useThemeMutations';
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
import { toast } from 'sonner';
import { getStoreRouteParam } from '@/lib/stores/route-param';

interface CreateThemeDialogProps {
  onClose: () => void;
}

export function CreateThemeDialog({ onClose }: CreateThemeDialogProps) {
  const t = useTranslations();
  const activeStore = useBootstrapStore((state) => state.activeStore);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const activeStoreSlug = activeStore ? getStoreRouteParam(activeStore) : null;

  const createMutation = useCreateTheme(activeStoreSlug!);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error(t('theme.nameRequired'));
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        description: description.trim() || null,
      });

      toast.success(t('theme.createSuccess'));
      onClose();
    } catch (error: any) {
      toast.error(error?.message ?? t('theme.createError'));
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('theme.createTheme')}</DialogTitle>
          <DialogDescription>
            {t('theme.createDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Theme Name */}
          <div className="space-y-2">
            <Label htmlFor="theme-name">{t('theme.name')}</Label>
            <Input
              id="theme-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('theme.namePlaceholder')}
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="theme-description">
              {t('theme.description')}
            </Label>
            <Textarea
              id="theme-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('theme.descriptionPlaceholder')}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!name.trim() || createMutation.isPending}
          >
            {createMutation.isPending ? t('common.creating') : t('common.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
