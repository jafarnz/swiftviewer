import { useState } from "react"
import { motion } from "framer-motion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"

type Asset = {
  id: string
  name: string
  symbol: string
  price: number
  change: number
}

const mockAssets: Asset[] = [
  { id: "1", name: "Bitcoin", symbol: "BTC", price: 50000, change: 2.5 },
  { id: "2", name: "Ethereum", symbol: "ETH", price: 3000, change: -1.2 },
  { id: "3", name: "Apple Inc.", symbol: "AAPL", price: 150, change: 0.8 },
  { id: "4", name: "Tesla Inc.", symbol: "TSLA", price: 700, change: -0.5 },
]

export function Watchlist() {
  const [assets, setAssets] = useState<Asset[]>(mockAssets)
  const [search, setSearch] = useState("")

  const filteredAssets = assets.filter(
    (asset) =>
      asset.name.toLowerCase().includes(search.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h2 className="text-2xl font-bold mb-4">Watchlist</h2>
        <Input
          type="text"
          placeholder="Search assets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4"
        />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>24h Change</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssets.map((asset) => (
              <TableRow key={asset.id}>
                <TableCell>{asset.name}</TableCell>
                <TableCell>{asset.symbol}</TableCell>
                <TableCell>${asset.price.toLocaleString()}</TableCell>
                <TableCell className={asset.change >= 0 ? "text-green-500" : "text-red-500"}>
                  {asset.change > 0 ? "+" : ""}
                  {asset.change}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  )
}

