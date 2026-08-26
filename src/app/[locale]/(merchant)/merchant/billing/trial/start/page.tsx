/**
 * Trial Signup Page
 * Start free trial and select plan
 */

import { Metadata } from 'next';
import { Suspense } from 'react';
import { TrialStartWrapper } from './TrialStartWrapper';
import { getPlans } from '@/lib/api/billing';
import type { Plan } from '@/types/billing/plan';

// Force dynamic rendering - this page requires auth and fetches user-specific data
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Start Your Free Trial',
    description: 'Start your 14-day free trial. No credit card required.',
  };
}

export default async function TrialStartPage() {
  let plans: Plan[];

  try {
    plans = await getPlans();
  } catch {
    plans = [];
  }

  const sortedPlans = [...plans].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <Suspense fallback={
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <TrialStartWrapper plans={sortedPlans} />
    </Suspense>
  );
}
