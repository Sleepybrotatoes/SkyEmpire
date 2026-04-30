import React from 'react';
import { StyleProp, Text, TextStyle } from 'react-native';
import { formatCurrency } from '../utils/formatting';

interface AnimatedNumberProps {
  value: number;
  style?: StyleProp<TextStyle>;
}

export function AnimatedNumber({ value, style }: AnimatedNumberProps) {
  return <Text style={style}>{formatCurrency(value)}</Text>;
}
