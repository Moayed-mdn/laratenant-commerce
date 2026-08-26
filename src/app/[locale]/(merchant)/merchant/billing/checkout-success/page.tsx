/**
 * Checkout Success Page
 * Handles redirect from Stripe Checkout after successful payment
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const t = useTranslations('billing.checkoutSuccess');
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      setStatus('error');
      toast({
        title: t('invalidSession.title'),
        description: t('invalidSession.description'),
        variant: 'destructive',
      });
      return;
    }

    // Verify the checkout session
    // In a real implementation, you would call an API to verify the session
    // For now, we'll just show success and redirect
    const timer = setTimeout(() => {
      setStatus('success');
      toast({
        title: t('activated.title'),
        description: t('activated.description'),
      });
      
      // Redirect to billing page after 2 seconds
      setTimeout(() => {
        router.push('/merchant/billing');
        router.refresh();
      }, 2000);
    }, 1500);

    return () => clearTimeout(timer);
  }, [searchParams, router, toast, t]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-md">
        <div className="rounded-lg border bg-card p-8 text-center">
          {status === 'verifying' && (
            <>
              <Loader2 className="mx-auto h-16 w-16 animate-spin text-primary" />
              <h1 className="mt-4 text-2xl font-bold">{t('verifying.title')}</h1>
              <p className="mt-2 text-muted-foreground">
                {t('verifying.description')}
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle2 className="mx-auto h-16 w-16 text-success" />
              <h1 className="mt-4 text-2xl font-bold">{t('success.title')}</h1>
              <p className="mt-2 text-muted-foreground">
                {t('success.description')}
              </p>
              <Button
                className="mt-6"
                onClick={() => {
                  router.push('/merchant/billing');
                  router.refresh();
                }}
              >
                {t('goToBilling')}
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="mx-auto h-16 w-16 text-destructive" />
              <h1 className="mt-4 text-2xl font-bold">{t('error.title')}</h1>
              <p className="mt-2 text-muted-foreground">
                {t('error.description')}
              </p>
              <div className="mt-6 flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => router.push('/merchant/billing/plans')}
                >
                  {t('backToPlans')}
                </Button>
                <Button onClick={() => router.push('/merchant/billing')}>
                  {t('goToBilling')}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
