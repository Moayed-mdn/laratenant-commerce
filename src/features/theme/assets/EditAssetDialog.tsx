'use client';

/**
 * Edit asset dialog component.
 * Allows updating asset metadata (alt text and type).
 */

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useBootstrapStore } from '@/stores/bootstrapStore';
import { useUpdateAsset } from '@/hooks/assets/useAssetMutations';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import type { StoreAssetView, AssetType } from '@/types/asset';
import { getStoreRouteParam } from '@/lib/stores/route-param';

interface EditAssetDialogProps {
  asset: StoreAssetView;
  onClose: () => void;
}

export function EditAssetDialog({ asset, onClose }: EditAssetDialogProps) {
  const t = useTranslations();
  const activeStore = useBootstrapStore((state) => state.activeStore);
  const activeStoreSlug = activeStore ? getStoreRouteParam(activeStore) : null;
  const [assetType, setAssetType] = useState<AssetType>(asset.assetType);
  const [altText, setAltText] = useState(asset.altText || '');

  const updateMutation = useUpdateAsset(activeStoreSlug!);

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        assetId: asset.id.toString(),
        payload: {
          asset_type: assetType,
          alt_text: altText || null,
        },
      });

      toast.success(t('theme.assets.updateSuccess'));
      onClose();
    } catch (error) {
      toast.error(t('theme.assets.updateError'));
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('theme.assets.editAsset')}</DialogTitle>
          <DialogDescription>{asset.fileName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Asset Type */}
          <div className="space-y-2">
            <Label htmlFor="edit-asset-type">{t('theme.assets.assetType')}</Label>
            <Select value={assetType} onValueChange={(v) => setAssetType(v as AssetType)}>
              <SelectTrigger id="edit-asset-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="logo">{t('theme.assets.logo')}</SelectItem>
                <SelectItem value="favicon">{t('theme.assets.favicon')}</SelectItem>
                <SelectItem value="banner">{t('theme.assets.banner')}</SelectItem>
                <SelectItem value="other">{t('theme.assets.other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Alt Text */}
          <div className="space-y-2">
            <Label htmlFor="edit-alt-text">{t('theme.assets.altText')}</Label>
            <Input
              id="edit-alt-text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder={t('theme.assets.altTextPlaceholder')}
            />
            <p className="text-xs text-muted-foreground">
              {t('theme.assets.altTextHelper')}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? t('common.saving') : t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
