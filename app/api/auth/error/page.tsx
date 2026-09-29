"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { AuthShell } from "@/components/auth-shell"

export default function SearchBar() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  return (
    <AuthShell
      title="Something went wrong"
      description={error || "We couldn't sign you in. Please try again."}
    >
      <Button size="lg" className="w-full" asChild>
        <Link href="/">
          Back to homepage <ArrowRightIcon className="size-4" />
        </Link>
      </Button>
    </AuthShell>
  )
}
