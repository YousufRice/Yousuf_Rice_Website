"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { AdminUser } from "./types"

interface AdminContextType {
  admin: AdminUser | null
  isAuthenticated: boolean
  login: (admin: AdminUser) => void
  logout: () => void
}

const AdminContext = createContext<AdminContextType | null>(null)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check for stored admin session
    const storedAdmin = localStorage.getItem("yousuf-rice-admin")
    if (storedAdmin) {
      try {
        const adminData = JSON.parse(storedAdmin)
        setAdmin(adminData)
        setIsAuthenticated(true)
      } catch (error) {
        console.error("Error parsing stored admin data:", error)
        localStorage.removeItem("yousuf-rice-admin")
      }
    }
  }, [])

  const login = (adminUser: AdminUser) => {
    setAdmin(adminUser)
    setIsAuthenticated(true)
    localStorage.setItem("yousuf-rice-admin", JSON.stringify(adminUser))
  }

  const logout = () => {
    setAdmin(null)
    setIsAuthenticated(false)
    localStorage.removeItem("yousuf-rice-admin")
  }

  return <AdminContext.Provider value={{ admin, isAuthenticated, login, logout }}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider")
  }
  return context
}
