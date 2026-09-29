import { SidebarNav } from "@/components/sidebar-nav"

const sidebarNavItems = [
  {
    title: "Profile",
    href: "/dashboard/account/profile",
  },
  {
    title: "Security",
    href: "/dashboard/account/security",
  },
  {
    title: "Session",
    href: "/dashboard/account/session",
  },
]

interface AccountLayoutProps {
  children: React.ReactNode
}

export default async function AccountLayout({ children }: AccountLayoutProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
      <aside className="lg:pt-6">
        <p className="eyebrow mb-3 hidden px-3 lg:block">Account</p>
        <SidebarNav items={sidebarNavItems} />
      </aside>
      <div className="bg-card min-w-0 rounded-xl border p-2 shadow-[0_1px_2px_rgb(20_18_11/0.04)]">
        <div className="mx-auto max-w-6xl">{children}</div>
      </div>
    </div>
  )
}
