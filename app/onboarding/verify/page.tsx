"use client"

import { MailCheckIcon } from "lucide-react"
import { toast } from "sonner"

import { AuthShell } from "@/components/auth-shell"
import { SubmitButton } from "@/components/submit-button"

import { resendVerificationEmail } from "./actions"

export default function Verify() {
  return (
    <AuthShell
      title="Check your inbox"
      description="We sent a verification link to your email. Open it to continue creating your account."
      footer="Didn't get it? Check your spam folder, or resend the link above."
    >
      <div className="flex flex-col items-center gap-6">
        <span className="bg-card grid size-14 place-items-center rounded-xl border shadow-[0_1px_2px_rgb(20_18_11/0.04)]">
          <MailCheckIcon className="text-brand-blue size-6" />
        </span>
        <form
          className="w-full"
          action={async () => {
            const { error } = await resendVerificationEmail()

            if (error) {
              toast.error(error)
              return
            }

            toast.success(
              "The verification e-mail has successfully been sent. Please check your inbox."
            )
          }}
        >
          <SubmitButton variant="outline" size="lg" className="w-full">
            Resend verification email
          </SubmitButton>
        </form>
      </div>
    </AuthShell>
  )
}
