import type {
  Locale,
  ProductImage,
  ProductOption,
  ProductTranslation,
  ProductVariant,
} from '@/types/product';

/**
 * Content tab state — status, locale-keyed translations,
 * category / brand / isFeatured assignments.
 *
 * isFeatured is required (not optional) so the editor and payload
 * builders never have to handle undefined.
 */
export interface ProductContentFormValues {
  status:       'active' | 'draft';
  categoryId:   number | null;
  brandId:      number | null;
  isFeatured:   boolean;
  translations: Record<Locale, ProductTranslation>;
}

/**
 * Structure tab state — canonical options + generated variants.
 */
export interface ProductStructureState {
  options:  ProductOption[];
  variants: ProductVariant[];
}

/**
 * Media tab state — ordered product images.
 */
export interface ProductMediaState {
  images: ProductImage[];
}

/**
 * Full editor state combining all three tabs + tags.
 *
 * tags: number[] — integer IDs of tags assigned to this product.
 * Tags are edited in the Content tab and saved alongside content.
 */
export interface ProductEditorState {
  content:   ProductContentFormValues;
  structure: ProductStructureState;
  media:     ProductMediaState;
  tags:      number[];
}

export interface VariantSignature {
  signature: string;
  variant:   ProductVariant;
}

export interface BuildVariantsResult {
  variants: ProductVariant[];
  created:  number;
}
