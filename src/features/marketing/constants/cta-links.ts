// =============================================================================
// Marketing — Shared CTA Link Definitions
//
// Consumed by HeroSection, CTASection, MarketingNavbar, PricingCard, etc.
// Auth routes reference the admin app locale-aware paths.
// =============================================================================

import type { CTALink } from '@/features/marketing/types'

export const CTA_START_SELLING: CTALink = {
  label: 'cta.startSelling',
  href: '/register',
}

export const CTA_VIEW_DEMO: CTALink = {
  label: 'cta.viewDemo',
  href: '/demo',
}

export const CTA_EXPLORE_FEATURES: CTALink = {
  label: 'cta.exploreFeatures',
  href: '/features',
}

export const CTA_VIEW_PRICING: CTALink = {
  label: 'cta.viewPricing',
  href: '/pricing',
}

export const CTA_CONTACT_SALES: CTALink = {
  label: 'cta.contactSales',
  href: '/contact',
}

export const CTA_LOGIN: CTALink = {
  label: 'cta.login',
  href: '/login',
}

export const CTA_GET_STARTED: CTALink = {
  label: 'cta.getStarted',
  href: '/register',
}
