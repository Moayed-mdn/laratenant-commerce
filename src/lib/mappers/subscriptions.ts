/**
 * Subscription mappers.
 * Transform raw API data (snake_case) to view shapes (camelCase) for UI components.
 */

import type { 
  SubscriptionListItem, 
  SubscriptionListItemView,
  SubscriptionDetail,
  SubscriptionDetailView,
} from '@/types/billing/subscription';
import { formatDistanceToNow } from 'date-fns';

/**
 * Format currency amount from cents to display string.
 */
function formatCurrency(amountCents: number, currency: string, locale: string = 'en'): string {
  const amount = amountCents / 100;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date to relative time string.
 */
function formatRelativeTime(dateString: string | null): string | null {
  if (!dateString) return null;
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch {
    return null;
  }
}

/**
 * Format date to readable string.
 */
function formatDate(dateString: string | null, locale: string = 'en'): string | null {
  if (!dateString) return null;
  try {
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return null;
  }
}

/**
 * Map subscription list item from API to view shape.
 */
export function mapSubscriptionListItem(item: SubscriptionListItem, locale: string = 'en'): SubscriptionListItemView {
  const priceFormatted = item.plan_price
    ? `${formatCurrency(item.plan_price.amount_cents, item.plan_price.currency, locale)} / ${item.billing_cycle || 'month'}`
    : '—';

  return {
    id: item.id,
    status: item.status,
    billingCycle: item.billing_cycle,
    planName: item.plan.name,
    planCode: item.plan.code,
    priceFormatted,
    merchantName: item.merchant.owner_name,
    merchantEmail: item.merchant.owner_email,
    currentPeriodEndsAt: item.current_period_ends_at,
    currentPeriodEndsAtRelative: formatRelativeTime(item.current_period_ends_at),
    cancelAtPeriodEnd: item.cancel_at_period_end,
    createdAt: item.created_at,
    createdAtRelative: formatRelativeTime(item.created_at) || '',
  };
}

/**
 * Map subscription detail from API to view shape.
 */
export function mapSubscriptionDetail(detail: SubscriptionDetail, locale: string = 'en'): SubscriptionDetailView {
  const currency = detail.plan_price?.currency || 'USD';
  const priceFormatted = detail.plan_price
    ? formatCurrency(detail.plan_price.amount_cents, currency, locale)
    : '—';

  return {
    id: detail.id,
    status: detail.status,
    billingCycle: detail.billing_cycle,
    provider: detail.provider,
    providerSubscriptionId: detail.provider_subscription_id,
    providerStatus: detail.provider_status,
    providerSyncedAt: detail.provider_synced_at,
    
    plan: detail.plan,
    
    pendingPlan: detail.pending_plan,
    pendingPlanEffectiveAt: detail.pending_plan_effective_at,
    pendingPlanEffectiveAtFormatted: formatDate(detail.pending_plan_effective_at, locale),
    
    priceFormatted,
    currency,
    
    trialStartsAt: detail.trial_starts_at,
    trialEndsAt: detail.trial_ends_at,
    currentPeriodStartsAt: detail.current_period_starts_at,
    currentPeriodEndsAt: detail.current_period_ends_at,
    gracePeriodEndsAt: detail.grace_period_ends_at,
    cancelAtPeriodEnd: detail.cancel_at_period_end,
    canceledAt: detail.canceled_at,
    endedAt: detail.ended_at,
    createdAt: detail.created_at,
    
    merchant: {
      billingAccountId: detail.merchant.billing_account_id,
      ownerId: detail.merchant.owner_id,
      ownerName: detail.merchant.owner_name,
      ownerEmail: detail.merchant.owner_email,
      legalName: detail.merchant.legal_name,
      billingEmail: detail.merchant.billing_email,
      stores: detail.merchant.stores,
    },
    
    invoices: detail.invoices.map((invoice) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoice_number,
      status: invoice.status,
      currency: invoice.currency,
      totalFormatted: formatCurrency(invoice.total_cents, invoice.currency, locale),
      amountPaidFormatted: formatCurrency(invoice.amount_paid_cents, invoice.currency, locale),
      amountDueFormatted: formatCurrency(invoice.amount_due_cents, invoice.currency, locale),
      issuedAt: invoice.issued_at,
      issuedAtFormatted: formatDate(invoice.issued_at, locale),
      paidAt: invoice.paid_at,
      paidAtFormatted: formatDate(invoice.paid_at, locale),
      hostedInvoiceUrl: invoice.hosted_invoice_url,
    })),
    
    events: detail.events.map((event) => ({
      id: event.id,
      eventType: event.event_type,
      fromStatus: event.from_status,
      toStatus: event.to_status,
      source: event.source,
      reason: event.reason,
      actor: event.actor,
      createdAt: event.created_at,
      createdAtRelative: formatRelativeTime(event.created_at) || '',
    })),
  };
}
