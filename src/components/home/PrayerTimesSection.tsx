import React from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { PrayerTimeCard } from '../PrayerTimeCard';
import { COLORS, SPACING, SIZES, FONTS } from '../../constants';
import { PrayerName, PrayerTimeData, PRAYER_NAMES } from '../../types';

interface PrayerTimesSectionProps {
  isDarkMode: boolean;
  loading: boolean;
  prayerTimes: PrayerTimeData | null;
  nextPrayerName: PrayerName | null;
  formatTime: (time: string | Date) => string;
}

const PRAYER_ICONS: Record<string, string> = {
  Fajr: '🌅',
  Sunrise: '☀️',
  Dhuhr: '🌞',
  Asr: '🌤️',
  Maghrib: '🌇',
  Isha: '🌙',
};

export const PrayerTimesSection: React.FC<PrayerTimesSectionProps> = ({
  isDarkMode,
  loading,
  prayerTimes,
  nextPrayerName,
  formatTime,
}) => {
  return (
    <View style={styles.prayerTimesSection}>
      <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>
        أوقات الصلاة
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} />
      ) : prayerTimes ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.prayerTimesList}
        >
          {(['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const).map((prayer) => (
            <PrayerTimeCard
              key={prayer}
              name={prayer === 'Sunrise' ? 'الشروق' : PRAYER_NAMES[prayer as PrayerName]}
              time={formatTime(prayerTimes.timings[prayer].slice(0, 5))}
              isDarkMode={isDarkMode}
              isActive={nextPrayerName === prayer}
              icon={PRAYER_ICONS[prayer]}
            />
          ))}
        </ScrollView>
      ) : (
        <Text style={[styles.errorText, isDarkMode && styles.textDark]}>
          لم يتم تحميل أوقات الصلاة
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  prayerTimesSection: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    fontFamily: FONTS.arabic,
  },
  prayerTimesList: {
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  textDark: {
    color: COLORS.textLight,
  },
  errorText: {
    textAlign: 'center',
    color: COLORS.error,
    fontSize: SIZES.medium,
    marginTop: SPACING.md,
  },
});


