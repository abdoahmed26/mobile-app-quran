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
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { Card } from '../components/Card';
import { recitersService } from '../services/api';
import { adhanService } from '../services/adhanService';
import { Reciter, AdhanSettings } from '../types';
import { COLORS, SPACING, SIZES, FONTS } from '../constants';
import { useTheme } from '../hooks/useTheme';
import { useAudio } from '../context/AudioContext';
import { prayerTimesService } from '../services/api';

const SELECTED_RECITER_KEY = '@selected_reciter';

// Adhan audio files mapping for preview
const ADHAN_SOUNDS: Record<string, any> = {
  default: require('../../assets/audio/adhan.mp3'),
  makkah: require('../../assets/audio/adhan_makkah.mp3'),
  madinah: require('../../assets/audio/adhan_madinah.mp3'),
};

export const SettingsScreen: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { currentReciter, changeReciter } = useAudio();
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [filteredReciters, setFilteredReciters] = useState<Reciter[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showReciters, setShowReciters] = useState(false);
  const [adhanSettings, setAdhanSettings] = useState<AdhanSettings | null>(null);
  const [previewSound, setPreviewSound] = useState<Audio.Sound | null>(null);
  const [previewPlayingSound, setPreviewPlayingSound] = useState<AdhanSettings['sound'] | null>(null);
  const [currentPrayerTimes, setCurrentPrayerTimes] = useState<any>(null);

  useEffect(() => {
    loadReciters();
    loadAdhanSettings();
    loadCurrentPrayerTimes();

    // Cleanup preview sound on unmount
    return () => {
      if (previewSound) {
        previewSound.unloadAsync();
      }
    };
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

  const loadAdhanSettings = async () => {
    const settings = await adhanService.getSettings();
    setAdhanSettings(settings);
  };

  const loadCurrentPrayerTimes = async () => {
    try {
      // Try to load cached prayer times from AsyncStorage
      const cachedTimes = await AsyncStorage.getItem('@prayer_times_cache');
      if (cachedTimes) {
        setCurrentPrayerTimes(JSON.parse(cachedTimes));
      }
    } catch (error) {
      console.log('No cached prayer times found');
    }
  };

  const handleAdhanSoundChange = async (sound: AdhanSettings['sound']) => {
    if (!adhanSettings) return;
    
    const newSettings: AdhanSettings = {
      ...adhanSettings,
      sound,
    };
    
    await adhanService.saveSettings(newSettings);
    setAdhanSettings(newSettings);

    // Reschedule notifications with the new sound
    // This will automatically use the correct notification channel for Android
    if (currentPrayerTimes) {
      console.log('Rescheduling notifications with new sound:', sound);
      await adhanService.scheduleDailyPrayerNotifications(currentPrayerTimes, sound);
      Alert.alert('نجح', 'تم تغيير صوت الأذان وإعادة جدولة الإشعارات');
    } else {
      Alert.alert('نجح', 'تم تغيير صوت الأذان. سيتم استخدامه في المرة القادمة.');
    }
  };

  const handleHijriOffsetChange = async (offset: number) => {
    if (!adhanSettings) return;
    
    const newSettings: AdhanSettings = {
      ...adhanSettings,
      hijriOffset: offset,
    };
    
    await adhanService.saveSettings(newSettings);
    setAdhanSettings(newSettings);
    Alert.alert('نجح', `تم تعديل التاريخ الهجري: ${offset > 0 ? '+' : ''}${offset} يوم`);
  };

  const handlePreviewAdhanSound = async (sound: AdhanSettings['sound']) => {
    if (!adhanSettings) return;

    try {
      // If the same sound is already previewing, stop it
      if (previewPlayingSound === sound && previewSound) {
        await previewSound.stopAsync();
        await previewSound.unloadAsync();
        setPreviewSound(null);
        setPreviewPlayingSound(null);
        return;
      }

      // Stop any currently playing preview
      if (previewSound) {
        await previewSound.stopAsync();
        await previewSound.unloadAsync();
        setPreviewSound(null);
      }

      // Configure audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: false,
      });

      // Load and play the selected Adhan sound
      const soundSource = ADHAN_SOUNDS[sound];
      const { sound: newSound } = await Audio.Sound.createAsync(
        soundSource,
        { shouldPlay: true, volume: 1.0 },
        (status) => {
          if (status.isLoaded && status.didJustFinish) {
            setPreviewPlayingSound(null);
            newSound.unloadAsync();
            setPreviewSound(null);
          }
        }
      );

      setPreviewSound(newSound);
      setPreviewPlayingSound(sound);

      // Save the selected sound
      await handleAdhanSoundChange(sound);
      
      console.log('Playing preview for:', sound);
    } catch (error) {
      console.error('Error previewing Adhan sound:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تشغيل المعاينة');
      setPreviewPlayingSound(null);
    }
  };

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <LinearGradient
        colors={isDarkMode ? COLORS.gradients.darkVertical : COLORS.gradients.primaryVertical}
        style={styles.headerBackground}
      >
        <Text style={styles.headerTitle}>الإعدادات</Text>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Theme Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, isDarkMode && styles.textMuted]}>المظهر</Text>
          <Card isDarkMode={isDarkMode} style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? COLORS.darkCardLight : COLORS.background }]}>
                  <Ionicons name={isDarkMode ? "moon" : "sunny"} size={24} color={COLORS.primary} />
                </View>
                <Text style={[styles.settingLabel, isDarkMode && styles.textDark]}>
                  الوضع الليلي
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.toggleButton, isDarkMode && styles.toggleButtonActive]}
                onPress={toggleTheme}
              >
                <View style={[styles.toggleCircle, isDarkMode && styles.toggleCircleActive]} />
              </TouchableOpacity>
            </View>
          </Card>
        </View>

        {/* Reciter Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, isDarkMode && styles.textMuted]}>التلاوة</Text>
          <Card isDarkMode={isDarkMode} style={styles.card}>
            <TouchableOpacity 
              style={styles.settingRow}
              onPress={() => setShowReciters(!showReciters)}
            >
              <View style={styles.settingInfo}>
                <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? COLORS.darkCardLight : COLORS.background }]}>
                  <Ionicons name="mic" size={24} color={COLORS.primary} />
                </View>
                <View>
                  <Text style={[styles.settingLabel, isDarkMode && styles.textDark]}>
                    القارئ المفضل
                  </Text>
                  {currentReciter && (
                    <Text style={styles.settingValue}>
                      {currentReciter.name}
                    </Text>
                  )}
                </View>
              </View>
              <Ionicons name={showReciters ? "chevron-up" : "chevron-down"} size={24} color={COLORS.textMuted} />
            </TouchableOpacity>

            {showReciters && (
              <View style={styles.recitersContainer}>
                <View style={[styles.searchContainer, isDarkMode && styles.searchContainerDark]}>
                  <Ionicons name="search" size={20} color={COLORS.textMuted} />
                  <TextInput
                    style={[styles.searchInput, isDarkMode && styles.searchInputDark]}
                    placeholder="ابحث عن القارئ..."
                    placeholderTextColor={COLORS.textMuted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>

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
                        <Text style={[
                          styles.reciterName, 
                          isDarkMode && styles.textDark,
                          currentReciter?.id === reciter.id && styles.textWhite
                        ]}>
                          {reciter.name}
                        </Text>
                        <Text style={[
                          styles.reciterRewaya, 
                          isDarkMode && styles.textMuted,
                          currentReciter?.id === reciter.id && styles.textWhite
                        ]}>
                          {reciter.rewaya}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            )}
          </Card>
        </View>

        {/* Adhan Section */}
        {adhanSettings && (
          <View style={styles.section}>
            <Text style={[styles.sectionHeader, isDarkMode && styles.textMuted]}>الأذان</Text>
            <Card isDarkMode={isDarkMode} style={styles.card}>
              <View style={styles.settingHeader}>
                <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? COLORS.darkCardLight : COLORS.background }]}>
                  <Ionicons name="notifications" size={24} color={COLORS.primary} />
                </View>
                <Text style={[styles.settingLabel, isDarkMode && styles.textDark]}>
                  صوت الأذان
                </Text>
              </View>

              <View style={styles.adhanSoundsContainer}>
                {[
                  { id: 'default', name: 'الافتراضي' },
                  { id: 'makkah', name: 'مكة المكرمة' },
                  { id: 'madinah', name: 'المدينة المنورة' }
                ].map((sound) => (
                  <TouchableOpacity
                    key={sound.id}
                    style={[
                      styles.adhanSoundButton,
                      isDarkMode && styles.adhanSoundButtonDark,
                      adhanSettings.sound === sound.id && styles.adhanSoundButtonActive,
                      previewPlayingSound === sound.id && styles.adhanSoundButtonPlaying,
                    ]}
                    onPress={() => handlePreviewAdhanSound(sound.id as AdhanSettings['sound'])}
                  >
                    <View style={styles.adhanSoundContent}>
                      <Text style={[
                        styles.adhanSoundText,
                        isDarkMode && styles.textDark,
                        adhanSettings.sound === sound.id && styles.textWhite,
                      ]}>
                        {sound.name}
                      </Text>
                      {previewPlayingSound === sound.id && (
                        <Text style={[styles.playingText, adhanSettings.sound === sound.id && styles.textWhite]}>
                          جاري التشغيل...
                        </Text>
                      )}
                    </View>
                    {previewPlayingSound === sound.id ? (
                      <Ionicons name="pause-circle" size={24} color={adhanSettings.sound === sound.id ? COLORS.white : COLORS.primary} />
                    ) : adhanSettings.sound === sound.id ? (
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                    ) : (
                      <Ionicons name="play-circle" size={24} color={COLORS.textMuted} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* <View style={styles.noteContainer}>
                <Ionicons name="information-circle-outline" size={20} color={COLORS.textMuted} />
                <Text style={[styles.adhanNote, isDarkMode && styles.textMuted]}>
                  تأكد من وجود ملفات الصوت في مجلد assets/audio
                </Text>
              </View> */}
            </Card>
          </View>
        )}

        {/* Hijri Calendar Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, isDarkMode && styles.textMuted]}>التقويم الهجري</Text>
          <Card isDarkMode={isDarkMode} style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? COLORS.darkCardLight : COLORS.background }]}>
                  <Ionicons name="calendar" size={24} color={COLORS.primary} />
                </View>
                <View>
                  <Text style={[styles.settingLabel, isDarkMode && styles.textDark]}>
                    تعديل التاريخ الهجري
                  </Text>
                  <Text style={[styles.settingValue, isDarkMode && styles.textMuted]}>
                    الإزاحة: {adhanSettings?.hijriOffset ? (adhanSettings.hijriOffset > 0 ? '+' : '') : ''}{adhanSettings?.hijriOffset || 0} يوم
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.offsetButtonsContainer}>
              <TouchableOpacity
                style={[
                  styles.offsetButton,
                  isDarkMode && styles.offsetButtonDark,
                  adhanSettings?.hijriOffset === -1 && styles.offsetButtonActive,
                ]}
                onPress={() => handleHijriOffsetChange(-1)}
              >
                <Text style={[
                  styles.offsetButtonText,
                  isDarkMode && styles.textDark,
                  adhanSettings?.hijriOffset === -1 && styles.textWhite,
                ]}>
                  -1 يوم
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.offsetButton,
                  isDarkMode && styles.offsetButtonDark,
                  adhanSettings?.hijriOffset === 0 && styles.offsetButtonActive,
                ]}
                onPress={() => handleHijriOffsetChange(0)}
              >
                <Text style={[
                  styles.offsetButtonText,
                  isDarkMode && styles.textDark,
                  adhanSettings?.hijriOffset === 0 && styles.textWhite,
                ]}>
                  صفر
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.offsetButton,
                  isDarkMode && styles.offsetButtonDark,
                  adhanSettings?.hijriOffset === 1 && styles.offsetButtonActive,
                ]}
                onPress={() => handleHijriOffsetChange(1)}
              >
                <Text style={[
                  styles.offsetButtonText,
                  isDarkMode && styles.textDark,
                  adhanSettings?.hijriOffset === 1 && styles.textWhite,
                ]}>
                  +1 يوم
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.noteContainer}>
              <Ionicons name="information-circle-outline" size={16} color={COLORS.textMuted} />
              <Text style={[styles.adhanNote, isDarkMode && styles.textMuted]}>
                بعض المناطق تحتاج لتعديل التاريخ الهجري بيوم واحد
              </Text>
            </View>
          </Card>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, isDarkMode && styles.textMuted]}>عن التطبيق</Text>
          <Card isDarkMode={isDarkMode} style={styles.card}>
              <View style={styles.aboutContent}>
              <View style={styles.logoContainer}>
                <Text style={styles.logoText}>🕌</Text>
              </View>
              <Text style={[styles.appName, isDarkMode && styles.textDark]}>سُكون</Text>
              <Text style={[styles.version, isDarkMode && styles.textMuted]}>الإصدار 1.0.0</Text>
              <Text style={[styles.developer, isDarkMode && styles.textDark]}>
                تطوير: عبدالرحمن احمد
              </Text>
            </View>
          </Card>
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
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: SIZES.xlarge,
    fontWeight: 'bold',
    color: COLORS.white,
    fontFamily: FONTS.arabic,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    marginHorizontal: SPACING.sm,
  },
  card: {
    padding: SPACING.md,
    borderRadius: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.text,
  },
  settingValue: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    marginTop: 2,
  },
  toggleButton: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.border,
    padding: 2,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary,
    alignItems: 'flex-end',
  },
  toggleCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleCircleActive: {
    backgroundColor: COLORS.white,
  },
  recitersContainer: {
    marginTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchContainerDark: {
    backgroundColor: COLORS.darkBackground,
    borderColor: COLORS.borderDark,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    fontSize: SIZES.medium,
    textAlign: 'right',
    color: COLORS.text,
  },
  searchInputDark: {
    color: COLORS.textLight,
  },
  recitersList: {
    maxHeight: 250,
  },
  reciterItem: {
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.xs,
  },
  reciterItemDark: {
    backgroundColor: 'transparent',
  },
  reciterItemSelected: {
    backgroundColor: COLORS.primary,
  },
  reciterName: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'right',
  },
  reciterRewaya: {
    fontSize: SIZES.small,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginTop: 2,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  adhanSoundsContainer: {
    gap: SPACING.sm,
  },
  adhanSoundButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  adhanSoundButtonDark: {
    backgroundColor: COLORS.darkBackground,
    borderColor: COLORS.borderDark,
  },
  adhanSoundButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  adhanSoundButtonPlaying: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  adhanSoundContent: {
    flex: 1,
  },
  adhanSoundText: {
    fontSize: SIZES.medium,
    color: COLORS.text,
    fontWeight: '500',
  },
  playingText: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    marginTop: 2,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  adhanNote: {
    fontSize: SIZES.small,
    color: COLORS.textMuted,
    flex: 1,
  },
  aboutContent: {
    alignItems: 'center',
    padding: SPACING.md,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  logoText: {
    fontSize: 40,
  },
  appName: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  version: {
    fontSize: SIZES.small,
    color: COLORS.textMuted,
    marginBottom: SPACING.lg,
  },
  developer: {
    fontSize: SIZES.medium,
    color: COLORS.text,
    fontWeight: '500',
  },
  offsetButtonsContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  offsetButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  offsetButtonDark: {
    backgroundColor: COLORS.darkCardLight,
    borderColor: COLORS.borderDark,
  },
  offsetButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  offsetButtonText: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.text,
  },
  textDark: {
    color: COLORS.textLight,
  },
  textMuted: {
    color: COLORS.textMuted,
  },
  textWhite: {
    color: COLORS.white,
  },
});
