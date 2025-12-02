import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { SurahCard, SkeletonCard, AudioPlayer } from '../components';
import { quranService } from '../services/api';
import { Surah, RootStackParamList } from '../types';
import { COLORS, SPACING, SIZES, FONTS } from '../constants';
import { useTheme } from '../hooks/useTheme';
import { useAudio } from '../context/AudioContext';

type SurahListScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SurahList'
>;

interface Props {
  navigation: SurahListScreenNavigationProp;
}

export const SurahListScreen: React.FC<Props> = ({ navigation }) => {
  const { isDarkMode } = useTheme();
  const { playSurah, currentSurah, isPlaying, currentReciter } = useAudio();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [filteredSurahs, setFilteredSurahs] = useState<Surah[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSurahs();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSurahs(surahs);
    } else {
      const filtered = surahs.filter((surah) =>
        surah.name_translations.ar.includes(searchQuery) ||
        surah.name_translations.en.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSurahs(filtered);
    }
  }, [searchQuery, surahs]);

  const loadSurahs = async () => {
    try {
      const data = await quranService.getSurahs();
      setSurahs(data);
      setFilteredSurahs(data);
    } catch (error) {
      console.error('Error loading surahs:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحميل السور');
    } finally {
      setLoading(false);
    }
  };

  const handleSurahPress = (surahNumber: number) => {
    navigation.navigate('SurahReader', { surahNumber });
  };

  const handleReciterPress = () => {
    navigation.navigate('Settings');
  };

  const renderSurahItem = ({ item }: { item: Surah }) => (
    <SurahCard
      surahNumber={item.number_of_surah}
      arabicName={item.name_translations.ar}
      englishName={item.name_translations.en}
      numberOfAyahs={item.number_of_ayah}
      revelationType={item.place}
      isDarkMode={isDarkMode}
      onPress={() => handleSurahPress(item.number_of_surah)}
      onPlayPress={() => playSurah(item)}
    />
  );

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={isDarkMode ? COLORS.gradients.darkVertical : COLORS.gradients.primaryVertical}
        style={styles.headerBackground}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>قائمة السور</Text>
          
          {/* Reciter Selection */}
          <TouchableOpacity 
            style={styles.reciterButton}
            onPress={handleReciterPress}
          >
            <Text style={styles.reciterLabel}>القارئ:</Text>
            <Text style={styles.reciterName}>
              {currentReciter?.name || 'اختر القارئ'}
            </Text>
            <Text style={styles.changeIcon}>⚙️</Text>
          </TouchableOpacity>

          {/* Search Input */}
          <View style={[styles.searchContainer, isDarkMode && styles.searchContainerDark]}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={[styles.searchInput, isDarkMode && styles.searchInputDark]}
              placeholder="ابحث عن سورة..."
              placeholderTextColor={isDarkMode ? COLORS.textMuted : COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
      </LinearGradient>

      {/* Audio Player */}
      {currentSurah && (
        <View style={styles.playerContainer}>
          <AudioPlayer isDarkMode={isDarkMode} />
        </View>
      )}

      {loading ? (
        <View style={styles.skeletonContainer}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <SkeletonCard key={i} isDarkMode={isDarkMode} />
          ))}
        </View>
      ) : (
        <>
          {searchQuery.length > 0 && (
            <Text style={[styles.resultsCount, isDarkMode && styles.textDark]}>
              {filteredSurahs.length} سورة
            </Text>
          )}
          <FlatList
            data={filteredSurahs}
            renderItem={renderSurahItem}
            keyExtractor={(item) => item.number_of_surah.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
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
    paddingHorizontal: SPACING.lg,
  },
  headerTitle: {
    fontSize: SIZES.xlarge,
    fontWeight: 'bold',
    color: COLORS.white,
    fontFamily: FONTS.arabic,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  reciterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  reciterLabel: {
    fontSize: SIZES.small,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: SPACING.xs,
  },
  reciterName: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.white,
    marginHorizontal: SPACING.sm,
  },
  changeIcon: {
    fontSize: SIZES.medium,
    opacity: 0.8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    shadowColor: COLORS.shadows.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  searchContainerDark: {
    backgroundColor: COLORS.darkCard,
  },
  searchIcon: {
    fontSize: SIZES.large,
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: SIZES.medium,
    textAlign: 'right',
    color: COLORS.text,
    padding: 0,
    height: 40,
  },
  searchInputDark: {
    color: COLORS.textLight,
  },
  playerContainer: {
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  resultsCount: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
    fontSize: SIZES.small,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  skeletonContainer: {
    flex: 1,
    paddingTop: SPACING.md,
  },
  listContent: {
    paddingBottom: SPACING.xl,
    paddingTop: SPACING.sm,
  },
  textDark: {
    color: COLORS.textLight,
  },
});
