'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Save, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useTheme } from '@/hooks/themes/useTheme';
import { useUpdateThemeSettings, type ButtonSettings, type ColorSettings, type TypographySettings } from '@/hooks/themes/useThemeSettings';
import { ButtonStyleEditor } from '@/features/dashboard/theme-settings/components/ButtonStyleEditor';
import { ColorSettingsEditor } from '@/features/dashboard/theme-settings/components/ColorSettingsEditor';
import { TypographySettingsEditor } from '@/features/dashboard/theme-settings/components/TypographySettingsEditor';
import { ColorSchemeManager } from '@/features/theme/settings/ColorSchemeManager';
import { useBootstrapStore } from '@/stores/bootstrapStore';
import { WorkspaceEmptyState } from '@/features/merchant/components/WorkspaceEmptyState';
import { ROUTES } from '@/config/routes';
import type { ColorScheme } from '@/types/theme';
import { getStoreRouteParam } from '@/lib/stores/route-param';
import { getThemeRouteParam } from '@/lib/themes/route-param';

const defaultButtonSettings: ButtonSettings = {
  backgroundColor: '#3B82F6',
  textColor: '#FFFFFF',
  borderColor: '#3B82F6',
  borderWidth: 0,
  borderRadius: 'full',
  paddingX: 'lg',
  paddingY: 'md',
  fontSize: 'base',
  fontWeight: 'semibold',
  hoverEffect: 'opacity',
};

const defaultColorSettings: ColorSettings = {
  primary: '#3B82F6',
  secondary: '#10B981',
  accent: '#F59E0B',
  background: '#FFFFFF',
  text: '#1F2937',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
};

const defaultTypographySettings: TypographySettings = {
  headingFont: 'Inter',
  bodyFont: 'Inter',
  headingWeight: 'semibold',
  bodyWeight: 'normal',
  baseFontSize: 'base',
  lineHeight: 'normal',
  letterSpacing: 'normal',
};

