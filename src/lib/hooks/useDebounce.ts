'use client';

/**
 * Debounce hook.
 * Returns a debounced value that updates after the specified delay.
 */

import { useState, useEffect } from 'react';

/**
 * Debounce a value by the specified delay.
 * Default delay is 300ms (hard rule — search must use 300ms).
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, delay]);

  return debouncedValue;
}
