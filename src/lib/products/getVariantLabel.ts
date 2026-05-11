import type { ProductVariantAttribute } from '@/types/product';

export function getVariantLabel(attributes: ProductVariantAttribute[] | null | undefined): string {
  const parts = (attributes ?? [])
    .map((a) => (a.label?.trim() || a.value || '').trim())
    .filter((x) => x !== '');

  if (parts.length === 0) return 'Default Variant';
  return parts.join(' / ');
}
