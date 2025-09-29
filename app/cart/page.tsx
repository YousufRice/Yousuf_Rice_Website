"use client"

import { useCart } from "@/lib/cart-context"
import { CartItem } from "@/components/cart-item"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ShoppingCart, Phone } from "lucide-react"
import Link from "next/link"

export default function CartPage() {
  const { state, updateQuantity, removeItem, clearCart } = useCart()

  const deliveryFee = state.total >= 2000 ? 0 : 150
  const finalTotal = state.total + deliveryFee

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-primary text-primary-foreground shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="secondary" size="sm" asChild>
                  <Link href="/">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Products
                  </Link>
                </Button>
                <div>
                  <h1 className="text-xl font-bold">Shopping Cart</h1>
                  <p className="text-sm opacity-90">Yousuf Rice</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4" />
                <span>+92 300 1234567</span>
              </div>
            </div>
          </div>
        </header>

        {/* Empty Cart */}
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-md mx-auto">
            <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Add some delicious rice varieties to get started!</p>
            <Button asChild size="lg">
              <Link href="/">Browse Products</Link>
            </Button>
          </div>
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
            <div className="flex items-center gap-4">
              <Button variant="secondary" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Continue Shopping
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold">Shopping Cart</h1>
                <p className="text-sm opacity-90">{state.itemCount} items</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4" />
              <span>+92 300 1234567</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Cart Items</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={clearCart}
                className="text-destructive hover:text-destructive bg-transparent"
              >
                Clear Cart
              </Button>
            </div>

            {state.items.map((item, index) => (
              <CartItem
                key={`${item.product.$id}-${item.selectedWeight}`}
                item={item}
                index={index}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({state.itemCount} items)</span>
                    <span>₹{state.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Delivery Fee</span>
                    <span className={deliveryFee === 0 ? "text-green-600 font-medium" : ""}>
                      {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                    </span>
                  </div>
                  {state.total < 2000 && (
                    <p className="text-xs text-muted-foreground">Add ₹{2000 - state.total} more for free delivery</p>
                  )}
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-lg text-primary">₹{finalTotal}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button asChild className="w-full" size="lg">
                    <Link href="/checkout">Proceed to Checkout</Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full bg-transparent">
                    <Link href="/">Continue Shopping</Link>
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>✓ Cash on Delivery Available</p>
                  <p>✓ Same Day Delivery in Karachi</p>
                  <p>✓ Fresh from Our Rice Mill</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
