import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/Card';
import { AudioPlayer } from '../components/AudioPlayer';
import { quranService } from '../services/api';
import { Surah, RootStackParamList } from '../types';
import { COLORS, SPACING, SIZES } from '../constants';
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
      // Use the new API that fetches verses
      const { surah: selectedSurah, verses } = await quranService.getSurahWithVerses(surahNumber);
      
      // Attach verses to surah object
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
      {/* Audio Player */}
      {playingSurah && <AudioPlayer isDarkMode={isDarkMode} />}

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Surah Header */}
        <Card isDarkMode={isDarkMode} style={styles.headerCard}>
          {/* Navigation Buttons */}
          <View style={styles.navigationContainer}>
            <TouchableOpacity 
              style={[
                styles.navButton, 
                isDarkMode && styles.navButtonDark,
                surahNumber >= 114 && styles.navButtonDisabled
              ]}
              onPress={handleNextSurah}
              disabled={surahNumber >= 114}
            >
              <Ionicons 
                name="chevron-forward" 
                size={24} 
                color={surahNumber >= 114 ? COLORS.textMuted : (isDarkMode ? COLORS.accent : COLORS.primary)} 
              />
              <Text style={[
                styles.navButtonText, 
                isDarkMode && styles.navButtonTextDark,
                surahNumber >= 114 && styles.navButtonTextDisabled
              ]}>
                التالي
              </Text>
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={[styles.surahName, isDarkMode && styles.textDark]}>
                سورة {surah.name_translations.ar}
              </Text>
              <Text style={[styles.surahInfo, isDarkMode && styles.textDark]}>
                {surah.place === 'Mecca' ? 'مكية' : 'مدنية'} • {surah.number_of_ayah} آية
              </Text>
            </View>

            <TouchableOpacity 
              style={[
                styles.navButton, 
                isDarkMode && styles.navButtonDark,
                surahNumber <= 1 && styles.navButtonDisabled
              ]}
              onPress={handlePreviousSurah}
              disabled={surahNumber <= 1}
            >
              <Text style={[
                styles.navButtonText, 
                isDarkMode && styles.navButtonTextDark,
                surahNumber <= 1 && styles.navButtonTextDisabled
              ]}>
                السابق
              </Text>
              <Ionicons 
                name="chevron-back" 
                size={24} 
                color={surahNumber <= 1 ? COLORS.textMuted : (isDarkMode ? COLORS.accent : COLORS.primary)} 
              />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[styles.playButton, isDarkMode && styles.playButtonDark]}
            onPress={handlePlay}
          >
            <Text style={styles.playButtonText}>
              {playingSurah?.number_of_surah === surah.number_of_surah && isPlaying 
                ? 'إيقاف الاستماع' 
                : 'استماع للسورة'}
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Bismillah */}
        {surahNumber !== 1 && surahNumber !== 9 && (
          <Card isDarkMode={isDarkMode} style={styles.bismillahCard}>
            <Text style={[styles.bismillah, isDarkMode && styles.textDark]}>
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </Text>
          </Card>
        )}

        {/* Verses */}
        <Card isDarkMode={isDarkMode} style={styles.versesCard}>
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
        </Card>
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
  errorText: {
    fontSize: SIZES.large,
    color: COLORS.error,
    textAlign: 'center',
  },
  headerCard: {
    marginTop: SPACING.md,
    marginHorizontal: SPACING.md,
    alignItems: 'center',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: SPACING.md,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 12,
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  navButtonDark: {
    backgroundColor: COLORS.darkCardLight,
    borderColor: COLORS.accent,
  },
  navButtonDisabled: {
    opacity: 0.3,
    borderColor: COLORS.textMuted,
  },
  navButtonText: {
    fontSize: SIZES.medium,
    color: COLORS.primary,
    fontWeight: '600',
    marginHorizontal: SPACING.xs,
  },
  navButtonTextDark: {
    color: COLORS.accent,
  },
  navButtonTextDisabled: {
    color: COLORS.textMuted,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
  },
  surahName: {
    fontSize: SIZES.xxlarge,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  surahInfo: {
    fontSize: SIZES.medium,
    color: COLORS.text,
    opacity: 0.7,
    textAlign: 'center',
  },
  playButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginTop: SPACING.md,
  },
  playButtonDark: {
    backgroundColor: COLORS.accent,
  },
  playButtonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
  bismillahCard: {
    marginHorizontal: SPACING.md,
    alignItems: 'center',
  },
  bismillah: {
    fontSize: SIZES.xlarge,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
  },
  versesCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.xl,
    padding: SPACING.lg,
  },
  versesText: {
    textAlign: 'justify',
    direction: 'rtl',
  },
  verseText: {
    fontSize: SIZES.xxlarge,
    lineHeight: SIZES.xxlarge * 2.5,
    color: COLORS.text,
    fontWeight: '500',
  },
  verseNumberWrapper: {
    fontSize: SIZES.xlarge,
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
});
