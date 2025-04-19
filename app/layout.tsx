import type React from "react"
import "@/app/globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"

import { ThemeProvider } from "@/components/theme-provider"
import { SiteHeader } from "@/components/site-header"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@/components/analytics"
import { GoogleAnalytics } from "@/components/google-analytics"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ListIQ - Compare Homes For Sale",
  description: "Compare multiple properties side by side to find the best value for your investment.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>{/* Google Analytics is added via the GoogleAnalytics component */}</head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <SiteHeader />
          <Suspense>{children}</Suspense>
          <Toaster />
          <Analytics />
          <Suspense fallback={null}>
            <GoogleAnalytics />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  )
}
