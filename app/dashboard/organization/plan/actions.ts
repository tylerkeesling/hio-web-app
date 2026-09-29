"use server"

import { redirect } from "next/navigation"
import { SessionData } from "@auth0/nextjs-auth0/types"

import { managementClient } from "@/lib/auth0"
import { isPlan } from "@/lib/plan"
import { withServerActionAuth } from "@/lib/with-server-action-auth"

/**
 * Changes the workspace's plan. The plan is a single key on the Organization's
 * metadata, and the Belay Provisioning Action copies it into every member's
 * token at login, so this is the whole upgrade: no code changes, no migration.
 */
export const changePlan = withServerActionAuth(
  async function changePlan(formData: FormData, session: SessionData) {
    const plan = formData.get("plan")

    if (!isPlan(plan)) {
      return { error: "Unknown plan." }
    }

    const orgId = session.user.org_id!

    try {
      // Organization metadata is replaced as a whole, so keep the other keys
      const { data: organization } = await managementClient.organizations.get({
        id: orgId,
      })

      await managementClient.organizations.update(
        { id: orgId },
        { metadata: { ...organization.metadata, plan } }
      )
    } catch (error) {
      console.error("failed to change the workspace plan", error)
      return { error: "Failed to change the plan." }
    }

    // The plan travels in the token, so sign back in to the organization to
    // pick up the new claim. Auth0 still has the session, so this is silent.
    const authParams = new URLSearchParams({
      organization: orgId,
      returnTo: "/dashboard/organization/plan",
    })

    redirect(`/auth/login?${authParams.toString()}`)
  },
  {
    role: "admin",
  }
)
