'use client';

/**
 * ThemeToggle component.
 * Toggles between light and dark theme.
 * 
 * Reason for 'use client': reads/writes UI store theme.
 * 
 * Documented useEffect exception:
 * Reason: 'sync Zustand theme state to DOM class for Tailwind dark mode'
 */

import { useEffect } from 'react';
import { useUiStore, selectTheme } from '@/stores/uiStore';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';
import { FEATURES } from '@/config/features';

/**
 * Theme toggle button for light/dark mode.
 * Only renders if FEATURES.enableDarkMode is true.
 */
export function ThemeToggle() {
  const t = useTranslations('theme');
  const theme = useUiStore(selectTheme);
  const setTheme = useUiStore((state) => state.setTheme);

  // Sync Zustand theme state to DOM class for Tailwind dark mode
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  if (!FEATURES.enableDarkMode) {
    return null;
  }

  const handleToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      type="button"
      onClick={handleToggle}
      aria-label={t('toggle')}
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
    </Button>
  );
}
