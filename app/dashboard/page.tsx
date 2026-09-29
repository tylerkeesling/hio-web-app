import Link from "next/link"
import {
  ArrowRightIcon,
  FingerprintIcon,
  GlobeLockIcon,
  KeyRoundIcon,
  ShieldCheckIcon,
  UserRoundIcon,
  UsersIcon,
  WorkflowIcon,
} from "lucide-react"

import { appClient, managementClient } from "@/lib/auth0"
import { getPlan, plans } from "@/lib/plan"
import { getRole } from "@/lib/roles"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const shortcuts = [
  {
    href: "/dashboard/pipelines",
    icon: WorkflowIcon,
    title: "Pipelines",
    body: "Recent runs and the runners your plan includes.",
    adminOnly: false,
  },
  {
    href: "/dashboard/organization/members",
    icon: UsersIcon,
    title: "Members",
    body: "Invite teammates and manage their roles.",
    adminOnly: true,
  },
  {
    href: "/dashboard/organization/sso",
    icon: KeyRoundIcon,
    title: "Single sign-on",
    body: "Connect a SAML or OIDC identity provider.",
    adminOnly: true,
  },
  {
    href: "/dashboard/organization/domains",
    icon: GlobeLockIcon,
    title: "Domains",
    body: "Verify the email domains your company owns.",
    adminOnly: true,
  },
  {
    href: "/dashboard/organization/security-policies",
    icon: ShieldCheckIcon,
    title: "Security policies",
    body: "Require multi-factor authentication for everyone.",
    adminOnly: true,
  },
  {
    href: "/dashboard/account/security",
    icon: FingerprintIcon,
    title: "Your security",
    body: "Add a passkey, security key, or authenticator app.",
    adminOnly: false,
  },
  {
    href: "/dashboard/account/profile",
    icon: UserRoundIcon,
    title: "Profile",
    body: "Update your display name and account details.",
    adminOnly: false,
  },
]

const setupSteps = [
  {
    href: "/dashboard/organization/members",
    title: "Invite your team",
    body: "Send invitations and choose admin or member roles.",
  },
  {
    href: "/dashboard/organization/plan",
    title: "Upgrade to Team",
    body: "Unlock parallel pipelines, single sign-on, and verified domains.",
  },
  {
    href: "/dashboard/organization/domains",
    title: "Verify your domain",
    body: "Add a DNS record to prove you own your email domain.",
  },
  {
    href: "/dashboard/organization/sso",
    title: "Connect your identity provider",
    body: "Let employees sign in with the directory they already use.",
  },
  {
    href: "/dashboard/organization/security-policies",
    title: "Require MFA",
    body: "Enforce a second factor for every member of the organization.",
  },
]

async function getOrganizationName(orgId?: string) {
  if (!orgId) return undefined
  try {
    const { data } = await managementClient.organizations.get({ id: orgId })
    return data.display_name || data.name
  } catch {
    return undefined
  }
}

export default async function DashboardHome() {
  const session = await appClient.getSession()
  const user = session!.user
  const role = getRole(user)
  const plan = getPlan(user)
  const isAdmin = role === "admin"
  const orgName = await getOrganizationName(user.org_id)
  // Database signups get the email as their name; use the nickname then
  const firstName =
    user.given_name ||
    (user.name && !user.name.includes("@") ? user.name.split(" ")[0] : "") ||
    user.nickname ||
    "there"

  return (
    <div className="space-y-12">
      <section className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Workspace{orgName ? ` · ${orgName}` : ""}</p>
          <h1 className="font-display mt-4 text-4xl sm:text-5xl">
            Welcome, {firstName}
          </h1>
          <p className="text-muted-foreground mt-3 max-w-xl">
            Manage who can access your organization and how they sign in, all
            from one place.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/organization/plan">
            <Badge variant="outline">{plans[plan].name} plan</Badge>
          </Link>
          <Badge variant={isAdmin ? "brand" : "outline"} className="capitalize">
            {role}
          </Badge>
          {isAdmin && (
            <Button asChild>
              <Link href="/dashboard/organization/general">
                Organization settings <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
          )}
        </div>
      </section>

      <section className="bg-card overflow-hidden rounded-xl border shadow-[0_1px_2px_rgb(20_18_11/0.04)]">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3">
          {shortcuts.map(({ href, icon: Icon, title, body, adminOnly }) => {
            const locked = adminOnly && !isAdmin
            return (
              <Link
                key={href}
                href={href}
                className="group hover:bg-background/70 -mt-px -ml-px flex flex-col border-t border-l p-6 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="bg-background grid size-9 place-items-center rounded-lg border">
                    <Icon className="text-foreground/70 size-4" />
                  </span>
                  {locked && <Badge variant="outline">Admins only</Badge>}
                </div>
                <p className="mt-5 font-medium">{title}</p>
                <p className="text-muted-foreground mt-1 text-sm">{body}</p>
                <span className="text-brand-blue mt-4 inline-flex items-center gap-1 text-sm font-medium">
                  Open
                  <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      {isAdmin && (
        <section className="grid gap-8 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <p className="eyebrow">Setup guide</p>
            <h2 className="font-display mt-4 text-3xl">
              Get your organization enterprise-ready
            </h2>
            <p className="text-muted-foreground mt-3">
              Four steps to the identity controls security reviews ask for.
            </p>
          </div>
          <ol className="bg-card divide-y rounded-xl border shadow-[0_1px_2px_rgb(20_18_11/0.04)]">
            {setupSteps.map((step, i) => (
              <li key={step.href}>
                <Link
                  href={step.href}
                  className="group hover:bg-background/70 flex items-center gap-5 px-5 py-4 transition-colors"
                >
                  <span className="text-muted-foreground font-mono text-xs">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{step.title}</p>
                    <p className="text-muted-foreground text-sm">{step.body}</p>
                  </div>
                  <ArrowRightIcon className="text-muted-foreground group-hover:text-foreground size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  )
}
