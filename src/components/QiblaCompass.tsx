/**
 * QiblaCompass Component
 * 
 * Visual compass component that displays the Qibla direction
 * with animated rotation based on device heading
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import Svg, { Circle, Line, Text as SvgText, Path, G } from 'react-native-svg';

interface QiblaCompassProps {
  // Qibla direction in degrees (0-360)
  qiblaDirection: number;
  // Current device heading in degrees (0-360)
  heading: number;
  // Compass size
  size?: number;
  // Whether to use dark mode colors
  isDarkMode?: boolean;
}

const { width } = Dimensions.get('window');
const DEFAULT_SIZE = Math.min(width * 0.8, 350);

export const QiblaCompass: React.FC<QiblaCompassProps> = ({
  qiblaDirection,
  heading,
  size = DEFAULT_SIZE,
  isDarkMode = false,
}) => {
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const qiblaRotationAnim = useRef(new Animated.Value(0)).current;

  // Animate compass rotation based on heading
  useEffect(() => {
    Animated.spring(rotationAnim, {
      toValue: -heading,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  }, [heading]);

  // Animate Qibla needle rotation
  useEffect(() => {
    Animated.spring(qiblaRotationAnim, {
      toValue: qiblaDirection,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  }, [qiblaDirection]);

  const center = size / 2;
  const radius = size / 2 - 20;
  const innerRadius = radius - 30;

  // Colors
  const compassColor = isDarkMode ? '#ffffff' : '#1a1a1a';
  const compassColorLight = isDarkMode ? '#ffffff80' : '#1a1a1a80';
  const qiblaColor = '#2ecc71';
  const backgroundColor = isDarkMode ? '#1a1a1a' : '#f5f5f5';
  const cardinalColor = '#e74c3c';

  // Create degree markings
  const degreeMarks = [];
  for (let i = 0; i < 360; i += 10) {
    const angle = (i - 90) * (Math.PI / 180);
    const isMainMark = i % 30 === 0;
    const markLength = isMainMark ? 15 : 8;
    const markWidth = isMainMark ? 2 : 1;
    
    const x1 = center + (radius - markLength) * Math.cos(angle);
    const y1 = center + (radius - markLength) * Math.sin(angle);
    const x2 = center + radius * Math.cos(angle);
    const y2 = center + radius * Math.sin(angle);

    degreeMarks.push(
      <Line
        key={`mark-${i}`}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={compassColorLight}
        strokeWidth={markWidth}
      />
    );
  }

  // Cardinal directions
  const cardinals = [
    { label: 'N', angle: 0, arabic: 'ش' },
    { label: 'E', angle: 90, arabic: 'ر' },
    { label: 'S', angle: 180, arabic: 'ج' },
    { label: 'W', angle: 270, arabic: 'غ' },
  ];

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View
        style={{
          transform: [{ rotate: rotationAnim.interpolate({
            inputRange: [0, 360],
            outputRange: ['0deg', '360deg'],
          }) }],
        }}
      >
        <Svg width={size} height={size}>
          {/* Outer circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke={compassColor}
            strokeWidth={3}
          />

          {/* Inner circle */}
          <Circle
            cx={center}
            cy={center}
            r={innerRadius}
            fill="transparent"
            stroke={compassColorLight}
            strokeWidth={1}
          />

          {/* Degree markings */}
          {degreeMarks}

          {/* Cardinal directions */}
          {cardinals.map(({ label, angle, arabic }) => {
            const rad = (angle - 90) * (Math.PI / 180);
            const x = center + (radius - 35) * Math.cos(rad);
            const y = center + (radius - 35) * Math.sin(rad);

            return (
              <G key={label}>
                <SvgText
                  x={x}
                  y={y + 5}
                  fontSize={angle === 0 ? 24 : 18}
                  fontWeight={angle === 0 ? 'bold' : 'normal'}
                  fill={angle === 0 ? cardinalColor : compassColor}
                  textAnchor="middle"
                >
                  {arabic}
                </SvgText>
              </G>
            );
          })}

          {/* Center dot */}
          <Circle
            cx={center}
            cy={center}
            r={6}
            fill={compassColor}
          />
        </Svg>
      </Animated.View>

      {/* Qibla needle (stays fixed relative to screen, rotates to point to Qibla) */}
      <Animated.View
        style={[
          styles.needleContainer,
          {
            transform: [
              { rotate: qiblaRotationAnim.interpolate({
                inputRange: [0, 360],
                outputRange: ['0deg', '360deg'],
              }) }
            ],
          },
        ]}
      >
        <Svg width={size} height={size} style={styles.needle}>
          {/* Qibla direction needle */}
          <Path
            d={`M ${center} ${center - innerRadius + 20} L ${center - 8} ${center} L ${center + 8} ${center} Z`}
            fill={qiblaColor}
            stroke={qiblaColor}
            strokeWidth={2}
          />
          
          {/* Kaaba icon at the tip */}
          <G>
            <Circle
              cx={center}
              cy={center - innerRadius + 10}
              r={12}
              fill={qiblaColor}
            />
            <SvgText
              x={center}
              y={center - innerRadius + 15}
              fontSize={14}
              fontWeight="bold"
              fill="#ffffff"
              textAnchor="middle"
            >
              🕋
            </SvgText>
          </G>
        </Svg>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  needleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  needle: {
    position: 'absolute',
  },
});
