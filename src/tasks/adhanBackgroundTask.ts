import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AdhanSettings } from '../types';

const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND_ADHAN_NOTIFICATION';
const ADHAN_SETTINGS_KEY = '@adhan_settings';

// Adhan audio files mapping
const ADHAN_SOUNDS: Record<string, any> = {
  default: require('../../assets/audio/adhan.mp3'),
  makkah: require('../../assets/audio/adhan_makkah.mp3'),
  madinah: require('../../assets/audio/adhan_madinah.mp3'),
};

/**
 * Background task that handles notifications when the app is closed or in background
 * This allows the Adhan to play even when the app is not active
 */
TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async ({ data, error, executionInfo }) => {
  console.log('[Background Task] Task triggered at:', new Date().toISOString());
  
  if (error) {
    console.error('[Background Task] Error:', error);
    return;
  }

  if (!data) {
    return;
  }

  const notification = data as any;
  const notificationData = notification.notification?.request?.content?.data || notification.data;
  
  if (notificationData?.playAdhan && notificationData?.prayer) {
    console.log('[Background Task] Playing Adhan for:', notificationData.prayer);
    
    try {
      // 1. Get User Settings
      let selectedSound = 'default';
      try {
        const settingsJson = await AsyncStorage.getItem(ADHAN_SETTINGS_KEY);
        if (settingsJson) {
          const settings: AdhanSettings = JSON.parse(settingsJson);
          selectedSound = settings.sound || 'default';
        }
      } catch (e) {
        console.error('[Background Task] Error reading settings:', e);
      }

      console.log('[Background Task] Selected sound:', selectedSound);

      // 2. Configure Audio
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // 3. Play Audio
      const soundSource = ADHAN_SOUNDS[selectedSound] || ADHAN_SOUNDS.default;
      const { sound } = await Audio.Sound.createAsync(
        soundSource,
        {
          shouldPlay: true,
          volume: 1.0,
          isLooping: false,
        }
      );

      // 4. Cleanup
      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded && status.didJustFinish) {
          console.log('[Background Task] Adhan finished playing');
          await sound.unloadAsync();
        }
      });

      console.log('[Background Task] Adhan playback started successfully');
    } catch (error) {
      console.error('[Background Task] Error playing Adhan:', error);
    }
  }
});

/**
 * Register the background notification task
 * This should be called when the app starts
 */
export async function registerBackgroundNotificationTask() {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_NOTIFICATION_TASK);
    
    if (!isRegistered) {
      await Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
      console.log('Background notification task registered successfully');
    } else {
      console.log('Background notification task already registered');
    }
  } catch (error) {
    console.error('Error registering background notification task:', error);
  }
}

/**
 * Unregister the background notification task
 */
export async function unregisterBackgroundNotificationTask() {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_NOTIFICATION_TASK);
    
    if (isRegistered) {
      await Notifications.unregisterTaskAsync(BACKGROUND_NOTIFICATION_TASK);
      console.log('Background notification task unregistered');
    }
  } catch (error) {
    console.error('Error unregistering background notification task:', error);
  }
}
