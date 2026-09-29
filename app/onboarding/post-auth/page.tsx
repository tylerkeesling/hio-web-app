import { redirect } from "next/navigation"

import { appClient, managementClient } from "@/lib/auth0"
import { emailVerificationRequired } from "@/lib/onboarding"

/**
 * Post-Authentication Router
 *
 * Routes users after Auth0 authentication based on their email verification status
 * (skipped when email verification is disabled, see lib/onboarding.ts), then on to
 * organization creation or the dashboard.
 */
export default async function PostAuthRouter() {
  const session = await appClient.getSession()

  const verified = !emailVerificationRequired || session?.user?.email_verified
  if (!verified) {
    redirect("/onboarding/verify")
  }

  // The dashboard app requires organization membership, so a new user creates
  // an organization first (logging in to the dashboard without one fails)
  const { data: orgs } = session
    ? await managementClient.users.getUserOrganizations({
        id: session.user.sub,
      })
    : { data: [] }
  if (!orgs.length) {
    redirect("/onboarding/create")
  }

  const dashboardParams = new URLSearchParams({
    returnTo: "/dashboard",
  })
  redirect(`/auth/login?${dashboardParams.toString()}`)
}
