import type * as React from 'react';

export type SelectOption<V extends string> = Readonly<{
  value: V;
  label: React.ReactNode;
}>;

export function makeLabelByValue<const O extends readonly SelectOption<string>[]>(
  options: O
): Record<O[number]['value'], React.ReactNode> {
  return Object.fromEntries(options.map((o) => [o.value, o.label])) as Record<
    O[number]['value'],
    React.ReactNode
  >;
}

export function renderSelectValue<V extends string>(
  labelByValue: Partial<Record<V, React.ReactNode>>,
  placeholder?: React.ReactNode
) {
  return (value: V | null) => {
    if (value == null) return placeholder ?? null;
    return labelByValue[value] ?? value;
  };
}

