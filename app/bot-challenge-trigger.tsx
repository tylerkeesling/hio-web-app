"use client"

import { useEffect, useEffectEvent, useState, useTransition } from "react"

import { cn } from "@/lib/utils"
import type { BotChallengePolicy } from "@/lib/demo-controls"

import { toggleBotChallenge } from "./actions/demo-controls"

const PRESS_WINDOW_MS = 800

/**
 * The hero eyebrow, with a hidden switch for the Bot Detection challenge.
 * Triple-click the text, or press B three times outside a text field. The dot
 * turns amber while every sign-up is challenged, and red if the change failed.
 */
export function BotChallengeTrigger({
  initialPolicy,
  children,
}: {
  initialPolicy: BotChallengePolicy | null
  children: React.ReactNode
}) {
  const [policy, setPolicy] = useState(initialPolicy)
  const [failed, setFailed] = useState(initialPolicy === null)
  const [pending, startTransition] = useTransition()

  const toggle = useEffectEvent(() => {
    if (pending) return
    startTransition(async () => {
      const result = await toggleBotChallenge()
      setFailed(!result.policy)
      if (result.policy) setPolicy(result.policy)
    })
  })

  useEffect(() => {
    let presses: number[] = []

    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "b" || event.metaKey || event.ctrlKey) {
        return
      }
      if ((event.target as HTMLElement).closest("input, textarea")) return

      const now = Date.now()
      presses = [...presses.filter((t) => now - t < PRESS_WINDOW_MS), now]
      if (presses.length >= 3) {
        presses = []
        toggle()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <p
      className="eyebrow select-none"
      onClick={(event) => event.detail === 3 && toggle()}
    >
      {children}
      <span
        aria-hidden="true"
        className={cn(
          "ml-2 inline-block size-1.5 rounded-full align-middle transition-colors",
          pending
            ? "bg-foreground/25 animate-pulse"
            : failed
              ? "bg-red-500"
              : policy === "always"
                ? "bg-amber-500"
                : "bg-transparent"
        )}
      />
    </p>
  )
}
