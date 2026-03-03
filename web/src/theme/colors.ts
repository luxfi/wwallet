// Color tokens matching Lux Exchange design system
// Source: ~/work/lux/exchange/packages/ui/src/theme/color/colors.ts

export const colors = {
  // Neutral
  neutral: { light: '#131313', dark: '#FFFFFF' },

  // Surfaces
  surface1: { light: '#FFFFFF', dark: '#000000' },
  surface2: { light: '#F9F9F9', dark: '#0A0A0A' },
  surface3: { light: '#F2F2F2', dark: '#131313' },
  surface4: { light: '#EBEBEB', dark: '#1A1A1A' },
  surface5: { light: '#E0E0E0', dark: '#242424' },

  // Accent
  accent1: { light: '#131313', dark: '#FFFFFF' },
  accent2: { light: '#7D7D7D', dark: '#9B9B9B' },

  // Status
  success: { light: '#0C8911', dark: '#21C95E' },
  warning: { light: '#996F01', dark: '#FFBF17' },
  critical: { light: '#E10F0F', dark: '#FF593C' },

  // Brand accents
  blue: '#4C82FB',
  pink: '#FC74FE',
  purple: '#9E62FF',

  // Network colors
  ethereum: '#627EEA',
  lux: '#E84142',
  bitcoin: '#F7931A',
  solana: '#9945FF',
} as const

export const darkTheme = {
  background: '#000000',
  surface: '#131313',
  surfaceHover: '#1A1A1A',
  surfaceActive: '#242424',
  border: '#242424',
  borderHover: '#333333',
  text: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.6)',
  textTertiary: 'rgba(255,255,255,0.36)',
  primary: '#FFFFFF',
  primaryHover: '#E0E0E0',
  accent: '#4C82FB',
  accentHover: '#3B71EA',
  success: '#21C95E',
  warning: '#FFBF17',
  error: '#FF593C',
} as const
