import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-6">
        <nav className="flex justify-between items-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-2xl font-bold">MarketView</h1>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link href="/signin">
              <Button variant="ghost" className="mr-4">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </motion.div>
        </nav>
      </header>

      <main className="flex-grow flex items-center justify-center px-4">
        <div className="text-center">
          <motion.h2
            className="text-4xl md:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Track Crypto & Stocks in One Place
          </motion.h2>
          <motion.p
            className="text-xl mb-8 text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Real-time data, powerful analytics, and a seamless experience.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link href="/signup">
              <Button size="lg" className="mr-4">
                Get Started
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline">
                View Demo
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>

      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-accent/10 rounded-3xl blur-3xl animate-pulse-slow"></div>
      </motion.div>

      <motion.div
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-8"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.8 }}
      >
        <img
          src="/dashboard-preview.png"
          alt="Dashboard Preview"
          className="w-[1000px] rounded-t-2xl shadow-2xl animate-float"
        />
      </motion.div>
    </div>
  )
}

