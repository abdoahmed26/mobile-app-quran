import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Audio } from 'expo-av';
import { HomeScreen } from './src/screens/HomeScreen';
import { SurahListScreen } from './src/screens/SurahListScreen';
import { SurahReaderScreen } from './src/screens/SurahReaderScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { RootStackParamList } from './src/types';
import { COLORS } from './src/constants';
import { AudioProvider } from './src/context/AudioContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
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

    setupAudio();
  }, []);

  return (
    <AudioProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: COLORS.primary,
            },
            headerTintColor: COLORS.white,
            headerTitleStyle: {
              fontWeight: 'bold',
              fontFamily: 'System',
            },
            headerTitleAlign: 'center',
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="SurahList" 
            component={SurahListScreen}
            options={{ title: 'قائمة السور' }}
          />
          <Stack.Screen 
            name="SurahReader" 
            component={SurahReaderScreen}
            options={{ title: 'قراءة السورة' }}
          />
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{ title: 'الإعدادات' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AudioProvider>
  );
}
