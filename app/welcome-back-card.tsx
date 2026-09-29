import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export function WelcomeBackCard({ name }: { name?: string }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
      <Button size="lg" asChild>
        <Link href="/dashboard">
          Continue to dashboard <ArrowRightIcon className="size-4" />
        </Link>
      </Button>
      <p className="text-muted-foreground text-sm">
        You&apos;re signed in{name ? ` as ${name}` : ""}.
      </p>
    </div>
  )
}
