/// <reference types="jest" />

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock('@/components/ui/label', () => ({
  Label: (props: { children: unknown }) => ({ type: 'Label', props } as any),
}));

jest.mock('@/components/ui/select', () => ({
  Select: (props: { children: unknown }) => ({ type: 'Select', props } as any),
  SelectTrigger: (props: { children: unknown }) => ({ type: 'SelectTrigger', props } as any),
  SelectValue: (props: { children?: unknown }) => ({ type: 'SelectValue', props } as any),
  SelectContent: (props: { children: unknown }) => ({ type: 'SelectContent', props } as any),
  SelectItem: (props: { value: string; children: unknown }) => ({ type: 'SelectItem', props } as any),
}));

import { StatusSelect } from '../_components/StatusSelect';
import * as Select from '@/components/ui/select';

function collectSelectItemValues(node: any, out: string[] = []): string[] {
  if (!node) return out;

  if (Array.isArray(node)) {
    node.forEach((child) => collectSelectItemValues(child, out));
    return out;
  }

  if (node.type === (Select as any).SelectItem) {
    out.push(node.props.value);
  }

  if (node.props?.children) {
    collectSelectItemValues(node.props.children, out);
  }

  return out;
}

describe('product status contract', () => {
  it('does not render an inactive product status option', () => {
    const tree = StatusSelect({ value: 'draft', onChange: jest.fn() } as any);

    const values = collectSelectItemValues(tree);

    expect(values).toEqual(['active', 'draft']);
    expect(values).not.toContain('inactive');
  });
});
