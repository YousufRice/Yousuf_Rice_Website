import { databases, DATABASE_ID, COLLECTIONS } from "./appwrite"
import type { AdminUser, Order, Product } from "./types"
import { ID } from "appwrite"

export class AdminService {
  static async authenticateAdmin(username: string, password: string): Promise<AdminUser | null> {
    try {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.ADMIN_USERS, [])

      const admin = response.documents.find(
        (doc) => (doc as AdminUser).username === username && (doc as AdminUser).is_active,
      )

      if (admin) {
        // In a real app, you'd hash and compare passwords properly
        // For demo purposes, we'll use a simple check
        const adminUser = admin as AdminUser
        if (password === "admin123") {
          // Update last login
          await databases.updateDocument(DATABASE_ID, COLLECTIONS.ADMIN_USERS, adminUser.$id!, {
            last_login: new Date().toISOString(),
          })
          return adminUser
        }
      }

      return null
    } catch (error) {
      console.error("Error authenticating admin:", error)
      return null
    }
  }

  static async createDefaultAdmin(): Promise<AdminUser> {
    try {
      const defaultAdmin = {
        username: "admin",
        email: "admin@yousufrice.com",
        password_hash: "hashed_admin123", // In real app, this would be properly hashed
        role: "admin" as const,
        is_active: true,
      }

      const response = await databases.createDocument(DATABASE_ID, COLLECTIONS.ADMIN_USERS, ID.unique(), defaultAdmin)
      return response as AdminUser
    } catch (error) {
      console.error("Error creating default admin:", error)
      throw error
    }
  }

  static async getDashboardStats(): Promise<{
    totalOrders: number
    pendingOrders: number
    totalRevenue: number
    totalProducts: number
  }> {
    try {
      const [ordersResponse, productsResponse] = await Promise.all([
        databases.listDocuments(DATABASE_ID, COLLECTIONS.ORDERS, []),
        databases.listDocuments(DATABASE_ID, COLLECTIONS.PRODUCTS, []),
      ])

      const orders = ordersResponse.documents as Order[]
      const products = productsResponse.documents as Product[]

      const totalOrders = orders.length
      const pendingOrders = orders.filter((order) => order.status === "pending").length
      const totalRevenue = orders
        .filter((order) => order.status === "delivered")
        .reduce((sum, order) => sum + order.total_amount, 0)
      const totalProducts = products.filter((product) => product.is_active).length

      return {
        totalOrders,
        pendingOrders,
        totalRevenue,
        totalProducts,
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      return {
        totalOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0,
        totalProducts: 0,
      }
    }
  }

  static async getRecentOrders(limit = 10): Promise<Order[]> {
    try {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.ORDERS, [])

      const orders = response.documents as Order[]
      return orders
        .sort((a, b) => new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime())
        .slice(0, limit)
    } catch (error) {
      console.error("Error fetching recent orders:", error)
      return []
    }
  }

  static async getAllOrders(): Promise<Order[]> {
    try {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.ORDERS, [])
      const orders = response.documents as Order[]
      return orders.sort((a, b) => new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime())
    } catch (error) {
      console.error("Error fetching all orders:", error)
      return []
    }
  }

  static async updateOrderStatus(orderId: string, status: Order["status"]): Promise<void> {
    try {
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.ORDERS, orderId, {
        status,
        updated_at: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error updating order status:", error)
      throw error
    }
  }
}