export default function ThemeSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('theme-settings');
  const activeStore = useBootstrapStore((state) => state.activeStore);
  
  const storeSlug = activeStore ? getStoreRouteParam(activeStore) : '';
  const themeIdentifier = params.theme as string;

  const { data: theme, isLoading } = useTheme(storeSlug, themeIdentifier, {
    enabled: !!storeSlug,
  });

  const updateMutation = useUpdateThemeSettings(
    storeSlug,
    themeIdentifier
  );

  // Initialize button settings from theme or defaults
  const [buttonSettings, setButtonSettings] = useState<{
    primary: ButtonSettings;
    secondary: ButtonSettings;
    outline: ButtonSettings;
  }>({
    primary: {
      ...defaultButtonSettings,
      backgroundColor: '#FFFFFF',
      textColor: '#3B82F6',
      borderColor: '#FFFFFF',
    },
    secondary: {
      ...defaultButtonSettings,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderColor: 'rgba(255, 255, 255, 0.4)',
      borderWidth: 1,
    },
    outline: {
      ...defaultButtonSettings,
      backgroundColor: 'transparent',
      borderColor: 'rgba(255, 255, 255, 0.6)',
      borderWidth: 2,
    },
  });

  // Initialize color settings from theme or defaults
  const [colorSettings, setColorSettings] = useState<ColorSettings>(defaultColorSettings);

  // Initialize typography settings from theme or defaults
  const [typographySettings, setTypographySettings] = useState<TypographySettings>(defaultTypographySettings);

  // Initialize color schemes from theme or defaults
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

  // Update settings when theme loads
  useEffect(() => {
    if (theme?.settings) {
      const themeSettings = theme.settings as any;
      
      // Update button settings
      const themeButtons = themeSettings?.buttons;
      if (themeButtons) {
        // Clean any array values that might have been corrupted
        const cleanButtons = (btn: any) => {
          if (!btn) return null;
          const cleaned: any = {};
          for (const key in btn) {
            cleaned[key] = Array.isArray(btn[key]) ? btn[key][0] : btn[key];
          }
          return cleaned;
        };

        setButtonSettings({
          primary: cleanButtons(themeButtons.primary) || buttonSettings.primary,
          secondary: cleanButtons(themeButtons.secondary) || buttonSettings.secondary,
          outline: cleanButtons(themeButtons.outline) || buttonSettings.outline,
        });
      }

      // Update color settings
      const themeColors = themeSettings?.colors;
      if (themeColors) {
        // Clean any array values that might have been corrupted
        const cleanedColors: ColorSettings = {
          primary: Array.isArray(themeColors.primary) ? themeColors.primary[0] : themeColors.primary,
          secondary: Array.isArray(themeColors.secondary) ? themeColors.secondary[0] : themeColors.secondary,
          accent: Array.isArray(themeColors.accent) ? themeColors.accent[0] : (themeColors.accent || defaultColorSettings.accent),
          background: Array.isArray(themeColors.background) ? themeColors.background[0] : themeColors.background,
          text: Array.isArray(themeColors.text) ? themeColors.text[0] : themeColors.text,
          textMuted: Array.isArray(themeColors.textMuted) ? themeColors.textMuted[0] : (themeColors.textMuted || defaultColorSettings.textMuted),
          border: Array.isArray(themeColors.border) ? themeColors.border[0] : (themeColors.border || defaultColorSettings.border),
          success: Array.isArray(themeColors.success) ? themeColors.success[0] : (themeColors.success || defaultColorSettings.success),
          error: Array.isArray(themeColors.error) ? themeColors.error[0] : (themeColors.error || defaultColorSettings.error),
          warning: Array.isArray(themeColors.warning) ? themeColors.warning[0] : (themeColors.warning || defaultColorSettings.warning),
        };
        setColorSettings(cleanedColors);
      }

      // Update typography settings
      const themeTypography = themeSettings?.typography;
      if (themeTypography) {
        // Clean any array values
        const cleanedTypography: TypographySettings = {
          headingFont: Array.isArray(themeTypography.headingFont) ? themeTypography.headingFont[0] : (themeTypography.headingFont || defaultTypographySettings.headingFont),
          bodyFont: Array.isArray(themeTypography.bodyFont) ? themeTypography.bodyFont[0] : (themeTypography.bodyFont || defaultTypographySettings.bodyFont),
          headingWeight: Array.isArray(themeTypography.headingWeight) ? themeTypography.headingWeight[0] : (themeTypography.headingWeight || defaultTypographySettings.headingWeight),
          bodyWeight: Array.isArray(themeTypography.bodyWeight) ? themeTypography.bodyWeight[0] : (themeTypography.bodyWeight || defaultTypographySettings.bodyWeight),
          baseFontSize: Array.isArray(themeTypography.baseFontSize) ? themeTypography.baseFontSize[0] : (themeTypography.baseFontSize || defaultTypographySettings.baseFontSize),
          lineHeight: Array.isArray(themeTypography.lineHeight) ? themeTypography.lineHeight[0] : (themeTypography.lineHeight || defaultTypographySettings.lineHeight),
          letterSpacing: Array.isArray(themeTypography.letterSpacing) ? themeTypography.letterSpacing[0] : (themeTypography.letterSpacing || defaultTypographySettings.letterSpacing),
        };
        setTypographySettings(cleanedTypography);
      }

      // Update color schemes
      if (themeSettings?.color_schemes) {
        setColorSchemes(themeSettings.color_schemes);
      }
    }
  }, [theme]);

  const handleSave = async () => {
    if (!activeStore) {
      toast.error(t('error'));
      return;
    }

    try {
      await updateMutation.mutateAsync({
        settings: {
          buttons: buttonSettings,
          colors: colorSettings,
          typography: typographySettings,
          color_schemes: colorSchemes,
        },
      });
      toast.success(t('saved'));
    } catch (error) {
      console.log('here its' ,{error})
      // Display the actual error message from the backend
      const errorMessage = error instanceof Error && 'message' in error 
        ? error.message 
        : t('error');
      toast.error(errorMessage);
      console.error('Failed to update theme settings:', error);
    }
  };

  // Show empty state if no active store
  if (!activeStore) {
    return (
      <WorkspaceEmptyState
        title={t('title')}
        message="No active store selected"
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(ROUTES.merchant.theme.overview())}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{t('title')}</h1>
            <p className="text-sm text-muted-foreground">
              {theme?.name || t('theme')}
            </p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending}
        >
          <Save className="h-4 w-4 mr-2" />
          {updateMutation.isPending ? t('saving') : t('save')}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="buttons" className="w-full">
        <TabsList className="bg-muted-foreground/15">
          <TabsTrigger value="buttons">{t('tabs.buttons')}</TabsTrigger>
          <TabsTrigger value="colors">{t('tabs.colors')}</TabsTrigger>
          <TabsTrigger value="typography">{t('tabs.typography')}</TabsTrigger>
          <TabsTrigger value="colorSchemes">{t('tabs.colorSchemes')}</TabsTrigger>
        </TabsList>

        <TabsContent value="buttons" className="space-y-6 mt-6">
          {/* Primary Button */}
          <ButtonStyleEditor
            label={t('buttons.primary.label')}
            description={t('buttons.primary.description')}
            value={buttonSettings.primary}
            onChange={(value) =>
              setButtonSettings((prev) => ({ ...prev, primary: value }))
            }
          />

          {/* Secondary Button */}
          <ButtonStyleEditor
            label={t('buttons.secondary.label')}
            description={t('buttons.secondary.description')}
            value={buttonSettings.secondary}
            onChange={(value) =>
              setButtonSettings((prev) => ({ ...prev, secondary: value }))
            }
          />

          {/* Outline Button */}
          <ButtonStyleEditor
            label={t('buttons.outline.label')}
            description={t('buttons.outline.description')}
            value={buttonSettings.outline}
            onChange={(value) =>
              setButtonSettings((prev) => ({ ...prev, outline: value }))
            }
          />
        </TabsContent>

        <TabsContent value="colors" className="space-y-6 mt-6">
          <ColorSettingsEditor
            value={colorSettings}
            onChange={setColorSettings}
          />
        </TabsContent>

        <TabsContent value="typography" className="space-y-6 mt-6">
          <TypographySettingsEditor
            value={typographySettings}
            onChange={setTypographySettings}
          />
        </TabsContent>

        <TabsContent value="colorSchemes" className="space-y-6 mt-6">
          <ColorSchemeManager
            colorSchemes={colorSchemes}
            onChange={setColorSchemes}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
