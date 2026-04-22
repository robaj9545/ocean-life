import { supabase } from './supabase'
import { FishEntity } from '../store/useGameStore'

export const fishService = {
  saveFishes: async (fishes: FishEntity[]) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: 'No user' }

    // BUG #3 FIX: Delete fishes that were removed locally before upserting
    try {
      const { data: serverFishes } = await supabase
        .from('fishes')
        .select('id')
        .eq('profile_id', user.id)

      if (serverFishes) {
        const localIds = new Set(fishes.map(f => f.id))
        const toDelete = serverFishes.filter(sf => !localIds.has(sf.id)).map(sf => sf.id)
        if (toDelete.length > 0) {
          await supabase.from('fishes').delete().in('id', toDelete)
        }
      }
    } catch (e) {
      // Deletion is best-effort; don't block the save
      console.warn('Failed to cleanup deleted fishes:', e)
    }

    if (fishes.length === 0) return { data: null, error: null }

    // BUG #7 FIX: Include dna and nickname in the save payload
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
      health: fish.health ?? null,
      dna: fish.dna ? JSON.stringify(fish.dna) : null,
      nickname: fish.nickname || null,
    }))

    const { data, error } = await supabase
      .from('fishes')
      .upsert(formattedFishes)
    return { data, error }
  },

  createFishOnServer: async (fishData: Omit<FishEntity, 'id'>): Promise<{ data: FishEntity | null; error: any }> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: 'No user' }

    const formattedFish = {
      profile_id: user.id,
      type: fishData.type,
      species: fishData.species,
      rarity: fishData.rarity,
      color: fishData.color,
      size: fishData.size,
      speed: fishData.speed,
      hunger: fishData.hunger,
      happiness: fishData.happiness,
      age: fishData.age,
      position_x: Math.round(fishData.position.x),
      position_y: Math.round(fishData.position.y),
      direction: fishData.direction,
      stage: fishData.stage || null,
      health: fishData.health ?? null,
      dna: fishData.dna ? JSON.stringify(fishData.dna) : null,
      nickname: fishData.nickname || null,
    }

    const { data, error } = await supabase
      .from('fishes')
      .insert(formattedFish)
      .select()
      .single()
      
    if (data) {
      const insertedFish: FishEntity = {
        ...fishData,
        id: data.id,
        position: { x: data.position_x, y: data.position_y },
        dna: data.dna ? (typeof data.dna === 'string' ? JSON.parse(data.dna) : data.dna) : fishData.dna,
        nickname: data.nickname || fishData.nickname,
      }
      return { data: insertedFish, error: null }
    }
    
    return { data: null, error }
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
        dna: d.dna ? (typeof d.dna === 'string' ? JSON.parse(d.dna) : d.dna) : undefined,
        nickname: d.nickname || undefined,
      }))
      return { data: formatted, error }
    }
    return { data, error }
  },

  saveDeadFishes: async (deadFishes: FishEntity[]) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: 'No user' }

    // Also sync deletions for dead fishes
    try {
      const { data: serverDead } = await supabase
        .from('dead_fishes')
        .select('id')
        .eq('profile_id', user.id)

      if (serverDead) {
        const localIds = new Set(deadFishes.map(f => f.id))
        const toDelete = serverDead.filter(sf => !localIds.has(sf.id)).map(sf => sf.id)
        if (toDelete.length > 0) {
          await supabase.from('dead_fishes').delete().in('id', toDelete)
        }
      }
    } catch (e) {
      console.warn('Failed to cleanup dead fishes:', e)
    }

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
      health: fish.health ?? null,
      death_time: fish.deathTime || null,
      dna: fish.dna ? JSON.stringify(fish.dna) : null,
      nickname: fish.nickname || null,
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
        deathTime: d.death_time,
        dna: d.dna ? (typeof d.dna === 'string' ? JSON.parse(d.dna) : d.dna) : undefined,
        nickname: d.nickname || undefined,
      }))
      return { data: formatted, error }
    }
    return { data, error }
  }
}
