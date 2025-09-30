import { databases, DATABASE_ID } from "./appwrite"
import { ID, Query } from "appwrite"
import type { AnalyticsEvents, Sessions } from "@/appwrite"

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
      const Sessions: Omit<Sessions, "$id"> = {
        session_id: sessionId,
        user_agent: navigator.userAgent,
        first_visit: new Date().toISOString(),
        last_activity: new Date().toISOString(),
        page_count: 1,
        is_active: true,
      }

      await databases.createDocument(DATABASE_ID, SESSIONS_COLLECTION_ID, ID.unique(), Sessions)
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

  async trackEvent(eventData: Omit<AnalyticsEvents, "$id" | "session_id" | "timestamp">) {
    if (!this.sessionId) return

    // Guard against missing collection id env var to avoid cryptic errors
    if (!ANALYTICS_EVENTS_COLLECTION_ID) {
      console.warn("[v0] Analytics disabled: NEXT_PUBLIC_APPWRITE_ANALYTICS_EVENTS_COLLECTION_ID is not set.")
      return
    }

    try {
      // Build a payload that is compatible with the currently provisioned minimal table schema:
      // Allowed keys we know exist (from scripts/create-tables.ts and appwrite.d.ts): event_type, user_id, product_id
      // We map sessionId -> user_id, and only include product_id when present.
      const minimalPayload: Record<string, any> = {
        event_type: eventData.event_type,
        user_id: this.sessionId,
      }

      if (eventData.product_id) {
        minimalPayload.product_id = eventData.product_id
      }

      // NOTE:
      // We intentionally DO NOT send fields like page_url, product_name, category, search_query, user_agent,
      // timestamp, or metadata because the current Appwrite table schema does not define those attributes.
      // Sending them would cause "Unknown attribute" errors from Appwrite.

      await databases.createDocument(DATABASE_ID, ANALYTICS_EVENTS_COLLECTION_ID, ID.unique(), minimalPayload)

      await this.updateSession()
    } catch (error) {
      console.error("Failed to track event:", error)
    }
  }

  async trackPageView(pageUrl: string) {
    // Omit page_url to avoid "Unknown attribute: page_url" errors
    await this.trackEvent({
      event_type: "page_view",
      // page_url: pageUrl, // removed for schema compatibility
    } as any)
  }

  async trackProductView(productId: string, productName: string) {
    // Only include allowed fields; product_name omitted
    await this.trackEvent({
      event_type: "product_view",
      product_id: productId,
      // product_name: productName, // omitted for schema compatibility
    } as any)
  }

  async trackAddToCart(productId: string, productName: string) {
    // Only include allowed fields; product_name omitted
    await this.trackEvent({
      event_type: "add_to_cart",
      product_id: productId,
      // product_name: productName, // omitted
    } as any)
  }

  async trackOrderPlaced(orderId: string, totalAmount: number) {
    // Metadata omitted due to schema limitations
    await this.trackEvent({
      event_type: "order_placed",
      // metadata: { order_id: orderId, total_amount: totalAmount }, // omitted
    } as any)
  }

  async trackSearch(searchQuery: string) {
    // Only include allowed fields; search_query omitted
    await this.trackEvent({
      event_type: "search",
      // search_query: searchQuery, // omitted
    } as any)
  }

  async trackCategoryFilter(category: string) {
    // Only include allowed fields; category omitted
    await this.trackEvent({
      event_type: "category_filter",
      // category, // omitted
    } as any)
  }

  // Admin methods
  async getAnalyticsSummary(startDate: string, endDate: string) {
    if (!ANALYTICS_EVENTS_COLLECTION_ID) {
      console.warn("[v0] Analytics summary disabled: NEXT_PUBLIC_APPWRITE_ANALYTICS_EVENTS_COLLECTION_ID is not set.")
      return null
    }

    try {
      // Some deployments may not have a "timestamp" column; fallback to simple fetch if filtered query fails
      let eventsRes
      try {
        eventsRes = await databases.listDocuments(DATABASE_ID, ANALYTICS_EVENTS_COLLECTION_ID, [
          Query.greaterThanEqual("timestamp", startDate),
          Query.lessThanEqual("timestamp", endDate),
          Query.limit(10000),
        ])
      } catch {
        // Fallback: fetch latest set without timestamp filters
        eventsRes = await databases.listDocuments(DATABASE_ID, ANALYTICS_EVENTS_COLLECTION_ID, [Query.limit(10000)])
      }

      const summary = this.processEventsSummary(eventsRes.documents as AnalyticsEvents[])
      return summary
    } catch (error) {
      console.error("Failed to get analytics summary:", error)
      return null
    }
  }

  private processEventsSummary(events: AnalyticsEvents[]) {
    // Rely only on event_type and (optionally) product_id; session uniqueness via user_id mapping above
    const pageViews = events.filter((e) => e.event_type === "page_view").length
    const uniqueVisitors = new Set(
      (events as unknown as Array<{ user_id?: string; session_id?: string }>).map((e) => e.user_id || e.session_id),
    ).size
    const productViews = events.filter((e) => e.event_type === "product_view").length
    const cartAdditions = events.filter((e) => e.event_type === "add_to_cart").length
    const orders = events.filter((e) => e.event_type === "order_placed")

    // Without a revenue/metadata field, we cannot compute revenue; default to 0
    const totalRevenue = 0

    // Top products: fallback to product_id counts when product_name is not available
    const productViewEvents = events.filter((e) => e.event_type === "product_view")
    const productCounts = productViewEvents.reduce(
      (acc, event: any) => {
        const key = event.product_name || event.product_id
        if (key) acc[key] = (acc[key] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const topProducts = Object.entries(productCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name]) => name)

    // Categories likely unavailable; leave empty
    const topCategories: string[] = []

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
    if (!ANALYTICS_EVENTS_COLLECTION_ID) {
      console.warn("[v0] Recent events disabled: NEXT_PUBLIC_APPWRITE_ANALYTICS_EVENTS_COLLECTION_ID is not set.")
      return []
    }

    try {
      // Fall back if no timestamp column exists
      try {
        const events = await databases.listDocuments(DATABASE_ID, ANALYTICS_EVENTS_COLLECTION_ID, [
          Query.orderDesc("timestamp"),
          Query.limit(limit),
        ])
        return events.documents as AnalyticsEvents[]
      } catch {
        const events = await databases.listDocuments(DATABASE_ID, ANALYTICS_EVENTS_COLLECTION_ID, [Query.limit(limit)])
        return events.documents as AnalyticsEvents[]
      }
    } catch (error) {
      console.error("Failed to get recent events:", error)
      return []
    }
  }
}

export const analyticsService = new AnalyticsService()
