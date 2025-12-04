import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, SIZES, FONTS } from '../../constants';
import { RootStackParamList } from '../../types';
import { getHijriDate } from '../../utils/hijriUtils';
import { Card } from '../Card';

interface HijriCalendarProps {
  isDarkMode: boolean;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ADHAN_SETTINGS_KEY = '@adhan_settings';

export const HijriCalendar: React.FC<HijriCalendarProps> = ({ isDarkMode }) => {
  const navigation = useNavigation<NavigationProp>();
  const [offset, setOffset] = useState(0);
  const [hijriDate, setHijriDate] = useState<any>(null);

  useEffect(() => {
    loadHijriOffset();
  }, []);

  useEffect(() => {
    if (offset !== null) {
      const hijri = getHijriDate(new Date(), offset);
      setHijriDate(hijri);
    }
  }, [offset]);

  const loadHijriOffset = async () => {
    try {
      const settingsJson = await AsyncStorage.getItem(ADHAN_SETTINGS_KEY);
      if (settingsJson) {
        const settings = JSON.parse(settingsJson);
        setOffset(settings.hijriOffset || 0);
      } else {
        setOffset(0);
      }
    } catch (error) {
      console.error('Error loading Hijri offset:', error);
      setOffset(0);
    }
  };

  const handlePress = () => {
    navigation.navigate('HijriCalendar');
  };

  if (!hijriDate) {
    return null;
  }

  return (
    <TouchableOpacity 
      onPress={handlePress}
      activeOpacity={0.7}
      style={styles.container}
    >
      <Card isDarkMode={isDarkMode} style={styles.card}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="calendar-outline" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.hijriDate, isDarkMode && styles.textDark]}>
              {hijriDate.day} {hijriDate.monthNameAr} {hijriDate.year} هـ
            </Text>
            <Text style={[styles.label, isDarkMode && styles.textMuted]}>
              التقويم الهجري
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.sm,
  },
  card: {
    padding: SPACING.md,
    borderRadius: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    gap: SPACING.xs,
  },
  hijriDate: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: FONTS.arabic,
  },
  label: {
    fontSize: SIZES.small,
    color: COLORS.textMuted,
  },
  textDark: {
    color: COLORS.textLight,
  },
  textMuted: {
    color: COLORS.textMuted,
  },
});
