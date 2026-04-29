import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatCurrency, formatPercent } from '../utils/formatting';

interface MetricCardProps {
  label: string;
  value: number;
  suffix?: string;
  currency?: boolean;
}

export function MetricCard({ label, value, suffix, currency }: MetricCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>
        {currency ? formatCurrency(value) : `${formatPercent(value)}${suffix ?? ''}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 16,
    margin: 8,
    minWidth: 140,
  },
  label: {
    color: '#9CA3AF',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  value: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '700',
  },
});
