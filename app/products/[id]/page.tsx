"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/lib/types"
import { productService } from "@/lib/product-service"
import { analyticsService } from "@/lib/analytics-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, ShoppingCart, Phone, MapPin } from "lucide-react"
import { useCart } from "@/lib/cart-context"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedWeight, setSelectedWeight] = useState<"1kg" | "2-4kg" | "5-9kg" | "10+kg">("1kg")
  const [quantity, setQuantity] = useState(1)
  const { state, addItem } = useCart()

  useEffect(() => {
    const fetchProduct = async () => {
      if (params.id) {
        try {
          const fetchedProduct = await productService.getProductById(params.id as string)
          setProduct(fetchedProduct)
          if (fetchedProduct) {
            await analyticsService.trackProductView(fetchedProduct.$id!, fetchedProduct.name)
          }
        } catch (error) {
          console.error("Error loading product:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchProduct()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/">Back to Products</Link>
          </Button>
        </div>
      </div>
    )
  }

  const currentPrice = productService.calculatePrice(
    product.base_price,
    selectedWeight === "1kg" ? 1 : selectedWeight === "2-4kg" ? 2 : selectedWeight === "5-9kg" ? 5 : 10,
  )
  const totalPrice = currentPrice * quantity

  const handleAddToCart = async () => {
    addItem(product, selectedWeight, quantity)
    if (product) {
      await analyticsService.trackAddToCart(product.$id!, product.name)
    }
  }

  const priceRange = productService.getPriceRange(product.base_price)
  const priceBreakdown = [
    { weight: "1kg", price: priceRange.oneKg },
    { weight: "2-4kg", price: priceRange.twoToFour },
    { weight: "5-9kg", price: priceRange.fiveToNine },
    { weight: "10+kg", price: priceRange.tenPlus },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="secondary" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold mb-2">Yousuf Rice</h1>
                <p className="text-sm opacity-90">Premium Quality Rice</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4" />
                <span>+92 300 1234567</span>
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

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              <Image
                src={product.image_url || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground capitalize">
                {product.category}
              </Badge>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-balance">{product.name}</h1>
              <p className="text-muted-foreground text-lg text-pretty">{product.description}</p>
            </div>

            {/* Price Breakdown */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Bulk Pricing</h3>
                <div className="grid grid-cols-2 gap-2">
                  {priceBreakdown.map((item) => (
                    <div
                      key={item.weight}
                      className={`p-2 rounded border text-center ${
                        selectedWeight === item.weight ? "border-primary bg-primary/10" : "border-border"
                      }`}
                    >
                      <div className="font-medium">{item.weight}</div>
                      <div className="text-sm text-primary font-semibold">₹{item.price.toFixed(2)}/kg</div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">* Better prices for larger quantities</p>
              </CardContent>
            </Card>

            {/* Purchase Options */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="font-medium">Select Weight:</label>
                  <Select
                    value={selectedWeight}
                    onValueChange={(value: "1kg" | "2-4kg" | "5-9kg" | "10+kg") => setSelectedWeight(value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1kg">1kg</SelectItem>
                      <SelectItem value="2-4kg">2-4kg</SelectItem>
                      <SelectItem value="5-9kg">5-9kg</SelectItem>
                      <SelectItem value="10+kg">10+kg</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <label className="font-medium">Quantity:</label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-9 w-9 p-0"
                    >
                      -
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
                      className="h-9 w-9 p-0"
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between text-lg">
                    <span className="font-medium">Total Price:</span>
                    <span className="font-bold text-primary text-2xl">₹{totalPrice.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground text-right">
                    ₹{currentPrice.toFixed(2)} × {quantity} kg
                  </p>
                </div>

                <Button onClick={handleAddToCart} className="w-full" size="lg">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
              </CardContent>
            </Card>

            {/* Delivery Info */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Delivery Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Delivery Area:</span>
                    <span className="font-medium">Karachi Only</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span className="font-medium">Cash on Delivery</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Time:</span>
                    <span className="font-medium">Same Day</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Free Delivery:</span>
                    <span className="font-medium">Orders above ₹2000</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
