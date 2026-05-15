'use client';

import type { ProductOption } from '@/types/product';
import { ProductOptionsSection } from '@/features/products/editor/components/ProductOptionsSection';

interface Props {
  options: ProductOption[];
  onChange: (next: ProductOption[]) => void;
}

export function OptionsEditor({ options, onChange }: Props) {
  return <ProductOptionsSection options={options} onChange={onChange} />;
}
