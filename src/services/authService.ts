import { supabase } from './supabase'

export const authService = {
  getUser: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },
  
  login: async (email: string, pass: string) => {
    return await supabase.auth.signInWithPassword({ email, password: pass })
  },
  
  register: async (email: string, pass: string) => {
    return await supabase.auth.signUp({ email, password: pass })
  },
  
  logout: async () => {
    return await supabase.auth.signOut()
  }
}
