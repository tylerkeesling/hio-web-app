import { redirect } from "next/navigation"

import { emailVerificationRequired } from "@/lib/onboarding"

export default async function VerifyLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // With the verify step disabled, send anyone who lands here on to org creation
  if (!emailVerificationRequired) {
    redirect("/onboarding/create")
  }

  return <main className="min-h-screen">{children}</main>
}
