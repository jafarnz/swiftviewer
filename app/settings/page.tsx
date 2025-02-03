"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { UserPreferences } from '@/lib/supabase'

export default function Settings() {
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<any>(null)
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase])

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error) throw error
        setPreferences(data)
      } catch (error) {
        console.error('Error fetching preferences:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPreferences()
  }, [user, supabase])

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          ...updates,
        })

      if (error) throw error
      setPreferences(prev => prev ? { ...prev, ...updates } : null)
    } catch (error) {
      console.error('Error updating preferences:', error)
    }
  }

  if (!user || loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-4 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Display Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="default-view">Default View</Label>
                <Select
                  value={preferences?.default_view || 'stocks'}
                  onValueChange={(value: 'stocks' | 'crypto') => 
                    updatePreferences({ default_view: value })}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select view" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stocks">Stocks</SelectItem>
                    <SelectItem value="crypto">Crypto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="chart-timeframe">Default Chart Timeframe</Label>
                <Select
                  value={preferences?.chart_preferences?.timeframe || '1d'}
                  onValueChange={(value) => 
                    updatePreferences({
                      chart_preferences: {
                        ...preferences?.chart_preferences,
                        timeframe: value
                      }
                    })}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1d">1 Day</SelectItem>
                    <SelectItem value="1w">1 Week</SelectItem>
                    <SelectItem value="1m">1 Month</SelectItem>
                    <SelectItem value="3m">3 Months</SelectItem>
                    <SelectItem value="1y">1 Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-refresh"
                  checked={preferences?.auto_refresh || false}
                  onCheckedChange={(checked) => 
                    updatePreferences({ auto_refresh: checked })}
                />
                <Label htmlFor="auto-refresh">Enable Auto-Refresh</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Email</Label>
                <div className="text-sm text-gray-500">{user.email}</div>
              </div>
              <Button
                variant="outline"
                onClick={async () => {
                  const { error } = await supabase.auth.signOut()
                  if (error) console.error('Error signing out:', error)
                }}
              >
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
} 