import type {
  Locale,
  ProductImage,
  ProductOption,
  ProductTranslation,
  ProductVariant,
} from '@/types/product';

/**
 * Content tab state — status, locale-keyed translations,
 * category/brand assignments.
 */
export interface ProductContentFormValues {
  status: 'active' | 'draft';
  categoryId: number | null;
  brandId: number | null;
  isFeatured?: boolean;
  translations: Record<Locale, ProductTranslation>;
}

/**
 * Structure tab state — canonical options + generated variants.
 * options[] drives the combination generator.
 * variants[] carries semantic option assignments via options[].
 */
export interface ProductStructureState {
  options: ProductOption[];
  variants: ProductVariant[];
}

/**
 * Media tab state — ordered product images.
 */
export interface ProductMediaState {
  images: ProductImage[];
}

/**
 * Full editor state combining all three tabs.
 */
export interface ProductEditorState {
  content: ProductContentFormValues;
  structure: ProductStructureState;
  media: ProductMediaState;
}

export interface VariantSignature {
  signature: string;
  variant: ProductVariant;
}

export interface BuildVariantsResult {
  variants: ProductVariant[];
  created: number;
}
