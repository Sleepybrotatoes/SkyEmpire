import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { aircraftCatalog } from '../data/aircraft';
import { initialAirportList } from '../data/airports';
import { initialCountries } from '../data/countries';
import type { Aircraft, Airport, Country, FeedEntry, GameState, Prestige, Route } from '../types';
import { formatCurrency } from '../utils/formatting';

const initialPrestige: Prestige = {
  level: 1,
  title: 'Regional Operator',
  xp: 0,
};

const initialFleet: Aircraft[] = [
  {
    id: 'plane-zk-001',
    tail: 'ZK-001',
    name: 'ATR 72',
    category: 'Turboprop',
    price: 4000000,
    maintenance: 80000,
    seats: 70,
    range: 1500,
    compatible: ['Regional'],
    status: 'IDLE',
  },
];

const initialRoutes: Route[] = [
  {
    id: 'route-nzaa-yssy',
    departure: 'NZAA',
    arrival: 'YSSY',
    aircraftId: 'plane-zk-001',
    distance: 2182,
    progress: 0.25,
    cycleSeconds: 120,
    revenuePerFlight: 420000,
    flightsCompleted: 12,
    loadFactor: 0.72,
    status: 'ACTIVE',
  },
];

const initialFeed: FeedEntry[] = [
  {
    id: 'init-1',
    message: 'Welcome to SkyEmpire. Your airline has launched from Auckland.',
    timestamp: Date.now(),
  },
];

