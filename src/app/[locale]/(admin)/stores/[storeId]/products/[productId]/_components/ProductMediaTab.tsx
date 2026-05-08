'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { ProductImage } from '@/types/product';
import { ProductImagesManager } from './ProductImagesManager';

interface Props {
  images: ProductImage[];
  onChange: (next: ProductImage[]) => void;
}

export function ProductMediaTab({ images, onChange }: Props) {
  return (
    <Card>
      <CardContent className="pt-6">
        <ProductImagesManager images={images} onChange={onChange} />
      </CardContent>
    </Card>
  );
}
