import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AdhanSettings, PrayerName, PrayerTimeData } from '../types';

const ADHAN_SETTINGS_KEY = '@adhan_settings';
const ADHAN_SCHEDULED_KEY = '@adhan_scheduled';

// Default Adhan settings
const DEFAULT_ADHAN_SETTINGS: AdhanSettings = {
  enabled: true,
  sound: 'default',
  volume: 0.8,
  enabledPrayers: {
    Fajr: true,
    Dhuhr: true,
    Asr: true,
    Maghrib: true,
    Isha: true,
  },
};

// Adhan audio files mapping
const ADHAN_SOUNDS: Record<AdhanSettings['sound'], any> = {
  default: require('../../assets/audio/adhan.mp3'),
  makkah: require('../../assets/audio/adhan_makkah.mp3'),
  madinah: require('../../assets/audio/adhan_madinah.mp3'),
};

class AdhanService {
  private sound: Audio.Sound | null = null;
  private isPlaying: boolean = false;
  private lastPlayedPrayer: { prayer: PrayerName; date: string } | null = null;

  /**
   * Check if Adhan audio is currently playing
   */
  getIsAdhanPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Get Adhan settings from storage
   */
  async getSettings(): Promise<AdhanSettings> {
    try {
      const settingsJson = await AsyncStorage.getItem(ADHAN_SETTINGS_KEY);
      if (settingsJson) {
        return JSON.parse(settingsJson);
      }
      return DEFAULT_ADHAN_SETTINGS;
    } catch (error) {
      console.error('Error loading Adhan settings:', error);
      return DEFAULT_ADHAN_SETTINGS;
    }
  }

  /**
   * Save Adhan settings to storage
   */
  async saveSettings(settings: AdhanSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(ADHAN_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving Adhan settings:', error);
    }
  }

  /**
   * Schedule Adhan notifications for all prayer times
   */
  async scheduleAdhanNotifications(prayerTimes: PrayerTimeData): Promise<void> {
    try {
      // Notifications are not available on web
      if (Platform.OS === 'web') {
        console.log('Notifications not available on web platform, skipping scheduling');
        return;
      }

      const settings = await this.getSettings();
      
      if (!settings.enabled) {
        console.log('Adhan is disabled, skipping scheduling');
        return;
      }

      // Cancel existing notifications first
      await this.cancelAllAdhanNotifications();

      const prayers: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      const scheduledIds: string[] = [];
      const now = new Date();
      
      console.log('Starting to schedule Adhan notifications. Current time:', now.toISOString());
      console.log('Adhan settings:', settings);

      for (const prayer of prayers) {
        if (!settings.enabledPrayers[prayer]) {
          console.log(`Skipping ${prayer} - disabled in settings`);
          continue;
        }

        const prayerTime = prayerTimes.timings[prayer];
        
        // Remove timezone info if present (e.g., "15:30 (+02:00)" -> "15:30")
        const timeOnly = prayerTime.split(' ')[0];
        const timeParts = timeOnly.split(':');
        
        if (timeParts.length < 2) {
          console.error(`Invalid prayer time format for ${prayer}: ${prayerTime}`);
          continue;
        }
        
        const hours = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1], 10);
        
        if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
          console.error(`Invalid hours/minutes for ${prayer}: hours=${hours}, minutes=${minutes}`);
          continue;
        }

