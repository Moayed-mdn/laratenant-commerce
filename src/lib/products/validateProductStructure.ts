import type { ProductStructureState } from '@/types/product-editor';
import type { ValidationError, ValidationResult } from './validateProductContent';

/**
 * Validates product structure (SKUs, prices, quantities, attributes).
 * Returns a structured ValidationResult.
 */
export function validateProductStructure(
  state: ProductStructureState
): ValidationResult {
  const errors: ValidationError[] = [];
  const skus = new Set<string>();

  (state.variants ?? []).forEach((v, index) => {
    const prefix = `variants.${index}`;

    // SKU uniqueness
    if (v.sku) {
      const normalizedSku = v.sku.trim().toLowerCase();
      if (skus.has(normalizedSku)) {
        errors.push({ field: `${prefix}.sku`, message: `Duplicate SKU: ${v.sku}` });
      }
      skus.add(normalizedSku);
    }

    // Price validation
    if (v.price < 0) {
      errors.push({ field: `${prefix}.price`, message: 'Price cannot be negative.' });
    }

    // Quantity validation
    if (v.quantity < 0) {
      errors.push({ field: `${prefix}.quantity`, message: 'Quantity cannot be negative.' });
    }

    // Date consistency
    if (v.manufacture_date && v.expiry_date) {
      const mDate = new Date(v.manufacture_date);
      const eDate = new Date(v.expiry_date);
      if (eDate < mDate) {
        errors.push({ field: `${prefix}.expiry_date`, message: 'Expiry date cannot be before manufacture date.' });
      }
    }

    // Attribute integrity (every variant must have consistent attributes if options exist)
    if (state.options.length > 0) {
      const validAttributes = (v.attributes ?? []).filter(
        (a) => a.attribute_id !== null && a.attribute_value_id !== null
      );
      if (validAttributes.length !== state.options.length) {
        errors.push({ field: `${prefix}.attributes`, message: 'Variant is missing attribute values.' });
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}
