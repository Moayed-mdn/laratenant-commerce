'use client';

import { useTranslations } from 'next-intl';
import { useSubscription } from '@/hooks/billing/useSubscription';
import { useRouter } from '@/lib/navigation';
import { TrialSignupClient } from './TrialSignupClient';
import { CheckCircle2 } from 'lucide-react';
import type { Plan } from '@/types/billing/plan';

export function TrialStartWrapper({ plans }: { plans: Plan[] }) {
  const router = useRouter();
  const t = useTranslations('billing.trial');
  const { data: subscriptionData, isLoading } = useSubscription();

  // Extract subscription from response
  const subscription = subscriptionData?.subscription;

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Redirect if user already has an active subscription
  if (subscription) {
    router.replace('/merchant/billing');
    return null;
  }

  const benefits = t.raw('startPage.benefits') as string[];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold">{t('startPage.heading')}</h1>
        <p className="mt-4 text-xl text-muted-foreground">
          {t('startPage.subheading')}
        </p>
      </div>

      {/* Trial Benefits */}
      <div className="mx-auto max-w-3xl">
        <div className="grid gap-6 sm:grid-cols-2">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
              <p className="text-sm">{benefit}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Plan Selection - Client Component */}
      {plans.length > 0 ? (
        <TrialSignupClient plans={plans} />
      ) : (
        <div className="text-center text-muted-foreground">
          <p>{t('startPage.noPlans')}</p>
        </div>
      )}
    </div>
  );
}
