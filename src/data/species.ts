// Centralized species definitions — single source of truth for names, emojis, and revive costs
export interface SpeciesInfo {
  name: string;
  emoji: string;
  reviveCost: number;
}

export const SPECIES_INFO: Record<string, SpeciesInfo> = {
  clownfish:  { name: 'Peixe-Palhaço',     emoji: '🐠', reviveCost: 25 },
  bluetang:   { name: 'Cirurgião-Patela',   emoji: '🐟', reviveCost: 25 },
  spiderfish: { name: 'Peixe Aranha',       emoji: '🕷️', reviveCost: 75 },
  lionfish:   { name: 'Peixe-Leão',         emoji: '🦁', reviveCost: 75 },
  dragonfish: { name: 'Peixe-Dragão',       emoji: '🐉', reviveCost: 200 },
  ghostshark: { name: 'Tubarão-Fantasma',   emoji: '👻', reviveCost: 200 },
  leviathan:  { name: 'Leviatã',            emoji: '🦑', reviveCost: 500 },
};

export const getSpeciesName = (species: string): string =>
  SPECIES_INFO[species]?.name || species;

export const getSpeciesEmoji = (species: string): string =>
  SPECIES_INFO[species]?.emoji || '🐟';

export const getReviveCost = (species: string): number =>
  SPECIES_INFO[species]?.reviveCost || 75;
