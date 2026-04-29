import React, { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { RectButton, Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useGameStore } from '../src/store/useGameStore';
import { RouteProgressBar } from '../src/components/RouteProgressBar';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { formatCurrency } from '../src/utils/formatting';
import { calculateDistanceKm, canOperateRoute, estimateRevenue } from '../src/utils/economy';

const sheetSnapPoints = ['55%'];

export default function RoutesScreen() {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const routes = useGameStore((state) => state.routes);
  const airports = useGameStore((state) => state.airports);
  const aircraft = useGameStore((state) => state.aircraft);
  const cancelRoute = useGameStore((state) => state.cancelRoute);
  const createRoute = useGameStore((state) => state.createRoute);

  const activeRoutes = routes.filter((route) => route.status === 'ACTIVE');
  const totalRouteRevenue = useMemo(
    () => activeRoutes.reduce((sum, route) => sum + route.revenuePerFlight, 0),
    [activeRoutes]
  );

  const ownedAirports = airports.filter((airport) => airport.status === 'OWNED');
  const routeAirports = airports.filter((airport) => airport.status !== 'LOCKED');
  const idlePlanes = aircraft.filter((plane) => plane.status === 'IDLE');

  const [departure, setDeparture] = useState(ownedAirports[0]?.iata ?? 'NZAA');
  const [arrival, setArrival] = useState(routeAirports.find((airport) => airport.iata !== (ownedAirports[0]?.iata ?? 'NZAA'))?.iata ?? 'YSSY');
  const [selectedAircraft, setSelectedAircraft] = useState(idlePlanes[0]?.id ?? '');
  const [stage, setStage] = useState(1);

  const selectedDepartureAirport = airports.find((airport) => airport.iata === departure);
  const selectedArrivalAirport = airports.find((airport) => airport.iata === arrival);
  const selectedPlane = aircraft.find((plane) => plane.id === selectedAircraft);
  const routeDistance = selectedDepartureAirport && selectedArrivalAirport ? calculateDistanceKm(selectedDepartureAirport, selectedArrivalAirport) : 0;
  const projectedRevenue = selectedDepartureAirport && selectedArrivalAirport && selectedPlane
    ? estimateRevenue(selectedDepartureAirport, selectedArrivalAirport, selectedPlane)
    : 0;
  const canLaunch = selectedPlane && selectedDepartureAirport && selectedArrivalAirport && canOperateRoute(selectedPlane, routeDistance) && departure !== arrival;

  const openSheet = () => {
    setStage(1);
    bottomSheetRef.current?.present();
  };

  const handleLaunch = async () => {
    if (!selectedAircraft || !departure || !arrival || !canLaunch) return;
    createRoute(departure, arrival, selectedAircraft);
    bottomSheetRef.current?.dismiss();
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const renderRoute = ({ item }: { item: typeof routes[number] }) => {
    const assignedPlane = aircraft.find((plane) => plane.id === item.aircraftId);
    return (
      <Swipeable
        renderRightActions={() => (
          <RectButton style={styles.cancelButton} onPress={() => cancelRoute(item.id)}>
            <Ionicons name="trash" size={24} color="#F8FAFC" />
            <Text style={styles.cancelText}>Cancel</Text>
          </RectButton>
        )}
      >
        <View style={styles.routeCard}>
          <View style={styles.routeHeader}>
            <View>
              <Text style={styles.routeAirports}>{item.departure} → {item.arrival}</Text>
              <Text style={styles.routeMeta}>{assignedPlane?.name ?? 'Unknown aircraft'}</Text>
            </View>
            <Text style={styles.routeProfit}>{formatCurrency(item.revenuePerFlight)}</Text>
          </View>
          <RouteProgressBar progress={item.progress} />
          <View style={styles.routeFooter}>
            <Text style={styles.routeDetail}>Load factor {Math.round(item.loadFactor * 100)}%</Text>
            <Text style={styles.routeDetail}>{item.flightsCompleted} flights completed</Text>
          </View>
        </View>
      </Swipeable>
    );
  };

  return (
    <View style={styles.page}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Routes</Text>
        <Text style={styles.summaryDetail}>{activeRoutes.length} active routes</Text>
        <Text style={styles.summaryValue}>{formatCurrency(totalRouteRevenue)} / cycle</Text>
      </View>

      <FlatList
        data={activeRoutes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>No active routes yet. Launch one to start earning.</Text>}
        renderItem={renderRoute}
      />

      <Pressable style={styles.fab} onPress={openSheet}>
        <Ionicons name="add" size={28} color="#F8FAFC" />
      </Pressable>

      <BottomSheetModal ref={bottomSheetRef} index={0} snapPoints={sheetSnapPoints} enablePanDownToClose>
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Create Route</Text>
          <View style={styles.stepPills}>
            {[1, 2, 3].map((value) => (
              <View key={value} style={[styles.stepPill, stage === value && styles.stepPillActive]}>
                <Text style={[styles.stepLabel, stage === value && styles.stepLabelActive]}>Step {value}</Text>
              </View>
            ))}
          </View>
          {stage === 1 && (
            <View>
              <Text style={styles.sheetSection}>Departure</Text>
              {ownedAirports.map((airport) => (
                <Pressable key={airport.id} style={[styles.optionRow, departure === airport.iata && styles.optionRowActive]} onPress={() => setDeparture(airport.iata)}>
                  <Text style={styles.optionTitle}>{airport.iata} · {airport.city}</Text>
                  <Text style={styles.optionSubtitle}>{airport.flag} {airport.country}</Text>
                </Pressable>
              ))}
              <PrimaryButton label="Next: Arrival" onPress={() => setStage(2)} />
            </View>
          )}
          {stage === 2 && (
            <View>
              <Text style={styles.sheetSection}>Arrival</Text>
              {routeAirports.filter((airport) => airport.iata !== departure).map((airport) => (
                <Pressable key={airport.id} style={[styles.optionRow, arrival === airport.iata && styles.optionRowActive]} onPress={() => setArrival(airport.iata)}>
                  <Text style={styles.optionTitle}>{airport.iata} · {airport.city}</Text>
                  <Text style={styles.optionSubtitle}>{airport.flag} {airport.country}</Text>
                </Pressable>
              ))}
              <PrimaryButton label="Next: Aircraft" onPress={() => setStage(3)} />
            </View>
          )}
          {stage === 3 && (
            <View>
              <Text style={styles.sheetSection}>Aircraft</Text>
              {idlePlanes.length === 0 ? (
                <Text style={styles.emptyText}>No idle aircraft available. Buy or assign one first.</Text>
              ) : idlePlanes.map((plane) => {
                const valid = routeDistance ? canOperateRoute(plane, routeDistance) : true;
                return (
                  <Pressable
                    key={plane.id}
                    style={[styles.optionRow, selectedAircraft === plane.id && styles.optionRowActive, !valid && styles.optionRowDisabled]}
                    onPress={() => valid && setSelectedAircraft(plane.id)}
                  >
                    <Text style={styles.optionTitle}>{plane.tail} · {plane.name}</Text>
                    <Text style={styles.optionSubtitle}>Seats {plane.seats} · Range {plane.range}km</Text>
                    <Text style={[styles.optionSubtitle, !valid && styles.unavailableText]}>
                      {valid ? `Good for ${routeDistance}km` : `Too short for ${routeDistance}km`}
                    </Text>
                  </Pressable>
                );
              })}
              <View style={styles.summaryBlock}>
                <Text style={styles.summaryLabel}>Route distance</Text>
                <Text style={styles.summaryValue}>{routeDistance} km</Text>
              </View>
              <View style={styles.summaryBlock}>
                <Text style={styles.summaryLabel}>Projected revenue</Text>
                <Text style={styles.summaryValue}>{formatCurrency(projectedRevenue)}</Text>
              </View>
              <PrimaryButton label={canLaunch ? 'Launch Route' : 'Choose a valid aircraft'} onPress={handleLaunch} disabled={!canLaunch} />
            </View>
          )}
        </View>
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#0A0F1E',
    paddingTop: 20,
  },
  summaryCard: {
    backgroundColor: '#111827',
    margin: 16,
    borderRadius: 24,
    padding: 20,
  },
  summaryTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  summaryDetail: {
    color: '#94A3B8',
    marginBottom: 12,
  },
  summaryValue: {
    color: '#3B82F6',
    fontSize: 22,
    fontWeight: '800',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  routeCard: {
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  routeAirports: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '700',
  },
  routeMeta: {
    color: '#9CA3AF',
    marginTop: 4,
  },
  routeProfit: {
    color: '#34D399',
    fontWeight: '700',
  },
  routeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  routeDetail: {
    color: '#D1D5DB',
  },
  emptyText: {
    color: '#64748B',
    marginHorizontal: 16,
    marginTop: 32,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  cancelButton: {
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    borderRadius: 24,
    marginVertical: 8,
  },
  cancelText: {
    color: '#F8FAFC',
    marginVertical: 10,
    fontWeight: '700',
  },
  sheetContent: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0A0F1E',
  },
  sheetTitle: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 14,
  },
  stepPills: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  stepPill: {
    backgroundColor: '#111827',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 10,
  },
  stepPillActive: {
    backgroundColor: '#3B82F6',
  },
  stepLabel: {
    color: '#94A3B8',
    fontWeight: '700',
  },
  stepLabelActive: {
    color: '#F8FAFC',
  },
  sheetSection: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  optionRow: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  optionRowActive: {
    borderColor: '#3B82F6',
    borderWidth: 1,
  },
  optionRowDisabled: {
    opacity: 0.5,
  },
  optionTitle: {
    color: '#F8FAFC',
    fontWeight: '700',
    marginBottom: 4,
  },
  optionSubtitle: {
    color: '#94A3B8',
  },
  unavailableText: {
    color: '#EF4444',
  },
  summaryBlock: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  summaryLabel: {
    color: '#9CA3AF',
    marginBottom: 6,
    fontSize: 13,
    textTransform: 'uppercase',
  },
  summaryValue: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
});
