import { FishEntity } from '../store/useGameStore'
import { generateDNA, combineDNA } from './dna'

const RARITIES = ['common', 'rare', 'epic', 'legendary'] as const
type RarityType = typeof RARITIES[number]

export function breed(fishA: FishEntity, fishB: FishEntity): Omit<FishEntity, 'id'> {
  const mutationChance = 0.1
  const isMutation = Math.random() < mutationChance
  
  // Decide offspring rarity
  const aIdx = RARITIES.indexOf(fishA.rarity)
  const bIdx = RARITIES.indexOf(fishB.rarity)
  
  let offspringRarity: RarityType;
  if (aIdx === bIdx) {
    offspringRarity = RARITIES[Math.min(RARITIES.length - 1, aIdx + 1)]
  } else {
    const maxIdx = Math.max(aIdx, bIdx)
    offspringRarity = RARITIES[Math.max(0, maxIdx - 1)]
  }

  // Determine DNA and color mixing
  const offspringDNA = combineDNA(fishA.dna || generateDNA(), fishB.dna || generateDNA())
  
  let offspringColor = offspringDNA.colorGene === 'A' ? fishA.color : fishB.color

  // Assign species based on the new rarity
  const SPECIES_BY_RARITY: Record<string, string[]> = {
    common: ['clownfish', 'bluetang'],
    rare: ['spiderfish', 'lionfish'],
    epic: ['dragonfish', 'ghostshark'],
    legendary: ['leviathan']
  };

  const possibleSpecies = SPECIES_BY_RARITY[offspringRarity];
  let offspringSpecies = possibleSpecies[Math.floor(Math.random() * possibleSpecies.length)];

  if (isMutation) {
    offspringColor = `hsl(${Math.random() * 360},80%,60%)`
  }

  // Define stats based on DNA
  const baseSize = offspringDNA.sizeGene === 'B' ? 25 : 18;
  const baseSpeed = offspringDNA.speedGene === 'C' ? 0.8 : 0.4;

  return {
    type: 'fish',
    species: offspringSpecies,
    rarity: offspringRarity,
    color: offspringColor,
    size: baseSize, // influenced by DNA
    speed: baseSpeed, // influenced by DNA
    hunger: 100,
    health: 100,
    happiness: 100,
    age: 0,
    position: { x: 150, y: 150 }, // spawn pos will be set later
    direction: 1,
    stage: 'baby',
    dna: offspringDNA
  }
}
