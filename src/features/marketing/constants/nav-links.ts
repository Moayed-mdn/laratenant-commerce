// =============================================================================
// Marketing — Navigation Link Definitions
//
// Consumed by MarketingNavbar and MarketingFooter.
// Links are locale-agnostic path segments.
// Locale prefix is applied at render time via navigation.ts helpers.
// =============================================================================

import type { NavLink, NavGroup } from '@/features/marketing/types'

// -----------------------------------------------------------------------------
// Primary Navbar Links
// -----------------------------------------------------------------------------

export const PRIMARY_NAV_LINKS: NavLink[] = [
  { label: 'nav.features', href: '/features' },
  { label: 'nav.pricing', href: '/pricing' },
  { label: 'nav.enterprise', href: '/enterprise' },
  { label: 'nav.templates', href: '/templates' },
  { label: 'nav.blog', href: '/blog' },
  { label: 'nav.docs', href: '/docs' },
]

// -----------------------------------------------------------------------------
// Footer Link Groups
// -----------------------------------------------------------------------------

export const FOOTER_NAV_GROUPS: NavGroup[] = [
  {
    label: 'footer.groups.product',
    links: [
      { label: 'footer.links.features', href: '/features' },
      { label: 'footer.links.pricing', href: '/pricing' },
      { label: 'footer.links.templates', href: '/templates' },
      { label: 'footer.links.enterprise', href: '/enterprise' },
    ],
  },
  {
    label: 'footer.groups.resources',
    links: [
      { label: 'footer.links.docs', href: '/docs' },
      { label: 'footer.links.blog', href: '/blog' },
    ],
  },
  {
    label: 'footer.groups.company',
    links: [
      { label: 'footer.links.about', href: '/about' },
      { label: 'footer.links.contact', href: '/contact' },
    ],
  },
]
