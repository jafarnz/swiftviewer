"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useWatchlist } from "@/hooks/useWatchlist"
import { getStockQuote, getStockHistory, getTopCryptos, getCryptoHistory } from "@/lib/api"
import type { StockQuote, CryptoQuote } from "@/lib/api"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Star, StarOff, Search, Bitcoin } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Activity, BarChart, TrendingUp, TrendingDown, DollarSign, Coins } from "lucide-react"

export default function WatchlistDashboard() {
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<any>(null)
  const { watchlist, removeFromWatchlist } = useWatchlist(user?.id)
  const [assets, setAssets] = useState<(StockQuote | CryptoQuote)[]>([])
  const [selectedAsset, setSelectedAsset] = useState<StockQuote | CryptoQuote | null>(null)
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState("7d")

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase])

  useEffect(() => {
    const fetchWatchlistData = async () => {
      if (!watchlist.length) {
        setAssets([])
        setLoading(false)
        return
      }

      try {
        const assetPromises = watchlist.map(async (item) => {
          if (item.type === 'stock') {
            return getStockQuote(item.symbol)
          } else {
            const cryptos = await getTopCryptos()
            return cryptos.find(c => c.symbol === item.symbol)
          }
        })

        const results = await Promise.all(assetPromises)
        const filteredResults = results.filter(Boolean) as (StockQuote | CryptoQuote)[]
        setAssets(filteredResults)

        if (filteredResults.length > 0 && !selectedAsset) {
          setSelectedAsset(filteredResults[0])
          const history = await (filteredResults[0].type === 'stock' 
            ? getStockHistory(filteredResults[0].symbol)
            : getCryptoHistory(filteredResults[0].symbol, 7))
          setChartData(history)
        }
      } catch (error) {
        console.error('Error fetching watchlist data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchWatchlistData()
      const interval = setInterval(fetchWatchlistData, 30000)
      return () => clearInterval(interval)
    }
  }, [user, watchlist, selectedAsset])

  const handleAssetSelect = async (asset: StockQuote | CryptoQuote) => {
    setSelectedAsset(asset)
    try {
      const history = asset.type === 'stock'
        ? await getStockHistory(asset.symbol)
        : await getCryptoHistory(asset.symbol, timeframe === '24h' ? 1 : timeframe === '7d' ? 7 : 30)
      setChartData(history)
    } catch (error) {
      console.error('Error fetching asset history:', error)
    }
  }

  const handleTimeframeChange = async (value: string) => {
    setTimeframe(value)
    if (selectedAsset && selectedAsset.type === 'crypto') {
      try {
        const days = value === '24h' ? 1 : value === '7d' ? 7 : 30
        const history = await getCryptoHistory(selectedAsset.symbol, days)
        setChartData(history)
      } catch (error) {
        console.error('Error fetching crypto history:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Your Watchlist</h1>
            <p className="text-zinc-400 mt-1">Track your favorite stocks and cryptocurrencies</p>
          </div>
        </div>

        {assets.length === 0 ? (
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-12 text-center">
              <Star className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Your watchlist is empty</h3>
              <p className="text-zinc-400">Add stocks and cryptocurrencies to your watchlist to track them here.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Chart Section */}
            {selectedAsset && (
              <Card className="bg-zinc-900/50 border-zinc-800 mb-8">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-white">
                      {selectedAsset.name} ({selectedAsset.symbol})
                    </CardTitle>
                    <p className="text-zinc-400 text-sm mt-1">
                      ${selectedAsset.price.toLocaleString()} 
                      <span className={`ml-2 ${
                        selectedAsset.type === 'stock'
                          ? selectedAsset.change >= 0 ? 'text-green-400' : 'text-red-400'
                          : selectedAsset.priceChange24h > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {selectedAsset.type === 'stock'
                          ? `${selectedAsset.change >= 0 ? '+' : ''}${selectedAsset.changePercent.toFixed(2)}%`
                          : `${selectedAsset.priceChange24h > 0 ? '+' : ''}${selectedAsset.priceChange24h.toFixed(2)}%`
                        }
                      </span>
                    </p>
                  </div>
                  {selectedAsset.type === 'crypto' && (
                    <Select value={timeframe} onValueChange={handleTimeframeChange}>
                      <SelectTrigger className="w-24 text-white bg-zinc-800 border-zinc-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                        <SelectItem value="24h">24H</SelectItem>
                        <SelectItem value="7d">7D</SelectItem>
                        <SelectItem value="30d">30D</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <XAxis 
                          dataKey={selectedAsset.type === 'stock' ? 'date' : 'timestamp'}
                          stroke="#71717a"
                          fontSize={12}
                          tickFormatter={(value) => new Date(value).toLocaleDateString()}
                        />
                        <YAxis 
                          stroke="#71717a"
                          fontSize={12}
                          tickFormatter={(value) => new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            notation: 'compact',
                          }).format(value)}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#18181b',
                            border: '1px solid #27272a',
                            borderRadius: '6px',
                          }}
                          labelStyle={{ color: '#ffffff' }}
                          formatter={(value: number) => [
                            new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                            }).format(value),
                            'Price'
                          ]}
                          labelFormatter={(value) => new Date(value).toLocaleString()}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="price" 
                          stroke="#22c55e" 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Asset List */}
            <div className="grid grid-cols-1 gap-4">
              {assets.map((asset) => (
                <motion.div
                  key={`${asset.type}-${asset.symbol}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card 
                    className={`bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900/70 transition-colors cursor-pointer ${
                      selectedAsset?.symbol === asset.symbol ? 'ring-1 ring-zinc-700' : ''
                    }`}
                    onClick={() => handleAssetSelect(asset)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                            {asset.type === 'crypto' ? (
                              asset.symbol === 'BTC' ? (
                                <Bitcoin className="h-5 w-5 text-zinc-400" />
                              ) : (
                                <Coins className="h-5 w-5 text-zinc-400" />
                              )
                            ) : (
                              <DollarSign className="h-5 w-5 text-zinc-400" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-white">{asset.name}</h4>
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-zinc-400">{asset.symbol}</p>
                              <span className="text-xs text-zinc-500">•</span>
                              <p className="text-sm text-zinc-400">
                                Vol: {new Intl.NumberFormat('en-US', {
                                  notation: 'compact',
                                  maximumFractionDigits: 1
                                }).format(asset.type === 'crypto' ? asset.volume24h : asset.volume)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium text-white">
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                              }).format(asset.price)}
                            </p>
                            <p className={`text-sm font-medium ${
                              asset.type === 'stock'
                                ? asset.change >= 0 ? 'text-green-400' : 'text-red-400'
                                : asset.priceChange24h > 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {asset.type === 'stock'
                                ? `${asset.change >= 0 ? '+' : ''}${asset.changePercent.toFixed(2)}%`
                                : `${asset.priceChange24h > 0 ? '+' : ''}${asset.priceChange24h.toFixed(2)}%`
                              }
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-zinc-400 hover:text-red-400"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeFromWatchlist(asset.symbol)
                            }}
                          >
                            <StarOff className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
} 