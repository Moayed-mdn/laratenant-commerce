'use client';

import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Locale, ProductTranslation } from '@/types/product';
import { TranslationStatusBadge } from './TranslationStatusBadge';

function getLocaleLabel(locale: string) {
  try {
    const displayNames = new Intl.DisplayNames([locale], { type: 'language' });
    return displayNames.of(locale) ?? locale;
  } catch {
    return locale;
  }
}

interface Props {
  locales: Locale[];
  translations: Record<Locale, ProductTranslation>;
}

export function LocaleTabs({ locales, translations }: Props) {
  return (
    <TabsList className="w-full justify-start overflow-x-auto">
      <div className="flex min-w-max gap-2">
        {locales.map((locale) => (
          <TabsTrigger key={locale} value={locale} className="gap-2">
            <span className="truncate max-w-40">{getLocaleLabel(locale)}</span>
            <TranslationStatusBadge isComplete={translations[locale]?.is_complete} />
          </TabsTrigger>
        ))}
      </div>
    </TabsList>
  );
}
