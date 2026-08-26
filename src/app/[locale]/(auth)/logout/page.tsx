'use client';

import { useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function LogoutPage() {
  const params = useParams();
  const calledRef = useRef(false);
  const t = useTranslations('auth');

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    async function performLogout() {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
          headers: { Accept: 'application/json' },
        });
      } catch {
        // proceed even if API call fails
      }
      const locale = (params?.locale as string) || 'en';
      // Use full page navigation so middleware re-checks session cookies
      window.location.href = `/${locale}/login`;
    }
    performLogout();
  }, [params]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">{t('loggingOut')}</p>
    </div>
  );
}
