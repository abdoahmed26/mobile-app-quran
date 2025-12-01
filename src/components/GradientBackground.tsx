import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants';

interface GradientBackgroundProps {
  colors?: string[];
  style?: ViewStyle;
  children?: React.ReactNode;
  isDarkMode?: boolean;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  colors,
  style,
  children,
  isDarkMode = false,
}) => {
  const defaultColors = isDarkMode 
    ? [...COLORS.gradients.darkVertical]
    : [...COLORS.gradients.primaryVertical];

  const gradientColors = colors || defaultColors;

  return (
    <LinearGradient
      colors={gradientColors as any}
      style={[styles.gradient, style]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});
