import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING } from '../constants';

interface AnimatedCardProps {
  children: React.ReactNode;
  isDarkMode?: boolean;
  style?: ViewStyle;
  delay?: number;
  onPress?: () => void;
  useGradient?: boolean;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  isDarkMode = false,
  style,
  delay = 0,
  onPress,
  useGradient = false,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const cardStyle = [
    styles.card,
    isDarkMode && styles.cardDark,
    style,
    {
      opacity: fadeAnim,
      transform: [
        { translateY: slideAnim },
        { scale: scaleAnim },
      ],
    },
  ];

  const gradientColors = isDarkMode 
    ? [...COLORS.gradients.cardDark]
    : [...COLORS.gradients.card];

  const content = (
    <Animated.View style={cardStyle}>
      {useGradient ? (
        <LinearGradient
          colors={gradientColors as any}
          style={styles.gradientContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {children}
        </LinearGradient>
      ) : (
        children
      )}
    </Animated.View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {content}
      </Pressable>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: COLORS.shadows.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  cardDark: {
    backgroundColor: COLORS.darkCard,
    shadowColor: COLORS.black,
    shadowOpacity: 0.4,
  },
  gradientContainer: {
    borderRadius: 16,
    padding: SPACING.md,
  },
});
