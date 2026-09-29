import {
  CheckIcon,
  FlaskConicalIcon,
  GitBranchIcon,
  HammerIcon,
  RocketIcon,
  ScanSearchIcon,
  ShieldCheckIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

const stages = [
  { icon: HammerIcon, name: "Build", detail: "Cache hit · 1m 12s" },
  {
    icon: FlaskConicalIcon,
    name: "Test",
    detail: "Smart selection skipped 212 of 486 tests",
  },
  { icon: ScanSearchIcon, name: "Security scan", detail: "0 critical · 2 low" },
]

export function PipelineMock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-card rounded-2xl border p-2 shadow-[0_24px_48px_-28px_rgb(20_18_11/0.25)]",
        className
      )}
    >
      <div className="flex items-center justify-between rounded-t-xl px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <GitBranchIcon className="text-muted-foreground size-4" />
          checkout-service
          <span className="text-muted-foreground font-mono text-xs font-normal">
            main · #4821
          </span>
        </div>
        <Badge variant="success">Running</Badge>
      </div>

      <ol className="bg-background/60 space-y-2 rounded-xl border p-3">
        {stages.map(({ icon: Icon, name, detail }) => (
          <li
            key={name}
            className="bg-card flex items-center gap-3 rounded-lg border px-3 py-2.5"
          >
            <span className="bg-background grid size-7 place-items-center rounded-md border">
              <Icon className="text-foreground/70 size-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{name}</p>
              <p className="text-muted-foreground truncate text-xs">{detail}</p>
            </div>
            <CheckIcon className="size-4 text-[#2d8a5e]" />
          </li>
        ))}

        <li className="border-brand/40 bg-card ring-brand/10 rounded-lg border px-3 py-2.5 ring-4">
          <div className="flex items-center gap-3">
            <span className="border-brand/40 bg-brand-soft grid size-7 place-items-center rounded-md border">
              <RocketIcon className="text-brand-ink size-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Deploy</p>
              <p className="text-muted-foreground text-xs">
                Canary rollout · prod-us-east
              </p>
            </div>
            <span className="text-muted-foreground font-mono text-xs">50%</span>
          </div>
          <div className="bg-muted mt-3 h-1.5 overflow-hidden rounded-full">
            <div className="from-brand-blue to-brand h-full w-1/2 rounded-full bg-gradient-to-r" />
          </div>
          <div className="text-muted-foreground mt-2 flex items-center gap-1.5 text-xs">
            <ShieldCheckIcon className="size-3.5 text-[#2d8a5e]" />
            Error budget healthy · auto-rollback armed
          </div>
        </li>
      </ol>
    </div>
  )
}

const members = [
  {
    name: "Ada Park",
    email: "ada@contoso.com",
    role: "Admin",
    mfa: "Passkey",
    status: "Active",
  },
  {
    name: "Sam Rivera",
    email: "sam@contoso.com",
    role: "Member",
    mfa: "Authenticator",
    status: "Active",
  },
  {
    name: "Priya Nair",
    email: "priya@contoso.com",
    role: "Admin",
    mfa: "Security key",
    status: "Active",
  },
  {
    name: "Jordan Lee",
    email: "jordan@contoso.com",
    role: "Member",
    mfa: "—",
    status: "Invited",
  },
]

export function MembersMock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-card rounded-2xl border shadow-[0_24px_48px_-28px_rgb(20_18_11/0.25)]",
        className
      )}
    >
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div>
          <p className="text-sm font-medium">Organization members</p>
          <p className="text-muted-foreground text-xs">Contoso · 4 members</p>
        </div>
        <span className="bg-primary text-primary-foreground rounded-md px-2.5 py-1 text-xs font-medium">
          Invite
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="text-muted-foreground text-xs">
            <tr className="border-b">
              <th className="px-5 py-2.5 font-medium">Member</th>
              <th className="px-3 py-2.5 font-medium">Role</th>
              <th className="px-3 py-2.5 font-medium">MFA</th>
              <th className="px-5 py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.email} className="border-b last:border-0">
                <td className="px-5 py-3">
                  <p className="font-medium">{m.name}</p>
                  <p className="text-muted-foreground text-xs">{m.email}</p>
                </td>
                <td className="px-3 py-3">
                  <Badge variant="outline">{m.role}</Badge>
                </td>
                <td className="px-3 py-3">
                  {m.mfa === "—" ? (
                    <span className="text-muted-foreground">—</span>
                  ) : (
                    <Badge variant="brand">{m.mfa}</Badge>
                  )}
                </td>
                <td className="px-5 py-3">
                  <Badge
                    variant={m.status === "Active" ? "success" : "secondary"}
                  >
                    {m.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
