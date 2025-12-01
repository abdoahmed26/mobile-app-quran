import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { Card } from '../components/Card';
import { PrayerTimeCard } from '../components/PrayerTimeCard';
import { prayerTimesService } from '../services/api';
import { PrayerTimeData, RootStackParamList } from '../types';
import { COLORS, SPACING, SIZES } from '../constants';
import { useTheme } from '../hooks/useTheme';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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
      
      console.log('Prayer times response type:', typeof data);
      console.log('Current month:', month + 1, 'Day:', day);
      
      // The API returns data as an object with month numbers as string keys
      // Cast to any to access by month number
      const monthlyData = (data as any)[month + 1];
      
      if (monthlyData && Array.isArray(monthlyData) && monthlyData[day - 1]) {
        setPrayerTimes(monthlyData[day - 1]);
        console.log('Prayer times loaded successfully');
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
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={toggleTheme}
            style={[styles.themeButton, isDarkMode && styles.themeButtonDark]}
          >
            <Text style={styles.themeIcon}>{isDarkMode ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>

          <View style={styles.timeContainer}>
            <Text style={[styles.currentTime, isDarkMode && styles.textDark]}>
              {formatTime(currentTime)}
            </Text>
          </View>
        </View>

        {/* Prayer Times */}
        <Card isDarkMode={isDarkMode} style={styles.prayerCard}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>
            أوقات الصلاة
          </Text>
          
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : prayerTimes ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <PrayerTimeCard
                name="الفجر"
                time={formatTime(prayerTimes.timings.Fajr.slice(0, 5))}
                isDarkMode={isDarkMode}
              />
              <PrayerTimeCard
                name="الشروق"
                time={formatTime(prayerTimes.timings.Sunrise.slice(0, 5))}
                isDarkMode={isDarkMode}
              />
              <PrayerTimeCard
                name="الظهر"
                time={formatTime(prayerTimes.timings.Dhuhr.slice(0, 5))}
                isDarkMode={isDarkMode}
              />
              <PrayerTimeCard
                name="العصر"
                time={formatTime(prayerTimes.timings.Asr.slice(0, 5))}
                isDarkMode={isDarkMode}
              />
              <PrayerTimeCard
                name="المغرب"
                time={formatTime(prayerTimes.timings.Maghrib.slice(0, 5))}
                isDarkMode={isDarkMode}
              />
              <PrayerTimeCard
                name="العشاء"
                time={formatTime(prayerTimes.timings.Isha.slice(0, 5))}
                isDarkMode={isDarkMode}
              />
            </ScrollView>
          ) : (
            <Text style={[styles.errorText, isDarkMode && styles.textDark]}>
              لم يتم تحميل أوقات الصلاة
            </Text>
          )}
        </Card>

        {/* Main Title */}
        <View style={styles.titleContainer}>
          <Text style={[styles.mainTitle, isDarkMode && styles.textDark]}>
            الآن هُوَ وَقْتُ الْقُرْءَانِ
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, isDarkMode && styles.actionButtonDark]}
            onPress={() => navigation.navigate('SurahList')}
          >
            <Text style={styles.actionButtonText}>📖 قائمة السور</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, isDarkMode && styles.actionButtonDark]}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.actionButtonText}>⚙️ الإعدادات</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, isDarkMode && styles.textDark]}>
            شَرف بتصميمه عبدالرحمن احمد
          </Text>
        </View>
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
  header: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl + 20,
  },
  themeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  themeButtonDark: {
    backgroundColor: COLORS.darkCard,
  },
  themeIcon: {
    fontSize: SIZES.xlarge,
  },
  timeContainer: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  currentTime: {
    fontSize: SIZES.xxlarge,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  prayerCard: {
    marginHorizontal: SPACING.md,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  errorText: {
    textAlign: 'center',
    color: COLORS.error,
    fontSize: SIZES.medium,
  },
  titleContainer: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: SIZES.xxlarge,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
  },
  actionsContainer: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  actionButtonDark: {
    backgroundColor: COLORS.accent,
  },
  actionButtonText: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  footer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: SIZES.medium,
    color: COLORS.text,
    opacity: 0.7,
  },
  textDark: {
    color: COLORS.textLight,
  },
});
