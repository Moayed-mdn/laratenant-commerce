'use client';

/**
 * Asset card component.
 * Displays single asset with thumbnail, actions, and metadata.
 */

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useBootstrapStore } from '@/stores/bootstrapStore';
import { useDeleteAsset, useUpdateAsset } from '@/hooks/assets/useAssetMutations';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreVertical, Trash2, Edit, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { EditAssetDialog } from './EditAssetDialog';
import type { StoreAssetView } from '@/types/asset';
import { getStoreRouteParam } from '@/lib/stores/route-param';

interface AssetCardProps {
  asset: StoreAssetView;
}

export function AssetCard({ asset }: AssetCardProps) {
  const t = useTranslations();
  const activeStore = useBootstrapStore((state) => state.activeStore);
  const activeStoreSlug = activeStore ? getStoreRouteParam(activeStore) : null;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const deleteMutation = useDeleteAsset(activeStoreSlug!);

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(asset.id.toString());
      toast.success(t('theme.assets.deleteSuccess'));
    } catch (error) {
      toast.error(t('theme.assets.deleteError'));
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(asset.fileUrl);
    toast.success(t('theme.assets.urlCopied'));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isImage = asset.mimeType.startsWith('image/');

  return (
    <>
      <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
        <CardContent className="p-0">
          {/* Image/Icon Preview */}
          <div className="relative aspect-square bg-muted">
            {isImage ? (
              <Image
                src={asset.fileUrl}
                alt={asset.altText || asset.fileName}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-4xl text-muted-foreground">📄</div>
              </div>
            )}

            {/* Actions Overlay */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    {t('common.edit')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopyUrl}>
                    <Copy className="mr-2 h-4 w-4" />
                    {t('theme.assets.copyUrl')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.open(asset.fileUrl, '_blank', 'noopener,noreferrer')}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {t('theme.assets.viewFull')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('common.delete')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Type Badge */}
            <div className="absolute bottom-2 left-2">
              <span className="inline-flex items-center rounded-full bg-background/80 backdrop-blur-sm px-2 py-1 text-xs font-medium">
                {t(`assets.${asset.assetType}`)}
              </span>
            </div>
          </div>

          {/* Metadata */}
          <div className="p-3 space-y-1">
            <p className="text-sm font-medium truncate" title={asset.fileName}>
              {asset.fileName}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(asset.fileSize)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('theme.assets.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('theme.assets.deleteConfirmation')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? t('common.deleting') : t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      {showEditDialog && (
        <EditAssetDialog
          asset={asset}
          onClose={() => setShowEditDialog(false)}
        />
      )}
    </>
  );
}
