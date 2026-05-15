// =============================================================================
// Marketing Route Group Layout
//
// Shared layout for all (marketing) routes.
// Wires MarketingLayout with locale from params.
// Owns no metadata — each page.tsx defines its own generateMetadata.
//
// Rules:
//   - thin wrapper — no business logic
//   - locale extracted from params and forwarded to MarketingLayout
//   - MarketingLayout owns Navbar, Footer, skip link, JSON-LD org schema
//   - no auth checks — marketing routes are fully public
// =============================================================================

import { type ReactNode } from 'react'
import MarketingLayout from '@/features/marketing/layouts/MarketingLayout'

interface MarketingRouteLayoutProps {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export default async function MarketingRouteLayout({
  children,
}: MarketingRouteLayoutProps) {
  return (
    <MarketingLayout>
      {children}
    </MarketingLayout>
  )
}
