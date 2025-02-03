"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useWatchlist } from "@/hooks/useWatchlist"
import { getStockQuote, getStockHistory, getTopCryptos, getCryptoHistory, searchStocks, searchCryptos } from "@/lib/api"
import type { StockQuote, CryptoQuote } from "@/lib/api"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Star, StarOff, Search } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function Dashboard() {
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<any>(null)
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlist(user?.id)
  const [stockQuotes, setStockQuotes] = useState<StockQuote[]>([])
  const [cryptoQuotes, setCryptoQuotes] = useState<CryptoQuote[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [chartData, setChartData] = useState<any[]>([])
  const [selectedSymbol, setSelectedSymbol] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchType, setSearchType] = useState<'stocks' | 'crypto'>('stocks')

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase])

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch top cryptos
        const cryptos = await getTopCryptos()
        setCryptoQuotes(cryptos)

        // Fetch watchlist stocks
        if (watchlist.length > 0) {
          const stockPromises = watchlist
            .filter(item => item.type === 'stock')
            .map(item => getStockQuote(item.symbol))
          const stocks = await Promise.all(stockPromises)
          setStockQuotes(stocks)
        }
      } catch (error) {
        console.error('Error fetching initial data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [watchlist])

  const handleSearch = async (query: string) => {
    if (!query) {
      setSearchResults([])
      return
    }

    try {
      const results = searchType === 'stocks' 
        ? await searchStocks(query)
        : await searchCryptos(query)
      setSearchResults(results)
    } catch (error) {
      console.error('Error searching:', error)
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch(searchQuery)
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery, searchType])

  const handleSymbolSelect = async (symbol: string, type: 'stock' | 'crypto') => {
    setSelectedSymbol(symbol)
    try {
      const data = type === 'stock' 
        ? await getStockHistory(symbol)
        : await getCryptoHistory(symbol, 1)
      setChartData(data)
    } catch (error) {
      console.error('Error fetching chart data:', error)
    }
  }

  const isInWatchlist = (symbol: string) => {
    return watchlist.some(item => item.symbol === symbol)
  }

  const toggleWatchlist = async (symbol: string, type: 'stock' | 'crypto') => {
    try {
      if (isInWatchlist(symbol)) {
        await removeFromWatchlist(symbol)
      } else {
        await addToWatchlist(symbol, type)
      }
    } catch (error) {
      console.error('Error updating watchlist:', error)
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-4 pt-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6 space-y-4">
          <div className="flex gap-4">
            <Input
              type="text"
              placeholder={`Search ${searchType}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <Select
              value={searchType}
              onValueChange={(value: 'stocks' | 'crypto') => setSearchType(value)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Search type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stocks">Stocks</SelectItem>
                <SelectItem value="crypto">Crypto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {searchResults.length > 0 && (
            <Card className="absolute z-10 w-full max-w-sm">
              <CardContent className="p-2">
                {searchResults.map((result) => (
                  <Button
                    key={result.symbol}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      handleSymbolSelect(
                        searchType === 'stocks' ? result.symbol : result.id,
                        searchType === 'stocks' ? 'stock' : 'crypto'
                      )
                      setSearchQuery('')
                      setSearchResults([])
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {searchType === 'crypto' && result.image && (
                        <img src={result.image} alt={result.name} className="w-6 h-6" />
                      )}
                      <div>
                        <div className="font-medium">{result.symbol}</div>
                        <div className="text-sm text-gray-500">{result.name}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <Tabs defaultValue="stocks" className="space-y-4">
          <TabsList>
            <TabsTrigger value="stocks">US Stocks</TabsTrigger>
            <TabsTrigger value="crypto">Crypto</TabsTrigger>
          </TabsList>

          <TabsContent value="stocks" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {stockQuotes.map((quote) => (
                <Card key={quote.symbol} className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => handleSymbolSelect(quote.symbol, 'stock')}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle className="text-sm font-medium">{quote.symbol}</CardTitle>
                      {quote.companyName && (
                        <div className="text-xs text-gray-500">{quote.companyName}</div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleWatchlist(quote.symbol, 'stock')
                      }}
                    >
                      {isInWatchlist(quote.symbol) ? <Star className="h-4 w-4" /> : <StarOff className="h-4 w-4" />}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${quote.price.toFixed(2)}</div>
                    <div className={quote.change >= 0 ? "text-green-500" : "text-red-500"}>
                      {quote.changePercent.toFixed(2)}%
                    </div>
                    <div className="text-sm text-gray-500">
                      Vol: {(quote.volume / 1000000).toFixed(2)}M
                    </div>
                    <div className="h-[80px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <Line
                            type="monotone"
                            dataKey="price"
                            stroke={quote.change >= 0 ? "#22c55e" : "#ef4444"}
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="crypto" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {cryptoQuotes.map((crypto) => (
                <Card key={crypto.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => handleSymbolSelect(crypto.id, 'crypto')}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-2">
                      <img src={crypto.image} alt={crypto.name} className="w-6 h-6" />
                      <CardTitle className="text-sm font-medium">{crypto.symbol.toUpperCase()}</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleWatchlist(crypto.symbol, 'crypto')
                      }}
                    >
                      {isInWatchlist(crypto.symbol) ? <Star className="h-4 w-4" /> : <StarOff className="h-4 w-4" />}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${crypto.current_price.toFixed(2)}</div>
                    <div className={crypto.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500"}>
                      {crypto.price_change_percentage_24h.toFixed(2)}%
                    </div>
                    <div className="text-sm text-gray-500">
                      Vol: ${(crypto.total_volume / 1000000).toFixed(2)}M
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {selectedSymbol && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Price Chart - {selectedSymbol}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="price" stroke="#2563eb" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  )
}

