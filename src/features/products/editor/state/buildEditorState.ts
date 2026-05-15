import type { ProductDetailView } from '@/types/product';
import type { ProductEditorState } from '@/features/products/editor/types/product-editor';

/**
 * Builds the initial ProductEditorState from a mapped ProductDetailView.
 *
 * The editor has three independent tabs plus tags:
 * - content:   status, translations, category / brand / isFeatured
 * - structure: canonical options + generated variants
 * - media:     ordered images
 * - tags:      integer IDs of assigned tags
 *
 * Single entry point for editor initialisation and post-save rebasing.
 */
export function buildEditorState(
  product: ProductDetailView
): ProductEditorState {
  return {
    content: {
      status:       product.status,
      categoryId:   product.categoryId,
      brandId:      product.brandId,
      isFeatured:   product.isFeatured,
      translations: product.translations,
    },

    structure: {
      options:  product.options,
      variants: product.variants,
    },

    media: {
      images: product.media,
    },

    tags: product.tags,
  };
}
