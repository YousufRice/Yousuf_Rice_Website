import { storage } from "./appwrite"
import { ID } from "appwrite"

export const STORAGE_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID!

export class StorageService {
  static async uploadImage(file: File): Promise<string> {
    try {
      const response = await storage.createFile(STORAGE_BUCKET_ID, ID.unique(), file)
      return response.$id
    } catch (error) {
      console.error("Error uploading image:", error)
      throw error
    }
  }

  static async deleteImage(fileId: string): Promise<void> {
    try {
      await storage.deleteFile(STORAGE_BUCKET_ID, fileId)
    } catch (error) {
      console.error("Error deleting image:", error)
      throw error
    }
  }

  static getImageUrl(fileId: string): string {
    return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${STORAGE_BUCKET_ID}/files/${fileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`
  }

  static getImagePreview(fileId: string, width = 400, height = 400): string {
    return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${STORAGE_BUCKET_ID}/files/${fileId}/preview?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}&width=${width}&height=${height}`
  }
}

export const storageService = new StorageService()
