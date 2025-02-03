import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type WatchlistItem = {
  id: string
  user_id: string
  symbol: string
  type: 'stock' | 'crypto'
  created_at: string
}

export type UserPreferences = {
  id: string
  user_id: string
  favorite_symbols: string[]
  chart_preferences: {
    timeframe: string
    indicators: string[]
  }
  default_view: 'stocks' | 'crypto'
  auto_refresh: boolean
  created_at?: string
  updated_at?: string
} 