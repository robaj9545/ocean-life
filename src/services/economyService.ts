import { supabase } from './supabase'

export const economyService = {
  saveEconomy: async (coins: number, level: number, xp: number, foodAmount: number) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Run updates in parallel to save time
    const [coinsRes, levelRes, xpRes, foodRes] = await Promise.all([
      supabase.from('coins').upsert({ profile_id: user.id, amount: Math.floor(coins) }),
      supabase.from('level').upsert({ profile_id: user.id, value: level }),
      supabase.from('xp').upsert({ profile_id: user.id, amount: xp }),
      supabase.from('foods').upsert({ profile_id: user.id, amount: foodAmount })
    ])
    
    return { data: { coinsRes, levelRes, xpRes, foodRes }, error: coinsRes.error || levelRes.error || xpRes.error || foodRes.error }
  },

  loadEconomy: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: 'No user' }

    const [coinsRes, levelRes, xpRes, foodRes] = await Promise.all([
      supabase.from('coins').select('amount').eq('profile_id', user.id).single(),
      supabase.from('level').select('value').eq('profile_id', user.id).single(),
      supabase.from('xp').select('amount').eq('profile_id', user.id).single(),
      supabase.from('foods').select('amount').eq('profile_id', user.id).single()
    ])

    return { 
      data: {
        coins: coinsRes.data?.amount ?? 0,
        foodAmount: foodRes.data?.amount ?? 50,
        level: levelRes.data?.value ?? 1,
        xp: xpRes.data?.amount ?? 0
      }, 
      error: coinsRes.error || levelRes.error || xpRes.error || foodRes.error
    }
  }
}
