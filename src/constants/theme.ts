export const Colors = {
  primary: '#FF6F9F',
  primarySoft: '#FFE3EC',
  secondary: '#FFBE98',
  secondarySoft: '#FFF0E5',
  accent: '#A7D5C5',
  accentSoft: '#EAF7F1',
  lavender: '#C6B5FF',
  lavenderSoft: '#F0EBFF',
  sky: '#8FC7FF',
  skySoft: '#E8F4FF',
  background: '#FFF8F4',
  backgroundSoft: '#FFFDFB',
  card: '#FFFFFF',
  cardMuted: '#FFF7F1',
  text: '#2F2522',
  textSecondary: '#8E7D78',
  textTertiary: '#B8AAA4',
  border: '#F1E4DC',
  divider: '#F5ECE6',
  danger: '#F47474',
  warning: '#F3B562',
  success: '#7BC7A7',
  white: '#FFFFFF',
  shadow: 'rgba(146, 108, 86, 0.08)',
  overlay: 'rgba(47,37,34,0.16)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40,
};

export const BorderRadius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  xxl: 36,
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

export const Shadows = {
  card: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 6,
  },
  soft: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 3,
  },
};
