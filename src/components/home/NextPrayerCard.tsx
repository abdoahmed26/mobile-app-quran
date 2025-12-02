import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, SIZES, FONTS } from '../../constants';
import { PrayerName, PRAYER_NAMES } from '../../types';

interface NextPrayerCardProps {
  isDarkMode: boolean;
  nextPrayer: { name: PrayerName; time: string; timeUntil: string };
  formatTime: (time: string | Date) => string;
}

export const NextPrayerCard: React.FC<NextPrayerCardProps> = ({
  isDarkMode,
  nextPrayer,
  formatTime,
}) => {
  return (
    <View style={styles.nextPrayerCard}>
      <LinearGradient
        colors={isDarkMode ? COLORS.gradients.primary : COLORS.gradients.gold}
        style={styles.nextPrayerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.nextPrayerHeader}>
          <Text style={styles.nextPrayerLabel}>الصلاة القادمة</Text>
        </View>

        <View style={styles.nextPrayerContent}>
          <View style={styles.nextPrayerMainInfo}>
            <Text style={styles.nextPrayerName}>
              {PRAYER_NAMES[nextPrayer.name]}
            </Text>
            <Text style={styles.nextPrayerTime}>
              {formatTime(nextPrayer.time)}
            </Text>
          </View>

          <View style={styles.countdownContainer}>
            <Text style={styles.countdownLabel}>متبقي</Text>
            <Text style={styles.nextPrayerCountdown}>
              {nextPrayer.timeUntil}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  nextPrayerCard: {
    marginHorizontal: SPACING.lg,
    borderRadius: 20,
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    marginBottom: SPACING.md,
  },
  nextPrayerGradient: {
    padding: SPACING.md,
    borderRadius: 20,
  },
  nextPrayerHeader: {
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  nextPrayerLabel: {
    fontSize: SIZES.tiny,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    letterSpacing: 1,
  },
  nextPrayerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextPrayerMainInfo: {
    alignItems: 'flex-start',
  },
  nextPrayerName: {
    fontSize: SIZES.xxlarge,
    fontWeight: 'bold',
    color: COLORS.white,
    fontFamily: FONTS.arabic,
    marginBottom: 2,
  },
  nextPrayerTime: {
    fontSize: SIZES.medium,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  countdownContainer: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 100,
  },
  countdownLabel: {
    fontSize: SIZES.tiny,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 2,
  },
  nextPrayerCountdown: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.white,
    fontVariant: ['tabular-nums'],
  },
});


