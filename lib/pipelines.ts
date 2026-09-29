import { Plan, plans } from "./plan"

// Demo data for the Pipelines page and the Overview. The first two active
// runs always want a runner, so on the Free plan one of them queues and on
// Team both run. Compute is gated by the plan claim in the token: the number
// of runners the workspace may use at once comes straight from the plan.

export interface PipelineRun {
  pipeline: string
  branch: string
  commit: string
  trigger: string
  started: string
}

export const activeRuns: PipelineRun[] = [
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

export const finishedRuns: PipelineRun[] = [
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

export function pipelineStatus(plan: Plan) {
  const capacity = plans[plan].runners

  return {
    capacity,
    running: activeRuns.slice(0, capacity),
    queued: activeRuns.slice(capacity),
    finished: finishedRuns,
    inUse: Math.min(activeRuns.length, capacity),
  }
}
