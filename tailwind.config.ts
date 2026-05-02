import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(var(--color-primary))',
          hover:   'hsl(var(--color-primary-hover))',
          light:   'hsl(var(--color-primary-light))',
          fore:    'hsl(var(--color-primary-fore))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--color-secondary))',
          hover:   'hsl(var(--color-secondary-hover))',
          light:   'hsl(var(--color-secondary-light))',
          fore:    'hsl(var(--color-secondary-fore))',
        },
        accent: {
          DEFAULT: 'hsl(var(--color-accent))',
          hover:   'hsl(var(--color-accent-hover))',
          light:   'hsl(var(--color-accent-light))',
          fore:    'hsl(var(--color-accent-fore))',
        },
        bg:      'hsl(var(--color-bg))',
        surface: 'hsl(var(--color-surface))',
        raised:  'hsl(var(--color-surface-raised))',
        border:  'hsl(var(--color-border))',
        'border-strong': 'hsl(var(--color-border-strong))',
        fore:    'hsl(var(--color-foreground))',
        muted:   'hsl(var(--color-muted))',
        subtle:  'hsl(var(--color-subtle))',
        sidebar: {
          bg:     'hsl(var(--color-sidebar-bg))',
          fore:   'hsl(var(--color-sidebar-fore))',
          muted:  'hsl(var(--color-sidebar-muted))',
          active: 'hsl(var(--color-sidebar-active))',
          border: 'hsl(var(--color-sidebar-border))',
          hover:  'hsl(var(--color-sidebar-hover))',
        },
        success: {
          DEFAULT: 'hsl(var(--color-success))',
          bg:      'hsl(var(--color-success-bg))',
        },
        warning: {
          DEFAULT: 'hsl(var(--color-warning))',
          bg:      'hsl(var(--color-warning-bg))',
        },
        danger: {
          DEFAULT: 'hsl(var(--color-danger))',
          bg:      'hsl(var(--color-danger-bg))',
        },
        info: {
          DEFAULT: 'hsl(var(--color-info))',
          bg:      'hsl(var(--color-info-bg))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Arabic', 'sans-serif'],
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
