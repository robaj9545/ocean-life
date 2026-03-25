import { supabase } from './supabase'

export const economyService = {
  saveEconomy: async (coins: number) => {
    // Save coins to profiles table
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('profiles')
      .update({ coins })
      .eq('id', user.id)
    
    return { data, error }
  },

  loadEconomy: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: 'No user' }

    const { data, error } = await supabase
      .from('profiles')
      .select('coins')
      .eq('id', user.id)
      .single()
      
    return { data, error }
  }
}
