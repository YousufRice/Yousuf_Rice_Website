"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { AdminProvider, useAdmin } from "@/lib/admin-context"

function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated } = useAdmin()

  useEffect(() => {
    if (!isAuthenticated && pathname !== "/admin") {
      router.push("/admin")
    }
  }, [isAuthenticated, pathname, router])

  return <>{children}</>
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <AdminGuard>{children}</AdminGuard>
    </AdminProvider>
  )
}
