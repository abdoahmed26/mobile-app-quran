import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card } from '../components/Card';
import { recitersService } from '../services/api';
import { Reciter } from '../types';
import { COLORS, SPACING, SIZES } from '../constants';
import { useTheme } from '../hooks/useTheme';
import { useAudio } from '../context/AudioContext';

const SELECTED_RECITER_KEY = '@selected_reciter';

export const SettingsScreen: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { currentReciter, changeReciter } = useAudio();
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [filteredReciters, setFilteredReciters] = useState<Reciter[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showReciters, setShowReciters] = useState(false);

  useEffect(() => {
    loadReciters();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredReciters(reciters);
    } else {
      const filtered = reciters.filter((reciter) =>
        reciter.name.includes(searchQuery)
      );
      setFilteredReciters(filtered);
    }
  }, [searchQuery, reciters]);

  const loadReciters = async () => {
    try {
      const data = await recitersService.getReciters();
      setReciters(data.reciters);
      setFilteredReciters(data.reciters);
    } catch (error) {
      console.error('Error loading reciters:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحميل القراء');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectReciter = async (reciter: Reciter) => {
    try {
      await AsyncStorage.setItem(SELECTED_RECITER_KEY, JSON.stringify(reciter));
      changeReciter(reciter);
      setShowReciters(false);
      Alert.alert('نجح', `تم اختيار القارئ: ${reciter.name}`);
    } catch (error) {
      console.error('Error saving reciter:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء حفظ القارئ');
    }
  };

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Theme Setting */}
        <Card isDarkMode={isDarkMode} style={styles.card}>
          <View style={styles.settingRow}>
            <TouchableOpacity
              style={[styles.toggleButton, isDarkMode && styles.toggleButtonActive]}
              onPress={toggleTheme}
            >
              <Text style={styles.toggleButtonText}>
                {isDarkMode ? 'تفعيل' : 'تعطيل'}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.settingLabel, isDarkMode && styles.textDark]}>
              الوضع الليلي
            </Text>
          </View>
        </Card>

        {/* Reciter Setting */}
        <Card isDarkMode={isDarkMode} style={styles.card}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>
            القارئ المفضل
          </Text>
          
          {currentReciter && (
            <View style={styles.selectedReciterContainer}>
              <Text style={[styles.selectedReciterText, isDarkMode && styles.textDark]}>
                {currentReciter.name}
              </Text>
              <Text style={[styles.selectedReciterRewaya, isDarkMode && styles.textDark]}>
                ({currentReciter.rewaya})
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.changeButton, isDarkMode && styles.changeButtonDark]}
            onPress={() => setShowReciters(!showReciters)}
          >
            <Text style={styles.changeButtonText}>
              {showReciters ? 'إخفاء القائمة' : 'اختر القارئ'}
            </Text>
          </TouchableOpacity>

          {showReciters && (
            <View style={styles.recitersContainer}>
              <TextInput
                style={[styles.searchInput, isDarkMode && styles.searchInputDark]}
                placeholder="ابحث عن القارئ..."
                placeholderTextColor={isDarkMode ? COLORS.textLight : COLORS.text}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />

              {loading ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <ScrollView style={styles.recitersList} nestedScrollEnabled>
                  {filteredReciters.map((reciter) => (
                    <TouchableOpacity
                      key={reciter.id}
                      style={[
                        styles.reciterItem,
                        isDarkMode && styles.reciterItemDark,
                        currentReciter?.id === reciter.id && styles.reciterItemSelected,
                      ]}
                      onPress={() => handleSelectReciter(reciter)}
                    >
                      <Text style={[styles.reciterName, isDarkMode && styles.textDark]}>
                        {reciter.name}
                      </Text>
                      <Text style={[styles.reciterRewaya, isDarkMode && styles.textDark]}>
                        ({reciter.rewaya})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          )}
        </Card>

        {/* About */}
        <Card isDarkMode={isDarkMode} style={styles.card}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>
            عن التطبيق
          </Text>
          <Text style={[styles.aboutText, isDarkMode && styles.textDark]}>
            تطبيق القرآن الكريم - يوفر لك إمكانية الاستماع والقراءة للقرآن الكريم مع عرض أوقات الصلاة
          </Text>
          <Text style={[styles.aboutText, isDarkMode && styles.textDark]}>
            شَرف بتصميمه عبدالرحمن احمد
          </Text>
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
  scrollContent: {
    padding: SPACING.md,
  },
  card: {
    marginHorizontal: SPACING.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: SIZES.large,
    color: COLORS.text,
  },
  toggleButton: {
    backgroundColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary,
  },
  toggleButtonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  selectedReciterContainer: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  selectedReciterText: {
    fontSize: SIZES.large,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  selectedReciterRewaya: {
    fontSize: SIZES.small,
    color: COLORS.text,
    opacity: 0.7,
  },
  changeButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  changeButtonDark: {
    backgroundColor: COLORS.accent,
  },
  changeButtonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
  recitersContainer: {
    marginTop: SPACING.md,
  },
  searchInput: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: SPACING.sm,
    fontSize: SIZES.medium,
    textAlign: 'right',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  searchInputDark: {
    backgroundColor: COLORS.darkBackground,
    color: COLORS.textLight,
    borderColor: COLORS.darkBackground,
  },
  recitersList: {
    maxHeight: 300,
  },
  reciterItem: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  reciterItemDark: {
    borderBottomColor: COLORS.darkBackground,
  },
  reciterItemSelected: {
    backgroundColor: COLORS.primary,
  },
  reciterName: {
    fontSize: SIZES.medium,
    color: COLORS.text,
    textAlign: 'right',
  },
  reciterRewaya: {
    fontSize: SIZES.small,
    color: COLORS.text,
    opacity: 0.7,
    textAlign: 'right',
  },
  aboutText: {
    fontSize: SIZES.medium,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    lineHeight: SIZES.medium * 1.5,
  },
  textDark: {
    color: COLORS.textLight,
  },
});
