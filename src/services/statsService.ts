import { supabase } from './supabase'

export interface UserStats {
  feed: number;
  breed: number;
  buy_fish: number;
  collect_coin: number;
  buy_food: number;
  revive: number;
}

export const statsService = {
  saveStats: async (
    stats: UserStats,
    claimed_missions: string[],
    daily_progress: Record<string, number>,
    last_daily_reset: number
  ) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const payload = {
      profile_id: user.id,
      stats: stats as any,
      claimed_missions: claimed_missions as any,
      daily_progress: daily_progress as any,
      last_daily_reset: last_daily_reset,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('user_stats')
      .upsert(payload)

    return { data, error }
  },

  loadStats: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: 'No user' }

    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('profile_id', user.id)
      .single()

    if (data) {
      return {
        data: {
          stats: data.stats as UserStats,
          claimedMissions: data.claimed_missions as string[],
          dailyProgress: data.daily_progress as Record<string, number>,
          lastDailyReset: data.last_daily_reset as number
        },
        error: null
      }
    }
    
    return { data: null, error }
  }
}
