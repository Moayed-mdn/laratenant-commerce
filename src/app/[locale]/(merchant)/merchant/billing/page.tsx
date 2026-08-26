/**
 * Billing Dashboard Page
 * Main subscription management page
 */

import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SubscriptionStatusCard, EntitlementUsageCard } from '@/components/billing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Receipt, ExternalLink, CreditCard } from 'lucide-react';
import Link from 'next/link';

// Force dynamic rendering - requires auth and user-specific subscription data
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Subscription & Billing',
  description: 'Manage your subscription, view usage, and access billing information',
};

// This would normally fetch from server
// For now, we'll make it a client component wrapper
export default function BillingPage() {
  // Server component - would fetch data here
  // Redirecting to client wrapper for now
  return <BillingPageClient />;
}

// Import the client component
import { BillingPageClient } from './BillingPageClient';
