import { supabase } from './supabase'
import { FishEntity } from '../store/useGameStore'

export const fishService = {
  saveFishes: async (fishes: FishEntity[]) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: 'No user' }

    if (fishes.length === 0) return { data: null, error: null }

    const formattedFishes = fishes.map(fish => ({
      id: fish.id,
      profile_id: user.id,
      type: fish.type,
      species: fish.species,
      rarity: fish.rarity,
      color: fish.color,
      size: fish.size,
      speed: fish.speed,
      hunger: fish.hunger,
      happiness: fish.happiness,
      age: fish.age,
      position_x: Math.round(fish.position.x),
      position_y: Math.round(fish.position.y),
      direction: fish.direction,
      stage: fish.stage || null,
      health: fish.health || null
    }))

    const { data, error } = await supabase
      .from('fishes')
      .upsert(formattedFishes)
    return { data, error }
  },

  loadFishes: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: 'No user' }

    const { data, error } = await supabase
      .from('fishes')
      .select('*')
      .eq('profile_id', user.id)

    if (data) {
      const formatted = data.map((d: any) => ({
        ...d,
        position: { x: d.position_x, y: d.position_y },
      }))
      return { data: formatted, error }
    }
    return { data, error }
  },

  saveDeadFishes: async (deadFishes: FishEntity[]) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: 'No user' }

    if (deadFishes.length === 0) return { data: null, error: null }

    const formatted = deadFishes.map(fish => ({
      id: fish.id,
      profile_id: user.id,
      type: fish.type,
      species: fish.species,
      rarity: fish.rarity,
      color: fish.color,
      size: fish.size,
      speed: fish.speed,
      hunger: fish.hunger,
      happiness: fish.happiness,
      age: fish.age,
      position_x: Math.round(fish.position.x),
      position_y: Math.round(fish.position.y),
      direction: fish.direction,
      stage: fish.stage || null,
      health: fish.health || null,
      death_time: fish.deathTime || null
    }))

    const { data, error } = await supabase
      .from('dead_fishes')
      .upsert(formatted)
    return { data, error }
  },

  loadDeadFishes: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: 'No user' }

    const { data, error } = await supabase
      .from('dead_fishes')
      .select('*')
      .eq('profile_id', user.id)

    if (data) {
      const formatted = data.map((d: any) => ({
        ...d,
        position: { x: d.position_x, y: d.position_y },
        deathTime: d.death_time
      }))
      return { data: formatted, error }
    }
    return { data, error }
  }
}
