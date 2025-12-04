/**
 * HijriCalendarScreen
 * 
 * Full month view of Hijri calendar with:
 * - 7x6 grid showing Hijri and Gregorian dates
 * - Month/year navigation
 * - Current day highlighting
 * - Dark mode support
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../types';
import { COLORS, SPACING, SIZES, FONTS } from '../constants';
import { useTheme } from '../hooks/useTheme';
import {
  getHijriMonth,
  getCurrentHijriMonthYear,
  getNextHijriMonth,
  getPreviousHijriMonth,
  formatGregorianDate,
  HIJRI_MONTHS_AR,
  HIJRI_DAYS_AR,
  HijriDay,
} from '../utils/hijriUtils';

type HijriCalendarScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'HijriCalendar'>;

interface Props {
  navigation: HijriCalendarScreenNavigationProp;
}

const ADHAN_SETTINGS_KEY = '@adhan_settings';

export const HijriCalendarScreen: React.FC<Props> = ({ navigation }) => {
  const { isDarkMode } = useTheme();
  const [offset, setOffset] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(1);
  const [currentYear, setCurrentYear] = useState(1446);
  const [calendarDays, setCalendarDays] = useState<HijriDay[]>([]);

  // Load Hijri offset from settings
  useEffect(() => {
    loadHijriOffset();
  }, []);

  // Initialize with current Hijri month
  useEffect(() => {
    const { month, year } = getCurrentHijriMonthYear(offset);
    setCurrentMonth(month);
    setCurrentYear(year);
  }, [offset]);

  // Generate calendar days when month/year/offset changes
  useEffect(() => {
    const days = getHijriMonth(currentYear, currentMonth, offset);
    setCalendarDays(days);
  }, [currentMonth, currentYear, offset]);

  const loadHijriOffset = async () => {
    try {
      const settingsJson = await AsyncStorage.getItem(ADHAN_SETTINGS_KEY);
      if (settingsJson) {
        const settings = JSON.parse(settingsJson);
        setOffset(settings.hijriOffset || 0);
      }
    } catch (error) {
      console.error('Error loading Hijri offset:', error);
    }
  };

  const handlePreviousMonth = () => {
    const { month, year } = getPreviousHijriMonth(currentYear, currentMonth);
    setCurrentMonth(month);
    setCurrentYear(year);
  };

  const handleNextMonth = () => {
    const { month, year } = getNextHijriMonth(currentYear, currentMonth);
    setCurrentMonth(month);
    setCurrentYear(year);
  };

  const handleToday = () => {
    const { month, year } = getCurrentHijriMonthYear(offset);
    setCurrentMonth(month);
    setCurrentYear(year);
  };

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={isDarkMode ? COLORS.gradients.darkVertical : COLORS.gradients.primaryVertical}
        style={styles.headerBackground}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>التقويم الهجري</Text>
          <TouchableOpacity
            style={styles.todayButton}
            onPress={handleToday}
          >
            <Ionicons name="today" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Month Navigation */}
        <View style={[styles.monthNavigation, isDarkMode && styles.monthNavigationDark]}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={handleNextMonth}
          >
            <Ionicons 
              name="chevron-forward" 
              size={28} 
              color={isDarkMode ? COLORS.textLight : COLORS.primary} 
            />
          </TouchableOpacity>

          <View style={styles.monthYearContainer}>
            <Text style={[styles.monthName, isDarkMode && styles.textDark]}>
              {HIJRI_MONTHS_AR[currentMonth - 1]}
            </Text>
            <Text style={[styles.yearText, isDarkMode && styles.textMuted]}>
              {currentYear} هـ
            </Text>
          </View>

          <TouchableOpacity
            style={styles.navButton}
            onPress={handlePreviousMonth}
          >
            <Ionicons 
              name="chevron-back" 
              size={28} 
              color={isDarkMode ? COLORS.textLight : COLORS.primary} 
            />
          </TouchableOpacity>
        </View>

        {/* Offset Indicator */}
        {offset !== 0 && (
          <View style={[styles.offsetIndicator, isDarkMode && styles.offsetIndicatorDark]}>
            <Ionicons name="information-circle" size={16} color={COLORS.gold} />
            <Text style={[styles.offsetText, isDarkMode && styles.textMuted]}>
              الإزاحة: {offset > 0 ? '+' : ''}{offset} يوم
            </Text>
          </View>
        )}

        {/* Calendar Grid */}
        <View style={[styles.calendarContainer, isDarkMode && styles.calendarContainerDark]}>
          {/* Weekday Headers */}
          <View style={styles.weekdayRow}>
            {HIJRI_DAYS_AR.map((day, index) => (
              <View key={index} style={styles.weekdayCell}>
                <Text style={[styles.weekdayText, isDarkMode && styles.textMuted]}>
                  {day}
                </Text>
              </View>
            ))}
          </View>

          {/* Calendar Days */}
          <View style={styles.daysGrid}>
            {calendarDays.map((day, index) => (
              <View
                key={index}
                style={[
                  styles.dayCell,
                  day.isToday && styles.todayCell,
                  day.isToday && isDarkMode && styles.todayCellDark,
                  day.event && styles.eventCell,
                ]}
              >
                {/* Event indicator dot */}
                {day.event && (
                  <View 
                    style={[
                      styles.eventDot, 
                      { backgroundColor: day.event.color }
                    ]} 
                  />
                )}
                
                <Text
                  style={[
                    styles.hijriDayText,
                    !day.isCurrentMonth && styles.otherMonthText,
                    day.isToday && styles.todayText,
                    isDarkMode && day.isCurrentMonth && styles.textDark,
                    day.event && styles.eventDayText,
                  ]}
                >
                  {day.hijriDay}
                </Text>
                <Text
                  style={[
                    styles.gregorianDayText,
                    !day.isCurrentMonth && styles.otherMonthTextSmall,
                    isDarkMode && styles.textMuted,
                  ]}
                >
                  {formatGregorianDate(day.gregorianDate)}
                </Text>
                
                {/* Event name */}
                {day.event && day.isCurrentMonth && (
                  <Text
                    style={[
                      styles.eventText,
                      day.isToday && styles.eventTextToday,
                    ]}
                    numberOfLines={1}
                  >
                    {day.event.nameAr}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Info Card */}
        <View style={[styles.infoCard, isDarkMode && styles.infoCardDark]}>
          <View style={styles.infoRow}>
            <Ionicons 
              name="information-circle-outline" 
              size={20} 
              color={isDarkMode ? COLORS.textLight : COLORS.primary} 
            />
            <Text style={[styles.infoText, isDarkMode && styles.textMuted]}>
              يمكنك تعديل إزاحة التاريخ الهجري من الإعدادات
            </Text>
          </View>
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
  headerBackground: {
    paddingTop: StatusBar.currentHeight || 40,
    paddingBottom: SPACING.lg,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: COLORS.shadows.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: SIZES.xlarge,
    fontWeight: 'bold',
    color: COLORS.white,
    fontFamily: FONTS.arabic,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: COLORS.shadows.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  monthNavigationDark: {
    backgroundColor: COLORS.darkCard,
  },
  navButton: {
    padding: SPACING.sm,
  },
  monthYearContainer: {
    alignItems: 'center',
  },
  monthName: {
    fontSize: SIZES.xlarge,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: FONTS.arabic,
    marginBottom: SPACING.xs,
  },
  yearText: {
    fontSize: SIZES.medium,
    color: COLORS.textMuted,
    fontFamily: FONTS.arabic,
  },
  offsetIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gold + '20',
    borderRadius: 12,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  offsetIndicatorDark: {
    backgroundColor: COLORS.gold + '30',
  },
  offsetText: {
    fontSize: SIZES.small,
    color: COLORS.textMuted,
  },
  calendarContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.md,
    elevation: 2,
    shadowColor: COLORS.shadows.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: SPACING.md,
  },
  calendarContainerDark: {
    backgroundColor: COLORS.darkCard,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '30',
    paddingBottom: SPACING.sm,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: SIZES.small,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: FONTS.arabic,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.285%', // 100% / 7 days
    aspectRatio: 1,
    padding: SPACING.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    position: 'relative',
  },
  eventCell: {
    backgroundColor: COLORS.background + '50',
  },
  eventDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  todayCell: {
    backgroundColor: COLORS.primary,
  },
  todayCellDark: {
    backgroundColor: COLORS.accent,
  },
  hijriDayText: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: FONTS.arabic,
    marginBottom: 2,
  },
  eventDayText: {
    fontWeight: '800',
  },
  gregorianDayText: {
    fontSize: 9,
    color: COLORS.textMuted,
  },
  eventText: {
    fontSize: 7,
    color: COLORS.primary,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 2,
  },
  eventTextToday: {
    color: COLORS.white,
  },
  otherMonthText: {
    opacity: 0.3,
  },
  otherMonthTextSmall: {
    opacity: 0.3,
  },
  todayText: {
    color: COLORS.white,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    elevation: 1,
    shadowColor: COLORS.shadows.light,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoCardDark: {
    backgroundColor: COLORS.darkCard,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  infoText: {
    flex: 1,
    fontSize: SIZES.small,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  textDark: {
    color: COLORS.textLight,
  },
  textMuted: {
    color: COLORS.textMuted,
  },
});
