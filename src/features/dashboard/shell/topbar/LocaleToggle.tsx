'use client';

/**
 * LocaleToggle component.
 * Toggles between English and Arabic locales.
 * 
 * Reason for 'use client': reads/writes UI store locale, performs navigation.
 */

import { useRouter, usePathname } from '@/lib/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useUiStore } from '@/stores/uiStore';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import { FEATURES } from '@/config/features';

/**
 * Locale toggle button for switching between English and Arabic.
 * Only renders if FEATURES.enableRTL is true.
 */
export function LocaleToggle() {
  const router = useRouter();
  const pathname = usePathname(); // next-intl pathname (WITHOUT locale prefix)
  const locale = useLocale();     // from next-intl (always correct, even after reload)
  const t = useTranslations('locale');
  const setDirection = useUiStore((state) => state.setDirection);

  if (!FEATURES.enableRTL) {
    return null;
  }

  const handleToggle = () => {
    const newLocale = locale === 'en' ? 'ar' : 'en';

    // Sync Zustand for direction/RTL state within the current render
    setDirection(newLocale as 'en' | 'ar');

    // next-intl router.replace() does two things automatically:
    // 1. Navigates to the same page with new locale prefix
    // 2. Sets NEXT_LOCALE cookie so middleware remembers preference
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      type="button"
      onClick={handleToggle}
      aria-label={t('toggle')}
    >
      <Languages className="h-4 w-4" aria-hidden="true" />
      <span className="sr-only">
        {locale === 'en' ? t('switchToArabic') : t('switchToEnglish')}
      </span>
    </Button>
  );
}
