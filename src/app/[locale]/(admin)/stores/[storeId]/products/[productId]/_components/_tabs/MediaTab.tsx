'use client';

import type { ProductImage } from '@/types/product';
import { ProductMediaTab } from '../ProductMediaTab';

interface Props {
  images: ProductImage[];
  onChange: (next: ProductImage[]) => void;
}

export function MediaTab({ images, onChange }: Props) {
  return <ProductMediaTab images={images} onChange={onChange} />;
}
