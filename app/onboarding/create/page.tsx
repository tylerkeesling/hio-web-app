import Link from "next/link"

import { AuthShell } from "@/components/auth-shell"

import { CreateOrganizationForm } from "./create-organization-form"

export default async function Create() {
  return (
    <AuthShell
      title="Create your organization"
      description="Name the workspace your team will share. You can invite teammates next."
      footer={
        <>
          By continuing, you agree to our{" "}
          <Link href="/terms" className="underline underline-offset-2">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline underline-offset-2">
            Privacy Policy
          </Link>
          .
        </>
      }
    >
      <CreateOrganizationForm />
    </AuthShell>
  )
}
