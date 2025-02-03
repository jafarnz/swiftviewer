"use client"

import { createContext, useContext, useState } from "react"
import type React from "react"
import { RouteGuard } from "./route-guard"

interface AuthContextType {
  isAuthenticated: boolean
  login: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
})

export function Providers({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const login = () => setIsAuthenticated(true)
  const logout = () => setIsAuthenticated(false)

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      <RouteGuard>{children}</RouteGuard>
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

