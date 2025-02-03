import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { WatchlistItem } from '@/lib/supabase'

export function useWatchlist(userId: string | undefined) {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return

    const fetchWatchlist = async () => {
      try {
        const { data, error } = await supabase
          .from('watchlist')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error
        setWatchlist(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchWatchlist()

    // Subscribe to changes
    const subscription = supabase
      .channel('watchlist_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'watchlist',
          filter: `user_id=eq.${userId}`
        }, 
        (payload) => {
          fetchWatchlist()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [userId])

  const addToWatchlist = async (symbol: string, type: 'stock' | 'crypto') => {
    try {
      const { error } = await supabase
        .from('watchlist')
        .insert([
          {
            user_id: userId,
            symbol,
            type,
          },
        ])

      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    }
  }

  const removeFromWatchlist = async (symbol: string) => {
    try {
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', userId)
        .eq('symbol', symbol)

      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    }
  }

  return {
    watchlist,
    loading,
    error,
    addToWatchlist,
    removeFromWatchlist,
  }
} 