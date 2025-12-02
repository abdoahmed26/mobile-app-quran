import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, SIZES, FONTS } from '../constants';

interface PrayerTimeCardProps {
  name: string;
  time: string;
  isDarkMode?: boolean;
  isActive?: boolean;
  icon?: string;
}

export const PrayerTimeCard: React.FC<PrayerTimeCardProps> = ({
  name,
  time,
  isDarkMode = false,
  isActive = false,
  icon = '🕌',
}) => {
  const gradientColors = isActive
    ? isDarkMode ? COLORS.gradients.primary : COLORS.gradients.primary
    : isDarkMode ? COLORS.gradients.cardDark : COLORS.gradients.card;

  const textColor = isActive ? COLORS.white : (isDarkMode ? COLORS.textLight : COLORS.text);
  const timeColor = isActive ? COLORS.white : (isDarkMode ? COLORS.primaryLight : COLORS.primary);

  return (
    <View style={[
      styles.container, 
      isActive && styles.activeContainer,
      isDarkMode && !isActive && styles.darkContainer
    ]}>
      <LinearGradient
        colors={gradientColors as any}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={[styles.icon, { color: textColor }]}>{icon}</Text>
        <Text style={[styles.name, { color: textColor }]}>{name}</Text>
        <Text style={[styles.time, { color: timeColor }]}>{time}</Text>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.xs,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: COLORS.shadows.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    minWidth: 75,
    height: 90,
  },
  activeContainer: {
    transform: [{ scale: 1.05 }],
    elevation: 8,
  },
  darkContainer: {
    backgroundColor: COLORS.darkCard,
  },
  gradient: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 90,
  },
  icon: {
    fontSize: 16,
    marginBottom: 2,
  },
  name: {
    fontSize: SIZES.small,
    fontWeight: '600',
    marginBottom: 2,
    fontFamily: FONTS.arabic,
  },
  time: {
    fontSize: SIZES.tiny,
    fontWeight: 'bold',
  },
});
