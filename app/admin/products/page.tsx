"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2 } from "lucide-react"
import { ProductForm } from "@/components/product-form"
import { productService } from "@/lib/product-service"
import type { Product } from "@/lib/types"
import Image from "next/image"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchTerm])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const productsData = await productService.getAllProducts()
      setProducts(productsData)
    } catch (error) {
      console.error("Error loading products:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = products

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredProducts(filtered)
  }

  const handleCreateProduct = async (productData: any, imageFile?: File) => {
    if (!imageFile) return

    try {
      setFormLoading(true)
      await productService.createProductWithImage(productData, imageFile)
      await loadProducts()
      setShowForm(false)
    } catch (error) {
      console.error("Error creating product:", error)
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateProduct = async (productData: any, imageFile?: File) => {
    if (!editingProduct) return

    try {
      setFormLoading(true)
      await productService.updateProductWithImage(editingProduct.$id!, productData, imageFile)
      await loadProducts()
      setEditingProduct(null)
      setShowForm(false)
    } catch (error) {
      console.error("Error updating product:", error)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) return

    try {
      await productService.deleteProduct(product.$id!)
      await loadProducts()
    } catch (error) {
      console.error("Error deleting product:", error)
    }
  }

  const startEdit = (product: Product) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const cancelForm = () => {
    setShowForm(false)
    setEditingProduct(null)
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <ProductForm
          product={editingProduct || undefined}
          onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
          onCancel={cancelForm}
          loading={formLoading}
        />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading products...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Product Management</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500">
              {products.length === 0
                ? "No products found. Create your first product!"
                : "No products match your search."}
            </div>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <Card key={product.$id} className="overflow-hidden">
              <div className="relative h-48">
                {product.image_url ? (
                  <Image
                    src={product.image_url || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant={product.is_active ? "default" : "secondary"}>
                    {product.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 capitalize">{product.category}</span>
                    <span className="font-semibold text-green-600">₹{product.base_price}/kg</span>
                  </div>
                  <div className="text-sm text-gray-500">Stock: {product.stock_quantity}kg</div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => startEdit(product)} className="flex-1">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteProduct(product)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
