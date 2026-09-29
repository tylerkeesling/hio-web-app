"use client"

import { CheckIcon } from "lucide-react"
import { toast } from "sonner"

import { Plan, PLAN_ORDER, plans } from "@/lib/plan"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { SubmitButton } from "@/components/submit-button"

import { changePlan } from "./actions"

export function PlanPicker({ current }: { current: Plan }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {PLAN_ORDER.map((key) => {
        const plan = plans[key]
        const isCurrent = key === current
        const isUpgrade = PLAN_ORDER.indexOf(key) > PLAN_ORDER.indexOf(current)

        return (
          <form
            key={key}
            className={cn(
              "bg-background flex flex-col rounded-xl border p-6",
              isCurrent && "border-brand/40 ring-brand/10 ring-4"
            )}
            action={async (formData: FormData) => {
              const result = await changePlan(formData)

              if (result?.error) {
                toast.error(result.error)
              }
            }}
          >
            <input type="hidden" name="plan" value={key} />

            <div className="flex items-center justify-between">
              <p className="font-display text-2xl">{plan.name}</p>
              {isCurrent && <Badge variant="brand">Current plan</Badge>}
            </div>
            <p className="mt-2 flex items-baseline gap-1.5">
              <span className="text-3xl font-medium">{plan.price}</span>
              <span className="text-muted-foreground text-xs">
                {plan.period}
              </span>
            </p>
            <p className="text-muted-foreground mt-3 text-sm">{plan.tagline}</p>

            <ul className="mt-6 flex-1 space-y-2.5 text-sm">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-[#2d8a5e]" />
                  {feature}
                </li>
              ))}
            </ul>

            <SubmitButton
              size="lg"
              className="mt-8 w-full"
              variant={isUpgrade ? "default" : "outline"}
              disabled={isCurrent}
            >
              {isCurrent
                ? "Your current plan"
                : isUpgrade
                  ? `Upgrade to ${plan.name}`
                  : `Switch to ${plan.name}`}
            </SubmitButton>
          </form>
        )
      })}
    </div>
  )
}
