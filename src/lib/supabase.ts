import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const demoUrl = 'https://demo.supabase.co'
// Keep workspace access private until the account screens are restored.
const accountAccessEnabled = false

export const isDemoMode = !accountAccessEnabled || import.meta.env.VITE_PUBLIC_DEMO === 'true'
  || !supabaseUrl || !supabaseAnonKey || supabaseUrl === demoUrl

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Running in demo mode.')
}

export const supabase = createClient(
  isDemoMode ? demoUrl : supabaseUrl,
  isDemoMode ? 'demo-key' : supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)

