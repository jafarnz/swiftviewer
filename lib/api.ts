// API Keys should be in your .env.local file
const ALPHA_VANTAGE_API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY
const RAPIDAPI_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY
const RAPIDAPI_HOST = process.env.NEXT_PUBLIC_RAPIDAPI_HOST
const POLYGON_API_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY

export type StockQuote = {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap?: number
  companyName?: string
}

export type CryptoQuote = {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  total_volume: number
  image: string
  sparkline_in_7d?: { price: number[] }
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
      price: quote.c,
      change: change,
      changePercent: changePercent,
      volume: quote.v
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
  const response = await fetch(
    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=true'
  )
  return await response.json()
}

// Fetch crypto historical data with more options
export async function getCryptoHistory(id: string, days: number = 1) {
  const response = await fetch(
    `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}&interval=${days <= 1 ? 'minute' : 'hourly'}`
  )
  const data = await response.json()
  return data.prices.map(([timestamp, price]: [number, number]) => ({
    timestamp: new Date(timestamp).toISOString(),
    price
  }))
}

// Search cryptocurrencies
export async function searchCryptos(query: string) {
  const response = await fetch(
    `https://api.coingecko.com/api/v3/search?query=${query}`
  )
  const data = await response.json()
  return data.coins.map((coin: any) => ({
    id: coin.id,
    symbol: coin.symbol.toUpperCase(),
    name: coin.name,
    image: coin.large,
    market_cap_rank: coin.market_cap_rank
  }))
}

// Get detailed crypto info
export async function getCryptoDetails(id: string) {
  const response = await fetch(
    `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false`
  )
  return await response.json()
} 