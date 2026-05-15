'use client';

/**
 * Topbar component.
 * Header bar with mobile menu toggle, theme/locale toggles, and user menu.
 * 
 * Reason for 'use client': needs Zustand state for sidebar toggle.
 */

import { useParams } from 'next/navigation';
import { useUiStore } from '@/stores/uiStore';
import { UserMenu } from './UserMenu';
import { ThemeToggle } from './ThemeToggle';
import { LocaleToggle } from './LocaleToggle';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Separator } from '@/components/ui/separator';
import { FEATURES } from '@/config/features';

/**
 * Top header bar component.
 */
export function Topbar() {
  const params = useParams();
  // storeId available but not used in topbar directly
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const storeId = params.storeId as string | undefined;

  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const t = useTranslations('nav');

  return (
    <header className="flex h-14 items-center gap-4 border-b border-border bg-background px-4">
      {/* Mobile menu toggle */}
      <Button
        variant="ghost"
        size="icon"
        type="button"
        className="md:hidden"
        onClick={toggleSidebar}
        aria-label={t('toggleMenu')}
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </Button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side controls */}
      <div className="flex items-center gap-2">
        {FEATURES.enableDarkMode && <ThemeToggle />}
        {FEATURES.enableRTL && <LocaleToggle />}
        <Separator orientation="vertical" className="h-6" />
        <UserMenu />
      </div>
    </header>
  );
}
