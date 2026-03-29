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
  const maxIdx = Math.max(aIdx, bIdx)
  
  let offspringRarity: RarityType = RARITIES[Math.max(0, maxIdx - 1)]
  
  // 30% chance to inherit the higher rarity, else one tier lower
  if (Math.random() < 0.3) {
    offspringRarity = RARITIES[maxIdx]
  } else if (Math.random() < 0.05 && maxIdx < RARITIES.length - 1) {
    // 5% chance to go one tier higher (fixed overlap)
    offspringRarity = RARITIES[maxIdx + 1]
  }

  // Determine DNA and color mixing
  const offspringDNA = combineDNA(fishA.dna || generateDNA(), fishB.dna || generateDNA())
  
  let offspringColor = offspringDNA.colorGene === 'A' ? fishA.color : fishB.color

  // Mutation logic
  const inheritA = Math.random() > 0.5
  let offspringSpecies = inheritA ? fishA.species : fishB.species
  if (isMutation) {
    offspringSpecies = 'mutant_' + Math.floor(Math.random() * 1000)
    offspringColor = `hsl(${Math.random() * 360},80%,60%)`
  }

  return {
    type: 'fish',
    species: offspringSpecies,
    rarity: offspringRarity,
    color: offspringColor,
    size: 20, // starts small
    speed: 0.5,
    hunger: 100,
    happiness: 100,
    age: 0,
    position: { x: 150, y: 150 }, // spawn pos will be set later
    direction: 1,
    stage: 'baby',
    dna: offspringDNA
  }
}
