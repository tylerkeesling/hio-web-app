import Link from "next/link"
import { ArrowRightIcon, CheckIcon, CircleIcon, LockIcon } from "lucide-react"

import { appClient } from "@/lib/auth0"
import { firstNameOf } from "@/lib/names"
import { pipelineStatus } from "@/lib/pipelines"
import { getPlan, PLAN_CLAIM_KEY, plans } from "@/lib/plan"
import { getRole, ROLES_CLAIM_KEY } from "@/lib/roles"
import { cn } from "@/lib/utils"
import { getWorkspaceReadiness } from "@/lib/workspace-readiness"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const cardClass =
  "bg-card flex flex-col rounded-xl border p-5 shadow-[0_1px_2px_rgb(20_18_11/0.04)]"

export default async function DashboardHome() {
  const session = await appClient.getSession()
  const user = session!.user
  const role = getRole(user)
  const isAdmin = role === "admin"
  const plan = getPlan(user)
  const planInfo = plans[plan]

  const [readiness, pipelines] = [
    await getWorkspaceReadiness(user.org_id!, user.org_name ?? "Workspace"),
    pipelineStatus(plan),
  ]
  const firstName = firstNameOf(user) || "there"

  // The two claims the login Actions add, as they appear in the token
  const claims: [string, unknown][] = [
    ["plan", user[PLAN_CLAIM_KEY] ?? plan],
    ["roles", user[ROLES_CLAIM_KEY] ?? [role]],
  ]

  const steps = [
    {
      title: "Upgrade to Team",
      body: "Unlock parallel pipelines, single sign-on, and verified domains.",
      href: "/dashboard/organization/plan",
      done: plan !== "free",
      status: `${planInfo.name} plan`,
    },
    {
      title: "Connect your identity provider",
      body: "Let employees sign in with Okta, Entra ID, or any SAML or OIDC provider.",
      href: "/dashboard/organization/sso",
      done: !!readiness.identityProvider,
      locked: !planInfo.sso,
      status: readiness.identityProvider
        ? `${readiness.identityProvider} connected`
        : planInfo.sso
          ? "Not connected"
          : "Needs Team",
    },
    {
      title: "Invite your team",
      body: "Send invitations and choose admin or member roles.",
      href: "/dashboard/organization/members",
      done: readiness.memberTotal > 1,
      status: `${readiness.memberTotal} member${readiness.memberTotal === 1 ? "" : "s"}`,
    },
    {
      title: "Verify your domain",
      body: "Prove you own your email domain so employees are routed to the right login.",
      href: "/dashboard/organization/domains",
      done: readiness.verifiedDomains > 0,
      status:
        readiness.verifiedDomains > 0
          ? `${readiness.verifiedDomains} verified`
          : readiness.pendingDomains > 0
            ? `${readiness.pendingDomains} pending`
            : "Optional",
    },
    {
      title: "Require MFA",
      body: "Enforce a second factor for every member of the workspace.",
      href: "/dashboard/organization/security-policies",
      done: readiness.mfaEnforced,
      status: readiness.mfaEnforced ? "On" : "Off",
    },
  ]
  const doneCount = steps.filter((s) => s.done).length

  const more = isAdmin
    ? [
        { href: "/dashboard/organization/general", label: "General settings" },
        { href: "/dashboard/organization/domains", label: "Domains" },
        {
          href: "/dashboard/organization/security-policies",
          label: "Security policies",
        },
        { href: "/dashboard/account/security", label: "Your security" },
        { href: "/dashboard/account/profile", label: "Profile" },
      ]
    : [
        { href: "/dashboard/account/security", label: "Your security" },
        { href: "/dashboard/account/profile", label: "Profile" },
      ]

  return (
    <div className="space-y-10">
      <section className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1 className="font-display mt-4 text-4xl sm:text-5xl">
            {readiness.name}
          </h1>
          <p className="text-muted-foreground mt-3 max-w-xl">
            Welcome, {firstName}. Here&apos;s where the workspace stands.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/organization/plan">
            <Badge variant="outline">{planInfo.name} plan</Badge>
          </Link>
          <Badge variant={isAdmin ? "brand" : "outline"} className="capitalize">
            {role}
          </Badge>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className={cardClass}>
          <p className="eyebrow">Plan</p>
          <p className="font-display mt-3 text-3xl">{planInfo.name}</p>
          <p className="text-muted-foreground mt-1 text-sm">
            {planInfo.runners === 1
              ? "1 concurrent runner"
              : `${planInfo.runners} concurrent runners`}{" "}
            · {planInfo.buildMinutes.toLocaleString()} build minutes a month
          </p>
          <div className="mt-auto pt-5">
            {isAdmin && plan === "free" && (
              <Button asChild className="w-full">
                <Link href="/dashboard/organization/plan">
                  Upgrade to Team <ArrowRightIcon className="size-4" />
                </Link>
              </Button>
            )}
            {isAdmin && plan !== "free" && !readiness.identityProvider && (
              <Button asChild className="w-full">
                <Link href="/dashboard/organization/sso">
                  Set up single sign-on <ArrowRightIcon className="size-4" />
                </Link>
              </Button>
            )}
            {isAdmin && plan !== "free" && readiness.identityProvider && (
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard/organization/plan">Manage plan</Link>
              </Button>
            )}
            {!isAdmin && (
              <p className="text-muted-foreground text-sm">
                Ask a workspace admin to change the plan.
              </p>
            )}
          </div>
        </div>

        <div className={cardClass}>
          <p className="eyebrow">Pipelines</p>
          <p className="font-display mt-3 text-3xl">
            {pipelines.running.length} running
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            {pipelines.queued.length > 0
              ? `${pipelines.queued.length} waiting for a runner · `
              : ""}
            {pipelines.inUse} of {pipelines.capacity} runners in use
          </p>
          <Link
            href="/dashboard/pipelines"
            className="text-brand-blue mt-auto inline-flex items-center gap-1 pt-5 text-sm font-medium hover:underline"
          >
            Open pipelines <ArrowRightIcon className="size-3.5" />
          </Link>
        </div>

        <div className={cardClass}>
          <p className="eyebrow">Your session</p>
          <dl className="mt-3 space-y-1.5 font-mono text-xs">
            {claims.map(([key, value]) => (
              <div key={key} className="flex items-baseline gap-3">
                <dt className="text-muted-foreground w-12 shrink-0">{key}</dt>
                <dd className="text-brand-ink truncate">
                  {JSON.stringify(value)}
                </dd>
              </div>
            ))}
          </dl>
          <p className="text-muted-foreground mt-2 text-xs">
            Added to your token at sign-in by Belay&apos;s login Actions.
          </p>
          <Link
            href="/dashboard/account/session"
            className="text-brand-blue mt-auto inline-flex items-center gap-1 pt-5 text-sm font-medium hover:underline"
          >
            View decoded token <ArrowRightIcon className="size-3.5" />
          </Link>
        </div>
      </section>

      {isAdmin && (
        <section>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Get enterprise-ready</p>
              <h2 className="font-display mt-3 text-3xl">
                The controls security reviews ask for
              </h2>
            </div>
            <p className="text-muted-foreground font-mono text-xs">
              {doneCount} of {steps.length} done
            </p>
          </div>
          <ol className="bg-card mt-5 divide-y rounded-xl border shadow-[0_1px_2px_rgb(20_18_11/0.04)]">
            {steps.map((step, i) => (
              <li key={step.href}>
                <Link
                  href={step.href}
                  className="group hover:bg-background/70 flex items-center gap-4 px-5 py-4 transition-colors"
                >
                  <span className="text-muted-foreground w-5 font-mono text-xs">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={cn(
                      "grid size-6 shrink-0 place-items-center rounded-full border",
                      step.done
                        ? "border-[#2d8a5e]/40 bg-[#e8f5ee] text-[#2d8a5e] dark:bg-[#2d8a5e]/15 dark:text-[#6fd3a3]"
                        : "text-muted-foreground/50"
                    )}
                  >
                    {step.done ? (
                      <CheckIcon className="size-3.5" />
                    ) : step.locked ? (
                      <LockIcon className="size-3" />
                    ) : (
                      <CircleIcon className="size-3" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block font-medium",
                        step.done &&
                          "text-muted-foreground line-through decoration-[1px]"
                      )}
                    >
                      {step.title}
                    </span>
                    <span className="text-muted-foreground block text-sm">
                      {step.body}
                    </span>
                  </span>
                  <Badge variant={step.done ? "success" : "outline"}>
                    {step.status}
                  </Badge>
                  <ArrowRightIcon className="text-muted-foreground group-hover:text-foreground size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t pt-6 text-sm">
        <span className="eyebrow">More</span>
        {more.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-muted-foreground hover:text-foreground"
          >
            {item.label}
          </Link>
        ))}
      </section>
    </div>
  )
}
