import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, SIZES, FONTS } from '../../constants';

interface HomeHeaderProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  currentTimeLabel: string;
  currentDateLabel: string;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  isDarkMode,
  toggleTheme,
  currentTimeLabel,
  currentDateLabel,
}) => {
  return (
    <LinearGradient
      colors={isDarkMode ? COLORS.gradients.darkVertical : COLORS.gradients.primaryVertical}
      style={styles.headerBackground}
    >
      <View style={styles.headerContent}>
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={toggleTheme}
            style={styles.themeButton}
          >
            <Text style={styles.themeIcon}>{isDarkMode ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>سُكون</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.timeContainer}>
          <Text style={styles.currentTime}>{currentTimeLabel}</Text>
          <Text style={styles.dateText}>{currentDateLabel}</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerBackground: {
    paddingTop: StatusBar.currentHeight || 40,
    paddingBottom: SPACING.xxl,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: COLORS.shadows.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerContent: {
    paddingHorizontal: SPACING.lg,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  headerTitle: {
    fontSize: SIZES.xlarge,
    fontWeight: 'bold',
    color: COLORS.white,
    fontFamily: FONTS.arabic,
  },
  themeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeIcon: {
    fontSize: SIZES.large,
  },
  timeContainer: {
    alignItems: 'center',
  },
  currentTime: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.white,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  dateText: {
    fontSize: SIZES.medium,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
});


