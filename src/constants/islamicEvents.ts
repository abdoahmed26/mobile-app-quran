/**
 * Islamic Events Constants
 * 
 * Centralized configuration for Islamic events, colors, and types
 */

// Event colors for calendar display
export const EVENT_COLORS = {
  ASHURA: '#9C27B0',        // Purple
  RAMADAN: '#4CAF50',       // Green
  LAYLAT_AL_QADR: '#FFD700', // Gold
  LAST_TEN_NIGHTS: '#FF9800', // Orange
  EID_FITR: '#4CAF50',      // Green
  DHUL_HIJJAH: '#2196F3',   // Blue
  ARAFAH: '#E91E63',        // Pink
  EID_ADHA: '#F44336',      // Red
  TASHREEQ: '#FF5722',      // Deep Orange
} as const;

// Event type enum
export enum EventType {
  MAJOR = 'major',
  BLESSED = 'blessed',
  SPECIAL = 'special',
}

// Event names in English and Arabic
export const EVENT_NAMES = {
  ASHURA: {
    en: 'Day of Ashura',
    ar: 'يوم عاشوراء',
  },
  RAMADAN_START: {
    en: 'Start of Ramadan',
    ar: 'بداية رمضان',
  },
  LAST_TEN_NIGHTS: {
    en: 'Last Ten Nights',
    ar: 'العشر الأواخر',
  },
  LAYLAT_AL_QADR: {
    en: 'Laylat al-Qadr (possible)',
    ar: 'ليلة القدر (محتملة)',
  },
  EID_FITR: {
    en: 'Eid al-Fitr',
    ar: 'عيد الفطر',
  },
  FIRST_TEN_DAYS: {
    en: 'First Ten Days',
    ar: 'العشر الأوائل',
  },
  ARAFAH: {
    en: 'Day of Arafah',
    ar: 'يوم عرفة',
  },
  EID_ADHA: {
    en: 'Eid al-Adha',
    ar: 'عيد الأضحى',
  },
  TASHREEQ: {
    en: 'Days of Tashreeq',
    ar: 'أيام التشريق',
  },
} as const;

// Blessed months
export const BLESSED_MONTHS = {
  1: 'Muharram - Sacred Month',
  7: 'Rajab - Sacred Month',
  8: "Sha'ban - Month before Ramadan",
  9: 'Ramadan - Month of Fasting',
  11: 'Dhul-Qadah - Sacred Month',
  12: 'Dhul-Hijjah - Month of Hajj',
} as const;
