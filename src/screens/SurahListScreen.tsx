import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SurahCard, SkeletonCard, AudioPlayer } from '../components';
import { quranService } from '../services/api';
import { Surah, RootStackParamList } from '../types';
import { COLORS, SPACING, SIZES } from '../constants';
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
    navigation.navigate('Settings'); // For now, navigate to settings to change reciter
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

  if (loading) {
    return (
      <View style={[styles.container, isDarkMode && styles.containerDark]}>
        <View style={styles.header}>
          <View style={[styles.searchContainer, isDarkMode && styles.searchContainerDark]}>
            <Text style={styles.searchPlaceholder}>
              🔍 ابحث عن سورة...
            </Text>
          </View>
        </View>
        <View style={styles.skeletonContainer}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <SkeletonCard key={i} isDarkMode={isDarkMode} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      {/* Reciter Selection Header */}
      <TouchableOpacity 
        style={[styles.reciterHeader, isDarkMode && styles.reciterHeaderDark]}
        onPress={handleReciterPress}
      >
        <Text style={[styles.reciterLabel, isDarkMode && styles.textMuted]}>القارئ الحالي:</Text>
        <View style={styles.reciterNameContainer}>
          <Text style={[styles.reciterName, isDarkMode && styles.textDark]}>
            {currentReciter?.name || 'اختر القارئ'}
          </Text>
          <Text style={[styles.changeIcon, isDarkMode && styles.textDark]}>⚙️</Text>
        </View>
      </TouchableOpacity>

      {/* Audio Player (Visible when playing or surah selected) */}
      {currentSurah && (
        <View style={styles.playerContainer}>
          <AudioPlayer isDarkMode={isDarkMode} />
        </View>
      )}

      {/* Enhanced Search Input */}
      <View style={styles.header}>
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
        {searchQuery.length > 0 && (
          <Text style={[styles.resultsCount, isDarkMode && styles.textDark]}>
            {filteredSurahs.length} سورة
          </Text>
        )}
      </View>

      {/* Surah List */}
      <FlatList
        data={filteredSurahs}
        renderItem={renderSurahItem}
        keyExtractor={(item) => item.number_of_surah.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
  reciterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  reciterHeaderDark: {
    backgroundColor: COLORS.darkCard,
    borderBottomColor: COLORS.darkCard,
  },
  reciterLabel: {
    fontSize: SIZES.small,
    color: COLORS.textMuted,
  },
  reciterNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  reciterName: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  changeIcon: {
    fontSize: SIZES.medium,
  },
  playerContainer: {
    marginBottom: SPACING.sm,
  },
  header: {
    padding: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    shadowColor: COLORS.shadows.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchContainerDark: {
    backgroundColor: COLORS.darkCard,
    shadowColor: COLORS.black,
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
  },
  searchInputDark: {
    color: COLORS.textLight,
  },
  searchPlaceholder: {
    fontSize: SIZES.medium,
    color: COLORS.textMuted,
    opacity: 0.6,
  },
  resultsCount: {
    marginTop: SPACING.sm,
    fontSize: SIZES.small,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  skeletonContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: SPACING.xl,
    direction: 'rtl',
  },
  textDark: {
    color: COLORS.textLight,
  },
  textMuted: {
    color: COLORS.textMuted,
  },
});
