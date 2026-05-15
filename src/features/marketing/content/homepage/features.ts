// =============================================================================
// Homepage — Feature Grid Content
//
// Feature items for the FeatureGridSection.
// Icons are emoji — swap for icon component keys when design system matures.
// Translatable strings come from i18n via page-level wiring.
// Structural data (id, icon) lives here.
//
// Page wiring pattern:
//   const t = await getTranslations({ locale, namespace: 'marketing' })
//   const features = getFeatureItems(t)
//   <FeatureGridSection
//     heading={t('home.features.heading')}
//     subtitle={t('home.features.subtitle')}
//     items={features}
//   />
// =============================================================================

import type { FeatureItem } from '@/features/marketing/types'

const FEATURE_IDS = [
  'multi-store',
  'orders',
  'products',
  'analytics',
  'localization',
  'permissions',
  'performance',
  'api',
] as const

const FEATURE_ICONS: Record<(typeof FEATURE_IDS)[number], string> = {
  'multi-store':   '🏪',
  'orders':        '📦',
  'products':      '🗂️',
  'analytics':     '📊',
  'localization':  '🌐',
  'permissions':   '🔐',
  'performance':   '⚡',
  'api':           '🔌',
}

export function getFeatureItems(
  t: (key: string) => string,
): FeatureItem[] {
  return FEATURE_IDS.map((id) => ({
    id,
    icon: FEATURE_ICONS[id],
    title: t(`home.features.items.${id}.title`),
    description: t(`home.features.items.${id}.description`),
  }))
}
