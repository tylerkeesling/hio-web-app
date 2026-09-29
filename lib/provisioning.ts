import { randomBytes } from "node:crypto"
import slugify from "@sindresorhus/slugify"

import { managementClient } from "./auth0"
import { firstNameOf } from "./names"
import { DEFAULT_PLAN, Plan } from "./plan"

export interface ProvisionWorkspaceInput {
  userId: string
  displayName: string
  /** Organization name (URL slug). Generated from the display name when omitted. */
  slug?: string
  plan?: Plan
}

/**
 * Connections a new workspace accepts logins from: the shared database plus
 * GitHub when the tenant has that connection configured.
 */
function workspaceConnections() {
  return [process.env.DEFAULT_CONNECTION_ID, process.env.GITHUB_CONNECTION_ID]
    .filter((id): id is string => !!id)
    .map((connection_id) => ({ connection_id }))
}

/**
 * Creates a Belay workspace: an Auth0 Organization with the user as its first
 * admin and the plan stored on the organization's metadata. Both the onboarding
 * form and the provisioning API (called by the login Action) go through here.
 */
export async function provisionWorkspace({
  userId,
  displayName,
  slug,
  plan = DEFAULT_PLAN,
}: ProvisionWorkspaceInput) {
  const { data: organization } = await managementClient.organizations.create({
    name: slug ?? uniqueSlug(displayName),
    display_name: displayName,
    enabled_connections: workspaceConnections(),
    metadata: { plan },
  })

  await managementClient.organizations.addMembers(
    { id: organization.id },
    { members: [userId] }
  )

  await managementClient.organizations.addMemberRoles(
    { id: organization.id, user_id: userId },
    { roles: [process.env.AUTH0_ADMIN_ROLE_ID] }
  )

  return organization
}

// Organization names must be unique in the tenant; a short suffix avoids
// collisions between two developers who share a first name.
function uniqueSlug(displayName: string) {
  const base = slugify(displayName).slice(0, 40) || "workspace"
  return `${base}-${randomBytes(2).toString("hex")}`
}

/**
 * A display name for a workspace provisioned without user input, such as
 * "Ada's workspace". Database sign-ups carry the email as their name, so the
 * nickname or the email's local part is used instead.
 */
export function defaultWorkspaceName(user: {
  name?: string | null
  nickname?: string | null
  email?: string | null
}) {
  const first = firstNameOf(user)

  return first ? `${first}'s workspace` : "My workspace"
}
