'use client';

import { useState } from 'react';

import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { ProductVariant } from '@/types/product';

interface Props {
  variants: ProductVariant[];
  onChange: (next: ProductVariant[]) => void;
}

function parseNumericInput(value: string): number {
  const normalized = value.trim();
  if (normalized === '') return 0;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function VariantsTable({ variants, onChange }: Props) {
  const [numericDrafts, setNumericDrafts] = useState<Record<string, string>>({});

  const patch = (id: ProductVariant['id'], next: Partial<ProductVariant>) =>
    onChange(variants.map((v) => (v.id === id ? { ...v, ...next } : v)));

  const updateDraft = (key: string, value: string) => {
    setNumericDrafts((prev) => ({ ...prev, [key]: value }));
  };

  const clearDraft = (key: string) => {
    setNumericDrafts((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleNumericChange = (
    id: ProductVariant['id'],
    field: 'price' | 'quantity',
    rawValue: string
  ) => {
    const draftKey = `${id}:${field}`;
    updateDraft(draftKey, rawValue);

    if (rawValue.trim() === '') {
      return;
    }

    const parsedValue = Number(rawValue.trim());
    if (!Number.isFinite(parsedValue)) {
      return;
    }

    patch(id, { [field]: parsedValue } as Pick<ProductVariant, 'price' | 'quantity'>);
  };

  const handleNumericBlur = (
    id: ProductVariant['id'],
    field: 'price' | 'quantity'
  ) => {
    const draftKey = `${id}:${field}`;
    const draftValue = numericDrafts[draftKey];
    if (draftValue === undefined) {
      return;
    }

    patch(id, { [field]: parseNumericInput(draftValue) } as Pick<ProductVariant, 'price' | 'quantity'>);
    clearDraft(draftKey);
  };

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
                  value={numericDrafts[`${variant.id}:price`] ?? String(variant.price ?? 0)}
                  onChange={(e) => handleNumericChange(variant.id, 'price', e.target.value)}
                  onBlur={() => handleNumericBlur(variant.id, 'price')}
                />
              </TableCell>
              <TableCell className="min-w-28">
                <Input
                  inputMode="numeric"
                  value={numericDrafts[`${variant.id}:quantity`] ?? String(variant.quantity ?? 0)}
                  onChange={(e) => handleNumericChange(variant.id, 'quantity', e.target.value)}
                  onBlur={() => handleNumericBlur(variant.id, 'quantity')}
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
