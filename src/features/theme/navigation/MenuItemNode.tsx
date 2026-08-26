'use client';

/**
 * Menu Item Node Component.
 * Displays a single menu item with nested children.
 */

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Plus, ChevronRight, ChevronDown, AlertTriangle } from 'lucide-react';
import { useDeleteMenuItem } from '@/hooks/navigation/useNavigationMenuMutations';
import { useValidateNavigationUrl } from '@/hooks/navigation/useNavigationResources';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { cn } from '@/lib/utils';
import MenuItemDialog from './MenuItemDialog';
import type { NavigationMenuItemView } from '@/types/navigation';

interface Props {
  item: NavigationMenuItemView;
  storeSlug: string;
  menuId: string;
  onAddChild: (parentId: number) => void;
  level?: number;
}

export default function MenuItemNode({
  item,
  storeSlug,
  menuId,
  onAddChild,
  level = 0,
}: Props) {
  const locale = useLocale();
  const t = useTranslations('theme.navigation.items');
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const deleteMutation = useDeleteMenuItem(storeSlug, menuId);

  const hasChildren = item.children && item.children.length > 0;
  const isGroup = item.type === 'group';
  const isResourceLinked = ['page', 'category', 'product'].includes(item.type);
  const label = locale === 'ar'
    ? item.label.ar || item.label.en
    : item.label.en || item.label.ar;

  // Validate URL for custom links and non-resource types
  const shouldValidate = (item.type === 'link' || item.type === 'custom') && 
                         item.url && 
                         !item.url.startsWith('http');
  
  const { data: urlValidation } = useValidateNavigationUrl(
    storeSlug,
    item.url,
    !!shouldValidate
  );
  
  const isBroken = shouldValidate && urlValidation && !urlValidation.exists;

  // Get resource type icon
  const getResourceIcon = () => {
    if (isGroup) return '📁';
    if (item.type === 'page') return '📄';
    if (item.type === 'category') return '🏷️';
    if (item.type === 'product') return '📦';
    if (item.type === 'external') return '🔗';
    return '🔘';
  };

  const handleDelete = () => {
    if (confirm(t('deleteConfirm'))) {
      deleteMutation.mutate(String(item.id), {
        onSuccess: () => {
          toast.success(t('deleteSuccess'));
        },
        onError: (err: any) => {
          logger.error('Failed to delete menu item', { error: err });
          toast.error(err?.message ?? t('deleteError'));
        },
      });
    }
  };

  return (
    <div className="space-y-2">
      {/* Item Row */}
      <div
        className={cn(
          'flex items-center gap-2 rounded-lg border p-3',
          !item.isActive && 'opacity-50',
          isBroken && 'border-warning/40 bg-warning-bg'
        )}
        style={{ marginLeft: `${level * 24}px` }}
      >
        {/* Expand/Collapse */}
        {hasChildren && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        )}

        {/* Label */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={cn("font-medium", isGroup && "text-info")}>
              {getResourceIcon()} {label}
            </span>
            {isBroken && (
              <Badge variant="destructive" className="text-xs bg-warning/20 text-warning">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {t('broken')}
              </Badge>
            )}
            {isGroup && (
              <Badge variant="secondary" className="text-xs bg-info-bg text-info">
                {t('group')}
              </Badge>
            )}
            {isResourceLinked && (
              <Badge variant="outline" className="text-xs">
                {item.type}
              </Badge>
            )}
            {!item.isActive && (
              <Badge variant="secondary" className="text-xs">
                {t('disabled')}
              </Badge>
            )}
            {item.target === '_blank' && (
              <Badge variant="outline" className="text-xs">
                {t('newTab')}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {isGroup 
              ? t('groupDescription', { count: item.children?.length || 0 })
              : isResourceLinked
              ? `Linked: ${item.url}`
              : item.url
            }
          </p>
          {isBroken && (
            <p className="text-xs text-warning mt-1">
              ⚠️ {t('brokenLinkWarning')}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddChild(item.id)}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="space-y-2">
          {item.children!.map((child) => (
            <MenuItemNode
              key={child.id}
              item={child}
              storeSlug={storeSlug}
              menuId={menuId}
              onAddChild={onAddChild}
              level={level + 1}
            />
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <MenuItemDialog
        storeSlug={storeSlug}
        menuId={menuId}
        item={item}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </div>
  );
}
