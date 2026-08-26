'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useBootstrapStore } from '@/stores/bootstrapStore';
import { useSystemTemplates } from '@/hooks/system-templates/useSystemTemplates';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, AlertCircle, FileText, ArrowLeft, Search } from 'lucide-react';
import { ROUTES } from '@/config/routes';
import { getTemplateTypeLabel } from '@/types/theme';
import { getStoreRouteParam } from '@/lib/stores/route-param';

export function SystemTemplatesContent() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const themeIdentifier = params?.theme as string;
  const activeStore = useBootstrapStore((state) => state.activeStore);
  const activeStoreSlug = activeStore ? getStoreRouteParam(activeStore) : null;

  const { data: templates, isLoading, error } = useSystemTemplates(activeStoreSlug!, themeIdentifier);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return templates;
    const q = searchQuery.toLowerCase();
    return templates?.filter(t =>
      t.name.toLowerCase().includes(q) ||
      getTemplateTypeLabel(t.type).toLowerCase().includes(q)
    );
  }, [templates, searchQuery]);

  if (!activeStore) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">{t('systemTemplates.list.noActiveStore')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push(ROUTES.merchant.theme.settings(themeIdentifier))}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('systemTemplates.list.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('systemTemplates.list.subtitle')}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>{t('systemTemplates.list.cardTitle')}</CardTitle>
              <CardDescription>
                {t('systemTemplates.list.cardDescription')}
              </CardDescription>
            </div>
            <div className="relative w-64 shrink-0">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('systemTemplates.list.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <LoadingErrorState
            isLoading={isLoading}
            error={error?.message ?? null}
            isEmpty={!templates || templates.length === 0}
          >
            {filteredTemplates?.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[200px] gap-2">
                <Search className="h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground font-medium">{t('systemTemplates.list.noMatch')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('systemTemplates.list.tryDifferentSearch')}
                </p>
              </div>
            ) : (
            <div className="grid gap-3">
              {filteredTemplates?.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent cursor-pointer transition-colors"
                  onClick={() =>
                    router.push(
                      ROUTES.merchant.theme.systemTemplates.edit(themeIdentifier, template.id.toString())
                    )
                  }
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{template.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {getTemplateTypeLabel(template.type)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={template.type === 'home' ? 'default' : 'outline'}>
                      {t('systemTemplates.list.sectionsCount', { count: template.sections?.length ?? 0 })}
                    </Badge>
                    {template.isDefault && (
                      <Badge variant="secondary">{t('systemTemplates.list.default')}</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
            )}
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
  const t = useTranslations();

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
        <p className="text-destructive font-medium">{t('systemTemplates.list.loadError')}</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] gap-2">
        <FileText className="h-8 w-8 text-muted-foreground" />
        <p className="text-muted-foreground font-medium">{t('systemTemplates.list.empty')}</p>
        <p className="text-sm text-muted-foreground">
          {t('systemTemplates.list.emptyDescription')}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
