import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, SIZES } from '../../constants';

interface HomeFooterProps {
  isDarkMode: boolean;
}

export const HomeFooter: React.FC<HomeFooterProps> = ({ isDarkMode }) => {
  return (
    <View style={styles.footer}>
      <Text style={[styles.footerText, isDarkMode && styles.textMuted]}>
        شَرف بتصميمه عبدالرحمن احمد
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  footerText: {
    fontSize: SIZES.small,
    color: COLORS.textMuted,
    opacity: 0.6,
  },
  textMuted: {
    color: COLORS.textMuted,
  },
});


