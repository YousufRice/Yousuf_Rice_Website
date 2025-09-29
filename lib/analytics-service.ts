import { databases, DATABASE_ID } from "./appwrite"
import { ID, Query } from "appwrite"
import type { AnalyticsEvent, SessionData } from "./types"

const ANALYTICS_EVENTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_ANALYTICS_EVENTS_COLLECTION_ID!
const ANALYTICS_SUMMARY_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_ANALYTICS_SUMMARY_COLLECTION_ID!
const SESSIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_SESSIONS_COLLECTION_ID!

class AnalyticsService {
  private sessionId: string | null = null

  constructor() {
    if (typeof window !== "undefined") {
      this.sessionId = this.getOrCreateSessionId()
    }
  }

  private getOrCreateSessionId(): string {
    let sessionId = localStorage.getItem("analytics_session_id")
    if (!sessionId) {
      sessionId = ID.unique()
      localStorage.setItem("analytics_session_id", sessionId)
      this.createSession(sessionId)
    }
    return sessionId
  }

  private async createSession(sessionId: string) {
    try {
      const sessionData: Omit<SessionData, "$id"> = {
        session_id: sessionId,
        user_agent: navigator.userAgent,
        first_visit: new Date().toISOString(),
        last_activity: new Date().toISOString(),
        page_count: 1,
        is_active: true,
      }

      await databases.createDocument(DATABASE_ID, SESSIONS_COLLECTION_ID, ID.unique(), sessionData)
    } catch (error) {
      console.error("Failed to create session:", error)
    }
  }

  private async updateSession() {
    if (!this.sessionId) return

    try {
      const sessions = await databases.listDocuments(DATABASE_ID, SESSIONS_COLLECTION_ID, [
        Query.equal("session_id", this.sessionId),
      ])

      if (sessions.documents.length > 0) {
        const session = sessions.documents[0]
        await databases.updateDocument(DATABASE_ID, SESSIONS_COLLECTION_ID, session.$id, {
          last_activity: new Date().toISOString(),
          page_count: (session.page_count || 0) + 1,
        })
      }
    } catch (error) {
      console.error("Failed to update session:", error)
    }
  }

  async trackEvent(eventData: Omit<AnalyticsEvent, "$id" | "session_id" | "timestamp">) {
    if (!this.sessionId) return

    try {
      const event: Omit<AnalyticsEvent, "$id"> = {
        ...eventData,
        session_id: this.sessionId,
        timestamp: new Date().toISOString(),
        user_agent: typeof window !== "undefined" ? navigator.userAgent : undefined,
      }

      await databases.createDocument(DATABASE_ID, ANALYTICS_EVENTS_COLLECTION_ID, ID.unique(), event)

      await this.updateSession()
    } catch (error) {
      console.error("Failed to track event:", error)
    }
  }

  async trackPageView(pageUrl: string) {
    await this.trackEvent({
      event_type: "page_view",
      page_url: pageUrl,
    })
  }

  async trackProductView(productId: string, productName: string) {
    await this.trackEvent({
      event_type: "product_view",
      product_id: productId,
      product_name: productName,
    })
  }

  async trackAddToCart(productId: string, productName: string) {
    await this.trackEvent({
      event_type: "add_to_cart",
      product_id: productId,
      product_name: productName,
    })
  }

  async trackOrderPlaced(orderId: string, totalAmount: number) {
    await this.trackEvent({
      event_type: "order_placed",
      metadata: {
        order_id: orderId,
        total_amount: totalAmount,
      },
    })
  }

  async trackSearch(searchQuery: string) {
    await this.trackEvent({
      event_type: "search",
      search_query: searchQuery,
    })
  }

  async trackCategoryFilter(category: string) {
    await this.trackEvent({
      event_type: "category_filter",
      category: category,
    })
  }

  // Admin methods
  async getAnalyticsSummary(startDate: string, endDate: string) {
    try {
      const events = await databases.listDocuments(DATABASE_ID, ANALYTICS_EVENTS_COLLECTION_ID, [
        Query.greaterThanEqual("timestamp", startDate),
        Query.lessThanEqual("timestamp", endDate),
        Query.limit(10000),
      ])

      const summary = this.processEventsSummary(events.documents as AnalyticsEvent[])
      return summary
    } catch (error) {
      console.error("Failed to get analytics summary:", error)
      return null
    }
  }

  private processEventsSummary(events: AnalyticsEvent[]) {
    const pageViews = events.filter((e) => e.event_type === "page_view").length
    const uniqueVisitors = new Set(events.map((e) => e.session_id)).size
    const productViews = events.filter((e) => e.event_type === "product_view").length
    const cartAdditions = events.filter((e) => e.event_type === "add_to_cart").length
    const orders = events.filter((e) => e.event_type === "order_placed")

    const totalRevenue = orders.reduce((sum, order) => {
      return sum + (order.metadata?.total_amount || 0)
    }, 0)

    const productViewEvents = events.filter((e) => e.event_type === "product_view")
    const productCounts = productViewEvents.reduce(
      (acc, event) => {
        if (event.product_name) {
          acc[event.product_name] = (acc[event.product_name] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>,
    )

    const topProducts = Object.entries(productCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name]) => name)

    const categoryEvents = events.filter((e) => e.event_type === "category_filter")
    const categoryCounts = categoryEvents.reduce(
      (acc, event) => {
        if (event.category) {
          acc[event.category] = (acc[event.category] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>,
    )

    const topCategories = Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name]) => name)

    return {
      total_page_views: pageViews,
      unique_visitors: uniqueVisitors,
      total_product_views: productViews,
      total_cart_additions: cartAdditions,
      total_orders: orders.length,
      total_revenue: totalRevenue,
      top_products: topProducts,
      top_categories: topCategories,
    }
  }

  async getRecentEvents(limit = 50) {
    try {
      const events = await databases.listDocuments(DATABASE_ID, ANALYTICS_EVENTS_COLLECTION_ID, [
        Query.orderDesc("timestamp"),
        Query.limit(limit),
      ])
      return events.documents as AnalyticsEvent[]
    } catch (error) {
      console.error("Failed to get recent events:", error)
      return []
    }
  }
}

export const analyticsService = new AnalyticsService()
