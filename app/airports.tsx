import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ScrollView } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useGameStore } from '../src/store/useGameStore';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { formatCurrency } from '../src/utils/formatting';

const filters: Array<'All' | 'Owned' | 'Available'> = ['All', 'Owned', 'Available'];

export default function AirportsScreen() {
  const airports = useGameStore((state) => state.airports);
  const countries = useGameStore((state) => state.countries);
  const airportFilter = useGameStore((state) => state.airportFilter);
  const countryFilter = useGameStore((state) => state.countryFilter);
  const setAirportFilter = useGameStore((state) => state.setAirportFilter);
  const setCountryFilter = useGameStore((state) => state.setCountryFilter);
  const buyAirportSlot = useGameStore((state) => state.buyAirportSlot);
  const [selectedAirport, setSelectedAirport] = useState<string | null>(null);
  const bottomSheetRef = React.useRef<BottomSheetModal>(null);

  const unlockedCountries = countries.filter((country) => country.status !== 'LOCKED');

  const filteredAirports = useMemo(() => {
    return airports.filter((airport) => {
      if (airportFilter === 'Owned' && airport.status !== 'OWNED') return false;
      if (airportFilter === 'Available' && airport.status !== 'AVAILABLE') return false;
      if (countryFilter && airport.country !== countryFilter) return false;
      return true;
    });
  }, [airports, airportFilter, countryFilter]);

  const selectedAirportData = airports.find((airport) => airport.id === selectedAirport);

  const openSheet = (airportId: string) => {
    setSelectedAirport(airportId);
    bottomSheetRef.current?.present();
  };

  const handlePurchase = () => {
    if (!selectedAirportData) return;
    buyAirportSlot(selectedAirportData.id);
    bottomSheetRef.current?.dismiss();
  };

  const renderAirport = ({ item }: { item: typeof airports[number] }) => (
    <Pressable style={styles.card} onPress={() => openSheet(item.id)}>
      <View style={styles.topRow}>
        <Text style={styles.code}>{item.iata}</Text>
        <Text style={[styles.statusBadge, item.status === 'OWNED' ? styles.ownedBadge : item.status === 'AVAILABLE' ? styles.availableBadge : styles.lockedBadge]}>
          {item.status}
        </Text>
      </View>
      <Text style={styles.city}>{item.city} · {item.flag}</Text>
      <Text style={styles.detail}>Tier {item.tier}</Text>
      <Text style={styles.detail}>Monthly slot cost {formatCurrency(item.monthlyCost)}</Text>
    </Pressable>
  );

  return (
    <View style={styles.page}>
      <View style={styles.filterBar}>
        {filters.map((option) => (
          <Pressable key={option} style={[styles.filterPill, airportFilter === option && styles.filterPillActive]} onPress={() => setAirportFilter(option)}>
            <Text style={[styles.filterText, airportFilter === option && styles.filterTextActive]}>{option}</Text>
          </Pressable>
        ))}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.countryScroll} contentContainerStyle={styles.countryContent}>
        <Pressable style={[styles.countryPill, !countryFilter && styles.countryPillActive]} onPress={() => setCountryFilter(null)}>
          <Text style={[styles.countryText, !countryFilter && styles.countryTextActive]}>All</Text>
        </Pressable>
        {unlockedCountries.map((country) => (
          <Pressable
            key={country.id}
            style={[styles.countryPill, countryFilter === country.name && styles.countryPillActive]}
            onPress={() => setCountryFilter(country.name)}
          >
            <Text style={[styles.countryText, countryFilter === country.name && styles.countryTextActive]}>{country.emoji} {country.name}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <FlatList
        data={filteredAirports}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={renderAirport}
        ListEmptyComponent={<Text style={styles.emptyText}>No airports match this filter.</Text>}
      />

      <BottomSheetModal ref={bottomSheetRef} index={0} snapPoints={['42%']} enablePanDownToClose>
        <View style={styles.sheetContent}>
          <View style={styles.sheetHandle} />
          {selectedAirportData ? (
            <>
              <Text style={styles.sheetTitle}>{selectedAirportData.iata} · {selectedAirportData.city}</Text>
              <Text style={styles.sheetSubtitle}>{selectedAirportData.flag} {selectedAirportData.country}</Text>
              <Text style={styles.sheetLabel}>Tier</Text>
              <Text style={styles.sheetValue}>{selectedAirportData.tier}</Text>
              <Text style={styles.sheetLabel}>Monthly slot cost</Text>
              <Text style={styles.sheetValue}>{formatCurrency(selectedAirportData.monthlyCost)}</Text>
              <Text style={styles.sheetLabel}>Status</Text>
              <Text style={styles.sheetValue}>{selectedAirportData.status}</Text>
              {selectedAirportData.status === 'AVAILABLE' ? (
                <PrimaryButton label={`Purchase Slot — ${formatCurrency(selectedAirportData.monthlyCost)}`} onPress={handlePurchase} />
              ) : (
                <Text style={styles.sheetNote}>Owned airports show route performance in the next update.</Text>
              )}
            </>
          ) : null}
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
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  filterPill: {
    borderRadius: 16,
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  filterPillActive: {
    backgroundColor: '#3B82F6',
  },
  filterText: {
    color: '#CAD5E0',
    fontWeight: '700',
  },
  filterTextActive: {
    color: '#F8FAFC',
  },
  countryScroll: {
    maxHeight: 48,
    marginBottom: 12,
  },
  countryContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  countryPill: {
    backgroundColor: '#111827',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
  },
  countryPillActive: {
    backgroundColor: '#3B82F6',
  },
  countryText: {
    color: '#CAD5E0',
    fontWeight: '600',
  },
  countryTextActive: {
    color: '#F8FAFC',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 20,
    marginBottom: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  code: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '800',
  },
  city: {
    color: '#E5E7EB',
    marginBottom: 8,
  },
  detail: {
    color: '#94A3B8',
    marginBottom: 4,
  },
  statusBadge: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontWeight: '700',
    fontSize: 12,
  },
  ownedBadge: {
    backgroundColor: '#064E3B',
    color: '#A7F3D0',
  },
  availableBadge: {
    backgroundColor: '#1E40AF',
    color: '#BFDBFE',
  },
  lockedBadge: {
    backgroundColor: '#581C87',
    color: '#EDE9FE',
  },
  emptyText: {
    color: '#64748B',
    textAlign: 'center',
    marginTop: 48,
  },
  sheetContent: {
    backgroundColor: '#0A0F1E',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  sheetHandle: {
    width: 60,
    height: 4,
    backgroundColor: '#334155',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 18,
  },
  sheetTitle: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  sheetSubtitle: {
    color: '#94A3B8',
    marginBottom: 18,
  },
  sheetLabel: {
    color: '#9CA3AF',
    marginTop: 12,
    marginBottom: 6,
    fontSize: 13,
    textTransform: 'uppercase',
  },
  sheetValue: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  sheetNote: {
    color: '#94A3B8',
    marginTop: 18,
  },
});
