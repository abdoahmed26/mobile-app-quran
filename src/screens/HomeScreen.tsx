import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, StatusBar, TouchableOpacity, Text } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { prayerTimesService } from '../services/api';
import { adhanService } from '../services/adhanService';
import { PrayerTimeData, RootStackParamList, PrayerName } from '../types';
import { COLORS, SPACING } from '../constants';
import { useTheme } from '../hooks/useTheme';
import { HomeHeader } from '../components/home/HomeHeader';
import { NextPrayerCard } from '../components/home/NextPrayerCard';
import { HijriCalendar } from '../components/home/HijriCalendar';
import { PrayerTimesSection } from '../components/home/PrayerTimesSection';
import { HomeActions } from '../components/home/HomeActions';
import { HomeFooter } from '../components/home/HomeFooter';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [nextPrayer, setNextPrayer] = useState<{ name: PrayerName; time: string; timeUntil: string } | null>(null);
  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Update next prayer countdown based on current time
  useEffect(() => {
    if (!prayerTimes) return;

    const nextPrayerInfo = adhanService.getNextPrayer(prayerTimes);
    setNextPrayer(nextPrayerInfo);
  }, [prayerTimes, currentTime]);

  useEffect(() => {
    loadPrayerTimes();
  }, []);

  const loadPrayerTimes = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'تنبيه',
          'عذرًا، لا يمكننا تحديد موقعك وبالتالي لا يمكن تحديد أوقات الصلاة'
        );
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      const data = await prayerTimesService.getPrayerTimes(latitude, longitude);
      const today = new Date();
      const month = today.getMonth(); // 0-11
      const day = today.getDate(); // 1-31
      
      // The API returns data as an object with month numbers as string keys
      // Cast to any to access by month number
      const monthlyData = (data as any)[month + 1];
      
      if (monthlyData && Array.isArray(monthlyData) && monthlyData[day - 1]) {
        const todayPrayerTimes = monthlyData[day - 1];
        setPrayerTimes(todayPrayerTimes);
        
        // Cache prayer times for Settings screen
        await AsyncStorage.setItem('@prayer_times_cache', JSON.stringify(todayPrayerTimes));
        
        // Schedule Adhan notifications
        await adhanService.scheduleAdhanNotifications(todayPrayerTimes);
        
        // Get next prayer info
        const nextPrayerInfo = adhanService.getNextPrayer(todayPrayerTimes);
        setNextPrayer(nextPrayerInfo);
      } else {
        console.error('Could not access prayer times for month:', month + 1, 'day:', day);
        Alert.alert('خطأ', 'تعذر الحصول على أوقات الصلاة لهذا اليوم');
      }
    } catch (error) {
      console.error('Error loading prayer times:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحميل أوقات الصلاة');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string | Date) => {
    if (time instanceof Date) {
      let hours = time.getHours();
      const minutes = time.getMinutes().toString().padStart(2, '0');
      const seconds = time.getSeconds().toString().padStart(2, '0');
      const period = hours >= 12 ? 'م' : 'ص';

      if (hours > 12) {
        hours -= 12;
      } else if (hours === 0) {
        hours = 12;
      }

      return `${hours}:${minutes}:${seconds} ${period}`;
    }

    // Handle prayer time string "HH:mm"
    const [hoursStr, minutes] = time.split(':');
    let hours = parseInt(hoursStr, 10);
    const period = hours >= 12 ? 'م' : 'ص';

    if (hours > 12) {
      hours -= 12;
    } else if (hours === 0) {
      hours = 12;
    }

    return `${hours}:${minutes} ${period}`;
  };

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <HomeHeader
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        currentTimeLabel={formatTime(currentTime)}
        currentDateLabel={new Date().toLocaleDateString('ar-EG', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })}
      />

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {/* Adhan is now played by OS notifications - no in-app playback UI needed */}

        {nextPrayer && (
          <NextPrayerCard
            isDarkMode={isDarkMode}
            nextPrayer={nextPrayer}
            formatTime={formatTime}
          />
        )}

        {/* Hijri Calendar */}
        <HijriCalendar isDarkMode={isDarkMode} />

        <PrayerTimesSection
          isDarkMode={isDarkMode}
          loading={loading}
          prayerTimes={prayerTimes}
          nextPrayerName={nextPrayer?.name ?? null}
          formatTime={formatTime}
        />

        <HomeActions isDarkMode={isDarkMode} navigation={navigation} />

        <HomeFooter isDarkMode={isDarkMode} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  containerDark: {
    backgroundColor: COLORS.darkBackground,
  },
  scrollView: {
    marginTop: -SPACING.xl,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  adhanBanner: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
    borderRadius: 16,
    backgroundColor: COLORS.gold + '22',
    padding: SPACING.md,
  },
  adhanBannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  adhanTextContainer: {
    flex: 1,
    marginRight: SPACING.md,
  },
  adhanTitle: {
    color: COLORS.primaryDark,
    fontWeight: 'bold',
    fontSize: 16,
  },
  adhanSubtitle: {
    color: COLORS.textMuted,
    marginTop: 4,
    fontSize: 12,
  },
  stopButtonWrapper: {
    width: 90,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
});
