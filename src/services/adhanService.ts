import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AdhanSettings, PrayerName, PrayerTimeData } from '../types';

const ADHAN_SETTINGS_KEY = '@adhan_settings';
const ADHAN_SCHEDULED_KEY = '@adhan_scheduled';

// Default Adhan settings
const DEFAULT_ADHAN_SETTINGS: AdhanSettings = {
  enabled: true,
  sound: 'default',
  hijriOffset: 0,
  enabledPrayers: {
    Fajr: true,
    Dhuhr: true,
    Asr: true,
    Maghrib: true,
    Isha: true,
  },
};

// Map sound settings to actual file names
const SOUND_FILES: Record<AdhanSettings['sound'], string> = {
  default: 'adhan.mp3',
  makkah: 'adhan_makkah.mp3',
  madinah: 'adhan_madinah.mp3',
};

class AdhanService {
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
   * Schedule daily prayer notifications with custom Adhan sounds
   * This is the main function that schedules all 5 daily prayers
   * The OS will play the Adhan sound automatically when the notification fires
   * 
   * Android: Uses the appropriate notification channel based on selected sound
   * iOS: Sound is specified directly in notification content
   */
  async scheduleDailyPrayerNotifications(
    prayerTimes: PrayerTimeData,
    soundName?: AdhanSettings['sound']
  ): Promise<void> {
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

      // Use provided sound or get from settings
      const selectedSound = soundName || settings.sound;
      const soundFile = SOUND_FILES[selectedSound];

      // Get the correct channel ID for Android
      const channelId = Platform.OS === 'android' 
        ? this.getChannelIdForSound(selectedSound)
        : undefined;

      // Cancel existing notifications first
      await this.cancelAllAdhanNotifications();

      const prayers: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      const scheduledIds: string[] = [];
      const now = new Date();
      
      console.log('========================================');
      console.log('Scheduling Adhan notifications with OS sounds');
      console.log('Current time:', now.toISOString());
      console.log('Selected sound:', soundFile);
      console.log('Android channel ID:', channelId || 'N/A (iOS)');
      console.log('Settings:', settings);
      console.log('========================================');

      for (const prayer of prayers) {
        if (!settings.enabledPrayers[prayer]) {
          console.log(`⏭️  Skipping ${prayer} - disabled in settings`);
          continue;
        }

        const prayerTime = prayerTimes.timings[prayer];
        
        // Remove timezone info if present (e.g., "15:30 (+02:00)" -> "15:30")
        const timeOnly = prayerTime.split(' ')[0];
        const timeParts = timeOnly.split(':');
        
        if (timeParts.length < 2) {
          console.error(`❌ Invalid prayer time format for ${prayer}: ${prayerTime}`);
          continue;
        }
        
        const hours = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1], 10);
        
        if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
          console.error(`❌ Invalid hours/minutes for ${prayer}: hours=${hours}, minutes=${minutes}`);
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
          console.error(`❌ Invalid prayer date created for ${prayer}: ${prayerTime}`);
          continue;
        }

        // Only schedule if prayer time is in the future
        if (prayerDate > now) {
          const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
              title: `🕌 حان وقت صلاة ${this.getPrayerNameArabic(prayer)}`,
              body: 'حان الآن موعد الصلاة',
              sound: soundFile, // For iOS and as fallback
              priority: Notifications.AndroidNotificationPriority.MAX,
              categoryIdentifier: 'adhan',
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: prayerDate,
              channelId: channelId, // Use correct channel for Android
            },
          });

          scheduledIds.push(notificationId);
          console.log(`✅ Scheduled ${prayer} at ${timeOnly} (ID: ${notificationId}, Channel: ${channelId || 'default'})`);
        } else {
          console.log(`⏭️  Skipping ${prayer} at ${timeOnly} - time has passed`);
        }
      }

      // Save scheduled notification IDs
      await AsyncStorage.setItem(ADHAN_SCHEDULED_KEY, JSON.stringify(scheduledIds));
      console.log('========================================');
      console.log(`✅ Total notifications scheduled: ${scheduledIds.length}`);
      console.log('========================================');
    } catch (error) {
      console.error('❌ Error scheduling Adhan notifications:', error);
    }
  }

  /**
   * Alias for scheduleDailyPrayerNotifications for backward compatibility
   */
  async scheduleAdhanNotifications(prayerTimes: PrayerTimeData): Promise<void> {
    return this.scheduleDailyPrayerNotifications(prayerTimes);
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
        console.log(`🗑️  Cancelled ${scheduledIds.length} scheduled notifications`);
      }
      await AsyncStorage.removeItem(ADHAN_SCHEDULED_KEY);
    } catch (error) {
      console.error('Error cancelling Adhan notifications:', error);
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
   * Get the channel ID for a given sound (Android only)
   */
  private getChannelIdForSound(sound: AdhanSettings['sound']): string {
    const channelIds: Record<AdhanSettings['sound'], string> = {
      default: 'adhan-default',
      makkah: 'adhan-makkah',
      madinah: 'adhan-madinah',
    };
    return channelIds[sound];
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
