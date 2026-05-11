'use client';

import { useMutation } from '@tanstack/react-query';

import { updateProduct } from '@/lib/api/products';
import queryClient from '@/lib/queryClient';
import { queryKeys } from '@/lib/queryKeys';
import { logger } from '@/lib/logger';

import { buildStructurePayload } from '@/lib/products/buildStructurePayload';

import type { AdminProduct } from '@/types/product';
import type { ApiError } from '@/types/api';
import type { ProductStructureState } from '@/types/product-editor';

export interface UseSaveProductStructureOptions {
  onSuccess?: (product: AdminProduct) => void;
  onError?: (error: ApiError) => void;
}

export function useSaveProductStructure(
  storeId: string,
  productId: string,
  options?: UseSaveProductStructureOptions
) {
  return useMutation<AdminProduct, ApiError, ProductStructureState>({
    mutationFn: (structure) =>
      updateProduct(storeId, productId, buildStructurePayload({ structure })),
    retry: 0,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products(storeId).lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.products(storeId).detail(productId),
      });
      logger.info('Product structure saved', { productId: data.id });
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      logger.error('Save product structure failed', { error });
      options?.onError?.(error);
    },
  });
}
