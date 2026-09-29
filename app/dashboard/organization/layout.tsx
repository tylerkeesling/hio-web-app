import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeftIcon } from "@radix-ui/react-icons"

import { appClient } from "@/lib/auth0"
import { getRole } from "@/lib/roles"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SidebarNav } from "@/components/sidebar-nav"

const sidebarNavItems = [
  {
    title: "General Settings",
    href: "/dashboard/organization/general",
  },
  {
    title: "Plan & billing",
    href: "/dashboard/organization/plan",
  },
  {
    title: "Members",
    href: "/dashboard/organization/members",
  },
  {
    title: "Domains",
    href: "/dashboard/organization/domains",
  },
  {
    title: "SSO",
    href: "/dashboard/organization/sso",
  },
  {
    title: "Security Policies",
    href: "/dashboard/organization/security-policies",
  },
]

interface AccountLayoutProps {
  children: React.ReactNode
}

export default async function AccountLayout({ children }: AccountLayoutProps) {
  const session = await appClient.getSession()

  // if the user is not authenticated, redirect to login
  if (!session?.user) {
    redirect("/auth/login")
  }

  if (getRole(session.user) !== "admin") {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-3">
            <p className="eyebrow">Admins only</p>
            <CardTitle className="font-display text-3xl font-normal">
              You need admin access
            </CardTitle>
            <CardDescription className="space-y-1.5 text-sm">
              <span className="block">
                You&apos;re signed in with the{" "}
                <span className="text-foreground font-medium">
                  {getRole(session.user)}
                </span>{" "}
                role.
              </span>
              <span className="block">
                Ask an organization admin to change your role, or sign in as an
                admin to manage these settings.
              </span>
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="/dashboard">
                <ArrowLeftIcon className="size-4" /> Back to overview
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
      <aside className="lg:pt-6">
        <p className="eyebrow mb-3 hidden px-3 lg:block">Organization</p>
        <SidebarNav items={sidebarNavItems} />
      </aside>
      <div className="bg-card min-w-0 rounded-xl border p-2 shadow-[0_1px_2px_rgb(20_18_11/0.04)]">
        <div className="mx-auto max-w-6xl">{children}</div>
      </div>
    </div>
  )
}
