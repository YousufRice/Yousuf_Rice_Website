import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { OrderStatusBadge } from "./order-status-badge"

interface Order {
  $id: string
  customer_name: string
  customer_phone: string
  customer_address: string
  area: string
  total_amount: number
  delivery_fee: number
  status: "pending" | "confirmed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled"
  payment_method: string
  special_instructions?: string
  $createdAt: string
  items?: Array<{
    product_name: string
    quantity: number
    weight_kg: number
    unit_price: number
    total_price: number
  }>
}

interface OrderDetailsModalProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
}

export function OrderDetailsModal({ order, isOpen, onClose }: OrderDetailsModalProps) {
  if (!order) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details - #{order.$id.slice(-8)}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Status */}
          <div className="flex items-center justify-between">
            <span className="font-medium">Status:</span>
            <OrderStatusBadge status={order.status} />
          </div>

          {/* Customer Information */}
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-lg">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium">Name:</span> {order.customer_name}
              </div>
              <div>
                <span className="font-medium">Phone:</span> {order.customer_phone}
              </div>
              <div className="md:col-span-2">
                <span className="font-medium">Address:</span> {order.customer_address}
              </div>
              <div>
                <span className="font-medium">Area:</span> {order.area}
              </div>
            </div>
          </div>

          {/* Order Items */}
          {order.items && order.items.length > 0 && (
            <div className="border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-lg">Order Items</h3>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <div>
                      <div className="font-medium">{item.product_name}</div>
                      <div className="text-sm text-gray-600">
                        {item.quantity} x {item.weight_kg}kg @ ₹{item.unit_price}/kg
                      </div>
                    </div>
                    <div className="font-medium">₹{item.total_price}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-lg">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{order.total_amount - order.delivery_fee}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee:</span>
                <span>₹{order.delivery_fee}</span>
              </div>
              <div className="flex justify-between font-semibold text-base border-t pt-2">
                <span>Total:</span>
                <span>₹{order.total_amount}</span>
              </div>
            </div>
          </div>

          {/* Payment & Additional Info */}
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-lg">Additional Information</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Payment Method:</span> {order.payment_method}
              </div>
              <div>
                <span className="font-medium">Order Date:</span> {new Date(order.$createdAt).toLocaleString()}
              </div>
              {order.special_instructions && (
                <div>
                  <span className="font-medium">Special Instructions:</span>
                  <p className="mt-1 text-gray-600">{order.special_instructions}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
