"use server"

import {
  type BotChallengePolicy,
  demoControlsUnlocked,
  getBotChallengePolicy,
  setBotChallengePolicy,
} from "@/lib/demo-controls"

/**
 * Switches the Bot Detection challenge for password sign-ups and logins
 * between "always" (everyone sees it) and "when_risky" (Auth0 decides). The
 * setting is tenant-wide, so only a browser unlocked for demo controls may
 * change it.
 */
export async function toggleBotChallenge(): Promise<{
  policy?: BotChallengePolicy
  error?: string
}> {
  if (!(await demoControlsUnlocked())) {
    return { error: "Not available." }
  }

  try {
    const current = await getBotChallengePolicy()
    const policy = current === "always" ? "when_risky" : "always"
    await setBotChallengePolicy(policy)
    return { policy }
  } catch (error) {
    console.error("failed to change the bot detection policy", error)
    return { error: "Failed to change the bot detection policy." }
  }
}
