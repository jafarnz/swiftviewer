"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers"

export function Navbar() {
  const pathname = usePathname()
  const { isAuthenticated, logout } = useAuth()

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-md"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold">
          SwiftViewer
        </Link>
        <div className="flex items-center gap-6">
          {!isAuthenticated ? (
            <>
              <Link href="/signin">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button>Sign Up</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Button variant="ghost" onClick={logout}>
                Sign Out
              </Button>
            </>
          )}
        </div>
      </nav>
    </motion.header>
  )
}

