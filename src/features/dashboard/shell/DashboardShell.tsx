'use client';

/**
 * DashboardShell component.
 * Composes sidebar, topbar, and main content area.
 *
 * Reason for 'use client': needs Zustand sidebar state.
 */

import { useUiStore, selectIsRTL } from '@/stores/uiStore';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { Sidebar } from './sidebar/Sidebar';
import { Topbar } from './topbar/Topbar';
import { MobileNav } from './MobileNav';
import { cn } from '@/lib/utils';
import { useIsMutating } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { CommandPalette } from '@/components/shared/CommandPalette';
import { PushNotificationRegistrar } from './PushNotificationRegistrar';

interface DashboardShellProps {
  children: React.ReactNode;
  nav?: React.ReactNode;
  switcher?: React.ReactNode;
}

/**
 * Main layout shell for dashboard pages.
 * Includes sidebar, topbar, and content area.
 */
export function DashboardShell({ children, nav, switcher }: DashboardShellProps) {
  const isRTL = useUiStore(selectIsRTL);
  const locale = useLocale();
  const setDirection = useUiStore((state) => state.setDirection);
  const isSwitchingStore = useIsMutating({ mutationKey: ['store-switch'] }) > 0;
  const t = useTranslations('nav');

  useEffect(() => {
    setDirection(locale as 'en' | 'ar');
  }, [locale, setDirection]);

  return (
    <div className="relative flex h-screen overflow-hidden ">
      {/* Sidebar — hidden on mobile */}
      <Sidebar nav={nav} />

      {/* Main area */}
      <div
        className={cn(
          'flex flex-col flex-1 overflow-hidden transition-all duration-200',
          isRTL ? 'mr-0' : 'ml-0'
        )}
      >
        <Topbar switcher={switcher} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>

      {isSwitchingStore ? (
        <div className="pointer-events-none absolute inset-0 z-40 flex items-start justify-center bg-background/40 pt-20 backdrop-blur-[1px]">
          <div className="flex items-center gap-3 rounded-lg border bg-background px-4 py-3 text-sm shadow-lg">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span>{t('switchingStore')}</span>
          </div>
        </div>
      ) : null}

      {/* Mobile nav overlay */}
      <MobileNav nav={nav} />
      
      {/* Command Palette (Heuristic 6: Recognition Rather Than Recall) */}
      <CommandPalette />

      {/* Push notification registration (side-effect only, renders nothing) */}
      <PushNotificationRegistrar />
    </div>
  );
}
