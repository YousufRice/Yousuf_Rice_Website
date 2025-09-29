import { Client, Databases, Account, Storage } from "appwrite"

const client = new Client()

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "")

export const databases = new Databases(client)
export const account = new Account(client)
export const storage = new Storage(client)

export { client }

// Database and Collection IDs
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || ""
export const COLLECTIONS = {
  PRODUCTS: process.env.NEXT_PUBLIC_APPWRITE_PRODUCTS_COLLECTION_ID || "",
  CUSTOMERS: process.env.NEXT_PUBLIC_APPWRITE_CUSTOMERS_COLLECTION_ID || "",
  ORDERS: process.env.NEXT_PUBLIC_APPWRITE_ORDERS_COLLECTION_ID || "",
  ORDER_ITEMS: process.env.NEXT_PUBLIC_APPWRITE_ORDER_ITEMS_COLLECTION_ID || "",
  INVENTORY: process.env.NEXT_PUBLIC_APPWRITE_INVENTORY_COLLECTION_ID || "",
  ADMIN_USERS: process.env.NEXT_PUBLIC_APPWRITE_ADMIN_USERS_COLLECTION_ID || "",
}
