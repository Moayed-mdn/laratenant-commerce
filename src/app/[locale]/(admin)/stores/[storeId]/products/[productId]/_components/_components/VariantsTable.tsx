'use client';

import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { ProductVariant } from '@/types/product';

interface Props {
  variants: ProductVariant[];
  onChange: (next: ProductVariant[]) => void;
}

export function VariantsTable({ variants, onChange }: Props) {
  const patch = (id: ProductVariant['id'], next: Partial<ProductVariant>) =>
    onChange(variants.map((v) => (v.id === id ? { ...v, ...next } : v)));

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead className="text-right">Active</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {variants.map((variant) => (
            <TableRow key={variant.id}>
              <TableCell className="min-w-40">
                <Input
                  value={variant.sku ?? ''}
                  onChange={(e) => patch(variant.id, { sku: e.target.value })}
                />
              </TableCell>
              <TableCell className="min-w-28">
                <Input
                  inputMode="decimal"
                  value={String(variant.price ?? 0)}
                  onChange={(e) => patch(variant.id, { price: Number(e.target.value || 0) })}
                />
              </TableCell>
              <TableCell className="min-w-28">
                <Input
                  inputMode="numeric"
                  value={String(variant.quantity ?? 0)}
                  onChange={(e) => patch(variant.id, { quantity: Number(e.target.value || 0) })}
                />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end">
                  <Switch
                    checked={variant.is_active}
                    onCheckedChange={(checked) => patch(variant.id, { is_active: checked })}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
