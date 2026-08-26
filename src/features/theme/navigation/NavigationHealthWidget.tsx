'use client';

/**
 * Navigation Health Widget
 * 
 * Shows broken links and provides quick-fix actions.
 * Displayed on the navigation editor page to help merchants
 * identify and fix broken navigation items.
 */

import { useTranslations } from 'next-intl';
import { AlertTriangle, ExternalLink, Edit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { NavigationMenuItemView } from '@/types/navigation';

interface Props {
  items: NavigationMenuItemView[];
  onEditItem: (itemId: number) => void;
  onCreatePage?: (url: string) => void;
}

export default function NavigationHealthWidget({ items, onEditItem, onCreatePage }: Props) {
  const t = useTranslations('theme.navigation.health');

  // Find all broken links (items with type 'link' or 'custom' that might not exist)
  const findBrokenLinks = (items: NavigationMenuItemView[]): NavigationMenuItemView[] => {
    const broken: NavigationMenuItemView[] = [];
    
    const check = (items: NavigationMenuItemView[]) => {
      items.forEach(item => {
        // Only check custom links (resource-linked items are always valid)
        if ((item.type === 'link' || item.type === 'custom') && item.url && !item.url.startsWith('http')) {
          // This is a potential broken link
          broken.push(item);
        }
        
        if (item.children) {
          check(item.children);
        }
      });
    };
    
    check(items);
    return broken;
  };

  const potentialBrokenLinks = findBrokenLinks(items);

  // If no potential issues, show success state
  if (potentialBrokenLinks.length === 0) {
    return (
      <Card className="border-success/30 bg-success-bg">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✅</span>
            <div>
              <CardTitle className="text-success">{t('allGood')}</CardTitle>
              <CardDescription className="text-success">
                {t('allGoodDescription')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-warning/30 bg-warning-bg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <div>
              <CardTitle className="text-warning">
                {t('title', { count: potentialBrokenLinks.length })}
              </CardTitle>
              <CardDescription className="text-warning">
                {t('description')}
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="bg-warning/20 text-warning">
            {potentialBrokenLinks.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {potentialBrokenLinks.slice(0, 5).map((item) => (
          <div
            key={item.id}
            className="rounded-lg border border-warning/30 bg-surface p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-warning">
                  {item.label.en || item.label.ar}
                </p>
                <p className="text-xs text-warning mt-0.5 font-mono truncate">
                  {item.url}
                </p>
              </div>
              <div className="flex gap-1">
                {onCreatePage && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    onClick={() => onCreatePage(item.url)}
                    title={t('createPage')}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => onEditItem(item.id)}
                  title={t('fixLink')}
                >
                  <Edit className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        
        {potentialBrokenLinks.length > 5 && (
          <p className="text-xs text-warning text-center pt-2">
            {t('andMore', { count: potentialBrokenLinks.length - 5 })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

