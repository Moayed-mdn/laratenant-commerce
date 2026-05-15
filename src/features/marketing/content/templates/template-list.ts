// =============================================================================
// Templates Page — Template List Content
//
// Reserved for /templates marketing page content.
// Populate when /templates page is built.
// =============================================================================

export interface TemplateItem {
  id: string
  name: string
  description: string
  previewSrc?: string
  category: string
  href: string
}

export function getTemplates(
  _t: (key: string) => string,
): TemplateItem[] {
  // Populate when /templates page is implemented.
  return []
}
