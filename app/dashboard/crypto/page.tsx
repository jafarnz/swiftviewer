"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getTopCryptos, getCryptoHistory, searchCryptos } from "@/lib/api"
import type { CryptoQuote } from "@/lib/api"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Star, StarOff, Search, Bitcoin } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Activity, BarChart, TrendingUp, TrendingDown, DollarSign, Percent, Globe2, Coins } from "lucide-react"

export default function CryptoDashboard() {
  const [cryptos, setCryptos] = useState<CryptoQuote[]>([])
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoQuote | null>(null)
  const [chartData, setChartData] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState("7d")

  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        const data = await getTopCryptos()
        setCryptos(data)
        if (data.length > 0) {
          setSelectedCrypto(data[0])
          const history = await getCryptoHistory(data[0].symbol, 7)
          setChartData(history)
        }
      } catch (error) {
        console.error('Error fetching cryptos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCryptos()
    const interval = setInterval(fetchCryptos, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleCryptoSelect = async (crypto: CryptoQuote) => {
    setSelectedCrypto(crypto)
    try {
      const days = timeframe === '24h' ? 1 : timeframe === '7d' ? 7 : 30
      const history = await getCryptoHistory(crypto.symbol, days)
      setChartData(history)
    } catch (error) {
      console.error('Error fetching crypto history:', error)
    }
  }

  const handleTimeframeChange = async (value: string) => {
    setTimeframe(value)
    if (selectedCrypto) {
      try {
        const days = value === '24h' ? 1 : value === '7d' ? 7 : 30
        const history = await getCryptoHistory(selectedCrypto.symbol, days)
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
            <h1 className="text-2xl font-bold tracking-tight text-white">Cryptocurrency Markets</h1>
            <p className="text-zinc-400 mt-1">Real-time cryptocurrency prices and charts</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search cryptocurrencies..."
              className="pl-8 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500 w-full focus:ring-1 focus:ring-zinc-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Chart Section */}
        {selectedCrypto && (
          <Card className="bg-zinc-900/50 border-zinc-800 mb-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">{selectedCrypto.name} ({selectedCrypto.symbol})</CardTitle>
                <p className="text-zinc-400 text-sm mt-1">
                  ${selectedCrypto.price.toLocaleString()} 
                  <span className={`ml-2 ${selectedCrypto.priceChange24h > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {selectedCrypto.priceChange24h > 0 ? '+' : ''}{selectedCrypto.priceChange24h.toFixed(2)}%
                  </span>
                </p>
              </div>
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
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis 
                      dataKey="timestamp" 
                      stroke="#71717a"
                      fontSize={12}
                      tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
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
                      labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
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

        {/* Crypto List */}
        <div className="grid grid-cols-1 gap-4">
          {cryptos.map((crypto) => (
            <motion.div
              key={crypto.symbol}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card 
                className={`bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900/70 transition-colors cursor-pointer ${
                  selectedCrypto?.symbol === crypto.symbol ? 'ring-1 ring-zinc-700' : ''
                }`}
                onClick={() => handleCryptoSelect(crypto)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
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
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
} 