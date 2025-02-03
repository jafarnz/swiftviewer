"use client"

import { useState } from "react"
import { LandingPage } from "@/components/LandingPage"
import { SignUp } from "@/components/SignUp"
import { SignIn } from "@/components/SignIn"
import { Watchlist } from "@/components/Watchlist"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Page() {
  const [currentPage, setCurrentPage] = useState("landing")

  const renderPage = () => {
    switch (currentPage) {
      case "landing":
        return (
          <div className="min-h-screen bg-black text-white">
            {/* Navigation */}
            <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-white"
                >
                  <path
                    d="M8 4L24 16L8 28V4Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M24 4L24 28"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-xl font-bold">SwiftViewer</span>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/signin">
                  <Button variant="ghost" className="text-white hover:text-white/80">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-white text-black hover:bg-white/90">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </nav>

            {/* Hero Section */}
            <div className="container mx-auto px-4 pt-20 pb-32 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto space-y-8"
              >
                <Link
                  href="/updates"
                  className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 text-sm text-white/80 hover:bg-white/20 transition-colors"
                >
                  October Product Updates →
                </Link>

                <div className="space-y-4">
                  <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight">
                    Track Markets.
                    <br />
                    Analyze Trends.
                    <br />
                    Make Decisions.
                  </h1>
                  <p className="text-xl text-gray-400">
                    Your all-in-one platform for tracking US stocks and crypto markets
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/signup">
                    <Button size="lg" className="bg-white text-black hover:bg-white/90">
                      Try it for free
                    </Button>
                  </Link>
                  <Link href="/demo">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      View live demo
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        )
      case "signup":
        return <SignUp />
      case "signin":
        return <SignIn />
      case "watchlist":
        return <Watchlist />
      default:
        return <LandingPage />
    }
  }

  return <div className="min-h-screen bg-background text-foreground">{renderPage()}</div>
}

