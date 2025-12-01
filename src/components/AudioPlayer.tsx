import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAudio } from '../context/AudioContext';
import { COLORS, SPACING, SIZES } from '../constants';

interface AudioPlayerProps {
  isDarkMode?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ isDarkMode = false }) => {
  const {
    isPlaying,
    currentSurah,
    currentReciter,
    duration,
    position,
    isLoading,
    pauseSurah,
    resumeSurah,
    seekTo,
    playNextSurah,
    playPreviousSurah,
    seekForward,
    seekBackward,
  } = useAudio();

  if (!currentSurah) return null;

  const progress = duration > 0 ? position / duration : 0;

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      pauseSurah();
    } else {
      resumeSurah();
    }
  };

  const handleNext = () => {
    playNextSurah();
  };

  const handlePrevious = () => {
    playPreviousSurah();
  };

  const canGoNext = currentSurah ? currentSurah.number_of_surah < 114 : false;
  const canGoPrevious = currentSurah ? currentSurah.number_of_surah > 1 : false;

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <LinearGradient
        colors={isDarkMode ? COLORS.gradients.dark : COLORS.gradients.card}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Info Section */}
        <View style={styles.infoContainer}>
          <Text style={[styles.surahName, isDarkMode && styles.textDark]}>
            سورة {currentSurah.name_translations.ar}
          </Text>
          <Text style={[styles.reciterName, isDarkMode && styles.textMuted]}>
            {currentReciter?.name}
          </Text>
        </View>

        {/* Controls Section */}
        <View style={styles.controlsContainer}>
          {/* Previous Surah */}
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={handlePrevious}
            disabled={!canGoPrevious || isLoading}
          >
            <Text style={[
              styles.controlIcon, 
              isDarkMode && styles.textDark,
              (!canGoPrevious || isLoading) && styles.controlIconDisabled
            ]}>⏮</Text>
          </TouchableOpacity>

          {/* Seek Backward */}
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={seekBackward}
            disabled={isLoading}
          >
            <MaterialCommunityIcons 
              name="rewind-5" 
              size={28} 
              color={isDarkMode ? COLORS.textLight : COLORS.text} 
              style={isLoading && styles.controlIconDisabled}
            />
          </TouchableOpacity>

          {/* Play/Pause */}
          <TouchableOpacity
            style={[styles.playButton, isDarkMode && styles.playButtonDark]}
            onPress={handlePlayPause}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
            )}
          </TouchableOpacity>

          {/* Seek Forward */}
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={seekForward}
            disabled={isLoading}
          >
            <MaterialCommunityIcons 
              name="fast-forward-5" 
              size={28} 
              color={isDarkMode ? COLORS.textLight : COLORS.text} 
              style={isLoading && styles.controlIconDisabled}
            />
          </TouchableOpacity>

          {/* Next Surah */}
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={handleNext}
            disabled={!canGoNext || isLoading}
          >
            <Text style={[
              styles.controlIcon, 
              isDarkMode && styles.textDark,
              (!canGoNext || isLoading) && styles.controlIconDisabled
            ]}>⏭</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Text style={[styles.timeText, isDarkMode && styles.textMuted]}>
            {formatTime(position)}
          </Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={[styles.timeText, isDarkMode && styles.textMuted]}>
            {formatTime(duration)}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: COLORS.shadows.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  containerDark: {
    shadowColor: COLORS.black,
  },
  gradient: {
    padding: SPACING.md,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  surahName: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  reciterName: {
    fontSize: SIZES.medium,
    color: COLORS.textMuted,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.xl,
  },
  controlButton: {
    padding: SPACING.sm,
  },
  controlIcon: {
    fontSize: 24,
    color: COLORS.text,
  },
  controlIconDisabled: {
    opacity: 0.3,
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: COLORS.shadows.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  playButtonDark: {
    backgroundColor: COLORS.accent,
  },
  playIcon: {
    fontSize: 24,
    color: COLORS.white,
    marginLeft: 2, // Optical adjustment for play icon
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  progressBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  timeText: {
    fontSize: SIZES.small,
    color: COLORS.textMuted,
    width: 40,
    textAlign: 'center',
  },
  textDark: {
    color: COLORS.textLight,
  },
  textMuted: {
    color: COLORS.textMuted,
  },
});
