"use server"

import { redirect } from "next/navigation"
import slugify from "@sindresorhus/slugify"

import { onboardingClient } from "@/lib/auth0"
import { provisionWorkspace } from "@/lib/provisioning"

/**
 * Manual workspace creation. Normally the Belay Provisioning Action creates the
 * workspace on first login; this form is the fallback when that did not happen
 * (for example, when the provisioning API was unreachable).
 */
export async function createOrganization(formData: FormData) {
  const session = await onboardingClient.getSession()

  if (!session) {
    return redirect("/onboarding/signup")
  }

  const organizationName = formData.get("organization_name")

  if (!organizationName || typeof organizationName !== "string") {
    return {
      error: "Organization name is required.",
    }
  }

  let organization

  try {
    organization = await provisionWorkspace({
      userId: session.user.sub,
      displayName: organizationName,
      slug: slugify(organizationName),
    })
  } catch (error) {
    console.error("failed to create an organization", error)
    return {
      error: "Failed to create an organization.",
    }
  }

  const authParams = new URLSearchParams({
    organization: organization.id,
    returnTo: "/dashboard",
  })

  redirect(`/auth/login?${authParams.toString()}`)
}
