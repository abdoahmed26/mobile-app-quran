export const COLORS = {
  // Primary Colors - Deep Green (Islamic theme)
  primary: '#2e7d32',
  primaryLight: '#4caf50',
  primaryDark: '#1b5e20',
  
  // Secondary Colors - Teal
  secondary: '#00897b',
  accent: '#00897b',
  accentLight: '#26a69a',
  accentDark: '#00695c',
  
  // Gold for highlights
  gold: '#ffd700',
  goldLight: '#ffed4e',
  goldDark: '#c7a600',
  
  // Backgrounds
  background: '#f5f5f5',
  backgroundLight: '#fafafa',
  darkBackground: '#121212',
  darkBackgroundLight: '#1e1e1e',
  
  // Cards
  card: '#ffffff',
  darkCard: '#1e1e1e',
  darkCardLight: '#2c2c2c',
  
  // Text
  text: '#212121',
  textLight: '#e0e0e0',
  textMuted: '#757575',
  white: '#ffffff',
  black: '#000000',
  
  // Borders
  border: '#e0e0e0',
  borderDark: '#424242',
  
  // Status Colors
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
  info: '#2196f3',
  
  // Gradients
  gradients: {
    primary: ['#2e7d32', '#1b5e20'] as const,
    primaryLight: ['#4caf50', '#2e7d32'] as const,
    primaryVertical: ['#1b5e20', '#2e7d32'] as const,
    accent: ['#00897b', '#00695c'] as const,
    accentLight: ['#26a69a', '#00897b'] as const,
    gold: ['#ffd700', '#c7a600'] as const,
    dark: ['#1e1e1e', '#121212'] as const,
    darkVertical: ['#121212', '#1e1e1e'] as const,
    card: ['#ffffff', '#f5f5f5'] as const,
    cardDark: ['#2c2c2c', '#1e1e1e'] as const,
    prayer: ['#e8f5e9', '#c8e6c9'] as const,
    prayerDark: ['#1a472a', '#2d5f3f'] as const,
  },
  
  // Overlays
  overlays: {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.3)',
    dark: 'rgba(0, 0, 0, 0.3)',
    darker: 'rgba(0, 0, 0, 0.5)',
  },
  
  // Shadows
  shadows: {
    light: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.2)',
    dark: 'rgba(0, 0, 0, 0.3)',
  },
};

export const FONTS = {
  regular: 'System',
  bold: 'System',
  arabic: 'System',
};

export const SIZES = {
  tiny: 10,
  small: 12,
  medium: 16,
  large: 20,
  xlarge: 24,
  xxlarge: 32,
  hero: 40,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const API_ENDPOINTS = {
  PRAYER_TIMES: 'https://api.aladhan.com/v1/calendar',
  RECITERS: 'https://abdoahmed26.github.io/api/arabic.json',
  QURAN_JSON: 'https://raw.githubusercontent.com/penggguna/QuranJSON/master/quran.json',
  QURAN_VERSES_API: 'https://quran-api-id.vercel.app/surah', // For fetching verses
  DEFAULT_RECITER_SERVER: 'https://server11.mp3quran.net/shatri',
};

