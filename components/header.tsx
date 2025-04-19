"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ModeToggle } from "@/components/mode-toggle"
import { Newspaper } from "lucide-react"

export default function Header() {
  const pathname = usePathname()

  const navItems = [
    { name: "Dashboard", href: "/" },
    { name: "Companies", href: "/companies" },
    { name: "Summaries", href: "/summaries" },
    { name: "Settings", href: "/settings" },
  ]

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <Newspaper className="h-6 w-6" />
          <span>Tech News Aggregator</span>
        </Link>
        <nav className="ml-auto flex gap-2 md:gap-4 lg:gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href ? "text-primary" : "text-muted-foreground",
              )}
            >
              {item.name}
            </Link>
          ))}
          <ModeToggle />
        </nav>
      </div>
    </header>
  )
}
