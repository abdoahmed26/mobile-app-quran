import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';
import { HomeScreen } from './src/screens/HomeScreen';
import { SurahListScreen } from './src/screens/SurahListScreen';
import { SurahReaderScreen } from './src/screens/SurahReaderScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { QiblaScreen } from './src/screens/QiblaScreen';
import { HijriCalendarScreen } from './src/screens/HijriCalendarScreen';
import { RootStackParamList } from './src/types';
import { COLORS } from './src/constants';
import { AudioProvider } from './src/context/AudioContext';
import { ThemeProvider } from './src/hooks/useTheme';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Configure how notifications should be handled when app is in foreground
// The OS will play the custom Adhan sound automatically
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true, // OS plays the custom sound
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function App() {
  useEffect(() => {
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
          console.log('❌ Notification permissions not granted');
          return;
        }

        console.log('✅ Notification permissions granted');

        // Initialize all notification channels (Android only)
        // This creates 3 separate channels, one for each Adhan sound
        if (Platform.OS === 'android') {
          const { initializeAllNotificationChannels } = await import('./src/services/notificationChannel');
          await initializeAllNotificationChannels();
          console.log('✅ All notification channels initialized');
        }

        // Configure notification category for iOS
        if (Platform.OS === 'ios') {
          await Notifications.setNotificationCategoryAsync('adhan', []);
          console.log('✅ iOS notification category configured');
        }

        console.log('✅ Notification system ready - OS will play Adhan sounds automatically');
      } catch (error) {
        console.error('❌ Error setting up notifications:', error);
      }
    }

    setupNotifications();
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
            <Stack.Screen 
              name="Qibla" 
              component={QiblaScreen}
            />
            <Stack.Screen 
              name="HijriCalendar" 
              component={HijriCalendarScreen}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </AudioProvider>
    </ThemeProvider>
  );
}
