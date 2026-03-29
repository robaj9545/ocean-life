import { FishEntity } from '../store/useGameStore'

interface CreateFishProps {
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  species?: string;
  stage?: 'egg' | 'baby' | 'adult';
}

export const createFish = ({ rarity = 'common', species, stage = 'baby' }: CreateFishProps = {}): Omit<FishEntity, 'id'> => {
  const possibleSpecies = ['clownfish', 'bluetang', 'striped', 'puffer', 'fantasy', 'generic'];
  const finalSpecies = species || possibleSpecies[Math.floor(Math.random() * possibleSpecies.length)];
  
  let color = '#FFA500';
  if (finalSpecies === 'bluetang') color = '#0000FF';
  else if (finalSpecies === 'striped') color = '#32CD32';
  else if (finalSpecies === 'puffer') color = '#F4D03F';
  else if (finalSpecies === 'fantasy') color = '#FF69B4';
  else if (finalSpecies === 'generic') color = '#3498DB';

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