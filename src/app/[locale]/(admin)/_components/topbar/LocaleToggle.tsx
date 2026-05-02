'use client';

/**
 * LocaleToggle component.
 * Toggles between English and Arabic locales.
 * 
 * Reason for 'use client': reads/writes UI store locale, performs navigation.
 */

import { useUiStore, selectLocale } from '@/stores/uiStore';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import { FEATURES } from '@/config/features';

/**
 * Locale toggle button for switching between English and Arabic.
 * Only renders if FEATURES.enableRTL is true.
 */
export function LocaleToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('locale');
  const locale = useUiStore(selectLocale);
  const setLocale = useUiStore((state) => state.setLocale);

  if (!FEATURES.enableRTL) {
    return null;
  }

  const handleToggle = () => {
    const newLocale = locale === 'en' ? 'ar' : 'en';
    
    // Update locale in Zustand (also updates direction)
    setLocale(newLocale);
    
    // Build new pathname with new locale prefix using segment splitting
    // Example: /en/stores/1/dashboard → /ar/stores/1/dashboard
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPathname = segments.join('/');
    
    router.push(newPathname);
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
