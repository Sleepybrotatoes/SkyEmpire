import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import Animated, { useAnimatedProps, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { Svg, Path, Circle, G, Text as SvgText } from 'react-native-svg';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { useGameStore } from '../src/store/useGameStore';
import { svgCountries } from '../src/data/map';
import { formatCurrency } from '../src/utils/formatting';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function MapScreen() {
  const router = useRouter();
  const countries = useGameStore((state) => state.countries);
  const airports = useGameStore((state) => state.airports);
  const unlockCountry = useGameStore((state) => state.unlockCountry);
  const setCountryFilter = useGameStore((state) => state.setCountryFilter);
  const [selectedCountryId, setSelectedCountryId] = useState<string>('NZ');
  const pulse = useSharedValue(1);
  const bottomSheetRef = React.useRef<BottomSheetModal>(null);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1.45, { duration: 1200 }), -1, true);
  }, [pulse]);

  const selected = countries.find((country) => country.id === selectedCountryId) ?? countries[0];
  const countryAirports = airports.filter((airport) => airport.country === selected?.name);
  const ownedAirportCount = countryAirports.filter((airport) => airport.status === 'OWNED').length;
  const availableAirportCount = countryAirports.filter((airport) => airport.status === 'AVAILABLE').length;
  const lockedAirportCount = countryAirports.filter((airport) => airport.status === 'LOCKED').length;
  const pulseProps = useAnimatedProps(() => ({
    r: 16 * pulse.value,
    opacity: 0.25 * (2 - pulse.value),
  }));

  const activeStatus = useMemo(() => {
    if (!selected) return 'LOCKED';
    if (selected.status === 'ACTIVE' || ownedAirportCount > 0) return 'ACTIVE';
    if (selected.status === 'UNLOCKED') return 'UNLOCKED';
    return 'LOCKED';
  }, [ownedAirportCount, selected]);

  const handleCountrySelect = (id: string) => {
    setSelectedCountryId(id);
    bottomSheetRef.current?.present();
  };

  const handleUnlock = () => {
    if (!selected) return;
    unlockCountry(selected.id);
    bottomSheetRef.current?.dismiss();
  };

  const openAirports = () => {
    setCountryFilter(selected.name);
    router.push('/airports');
    bottomSheetRef.current?.dismiss();
  };

  return (
    <View style={styles.page}>
      <Text style={styles.header}>Interactive Map</Text>
      <Text style={styles.subheader}>Tap a region to unlock countries and view airport details.</Text>
      <View style={styles.mapCard}>
        <Svg width="100%" height={320} viewBox="0 0 360 320">
          <Path d="M0 0 H360 V320 H0 Z" fill="#0A0F1E" />
          {svgCountries.map((shape) => {
            const country = countries.find((item) => item.id === shape.id);
            const fill = country?.status === 'ACTIVE' ? '#3B82F6' : country?.status === 'UNLOCKED' ? '#475569' : '#1C2333';
            const opacity = country?.status === 'LOCKED' ? 0.85 : 1;
            return (
              <G key={shape.id}>
                <Path
                  d={shape.path}
                  fill={fill}
                  opacity={opacity}
                  stroke="#111827"
                  strokeWidth={2}
                  onPress={() => handleCountrySelect(shape.id)}
                />
                {country?.status === 'ACTIVE' ? (
                  <AnimatedCircle cx={shape.pinX} cy={shape.pinY} fill="#3B82F6" animatedProps={pulseProps} />
                ) : null}
                <Circle cx={shape.pinX} cy={shape.pinY} r={16} fill="#0A172E" />
                <SvgText x={shape.pinX} y={shape.pinY + 5} fontSize="10" fill="#F8FAFC" textAnchor="middle">
                  {country?.emoji}
                </SvgText>
              </G>
            );
          })}
        </Svg>
      </View>

      <BottomSheetModal ref={bottomSheetRef} index={0} snapPoints={['45%']} enablePanDownToClose>
        <ScrollView style={styles.sheetContent}>
          <View style={styles.sheetLine} />
          <Text style={styles.sheetTitle}>{selected?.name}</Text>
          <Text style={styles.sheetSubtitle}>{selected?.emoji}</Text>
          <View style={styles.sheetStats}>
            <View style={styles.sheetStatBlock}>
              <Text style={styles.statLabel}>Unlock Cost</Text>
              <Text style={styles.statValue}>{selected?.unlockCost ? formatCurrency(selected.unlockCost) : 'Free'}</Text>
            </View>
            <View style={styles.sheetStatBlock}>
              <Text style={styles.statLabel}>Airports</Text>
              <Text style={styles.statValue}>{selected?.airports}</Text>
            </View>
            <View style={styles.sheetStatBlock}>
              <Text style={styles.statLabel}>Revenue</Text>
              <Text style={styles.statValue}>{selected?.projectedRevenue ? formatCurrency(selected.projectedRevenue) : '-'}</Text>
            </View>
          </View>
          <View style={styles.airportStats}>
            <Text style={styles.airportStat}>{availableAirportCount} available</Text>
            <Text style={styles.airportStat}>{lockedAirportCount} locked</Text>
            <Text style={styles.airportStat}>{ownedAirportCount} owned</Text>
          </View>
          <Text style={styles.statusTag}>Status: {activeStatus}</Text>
          {selected?.status === 'LOCKED' ? (
            <Pressable style={styles.unlockButton} onPress={handleUnlock}>
              <Text style={styles.unlockText}>Unlock Country — {formatCurrency(selected.unlockCost)}</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.unlockButton} onPress={openAirports}>
              <Text style={styles.unlockText}>View Airports</Text>
            </Pressable>
          )}
        </ScrollView>
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#0A0F1E',
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  header: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  subheader: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 20,
  },
  mapCard: {
    backgroundColor: '#111827',
    borderRadius: 28,
    padding: 14,
    overflow: 'hidden',
    marginBottom: 20,
  },
  sheetContent: {
    backgroundColor: '#0A0F1E',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  sheetLine: {
    width: 60,
    height: 4,
    backgroundColor: '#334155',
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 12,
  },
  sheetTitle: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  sheetSubtitle: {
    color: '#94A3B8',
    marginBottom: 18,
  },
  sheetStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  sheetStatBlock: {
    flex: 1,
    marginRight: 12,
  },
  airportStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  airportStat: {
    color: '#CAD5E0',
    fontSize: 12,
    fontWeight: '700',
  },
  statLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  statValue: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  statusTag: {
    color: '#60A5FA',
    marginBottom: 18,
  },
  unlockButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  unlockText: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
});
