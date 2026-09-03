'use client';

import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface TypographySettings {
  headingFont: string;
  bodyFont: string;
  headingWeight: 'normal' | 'medium' | 'semibold' | 'bold';
  bodyWeight: 'normal' | 'medium' | 'semibold' | 'bold';
  baseFontSize: 'sm' | 'base' | 'lg';
  lineHeight: 'tight' | 'normal' | 'relaxed';
  letterSpacing: 'tight' | 'normal' | 'wide';
}

interface TypographySettingsEditorProps {
  value: TypographySettings;
  onChange: (value: TypographySettings) => void;
}

const FONT_OPTIONS = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Raleway',
  'cursive',
  'Ubuntu',
  'Playfair Display',
  'Merriweather',
  'Nunito',
  'PT Sans',
  'Source Sans Pro',
  'Work Sans',
];

export function TypographySettingsEditor({ value, onChange }: TypographySettingsEditorProps) {
  const t = useTranslations('theme-settings');

  const updateField = <K extends keyof TypographySettings>(field: K, fieldValue: TypographySettings[K]) => {
    onChange({ ...value, [field]: fieldValue });
  };

  const handleSelectChange = <K extends keyof TypographySettings>(
    field: K,
    newValue: string | null
  ) => {
    if (newValue !== null) {
      updateField(field, newValue as TypographySettings[K]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('typography.title')}</CardTitle>
        <CardDescription>{t('typography.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Heading Font */}
          <div className="space-y-2">
            <Label>
              <div className="font-medium">{t('typography.headingFont.label')}</div>
              <div className="text-xs text-muted-foreground font-normal mt-0.5">
                {t('typography.headingFont.description')}
              </div>
            </Label>
            <Select
              value={value.headingFont}
              onValueChange={(v) => handleSelectChange('headingFont', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_OPTIONS.map((font) => (
                  <SelectItem key={font} value={font}>
                    <span style={{ fontFamily: font }}>{font}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Body Font */}
          <div className="space-y-2">
            <Label>
              <div className="font-medium">{t('typography.bodyFont.label')}</div>
              <div className="text-xs text-muted-foreground font-normal mt-0.5">
                {t('typography.bodyFont.description')}
              </div>
            </Label>
            <Select
              value={value.bodyFont}
              onValueChange={(v) => handleSelectChange('bodyFont', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_OPTIONS.map((font) => (
                  <SelectItem key={font} value={font}>
                    <span style={{ fontFamily: font }}>{font}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Heading Weight */}
          <div className="space-y-2">
            <Label>
              <div className="font-medium">{t('typography.headingWeight.label')}</div>
              <div className="text-xs text-muted-foreground font-normal mt-0.5">
                {t('typography.headingWeight.description')}
              </div>
            </Label>
            <Select
              value={value.headingWeight}
              onValueChange={(v) => handleSelectChange('headingWeight', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">{t('typography.fontWeight.normal')}</SelectItem>
                <SelectItem value="medium">{t('typography.fontWeight.medium')}</SelectItem>
                <SelectItem value="semibold">{t('typography.fontWeight.semibold')}</SelectItem>
                <SelectItem value="bold">{t('typography.fontWeight.bold')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Body Weight */}
          <div className="space-y-2">
            <Label>
              <div className="font-medium">{t('typography.bodyWeight.label')}</div>
              <div className="text-xs text-muted-foreground font-normal mt-0.5">
                {t('typography.bodyWeight.description')}
              </div>
            </Label>
            <Select
              value={value.bodyWeight}
              onValueChange={(v) => handleSelectChange('bodyWeight', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">{t('typography.fontWeight.normal')}</SelectItem>
                <SelectItem value="medium">{t('typography.fontWeight.medium')}</SelectItem>
                <SelectItem value="semibold">{t('typography.fontWeight.semibold')}</SelectItem>
                <SelectItem value="bold">{t('typography.fontWeight.bold')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Base Font Size */}
          <div className="space-y-2">
            <Label>
              <div className="font-medium">{t('typography.baseFontSize.label')}</div>
              <div className="text-xs text-muted-foreground font-normal mt-0.5">
                {t('typography.baseFontSize.description')}
              </div>
            </Label>
            <Select
              value={value.baseFontSize}
              onValueChange={(v) => handleSelectChange('baseFontSize', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sm">{t('typography.fontSize.sm')}</SelectItem>
                <SelectItem value="base">{t('typography.fontSize.base')}</SelectItem>
                <SelectItem value="lg">{t('typography.fontSize.lg')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Line Height */}
          <div className="space-y-2">
            <Label>
              <div className="font-medium">{t('typography.lineHeight.label')}</div>
              <div className="text-xs text-muted-foreground font-normal mt-0.5">
                {t('typography.lineHeight.description')}
              </div>
            </Label>
            <Select
              value={value.lineHeight}
              onValueChange={(v) => handleSelectChange('lineHeight', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tight">{t('typography.lineHeightValue.tight')}</SelectItem>
                <SelectItem value="normal">{t('typography.lineHeightValue.normal')}</SelectItem>
                <SelectItem value="relaxed">{t('typography.lineHeightValue.relaxed')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Letter Spacing */}
          <div className="space-y-2">
            <Label>
              <div className="font-medium">{t('typography.letterSpacing.label')}</div>
              <div className="text-xs text-muted-foreground font-normal mt-0.5">
                {t('typography.letterSpacing.description')}
              </div>
            </Label>
            <Select
              value={value.letterSpacing}
              onValueChange={(v) => handleSelectChange('letterSpacing', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tight">{t('typography.letterSpacingValue.tight')}</SelectItem>
                <SelectItem value="normal">{t('typography.letterSpacingValue.normal')}</SelectItem>
                <SelectItem value="wide">{t('typography.letterSpacingValue.wide')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Typography Preview */}
        <div className="mt-8 pt-6 border-t">
          <h4 className="text-sm font-medium mb-4">{t('typography.preview')}</h4>
          <div className="space-y-6 p-6 rounded-lg border">
            {/* Heading Preview */}
            <div>
              <h1
                className="text-3xl mb-2"
                style={{
                  fontFamily: value.headingFont,
                  fontWeight: {
                    normal: '400',
                    medium: '500',
                    semibold: '600',
                    bold: '700',
                  }[value.headingWeight],
                }}
              >
                {t('typography.previewHeading')}
              </h1>
              <h2
                className="text-2xl mb-2"
                style={{
                  fontFamily: value.headingFont,
                  fontWeight: {
                    normal: '400',
                    medium: '500',
                    semibold: '600',
                    bold: '700',
                  }[value.headingWeight],
                }}
              >
                {t('typography.previewSubheading')}
              </h2>
            </div>

            {/* Body Text Preview */}
            <div>
              <p
                style={{
                  fontFamily: value.bodyFont,
                  fontWeight: {
                    normal: '400',
                    medium: '500',
                    semibold: '600',
                    bold: '700',
                  }[value.bodyWeight],
                  fontSize: {
                    sm: '14px',
                    base: '16px',
                    lg: '18px',
                  }[value.baseFontSize],
                  lineHeight: {
                    tight: '1.25',
                    normal: '1.5',
                    relaxed: '1.75',
                  }[value.lineHeight],
                  letterSpacing: {
                    tight: '-0.025em',
                    normal: '0',
                    wide: '0.025em',
                  }[value.letterSpacing],
                }}
              >
                {t('typography.previewBody')}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
