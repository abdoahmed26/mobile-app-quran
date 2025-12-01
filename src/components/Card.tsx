import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING } from '../constants';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  isDarkMode?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, style, isDarkMode = false }) => {
  return (
    <View
      style={[
        styles.card,
        isDarkMode && styles.cardDark,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardDark: {
    backgroundColor: COLORS.darkCard,
  },
});
