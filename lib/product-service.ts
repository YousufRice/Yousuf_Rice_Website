import { databases, DATABASE_ID, COLLECTIONS } from "./appwrite"
import { storageService } from "./storage"
import type { Product } from "./types"
import { ID } from "appwrite"

export class ProductService {
  static async getAllProducts(): Promise<Product[]> {
    try {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PRODUCTS, [])
      return response.documents as Product[]
    } catch (error) {
      console.error("Error fetching products:", error)
      throw error
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

  static async createProduct(productData: Omit<Product, "$id" | "created_at" | "updated_at">): Promise<Product> {
    try {
      const response = await databases.createDocument(DATABASE_ID, COLLECTIONS.PRODUCTS, ID.unique(), productData)
      return response as Product
    } catch (error) {
      console.error("Error creating product:", error)
      throw error
    }
  }

  static async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    try {
      const response = await databases.updateDocument(DATABASE_ID, COLLECTIONS.PRODUCTS, id, productData)
      return response as Product
    } catch (error) {
      console.error("Error updating product:", error)
      throw error
    }
  }

  static async deleteProduct(id: string): Promise<void> {
    try {
      // Get product to delete associated image
      const product = await this.getProductById(id)
      if (product?.image_id) {
        await storageService.deleteImage(product.image_id)
      }

      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.PRODUCTS, id)
    } catch (error) {
      console.error("Error deleting product:", error)
      throw error
    }
  }

  static async createProductWithImage(
    productData: Omit<Product, "$id" | "created_at" | "updated_at" | "image_id" | "image_url">,
    imageFile: File,
  ): Promise<Product> {
    try {
      // Upload image first
      const imageId = await storageService.uploadImage(imageFile)
      const imageUrl = storageService.getImageUrl(imageId)

      // Create product with image
      const product = await this.createProduct({
        ...productData,
        image_id: imageId,
        image_url: imageUrl,
      })

      return product
    } catch (error) {
      console.error("Error creating product with image:", error)
      throw error
    }
  }

  static async updateProductWithImage(id: string, productData: Partial<Product>, imageFile?: File): Promise<Product> {
    try {
      let updateData = { ...productData }

      if (imageFile) {
        // Get current product to delete old image
        const currentProduct = await this.getProductById(id)
        if (currentProduct?.image_id) {
          await storageService.deleteImage(currentProduct.image_id)
        }

        // Upload new image
        const imageId = await storageService.uploadImage(imageFile)
        const imageUrl = storageService.getImageUrl(imageId)

        updateData = {
          ...updateData,
          image_id: imageId,
          image_url: imageUrl,
        }
      }

      return await this.updateProduct(id, updateData)
    } catch (error) {
      console.error("Error updating product with image:", error)
      throw error
    }
  }

  static calculatePrice(basePrice: number, quantity: number): number {
    if (quantity >= 10) return basePrice * 0.85 // 15% discount
    if (quantity >= 5) return basePrice * 0.9 // 10% discount
    if (quantity >= 2) return basePrice * 0.95 // 5% discount
    return basePrice // No discount for 1kg
  }

  static getPriceRange(basePrice: number): {
    oneKg: number
    twoToFour: number
    fiveToNine: number
    tenPlus: number
  } {
    return {
      oneKg: basePrice,
      twoToFour: basePrice * 0.95,
      fiveToNine: basePrice * 0.9,
      tenPlus: basePrice * 0.85,
    }
  }
}

export const productService = new ProductService()
