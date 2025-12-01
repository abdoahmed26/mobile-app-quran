import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING } from '../constants';

interface LoadingSkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  isDarkMode?: boolean;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
  isDarkMode = false,
}) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        isDarkMode && styles.skeletonDark,
        {
          width,
          height,
          borderRadius,
          opacity,
        } as any,
        style,
      ]}
    />
  );
};

interface SkeletonCardProps {
  isDarkMode?: boolean;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ isDarkMode }) => {
  return (
    <View style={[styles.card, isDarkMode && styles.cardDark]}>
      <View style={styles.row}>
        <LoadingSkeleton width={50} height={50} borderRadius={25} isDarkMode={isDarkMode} />
        <View style={styles.content}>
          <LoadingSkeleton width="80%" height={20} isDarkMode={isDarkMode} />
          <LoadingSkeleton width="60%" height={16} style={{ marginTop: 8 }} isDarkMode={isDarkMode} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: COLORS.border,
  },
  skeletonDark: {
    backgroundColor: COLORS.darkCardLight,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: COLORS.shadows.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardDark: {
    backgroundColor: COLORS.darkCard,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: SPACING.md,
  },
});
