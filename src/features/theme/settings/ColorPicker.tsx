'use client';

/**
 * Color picker component.
 * Allows selecting colors with HEX input and visual preview.
 */

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const t = useTranslations('theme-settings.colorPicker');
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    // Validate HEX color
    if (/^#[0-9A-F]{6}$/i.test(newValue)) {
      onChange(newValue);
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="flex gap-2">
      <Popover>
        <PopoverTrigger
          render={
            <button
              type="button"
              className="h-10 w-12 rounded-md border-2 border-input p-0"
              style={{ backgroundColor: value }}
              aria-label={t('pickColor')}
            />
          }
        />
        <PopoverContent className="w-64">
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('colorPicker')}</label>
              <input
                type="color"
                value={value}
                onChange={handleColorChange}
                className="w-full h-32 cursor-pointer rounded border"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('hexValue')}</label>
              <Input
                value={localValue}
                onChange={handleInputChange}
                placeholder="#000000"
                className="font-mono"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Input
        value={localValue}
        onChange={handleInputChange}
        placeholder="#000000"
        className="flex-1 font-mono"
      />
    </div>
  );
}
