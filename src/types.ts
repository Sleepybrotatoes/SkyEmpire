export type AircraftCategory = 'Turboprop' | 'Narrow-body' | 'Wide-body' | 'Ultra Long Haul';
export type AircraftStatus = 'IDLE' | 'ACTIVE' | 'MAINTENANCE';
export type AirportTier = 'Hub' | 'International' | 'Domestic' | 'Regional';
export type AirportStatus = 'OWNED' | 'AVAILABLE' | 'LOCKED';
export type CountryStatus = 'LOCKED' | 'UNLOCKED' | 'ACTIVE';
export type RouteStatus = 'ACTIVE' | 'CANCELLED';

export interface Aircraft {
  id: string;
  tail: string;
  name: string;
  category: AircraftCategory;
  price: number;
  maintenance: number;
  seats: number;
  range: number;
  compatible: AirportTier[];
  status: AircraftStatus;
  routeId?: string;
}

export interface Airport {
  id: string;
  iata: string;
  city: string;
  country: string;
  flag: string;
  tier: AirportTier;
  monthlyCost: number;
  latitude: number;
  longitude: number;
  status: AirportStatus;
}

export interface Country {
  id: string;
  name: string;
  emoji: string;
  status: CountryStatus;
  unlockCost: number;
  airports: number;
  projectedRevenue: number;
}

export type AirportFilter = 'All' | 'Owned' | 'Available';

export interface Route {
  id: string;
  departure: string;
  arrival: string;
  aircraftId: string;
  distance: number;
  progress: number;
  cycleSeconds: number;
  revenuePerFlight: number;
  flightsCompleted: number;
  loadFactor: number;
  status: RouteStatus;
}

export interface FeedEntry {
  id: string;
  message: string;
  timestamp: number;
}

export interface Prestige {
  level: number;
  title: string;
  xp: number;
}

export interface GameState {
  _hasHydrated: boolean;
  cash: number;
  prestige: Prestige;
  airports: Airport[];
  aircraft: Aircraft[];
  routes: Route[];
  feed: FeedEntry[];
  selectedCategory: AircraftCategory | 'All';
  airportFilter: AirportFilter;
  countryFilter: string | null;
  activeFleetTab: 'Buy' | 'My Fleet';
  countries: Country[];
  buyAircraft: (id: string) => void;
  buyAirportSlot: (airportId: string) => void;
  unlockCountry: (countryId: string) => void;
  setAirportFilter: (filter: AirportFilter) => void;
  setCountryFilter: (countryId: string | null) => void;
  cancelRoute: (routeId: string) => void;
  advanceGameTick: () => void;
  createRoute: (departure: string, arrival: string, aircraftId: string) => void;
  addFeed: (message: string) => void;
  toggleFleetTab: (tab: 'Buy' | 'My Fleet') => void;
  selectCategory: (category: AircraftCategory | 'All') => void;
  setHasHydrated: (value: boolean) => void;
}
