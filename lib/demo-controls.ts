import { createHmac, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"

import { managementClient } from "./auth0"

/**
 * Demo controls: a hidden switch on the landing page that forces Auth0's Bot
 * Detection challenge, which a presenter's laptop never triggers on its own.
 * Disabled unless DEMO_CONTROLS_KEY is set, and only active in a browser that
 * opened /demo?key=<DEMO_CONTROLS_KEY> first.
 */
export const DEMO_CONTROLS_COOKIE = "belay_demo_controls"

export type BotChallengePolicy = "never" | "when_risky" | "always"

// The cookie holds a digest of the key, never the key itself
function expectedToken() {
  const key = process.env.DEMO_CONTROLS_KEY
  return key
    ? createHmac("sha256", key).update("belay-demo-controls").digest("hex")
    : null
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

/** The cookie value that unlocks demo controls, or null when the key is wrong. */
export function demoControlsToken(key: string | null) {
  const expected = process.env.DEMO_CONTROLS_KEY
  return expected && key && safeEqual(key, expected) ? expectedToken() : null
}

export async function demoControlsUnlocked() {
  const token = expectedToken()
  const cookie = (await cookies()).get(DEMO_CONTROLS_COOKIE)?.value
  return !!token && !!cookie && safeEqual(cookie, token)
}

export async function getBotChallengePolicy(): Promise<BotChallengePolicy> {
  const { data } = await managementClient.attackProtection.getBotDetectionConfig()
  return data.challenge_password_policy
}

export async function setBotChallengePolicy(policy: BotChallengePolicy) {
  await managementClient.attackProtection.updateBotDetectionConfig({
    challenge_password_policy: policy,
  })
}
