import React from 'react';
import { Bug, Crown, Flame, Ghost, Anchor, Fish } from 'lucide-react-native';
import { moderateScale } from '../utils/responsive';

// Centralized species definitions — single source of truth
export interface SpeciesInfo {
  name: string;
  iconName: string; // Lucide icon component key
  color: string;
  reviveCost: number;
}

export const SPECIES_INFO: Record<string, SpeciesInfo> = {
  clownfish:  { name: 'Peixe-Palhaço',     iconName: 'Fish',    color: '#FF4500', reviveCost: 25 },
  bluetang:   { name: 'Cirurgião-Patela',   iconName: 'Fish',    color: '#0000FF', reviveCost: 25 },
  spiderfish: { name: 'Peixe Aranha',       iconName: 'Bug',     color: '#8B008B', reviveCost: 75 },
  lionfish:   { name: 'Peixe-Leão',         iconName: 'Crown',   color: '#B22222', reviveCost: 75 },
  dragonfish: { name: 'Peixe-Dragão',       iconName: 'Flame',   color: '#00FA9A', reviveCost: 200 },
  ghostshark: { name: 'Tubarão-Fantasma',   iconName: 'Ghost',   color: '#E0FFFF', reviveCost: 200 },
  leviathan:  { name: 'Leviatã',            iconName: 'Anchor',  color: '#4B0082', reviveCost: 500 },
};

// Icon component lookup
const ICON_MAP: Record<string, any> = {
  Bug, Crown, Flame, Ghost, Anchor, Fish,
};

export const getSpeciesName = (species: string): string =>
  SPECIES_INFO[species]?.name || species;

export const getSpeciesColor = (species: string): string =>
  SPECIES_INFO[species]?.color || '#FFA500';

export const getReviveCost = (species: string): number =>
  SPECIES_INFO[species]?.reviveCost || 75;

/**
 * Returns the Lucide icon component for species that don't have SVG illustrations.
 * For clownfish and bluetang, returns null (caller should use SVG components).
 */
export const getSpeciesIcon = (species: string): any | null => {
  if (species === 'clownfish' || species === 'bluetang') return null;
  const info = SPECIES_INFO[species];
  if (!info) return Fish;
  return ICON_MAP[info.iconName] || Fish;
};
