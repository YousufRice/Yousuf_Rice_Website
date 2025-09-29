"use client"

import { Button } from "@/components/ui/button"
import { analyticsService } from "@/lib/analytics-service"

interface CategoryFilterProps {
  categories: string[]
  selectedCategory: string | null
  onCategoryChange: (category: string | null) => void
}

export function CategoryFilter({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const handleCategoryChange = async (category: string | null) => {
    onCategoryChange(category)
    if (category) {
      await analyticsService.trackCategoryFilter(category)
    }
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button
        variant={selectedCategory === null ? "default" : "outline"}
        onClick={() => handleCategoryChange(null)}
        size="sm"
      >
        All Products
      </Button>
      {categories.map((category) => (
        <Button
          key={category}
          variant={selectedCategory === category ? "default" : "outline"}
          onClick={() => handleCategoryChange(category)}
          size="sm"
        >
          {category}
        </Button>
      ))}
    </div>
  )
}
