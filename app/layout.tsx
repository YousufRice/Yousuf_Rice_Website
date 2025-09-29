import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Suspense } from "react"
import { CartProvider } from "@/lib/cart-context"
import { AnalyticsTracker } from "@/components/analytics-tracker"
import "./globals.css"

export const metadata: Metadata = {
  title: "Yousuf Rice - Premium Quality Rice in Karachi",
  description:
    "Order premium quality basmati and non-basmati rice online in Karachi. Cash on Delivery available. Fresh from our rice mill.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <CartProvider>
          <Suspense fallback={null}>{children}</Suspense>
          <AnalyticsTracker />
        </CartProvider>
      </body>
    </html>
  )
}
