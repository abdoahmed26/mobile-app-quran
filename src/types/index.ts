// Prayer Times Types
export interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

// Adhan (Call to Prayer) Types
export type PrayerName = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export interface AdhanSettings {
  enabled: boolean;
  sound: 'default' | 'makkah' | 'madinah';
  volume: number; // 0-1
  enabledPrayers: {
    Fajr: boolean;
    Dhuhr: boolean;
    Asr: boolean;
    Maghrib: boolean;
    Isha: boolean;
  };
}

export const PRAYER_NAMES: Record<PrayerName, string> = {
  Fajr: 'الفجر',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء',
};

export interface PrayerTimeData {
  timings: PrayerTimings;
  date: {
    readable: string;
    hijri: {
      date: string;
      month: {
        en: string;
        ar: string;
      };
      year: string;
    };
  };
}

// Quran Reader Types
export interface Reciter {
  id: number | string;
  name: string;
  Server: string;
  rewaya: string;
  letter?: string;
  suras?: string[];
}

export interface RecitersResponse {
  reciters: Reciter[];
}

// Surah Types
export interface Surah {
  number_of_surah: number;
  name: string;
  name_translations: {
    ar: string;
    en: string;
  };
  number_of_ayah: number;
  place: string;
  verses?: Verse[]; // Optional because API might not include it
}

export interface Verse {
  id: number;
  text: string; // Always string after API conversion
  translation_eng?: string;
  transliteration?: string;
  number?: {
    inQuran: number;
    inSurah: number;
  };
  audio?: {
    primary: string;
    secondary: string[];
  };
}

// API Response Types for quran-api-id.vercel.app
export interface QuranApiVerse {
  number: {
    inQuran: number;
    inSurah: number;
  };
  text: {
    arab: string;
    transliteration: {
      en: string;
    };
  };
  translation: {
    en: string;
    id: string;
  };
  audio: {
    primary: string;
    secondary: string[];
  };
  tafsir: {
    id: {
      short: string;
      long: string;
    };
  };
}

export interface QuranApiResponse {
  code: number;
  status: string;
  message: string;
  data: {
    number: number;
    sequence: number;
    numberOfVerses: number;
    name: {
      short: string;
      long: string;
      transliteration: {
        en: string;
        id: string;
      };
      translation: {
        en: string;
        id: string;
      };
    };
    revelation: {
      arab: string;
      en: string;
      id: string;
    };
    tafsir: {
      id: string;
    };
    preBismillah: {
      text: {
        arab: string;
        transliteration: {
          en: string;
        };
      };
      translation: {
        en: string;
        id: string;
      };
      audio: {
        primary: string;
        secondary: string[];
      };
    } | null;
    verses: QuranApiVerse[];
  };
}


// Navigation Types
export type RootStackParamList = {
  Home: undefined;
  SurahList: undefined;
  SurahReader: { surahNumber: number };
  Settings: undefined;
};
