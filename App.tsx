import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import { HomeScreen } from './src/screens/HomeScreen';
import { SurahListScreen } from './src/screens/SurahListScreen';
import { SurahReaderScreen } from './src/screens/SurahReaderScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { RootStackParamList, PrayerName } from './src/types';
import { COLORS } from './src/constants';
import { AudioProvider } from './src/context/AudioContext';
import { adhanService } from './src/services/adhanService';
import { ThemeProvider } from './src/hooks/useTheme';
import { registerBackgroundNotificationTask } from './src/tasks/adhanBackgroundTask';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Configure how notifications should be handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function App() {
  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

  useEffect(() => {
    async function setupAudio() {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });
      } catch (error) {
        console.error('Error setting up audio:', error);
      }
    }

    async function setupNotifications() {
      try {
        // Request notification permissions
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        
        if (finalStatus !== 'granted') {
          console.log('Notification permissions not granted');
          return;
        }

        // Configure notification channel for Android
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('adhan', {
            name: 'Adhan Notifications',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            sound: 'default',
            enableVibrate: true,
            showBadge: true,
          });
        }

        // Register background notification task for when app is closed
        await registerBackgroundNotificationTask();

        console.log('Notifications setup complete');
      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    }

    setupAudio();
    setupNotifications();

    // Listen for notifications while app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(async (notification) => {
      console.log('Notification received:', JSON.stringify(notification, null, 2));
      const data = notification.request.content.data as { playAdhan?: boolean; prayer?: PrayerName };
      console.log('Notification data:', data);
      
      if (data?.playAdhan && data?.prayer) {
        console.log('Triggering Adhan playback for prayer:', data.prayer);
        try {
          await adhanService.playAdhan(data.prayer);
          console.log('Adhan playback triggered successfully');
        } catch (error) {
          console.error('Error playing Adhan from notification:', error);
        }
      } else {
        console.log('Notification does not have playAdhan flag or prayer name');
      }
    });

    // Listen for user tapping on notification (works even when app was closed)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(async (response) => {
      console.log('Notification tapped:', JSON.stringify(response, null, 2));
      const data = response.notification.request.content.data as { playAdhan?: boolean; prayer?: PrayerName };
      
      if (data?.playAdhan && data?.prayer) {
        console.log('Triggering Adhan playback from notification tap for prayer:', data.prayer);
        try {
          await adhanService.playAdhan(data.prayer);
        } catch (error) {
          console.error('Error playing Adhan from notification tap:', error);
        }
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return (
    <ThemeProvider>
      <AudioProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen 
              name="Home" 
              component={HomeScreen} 
            />
            <Stack.Screen 
              name="SurahList" 
              component={SurahListScreen}
            />
            <Stack.Screen 
              name="SurahReader" 
              component={SurahReaderScreen}
            />
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </AudioProvider>
    </ThemeProvider>
  );
}
