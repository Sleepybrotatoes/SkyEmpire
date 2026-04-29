import type { Airport, Aircraft } from '../types';

const toRadians = (degrees: number) => degrees * (Math.PI / 180);

export function calculateDistanceKm(a: Airport, b: Airport) {
  const lat1 = toRadians(a.latitude);
  const lon1 = toRadians(a.longitude);
  const lat2 = toRadians(b.latitude);
  const lon2 = toRadians(b.longitude);
  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;
  const earthRadius = 6371;
  const haversine =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return Math.round(earthRadius * 2 * Math.asin(Math.sqrt(haversine)));
}

export function estimateRevenue(airportA: Airport, airportB: Airport, plane: Aircraft, prestigeMultiplier = 1) {
  const distance = calculateDistanceKm(airportA, airportB);
  const baseTicket = 100 + Math.round(distance / 50);
  const demandFactor = 0.7 + Math.min(0.25, prestigeMultiplier * 0.02);
  const loadFactor = Math.min(0.95, demandFactor + 0.05);
  const multiplier = 1 + Math.min(0.4, distance / 5000);
  return Math.round(distance * plane.seats * loadFactor * baseTicket * multiplier * 0.001);
}

export function getCycleSeconds(distance: number) {
  return Math.max(90, Math.round(distance / 18));
}

export function canOperateRoute(plane: Aircraft, distance: number) {
  return plane.range >= distance;
}
