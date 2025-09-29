"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Minus, Plus, Trash2 } from "lucide-react"
import type { CartItem as CartItemType } from "@/lib/types"

interface CartItemProps {
  item: CartItemType
  index: number
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemove: (id: string) => void
}

export function CartItem({ item, index, onUpdateQuantity, onRemove }: CartItemProps) {
  const itemTotal = item.price * item.quantity

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="relative w-20 h-20 flex-shrink-0">
            <Image
              src={item.product.image_url || "/placeholder.svg"}
              alt={item.product.name}
              fill
              className="object-cover rounded-md"
              sizes="80px"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1 truncate">{item.product.name}</h3>
            <p className="text-xs text-muted-foreground mb-2">Weight: {item.selectedWeight}</p>
            <p className="text-sm font-medium text-primary">₹{item.price}/kg</p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(index.toString())}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateQuantity(index.toString(), item.quantity - 1)}
                className="h-7 w-7 p-0"
                disabled={item.quantity <= 1}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateQuantity(index.toString(), item.quantity + 1)}
                className="h-7 w-7 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            <p className="text-sm font-bold">₹{itemTotal}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
