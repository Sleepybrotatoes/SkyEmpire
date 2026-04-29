import type { Country } from '../types';

export interface SvgCountryData {
  id: string;
  path: string;
  pinX: number;
  pinY: number;
}

export const svgCountries: SvgCountryData[] = [
  {
    id: 'NZ',
    path: 'M260 180 L300 180 L320 220 L280 240 L260 210 Z',
    pinX: 290,
    pinY: 210,
  },
  {
    id: 'AU',
    path: 'M140 100 L220 100 L230 180 L150 180 Z',
    pinX: 190,
    pinY: 140,
  },
  {
    id: 'FJ',
    path: 'M240 130 L260 130 L270 160 L250 170 Z',
    pinX: 255,
    pinY: 150,
  },
  {
    id: 'PG',
    path: 'M220 85 L250 85 L255 115 L225 120 Z',
    pinX: 240,
    pinY: 100,
  },
  {
    id: 'TO',
    path: 'M270 100 L285 100 L292 115 L275 125 Z',
    pinX: 280,
    pinY: 110,
  },
  {
    id: 'VU',
    path: 'M250 120 L265 120 L270 140 L255 145 Z',
    pinX: 260,
    pinY: 132,
  },
];
