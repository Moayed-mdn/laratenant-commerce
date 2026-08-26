'use client';

/**
 * Themes overview page content (client component).
 * Displays list of themes with publish/duplicate/delete actions.
 */

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/navigation';
import { useThemes } from '@/hooks/themes/useThemes';
import { useBootstrapStore } from '@/stores/bootstrapStore';
import { ThemeCard } from './ThemeCard';
import { CreateThemeDialog } from './CreateThemeDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pagination } from '@/components/shared/Pagination';
import { ROUTES } from '@/config/routes';
import { Plus } from 'lucide-react';
import type { ThemeFilters } from '@/types/theme';
import { getStoreRouteParam } from '@/lib/stores/route-param';

export function ThemesContent() {
  const t = useTranslations();
  const router = useRouter();
  const activeStore = useBootstrapStore((state) => state.activeStore);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [filters, setFilters] = useState<ThemeFilters>({
    page: 1,
    perPage: 12,
  });

  const activeStoreSlug = activeStore ? getStoreRouteParam(activeStore) : null;

  const { data, isLoading, error } = useThemes(activeStoreSlug!, filters);

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('theme.overview.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('theme.overview.subtitle')}
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('theme.createTheme')}
        </Button>
      </div>

      {/* Create Dialog */}
      {showCreateDialog && (
        <CreateThemeDialog onClose={() => setShowCreateDialog(false)} />
      )}

      {/* Themes Grid */}
      <Card>
        <CardHeader>
          <CardTitle>{t('theme.yourThemes')}</CardTitle>
          <CardDescription>
            {t('theme.themesDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
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
              <p className="text-muted-foreground mb-4">
                {t('theme.noThemes')}
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t('theme.createFirstTheme')}
              </Button>
            </div>
          )}

          {data && data.data.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.data.map((theme) => (
                  <ThemeCard key={theme.id} theme={theme} />
                ))}
              </div>

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
        </CardContent>
      </Card>
    </div>
  );
}
