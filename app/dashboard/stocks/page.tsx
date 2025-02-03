"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getStockQuote, getStockHistory, searchStocks } from "@/lib/api"
import type { StockQuote } from "@/lib/api"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Star, StarOff, Search } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Activity, BarChart, TrendingUp, TrendingDown, DollarSign } from "lucide-react"

export default function StocksDashboard() {
  const [stocks, setStocks] = useState<StockQuote[]>([])
  const [selectedStock, setSelectedStock] = useState<StockQuote | null>(null)
  const [chartData, setChartData] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState("1mo")

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        // Get popular stock symbols
        const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META']
        const promises = symbols.map(symbol => getStockQuote(symbol))
        const data = await Promise.all(promises)
        setStocks(data)
        if (data.length > 0) {
          setSelectedStock(data[0])
          const history = await getStockHistory(data[0].symbol)
          setChartData(history)
        }
      } catch (error) {
        console.error('Error fetching stocks:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStocks()
    const interval = setInterval(fetchStocks, 60000) // Update every minute during market hours
    return () => clearInterval(interval)
  }, [])

  const handleStockSelect = async (stock: StockQuote) => {
    setSelectedStock(stock)
    try {
      const history = await getStockHistory(stock.symbol)
      setChartData(history)
    } catch (error) {
      console.error('Error fetching stock history:', error)
    }
  }

  const handleSearch = async (query: string) => {
    if (!query) return
    try {
      const results = await searchStocks(query)
      setStocks(results)
    } catch (error) {
      console.error('Error searching stocks:', error)
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) handleSearch(searchQuery)
    }, 300)
    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

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
            <h1 className="text-2xl font-bold tracking-tight text-white">Stock Market</h1>
            <p className="text-zinc-400 mt-1">Real-time stock prices and market data</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search stocks..."
              className="pl-8 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500 w-full focus:ring-1 focus:ring-zinc-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Chart Section */}
        {selectedStock && (
          <Card className="bg-zinc-900/50 border-zinc-800 mb-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">{selectedStock.name} ({selectedStock.symbol})</CardTitle>
                <p className="text-zinc-400 text-sm mt-1">
                  ${selectedStock.price.toLocaleString()} 
                  <span className={`ml-2 ${selectedStock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {selectedStock.change >= 0 ? '+' : ''}{selectedStock.changePercent.toFixed(2)}%
                  </span>
                </p>
              </div>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-24 text-white bg-zinc-800 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  <SelectItem value="1d">1D</SelectItem>
                  <SelectItem value="1mo">1M</SelectItem>
                  <SelectItem value="3mo">3M</SelectItem>
                  <SelectItem value="1y">1Y</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis 
                      dataKey="date" 
                      stroke="#71717a"
                      fontSize={12}
                      tickFormatter={(date) => new Date(date).toLocaleDateString()}
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
                      labelFormatter={(date) => new Date(date).toLocaleString()}
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

        {/* Stock List */}
        <div className="grid grid-cols-1 gap-4">
          {stocks.map((stock) => (
            <motion.div
              key={stock.symbol}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card 
                className={`bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900/70 transition-colors cursor-pointer ${
                  selectedStock?.symbol === stock.symbol ? 'ring-1 ring-zinc-700' : ''
                }`}
                onClick={() => handleStockSelect(stock)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-zinc-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{stock.name}</h4>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-zinc-400">{stock.symbol}</p>
                          <span className="text-xs text-zinc-500">•</span>
                          <p className="text-sm text-zinc-400">
                            Vol: {new Intl.NumberFormat('en-US', {
                              notation: 'compact',
                              maximumFractionDigits: 1
                            }).format(stock.volume)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-white">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                        }).format(stock.price)}
                      </p>
                      <p className={`text-sm font-medium ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
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