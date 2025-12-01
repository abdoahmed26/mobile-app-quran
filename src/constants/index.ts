export const COLORS = {
  primary: '#1a472a',
  primaryLight: '#2d5f3f',
  primaryDark: '#0d2315',
  secondary: '#2d5f3f',
  accent: '#d4af37',
  accentLight: '#f0c674',
  accentDark: '#b8941f',
  background: '#f5f5dc',
  backgroundLight: '#faf8f0',
  darkBackground: '#0f1419',
  darkBackgroundLight: '#1a1f2e',
  darkCard: '#1a1f2e',
  darkCardLight: '#252b3d',
  text: '#2c3e50',
  textLight: '#ecf0f1',
  textMuted: '#7f8c8d',
  white: '#ffffff',
  black: '#000000',
  border: '#ddd',
  borderDark: '#2c3340',
  success: '#27ae60',
  error: '#e74c3c',
  warning: '#f39c12',
  info: '#3498db',
  
  // Gradients
  gradients: {
    primary: ['#1a472a', '#2d5f3f', '#1a472a'] as const,
    primaryVertical: ['#0d2315', '#1a472a', '#2d5f3f'] as const,
    accent: ['#d4af37', '#f0c674', '#d4af37'] as const,
    dark: ['#0f1419', '#1a1f2e', '#0f1419'] as const,
    darkVertical: ['#0a0d11', '#0f1419', '#1a1f2e'] as const,
    card: ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)'] as const,
    cardDark: ['rgba(26, 31, 46, 0.95)', 'rgba(37, 43, 61, 0.85)'] as const,
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
  small: 12,
  medium: 16,
  large: 20,
  xlarge: 24,
  xxlarge: 32,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const API_ENDPOINTS = {
  PRAYER_TIMES: 'https://api.aladhan.com/v1/calendar',
  RECITERS: 'https://abdoahmed26.github.io/api/arabic.json',
  QURAN_JSON: 'https://raw.githubusercontent.com/penggguna/QuranJSON/master/quran.json',
  QURAN_VERSES_API: 'https://quran-api-id.vercel.app/surah', // For fetching verses
  DEFAULT_RECITER_SERVER: 'https://server11.mp3quran.net/shatri',
};

