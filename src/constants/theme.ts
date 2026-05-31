export const Colors = {
  primary: '#FF8BA0',
  primarySoft: '#FFF0F3',
  primaryGlow: 'rgba(255, 139, 160, 0.15)',
  secondary: '#FFB88E',
  secondarySoft: '#FFF5EE',
  accent: '#9DD4C3',
  accentSoft: '#F0FAF7',
  accentGlow: 'rgba(157, 212, 195, 0.15)',
  lavender: '#C5B8F3',
  lavenderSoft: '#F5F3FE',
  sky: '#8EC5F7',
  skySoft: '#EFF8FF',
  peach: '#FFCDB4',
  peachSoft: '#FFF8F4',
  background: '#FFFBF8',
  backgroundSoft: '#FFFFFF',
  card: '#FFFFFF',
  cardMuted: '#FFF9F5',
  cardElevated: '#FFFFFF',
  text: '#2D2420',
  textSecondary: '#8B7A75',
  textTertiary: '#B5A8A3',
  border: '#F2E8E0',
  borderLight: '#F8F1EB',
  divider: '#F5EDE5',
  danger: '#F47474',
  warning: '#F3B562',
  success: '#7BC7A7',
  white: '#FFFFFF',
  shadow: 'rgba(139, 122, 117, 0.06)',
  shadowMedium: 'rgba(139, 122, 117, 0.1)',
  overlay: 'rgba(45, 36, 32, 0.12)',
  glassBackground: 'rgba(255, 251, 248, 0.72)',
  glassBorder: 'rgba(255, 255, 255, 0.45)',
  clayHighlight: 'rgba(255, 255, 255, 0.6)',
  clayShadowOuter: 'rgba(139, 122, 117, 0.12)',
  decorativeBlob1: 'rgba(255, 139, 160, 0.08)',
  decorativeBlob2: 'rgba(157, 212, 195, 0.08)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 36,
  xxxxl: 44,
};

export const BorderRadius = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  xxl: 38,
  full: 999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 28,
  xxxl: 36,
};

export const Gradients = {
  primary: ['#FF8BA0', '#FFB88E'] as [string, string],
  accent: ['#9DD4C3', '#8EC5F7'] as [string, string],
  softPink: ['#FF8BA0', '#FFCDB4'] as [string, string],
  warmWhite: ['rgba(255,255,255,0.95)', 'rgba(255,251,248,0.6)'] as [string, string],
};

export const Glass = {
  blurIntensity: 80,
  background: 'rgba(255, 251, 248, 0.72)',
  border: 'rgba(255, 255, 255, 0.45)',
  tint: 'light' as const,
};

export const Shadows = {
  card: {
    shadowColor: Colors.clayShadowOuter,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 28,
    elevation: 6,
  },
  soft: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 3,
  },
  subtle: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },
  glow: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
  },
  clay: {
    shadowColor: Colors.clayShadowOuter,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 8,
  },
  button: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 5,
  },
};

export const Animation = {
  springConfig: { damping: 15, stiffness: 400, mass: 0.8 },
  pressScale: 0.96,
};
