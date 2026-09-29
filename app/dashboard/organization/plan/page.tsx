import { appClient, managementClient } from "@/lib/auth0"
import { DEFAULT_PLAN, getPlan, isPlan, plans } from "@/lib/plan"
import { Code } from "@/components/code"
import { PageHeader } from "@/components/page-header"

import { PlanPicker } from "./plan-picker"

export default async function PlanPage() {
  const session = await appClient.getSession()
  const { data: organization } = await managementClient.organizations.get({
    id: session!.user.org_id!,
  })

  // What the workspace is on, and what this login's token says. They differ
  // only until the next sign-in after a change.
  const storedPlan = isPlan(organization.metadata?.plan)
    ? organization.metadata.plan
    : DEFAULT_PLAN
  const tokenPlan = getPlan(session!.user)

  return (
    <div className="space-y-2">
      <PageHeader
        title="Plan & billing"
        description={`${organization.display_name || organization.name} is on the ${plans[storedPlan].name} plan.`}
      />

      <div className="space-y-6 px-6 pb-8">
        <p className="text-muted-foreground text-sm">
          The plan is stored on the workspace and added to every member&apos;s
          token at sign-in as <Code>plan</Code>. Changing it here changes what
          the whole team can do on their next sign-in.
          {tokenPlan !== storedPlan && (
            <>
              {" "}
              Your current session still carries the {
                plans[tokenPlan].name
              }{" "}
              plan.
            </>
          )}
        </p>

        <PlanPicker current={storedPlan} />
      </div>
    </div>
  )
}
