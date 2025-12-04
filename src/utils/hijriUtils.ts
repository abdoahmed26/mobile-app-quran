/**
 * Hijri Calendar Utilities
 * 
 * Provides functions for Hijri date calculations, conversions,
 * and calendar generation using moment-hijri library
 */

import moment from 'moment-hijri';
import { getIslamicEvent } from './islamicEvents';
import { EventType } from '../constants/islamicEvents';

// Islamic month names in Arabic
export const HIJRI_MONTHS_AR = [
  'محرم',
  'صفر',
  'ربيع الأول',
  'ربيع الآخر',
  'جمادى الأولى',
  'جمادى الآخرة',
  'رجب',
  'شعبان',
  'رمضان',
  'شوال',
  'ذو القعدة',
  'ذو الحجة',
];

// Islamic month names in English
export const HIJRI_MONTHS_EN = [
  'Muharram',
  'Safar',
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  'Jumada al-Ula',
  'Jumada al-Akhirah',
  'Rajab',
  "Sha'ban",
  'Ramadan',
  'Shawwal',
  "Dhu al-Qi'dah",
  'Dhu al-Hijjah',
];

// Arabic day names
export const HIJRI_DAYS_AR = [
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت',
];

export interface HijriDate {
  day: number;
  month: number;
  year: number;
  monthNameAr: string;
  monthNameEn: string;
  dayOfWeek: number;
  dayNameAr: string;
}

export interface HijriDay {
  hijriDay: number;
  hijriMonth: number;
  hijriYear: number;
  gregorianDate: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  event?: {
    name: string;
    nameAr: string;
    color: string;
    type: EventType;
  } | null;
}

/**
 * Get Hijri date for a given Gregorian date with optional offset
 * 
 * @param date - Gregorian date (defaults to today)
 * @param offset - Days to add/subtract (-1, 0, or +1)
 * @returns HijriDate object
 */
export function getHijriDate(date: Date = new Date(), offset: number = 0): HijriDate {
  const adjustedDate = new Date(date);
  adjustedDate.setDate(adjustedDate.getDate() + offset);
  
  const m = moment(adjustedDate);
  const monthIndex = m.iMonth(); // 0-indexed
  
  return {
    day: m.iDate(),
    month: monthIndex + 1, // Convert to 1-indexed
    year: m.iYear(),
    monthNameAr: HIJRI_MONTHS_AR[monthIndex],
    monthNameEn: HIJRI_MONTHS_EN[monthIndex],
    dayOfWeek: m.day(),
    dayNameAr: HIJRI_DAYS_AR[m.day()],
  };
}

/**
 * Convert Gregorian date to Hijri
 * Alias for getHijriDate for clarity
 */
export function gregorianToHijri(date: Date, offset: number = 0): HijriDate {
  return getHijriDate(date, offset);
}

/**
 * Get full month data for calendar grid (42 days = 6 weeks)
 * 
 * @param year - Hijri year
 * @param month - Hijri month (1-12)
 * @param offset - Days offset for regional adjustments
 * @returns Array of 42 HijriDay objects
 */
export function getHijriMonth(year: number, month: number, offset: number = 0): HijriDay[] {
  const days: HijriDay[] = [];
  
  // Create first day of the month
  const firstDay: any = moment().iYear(year).iMonth(month - 1).iDate(1);
  
  // Apply offset
  if (offset !== 0) {
    firstDay.add(offset, 'days');
  }
  
  const startDayOfWeek = firstDay.day(); // 0 = Sunday
  const daysInMonth = firstDay.iDaysInMonth();
  
  // Fill previous month days to start on Sunday
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const date: any = moment(firstDay).subtract(i + 1, 'days');
    days.push(createHijriDay(date, false, offset));
  }
  
  // Fill current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const date: any = moment(firstDay).iDate(i);
    days.push(createHijriDay(date, true, offset));
  }
  
  // Fill next month days to complete 42 days (6 weeks)
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    const date: any = moment(firstDay).add(daysInMonth + i - 1, 'days');
    days.push(createHijriDay(date, false, offset));
  }
  
  return days;
}

/**
 * Create a HijriDay object from a moment instance
 */
function createHijriDay(m: any, isCurrentMonth: boolean, offset: number): HijriDay {
  const today = moment();
  if (offset !== 0) {
    today.add(offset, 'days');
  }
  
  const isToday = m.isSame(today, 'day');
  const hijriDay = m.iDate();
  const hijriMonth = m.iMonth() + 1;
  
  // Get Islamic event for this date
  const event = getIslamicEvent(hijriDay, hijriMonth);
  
  return {
    hijriDay,
    hijriMonth,
    hijriYear: m.iYear(),
    gregorianDate: m.toDate(),
    isCurrentMonth,
    isToday,
    event,
  };
}

/**
 * Get current Hijri month and year
 */
export function getCurrentHijriMonthYear(offset: number = 0): { month: number; year: number } {
  const m = moment();
  if (offset !== 0) {
    m.add(offset, 'days');
  }
  
  return {
    month: m.iMonth() + 1,
    year: m.iYear(),
  };
}

/**
 * Navigate to next Hijri month
 */
export function getNextHijriMonth(year: number, month: number): { month: number; year: number } {
  if (month === 12) {
    return { month: 1, year: year + 1 };
  }
  return { month: month + 1, year };
}

/**
 * Navigate to previous Hijri month
 */
export function getPreviousHijriMonth(year: number, month: number): { month: number; year: number } {
  if (month === 1) {
    return { month: 12, year: year - 1 };
  }
  return { month: month - 1, year };
}

/**
 * Format Gregorian date for display
 */
export function formatGregorianDate(date: Date): string {
  return date.toLocaleDateString('ar-EG', {
    day: 'numeric',
    month: 'short',
  });
}
