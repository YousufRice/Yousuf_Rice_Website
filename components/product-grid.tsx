"use client"

import type { Product } from "@/lib/types"
import { ProductCard } from "./product-card"

interface ProductGridProps {
  products: Product[]
  onAddToCart?: (product: Product, weight: "1kg" | "2-4kg" | "5-9kg" | "10+kg", quantity: number) => void
}

export function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">No products found</h3>
        <p className="text-muted-foreground">We're currently updating our inventory. Please check back soon.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.$id} product={product} onAddToCart={onAddToCart} />
      ))}
    </div>
  )
}
