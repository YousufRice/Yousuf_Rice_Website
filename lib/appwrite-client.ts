import { databases, DATABASE_ID, COLLECTIONS } from "./appwrite"
import type { Product } from "./types"

export class ProductService {
  static async getAllProducts(): Promise<Product[]> {
    try {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PRODUCTS, [])
      return response.documents as Product[]
    } catch (error) {
      console.error("Error fetching products:", error)
      return []
    }
  }

  static async getProductById(id: string): Promise<Product | null> {
    try {
      const response = await databases.getDocument(DATABASE_ID, COLLECTIONS.PRODUCTS, id)
      return response as Product
    } catch (error) {
      console.error("Error fetching product:", error)
      return null
    }
  }

  static async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PRODUCTS, [
        // Add query filters here when implementing
      ])
      return response.documents.filter((product) => (product as Product).category === category) as Product[]
    } catch (error) {
      console.error("Error fetching products by category:", error)
      return []
    }
  }

  static getPriceByWeight(product: Product, weight: "1kg" | "2-4kg" | "5-9kg" | "10+kg"): number {
    switch (weight) {
      case "1kg":
        return product.price_1kg
      case "2-4kg":
        return product.price_2_4kg
      case "5-9kg":
        return product.price_5_9kg
      case "10+kg":
        return product.price_10plus_kg
      default:
        return product.price_1kg
    }
  }
}
