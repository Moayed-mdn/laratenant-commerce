import type { ProductDetailView } from '@/types/product';
import type { ProductEditorState } from '@/types/product-editor';

/**
 * Builds the initial ProductEditorState from a mapped ProductDetailView.
 *
 * The editor has three independent tabs:
 * - content: status, translations, category/brand assignments
 * - structure: canonical options + generated variants
 * - media: ordered images
 *
 * This function is the single entry point for editor initialization
 * and post-save rebasing.
 */
export function buildEditorState(
  product: ProductDetailView
): ProductEditorState {
  return {
    content: {
      status: product.status,
      categoryId: product.categoryId,
      brandId: product.brandId,
      isFeatured: product.isFeatured,
      translations: product.translations,
    },

    structure: {
      options: product.options,
      variants: product.variants,
    },

    media: {
      images: product.images,
    },
  };
}
