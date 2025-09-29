"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Product } from "@/lib/types"
import { ProductService } from "@/lib/appwrite-client"

interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product, weight: "1kg" | "2-4kg" | "5-9kg" | "10+kg", quantity: number) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [selectedWeight, setSelectedWeight] = useState<"1kg" | "2-4kg" | "5-9kg" | "10+kg">("1kg")
  const [quantity, setQuantity] = useState(1)

  const currentPrice = ProductService.getPriceByWeight(product, selectedWeight)

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product, selectedWeight, quantity)
    }
  }

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-0">
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <Image
            src={product.image_url || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">{product.category}</Badge>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 text-balance">{product.name}</h3>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{product.description}</p>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Weight:</span>
              <Select
                value={selectedWeight}
                onValueChange={(value: "1kg" | "2-4kg" | "5-9kg" | "10+kg") => setSelectedWeight(value)}
              >
                <SelectTrigger className="w-24">
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
              <span className="text-sm font-medium">Quantity:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-8 w-8 p-0"
                >
                  -
                </Button>
                <span className="w-8 text-center">{quantity}</span>
                <Button variant="outline" size="sm" onClick={() => setQuantity(quantity + 1)} className="h-8 w-8 p-0">
                  +
                </Button>
              </div>
            </div>

            <div className="text-center">
              <span className="text-2xl font-bold text-primary">₹{currentPrice * quantity}</span>
              <span className="text-sm text-muted-foreground ml-1">(₹{currentPrice}/kg)</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button asChild variant="outline" className="flex-1 bg-transparent">
          <Link href={`/products/${product.$id}`}>View Details</Link>
        </Button>
        <Button onClick={handleAddToCart} className="flex-1">
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  )
}