function formatRouteEvent(route: Route, flights: number) {
  return `${route.departure} → ${route.arrival} completed ${flights} flight${flights > 1 ? 's' : ''}. Earned ${formatCurrency(route.revenuePerFlight * flights)}.`;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      _hasHydrated: false,
      cash: 5000000,
      prestige: initialPrestige,
      airports: initialAirportList,
      aircraft: initialFleet,
      routes: initialRoutes,
      feed: initialFeed,
      countries: initialCountries,
      selectedCategory: 'All',
      airportFilter: 'All',
      countryFilter: null,
      activeFleetTab: 'Buy',
      buyAircraft: (id: string) => {
        const state = get();
        const catalogItem = aircraftCatalog.find((item) => item.name === id);
        if (!catalogItem || state.cash < catalogItem.price) {
          return;
        }
        const nextTail = `ZK-${String(state.aircraft.length + 1).padStart(3, '0')}`;
        const newPlane: Aircraft = {
          id: `plane-${nextTail.toLowerCase()}`,
          tail: nextTail,
          name: catalogItem.name,
          category: catalogItem.category,
          price: catalogItem.price,
          maintenance: catalogItem.maintenance,
          seats: catalogItem.seats,
          range: catalogItem.range,
          compatible: catalogItem.compatible,
          status: 'IDLE',
        };
        set({
          cash: state.cash - catalogItem.price,
          aircraft: [...state.aircraft, newPlane],
          feed: [{
            id: `feed-buy-${Date.now()}`,
            message: `Purchased ${catalogItem.name} for ${formatCurrency(catalogItem.price)}.`,
            timestamp: Date.now(),
          },
          ...state.feed].slice(0, 40),
        });
      },
      cancelRoute: (routeId: string) => {
        const state = get();
        const updatedRoutes = state.routes.map((route) =>
          route.id === routeId ? { ...route, status: 'CANCELLED', progress: 0 } : route
        );
        const updatedAircraft = state.aircraft.map((plane) =>
          plane.routeId === routeId ? { ...plane, status: 'IDLE', routeId: undefined } : plane
        );
        set({
          routes: updatedRoutes,
          aircraft: updatedAircraft,
          feed: [{
            id: `feed-cancel-${Date.now()}`,
            message: `Route ${routeId.toUpperCase()} was cancelled.`,
            timestamp: Date.now(),
          },
          ...state.feed].slice(0, 40),
        });
      },
      createRoute: (departure: string, arrival: string, aircraftId: string) => {
        const state = get();
        const plane = state.aircraft.find((item) => item.id === aircraftId);
        if (!plane) return;
        const distance = departure === 'NZAA' && arrival === 'YSSY' ? 2182 : 1600;
        const routeId = `route-${departure.toLowerCase()}-${arrival.toLowerCase()}`;
        const newRoute: Route = {
          id: routeId,
          departure,
          arrival,
          aircraftId,
          distance,
          progress: 0,
          cycleSeconds: Math.max(90, Math.round(distance / 18)),
          revenuePerFlight: Math.round(distance * plane.seats * 1.4),
          flightsCompleted: 0,
          loadFactor: 0.7,
          status: 'ACTIVE',
        };
        const updatedAircraft = state.aircraft.map((item) =>
          item.id === aircraftId ? { ...item, status: 'ACTIVE', routeId } : item
        );
        set({
          routes: [...state.routes, newRoute],
          aircraft: updatedAircraft,
          feed: [{
            id: `feed-create-${Date.now()}`,
            message: `Launched route ${departure} → ${arrival} with ${plane.name}.`,
            timestamp: Date.now(),
          },
          ...state.feed].slice(0, 40),
        });
      },
      advanceGameTick: () => {
        const state = get();
        const tickSeconds = 5;
        let revenueEarned = 0;
        let routeFeed: FeedEntry[] = [];

        const updatedRoutes = state.routes.map((route) => {
          if (route.status !== 'ACTIVE') return route;
          const nextProgress = route.progress + tickSeconds / route.cycleSeconds;
          if (nextProgress >= 1) {
            const completed = Math.floor(nextProgress);
            revenueEarned += route.revenuePerFlight * completed;
            routeFeed.push({
              id: `route-${route.id}-${Date.now()}`,
              message: formatRouteEvent(route, completed),
              timestamp: Date.now(),
            });
            return {
              ...route,
              progress: nextProgress - completed,
              flightsCompleted: route.flightsCompleted + completed,
            };
          }
          return {
            ...route,
            progress: nextProgress,
          };
        });

        const maintenanceCost = state.aircraft.reduce((sum, plane) => sum + plane.maintenance / 360, 0);
        const slotCost = state.airports.filter((airport) => airport.status === 'OWNED').reduce((sum, airport) => sum + airport.monthlyCost / 360, 0);
        const netChange = revenueEarned - maintenanceCost - slotCost;

        set({
          cash: Math.max(0, state.cash + netChange),
          routes: updatedRoutes,
          feed: [...routeFeed, ...state.feed].slice(0, 40),
        });
      },
      addFeed: (message: string) => {
        const state = get();
        set({
          feed: [
            { id: `feed-${Date.now()}`, message, timestamp: Date.now() },
            ...state.feed,
          ].slice(0, 40),
        });
      },
      buyAirportSlot: (airportId: string) => {
        const state = get();
        const airport = state.airports.find((item) => item.id === airportId);
        if (!airport || airport.status !== 'AVAILABLE' || state.cash < airport.monthlyCost) {
          return;
        }
        const updated = state.airports.map((item) =>
          item.id === airportId ? { ...item, status: 'OWNED' } : item
        );
        set({
          cash: state.cash - airport.monthlyCost,
          airports: updated,
          feed: [{
            id: `feed-airport-${Date.now()}`,
            message: `Purchased slot at ${airport.iata} for ${formatCurrency(airport.monthlyCost)}/mo.`,
            timestamp: Date.now(),
          },
          ...state.feed].slice(0, 40),
        });
      },
      unlockCountry: (countryId: string) => {
        const state = get();
        const country = state.countries.find((item) => item.id === countryId);
        if (!country || country.status !== 'LOCKED' || state.cash < country.unlockCost) {
          return;
        }
        const updated = state.countries.map((item) =>
          item.id === countryId ? { ...item, status: 'UNLOCKED' } : item
        );
        set({
          cash: state.cash - country.unlockCost,
          countries: updated,
          feed: [{
            id: `feed-unlock-${Date.now()}`,
            message: `Unlocked ${country.name} for ${formatCurrency(country.unlockCost)}.`,
            timestamp: Date.now(),
          },
          ...state.feed].slice(0, 40),
        });
      },
      setAirportFilter: (filter: 'All' | 'Owned' | 'Available') => set({ airportFilter: filter }),
      setCountryFilter: (countryId: string | null) => set({ countryFilter: countryId }),
      toggleFleetTab: (tab: 'Buy' | 'My Fleet') => set({ activeFleetTab: tab }),
      selectCategory: (category: 'All' | Aircraft['category']) => set({ selectedCategory: category }),
      setHasHydrated: (value: boolean) => set({ _hasHydrated: value }),
    }),
    {
      name: 'skyempire-storage',
      getStorage: () => AsyncStorage,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
