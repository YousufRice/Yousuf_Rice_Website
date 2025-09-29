"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCart } from "@/lib/cart-context"
import { OrderService } from "@/lib/order-service"
import { analyticsService } from "@/lib/analytics-service"
import { Loader2 } from "lucide-react"

interface CheckoutFormData {
  name: string
  phone: string
  email: string
  address: string
  area: string
  notes: string
}

const karachiAreas = [
  "Gulshan-e-Iqbal",
  "North Nazimabad",
  "Clifton",
  "Defence (DHA)",
  "Korangi",
  "Malir",
  "Saddar",
  "Karachi Cantonment",
  "Lyari",
  "New Karachi",
  "Orangi Town",
  "Landhi",
  "Shah Faisal Colony",
  "Gulberg",
  "Johar Town",
  "Bahadurabad",
  "Tariq Road",
  "Nazimabad",
  "Federal B Area",
  "Pechs",
  "Other",
]

export function CheckoutForm() {
  const router = useRouter()
  const { state, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CheckoutFormData>({
    name: "",
    phone: "",
    email: "",
    address: "",
    area: "",
    notes: "",
  })

  const deliveryFee = state.total >= 2000 ? 0 : 150
  const finalTotal = state.total + deliveryFee

  const handleInputChange = (field: keyof CheckoutFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      alert("Please enter your name")
      return false
    }
    if (!formData.phone.trim()) {
      alert("Please enter your phone number")
      return false
    }
    if (!/^(\+92|0)?3[0-9]{9}$/.test(formData.phone.replace(/\s|-/g, ""))) {
      alert("Please enter a valid Pakistani mobile number")
      return false
    }
    if (!formData.address.trim()) {
      alert("Please enter your delivery address")
      return false
    }
    if (!formData.area) {
      alert("Please select your area")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return
    if (state.items.length === 0) {
      alert("Your cart is empty")
      return
    }

    setLoading(true)

    try {
      // Check if customer exists or create new one
      let customer
      const existingCustomer = await OrderService.findCustomerByPhone(formData.phone)

      if (existingCustomer) {
        customer = existingCustomer
      } else {
        customer = await OrderService.createCustomer({
          name: formData.name,
          phone: formData.phone,
          email: formData.email || undefined,
          address: formData.address,
          area: formData.area,
          city: "Karachi",
        })
      }

      // Prepare order data
      const orderData = {
        customer_id: customer.$id!,
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_address: formData.address,
        customer_area: formData.area,
        total_amount: finalTotal,
        status: "pending" as const,
        payment_method: "cod" as const,
        notes: formData.notes || undefined,
      }

      // Prepare order items
      const orderItems = state.items.map((item) => ({
        product_id: item.product.$id!,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }))

      // Create order with items
      const { order } = await OrderService.createOrderWithItems(orderData, orderItems)

      await analyticsService.trackOrderPlaced(order.$id!, finalTotal)

      // Clear cart and redirect to success page
      clearCart()
      router.push(`/order-success?orderId=${order.$id}`)
    } catch (error) {
      console.error("Error placing order:", error)
      alert("Failed to place order. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Delivery Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="03XX XXXXXXX"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="your.email@example.com"
            />
          </div>

          <div>
            <Label htmlFor="address">Complete Address *</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="House/Flat number, Street, Landmark"
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="area">Area *</Label>
            <Select value={formData.area} onValueChange={(value) => handleInputChange("area", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your area" />
              </SelectTrigger>
              <SelectContent>
                {karachiAreas.map((area) => (
                  <SelectItem key={area} value={area}>
                    {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Special Instructions (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Any special delivery instructions..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
            <div className="w-4 h-4 rounded-full bg-primary"></div>
            <div>
              <p className="font-medium">Cash on Delivery (COD)</p>
              <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" size="lg" disabled={loading || state.items.length === 0}>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Placing Order...
          </>
        ) : (
          `Place Order - ₹${finalTotal}`
        )}
      </Button>
    </form>
  )
}
