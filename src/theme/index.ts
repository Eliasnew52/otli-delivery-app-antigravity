// Cyberpunk 2077 Inspired Design System
// Rajdhani font + CMYK neon palette

export const colors = {
  background: '#0A0A0F',
  surface: '#12121A',
  surfaceLight: '#1A1A2E',
  surfaceLighter: '#22223A',

  primary: '#F2E900',       // Cyber Yellow
  primaryDark: '#C4BC00',
  secondary: '#02D7F2',     // Neon Cyan
  secondaryDark: '#019DB1',
  accent: '#FF3D94',        // Hot Magenta
  accentDark: '#CC2E76',

  text: '#E8E8E8',
  textDim: '#8A8A9A',
  textMuted: '#55556A',

  border: '#2A2A3E',
  borderFocus: '#02D7F2',

  success: '#00FF88',
  error: '#FF3D5A',
  warning: '#F2E900',

  white: '#FFFFFF',
  black: '#000000',

  // Glow overlays (used for shadow/glow effects)
  glowYellow: 'rgba(242, 233, 0, 0.3)',
  glowCyan: 'rgba(2, 215, 242, 0.3)',
  glowMagenta: 'rgba(255, 61, 148, 0.3)',
};

export const fonts = {
  light: 'Rajdhani-Light',
  regular: 'Rajdhani-Regular',
  medium: 'Rajdhani-Medium',
  semiBold: 'Rajdhani-SemiBold',
  bold: 'Rajdhani-Bold',
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 36,
  display: 48,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  round: 999,
};

export const shadows = {
  glowYellow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  glowCyan: {
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  glowMagenta: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
};

const theme = { colors, fonts, fontSize, spacing, borderRadius, shadows };
export default theme;
