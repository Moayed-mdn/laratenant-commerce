// =============================================================================
// Features Page — Feature List Content
//
// Extended feature content for the /features marketing page.
// More detailed than homepage feature grid items.
// Reserved — populate when /features page is built.
//
// Page wiring pattern:
//   const t = await getTranslations({ locale, namespace: 'marketing' })
//   const features = getExtendedFeatures(t)
//   <FeatureGridSection heading={...} items={features} />
// =============================================================================

import type { FeatureItem } from '@/features/marketing/types'

export function getExtendedFeatures(
  _t: (key: string) => string,
): FeatureItem[] {
  // Populate when /features page is implemented.
  return []
}
