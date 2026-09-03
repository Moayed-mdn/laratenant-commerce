'use client';

/**
 * Topbar component.
 * Header bar with mobile menu toggle, theme/locale toggles, and user menu.
 *
 * Reason for 'use client': needs Zustand state for sidebar toggle.
 */

import { useUiStore, selectSidebarOpen, selectSidebarCollapsed } from '@/stores/uiStore';
import { UserMenu } from './UserMenu';
import { StoreSwitcher } from './StoreSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { LocaleToggle } from './LocaleToggle';
import { NotificationBell } from './NotificationBell';
import { Button } from '@/components/ui/button';
import { Menu, PanelLeftOpen, PanelLeftClose, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Separator } from '@/components/ui/separator';
import { FEATURES } from '@/config/features';

interface TopbarProps {
  switcher?: React.ReactNode;
}

/**
 * Top header bar component.
 */
export function Topbar({ switcher }: TopbarProps) {
  const sidebarOpen      = useUiStore(selectSidebarOpen);
  const sidebarCollapsed = useUiStore(selectSidebarCollapsed);
  const setSidebarOpen   = useUiStore((state) => state.setSidebarOpen);
  const toggleSidebar    = useUiStore((state) => state.toggleSidebar);
  const toggleCommandPalette = useUiStore((state) => state.toggleCommandPalette);
  const t = useTranslations('nav');

  return (
    <header className="flex h-14 items-center gap-4 border-b border-border bg-background px-4">
      {/* Mobile — opens the sheet overlay */}
      <Button
        variant="ghost"
        size="icon"
        type="button"
        className="md:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={t('toggleMenu')}
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </Button>

      {/* Desktop — re-expands/collapses the sidebar */}
      <Button
        variant="ghost"
        size="icon"
        type="button"
        className="hidden md:flex"
        onClick={toggleSidebar}
        aria-label={t('toggleSidebar')}
      >
        {sidebarCollapsed ? (
          <PanelLeftOpen className="h-5 w-5" aria-hidden="true" />
        ) : (
          <PanelLeftClose className="h-5 w-5" aria-hidden="true" />
        )}
      </Button>

      {/* Command Palette Trigger */}
      <Button
        variant="ghost"
        size="sm"
        type="button"
        onClick={toggleCommandPalette}
        className="hidden md:flex gap-2 text-muted-foreground"
      >
        <Search className="h-4 w-4" />
        <span className="text-sm">{t('search')}</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted-bg px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          ⌘K
        </kbd>
      </Button>
      
      {/* Mobile Command Palette Trigger */}
      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={toggleCommandPalette}
        className="md:hidden"
      >
        <Search className="h-5 w-5" />
      </Button>
      
      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side controls */}
      <div className="flex items-center gap-2">
        {switcher || <StoreSwitcher />}

        <Separator orientation="vertical" className="mx-1 h-6 hidden md:block" />

        {FEATURES.enableNotifications && <NotificationBell />}
        {FEATURES.enableDarkMode && <ThemeToggle />}
        {FEATURES.enableRTL && <LocaleToggle />}
        <Separator orientation="vertical" className="h-6" />
        <UserMenu />
      </div>
    </header>
  );
}
