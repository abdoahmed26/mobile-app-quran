import React, { createContext, useState, useContext, useEffect } from 'react';
import { Audio } from 'expo-av';
import { Surah, Reciter } from '../types';
import { quranService } from '../services/api';
import { API_ENDPOINTS } from '../constants';

interface AudioContextType {
  isPlaying: boolean;
  currentSurah: Surah | null;
  currentReciter: Reciter | null;
  sound: Audio.Sound | null;
  duration: number;
  position: number;
  isLoading: boolean;
  playSurah: (surah: Surah) => Promise<void>;
  pauseSurah: () => Promise<void>;
  resumeSurah: () => Promise<void>;
  stopSurah: () => Promise<void>;
  changeReciter: (reciter: Reciter) => void;
  seekTo: (position: number) => Promise<void>;
  playNextSurah: () => Promise<void>;
  playPreviousSurah: () => Promise<void>;
  seekForward: () => Promise<void>;
  seekBackward: () => Promise<void>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSurah, setCurrentSurah] = useState<Surah | null>(null);
  const [currentReciter, setCurrentReciter] = useState<Reciter | null>(null);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Default reciter (can be moved to constants or persisted storage)
  const defaultReciter: Reciter = {
    id: 'shatri',
    name: 'أبو بكر الشاطري',
    Server: API_ENDPOINTS.DEFAULT_RECITER_SERVER,
    rewaya: 'Rewayat Hafs A\'n Assem',
    letter: 'A',
    suras: [], // Not needed for initial state
  };

  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.error('Error setting up audio mode:', error);
      }
    };

    setupAudio();

    if (!currentReciter) {
      setCurrentReciter(defaultReciter);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const playSurah = async (surah: Surah) => {
    try {
      setIsLoading(true);
      
      // If a sound is already loaded
      if (sound) {
        // If it's the same surah, just toggle play/pause
        if (currentSurah?.number_of_surah === surah.number_of_surah) {
          if (isPlaying) {
            await pauseSurah();
          } else {
            await resumeSurah();
          }
          setIsLoading(false);
          return;
        }
        
        // If it's a different surah, unload the current one
        await sound.unloadAsync();
      }

      // Ensure server URL is HTTPS
      let reciterServer = currentReciter?.Server || API_ENDPOINTS.DEFAULT_RECITER_SERVER;
      if (reciterServer.startsWith('http://')) {
        reciterServer = reciterServer.replace('http://', 'https://');
      }
      
      const audioUrl = quranService.getAudioUrl(reciterServer, surah.number_of_surah);

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
      setCurrentSurah(surah);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing surah:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const pauseSurah = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  const resumeSurah = async () => {
    if (sound) {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  const stopSurah = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
      setPosition(0);
    }
  };

  const changeReciter = async (reciter: Reciter) => {
    // Ensure HTTPS
    const secureReciter = { ...reciter };
    if (secureReciter.Server.startsWith('http://')) {
      secureReciter.Server = secureReciter.Server.replace('http://', 'https://');
    }
    
    setCurrentReciter(secureReciter);
    
    // If playing, restart with new reciter
    if (isPlaying && currentSurah) {
      await stopSurah();
      // Small delay to ensure cleanup
      setTimeout(() => {
        playSurah(currentSurah);
      }, 100);
    }
  };

  const seekTo = async (pos: number) => {
    if (sound) {
      await sound.setPositionAsync(pos);
      setPosition(pos);
    }
  };

  const seekForward = async () => {
    if (sound) {
      const newPosition = position + 5000;
      // Ensure we don't seek past the end
      const finalPosition = newPosition > duration ? duration : newPosition;
      await seekTo(finalPosition);
    }
  };

  const seekBackward = async () => {
    if (sound) {
      const newPosition = position - 5000;
      // Ensure we don't seek before the beginning
      const finalPosition = newPosition < 0 ? 0 : newPosition;
      await seekTo(finalPosition);
    }
  };

  const playNextSurah = async () => {
    if (!currentSurah) return;
    
    const nextSurahNumber = currentSurah.number_of_surah + 1;
    if (nextSurahNumber > 114) return; // Last surah
    
    try {
      const { surah: nextSurah } = await quranService.getSurahWithVerses(nextSurahNumber);
      await playSurah(nextSurah);
    } catch (error) {
      console.error('Error playing next surah:', error);
    }
  };

  const playPreviousSurah = async () => {
    if (!currentSurah) return;
    
    const previousSurahNumber = currentSurah.number_of_surah - 1;
    if (previousSurahNumber < 1) return; // First surah
    
    try {
      const { surah: previousSurah } = await quranService.getSurahWithVerses(previousSurahNumber);
      await playSurah(previousSurah);
    } catch (error) {
      console.error('Error playing previous surah:', error);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis || 0);
      setPosition(status.positionMillis || 0);
      setIsPlaying(status.isPlaying);
      
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
      }
    }
  };

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        currentSurah,
        currentReciter,
        sound,
        duration,
        position,
        isLoading,
        playSurah,
        pauseSurah,
        resumeSurah,
        stopSurah,
        changeReciter,
        seekTo,
        playNextSurah,
        playPreviousSurah,
        seekForward,
        seekBackward,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
