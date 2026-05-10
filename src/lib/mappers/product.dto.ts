/**
 * Product DTO (Data Transfer Object) Layer
 * 
 * This layer normalizes data between backend API and frontend UI.
 * It isolates backend response shape changes and provides a stable
 * interface for components to consume.
 * 
 * Architecture: Variant-First
 * - variants[] is the PRIMARY source of truth
 * - display_variant is the explicit default variant
 * - flattened product fields are deprecated compatibility fallbacks
 */

import type {
  AdminProduct,
  ProductDetailView,
  ProductUpdatePayload,
  ProductVariant,
  ProductVariantInput,
  ProductTranslation,
  Locale,
} from '@/types/product';
import { formatDate } from '@/lib/utils/date';
import { normalizeProductOptions } from './products';

/**
 * Map raw API product to frontend view model.
 * 
 * Priority order for variant initialization:
 * 1. product.variants - use all variants if available
 * 2. product.display_variant - use explicit default variant
 * 3. deprecated flattened fields - temporary compatibility fallback
 */
export function mapApiProductToViewModel(raw: AdminProduct): ProductDetailView {
  const rawTranslations: Record<Locale, ProductTranslation> = raw.translations ?? {};

  const availableLocales: Locale[] =
    raw.available_locales && raw.available_locales.length > 0
      ? raw.available_locales
      : (Object.keys(rawTranslations) as Locale[]);

  const translations = availableLocales.reduce<Record<Locale, ProductTranslation>>((acc, locale) => {
    const existing = rawTranslations[locale];
    acc[locale] =
      existing ??
      ({
        locale,
        name: '',
        slug: '',
        description: null,
        seo_title: null,
        seo_description: null,
        is_complete: false,
      } satisfies ProductTranslation);
    return acc;
  }, {});

  return {
    id: raw.id,
    storeId: raw.store_id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description ?? '',
    status: raw.status,
    images: raw.images,
    createdAt: formatDate(raw.created_at),
    updatedAt: formatDate(raw.updated_at),
    
    // Variant-first fields (PRIMARY)
    variants: raw.variants ?? [],
    display_variant: raw.display_variant ?? null,
    total_stock: raw.total_stock,
    
    options: normalizeProductOptions(raw.options),
    availableLocales,
    translations,
    
    // Deprecated flattened fields (kept for backward compatibility during migration)
    // TODO: Remove these when backend fully adopts variant-first architecture (v2.0)
    price: raw.price,
    compareAtPrice: raw.compare_at_price,
    costPerItem: raw.cost_per_item,
    sku: raw.sku,
    barcode: raw.barcode,
    quantity: raw.quantity,
    trackQuantity: raw.track_quantity,
    weight: raw.weight,
    weightUnit: raw.weight_unit,
  };
}

/**
 * Map frontend view model to API update payload.
 * 
 * This function creates a variant-first payload:
 * - variants array is the primary data source
 * - display_variant_id explicitly identifies the default variant
 * - flattened fields are included only for backward compatibility
 * 
 * @param viewModel - Frontend product view model
 * @param primaryVariantId - Optional explicit ID for the primary/default variant
 * @returns API-compatible update payload
 */
export function mapViewModelToPayload(
  viewModel: ProductDetailView,
  variants: ProductVariantInput[],
  primaryVariantId?: number | null
): ProductUpdatePayload {
  // Find the primary variant for flattened field extraction (compatibility only)
  const primaryVariant = variants.find(v => v.id === primaryVariantId) ?? variants[0];
  
  return {
    // Core variant-first fields
    variants: variants.map(normalizeVariantForPayload),
    display_variant_id: primaryVariantId ?? variants[0]?.id ?? null,
    
    // Translations
    translations: Object.fromEntries(
      Object.entries(viewModel.translations).map(([locale, tr]) => [
        locale,
        {
          locale,
          name: tr.name,
          slug: tr.slug,
          description: tr.description,
          seo_title: tr.seo_title,
          seo_description: tr.seo_description,
        },
      ])
    ),
    
    // Status
    status: viewModel.status,
    
    // Images (if needed in update)
    images: viewModel.images,
    
    // Options (if needed in update)
    options: viewModel.options,
    
    /**
     * DEPRECATED: Flattened fields for backward compatibility.
     * These are extracted from the primary variant only to maintain
     * compatibility with older backend versions.
     * 
     * TODO: Remove these fields when backend v2.0 is deployed.
     * The backend should extract all data from the variants array.
     */
    price: primaryVariant?.price ?? 0,
    compare_at_price: primaryVariant?.compare_at_price ?? null,
    cost_per_item: primaryVariant?.cost_price ?? null,
    sku: primaryVariant?.sku ?? null,
    barcode: primaryVariant?.barcode ?? null,
    quantity: primaryVariant?.quantity ?? 0,
    track_quantity: primaryVariant?.track_inventory ?? true,
    weight: primaryVariant?.weight ?? null,
    weight_unit: primaryVariant?.weight_unit ?? null,
  };
}

