"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string
    title: string
  }[]
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        "-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0",
        className
      )}
      {...props}
    >
      {items.map((item) => {
        const active = pathname.includes(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center justify-between gap-3 rounded-md px-3 py-2 text-sm whitespace-nowrap transition-colors",
              active
                ? "bg-card text-foreground font-medium shadow-[0_0_0_1px_var(--border),0_1px_2px_rgb(20_18_11/0.04)]"
                : "text-muted-foreground hover:bg-accent/70 hover:text-foreground"
            )}
          >
            {item.title}
            {active && (
              <span className="bg-brand hidden size-1.5 rounded-full lg:block" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
