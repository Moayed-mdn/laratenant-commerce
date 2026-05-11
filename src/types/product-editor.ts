import type {
  Locale,
  ProductDetailView,
  ProductOption,
  ProductTranslation,
  ProductVariant,
  ProductImage,
} from '@/types/product';

export interface ProductContentFormValues {
  status: 'active' | 'inactive' | 'draft';
  categoryId: number | null;
  brandId: number | null;
  translations: Record<Locale, ProductTranslation>;
}

export interface ProductStructureState {
  options: ProductOption[];
  variants: ProductVariant[];
}

export interface ProductMediaState {
  images: ProductImage[];
}

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
