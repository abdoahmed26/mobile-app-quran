import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { AdhanSettings } from '../types';

// Map sound settings to actual file names
const SOUND_FILES: Record<AdhanSettings['sound'], string> = {
  default: 'adhan.mp3',
  makkah: 'adhan_makkah.mp3',
  madinah: 'adhan_madinah.mp3',
};

// Map sound settings to channel IDs
const CHANNEL_IDS: Record<AdhanSettings['sound'], string> = {
  default: 'adhan-default',
  makkah: 'adhan-makkah',
  madinah: 'adhan-madinah',
};

/**
 * Get the channel ID for a given sound
 */
export function getChannelIdForSound(sound: AdhanSettings['sound']): string {
  return CHANNEL_IDS[sound];
}

/**
 * Initialize all notification channels on app start (Android only)
 * Creates three separate channels, one for each Adhan sound
 * This ensures each channel has its own fixed sound
 */
export async function initializeAllNotificationChannels(): Promise<void> {
  if (Platform.OS !== 'android') {
    return; // iOS doesn't use channels
  }

  try {
    console.log('🔔 Initializing all Adhan notification channels...');

    // Create channel for default Adhan
    await Notifications.setNotificationChannelAsync(CHANNEL_IDS.default, {
      name: 'Adhan - Default',
      description: 'Notifications for prayer times with default Adhan sound',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      sound: SOUND_FILES.default,
      enableVibrate: true,
      showBadge: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: false,
    });
    console.log(`✅ Created channel: ${CHANNEL_IDS.default} with sound: ${SOUND_FILES.default}`);

    // Create channel for Makkah Adhan
    await Notifications.setNotificationChannelAsync(CHANNEL_IDS.makkah, {
      name: 'Adhan - Makkah',
      description: 'Notifications for prayer times with Makkah Adhan sound',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      sound: SOUND_FILES.makkah,
      enableVibrate: true,
      showBadge: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: false,
    });
    console.log(`✅ Created channel: ${CHANNEL_IDS.makkah} with sound: ${SOUND_FILES.makkah}`);

    // Create channel for Madinah Adhan
    await Notifications.setNotificationChannelAsync(CHANNEL_IDS.madinah, {
      name: 'Adhan - Madinah',
      description: 'Notifications for prayer times with Madinah Adhan sound',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      sound: SOUND_FILES.madinah,
      enableVibrate: true,
      showBadge: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: false,
    });
    console.log(`✅ Created channel: ${CHANNEL_IDS.madinah} with sound: ${SOUND_FILES.madinah}`);

    console.log('✅ All Adhan notification channels initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing notification channels:', error);
    throw error;
  }
}

/**
 * Update or create the Android notification channel with the specified sound
 * This function now just ensures all channels exist (calls initializeAllNotificationChannels)
 * We no longer delete/recreate channels - we switch between them instead
 * 
 * @deprecated Use initializeAllNotificationChannels() on app start instead
 */
export async function updateNotificationChannel(soundName: AdhanSettings['sound']): Promise<void> {
  if (Platform.OS !== 'android') {
    return; // iOS doesn't need channel updates
  }

  try {
    console.log(`📢 Ensuring notification channels exist for sound: ${soundName}`);
    
    // Just ensure all channels exist
    await initializeAllNotificationChannels();
    
    console.log(`✅ Notification channels ready. Will use channel: ${CHANNEL_IDS[soundName]}`);
  } catch (error) {
    console.error('Error updating notification channel:', error);
    throw error;
  }
}
