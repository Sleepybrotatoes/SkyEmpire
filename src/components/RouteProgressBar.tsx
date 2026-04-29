import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface RouteProgressBarProps {
  progress: number;
}

export function RouteProgressBar({ progress }: RouteProgressBarProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    width: `${Math.min(100, Math.max(0, progress * 100))}%`,
  }));

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fill, animatedStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    overflow: 'hidden',
    height: 10,
    marginTop: 10,
  },
  fill: {
    height: '100%',
    backgroundColor: '#3B82F6',
  },
});
