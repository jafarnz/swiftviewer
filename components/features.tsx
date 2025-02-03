import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, BarChart, Clock } from "lucide-react"

export function Features() {
  const features = [
    {
      title: "Real-time Market Data",
      description:
        "Track live cryptocurrency and stock prices with instant updates and comprehensive market data.",
      icon: LineChart,
    },
    {
      title: "Interactive Charts",
      description:
        "Analyze price movements with interactive charts featuring multiple timeframes and technical indicators.",
      icon: BarChart,
    },
    {
      title: "Custom Watchlists",
      description:
        "Create and manage personalized watchlists to track your favorite assets in one place.",
      icon: Clock,
    },
  ]

  return (
    <div className="py-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 text-white">
            Professional Trading Tools
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Access powerful features designed for both beginners and experienced
            traders to make informed investment decisions.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Card key={feature.title} className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <feature.icon className="h-12 w-12 mb-4 text-white" />
                <CardTitle className="text-white">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
} 