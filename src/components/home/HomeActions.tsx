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
    <View style={styles.container}>
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

      <TouchableOpacity
        style={[styles.qiblaCard, isDarkMode && styles.qiblaCardDark]}
        onPress={() => navigation.navigate('Qibla')}
      >
        <LinearGradient
          colors={isDarkMode ? COLORS.gradients.prayerDark : COLORS.gradients.prayer}
          style={styles.qiblaGradient}
        >
          <Text style={styles.qiblaIcon}>🧭</Text>
          <View style={styles.qiblaTextContainer}>
            <Text style={[styles.qiblaTitle, isDarkMode && styles.textDark]}>اتجاه القبلة</Text>
            <Text style={styles.qiblaSubtitle}>حدد اتجاه الكعبة المشرفة</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.lg,
  },
  actionsGrid: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
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
  qiblaCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    borderRadius: 20,
    elevation: 4,
    shadowColor: COLORS.shadows.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    backgroundColor: COLORS.card,
  },
  qiblaCardDark: {
    backgroundColor: COLORS.darkCard,
  },
  qiblaGradient: {
    padding: SPACING.lg,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    height: 100,
  },
  qiblaIcon: {
    fontSize: 48,
    marginRight: SPACING.lg,
  },
  qiblaTextContainer: {
    flex: 1,
  },
  qiblaTitle: {
    fontSize: SIZES.xlarge,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    fontFamily: FONTS.arabic,
  },
  qiblaSubtitle: {
    fontSize: SIZES.medium,
    color: COLORS.textMuted,
  },
  textDark: {
    color: COLORS.textLight,
  },
});


