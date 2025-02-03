"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "./providers"
import type React from "react" // Added import for React

const publicPaths = ["/", "/signin", "/signup"]

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated && !publicPaths.includes(pathname)) {
      router.push("/signin")
    }
  }, [isAuthenticated, pathname, router])

  return <>{children}</>
}

