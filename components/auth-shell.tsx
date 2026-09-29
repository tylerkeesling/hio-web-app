import Link from "next/link"

import { cn } from "@/lib/utils"
import { BrandMark } from "@/components/brand-logo"

interface AuthShellProps {
  title: string
  description?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

// Centered, card-less layout on a fading dot grid. Mirrors the Universal Login
// page template so onboarding and hosted login feel like one flow.
export function AuthShell({
  title,
  description,
  children,
  footer,
  className,
}: AuthShellProps) {
  return (
    <div className="dark:bg-background relative min-h-screen overflow-hidden bg-[#f1f1f2]">
      <div
        aria-hidden="true"
        className="bg-dot-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_80%_60%_at_0%_0%,black,transparent_70%)]"
      />
      <div
        className={cn(
          "relative mx-auto flex min-h-screen w-full max-w-md flex-col px-4 py-8",
          className
        )}
      >
        <Link href="/" aria-label="Home" className="mx-auto">
          <BrandMark className="size-9" />
        </Link>
        <div className="my-auto py-12">
          <h1 className="font-display text-center text-4xl text-balance">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground mt-3 text-center text-balance">
              {description}
            </p>
          )}
          <div className="mt-8">{children}</div>
        </div>
        {footer && (
          <div className="text-muted-foreground text-center text-xs">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
