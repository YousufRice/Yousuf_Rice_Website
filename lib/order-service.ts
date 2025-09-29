import { databases, DATABASE_ID, COLLECTIONS } from "./appwrite"
import type { Order, OrderItem, Customer } from "./types"
import { ID } from "appwrite"

export class OrderService {
  static async createCustomer(customerData: Omit<Customer, "$id" | "created_at" | "updated_at">): Promise<Customer> {
    try {
      const response = await databases.createDocument(DATABASE_ID, COLLECTIONS.CUSTOMERS, ID.unique(), customerData)
      return response as Customer
    } catch (error) {
      console.error("Error creating customer:", error)
      throw error
    }
  }

  static async findCustomerByPhone(phone: string): Promise<Customer | null> {
    try {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.CUSTOMERS, [])

      const customer = response.documents.find((doc) => (doc as Customer).phone === phone)

      return (customer as Customer) || null
    } catch (error) {
      console.error("Error finding customer:", error)
      return null
    }
  }

  static async createOrder(orderData: Omit<Order, "$id" | "created_at" | "updated_at">): Promise<Order> {
    try {
      const response = await databases.createDocument(DATABASE_ID, COLLECTIONS.ORDERS, ID.unique(), orderData)
      return response as Order
    } catch (error) {
      console.error("Error creating order:", error)
      throw error
    }
  }

  static async createOrderItem(orderItemData: Omit<OrderItem, "$id" | "created_at">): Promise<OrderItem> {
    try {
      const response = await databases.createDocument(DATABASE_ID, COLLECTIONS.ORDER_ITEMS, ID.unique(), orderItemData)
      return response as OrderItem
    } catch (error) {
      console.error("Error creating order item:", error)
      throw error
    }
  }

  static async createOrderWithItems(
    orderData: Omit<Order, "$id" | "created_at" | "updated_at">,
    orderItems: Omit<OrderItem, "$id" | "created_at" | "order_id">[],
  ): Promise<{ order: Order; items: OrderItem[] }> {
    try {
      // Create the order first
      const order = await this.createOrder(orderData)

      // Create order items
      const items = await Promise.all(
        orderItems.map((item) =>
          this.createOrderItem({
            ...item,
            order_id: order.$id!,
          }),
        ),
      )

      return { order, items }
    } catch (error) {
      console.error("Error creating order with items:", error)
      throw error
    }
  }

  static generateOrderNumber(): string {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    return `YR${timestamp}${random}`
  }

  static async getAllOrders(): Promise<Order[]> {
    try {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.ORDERS, [])
      return response.documents as Order[]
    } catch (error) {
      console.error("Error fetching orders:", error)
      throw error
    }
  }

  static async getOrderWithItems(orderId: string): Promise<Order & { items: OrderItem[] }> {
    try {
      // Get the order
      const orderResponse = await databases.getDocument(DATABASE_ID, COLLECTIONS.ORDERS, orderId)
      const order = orderResponse as Order

      // Get order items
      const itemsResponse = await databases.listDocuments(DATABASE_ID, COLLECTIONS.ORDER_ITEMS, [])
      const items = itemsResponse.documents.filter((item: any) => item.order_id === orderId) as OrderItem[]

      return { ...order, items }
    } catch (error) {
      console.error("Error fetching order with items:", error)
      throw error
    }
  }

  static async updateOrderStatus(orderId: string, status: string): Promise<void> {
    try {
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.ORDERS, orderId, { status })
    } catch (error) {
      console.error("Error updating order status:", error)
      throw error
    }
  }

  static async getOrderStats(): Promise<{
    totalOrders: number
    pendingOrders: number
    totalRevenue: number
  }> {
    try {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.ORDERS, [])
      const orders = response.documents as Order[]

      const totalOrders = orders.length
      const pendingOrders = orders.filter((order) => order.status === "pending").length
      const totalRevenue = orders
        .filter((order) => order.status !== "cancelled")
        .reduce((sum, order) => sum + order.total_amount, 0)

      return { totalOrders, pendingOrders, totalRevenue }
    } catch (error) {
      console.error("Error fetching order stats:", error)
      throw error
    }
  }
}

export const orderService = new OrderService()
