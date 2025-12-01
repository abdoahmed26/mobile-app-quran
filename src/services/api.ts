import axios from 'axios';
import { API_ENDPOINTS } from '../constants';
import { PrayerTimeData, RecitersResponse, Surah, QuranApiResponse, Verse } from '../types';

export const prayerTimesService = {
  async getPrayerTimes(latitude: number, longitude: number): Promise<PrayerTimeData[]> {
    try {
      const year = new Date().getFullYear();
      const response = await axios.get(
        `${API_ENDPOINTS.PRAYER_TIMES}/${year}?latitude=${latitude}&longitude=${longitude}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching prayer times:', error);
      throw error;
    }
  },
};

export const recitersService = {
  async getReciters(): Promise<RecitersResponse> {
    try {
      const response = await axios.get(API_ENDPOINTS.RECITERS);
      return response.data;
    } catch (error) {
      console.error('Error fetching reciters:', error);
      throw error;
    }
  },
};

export const quranService = {
  async getSurahs(): Promise<Surah[]> {
    try {
      const response = await axios.get(API_ENDPOINTS.QURAN_JSON);
      return response.data;
    } catch (error) {
      console.error('Error fetching surahs:', error);
      throw error;
    }
  },

  async getSurahWithVerses(surahNumber: number): Promise<{ surah: Surah; verses: Verse[] }> {
    try {
      // Fetch surah info from QuranJSON
      const surahsResponse = await axios.get(API_ENDPOINTS.QURAN_JSON);
      const surahs: Surah[] = surahsResponse.data;
      const surah = surahs.find(s => s.number_of_surah === surahNumber);

      if (!surah) {
        throw new Error(`Surah ${surahNumber} not found`);
      }

      // Fetch verses from quran-api-id
      const versesResponse = await axios.get<QuranApiResponse>(
        `${API_ENDPOINTS.QURAN_VERSES_API}/${surahNumber}`
      );

      // Transform API verses to our Verse format
      const verses: Verse[] = versesResponse.data.data.verses.map((apiVerse) => ({
        id: apiVerse.number.inSurah,
        text: apiVerse.text.arab,
        translation_eng: apiVerse.translation.en,
        transliteration: apiVerse.text.transliteration.en,
        number: apiVerse.number,
        audio: apiVerse.audio,
      }));

      return { surah, verses };
    } catch (error) {
      console.error('Error fetching surah with verses:', error);
      throw error;
    }
  },

  getAudioUrl(reciterServer: string, surahNumber: number): string {
    const paddedNumber = surahNumber.toString().padStart(3, '0');
    return `${reciterServer}/${paddedNumber}.mp3`;
  },
};

