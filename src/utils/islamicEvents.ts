/**
 * Islamic Events and Important Dates
 * 
 * Provides functions to identify and annotate important Islamic dates
 * in the Hijri calendar
 */

import { EVENT_COLORS, EVENT_NAMES, EventType } from '../constants/islamicEvents';

export interface IslamicEvent {
  name: string;
  nameAr: string;
  color: string;
  type: EventType;
}

/**
 * Get Islamic event for a specific Hijri date
 * @param day - Hijri day (1-30)
 * @param month - Hijri month (1-12)
 * @returns IslamicEvent object or null if no event
 */
export function getIslamicEvent(day: number, month: number): IslamicEvent | null {
  // Validate input
  if (day < 1 || day > 30 || month < 1 || month > 12) {
    return null;
  }

  // Muharram (Month 1)
  if (month === 1 && day === 10) {
    return {
      name: EVENT_NAMES.ASHURA.en,
      nameAr: EVENT_NAMES.ASHURA.ar,
      color: EVENT_COLORS.ASHURA,
      type: EventType.MAJOR,
    };
  }

  // Ramadan (Month 9)
  if (month === 9) {
    if (day === 1) {
      return {
        name: EVENT_NAMES.RAMADAN_START.en,
        nameAr: EVENT_NAMES.RAMADAN_START.ar,
        color: EVENT_COLORS.RAMADAN,
        type: EventType.MAJOR,
      };
    }
    
    // Odd nights in last 10 (more likely for Laylat al-Qadr)
    if (day === 21 || day === 23 || day === 25 || day === 27 || day === 29) {
      return {
        name: EVENT_NAMES.LAYLAT_AL_QADR.en,
        nameAr: EVENT_NAMES.LAYLAT_AL_QADR.ar,
        color: EVENT_COLORS.LAYLAT_AL_QADR,
        type: EventType.BLESSED,
      };
    }
    
    // Last 10 nights of Ramadan
    if (day >= 21) {
      return {
        name: EVENT_NAMES.LAST_TEN_NIGHTS.en,
        nameAr: EVENT_NAMES.LAST_TEN_NIGHTS.ar,
        color: EVENT_COLORS.LAST_TEN_NIGHTS,
        type: EventType.BLESSED,
      };
    }
  }

  // Shawwal (Month 10)
  if (month === 10 && day === 1) {
    return {
      name: EVENT_NAMES.EID_FITR.en,
      nameAr: EVENT_NAMES.EID_FITR.ar,
      color: EVENT_COLORS.EID_FITR,
      type: EventType.MAJOR,
    };
  }

  // Dhul-Hijjah (Month 12)
  if (month === 12) {
    if (day === 9) {
      return {
        name: EVENT_NAMES.ARAFAH.en,
        nameAr: EVENT_NAMES.ARAFAH.ar,
        color: EVENT_COLORS.ARAFAH,
        type: EventType.MAJOR,
      };
    }
    
    if (day === 10) {
      return {
        name: EVENT_NAMES.EID_ADHA.en,
        nameAr: EVENT_NAMES.EID_ADHA.ar,
        color: EVENT_COLORS.EID_ADHA,
        type: EventType.MAJOR,
      };
    }
    
    // Days of Tashreeq (11-13 Dhul-Hijjah)
    if (day >= 11 && day <= 13) {
      return {
        name: EVENT_NAMES.TASHREEQ.en,
        nameAr: EVENT_NAMES.TASHREEQ.ar,
        color: EVENT_COLORS.TASHREEQ,
        type: EventType.SPECIAL,
      };
    }
    
    // First 10 days of Dhul-Hijjah
    if (day >= 1 && day <= 10) {
      return {
        name: EVENT_NAMES.FIRST_TEN_DAYS.en,
        nameAr: EVENT_NAMES.FIRST_TEN_DAYS.ar,
        color: EVENT_COLORS.DHUL_HIJJAH,
        type: EventType.BLESSED,
      };
    }
  }

  return null;
}

/**
 * Check if a date is a major Islamic event
 */
export function isMajorEvent(day: number, month: number): boolean {
  const event = getIslamicEvent(day, month);
  return event?.type === EventType.MAJOR;
}

/**
 * Check if a date is in a blessed period
 */
export function isBlessedPeriod(day: number, month: number): boolean {
  const event = getIslamicEvent(day, month);
  return event?.type === EventType.BLESSED;
}

/**
 * Get event color for calendar display
 */
export function getEventColor(day: number, month: number): string | null {
  const event = getIslamicEvent(day, month);
  return event?.color || null;
}

/**
 * Get all events in a specific month
 */
export function getMonthEvents(month: number): Array<{ day: number; event: IslamicEvent }> {
  const events: Array<{ day: number; event: IslamicEvent }> = [];
  
  // Check all possible days (1-30)
  for (let day = 1; day <= 30; day++) {
    const event = getIslamicEvent(day, month);
    if (event) {
      events.push({ day, event });
    }
  }
  
  return events;
}
