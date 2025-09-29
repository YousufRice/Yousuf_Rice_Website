export interface Product {
  $id?: string
  name: string
  description: string
  category: string
  image_url: string
  price_1kg: number
  price_2_4kg: number
  price_5_9kg: number
  price_10plus_kg: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface Customer {
  $id?: string
  name: string
  phone: string
  email?: string
  address: string
  area: string
  city: string
  created_at?: string
  updated_at?: string
}

export interface Order {
  $id?: string
  customer_id: string
  customer_name: string
  customer_phone: string
  customer_address: string
  customer_area: string
  total_amount: number
  status: "pending" | "confirmed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled"
  payment_method: "cod"
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface OrderItem {
  $id?: string
  order_id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  created_at?: string
}

export interface Inventory {
  $id?: string
  product_id: string
  stock_quantity: number
  low_stock_threshold: number
  last_updated?: string
}

export interface AdminUser {
  $id?: string
  username: string
  email: string
  password_hash: string
  role: "admin" | "manager"
  is_active: boolean
  created_at?: string
  last_login?: string
}

export interface CartItem {
  product: Product
  quantity: number
  selectedWeight: "1kg" | "2-4kg" | "5-9kg" | "10+kg"
  price: number
}

export interface AnalyticsEvent {
  $id?: string
  event_type: "page_view" | "product_view" | "add_to_cart" | "order_placed" | "search" | "category_filter"
  page_url?: string
  product_id?: string
  product_name?: string
  search_query?: string
  category?: string
  user_agent?: string
  ip_address?: string
  session_id: string
  timestamp: string
  metadata?: Record<string, any>
}

export interface AnalyticsSummary {
  $id?: string
  date: string
  total_page_views: number
  unique_visitors: number
  total_product_views: number
  total_cart_additions: number
  total_orders: number
  total_revenue: number
  top_products: string[]
  top_categories: string[]
  created_at?: string
}

export interface SessionData {
  $id?: string
  session_id: string
  user_agent?: string
  ip_address?: string
  first_visit: string
  last_activity: string
  page_count: number
  is_active: boolean
}
