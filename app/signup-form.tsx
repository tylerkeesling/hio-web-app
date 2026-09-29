import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowRightIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import { SubmitButton } from "@/components/submit-button"

export function SignUpForm() {
  return (
    <div className="max-w-lg">
      <form
        className="flex flex-col gap-2.5 sm:flex-row"
        action={async (formData: FormData) => {
          "use server"

          const email = formData.get("email")
          if (!email || typeof email !== "string") return

          const searchParams = new URLSearchParams({
            login_hint: email,
            returnTo: "/onboarding/post-auth",
          })
          redirect(`/onboarding/signup?${searchParams.toString()}`)
        }}
      >
        <label htmlFor="email" className="sr-only">
          Work email
        </label>
        <Input
          id="email"
          type="email"
          name="email"
          placeholder="you@company.com"
          autoComplete="email"
          required
          className="h-11 sm:flex-1"
        />
        <SubmitButton size="lg">
          Start for free <ArrowRightIcon className="size-4" />
        </SubmitButton>
      </form>
      <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
        Already on a team?{" "}
        <a
          href="/auth/login?returnTo=/dashboard"
          className="text-brand-blue font-medium hover:underline"
        >
          Log in
        </a>
        . By continuing, you agree to our{" "}
        <Link href="/terms" className="underline underline-offset-2">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline underline-offset-2">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  )
}
