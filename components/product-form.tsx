"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageUpload } from "./image-upload"
import type { Product } from "@/lib/types"

interface ProductFormProps {
  product?: Product
  onSubmit: (productData: any, imageFile?: File) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function ProductForm({ product, onSubmit, onCancel, loading }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    category: product?.category || "",
    base_price: product?.base_price || 0,
    stock_quantity: product?.stock_quantity || 0,
    is_active: product?.is_active ?? true,
  })
  const [imageFile, setImageFile] = useState<File | undefined>()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Product name is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (!formData.category) newErrors.category = "Category is required"
    if (formData.base_price <= 0) newErrors.base_price = "Base price must be greater than 0"
    if (formData.stock_quantity < 0) newErrors.stock_quantity = "Stock quantity cannot be negative"
    if (!product && !imageFile) newErrors.image = "Product image is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      await onSubmit(formData, imageFile)
    } catch (error) {
      console.error("Error submitting form:", error)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{product ? "Edit Product" : "Add New Product"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <ImageUpload onImageSelect={setImageFile} currentImageUrl={product?.image_url} />
          {errors.image && <p className="text-sm text-red-600">{errors.image}</p>}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g., Premium Basmati Rice"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basmati">Basmati Rice</SelectItem>
                  <SelectItem value="non-basmati">Non-Basmati Rice</SelectItem>
                  <SelectItem value="premium">Premium Rice</SelectItem>
                  <SelectItem value="organic">Organic Rice</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-red-600 mt-1">{errors.category}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe the product features, quality, and benefits..."
              rows={4}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
          </div>

          {/* Pricing and Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="base_price">Base Price (₹/kg) *</Label>
              <Input
                id="base_price"
                type="number"
                min="0"
                step="0.01"
                value={formData.base_price}
                onChange={(e) => handleInputChange("base_price", Number.parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={errors.base_price ? "border-red-500" : ""}
              />
              {errors.base_price && <p className="text-sm text-red-600 mt-1">{errors.base_price}</p>}
              <p className="text-xs text-gray-600 mt-1">
                Bulk discounts: 2-4kg (5% off), 5-9kg (10% off), 10+kg (15% off)
              </p>
            </div>

            <div>
              <Label htmlFor="stock_quantity">Stock Quantity (kg)</Label>
              <Input
                id="stock_quantity"
                type="number"
                min="0"
                value={formData.stock_quantity}
                onChange={(e) => handleInputChange("stock_quantity", Number.parseInt(e.target.value) || 0)}
                placeholder="0"
                className={errors.stock_quantity ? "border-red-500" : ""}
              />
              {errors.stock_quantity && <p className="text-sm text-red-600 mt-1">{errors.stock_quantity}</p>}
            </div>
          </div>

          {/* Status */}
          <div>
            <Label>Product Status</Label>
            <Select
              value={formData.is_active ? "active" : "inactive"}
              onValueChange={(value) => handleInputChange("is_active", value === "active")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active (Visible to customers)</SelectItem>
                <SelectItem value="inactive">Inactive (Hidden from customers)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price Preview */}
          {formData.base_price > 0 && (
            <Card className="bg-green-50 border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Price Preview</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <div className="font-medium">1kg</div>
                    <div className="text-green-700">₹{formData.base_price.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="font-medium">2-4kg</div>
                    <div className="text-green-700">₹{(formData.base_price * 0.95).toFixed(2)}/kg</div>
                  </div>
                  <div>
                    <div className="font-medium">5-9kg</div>
                    <div className="text-green-700">₹{(formData.base_price * 0.9).toFixed(2)}/kg</div>
                  </div>
                  <div>
                    <div className="font-medium">10+kg</div>
                    <div className="text-green-700">₹{(formData.base_price * 0.85).toFixed(2)}/kg</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Saving..." : product ? "Update Product" : "Create Product"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
