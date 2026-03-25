import { supabase } from './supabase'
import { FishEntity } from '../store/useGameStore'

export const fishService = {
  saveFishes: async (fishes: FishEntity[]) => {
    // Example: Upsert all fishes in the database for the current user
    const { data, error } = await supabase
      .from('fishes')
      .upsert(fishes)
    return { data, error }
  },

  loadFishes: async () => {
    const { data, error } = await supabase
      .from('fishes')
      .select('*')
    return { data, error }
  }
}
