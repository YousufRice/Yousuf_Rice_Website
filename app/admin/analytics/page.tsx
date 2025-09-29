"use client"

import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { analyticsService } from "@/lib/analytics-service"
import type { AnalyticsEvent } from "@/lib/types"
import { BarChart3, Eye, ShoppingCart, Package, TrendingUp, Users, Calendar, Activity } from "lucide-react"
import { formatDistanceToNow, subDays, startOfDay, endOfDay } from "date-fns"

interface AnalyticsSummary {
  total_page_views: number
  unique_visitors: number
  total_product_views: number
  total_cart_additions: number
  total_orders: number
  total_revenue: number
  top_products: string[]
  top_categories: string[]
}

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [recentEvents, setRecentEvents] = useState<AnalyticsEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState("7")

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      try {
        const days = Number.parseInt(dateRange)
        const endDate = endOfDay(new Date()).toISOString()
        const startDate = startOfDay(subDays(new Date(), days)).toISOString()

        const [summaryData, eventsData] = await Promise.all([
          analyticsService.getAnalyticsSummary(startDate, endDate),
          analyticsService.getRecentEvents(50),
        ])

        setSummary(summaryData)
        setRecentEvents(eventsData)
      } catch (error) {
        console.error("Error fetching analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [dateRange])

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "page_view":
        return <Eye className="h-4 w-4" />
      case "product_view":
        return <Package className="h-4 w-4" />
      case "add_to_cart":
        return <ShoppingCart className="h-4 w-4" />
      case "order_placed":
        return <TrendingUp className="h-4 w-4" />
      case "search":
        return <Activity className="h-4 w-4" />
      case "category_filter":
        return <BarChart3 className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case "page_view":
        return "bg-blue-100 text-blue-800"
      case "product_view":
        return "bg-green-100 text-green-800"
      case "add_to_cart":
        return "bg-orange-100 text-orange-800"
      case "order_placed":
        return "bg-purple-100 text-purple-800"
      case "search":
        return "bg-yellow-100 text-yellow-800"
      case "category_filter":
        return "bg-indigo-100 text-indigo-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatEventType = (eventType: string) => {
    return eventType.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Track your website performance and user behavior</p>
          </div>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last 24 hours</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-8 bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-muted-foreground">Page Views</span>
                  </div>
                  <div className="text-2xl font-bold">{summary?.total_page_views || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-muted-foreground">Unique Visitors</span>
                  </div>
                  <div className="text-2xl font-bold">{summary?.unique_visitors || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-muted-foreground">Product Views</span>
                  </div>
                  <div className="text-2xl font-bold">{summary?.total_product_views || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingCart className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-muted-foreground">Cart Additions</span>
                  </div>
                  <div className="text-2xl font-bold">{summary?.total_cart_additions || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-indigo-600" />
                    <span className="text-sm font-medium text-muted-foreground">Orders</span>
                  </div>
                  <div className="text-2xl font-bold">{summary?.total_orders || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-muted-foreground">Revenue</span>
                  </div>
                  <div className="text-2xl font-bold">₹{summary?.total_revenue || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-teal-600" />
                    <span className="text-sm font-medium text-muted-foreground">Conversion Rate</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {summary?.unique_visitors && summary.unique_visitors > 0
                      ? ((summary.total_orders / summary.unique_visitors) * 100).toFixed(1)
                      : 0}
                    %
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium text-muted-foreground">Period</span>
                  </div>
                  <div className="text-lg font-bold">{dateRange === "1" ? "24h" : `${dateRange} days`}</div>
                </CardContent>
              </Card>
            </div>

            {/* Top Products & Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Products</CardTitle>
                </CardHeader>
                <CardContent>
                  {summary?.top_products && summary.top_products.length > 0 ? (
                    <div className="space-y-2">
                      {summary.top_products.map((product, index) => (
                        <div key={product} className="flex items-center justify-between p-2 rounded border">
                          <span className="font-medium">
                            #{index + 1} {product}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No product data available</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  {summary?.top_categories && summary.top_categories.length > 0 ? (
                    <div className="space-y-2">
                      {summary.top_categories.map((category, index) => (
                        <div key={category} className="flex items-center justify-between p-2 rounded border">
                          <span className="font-medium">
                            #{index + 1} {category}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No category data available</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Events */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {recentEvents.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No recent activity found</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {recentEvents.map((event) => (
                      <div key={event.$id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="flex-shrink-0">{getEventIcon(event.event_type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getEventColor(event.event_type)}>
                              {formatEventType(event.event_type)}
                            </Badge>
                            {event.product_name && (
                              <span className="text-sm font-medium truncate">{event.product_name}</span>
                            )}
                            {event.search_query && <span className="text-sm font-medium">"{event.search_query}"</span>}
                            {event.category && <span className="text-sm font-medium">{event.category}</span>}
                          </div>
                          {event.page_url && <p className="text-xs text-muted-foreground truncate">{event.page_url}</p>}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
