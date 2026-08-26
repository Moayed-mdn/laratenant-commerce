'use client';

/**
 * Theme settings page content (client component).
 * Global theme settings editor (colors, fonts, layout).
 */

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/navigation';
import { useThemes } from '@/hooks/themes/useThemes';
import { useUpdateTheme } from '@/hooks/themes/useThemeMutations';
import { useBootstrapStore } from '@/stores/bootstrapStore';
import { ColorPicker } from './ColorPicker';
import { FontSelector } from './FontSelector';
import { ColorSchemeManager } from './ColorSchemeManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ROUTES } from '@/config/routes';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { DEFAULT_COLORS, DEFAULT_FONTS } from '@/lib/fonts';
import type { ThemeSettings, ColorScheme } from '@/types/theme';
import { getStoreRouteParam } from '@/lib/stores/route-param';
import { getThemeRouteParam, matchesThemeIdentifier } from '@/lib/themes/route-param';

export function ThemeSettingsContent({ themeIdentifier }: { themeIdentifier: string }) {
  const t = useTranslations();
  const router = useRouter();
  const activeStore = useBootstrapStore((state) => state.activeStore);
  
  // Fetch themes to get the specific theme
  const activeStoreSlug = activeStore ? getStoreRouteParam(activeStore) : null;
  const { data: themesData } = useThemes(activeStoreSlug!, {
    page: 1,
    perPage: 100, // Get all themes
  });

  const currentTheme = themesData?.data.find((theme) => matchesThemeIdentifier(theme, themeIdentifier));
  const updateMutation = useUpdateTheme(activeStoreSlug!);

  // Settings state
  const [colors, setColors] = useState({
    primary: DEFAULT_COLORS.primary,
    secondary: DEFAULT_COLORS.secondary,
    accent: DEFAULT_COLORS.accent,
    background: DEFAULT_COLORS.background,
    text: DEFAULT_COLORS.text,
  });

  const [fonts, setFonts] = useState({
    heading: DEFAULT_FONTS.heading,
    body: DEFAULT_FONTS.body,
  });

  const [colorSchemes, setColorSchemes] = useState<Record<string, ColorScheme>>({
    default: {
      name: 'Default',
      background: '#FFFFFF',
      text: '#1F2937',
      button_background: '#3B82F6',
      button_text: '#FFFFFF',
      secondary_background: '#F3F4F6',
      border: '#E5E7EB',
    },
    brand: {
      name: 'Brand',
      background: '#3B82F6',
      text: '#FFFFFF',
      button_background: '#FFFFFF',
      button_text: '#3B82F6',
      secondary_background: '#2563EB',
      border: 'rgba(255, 255, 255, 0.2)',
    },
    dark: {
      name: 'Dark',
      background: '#1F2937',
      text: '#FFFFFF',
      button_background: '#F59E0B',
      button_text: '#000000',
      secondary_background: '#374151',
      border: '#4B5563',
    },
    light: {
      name: 'Light',
      background: '#F9FAFB',
      text: '#1F2937',
      button_background: '#3B82F6',
      button_text: '#FFFFFF',
      secondary_background: '#FFFFFF',
      border: '#E5E7EB',
    },
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Load settings from current theme
  useEffect(() => {
    if (currentTheme) {
      const settings = currentTheme as unknown as { settings?: ThemeSettings };
      const themeSettings = settings.settings;
      if (themeSettings) {
        if (themeSettings.colors) {
          setColors((prev) => ({ ...prev, ...themeSettings.colors }));
        }
        if (themeSettings.fonts) {
          setFonts((prev) => ({ ...prev, ...themeSettings.fonts }));
        }
        if (themeSettings.color_schemes) {
          setColorSchemes(themeSettings.color_schemes);
        }
      }
    }
  }, [currentTheme]);

  const handleColorChange = (key: string, value: string) => {
    setColors((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleFontChange = (key: string, value: string) => {
    setFonts((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleColorSchemesChange = (schemes: Record<string, ColorScheme>) => {
    setColorSchemes(schemes);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!currentTheme) {
      toast.error(t('theme.settings.noThemeFound'));
      return;
    }

    try {
      const themeIdentifier = getThemeRouteParam(currentTheme);

      await updateMutation.mutateAsync({
        themeSlug: themeIdentifier,
        payload: {
          settings: {
            colors,
            fonts,
            color_schemes: colorSchemes,
          },
        },
      });

      toast.success(t('theme.settings.saveSuccess'));
      setHasChanges(false);
    } catch (error: any) {
      toast.error(error?.message ?? t('theme.settings.saveError'));
    }
  };

  if (!currentTheme) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(ROUTES.merchant.theme.overview())}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back')}
          </Button>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {t('theme.settings.noThemeFound')}
            </p>
            <Button
              className="mt-4"
              onClick={() => router.push(ROUTES.merchant.theme.overview())}
            >
              {t('theme.goToThemes')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(ROUTES.merchant.theme.overview())}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back')}
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t('theme.settings.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('theme.settings.subtitle')}
            </p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || updateMutation.isPending}
        >
          <Save className="mr-2 h-4 w-4" />
          {updateMutation.isPending ? t('common.saving') : t('common.save')}
        </Button>
      </div>

      {/* Current Theme Info */}
      <Card>
        <CardHeader>
          <CardTitle>{t('theme.settings.editingTheme')}</CardTitle>
          <CardDescription>
            {currentTheme.name}
            {currentTheme.isActive && (
              <span className="ml-2 text-xs text-primary">
                ({t('theme.active')})
              </span>
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Color Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{t('theme.settings.colors')}</CardTitle>
          <CardDescription>
            {t('theme.settings.colorsDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>{t('theme.settings.primaryColor')}</Label>
              <ColorPicker
                value={colors.primary}
                onChange={(value) => handleColorChange('primary', value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('theme.settings.secondaryColor')}</Label>
              <ColorPicker
                value={colors.secondary}
                onChange={(value) => handleColorChange('secondary', value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('theme.settings.accentColor')}</Label>
              <ColorPicker
                value={colors.accent}
                onChange={(value) => handleColorChange('accent', value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('theme.settings.backgroundColor')}</Label>
              <ColorPicker
                value={colors.background}
                onChange={(value) => handleColorChange('background', value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('theme.settings.textColor')}</Label>
              <ColorPicker
                value={colors.text}
                onChange={(value) => handleColorChange('text', value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Font Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{t('theme.settings.typography')}</CardTitle>
          <CardDescription>
            {t('theme.settings.typographyDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>{t('theme.settings.headingFont')}</Label>
              <FontSelector
                value={fonts.heading}
                onChange={(value) => handleFontChange('heading', value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('theme.settings.bodyFont')}</Label>
              <FontSelector
                value={fonts.body}
                onChange={(value) => handleFontChange('body', value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Color Scheme Settings */}
      <ColorSchemeManager
        colorSchemes={colorSchemes}
        onChange={handleColorSchemesChange}
      />
    </div>
  );
}
