import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, SIZES, FONTS } from '../../constants';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';

interface HomeActionsProps {
  isDarkMode: boolean;
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
}

export const HomeActions: React.FC<HomeActionsProps> = ({ isDarkMode, navigation }) => {
  return (
    <View style={styles.actionsGrid}>
      <TouchableOpacity
        style={[styles.actionCard, isDarkMode && styles.actionCardDark]}
        onPress={() => navigation.navigate('SurahList')}
      >
        <LinearGradient
          colors={isDarkMode ? COLORS.gradients.cardDark : COLORS.gradients.card}
          style={styles.actionGradient}
        >
          <Text style={styles.actionIcon}>📖</Text>
          <Text style={[styles.actionTitle, isDarkMode && styles.textDark]}>قراءة القرآن</Text>
          <Text style={styles.actionSubtitle}>تصفح السور والآيات</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionCard, isDarkMode && styles.actionCardDark]}
        onPress={() => navigation.navigate('Settings')}
      >
        <LinearGradient
          colors={isDarkMode ? COLORS.gradients.cardDark : COLORS.gradients.card}
          style={styles.actionGradient}
        >
          <Text style={styles.actionIcon}>⚙️</Text>
          <Text style={[styles.actionTitle, isDarkMode && styles.textDark]}>الإعدادات</Text>
          <Text style={styles.actionSubtitle}>القارئ، الأذان، المظهر</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actionsGrid: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
    marginVertical: SPACING.lg,
  },
  actionCard: {
    flex: 1,
    borderRadius: 20,
    elevation: 4,
    shadowColor: COLORS.shadows.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    backgroundColor: COLORS.card,
  },
  actionCardDark: {
    backgroundColor: COLORS.darkCard,
  },
  actionGradient: {
    padding: SPACING.lg,
    borderRadius: 20,
    alignItems: 'center',
    height: 160,
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: SPACING.md,
  },
  actionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    fontFamily: FONTS.arabic,
  },
  actionSubtitle: {
    fontSize: SIZES.small,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  textDark: {
    color: COLORS.textLight,
  },
});


