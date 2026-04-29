import React, { useEffect } from 'react';
import Animated, { useAnimatedProps, useDerivedValue, useSharedValue, withSpring } from 'react-native-reanimated';
import { StyleProp, TextStyle } from 'react-native';
import { formatCurrency } from '../utils/formatting';

interface AnimatedNumberProps {
  value: number;
  style?: StyleProp<TextStyle>;
}

const AnimatedText = Animated.createAnimatedComponent(Animated.Text);

export function AnimatedNumber({ value, style }: AnimatedNumberProps) {
  const shared = useSharedValue(value);
  useEffect(() => {
    shared.value = withSpring(value, { damping: 16, stiffness: 140 });
  }, [value, shared]);

  const animatedText = useDerivedValue(() => formatCurrency(shared.value));

  const animatedProps = useAnimatedProps(() => ({
    text: animatedText.value,
  }));

  return <AnimatedText animatedProps={animatedProps} style={style} />;
}
