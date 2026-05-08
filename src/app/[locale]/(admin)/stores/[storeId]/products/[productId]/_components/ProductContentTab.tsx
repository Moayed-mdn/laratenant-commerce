'use client';

import { useEffect, useMemo, useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import type { Locale, ProductTranslation } from '@/types/product';
import { LocaleTabs } from './LocaleTabs';
import { TranslationForm } from './TranslationForm';

interface Props {
  availableLocales: Locale[];
  translations: Record<Locale, ProductTranslation>;
  onChange: (next: Record<Locale, ProductTranslation>) => void;
}

export function ProductContentTab({ availableLocales, translations, onChange }: Props) {
  const locales = useMemo(() => availableLocales, [availableLocales]);
  const [activeLocale, setActiveLocale] = useState<Locale>(locales[0] ?? '');

  useEffect(() => {
    if (!activeLocale && locales[0]) setActiveLocale(locales[0]);
    if (activeLocale && locales.length > 0 && !locales.includes(activeLocale)) setActiveLocale(locales[0]);
  }, [activeLocale, locales]);

  if (locales.length === 0) return null;

  const current = translations[activeLocale];

  return (
    <Tabs value={activeLocale} onValueChange={(v) => setActiveLocale(v as Locale)} className="space-y-4">
      <LocaleTabs locales={locales} translations={translations} />
      <TabsContent value={activeLocale}>
        <Card>
          <CardContent className="pt-6">
            {current && (
              <TranslationForm
                locale={activeLocale}
                value={current}
                onChange={(next) => onChange({ ...translations, [activeLocale]: next })}
              />
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
