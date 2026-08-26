'use client';

/**
 * Assets page content (client component).
 * Displays asset library with grid view and upload functionality.
 */

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAssets } from '@/hooks/assets/useAssets';
import { useBootstrapStore } from '@/stores/bootstrapStore';
import { AssetGrid } from './AssetGrid';
import { AssetUploader } from './AssetUploader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination } from '@/components/shared/Pagination';
import { ImageIcon, Upload } from 'lucide-react';
import type { AssetType, AssetFilters } from '@/types/asset';
import { getStoreRouteParam } from '@/lib/stores/route-param';

export function AssetsContent() {
  const t = useTranslations();
  const activeStore = useBootstrapStore((state) => state.activeStore);
  const activeStoreSlug = activeStore ? getStoreRouteParam(activeStore) : null;
  const [showUploader, setShowUploader] = useState(false);
  const [filters, setFilters] = useState<AssetFilters>({
    page: 1,
    perPage: 24,
    asset_type: 'all',
  });

  const { data, isLoading, error } = useAssets(activeStoreSlug!, filters);

  const handleTypeChange = (type: string) => {
    setFilters((prev) => ({
      ...prev,
      page: 1,
      asset_type: type as AssetType | 'all',
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('common.assets')}
          </h1>
          <p className="text-muted-foreground">
            {t('theme.assets.description')}
          </p>
        </div>
        <Button onClick={() => setShowUploader(true)}>
          <Upload className="mr-2 h-4 w-4" />
          {t('theme.assets.uploadAsset')}
        </Button>
      </div>

      {/* Uploader Modal */}
      {showUploader && (
        <AssetUploader
          onClose={() => setShowUploader(false)}
          onSuccess={() => {
            setShowUploader(false);
          }}
        />
      )}

      {/* Filters & Content */}
      <Card>
        <CardHeader>
          <CardTitle>{t('theme.assets.library')}</CardTitle>
          <CardDescription>{t('theme.assets.libraryDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={filters.asset_type || 'all'}
            onValueChange={handleTypeChange}
          >
            <TabsList className="mb-6">
              <TabsTrigger value="all">{t('theme.assets.all')}</TabsTrigger>
              <TabsTrigger value="logo">{t('theme.assets.logo')}</TabsTrigger>
              <TabsTrigger value="favicon">{t('theme.assets.favicon')}</TabsTrigger>
              <TabsTrigger value="banner">{t('theme.assets.banner')}</TabsTrigger>
              <TabsTrigger value="other">{t('theme.assets.other')}</TabsTrigger>
            </TabsList>

            <TabsContent value={filters.asset_type || 'all'} className="mt-0">
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-muted-foreground">
                    {t('common.loading')}
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-destructive">
                    {t('common.error')}: {error.message}
                  </div>
                </div>
              )}

              {data && data.data.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                  <ImageIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    {t('theme.assets.noAssets')}
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setShowUploader(true)}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {t('theme.assets.uploadFirstAsset')}
                  </Button>
                </div>
              )}

              {data && data.data.length > 0 && (
                <>
                  <AssetGrid assets={data.data} />

                  {data.meta.pagination.total_pages > 1 && (
                    <div className="mt-6">
                      <Pagination
                        currentPage={data.meta.pagination.current_page}
                        totalPages={data.meta.pagination.total_pages}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
