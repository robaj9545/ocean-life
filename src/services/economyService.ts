import { supabase } from './supabase'

export const economyService = {
  saveEconomy: async (coins: number, level: number, xp: number, fishes: any[], deadFishes: any[]) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('profiles')
      .update({ coins: Math.floor(coins), level, xp, fishes, dead_fishes: deadFishes })
      .eq('id', user.id)
    
    return { data, error }
  },

  loadEconomy: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: 'No user' }

    const { data, error } = await supabase
      .from('profiles')
      .select('coins, level, xp, fishes, dead_fishes')
      .eq('id', user.id)
      .single()
      
    return { data, error }
  }
}
