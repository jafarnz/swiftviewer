"use client"

import { useEffect } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { LineChart, BarChart, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  const { scrollYProgress } = useScroll()
  
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -50])

  return (
    <main className="min-h-screen bg-black">
      {/* Hero Section */}
      <motion.div 
        className="relative min-h-screen flex items-center bg-black"
        style={{ opacity, scale, y }}
      >
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="lg:w-2/3">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-6xl font-bold text-white mb-6"
            >
              Professional Financial Analytics
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-gray-400 mb-8"
            >
              Track cryptocurrencies and stocks with real-time data and interactive
              charts. Make informed decisions with our comprehensive financial
              dashboard.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex gap-4"
            >
              <Link href="/signup" className="contents">
                <Button 
                  size="lg" 
                  className="bg-white text-black hover:bg-gray-100 text-lg"
                >
                  Get Started
                </Button>
              </Link>
              <Link href="/signin" className="contents">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-white border-white hover:bg-white/10 text-lg"
                >
                  Sign In
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
        <motion.div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            opacity: useTransform(scrollYProgress, [0, 0.5], [0.2, 0]),
            scale: useTransform(scrollYProgress, [0, 1], [1, 0.9]),
            rotateZ: useTransform(scrollYProgress, [0, 1], [12, 8])
          }}
        >
          <div 
            className="w-[900px] h-[600px] transform translate-x-32 translate-y-[-50px]"
            style={{
              backgroundImage: 'url("/dashboard-preview.png")',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
            }}
          />
        </motion.div>
      </motion.div>

      {/* Features Section */}
      <motion.div 
        className="py-24 bg-black"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
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
            {[
              {
                title: "Real-time Market Data",
                description: "Track live cryptocurrency and stock prices with instant updates and comprehensive market data.",
                icon: LineChart,
              },
              {
                title: "Interactive Charts",
                description: "Analyze price movements with interactive charts featuring multiple timeframes and technical indicators.",
                icon: BarChart,
              },
              {
                title: "Custom Watchlists",
                description: "Create and manage personalized watchlists to track your favorite assets in one place.",
                icon: Clock,
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                  <CardHeader>
                    <feature.icon className="h-12 w-12 mb-4 text-white" />
                    <CardTitle className="text-white">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </main>
  )
}

