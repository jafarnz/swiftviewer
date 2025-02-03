// API Keys should be in your .env.local file
const ALPHA_VANTAGE_API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY
const RAPIDAPI_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY
const RAPIDAPI_HOST = process.env.NEXT_PUBLIC_RAPIDAPI_HOST
const POLYGON_API_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY

export interface MarketStats {
  totalMarketCap: number
  total24hVolume: number
  btcDominance: number
  activeCryptocurrencies: number
  marketCapChange24h: number
  volumeChange24h: number
  btcDominanceChange24h: number
  activeMarketsChange24h: number
}

export interface CryptoQuote {
  symbol: string
  name: string
  price: number
  volume24h: number
  priceChange24h: number
  type: 'crypto'
}

export interface StockQuote {
  symbol: string
  name: string
  price: number
  volume: number
  change: number
  changePercent: number
  type: 'stock'
}

// Rate limit helper for Polygon API (5 calls per minute)
const rateLimitDelay = () => new Promise(resolve => setTimeout(resolve, 12000)); // 12 seconds delay

// Fetch stock quote data using Polygon
export async function getStockQuote(symbol: string): Promise<StockQuote> {
  const response = await fetch(
    `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?adjusted=true&apiKey=${POLYGON_API_KEY}`
  )
  const data = await response.json()
  
  if (data.results && data.results[0]) {
    const quote = data.results[0]
    const prevClose = quote.c
    const change = quote.c - quote.o
    const changePercent = (change / quote.o) * 100

    return {
      symbol: symbol,
      name: quote.T,
      price: quote.c,
      volume: quote.v,
      change: change,
      changePercent: changePercent,
      type: 'stock'
    }
  }
  throw new Error('Failed to fetch stock quote')
}

// Fetch stock historical data for charts
export async function getStockHistory(symbol: string, timespan: string = 'minute', multiplier: number = 5, from: string = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], to: string = new Date().toISOString().split('T')[0]) {
  const response = await fetch(
    `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${from}/${to}?adjusted=true&sort=asc&limit=120&apiKey=${POLYGON_API_KEY}`
  )
  const data = await response.json()
  
  if (data.results) {
    return data.results.map((candle: any) => ({
      timestamp: new Date(candle.t).toISOString(),
      price: candle.c
    }))
  }
  return []
}

// Search stocks
export async function searchStocks(query: string) {
  const response = await fetch(
    `https://api.polygon.io/v3/reference/tickers?search=${query}&active=true&sort=ticker&order=asc&limit=10&apiKey=${POLYGON_API_KEY}`
  )
  const data = await response.json()
  
  return data.results?.map((result: any) => ({
    symbol: result.ticker,
    name: result.name,
    type: result.market,
    exchange: result.primary_exchange
  })) || []
}

// Enhanced Crypto API functions using CoinGecko

// Fetch top 50 cryptocurrencies with 7-day sparkline data
export async function getTopCryptos(): Promise<CryptoQuote[]> {
  const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&sparkline=false')
  const data = await response.json()
  
  return data.map((coin: any) => ({
    symbol: coin.symbol.toUpperCase(),
    name: coin.name,
    price: coin.current_price,
    volume24h: coin.total_volume,
    priceChange24h: coin.price_change_percentage_24h,
    type: 'crypto' as const
  }))
}

// Fetch crypto historical data with more options
export async function getCryptoHistory(symbol: string, days: number): Promise<any[]> {
  const response = await fetch(`https://api.coingecko.com/api/v3/coins/${symbol.toLowerCase()}/market_chart?vs_currency=usd&days=${days}`)
  const data = await response.json()
  
  return data.prices.map(([timestamp, price]: [number, number]) => ({
    timestamp,
    price
  }))
}

// Search cryptocurrencies
export async function searchCryptos(query: string): Promise<CryptoQuote[]> {
  const response = await fetch(`https://api.coingecko.com/api/v3/search?query=${query}`)
  const data = await response.json()
  
  const coins = await Promise.all(
    data.coins.slice(0, 10).map(async (coin: any) => {
      const details = await fetch(`https://api.coingecko.com/api/v3/coins/${coin.id}?localization=false&tickers=false&community_data=false&developer_data=false`)
      const coinData = await details.json()
      
      return {
        symbol: coinData.symbol.toUpperCase(),
        name: coinData.name,
        price: coinData.market_data.current_price.usd,
        volume24h: coinData.market_data.total_volume.usd,
        priceChange24h: coinData.market_data.price_change_percentage_24h,
        type: 'crypto' as const
      }
    })
  )
  
  return coins
}

// Get detailed crypto info
export async function getCryptoDetails(id: string) {
  const response = await fetch(
    `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false`
  )
  return await response.json()
}

export async function getMarketStats(): Promise<MarketStats> {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/global')
    const data = await response.json()
    const market = data.data.total_market_cap
    
    return {
      totalMarketCap: market.usd,
      total24hVolume: data.data.total_volume.usd,
      btcDominance: data.data.market_cap_percentage.btc,
      activeCryptocurrencies: data.data.active_cryptocurrencies,
      marketCapChange24h: data.data.market_cap_change_percentage_24h_usd,
      volumeChange24h: ((data.data.total_volume.usd / market.usd) - 1) * 100,
      btcDominanceChange24h: data.data.market_cap_percentage.btc_dominance_24h || 0,
      activeMarketsChange24h: data.data.markets_change_24h || 0
    }
  } catch (error) {
    console.error('Error fetching market stats:', error)
    throw error
  }
} 