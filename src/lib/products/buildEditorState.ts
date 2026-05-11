import type {
  ProductDetailView,
} from '@/types/product';

import type {
  ProductEditorState,
} from '@/types/product-editor';

export function buildEditorState(
  product: ProductDetailView
): ProductEditorState {
  return {
    content: {
      status: product.status,
      categoryId: product.categoryId,
      brandId: product.brandId,
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