        // Create date for today's prayer time
        const prayerDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          hours,
          minutes,
          0
        );
        
        // Validate the date
        if (isNaN(prayerDate.getTime())) {
          console.error(`Invalid prayer date created for ${prayer}: ${prayerTime}`);
          continue;
        }

        console.log(`Checking ${prayer}: prayer time ${prayerTime} -> ${timeOnly}, prayerDate: ${prayerDate.toISOString()}, now: ${now.toISOString()}, isFuture: ${prayerDate > now}`);

        // Only schedule if prayer time is in the future
        if (prayerDate > now) {
          const notificationData = { 
            prayer: prayer as PrayerName, 
            playAdhan: true 
          };
          
          console.log(`Scheduling notification for ${prayer} at ${prayerTime} with data:`, notificationData);
          
          const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
              title: `🕌 حان وقت صلاة ${this.getPrayerNameArabic(prayer)}`,
              body: 'حان الآن موعد الصلاة',
              sound: true,
              priority: Notifications.AndroidNotificationPriority.HIGH,
              data: notificationData,
              categoryIdentifier: 'adhan',
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: prayerDate,
              channelId: 'adhan', // Use the adhan channel we created
            },
          });

          scheduledIds.push(notificationId);
          console.log(`Successfully scheduled Adhan notification for ${prayer} at ${prayerTime}, ID: ${notificationId}`);
        }
      }

      // Save scheduled notification IDs
      await AsyncStorage.setItem(ADHAN_SCHEDULED_KEY, JSON.stringify(scheduledIds));
      console.log(`Total notifications scheduled: ${scheduledIds.length}`, scheduledIds);
    } catch (error) {
      console.error('Error scheduling Adhan notifications:', error);
    }
  }

  /**
   * Cancel all scheduled Adhan notifications
   */
  async cancelAllAdhanNotifications(): Promise<void> {
    try {
      // Notifications are not available on web
      if (Platform.OS === 'web') {
        console.log('Notifications not available on web platform, skipping cancellation');
        return;
      }

      const scheduledIdsJson = await AsyncStorage.getItem(ADHAN_SCHEDULED_KEY);
      if (scheduledIdsJson) {
        const scheduledIds: string[] = JSON.parse(scheduledIdsJson);
        for (const id of scheduledIds) {
          await Notifications.cancelScheduledNotificationAsync(id);
        }
      }
      await AsyncStorage.removeItem(ADHAN_SCHEDULED_KEY);
      console.log('Cancelled all Adhan notifications');
    } catch (error) {
      console.error('Error cancelling Adhan notifications:', error);
    }
  }

  /**
   * Play Adhan audio
   */
  async playAdhan(prayerName?: PrayerName): Promise<void> {
    try {
      const settings = await this.getSettings();
      console.log('Playing Adhan with settings:', settings);
      
      // Stop any currently playing Adhan
      if (this.sound) {
        try {
          await this.sound.stopAsync();
          await this.sound.unloadAsync();
        } catch (e) {
          console.log('Error stopping previous sound:', e);
        }
        this.sound = null;
        this.isPlaying = false;
      }

      // Set audio mode for playback
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: false,
          playThroughEarpieceAndroid: false,
        });
        console.log('Audio mode set successfully');
      } catch (audioModeError) {
        console.error('Error setting audio mode:', audioModeError);
      }

      // Load and play Adhan
      const adhanSource = ADHAN_SOUNDS[settings.sound];
      if (!adhanSource) {
        console.error('Adhan source not found for sound:', settings.sound);
        return;
      }

      console.log('Loading audio source:', settings.sound);
      const { sound } = await Audio.Sound.createAsync(
        adhanSource,
        {
          shouldPlay: true,
          volume: settings.volume,
          isLooping: false,
        }
      );

      this.sound = sound;
      this.isPlaying = true;

      // Handle playback status updates
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) {
          if ('error' in status) {
            console.error('Playback error:', status.error);
            this.isPlaying = false;
            this.sound = null;
          }
          return;
        }

        if (status.didJustFinish) {
          console.log('Adhan finished playing');
          sound.unloadAsync().catch(e => console.error('Error unloading sound:', e));
          this.sound = null;
          this.isPlaying = false;
        }
      });

      // Track last played prayer to avoid duplicates
      if (prayerName) {
        const today = new Date().toDateString();
        this.lastPlayedPrayer = { prayer: prayerName, date: today };
      }

      console.log(`Playing Adhan for ${prayerName || 'prayer'}, volume: ${settings.volume}`);
    } catch (error) {
      console.error('Error playing Adhan:', error);
      this.isPlaying = false;
      this.sound = null;
    }
  }

  /**
   * Check if current time matches prayer time and play Adhan immediately
   * This is a backup mechanism to ensure Adhan plays on time even if notifications are delayed
   */
  async checkAndPlayAdhanIfNeeded(prayerTimes: PrayerTimeData): Promise<void> {
    try {
      const settings = await this.getSettings();
      if (!settings.enabled || this.isPlaying) {
        return;
      }

      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentSeconds = now.getSeconds();
      const today = now.toDateString();

      const prayers: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

      for (const prayer of prayers) {
        if (!settings.enabledPrayers[prayer]) {
          continue;
        }

        const prayerTimeString = prayerTimes.timings[prayer];
        const timeOnly = prayerTimeString.split(' ')[0];
        const timeParts = timeOnly.split(':');
        
        if (timeParts.length < 2) continue;
        
        const prayerHours = parseInt(timeParts[0], 10);
        const prayerMinutes = parseInt(timeParts[1], 10);
        
        if (isNaN(prayerHours) || isNaN(prayerMinutes)) continue;

        // Check if current time matches prayer time exactly (within 30 seconds window)
        const timeMatches = 
          currentHours === prayerHours && 
          currentMinutes === prayerMinutes &&
          currentSeconds < 30; // Only trigger in first 30 seconds of the minute

        if (timeMatches) {
          // Prevent playing the same prayer multiple times on the same day
          if (this.lastPlayedPrayer && 
              this.lastPlayedPrayer.prayer === prayer &&
              this.lastPlayedPrayer.date === today) {
            continue;
          }

          // It's prayer time! Play Adhan immediately
          console.log(`[Time Check] Detected prayer time for ${prayer} at ${timeOnly}, playing Adhan now`);
          await this.playAdhan(prayer);
          return;
        }
      }
    } catch (error) {
      console.error('Error checking and playing Adhan:', error);
    }
  }

  /**
   * Stop currently playing Adhan
   */
  async stopAdhan(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
        this.isPlaying = false;
      }
    } catch (error) {
      console.error('Error stopping Adhan:', error);
    }
  }

  /**
   * Get next prayer time and name
   */
  getNextPrayer(prayerTimes: PrayerTimeData): { name: PrayerName; time: string; timeUntil: string } | null {
    try {
      const now = new Date();
      const prayers: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

      for (const prayer of prayers) {
        const prayerTimeString = prayerTimes.timings[prayer];
        
        // Remove timezone info if present (e.g., "15:30 (+02:00)" -> "15:30")
        const timeOnly = prayerTimeString.split(' ')[0];
        const [hours, minutes] = timeOnly.split(':').map(Number);

        const prayerDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          hours,
          minutes,
          0
        );

        if (prayerDate > now) {
          const diff = prayerDate.getTime() - now.getTime();
          const hoursUntil = Math.floor(diff / (1000 * 60 * 60));
          const minutesUntil = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const secondsUntil = Math.floor((diff % (1000 * 60)) / 1000);

          return {
            name: prayer,
            time: timeOnly,
            timeUntil: `${hoursUntil}:${minutesUntil.toString().padStart(2, '0')}:${secondsUntil.toString().padStart(2, '0')}`,
          };
        }
      }

      // If no prayer left today, calculate time until tomorrow's Fajr
      const fajrTimeString = prayerTimes.timings.Fajr;
      const fajrTimeOnly = fajrTimeString.split(' ')[0];
      const [fajrHours, fajrMinutes] = fajrTimeOnly.split(':').map(Number);
      
      // Create date for tomorrow's Fajr
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(fajrHours, fajrMinutes, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      const hoursUntil = Math.floor(diff / (1000 * 60 * 60));
      const minutesUntil = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secondsUntil = Math.floor((diff % (1000 * 60)) / 1000);
      
      return {
        name: 'Fajr',
        time: fajrTimeOnly,
        timeUntil: `${hoursUntil}:${minutesUntil.toString().padStart(2, '0')}:${secondsUntil.toString().padStart(2, '0')}`,
      };
    } catch (error) {
      console.error('Error getting next prayer:', error);
      return null;
    }
  }

  /**
   * Get Arabic name for prayer
   */
  private getPrayerNameArabic(prayer: PrayerName): string {
    const names: Record<PrayerName, string> = {
      Fajr: 'الفجر',
      Dhuhr: 'الظهر',
      Asr: 'العصر',
      Maghrib: 'المغرب',
      Isha: 'العشاء',
    };
    return names[prayer];
  }
}

export const adhanService = new AdhanService();
