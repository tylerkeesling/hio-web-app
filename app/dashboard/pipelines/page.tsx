import Link from "next/link"
import {
  ArrowRightIcon,
  CheckIcon,
  ClockIcon,
  GitBranchIcon,
  LoaderIcon,
  LockIcon,
  PlusIcon,
} from "lucide-react"

import { appClient } from "@/lib/auth0"
import { getPlan, plans } from "@/lib/plan"
import { getRole } from "@/lib/roles"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PipelineMock } from "@/components/marketing/product-mocks"

// Demo data: the first two rows always want a runner, so on the Free plan one
// of them queues and on Team both run.
const activeRuns = [
  {
    pipeline: "checkout-service",
    branch: "main",
    commit: "#4821",
    trigger: "push by ada",
    started: "2 min ago",
  },
  {
    pipeline: "web-frontend",
    branch: "feat/plan-badge",
    commit: "#1077",
    trigger: "pull request #212",
    started: "1 min ago",
  },
  {
    pipeline: "billing-worker",
    branch: "main",
    commit: "#390",
    trigger: "push by sam",
    started: "just now",
  },
]

const finishedRuns = [
  {
    pipeline: "infra",
    branch: "main",
    commit: "#212",
    trigger: "schedule",
    started: "18 min ago",
  },
  {
    pipeline: "checkout-service",
    branch: "main",
    commit: "#4820",
    trigger: "push by priya",
    started: "41 min ago",
  },
]

export default async function PipelinesPage() {
  const session = await appClient.getSession()
  const user = session!.user
  const plan = getPlan(user)
  const isAdmin = getRole(user) === "admin"

  // Gate compute by the plan claim in the token: the number of runners the
  // workspace may use at once comes straight from the plan
  const capacity = plans[plan].runners
  const running = activeRuns.slice(0, capacity)
  const queued = activeRuns.slice(capacity)
  const inUse = Math.min(activeRuns.length, capacity)

  return (
    <div className="space-y-10">
      <section className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Pipelines</p>
          <h1 className="font-display mt-4 text-4xl sm:text-5xl">
            Recent runs
          </h1>
          <p className="text-muted-foreground mt-3 max-w-xl">
            Every push, pull request, and schedule in this workspace, and the
            runners they share.
          </p>
        </div>
        <Badge variant="outline">{plans[plan].name} plan</Badge>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="bg-card overflow-hidden rounded-xl border shadow-[0_1px_2px_rgb(20_18_11/0.04)]">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div>
              <p className="text-sm font-medium">Runs</p>
              <p className="text-muted-foreground text-xs">
                {running.length} running · {queued.length} queued ·{" "}
                {finishedRuns.length} finished
              </p>
            </div>
            <Button size="sm" variant="outline">
              <PlusIcon className="size-3.5" /> New pipeline
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="text-muted-foreground text-xs">
                <tr className="border-b">
                  <th className="px-5 py-2.5 font-medium">Pipeline</th>
                  <th className="px-3 py-2.5 font-medium">Trigger</th>
                  <th className="px-3 py-2.5 font-medium">Started</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {running.map((run) => (
                  <RunRow key={run.commit} run={run} status="running" />
                ))}
                {queued.map((run) => (
                  <RunRow key={run.commit} run={run} status="queued" />
                ))}
                {finishedRuns.map((run) => (
                  <RunRow key={run.commit} run={run} status="passed" />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-xl border p-5 shadow-[0_1px_2px_rgb(20_18_11/0.04)]">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Concurrent runners</p>
              <span className="font-mono text-xs">
                {inUse} of {capacity} in use
              </span>
            </div>
            <div className="bg-muted mt-3 h-1.5 overflow-hidden rounded-full">
              <div
                className="from-brand-blue to-brand h-full rounded-full bg-gradient-to-r"
                style={{ width: `${(inUse / capacity) * 100}%` }}
              />
            </div>

            {plans[plan].sso ? (
              <>
                <p className="text-muted-foreground mt-4 text-sm">
                  Pipelines run in parallel up to {capacity} at a time on the{" "}
                  {plans[plan].name} plan.
                </p>
                <Button size="sm" variant="outline" className="mt-4">
                  <PlusIcon className="size-3.5" /> Add runner
                </Button>
              </>
            ) : (
              <>
                <p className="text-muted-foreground mt-4 text-sm">
                  The Free plan includes one runner, so pipelines wait in line.
                  Team workspaces run up to {plans.team.runners} at once.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Button size="sm" variant="outline" disabled>
                    <LockIcon className="size-3.5" /> Add runner
                  </Button>
                  {isAdmin ? (
                    <Link
                      href="/dashboard/organization/plan"
                      className="text-brand-blue inline-flex items-center gap-1 text-sm font-medium hover:underline"
                    >
                      Upgrade to Team <ArrowRightIcon className="size-3.5" />
                    </Link>
                  ) : (
                    <span className="text-muted-foreground text-sm">
                      Ask a workspace admin to upgrade.
                    </span>
                  )}
                </div>
              </>
            )}
          </div>

          <PipelineMock />
        </div>
      </section>
    </div>
  )
}

function RunRow({
  run,
  status,
}: {
  run: (typeof activeRuns)[number]
  status: "running" | "queued" | "passed"
}) {
  return (
    <tr className="border-b last:border-0">
      <td className="px-5 py-3">
        <p className="font-medium">{run.pipeline}</p>
        <p className="text-muted-foreground flex items-center gap-1 font-mono text-xs">
          <GitBranchIcon className="size-3" />
          {run.branch} · {run.commit}
        </p>
      </td>
      <td className="text-muted-foreground px-3 py-3">{run.trigger}</td>
      <td className="text-muted-foreground px-3 py-3">{run.started}</td>
      <td className="px-5 py-3">
        {status === "running" && (
          <Badge variant="success">
            <LoaderIcon className="mr-1 size-3 animate-spin" /> Running
          </Badge>
        )}
        {status === "queued" && (
          <Badge variant="secondary">
            <ClockIcon className="mr-1 size-3" /> Waiting for a runner
          </Badge>
        )}
        {status === "passed" && (
          <Badge variant="outline">
            <CheckIcon className="mr-1 size-3 text-[#2d8a5e]" /> Passed
          </Badge>
        )}
      </td>
    </tr>
  )
}
