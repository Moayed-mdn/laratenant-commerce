'use client';

import { useEffect, useState } from 'react';

interface GlobalErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// This boundary replaces the ENTIRE root layout when it throws, so
// NextIntlClientProvider is not guaranteed to be mounted here — it cannot
// safely call useTranslations(). Instead it detects the locale from the URL
// path directly (no provider dependency) and keeps a hardcoded bilingual
// copy in sync manually. Keep this list in sync with routing.ts's locales.
const COPY = {
  en: {
    lang: 'en' as const,
    dir: 'ltr' as const,
    title: 'App recovery required',
    description: 'The app hit an unexpected error before the current route finished rendering.',
    retry: 'Retry',
    goHome: 'Go home',
  },
  ar: {
    lang: 'ar' as const,
    dir: 'rtl' as const,
    title: 'يلزم استعادة التطبيق',
    description: 'واجه التطبيق خطأً غير متوقع قبل انتهاء تحميل الصفحة الحالية.',
    retry: 'إعادة المحاولة',
    goHome: 'الذهاب إلى الصفحة الرئيسية',
  },
};

function detectLocale(): keyof typeof COPY {
  if (typeof window === 'undefined') return 'en';
  return window.location.pathname.startsWith('/ar') ? 'ar' : 'en';
}

export default function GlobalErrorPage({ error, reset }: GlobalErrorPageProps) {
  void error;
  // Default to 'en' on first paint (matches server render), then correct
  // from the URL on mount to avoid a hydration mismatch.
  const [locale, setLocale] = useState<keyof typeof COPY>('en');
  useEffect(() => {
    setLocale(detectLocale());
  }, []);
  const t = COPY[locale];

  return (
    <html lang={t.lang} dir={t.dir}>
      <body className="min-h-screen bg-muted/30">
        <div className="flex min-h-screen items-center justify-center p-6">
          <div className="w-full max-w-xl rounded-xl border bg-card p-8 text-center shadow-sm">
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="mt-3 text-muted-foreground">
              {t.description}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                {t.retry}
              </button>
              <button
                type="button"
                onClick={() => window.location.assign('/')}
                className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium"
              >
                {t.goHome}
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
