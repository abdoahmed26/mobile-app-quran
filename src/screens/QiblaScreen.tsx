/**
 * QiblaScreen
 * 
 * Main screen for displaying the Qibla direction compass
 * with comprehensive error handling and user instructions
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useQiblaDirection } from '../hooks/useQiblaDirection';
import { QiblaCompass } from '../components/QiblaCompass';
import { Card } from '../components/Card';
import { RootStackParamList } from '../types';
import { COLORS, SPACING, SIZES, FONTS } from '../constants';
import { useTheme } from '../hooks/useTheme';

type QiblaScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Qibla'>;

interface Props {
  navigation: QiblaScreenNavigationProp;
}

export const QiblaScreen: React.FC<Props> = ({ navigation }) => {
  const { isDarkMode } = useTheme();
  const {
    qiblaDirection,
    heading,
    qiblaBearing,
    location,
    loading,
    error,
    locationPermission,
    sensorAvailable,
  } = useQiblaDirection();

  const renderContent = () => {
    // Loading state
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={[styles.loadingText, isDarkMode && styles.textDark]}>
            جاري تحديد موقعك...
          </Text>
        </View>
      );
    }

    // Error states
    if (error || !locationPermission || !sensorAvailable) {
      return (
        <View style={styles.centerContainer}>
          <View style={styles.errorIconContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
          </View>
          <Text style={[styles.errorTitle, isDarkMode && styles.textDark]}>
            {!locationPermission
              ? 'إذن الموقع مطلوب'
              : !sensorAvailable
              ? 'البوصلة غير متوفرة'
              : 'حدث خطأ'}
          </Text>
          <Text style={[styles.errorMessage, isDarkMode && styles.textMuted]}>
            {error ||
              (!locationPermission
                ? 'يرجى السماح بالوصول إلى موقعك لتحديد اتجاه القبلة'
                : 'جهازك لا يدعم البوصلة المغناطيسية')}
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>العودة للرئيسية</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Success state - show compass
    return (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Compass Container */}
        <Card isDarkMode={isDarkMode} style={styles.compassCard}>
          <View style={styles.compassContainer}>
            <QiblaCompass
              qiblaDirection={qiblaDirection}
              heading={heading}
              isDarkMode={isDarkMode}
            />
          </View>
        </Card>

        {/* Direction Info Cards */}
        <View style={styles.infoGrid}>
          <Card isDarkMode={isDarkMode} style={styles.infoCard}>
            <View style={[styles.infoIconContainer, { backgroundColor: COLORS.primary + '20' }]}>
              <Ionicons name="compass" size={24} color={COLORS.primary} />
            </View>
            <Text style={[styles.infoLabel, isDarkMode && styles.textMuted]}>
              اتجاه القبلة
            </Text>
            <Text style={[styles.infoValue, isDarkMode && styles.textDark]}>
              {Math.round(qiblaBearing)}°
            </Text>
          </Card>

          <Card isDarkMode={isDarkMode} style={styles.infoCard}>
            <View style={[styles.infoIconContainer, { backgroundColor: COLORS.accent + '20' }]}>
              <Ionicons name="phone-portrait" size={24} color={COLORS.accent} />
            </View>
            <Text style={[styles.infoLabel, isDarkMode && styles.textMuted]}>
              اتجاه الجهاز
            </Text>
            <Text style={[styles.infoValue, isDarkMode && styles.textDark]}>
              {Math.round(heading)}°
            </Text>
          </Card>
        </View>

        {/* Instructions Card */}
        <Card isDarkMode={isDarkMode} style={styles.instructionsCard}>
          <View style={styles.instructionsHeader}>
            <View style={[styles.infoIconContainer, { backgroundColor: COLORS.gold + '20' }]}>
              <Ionicons name="information-circle" size={24} color={COLORS.gold} />
            </View>
            <Text style={[styles.instructionsTitle, isDarkMode && styles.textDark]}>
              كيفية الاستخدام
            </Text>
          </View>
          <View style={styles.instructionsList}>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionBullet}>•</Text>
              <Text style={[styles.instructionText, isDarkMode && styles.textMuted]}>
                أمسك جهازك بشكل مسطح
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionBullet}>•</Text>
              <Text style={[styles.instructionText, isDarkMode && styles.textMuted]}>
                حرك جهازك ببطء في دائرة لمعايرة البوصلة
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionBullet}>•</Text>
              <Text style={[styles.instructionText, isDarkMode && styles.textMuted]}>
                السهم الأخضر 🕋 يشير إلى اتجاه الكعبة
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionBullet}>•</Text>
              <Text style={[styles.instructionText, isDarkMode && styles.textMuted]}>
                عندما يكون السهم متجهًا للأعلى، أنت تواجه القبلة
              </Text>
            </View>
          </View>
        </Card>

        {/* Location Info */}
        {location && (
          <Card isDarkMode={isDarkMode} style={styles.locationCard}>
            <View style={styles.locationHeader}>
              <Ionicons name="location" size={20} color={COLORS.primary} />
              <Text style={[styles.locationLabel, isDarkMode && styles.textMuted]}>
                موقعك الحالي
              </Text>
            </View>
            <Text style={[styles.locationText, isDarkMode && styles.textDark]}>
              {location.latitude.toFixed(4)}°, {location.longitude.toFixed(4)}°
            </Text>
          </Card>
        )}
      </ScrollView>
    );
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
            style={styles.backIconButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>اتجاه القبلة</Text>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      {renderContent()}
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
    marginBottom: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
  },
  backIconButton: {
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
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: SIZES.medium,
    color: COLORS.textMuted,
  },
  errorIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  errorIcon: {
    fontSize: 48,
  },
  errorTitle: {
    fontSize: SIZES.xlarge,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: SIZES.medium,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    lineHeight: 24,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    elevation: 2,
    shadowColor: COLORS.shadows.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
  compassCard: {
    padding: SPACING.lg,
    borderRadius: 20,
    marginBottom: SPACING.md,
  },
  compassContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  infoCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: 16,
    alignItems: 'center',
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  infoLabel: {
    fontSize: SIZES.small,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  infoValue: {
    fontSize: SIZES.xlarge,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  instructionsCard: {
    padding: SPACING.lg,
    borderRadius: 16,
    marginBottom: SPACING.md,
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  instructionsTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  instructionsList: {
    gap: SPACING.sm,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  instructionBullet: {
    fontSize: SIZES.large,
    color: COLORS.primary,
    marginTop: 2,
  },
  instructionText: {
    flex: 1,
    fontSize: SIZES.medium,
    color: COLORS.textMuted,
    lineHeight: 22,
  },
  locationCard: {
    padding: SPACING.md,
    borderRadius: 16,
    alignItems: 'center',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  locationLabel: {
    fontSize: SIZES.small,
    color: COLORS.textMuted,
  },
  locationText: {
    fontSize: SIZES.medium,
    color: COLORS.text,
    fontWeight: '500',
  },
  textDark: {
    color: COLORS.textLight,
  },
  textMuted: {
    color: COLORS.textMuted,
  },
});
