'use client';

/**
 * Hook for creating a new product.
 */

import { useMutation } from '@tanstack/react-query';
import { createProduct } from '@/lib/api/products';
import queryClient from '@/lib/queryClient';
import { queryKeys } from '@/lib/queryKeys';
import { logger } from '@/lib/logger';
import type { AdminProduct, ProductCreatePayload } from '@/types/product';
import type { ApiError } from '@/types/api';

export interface UseCreateProductOptions {
  onSuccess?: (product: AdminProduct) => void;
  onError?: (error: ApiError) => void;
}

export function useCreateProduct(storeId: string, options?: UseCreateProductOptions) {
  return useMutation({
    mutationFn: (payload: ProductCreatePayload) => createProduct(storeId, payload),
    retry: 0,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products(storeId).lists() });
      logger.info('Product created', { productId: data.id });
      options?.onSuccess?.(data);
    },
    onError: (error: ApiError) => {
      logger.error('Create product failed', { error });
      options?.onError?.(error);
    },
  });
}
