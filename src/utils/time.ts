import { FishEntity } from '../store/useGameStore'

export const calculateOfflineProgress = (lastTime: number, fishes?: FishEntity[]) => {
  const now = Date.now()
  const diffMs = now - lastTime
  const simDt = Math.min(diffMs, 30 * 24 * 60 * 60 * 1000) // cap at 30 days
  const diffSec = diffMs / 1000

  // Passive coin generation
  const coins = diffSec * 0.1

  // If no fishes provided, return coins only
  if (!fishes || fishes.length === 0) {
    return { coins, updatedFishes: fishes || [], deaths: [] as string[], growth: diffSec * 0.01 }
  }

  const H_12_MS = 12 * 3600 * 1000
  const H_24_MS = 24 * 3600 * 1000
  const hungerDropRate = 100 / H_12_MS
  const healthDropRate = 100 / H_12_MS
  const baseGrowthRate = 100 / H_24_MS

  const deaths: string[] = []
  const updatedFishes = fishes.map(fish => {
    const f = { ...fish }

    // --- Hunger drop ---
    const prevHunger = f.hunger
    f.hunger = Math.max(0, f.hunger - hungerDropRate * simDt)

    // --- Health drop when hunger is 0 ---
    let timeAtZeroHunger = 0
    if (f.hunger === 0) {
      if (prevHunger === 0) {
        timeAtZeroHunger = simDt
      } else {
        const timeToReachZero = prevHunger / hungerDropRate
        timeAtZeroHunger = Math.max(0, simDt - timeToReachZero)
      }
    }

    if (timeAtZeroHunger > 0) {
      f.health = Math.max(0, (f.health ?? 100) - healthDropRate * timeAtZeroHunger)
      if (f.health === 0) {
        deaths.push(f.id)
      }
    } else {
      // Regenerate health slowly if fed
      if (f.hunger > 50 && (f.health ?? 100) < 100) {
        f.health = Math.min(100, (f.health ?? 100) + hungerDropRate * simDt)
      }
    }

    // --- Happiness drop when hungry ---
    if (f.hunger < 30) {
      f.happiness = Math.max(0, f.happiness - hungerDropRate * simDt * 2)
    }

    // --- Growth ---
    if (f.stage !== 'adult') {
      f.age = (f.age || 0) + baseGrowthRate * simDt
      if (f.age > 100 && f.stage === 'baby') {
        f.stage = 'adult'
        f.size = f.size * 1.5
      }
    }

    return f
  })

  return { coins, updatedFishes, deaths, growth: diffSec * 0.01 }
}
