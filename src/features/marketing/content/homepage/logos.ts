// =============================================================================
// Homepage — Logo Cloud Content
//
// Logo items for LogoCloudSection.
//
// Rules:
//   - only real brand assets when available
//   - placeholder entries use name only — no fake brand imagery
//   - src paths are relative to /public
//   - width/height prevent CLS — match actual asset dimensions
//   - replace placeholder entries before production launch
//
// Page wiring pattern:
//   const logos = getLogoItems()
//   <LogoCloudSection
//     items={logos}
//     label={t('home.logos.label')}
//   />
// =============================================================================

import type { LogoItem } from '@/features/marketing/types'

export function getLogoItems(): LogoItem[] {
  // Replace with real partner/customer logo assets before launch.
  // Placeholder entries intentionally have generic names.
  return [
    { name: 'Brand One',   src: '/logos/brand-one.svg',   width: 120, height: 32 },
    { name: 'Brand Two',   src: '/logos/brand-two.svg',   width: 100, height: 32 },
    { name: 'Brand Three', src: '/logos/brand-three.svg', width: 130, height: 32 },
    { name: 'Brand Four',  src: '/logos/brand-four.svg',  width: 110, height: 32 },
    { name: 'Brand Five',  src: '/logos/brand-five.svg',  width: 120, height: 32 },
  ]
}
