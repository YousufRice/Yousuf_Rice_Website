"use client"

import { useState, useEffect } from "react"
import type { Product } from "@/lib/types"
import { productService } from "@/lib/product-service"
import { ProductGrid } from "@/components/product-grid"
import { CategoryFilter } from "@/components/category-filter"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Phone, MapPin } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import Link from "next/link"

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { state, addItem } = useCart()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const fetchedProducts = await productService.getAllProducts()
        const activeProducts = fetchedProducts.filter((product) => product.is_active)
        setProducts(activeProducts)
        setFilteredProducts(activeProducts)
      } catch (error) {
        console.error("Error loading products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  useEffect(() => {
    if (selectedCategory === null) {
      setFilteredProducts(products)
    } else {
      setFilteredProducts(products.filter((product) => product.category === selectedCategory))
    }
  }, [selectedCategory, products])

  const categories = Array.from(new Set(products.map((product) => product.category)))

  const handleAddToCart = async (product: Product, weight: "1kg" | "2-4kg" | "5-9kg" | "10+kg", quantity: number) => {
    await addItem(product, weight, quantity)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Yousuf Rice</h1>
              <p className="text-sm opacity-90">Premium Quality Rice in Karachi</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4" />
                <span>+92 300 1234567</span>
              </div>
              <div className="hidden md:flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4" />
                <span>Karachi Only</span>
              </div>
              <Button variant="secondary" size="sm" asChild className="relative">
                <Link href="/cart">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Cart
                  {state.itemCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-destructive text-destructive-foreground">
                      {state.itemCount}
                    </Badge>
                  )}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-secondary/20 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4 text-balance">Fresh Rice Directly from Our Mill</h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto text-pretty">
            Premium quality basmati and non-basmati rice varieties. Cash on Delivery available across Karachi. Order now
            for same-day delivery!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-card p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-primary">Free Delivery</h3>
              <p className="text-sm text-muted-foreground">On orders above ₹2000</p>
            </div>
            <div className="bg-card p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-primary">Cash on Delivery</h3>
              <p className="text-sm text-muted-foreground">Pay when you receive</p>
            </div>
            <div className="bg-card p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-primary">Fresh Quality</h3>
              <p className="text-sm text-muted-foreground">Direct from our mill</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-4">Our Rice Varieties</h2>
            <p className="text-muted-foreground mb-6">
              Choose from our premium selection of rice varieties with bulk pricing benefits.
            </p>
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>

          <ProductGrid products={filteredProducts} onAddToCart={handleAddToCart} />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Yousuf Rice</h3>
              <p className="text-sm text-muted-foreground">
                Premium quality rice directly from our mill to your doorstep in Karachi.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact Info</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Phone: +92 300 1234567</p>
                <p>Email: info@yousufrice.com</p>
                <p>Delivery: Karachi Only</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2 text-sm">
                <Link href="/about" className="block text-muted-foreground hover:text-foreground">
                  About Us
                </Link>
                <Link href="/contact" className="block text-muted-foreground hover:text-foreground">
                  Contact
                </Link>
                <Link href="/admin" className="block text-muted-foreground hover:text-foreground">
                  Admin Login
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t mt-8 pt-4 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Yousuf Rice. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
