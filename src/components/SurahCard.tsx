import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from './Card';
import { COLORS, SPACING, SIZES } from '../constants';

interface SurahCardProps {
  surahNumber: number;
  arabicName: string;
  englishName: string;
  numberOfAyahs: number;
  revelationType: string;
  isDarkMode?: boolean;
  onPress: () => void;
  onPlayPress: () => void;
}

export const SurahCard: React.FC<SurahCardProps> = ({
  surahNumber,
  arabicName,
  englishName,
  numberOfAyahs,
  revelationType,
  isDarkMode = false,
  onPress,
  onPlayPress,
}) => {
  return (
    <Card isDarkMode={isDarkMode} style={styles.card}>
      <Pressable onPress={onPress} style={styles.content}>
        {/* Decorative Number Badge */}
        <View style={styles.numberContainer}>
          <LinearGradient
            colors={isDarkMode ? [...COLORS.gradients.accent] : [...COLORS.gradients.primary]}
            style={styles.numberCircle}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.numberInner}>
              <Text style={styles.number}>{surahNumber}</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Surah Info */}
        <View style={styles.infoContainer}>
          <Text style={[styles.arabicName, isDarkMode && styles.textDark]}>
            سورة {arabicName}
          </Text>
          <Text style={[styles.englishName, isDarkMode && styles.englishNameDark]}>
            {englishName}
          </Text>
          <View style={styles.metaContainer}>
            <View style={[styles.badge, isDarkMode && styles.badgeDark]}>
              <Text style={[styles.badgeText, isDarkMode && styles.badgeTextDark]}>
                {numberOfAyahs} آية
              </Text>
            </View>
            <View style={[styles.badge, isDarkMode && styles.badgeDark]}>
              <Text style={[styles.badgeText, isDarkMode && styles.badgeTextDark]}>
                {revelationType === 'Mecca' ? 'مكية' : 'مدنية'}
              </Text>
            </View>
          </View>
        </View>

        {/* Play Button */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onPlayPress();
            }}
            style={[styles.playButton, isDarkMode && styles.playButtonDark]}
          >
            <LinearGradient
              colors={isDarkMode ? [...COLORS.gradients.primary] : [...COLORS.gradients.accent]}
              style={styles.playGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.playIcon}>▶</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.xs,
  },
  numberContainer: {
    marginRight: SPACING.md,
  },
  numberCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadows.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  numberInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.white + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  number: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  infoContainer: {
    flex: 1,
  },
  arabicName: {
    fontSize: SIZES.xlarge,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    textAlign: 'right',
  },
  englishName: {
    fontSize: SIZES.small,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
    textAlign: 'right',
  },
  englishNameDark: {
    color: COLORS.textLight,
    opacity: 0.6,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.xs,
  },
  badge: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: 12,
  },
  badgeDark: {
    backgroundColor: COLORS.accent + '20',
  },
  badgeText: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    fontWeight: '600',
  },
  badgeTextDark: {
    color: COLORS.accent,
  },
  actionsContainer: {
    marginLeft: SPACING.md,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: COLORS.shadows.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  playButtonDark: {
    shadowColor: COLORS.black,
  },
  playGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: SIZES.medium,
    color: COLORS.white,
    marginLeft: 3,
  },
  textDark: {
    color: COLORS.textLight,
  },
});
