import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useGameStore } from '../src/store/useGameStore';
import { AnimatedNumber } from '../src/components/AnimatedNumber';
import { MetricCard } from '../src/components/MetricCard';
import { formatCurrency } from '../src/utils/formatting';

export default function DashboardScreen() {
  const router = useRouter();
  const cash = useGameStore((state) => state.cash);
  const routes = useGameStore((state) => state.routes);
  const aircraft = useGameStore((state) => state.aircraft);
  const airports = useGameStore((state) => state.airports);
  const feed = useGameStore((state) => state.feed);
  const advanceGameTick = useGameStore((state) => state.advanceGameTick);
  const [refreshing, setRefreshing] = useState(false);

  const dailyRevenue = useMemo(() => {
    return routes
      .filter((route) => route.status === 'ACTIVE')
      .reduce((sum, route) => sum + route.revenuePerFlight * (86400 / route.cycleSeconds) * 0.18, 0);
  }, [routes]);

  const dailyCosts = useMemo(() => {
    const maintenance = aircraft.reduce((sum, plane) => sum + plane.maintenance / 30, 0);
    const slotCost = airports.filter((airport) => airport.status === 'OWNED').reduce((sum, airport) => sum + airport.monthlyCost, 0);
    return maintenance + slotCost;
  }, [aircraft, airports]);

  const netProfit = dailyRevenue - dailyCosts;
  const fleetUtilisation = aircraft.length === 0 ? 0 : routes.filter((route) => route.status === 'ACTIVE').length / aircraft.length;

  const onRefresh = async () => {
    setRefreshing(true);
    advanceGameTick();
    await Haptics.selectionAsync();
    setRefreshing(false);
  };

  const handleAction = async (path: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(path);
  };

  return (
    <View style={styles.page}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />}
      >
        <View style={styles.headerCard}>
          <View>
            <Text style={styles.airlineName}>SkyEmpire Airways</Text>
            <View style={styles.pillRow}>
              <Text style={styles.prestigeBadge}>Regional Operator ✦ Level 1</Text>
            </View>
          </View>
          <Text style={styles.balanceLabel}>Cash Balance</Text>
          <AnimatedNumber value={cash} style={styles.balanceValue} />
          <Text style={styles.balanceSubtext}>Live simulation running in real time.</Text>
        </View>

        <View style={styles.metricGrid}>
          <MetricCard label="Daily Revenue" value={dailyRevenue} currency />
          <MetricCard label="Daily Costs" value={dailyCosts} currency />
          <MetricCard label="Net Profit" value={netProfit} currency />
          <MetricCard label="Fleet Utilisation" value={fleetUtilisation} suffix="" />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Live Feed</Text>
          <Pressable style={styles.refreshButton} onPress={onRefresh}>
            <Ionicons name="refresh" size={18} color="#F8FAFC" />
            <Text style={styles.refreshText}>Tick</Text>
          </Pressable>
        </View>

        {feed.length === 0 ? (
          <Text style={styles.emptyText}>No events yet. Build your first route.</Text>
        ) : (
          feed.map((entry) => (
            <View key={entry.id} style={styles.feedCard}>
              <Text style={styles.feedText}>{entry.message}</Text>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.ctaBar}>
        <Pressable style={styles.ctaButton} onPress={() => handleAction('/fleet')}>
          <Ionicons name="airplane" size={20} color="#F8FAFC" />
          <Text style={styles.ctaLabel}>Buy Plane</Text>
        </Pressable>
        <Pressable style={styles.ctaButton} onPress={() => handleAction('/routes')}>
          <Ionicons name="rocket" size={20} color="#F8FAFC" />
          <Text style={styles.ctaLabel}>New Route</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#0A0F1E',
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  headerCard: {
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },
  airlineName: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  pillRow: {
    marginBottom: 12,
  },
  prestigeBadge: {
    color: '#60A5FA',
    backgroundColor: '#111827',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  balanceLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 12,
  },
  balanceValue: {
    color: '#F8FAFC',
    fontSize: 36,
    fontWeight: '800',
    marginTop: 4,
  },
  balanceSubtext: {
    color: '#9CA3AF',
    marginTop: 8,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  refreshText: {
    color: '#F8FAFC',
    marginLeft: 8,
    fontWeight: '600',
  },
  feedCard: {
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  feedText: {
    color: '#E5E7EB',
    lineHeight: 22,
  },
  emptyText: {
    color: '#6B7280',
    fontStyle: 'italic',
  },
  ctaBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  ctaButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 6,
    backgroundColor: '#1F2937',
    borderRadius: 16,
  },
  ctaLabel: {
    color: '#F8FAFC',
    fontWeight: '700',
    marginLeft: 8,
  },
});
