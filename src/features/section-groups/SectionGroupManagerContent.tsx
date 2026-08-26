'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useBootstrapStore } from '@/stores/bootstrapStore';
import { useSectionGroups } from '@/hooks/section-groups/useSectionGroups';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, Layers, ArrowLeft, Settings } from 'lucide-react';
import { ROUTES } from '@/config/routes';
import { getStoreRouteParam } from '@/lib/stores/route-param';

export function SectionGroupManagerContent() {
  const router = useRouter();
  const params = useParams();
  const t = useTranslations('sectionGroups.manager');
  const themeIdentifier = params?.theme as string;
  const activeStore = useBootstrapStore((state) => state.activeStore);
  const activeStoreSlug = activeStore ? getStoreRouteParam(activeStore) : null;

  const { data: groups, isLoading, error } = useSectionGroups(activeStoreSlug!, themeIdentifier);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push(ROUTES.merchant.theme.settings(themeIdentifier))}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('title')}
          </h1>
          <p className="text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('cardTitle')}</CardTitle>
          <CardDescription>
            {t('cardDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoadingErrorState
            isLoading={isLoading}
            error={error?.message ?? null}
            isEmpty={!groups || groups.length === 0}
          >
            <div className="grid gap-3">
              {groups?.map((group) => {
                const sectionKeys = group.order ?? Object.keys(group.sections ?? {});
                return (
                  <div
                    key={group.id}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent cursor-pointer transition-colors"
                    onClick={() =>
                      router.push(
                        ROUTES.merchant.theme.sectionGroups.edit(themeIdentifier, group.id.toString()),
                      )
                    }
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Layers className="h-5 w-5 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{group.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {group.handle}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline">
                        {t('sectionsCount', { count: sectionKeys.length })}
                      </Badge>
                      <Button variant="ghost" size="icon">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </LoadingErrorState>
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingErrorState({
  isLoading,
  error,
  isEmpty,
  children,
}: {
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
  children: React.ReactNode;
}) {
  const t = useTranslations('sectionGroups.manager');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] gap-2">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-destructive font-medium">{t('loadError')}</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] gap-2">
        <Layers className="h-8 w-8 text-muted-foreground" />
        <p className="text-muted-foreground font-medium">{t('empty.title')}</p>
        <p className="text-sm text-muted-foreground">
          {t('empty.description')}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
