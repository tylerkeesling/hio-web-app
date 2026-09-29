"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

const items = [
  { href: "/dashboard", match: "/dashboard", label: "Overview", exact: true },
  {
    href: "/dashboard/organization/general",
    match: "/dashboard/organization",
    label: "Organization",
  },
  {
    href: "/dashboard/account/profile",
    match: "/dashboard/account",
    label: "Account",
  },
]

export function DashboardNav({ className }: { className?: string }) {
  const pathname = usePathname()

  return (
    <nav className={cn("flex items-center gap-1", className)}>
      {items.map((item) => {
        const active = item.exact
          ? pathname === item.match
          : pathname.startsWith(item.match)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm transition-colors",
              active
                ? "bg-accent text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
