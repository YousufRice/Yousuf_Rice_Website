"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminLogin } from "@/components/admin-login"
import { useAdmin } from "@/lib/admin-context"

export default function AdminPage() {
  const router = useRouter()
  const { isAuthenticated } = useAdmin()

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/admin/dashboard")
    }
  }, [isAuthenticated, router])

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return <AdminLogin />
}
