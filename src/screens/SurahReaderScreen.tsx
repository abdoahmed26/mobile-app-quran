import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../components/Card';
import { AudioPlayer } from '../components/AudioPlayer';
import { quranService } from '../services/api';
import { Surah, RootStackParamList } from '../types';
import { COLORS, SPACING, SIZES, FONTS } from '../constants';
import { useTheme } from '../hooks/useTheme';
import { useAudio } from '../context/AudioContext';

type SurahReaderScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SurahReader'
>;

type SurahReaderScreenRouteProp = RouteProp<RootStackParamList, 'SurahReader'>;

interface Props {
  navigation: SurahReaderScreenNavigationProp;
  route: SurahReaderScreenRouteProp;
}

export const SurahReaderScreen: React.FC<Props> = ({ route, navigation }) => {
  const { isDarkMode } = useTheme();
  const { playSurah, currentSurah: playingSurah, isPlaying } = useAudio();
  const { surahNumber } = route.params;
  const [surah, setSurah] = useState<Surah | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSurah();
  }, [surahNumber]);

  const loadSurah = async () => {
    try {
      const { surah: selectedSurah, verses } = await quranService.getSurahWithVerses(surahNumber);
      selectedSurah.verses = verses;
      setSurah(selectedSurah);
    } catch (error) {
      console.error('Error loading surah:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحميل السورة');
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = () => {
    if (surah) {
      playSurah(surah);
    }
  };

  const handlePreviousSurah = () => {
    if (surahNumber > 1) {
      navigation.replace('SurahReader', { surahNumber: surahNumber - 1 });
    }
  };

  const handleNextSurah = () => {
    if (surahNumber < 114) {
      navigation.replace('SurahReader', { surahNumber: surahNumber + 1 });
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, isDarkMode && styles.containerDark]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[styles.loadingText, isDarkMode && styles.textDark]}>
          جاري التحميل...
        </Text>
      </View>
    );
  }

  if (!surah) {
    return (
      <View style={[styles.loadingContainer, isDarkMode && styles.containerDark]}>
        <Text style={[styles.errorText, isDarkMode && styles.textDark]}>
          لم يتم العثور على السورة
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <LinearGradient
          colors={isDarkMode ? COLORS.gradients.darkVertical : COLORS.gradients.primaryVertical}
          style={styles.headerBackground}
        >
          {/* Navigation & Title */}
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={[styles.navButton, surahNumber >= 114 && styles.navButtonDisabled]}
              onPress={handleNextSurah}
              disabled={surahNumber >= 114}
            >
              <Ionicons name="chevron-forward" size={24} color={COLORS.white} />
            </TouchableOpacity>

            <View style={styles.titleContainer}>
              <Text style={styles.surahName}>سورة {surah.name_translations.ar}</Text>
              <Text style={styles.surahInfo}>
                {surah.place === 'Mecca' ? 'مكية' : 'مدنية'} • {surah.number_of_ayah} آية
              </Text>
            </View>

            <TouchableOpacity 
              style={[styles.navButton, surahNumber <= 1 && styles.navButtonDisabled]}
              onPress={handlePreviousSurah}
              disabled={surahNumber <= 1}
            >
              <Ionicons name="chevron-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          {/* Play Button */}
          <TouchableOpacity 
            style={styles.playButton}
            onPress={handlePlay}
          >
            <Ionicons 
              name={playingSurah?.number_of_surah === surah.number_of_surah && isPlaying ? "pause" : "play"} 
              size={24} 
              color={COLORS.primary} 
            />
            <Text style={styles.playButtonText}>
              {playingSurah?.number_of_surah === surah.number_of_surah && isPlaying 
                ? 'إيقاف الاستماع' 
                : 'استماع للسورة'}
            </Text>
          </TouchableOpacity>

          {/* Audio Player pinned to bottom of header */}
          {playingSurah && (
            <View style={styles.playerWrapper}>
              <AudioPlayer isDarkMode={isDarkMode} />
            </View>
          )}
        </LinearGradient>

        {/* Bismillah */}
        {surahNumber !== 1 && surahNumber !== 9 && (
          <View style={styles.bismillahContainer}>
            <Text style={[styles.bismillah, isDarkMode && styles.textDark]}>
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </Text>
          </View>
        )}

        {/* Verses */}
        <View style={styles.versesContainer}>
          {surah.verses && surah.verses.length > 0 ? (
            <Text style={[styles.versesText, isDarkMode && styles.textDark]}>
              {surah.verses.map((verse, index) => (
                <Text key={verse.id || index}>
                  <Text style={[styles.verseText, isDarkMode && styles.textDark]}>
                    {verse.text}
                  </Text>
                  <Text style={[styles.verseNumberWrapper, isDarkMode && styles.verseNumberWrapperDark]}>
                    {' '}﴿{index + 1}﴾{' '}
                  </Text>
                </Text>
              ))}
            </Text>
          ) : (
            <View style={styles.noVersesContainer}>
              <Text style={[styles.errorText, isDarkMode && styles.textDark]}>
                لا توجد آيات متاحة حالياً
              </Text>
              <Text style={[styles.infoText, isDarkMode && styles.textDark]}>
                يمكنك الاستماع إلى السورة من قائمة السور
              </Text>
            </View>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: SIZES.medium,
    color: COLORS.text,
  },
  headerBackground: {
    paddingTop: StatusBar.currentHeight || 40,
    paddingBottom: SPACING.xl,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  titleContainer: {
    alignItems: 'center',
  },
  surahName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
    fontFamily: FONTS.arabic,
    marginBottom: SPACING.xs,
  },
  surahInfo: {
    fontSize: SIZES.medium,
    color: 'rgba(255,255,255,0.8)',
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 30,
    marginHorizontal: SPACING.xl,
    elevation: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  playButtonText: {
    color: COLORS.primary,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
  bismillahContainer: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  bismillah: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: FONTS.arabic,
  },
  versesContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  versesText: {
    textAlign: 'justify',
    lineHeight: 50,
  },
  verseText: {
    fontSize: 26,
    color: COLORS.text,
    fontFamily: FONTS.arabic,
  },
  verseNumberWrapper: {
    fontSize: 22,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginHorizontal: SPACING.xs,
  },
  verseNumberWrapperDark: {
    color: COLORS.accent,
  },
  noVersesContainer: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: SIZES.large,
    color: COLORS.error,
    textAlign: 'center',
  },
  infoText: {
    fontSize: SIZES.medium,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: SPACING.sm,
    opacity: 0.7,
  },
  textDark: {
    color: COLORS.textLight,
  },
  playerWrapper: {
    marginTop: SPACING.lg,
    marginHorizontal: SPACING.md,
    marginBottom: -SPACING.md,
  },
});
