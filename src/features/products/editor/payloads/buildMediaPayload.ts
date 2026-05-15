// src/lib/products/buildMediaPayload.ts

import type { ProductUpdatePayload } from '@/types/product';
import type { ProductMediaState } from '@/features/products/editor/types/product-editor';

type BuildMediaPayloadInput = {
  media: ProductMediaState;
};

/**
 * Builds the API payload for saving the media tab.
 *
 * Sends:
 * - media[]  (product-level images with url, alt, position)
 *
 * Image ID handling:
 * - Positive IDs → sent as-is (existing server records, backend updates alt/position)
 * - Negative IDs → omitted (client-only unsaved images, backend creates new record)
 *
 * Images with empty URLs are filtered as a safety guard.
 *
 * Does NOT send variants, options, or translations —
 * media tab is isolated from other tab changes by design.
 */
export function buildMediaPayload(
  input: BuildMediaPayloadInput
): ProductUpdatePayload {
  const { media } = input;

  const images = (media.images ?? [])
    .filter((img) => img.url?.trim() !== '')
    .map((img) => ({
      // Only send real server IDs — negative = unsaved, backend creates
      ...(typeof img.id === 'number' && img.id > 0 ? { id: img.id } : {}),
      url:      img.url.trim(),
      alt:      img.alt ?? null,
      position: img.position,
    }));

  return {
    media: images,
  };
}