import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './Card';
import { COLORS, SPACING, SIZES } from '../constants';

interface PrayerTimeCardProps {
  name: string;
  time: string;
  isDarkMode?: boolean;
}

export const PrayerTimeCard: React.FC<PrayerTimeCardProps> = ({
  name,
  time,
  isDarkMode = false,
}) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.name, isDarkMode && styles.textDark]}>{name}</Text>
      <Text style={[styles.time, isDarkMode && styles.textDark]}>{time}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: SPACING.sm,
    minWidth: 80,
  },
  name: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  time: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  textDark: {
    color: COLORS.textLight,
  },
});