/**
 * Normalize a variant input for API payload.
 * Removes frontend-only fields like `key`.
 */
function normalizeVariantForPayload(variant: ProductVariantInput): Omit<ProductVariantInput, 'key'> {
  const { key, ...rest } = variant;
  return rest;
}

/**
 * Initialize variants from product data with proper priority order.
 * 
 * Priority:
 * 1. Use product.variants if available
 * 2. Use product.display_variant if available
 * 3. Create synthetic variant from deprecated flattened fields (TEMPORARY)
 * 
 * @param product - Product detail view
 * @returns Array of variant inputs for form state
 */
export function initializeVariantsFromProduct(product: ProductDetailView): ProductVariantInput[] {
  // Priority 1: Use existing variants
  if (product.variants.length > 0) {
    return product.variants.map(mapVariantToInput);
  }
  
  // Priority 2: Use display_variant if available
  if (product.display_variant) {
    return [mapVariantToInput(product.display_variant)];
  }
  
  // Priority 3: TEMPORARY compatibility fallback
  // Create a synthetic "Default" variant from deprecated flattened fields
  // TODO: Remove this fallback when backend guarantees display_variant (v2.0)
  return [createCompatibilityFallbackVariant(product)];
}

/**
 * Map a ProductVariant to ProductVariantInput.
 */
function mapVariantToInput(variant: ProductVariant, index: number = 0): ProductVariantInput {
  return {
    id: variant.id,
    // Key is deprecated but kept for React list rendering compatibility
    key: variant.attributes.map((attr) => `${attr.name}:${attr.value}`).join('|') ||
         `variant-${variant.id}-${index}`,
    label: variant.label ?? 
           variant.attributes
             .map((attr) => attr.label?.trim() || attr.value)
             .filter(Boolean)
             .join(' / ') ||
           `Variant ${index + 1}`,
    sku: variant.sku ?? null,
    barcode: variant.barcode ?? null,
    price: variant.price ?? 0,
    compare_at_price: variant.compare_at_price ?? null,
    cost_price: variant.cost_price ?? null,
    quantity: variant.quantity ?? 0,
    low_stock_threshold: variant.low_stock_threshold ?? null,
    track_inventory: variant.track_inventory ?? true,
    is_active: variant.is_active,
    weight: variant.weight ?? null,
    weight_unit: variant.weight_unit ?? null,
    attributes: variant.attributes ?? [],
  };
}

/**
 * Create a compatibility fallback variant from deprecated flattened fields.
 * 
 * WARNING: This is temporary migration logic.
 * TODO: Remove when backend v2.0 is deployed with guaranteed display_variant.
 */
function createCompatibilityFallbackVariant(product: ProductDetailView): ProductVariantInput {
  return {
    // No ID - this is a synthetic variant
    key: 'default',
    label: 'Default Variant',
    sku: product.sku ?? null,
    barcode: product.barcode ?? null,
    price: product.price ?? 0,
    compare_at_price: product.compareAtPrice ?? null,
    cost_price: product.costPerItem ?? null,
    quantity: product.quantity ?? 0,
    low_stock_threshold: null,
    track_inventory: product.trackQuantity,
    is_active: true,
    weight: product.weight ?? null,
    weight_unit: product.weightUnit ?? null,
    attributes: [],
  };
}

/**
 * Get the primary/default variant ID from product data.
 * 
 * Priority:
 * 1. display_variant.id if available
 * 2. First variant's id if variants exist
 * 3. undefined if no variants available
 */
export function getPrimaryVariantId(product: ProductDetailView): number | undefined {
  if (product.display_variant?.id) {
    return product.display_variant.id;
  }
  if (product.variants.length > 0) {
    return product.variants[0].id;
  }
  return undefined;
}

/**
 * Calculate total stock from variants.
 * Falls back to product.total_stock if available.
 */
export function calculateTotalStock(variants: ProductVariant[]): number {
  if (variants.length === 0) {
    return 0;
  }
  return variants.reduce((sum, variant) => sum + (variant.quantity ?? 0), 0);
}
