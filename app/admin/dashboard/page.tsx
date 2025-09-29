"use client"

import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { DashboardStats } from "@/components/dashboard-stats"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AdminService } from "@/lib/admin-service"
import type { Order } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"

export default function AdminDashboard() {
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        const orders = await AdminService.getRecentOrders(5)
        setRecentOrders(orders)
      } catch (error) {
        console.error("Error fetching recent orders:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentOrders()
  }, [])

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "preparing":
        return "bg-purple-100 text-purple-800"
      case "out_for_delivery":
        return "bg-orange-100 text-orange-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to Yousuf Rice admin panel</p>
        </div>

        {/* Stats */}
        <DashboardStats />

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No recent orders found</p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.$id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-medium">{order.customer_name}</h3>
                        <Badge className={getStatusColor(order.status)}>{order.status.replace("_", " ")}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                      <p className="text-sm text-muted-foreground">{order.customer_area}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{order.total_amount}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.created_at
                          ? formatDistanceToNow(new Date(order.created_at), { addSuffix: true })
                          : "Unknown"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
