/**
 * Stripe Connect Onboarding — Return Page
 * Stripe redirects the merchant here after completing (or abandoning) the
 * hosted onboarding flow. This is optimistic: Stripe does not guarantee
 * onboarding actually finished, so we re-fetch real status from our backend
 * and poll briefly (the account.updated webhook can lag a few seconds)
 * rather than trusting the redirect alone.
 *
 * IMPORTANT: this exact path is hardcoded on the backend as the Stripe
 * AccountLink return_url (see OnboardMerchantToStripeAction on
 * laratenant-backend) and receives no store identifier or query params from
 * Stripe — store context comes from bootstrapStore, not the URL.
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBootstrapStore } from '@/stores/bootstrapStore';
import { useStripeConnectStatus } from '@/hooks/stripe-connect/useStripeConnectStatus';
import { WorkspaceEmptyState } from '@/features/merchant/components/WorkspaceEmptyState';
import { ROUTES } from '@/config/routes';

const MAX_POLL_ATTEMPTS = 5;
const POLL_INTERVAL_MS = 3000;

export default function StripeConnectSuccessPage() {
  const router = useRouter();
  const t = useTranslations('settings.stripeConnectReturn');
  const activeStore = useBootstrapStore((state) => state.activeStore);
  const storeSlug = activeStore?.slug;

  const { data: status, isLoading, refetch } = useStripeConnectStatus(storeSlug);
  const attemptsRef = useRef(0);
  const [polling, setPolling] = useState(true);

  const succeeded = !!status?.can_receive_payments;

  useEffect(() => {
    if (!storeSlug || isLoading) return;

    if (succeeded || attemptsRef.current >= MAX_POLL_ATTEMPTS) {
      setPolling(false);
      return;
    }

    const timer = setTimeout(() => {
      attemptsRef.current += 1;
      void refetch();
    }, POLL_INTERVAL_MS);

    return () => clearTimeout(timer);
  }, [storeSlug, isLoading, succeeded, refetch]);

  const goToSettings = () => {
    router.push(ROUTES.merchant.settings());
    router.refresh();
  };

  if (!storeSlug) {
    return (
      <div className="container mx-auto px-4 py-16">
        <WorkspaceEmptyState />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-md">
        <div className="rounded-lg border bg-card p-8 text-center">
          {polling && !succeeded && (
            <>
              <Loader2 className="mx-auto h-16 w-16 animate-spin text-primary" />
              <h1 className="mt-4 text-2xl font-bold">{t('verifyingTitle')}</h1>
              <p className="mt-2 text-muted-foreground">{t('verifyingMessage')}</p>
            </>
          )}

          {!polling && succeeded && (
            <>
              <CheckCircle2 className="mx-auto h-16 w-16 text-success" />
              <h1 className="mt-4 text-2xl font-bold">{t('successTitle')}</h1>
              <p className="mt-2 text-muted-foreground">{t('successMessage')}</p>
              <Button className="mt-6" onClick={goToSettings}>
                {t('goToSettings')}
              </Button>
            </>
          )}

          {!polling && !succeeded && (
            <>
              <Clock className="mx-auto h-16 w-16 text-muted-foreground" />
              <h1 className="mt-4 text-2xl font-bold">{t('pendingTitle')}</h1>
              <p className="mt-2 text-muted-foreground">{t('pendingMessage')}</p>
              <Button className="mt-6" onClick={goToSettings}>
                {t('goToSettings')}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
