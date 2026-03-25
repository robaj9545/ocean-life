import { createClient } from '@supabase/supabase-js'

// TODO: Replace with your actual Supabase project URL and ANON KEY
const SUPABASE_URL = 'https://sua-url-aqui.supabase.co'
const SUPABASE_ANON_KEY = 'seu-anon-key-aqui'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
