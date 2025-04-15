import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"

export function SiteHeader() {
  return (
    <header className="w-full bg-white text-slate-900 shadow-sm">
      <div className="container mx-auto py-4 px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-12 w-36 sm:h-14 sm:w-40">
              <Image src="/images/logo.png" alt="ListIQ" fill className="object-contain" priority />
            </div>
          </Link>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" className="text-slate-700 hover:text-blue-600 hover:bg-blue-50" asChild>
              <Link href="/how-it-works">How It Works</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}
