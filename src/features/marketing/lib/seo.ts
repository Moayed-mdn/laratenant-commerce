// =============================================================================
// Marketing — Centralized SEO Utilities
//
// All marketing page.tsx files call these utilities for metadata generation.
// Sections never call these — SEO is a page/route concern only.
//
// CMS integration: replace static strings with CMS-resolved values at the
// call site. The utility signatures do not change.
// =============================================================================

import type { Metadata } from 'next'
import type { FAQItem, MarketingPageMeta } from '@/features/marketing/types'

// -----------------------------------------------------------------------------
// Config
// -----------------------------------------------------------------------------

const SITE_NAME = 'LaraTenant Commerce'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://laratenant.com'
const DEFAULT_OG_IMAGE = '/og/default.png'

const SUPPORTED_LOCALES = ['en', 'ar'] as const
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

// -----------------------------------------------------------------------------
// Internal Helpers
// -----------------------------------------------------------------------------

function buildCanonicalUrl(locale: string, path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  const localePath = cleanPath === '/' ? '' : cleanPath
  return `${SITE_URL}/${locale}${localePath}`
}

function buildLocaleAlternates(
  path: string,
): Record<string, string> {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  const localePath = cleanPath === '/' ? '' : cleanPath

  return SUPPORTED_LOCALES.reduce<Record<string, string>>((acc, locale) => {
    acc[locale] = `${SITE_URL}/${locale}${localePath}`
    return acc
  }, {})
}

function formatTitle(title: string): string {
  return `${title} | ${SITE_NAME}`
}

// -----------------------------------------------------------------------------
// buildPageMetadata
//
// Primary utility for all marketing pages.
// Call from generateMetadata() in each marketing page.tsx.
//
// Usage:
//   export async function generateMetadata({ params }) {
//     const { locale } = await params
//     const t = await getTranslations({ locale, namespace: 'marketing' })
//     return buildPageMetadata({
//       locale,
//       title: t('meta.home.title'),
//       description: t('meta.home.description'),
//       path: '',
//     })
//   }
// -----------------------------------------------------------------------------

export function buildPageMetadata(config: MarketingPageMeta): Metadata {
  const { locale, title, description, path, ogImage } = config

  const canonicalUrl = buildCanonicalUrl(locale, path)
  const ogImageUrl = ogImage ?? DEFAULT_OG_IMAGE
  const formattedTitle = formatTitle(title)
  const alternates = buildLocaleAlternates(path)

  return {
    title: formattedTitle,
    description,

    alternates: {
      canonical: canonicalUrl,
      languages: alternates,
    },

    openGraph: {
      title: formattedTitle,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale,
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },

    twitter: {
      card: 'summary_large_image',
      title: formattedTitle,
      description,
      images: [ogImageUrl],
    },
  }
}

// -----------------------------------------------------------------------------
// buildFAQJsonLd
//
// Generates FAQPage structured data for server-side injection.
//
// Usage in a Server Component:
//   <script
//     type="application/ld+json"
//     dangerouslySetInnerHTML={{ __html: buildFAQJsonLd(faqs) }}
//   />
// -----------------------------------------------------------------------------

export function buildFAQJsonLd(items: FAQItem[]): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  return JSON.stringify(schema)
}

// -----------------------------------------------------------------------------
// buildOrgJsonLd
//
// Generates Organization structured data.
// Inject once in marketing layout.
// -----------------------------------------------------------------------------

export function buildOrgJsonLd(): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
  }

  return JSON.stringify(schema)
}

// -----------------------------------------------------------------------------
// buildSoftwareJsonLd
//
// Generates SoftwareApplication structured data.
// Inject on homepage.
// -----------------------------------------------------------------------------

export function buildSoftwareJsonLd(): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE_NAME,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: SITE_URL,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  }

  return JSON.stringify(schema)
}
