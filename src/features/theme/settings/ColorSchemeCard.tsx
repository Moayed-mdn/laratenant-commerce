'use client';

/**
 * Color Scheme Card Component
 * Displays a single color scheme with preview
 */

import { Edit2, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ColorScheme } from '@/types/theme';

interface ColorSchemeCardProps {
  schemeKey: string;
  scheme: ColorScheme;
  onEdit: () => void;
  onDelete: () => void;
  canDelete: boolean;
}

export function ColorSchemeCard({ schemeKey, scheme, onEdit, onDelete, canDelete }: ColorSchemeCardProps) {
  const t = useTranslations('theme-settings.colorSchemeCard');
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{scheme.name}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">{t('keyLabel', { key: schemeKey })}</p>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onEdit}
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            {canDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={onDelete}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Preview Section */}
        <div
          className="rounded-lg p-4 border"
          style={{
            backgroundColor: scheme.background,
            color: scheme.text,
            borderColor: scheme.border,
          }}
        >
          <p className="text-sm font-medium mb-2">{t('preview')}</p>
          <p className="text-xs mb-3 opacity-80">{t('previewSample')}</p>
          <button
            className="text-xs px-3 py-1.5 rounded-md font-medium"
            style={{
              backgroundColor: scheme.button_background,
              color: scheme.button_text,
            }}
          >
            {t('button')}
          </button>
        </div>

        {/* Color Swatches */}
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <div
              className="h-8 rounded border"
              style={{ backgroundColor: scheme.background }}
              title={t('background')}
            />
            <p className="text-[10px] text-muted-foreground truncate">{t('background')}</p>
          </div>
          <div className="space-y-1">
            <div
              className="h-8 rounded border flex items-center justify-center"
              style={{ backgroundColor: scheme.text }}
              title={t('text')}
            >
              <span className="text-[8px] font-bold" style={{ color: scheme.background }}>A</span>
            </div>
            <p className="text-[10px] text-muted-foreground truncate">{t('text')}</p>
          </div>
          <div className="space-y-1">
            <div
              className="h-8 rounded border"
              style={{ backgroundColor: scheme.button_background }}
              title={t('button')}
            />
            <p className="text-[10px] text-muted-foreground truncate">{t('button')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
