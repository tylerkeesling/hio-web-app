import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { BrandLogo } from "@/components/brand-logo"

const links = [
  { href: "#platform", label: "Platform" },
  { href: "#security", label: "Security" },
  { href: "#customers", label: "Customers" },
]

export function SiteHeader({ signedIn }: { signedIn: boolean }) {
  return (
    <header className="bg-background/80 sticky top-0 z-40 border-b pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-10">
          <Link href="/" aria-label="Home">
            <BrandLogo />
          </Link>
          <nav className="text-foreground/70 hidden items-center gap-7 text-sm md:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="hover:text-foreground transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {signedIn ? (
            <>
              <Button variant="outline" size="sm" asChild>
                <a href="/auth/logout">Log out</a>
              </Button>
              <Button size="sm" asChild>
                <Link href="/dashboard">
                  Dashboard <ArrowRightIcon className="size-3.5" />
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild>
                <a href="/auth/login?returnTo=/dashboard">Log in</a>
              </Button>
              <Button size="sm" asChild>
                <a href="#get-started">Start for free</a>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
