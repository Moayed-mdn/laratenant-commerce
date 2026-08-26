'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useBootstrapStore } from '@/stores/bootstrapStore';
import { useSectionGroups } from '@/hooks/section-groups/useSectionGroups';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Save, Loader2, AlertCircle,
  ChevronUp, ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { ROUTES } from '@/config/routes';
import { updateSectionGroup } from '@/lib/api/section-groups';
import { getStoreRouteParam } from '@/lib/stores/route-param';

export function SectionGroupEditContent() {
  const router = useRouter();
  const params = useParams();
  const t = useTranslations('sectionGroups.edit');
  const themeIdentifier = params?.theme as string;
  const groupId = params?.groupId as string;
  const activeStore = useBootstrapStore((state) => state.activeStore);
  const activeStoreSlug = activeStore ? getStoreRouteParam(activeStore) : null;

  const { data: groups, isLoading, isError } = useSectionGroups(activeStoreSlug!, themeIdentifier);
  const group = groups?.find((g) => g.id.toString() === groupId) ?? null;

  const [saving, setSaving] = useState(false);
  const [localSections, setLocalSections] = useState<Record<string, { type: string; settings: Record<string, unknown> }>>({});
  const [localOrder, setLocalOrder] = useState<string[]>([]);

  useEffect(() => {
    if (!group) return;
    setLocalSections(group.sections ?? {});
    setLocalOrder(group.order ?? []);
  }, [group]);

  const handleBack = useCallback(() => {
    router.push(ROUTES.merchant.theme.sectionGroups.list(themeIdentifier));
  }, [router, themeIdentifier]);

  const handleSave = useCallback(async () => {
    if (!activeStoreSlug || !group) return;
    setSaving(true);
    try {
      await updateSectionGroup(activeStoreSlug, themeIdentifier, groupId, {
        sections: localSections,
        order: localOrder,
      });
      toast.success(t('saveSuccess'));
    } catch (error: any) {
      toast.error(error?.message ?? t('saveError'));
    } finally {
      setSaving(false);
    }
  }, [activeStoreSlug, themeIdentifier, groupId, group, localSections, localOrder, t]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !group) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 gap-2">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-destructive font-medium">
          {isError ? t('errorLoading') : t('notFound')}
        </p>
        <Button variant="outline" size="sm" onClick={handleBack}>
          {t('goBack')}
        </Button>
      </div>
    );
  }

  const sectionEntries = localOrder
    .filter((key) => localSections[key])
    .map((key) => ({
      key,
      section: localSections[key],
    }));

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">{group.name}</h1>
            <p className="text-sm text-muted-foreground">
              {t('subtitle')}
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {t('save')}
        </Button>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {t('sectionsTitle')}
              <span className="text-muted-foreground ml-1">({sectionEntries.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sectionEntries.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t('noSections')}
              </p>
            )}
            <div className="space-y-2">
              {sectionEntries.map(({ key, section }, idx) => (
                <div
                  key={key}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <div className="flex flex-col gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      disabled={idx === 0}
                      onClick={() => {
                        const order = [...localOrder];
                        [order[idx - 1], order[idx]] = [order[idx], order[idx - 1]];
                        setLocalOrder(order);
                      }}
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      disabled={idx === sectionEntries.length - 1}
                      onClick={() => {
                        const order = [...localOrder];
                        [order[idx + 1], order[idx]] = [order[idx], order[idx + 1]];
                        setLocalOrder(order);
                      }}
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{section.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('settingsCount', { count: Object.keys(section.settings ?? {}).length })}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {t('position', { position: idx + 1 })}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
