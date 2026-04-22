import { FishEntity } from '../store/useGameStore'

interface CreateFishProps {
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  species?: string;
  stage?: 'egg' | 'baby' | 'adult';
}

const SPECIES_BY_RARITY: Record<string, string[]> = {
  common: ['clownfish', 'bluetang'],
  rare: ['spiderfish', 'lionfish'],
  epic: ['dragonfish', 'ghostshark'],
  legendary: ['leviathan']
};

export const createFish = ({ rarity = 'common', species, stage = 'baby' }: CreateFishProps = {}): Omit<FishEntity, 'id'> => {
  const possibleSpecies = SPECIES_BY_RARITY[rarity] || SPECIES_BY_RARITY.common;
  const finalSpecies = species || possibleSpecies[Math.floor(Math.random() * possibleSpecies.length)];
  
  let color = '#FFA500';
  if (finalSpecies === 'bluetang') color = '#0000FF';
  else if (finalSpecies === 'clownfish') color = '#FF4500';
  else if (finalSpecies === 'spiderfish') color = '#8B008B';
  else if (finalSpecies === 'lionfish') color = '#B22222';
  else if (finalSpecies === 'dragonfish') color = '#00FA9A';
  else if (finalSpecies === 'ghostshark') color = '#E0FFFF';
  else if (finalSpecies === 'leviathan') color = '#4B0082';

  const initialSize = 25;

  return {
    type: 'fish',
    species: finalSpecies,
    rarity,
    color,
    size: initialSize,
    speed: 0.5 + Math.random() * 0.5,
    hunger: 100,
    happiness: 100,
    health: 100,
    age: 0,
    position: {
      x: 100 + Math.random() * 150,
      y: 100 + Math.random() * 300,
    },
    direction: 1,
    stage,
  }
}