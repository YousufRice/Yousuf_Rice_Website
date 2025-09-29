"use client"

import { useCart } from "@/lib/cart-context"
import { CheckoutForm } from "@/components/checkout-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ShoppingCart, Phone } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function CheckoutPage() {
  const { state } = useCart()

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
                  <Link href="/cart">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Cart
                  </Link>
                </Button>
                <div>
                  <h1 className="text-xl font-bold">Checkout</h1>
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
            <p className="text-muted-foreground mb-6">Add some products to proceed with checkout.</p>
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
                <Link href="/cart">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Cart
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold">Checkout</h1>
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
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <CheckoutForm />
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  {state.items.map((item, index) => (
                    <div key={`${item.product.$id}-${item.selectedWeight}`} className="flex gap-3">
                      <div className="relative w-12 h-12 flex-shrink-0">
                        <Image
                          src={item.product.image_url || "/placeholder.svg"}
                          alt={item.product.name}
                          fill
                          className="object-cover rounded"
                          sizes="48px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate">{item.product.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {item.selectedWeight} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-sm font-medium">₹{item.price * item.quantity}</div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
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
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span className="text-primary">₹{finalTotal}</span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
                  <p>✓ Cash on Delivery</p>
                  <p>✓ Same Day Delivery in Karachi</p>
                  <p>✓ Fresh Quality Guaranteed</p>
                  <p>✓ Customer Support Available</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
