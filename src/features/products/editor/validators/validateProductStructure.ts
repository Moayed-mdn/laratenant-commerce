import type { ProductStructureState } from '@/features/products/editor/types/product-editor';
import type { ValidationError, ValidationResult } from './validateProductContent';

/**
 * Validates product structure state before sending to the backend.
 *
 * Checks:
 * - SKU uniqueness across variants
 * - Price non-negative
 * - Quantity non-negative
 * - Expiry date not before manufacture date
 * - Every variant has an option assignment for each defined option
 *   (only when options exist)
 */
export function validateProductStructure(
  state: ProductStructureState
): ValidationResult {
  const errors: ValidationError[] = [];
  const skus = new Set<string>();

  (state.variants ?? []).forEach((v, index) => {
    const prefix = `variants.${index}`;

    // ── SKU uniqueness ───────────────────────────────────────────
    if (v.sku) {
      const normalizedSku = v.sku.trim().toLowerCase();
      if (skus.has(normalizedSku)) {
        errors.push({
          field: `${prefix}.sku`,
          message: `Duplicate SKU: ${v.sku}`,
        });
      }
      skus.add(normalizedSku);
    }

    // ── Price ────────────────────────────────────────────────────
    if (v.price < 0) {
      errors.push({
        field: `${prefix}.price`,
        message: 'Price cannot be negative.',
      });
    }

    // ── Quantity ─────────────────────────────────────────────────
    if (v.quantity < 0) {
      errors.push({
        field: `${prefix}.quantity`,
        message: 'Quantity cannot be negative.',
      });
    }

    // ── Date consistency ─────────────────────────────────────────
    if (v.manufacture_date && v.expiry_date) {
      const mDate = new Date(v.manufacture_date);
      const eDate = new Date(v.expiry_date);
      if (eDate < mDate) {
        errors.push({
          field: `${prefix}.expiry_date`,
          message: 'Expiry date cannot be before manufacture date.',
        });
      }
    }

    // ── Option coverage ──────────────────────────────────────────
    // Every variant must have an option assignment for each
    // option defined at the product level.
    if (state.options.length > 0) {
      const assignedOptionNames = new Set(
        (v.options ?? [])
          .filter(
            (o) =>
              o.option_name?.trim() !== '' &&
              o.option_value?.trim() !== ''
          )
          .map((o) => o.option_name.trim())
      );

      const missingOptions = state.options
        .map((o) => o.name.trim())
        .filter((name) => !assignedOptionNames.has(name));

      if (missingOptions.length > 0) {
        errors.push({
          field: `${prefix}.options`,
          message: `Variant is missing values for: ${missingOptions.join(', ')}.`,
        });
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}
