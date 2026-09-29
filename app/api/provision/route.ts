import { timingSafeEqual } from "node:crypto"

import { managementClient } from "@/lib/auth0"
import { DEFAULT_PLAN, isPlan } from "@/lib/plan"
import { defaultWorkspaceName, provisionWorkspace } from "@/lib/provisioning"

/**
 * Belay's provisioning API.
 *
 * The Belay Provisioning Action (actions/belay-provisioning.js) calls this on
 * a developer's first login to create their workspace. The Action authenticates
 * with a shared secret it holds in its secrets and this app holds in
 * PROVISIONING_API_KEY. Because the Action runs in Auth0's cloud, the app must
 * be reachable on a public URL for the call to succeed.
 */
export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const userId = body?.user_id

  if (typeof userId !== "string" || !userId) {
    return Response.json({ error: "user_id is required" }, { status: 400 })
  }

  try {
    // Idempotent: a user who already has a workspace gets that one back
    const { data: existing } =
      await managementClient.users.getUserOrganizations({ id: userId })

    if (existing.length > 0) {
      const { data: organization } = await managementClient.organizations.get({
        id: existing[0].id,
      })

      return Response.json({
        workspace_id: organization.id,
        plan: isPlan(organization.metadata?.plan)
          ? organization.metadata.plan
          : DEFAULT_PLAN,
        created: false,
      })
    }

    const organization = await provisionWorkspace({
      userId,
      displayName: defaultWorkspaceName(body),
    })

    return Response.json(
      { workspace_id: organization.id, plan: DEFAULT_PLAN, created: true },
      { status: 201 }
    )
  } catch (error) {
    console.error("failed to provision a workspace", error)
    return Response.json({ error: "provisioning failed" }, { status: 500 })
  }
}

function isAuthorized(request: Request) {
  const expected = process.env.PROVISIONING_API_KEY
  const provided = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "")

  if (!expected || !provided) {
    return false
  }

  const a = Buffer.from(expected)
  const b = Buffer.from(provided)

  return a.length === b.length && timingSafeEqual(a, b)
}
