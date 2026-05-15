'use client';

/**
 * Sidebar component.
 * Fixed-width navigation sidebar with collapse functionality.
 * 
 * Reason for 'use client': needs Zustand state for collapse/expand.
 */

import { useParams } from 'next/navigation';
import { useUiStore, selectSidebarCollapsed } from '@/stores/uiStore';
import { useAuthStore, selectUser } from '@/stores/authStore';
import { SidebarNav } from './SidebarNav';
import { Button } from '@/components/ui/button';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

/**
 * Main sidebar component with navigation and user info.
 */
export function Sidebar() {
  const params = useParams();
  const storeId = params.storeId as string | undefined;

  const isCollapsed = useUiStore(selectSidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const user = useAuthStore(selectUser);
  const t = useTranslations('nav');

  // Get user initials for avatar
  const getInitials = (name: string | null): string => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-200',
        'hidden md:flex',
        isCollapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Header section */}
      <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-3">
        {!isCollapsed && (
          <span className="text-sm font-semibold">{t('appName')}</span>
        )}
        {isCollapsed && (
          <span className="text-lg font-bold">{t('appName').charAt(0)}</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          type="button"
          aria-label={t('toggleSidebar')}
          onClick={toggleSidebar}
          className="h-8 w-8 shrink-0"
        >
          {isCollapsed ? (
            <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
          ) : (
            <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      {storeId && <SidebarNav storeId={storeId} />}

      {/* Footer section with user info */}
      <div className="mt-auto border-t border-sidebar-border p-3">
        <div
          className={cn(
            'flex items-center gap-3',
            isCollapsed ? 'justify-center' : ''
          )}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground text-xs font-medium">
            {getInitials(user?.name ?? null)}
          </div>
          {!isCollapsed && user && (
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-medium">{user.name}</span>
              <span className="truncate text-xs text-sidebar-muted">
                {user.role?.replace('_', ' ') ?? 'User'}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
