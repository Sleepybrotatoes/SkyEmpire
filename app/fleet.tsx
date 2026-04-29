import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useGameStore } from '../src/store/useGameStore';
import { aircraftCatalog } from '../src/data/aircraft';
import { formatCurrency } from '../src/utils/formatting';
import { PrimaryButton } from '../src/components/PrimaryButton';

const categories = ['All', 'Turboprop', 'Narrow-body', 'Wide-body', 'Ultra Long Haul'] as const;

export default function FleetScreen() {
  const activeTab = useGameStore((state) => state.activeFleetTab);
  const selectedCategory = useGameStore((state) => state.selectedCategory);
  const aircraft = useGameStore((state) => state.aircraft);
  const buyAircraft = useGameStore((state) => state.buyAircraft);
  const toggleFleetTab = useGameStore((state) => state.toggleFleetTab);
  const selectCategory = useGameStore((state) => state.selectCategory);

  const availablePlanes = aircraftCatalog.filter((item) => selectedCategory === 'All' || item.category === selectedCategory);

  const handleBuy = async (name: string) => {
    buyAircraft(name);
    await Haptics.selectionAsync();
  };

  return (
    <View style={styles.page}>
      <View style={styles.toggleRow}>
        {['Buy', 'My Fleet'].map((tab) => (
          <Pressable
            key={tab}
            style={[styles.toggleButton, activeTab === tab ? styles.toggleButtonActive : null]}
            onPress={() => toggleFleetTab(tab as 'Buy' | 'My Fleet')}
          >
            <Text style={[styles.toggleText, activeTab === tab ? styles.toggleTextActive : null]}>{tab}</Text>
          </Pressable>
        ))}
      </View>

      {activeTab === 'Buy' ? (
        <View style={styles.filterRow}> 
          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => selectCategory(item)}
                style={[styles.filterPill, selectedCategory === item && styles.filterPillActive]}
              >
                <Text style={[styles.filterLabel, selectedCategory === item && styles.filterLabelActive]}>{item}</Text>
              </Pressable>
            )}
          />
        </View>
      ) : null}

      {activeTab === 'Buy' ? (
        <FlatList
          data={availablePlanes}
          keyExtractor={(item) => item.name}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.aircraftName}>{item.name}</Text>
                <Text style={styles.aircraftCategory}>{item.category}</Text>
              </View>
              <Text style={styles.aircraftDetail}>Price: {formatCurrency(item.price)}</Text>
              <Text style={styles.aircraftDetail}>Maintenance: {formatCurrency(item.maintenance)}/mo</Text>
              <Text style={styles.aircraftDetail}>Seats: {item.seats} · Range: {item.range}km</Text>
              <Text style={styles.aircraftDetail}>Compatible: {item.compatible.join(', ')}</Text>
              <PrimaryButton label={`Buy — ${formatCurrency(item.price)}`} onPress={() => handleBuy(item.name)} />
            </View>
          )}
        />
      ) : (
        <FlatList
          data={aircraft}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.aircraftName}>{item.tail}</Text>
                <Text style={styles.aircraftCategory}>{item.status}</Text>
              </View>
              <Text style={styles.aircraftDetail}>{item.name}</Text>
              <Text style={styles.aircraftDetail}>Range: {item.range}km · Seats: {item.seats}</Text>
              <Text style={styles.aircraftDetail}>Maintenance: {formatCurrency(item.maintenance)}/mo</Text>
              {item.status === 'IDLE' ? (
                <View style={styles.idleTag}>
                  <Ionicons name="ellipse" size={10} color="#F59E0B" />
                  <Text style={styles.idleText}>Idle — assign to route</Text>
                </View>
              ) : (
                <View style={styles.activeTag}>
                  <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                  <Text style={styles.activeText}>Active on route</Text>
                </View>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#0A0F1E',
    paddingTop: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 18,
    paddingVertical: 14,
    marginHorizontal: 6,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#3B82F6',
  },
  toggleText: {
    color: '#E5E7EB',
    fontWeight: '700',
  },
  toggleTextActive: {
    color: '#F8FAFC',
  },
  filterRow: {
    paddingLeft: 16,
    marginBottom: 12,
  },
  filterPill: {
    backgroundColor: '#111827',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
  },
  filterPillActive: {
    backgroundColor: '#3B82F6',
  },
  filterLabel: {
    color: '#94A3B8',
  },
  filterLabelActive: {
    color: '#F8FAFC',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  aircraftName: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
  },
  aircraftCategory: {
    color: '#60A5FA',
    fontWeight: '700',
  },
  aircraftDetail: {
    color: '#D1D5DB',
    marginVertical: 4,
  },
  idleTag: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  idleText: {
    color: '#FBBF24',
    fontWeight: '600',
    marginLeft: 8,
  },
  activeTag: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeText: {
    color: '#34D399',
    fontWeight: '600',
    marginLeft: 8,
  },
  activeText: {
    color: '#34D399',
    fontWeight: '600',
  },
});
