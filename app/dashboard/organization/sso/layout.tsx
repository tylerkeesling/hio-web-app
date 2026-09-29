import Link from "next/link"
import { ArrowRightIcon, LockIcon } from "lucide-react"

import { appClient } from "@/lib/auth0"
import { getPlan, plans } from "@/lib/plan"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

/**
 * Single sign-on is a Team feature. The gate reads the plan claim the login
 * Action put in the token, so an upgrade unlocks it on the next sign-in.
 */
export default async function SsoLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await appClient.getSession()
  const plan = getPlan(session!.user)

  if (plans[plan].sso) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-[420px] items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3">
          <span className="bg-background grid size-9 place-items-center rounded-lg border">
            <LockIcon className="text-foreground/70 size-4" />
          </span>
          <p className="eyebrow">Team plan</p>
          <CardTitle className="font-display text-3xl font-normal">
            Single sign-on is a Team feature
          </CardTitle>
          <CardDescription className="text-sm">
            Your workspace is on the {plans[plan].name} plan. Upgrade to let
            your team sign in through Okta, Entra ID, or any SAML or OIDC
            provider.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button className="w-full" asChild>
            <Link href="/dashboard/organization/plan">
              See plans <ArrowRightIcon className="size-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
