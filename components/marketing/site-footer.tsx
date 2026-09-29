import Link from "next/link"

import { brand } from "@/lib/brand"
import { BrandLogo } from "@/components/brand-logo"

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="space-y-2">
          <BrandLogo markClassName="size-6" />
          <p className="text-muted-foreground text-sm">{brand.tagline}.</p>
        </div>
        <div className="text-muted-foreground flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <Link href="/terms" className="hover:text-foreground">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <span className="eyebrow tracking-normal normal-case">
            © {new Date().getFullYear()} {brand.name}, Inc.
          </span>
        </div>
      </div>
    </footer>
  )
}
