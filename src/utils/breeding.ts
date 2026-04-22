import { FishEntity } from '../store/useGameStore'
import { FishDNA, generateDNA, combineDNA, getDNAQuality } from './dna'

const RARITIES = ['common', 'rare', 'epic', 'legendary'] as const
type RarityType = typeof RARITIES[number]

const SPECIES_BY_RARITY: Record<string, string[]> = {
  common: ['clownfish', 'bluetang'],
  rare: ['spiderfish', 'lionfish'],
  epic: ['dragonfish', 'ghostshark'],
  legendary: ['leviathan']
};

export function breed(fishA: FishEntity, fishB: FishEntity): Omit<FishEntity, 'id'> {
  const mutationChance = 0.1
  const isMutation = Math.random() < mutationChance
  
  // Decide offspring rarity — NO more guaranteed upgrade
  const aIdx = RARITIES.indexOf(fishA.rarity)
  const bIdx = RARITIES.indexOf(fishB.rarity)
  const maxIdx = Math.max(aIdx, bIdx)
  
  let offspringRarity: RarityType;
  const rarityRoll = Math.random()
  
  if (aIdx === bIdx) {
    // Same rarity: 15% upgrade, 70% same, 15% downgrade
    if (rarityRoll < 0.15 && maxIdx < RARITIES.length - 1) {
      offspringRarity = RARITIES[maxIdx + 1]
    } else if (rarityRoll > 0.85 && maxIdx > 0) {
      offspringRarity = RARITIES[maxIdx - 1]
    } else {
      offspringRarity = RARITIES[maxIdx]
    }
  } else {
    // Different rarities: 20% higher parent, 60% lower parent, 20% random between
    if (rarityRoll < 0.2) {
      offspringRarity = RARITIES[maxIdx]
    } else if (rarityRoll < 0.8) {
      offspringRarity = RARITIES[Math.min(aIdx, bIdx)]
    } else {
      // Random between the two
      const midIdx = Math.floor((aIdx + bIdx) / 2)
      offspringRarity = RARITIES[midIdx]
    }
  }

  // Determine DNA via Mendelian crossover
  const parentDnaA: FishDNA = fishA.dna ? fishA.dna as FishDNA : generateDNA()
  const parentDnaB: FishDNA = fishB.dna ? fishB.dna as FishDNA : generateDNA()
  const offspringDNA = combineDNA(parentDnaA, parentDnaB)
  
  // Color from dominant color gene parent
  let offspringColor = offspringDNA.colorGene === 'A' ? fishA.color : fishB.color

  // Species: 80% from one of the parents, 20% random from new rarity pool
  let offspringSpecies: string;
  const speciesRoll = Math.random()
  
  if (speciesRoll < 0.4) {
    // 40% chance of parent A's species (if valid for the new rarity)
    const validSpecies = SPECIES_BY_RARITY[offspringRarity]
    offspringSpecies = validSpecies.includes(fishA.species) 
      ? fishA.species 
      : validSpecies[Math.floor(Math.random() * validSpecies.length)]
  } else if (speciesRoll < 0.8) {
    // 40% chance of parent B's species (if valid for the new rarity)
    const validSpecies = SPECIES_BY_RARITY[offspringRarity]
    offspringSpecies = validSpecies.includes(fishB.species) 
      ? fishB.species 
      : validSpecies[Math.floor(Math.random() * validSpecies.length)]
  } else {
    // 20% random from rarity pool
    const possibleSpecies = SPECIES_BY_RARITY[offspringRarity]
    offspringSpecies = possibleSpecies[Math.floor(Math.random() * possibleSpecies.length)]
  }

  if (isMutation) {
    offspringColor = `hsl(${Math.random() * 360},80%,60%)`
    // Mutation can also randomize species within rarity
    const possibleSpecies = SPECIES_BY_RARITY[offspringRarity]
    offspringSpecies = possibleSpecies[Math.floor(Math.random() * possibleSpecies.length)]
  }

  // Define stats based on DNA quality
  const dnaQuality = getDNAQuality(offspringDNA) // 0-6
  const baseSize = 18 + dnaQuality * 2;  // 18-30
  const baseSpeed = 0.3 + dnaQuality * 0.1; // 0.3-0.9

  return {
    type: 'fish',
    species: offspringSpecies,
    rarity: offspringRarity,
    color: offspringColor,
    size: baseSize,
    speed: baseSpeed,
    hunger: 100,
    health: 100,
    happiness: 100,
    age: 0,
    position: { x: 150, y: 150 },
    direction: 1,
    stage: 'baby',
    dna: offspringDNA
  }
}
