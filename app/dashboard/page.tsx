"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Area } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useWatchlist } from "@/hooks/useWatchlist"
import { getStockQuote, getStockHistory, getTopCryptos, getCryptoHistory, searchStocks, searchCryptos, getMarketStats } from "@/lib/api"
import type { StockQuote, CryptoQuote, MarketStats } from "@/lib/api"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Star, StarOff, Search, Bitcoin } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Activity, BarChart, TrendingUp, TrendingDown, DollarSign, Percent, Globe2, Coins } from "lucide-react"
import Link from "next/link"
import supabaseClient from '@/lib/supabase-client'

interface ChartDataPoint {
  timestamp: number;
  price: number;
  volume: number;
  marketCap: number;
  priceChangePercent: number;
  marketCapChangePercent: number;
  priceChange1h: number;
  volumeChange1h: number;
}

function generateMockBitcoinData(timeframeValue = "7d"): ChartDataPoint[] {
  const basePrice = 43500;
  const baseMarketCap = basePrice * 19500000;
  const baseVolume = 750000000;
  const volatility = 0.02;
  
  const timeframes = {
    "24h": { points: 24, range: 24 * 60 * 60 * 1000 },
    "7d": { points: 168, range: 7 * 24 * 60 * 60 * 1000 },
    "30d": { points: 720, range: 30 * 24 * 60 * 60 * 1000 }
  };
  
  const { points, range } = timeframes[timeframeValue as keyof typeof timeframes];
  const endTime = new Date().getTime();
  const startTime = endTime - range;
  const interval = range / (points - 1);
  
  const data: ChartDataPoint[] = [];
  let currentPrice = basePrice;
  let trend = Math.random() > 0.5 ? 1 : -1;
  
  for (let i = 0; i < points; i++) {
    if (Math.random() < 0.1) trend *= -1;
    
    const timestamp = startTime + (i * interval);
    const randomWalk = (Math.random() * 2 - 1) * trend * 0.3;
    const priceChange = currentPrice * volatility * randomWalk;
    currentPrice += priceChange;
    
    currentPrice = Math.max(basePrice * 0.7, Math.min(basePrice * 1.3, currentPrice));
    
    const volume = baseVolume * (1 + Math.random() * 0.4 - 0.2);
    const marketCap = currentPrice * 19500000;
    
    data.push({
      timestamp,
      price: currentPrice,
      volume,
      marketCap,
      priceChangePercent: ((currentPrice - basePrice) / basePrice) * 100,
      marketCapChangePercent: ((marketCap - baseMarketCap) / baseMarketCap) * 100,
      priceChange1h: i > 0 ? ((currentPrice - data[i-1]?.price) / (data[i-1]?.price || currentPrice)) * 100 : 0,
      volumeChange1h: i > 0 ? ((volume - (data[i-1]?.volume || volume)) / (data[i-1]?.volume || volume)) * 100 : 0,
    });
  }

  return data;
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlist(user?.id)
  const [marketStats, setMarketStats] = useState<MarketStats | null>(null)
  const [topCryptos, setTopCryptos] = useState<CryptoQuote[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [timeframe, setTimeframe] = useState("7d")

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabaseClient.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        // Fetch market stats
        const stats = await getMarketStats()
        setMarketStats(stats)

        // Fetch top cryptos
        const cryptos = await getTopCryptos()
        setTopCryptos(cryptos)

        // Use mock chart data instead of API call
        setChartData(generateMockBitcoinData(timeframe))
      } catch (error) {
        console.error('Error fetching market data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMarketData()
    const interval = setInterval(fetchMarketData, 30000)
    return () => clearInterval(interval)
  }, [timeframe])

  const handleSearch = async (query: string) => {
    if (!query) {
      setSearchResults([])
      return
    }

    try {
      const cryptoResults = await searchCryptos(query)
      setSearchResults(cryptoResults)
    } catch (error) {
      console.error('Error searching:', error)
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch(searchQuery)
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  if (loading || !marketStats) {
    return (
      <div className="min-h-screen bg-black text-white pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8">
          <Link href="/dashboard/crypto" className="flex-1">
            <Button 
              variant="outline" 
              className="w-full h-auto bg-zinc-900/50 text-white border-zinc-800 hover:bg-zinc-800/80 hover:border-zinc-700 transition-all"
            >
              <div className="flex flex-col items-center gap-2 py-4">
                <Coins className="h-6 w-6" />
                <span>Crypto</span>
              </div>
            </Button>
          </Link>
          <Link href="/dashboard/stocks" className="flex-1">
            <Button 
              variant="outline" 
              className="w-full h-auto bg-zinc-900/50 text-white border-zinc-800 hover:bg-zinc-800/80 hover:border-zinc-700 transition-all"
            >
              <div className="flex flex-col items-center gap-2 py-4">
                <BarChart className="h-6 w-6" />
                <span>Stocks</span>
              </div>
            </Button>
          </Link>
          <Link href="/dashboard/watchlist" className="flex-1">
            <Button 
              variant="outline" 
              className="w-full h-auto bg-zinc-900/50 text-white border-zinc-800 hover:bg-zinc-800/80 hover:border-zinc-700 transition-all"
            >
              <div className="flex flex-col items-center gap-2 py-4">
                <Star className="h-6 w-6" />
                <span>Watchlist</span>
              </div>
            </Button>
          </Link>
        </div>

        {/* Market Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { 
              title: "Total Market Cap", 
              value: new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: 'USD',
                notation: 'compact',
                maximumFractionDigits: 1
              }).format(marketStats.totalMarketCap),
              change: marketStats.marketCapChange24h.toFixed(2) + '%',
              icon: DollarSign,
              positive: marketStats.marketCapChange24h > 0
            },
            { 
              title: "24h Volume", 
              value: new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: 'USD',
                notation: 'compact',
                maximumFractionDigits: 1
              }).format(marketStats.total24hVolume),
              change: marketStats.volumeChange24h.toFixed(2) + '%',
              icon: BarChart,
              positive: marketStats.volumeChange24h > 0
            },
            { 
              title: "BTC Dominance", 
              value: marketStats.btcDominance.toFixed(2) + '%',
              change: marketStats.btcDominanceChange24h.toFixed(2) + '%',
              icon: Percent,
              positive: marketStats.btcDominanceChange24h > 0
            },
            { 
              title: "Active Cryptocurrencies", 
              value: marketStats.activeCryptocurrencies.toLocaleString(),
              change: marketStats.activeMarketsChange24h.toFixed(0),
              icon: Globe2,
              positive: marketStats.activeMarketsChange24h > 0
            },
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm hover:bg-zinc-900/70 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-zinc-400">{item.title}</p>
                      <h3 className="text-2xl font-bold mt-1 tracking-tight text-white">{item.value}</h3>
                      <div className={`flex items-center mt-2 ${item.positive ? 'text-green-400' : 'text-red-400'}`}>
                        {item.positive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                        <span className="text-sm font-medium">{item.change}</span>
                      </div>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-zinc-800/50 flex items-center justify-center">
                      <item.icon className="h-6 w-6 text-zinc-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Chart Section */}
        <Card className="bg-zinc-900/50 border-zinc-800 mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white">Bitcoin Price (7D)</CardTitle>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-lg font-medium text-white">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(chartData[chartData.length - 1]?.price || 0)}
                </p>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${
                    ((chartData[chartData.length - 1]?.price || 0) > (chartData[0]?.price || 0)) 
                      ? 'text-green-400' 
                      : 'text-red-400'
                  }`}>
                    {(((chartData[chartData.length - 1]?.price || 0) / (chartData[0]?.price || 1) - 1) * 100).toFixed(2)}%
                  </span>
                  {chartData[chartData.length - 1]?.priceChange1h && (
                    <span className="text-sm text-zinc-500">
                      1h: <span className={chartData[chartData.length - 1]?.priceChange1h > 0 ? 'text-green-400' : 'text-red-400'}>
                        {chartData[chartData.length - 1]?.priceChange1h > 0 ? '+' : ''}
                        {chartData[chartData.length - 1]?.priceChange1h.toFixed(2)}%
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Select 
              value={timeframe} 
              onValueChange={(value) => {
                setTimeframe(value)
                setChartData(generateMockBitcoinData(value))
              }}
            >
              <SelectTrigger className="w-24 text-white bg-zinc-800 border-zinc-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                <SelectItem value="24h">24H</SelectItem>
                <SelectItem value="7d">7D</SelectItem>
                <SelectItem value="30d">30D</SelectItem>
              </SelectContent>
            </Select>
                </CardHeader>
                <CardContent>
            <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={chartData}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPriceNegative" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="timestamp" 
                    type="number"
                    domain={['dataMin', 'dataMax']}
                    scale="time"
                    stroke="#71717a"
                    fontSize={12}
                    tickFormatter={(timestamp) => {
                      const date = new Date(timestamp)
                      return timeframe === "24h" 
                        ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : date.toLocaleDateString([], { month: 'short', day: 'numeric' })
                    }}
                  />
                  <YAxis 
                    stroke="#71717a"
                    fontSize={12}
                    domain={['auto', 'auto']}
                    tickFormatter={(value) => new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      notation: 'compact',
                      maximumFractionDigits: 1
                    }).format(value)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: '1px solid #27272a',
                      borderRadius: '6px',
                      padding: '12px',
                    }}
                    labelStyle={{ color: '#ffffff', marginBottom: '8px', fontWeight: 500 }}
                    formatter={(value: number, name: string, props: any) => {
                      if (!value || !props?.payload) return ['-', name];
                      const entry = props.payload;
                      
                      if (name === 'price') {
                        return [
                          <div key="price" className="space-y-1">
                            <div className="font-medium">
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                              }).format(value)}
                            </div>
                            <div className={`text-sm ${entry.priceChangePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {entry.priceChangePercent >= 0 ? '+' : ''}
                              {entry.priceChangePercent.toFixed(2)}%
                            </div>
                            {typeof entry.priceChange1h === 'number' && (
                              <div className="text-sm text-zinc-400">
                                1h: <span className={entry.priceChange1h >= 0 ? 'text-green-400' : 'text-red-400'}>
                                  {entry.priceChange1h >= 0 ? '+' : ''}
                                  {entry.priceChange1h.toFixed(2)}%
                                </span>
                              </div>
                            )}
                          </div>,
                          'Price'
                        ];
                      }
                      return [value.toString(), name];
                    }}
                    labelFormatter={(timestamp) => {
                      const date = new Date(timestamp);
                      return timeframe === "24h"
                        ? date.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            second: '2-digit'
                          })
                        : date.toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          });
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="none"
                    fill="url(#colorPrice)"
                    fillOpacity={0.1}
                  />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

        {/* Market Leaders */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Market Leaders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCryptos.slice(0, 5).map((crypto) => (
                <div
                  key={crypto.symbol}
                  className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                      {crypto.symbol === 'BTC' ? (
                        <Bitcoin className="h-5 w-5 text-zinc-400" />
                      ) : (
                        <Coins className="h-5 w-5 text-zinc-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{crypto.name}</h4>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-zinc-400">{crypto.symbol}</p>
                        <span className="text-xs text-zinc-500">•</span>
                        <p className="text-sm text-zinc-400">
                          Vol: {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            notation: 'compact',
                            maximumFractionDigits: 1
                          }).format(crypto.volume24h)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(crypto.price)}
                    </p>
                    <p className={`text-sm font-medium ${crypto.priceChange24h > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {crypto.priceChange24h > 0 ? '+' : ''}{crypto.priceChange24h.toFixed(2)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


