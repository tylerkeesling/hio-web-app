import Link from "next/link"
import { redirect } from "next/navigation"
import { ClientProvider } from "@/providers/client-provider"
import { Auth0Provider } from "@auth0/nextjs-auth0"
import { SettingsIcon } from "lucide-react"

import { appClient, managementClient } from "@/lib/auth0"
import { brand } from "@/lib/brand"
import { Button } from "@/components/ui/button"
import { BrandLogo, BrandMark } from "@/components/brand-logo"
import { DashboardNav } from "@/components/dashboard-nav"
import { ModeToggle } from "@/components/mode-toggle"
import { OrganizationSwitcher } from "@/components/organization-switcher"
import { UserNav } from "@/components/user-nav"

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await appClient.getSession()

  // if the user is not authenticated, redirect to login
  if (!session?.user) {
    redirect("/auth/login")
  }

  const { data: orgs } = await managementClient.users.getUserOrganizations({
    id: session.user.sub,
  })

  // if the user does not belong to any organizations, redirect to onboarding
  if (!orgs.length) {
    redirect("/onboarding/create")
  }

  return (
    <ClientProvider>
      <div className="bg-background flex min-h-screen flex-col">
        <header className="bg-card/85 sticky top-0 z-40 border-b pt-[env(safe-area-inset-top)] backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <Link href="/dashboard" aria-label="Dashboard home">
                <BrandMark />
              </Link>
              <span
                aria-hidden="true"
                className="bg-border h-5 w-px rotate-12"
              />
              <OrganizationSwitcher
                organizations={orgs.map((o) => ({
                  id: o.id,
                  slug: o.name,
                  displayName: o.display_name!,
                  logoUrl: o.branding?.logo_url,
                }))}
                currentOrgId={session.user.org_id!}
              />
              <DashboardNav className="ml-3 hidden md:flex" />
            </div>

            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" asChild className="md:hidden">
                <Link
                  href="/dashboard/organization/general"
                  aria-label="Organization settings"
                >
                  <SettingsIcon className="size-[1.1rem]" />
                </Link>
              </Button>
              <ModeToggle />
              <UserNav />
            </div>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          {children}
        </main>

        <footer className="border-t">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-6 sm:px-6 lg:px-8">
            <Link href="/" aria-label="Home">
              <BrandLogo
                markClassName="size-5"
                className="[&>span:last-child]:text-base"
              />
            </Link>
            <div className="text-muted-foreground flex items-center gap-6 text-sm">
              <Link href="/" className="hover:text-foreground">
                Home
              </Link>
              <Link href="/terms" className="hover:text-foreground">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-foreground">
                Privacy
              </Link>
              <span className="font-mono text-xs">
                © {new Date().getFullYear()} {brand.name}
              </span>
            </div>
          </div>
        </footer>
      </div>
    </ClientProvider>
  )
}
