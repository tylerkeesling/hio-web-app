import { User } from "@auth0/nextjs-auth0/types"

// The plan a workspace is on. It is stored on the Auth0 Organization's metadata
// (see lib/provisioning.ts and the Plan & billing page) and copied into every
// token by the Belay Provisioning Action, so one metadata change upgrades the
// whole team and the app can gate features by reading a claim.
export const PLAN_CLAIM_KEY = `${process.env.CUSTOM_CLAIMS_NAMESPACE}/plan`

export const plans = {
  free: {
    name: "Free",
    price: "$0",
    period: "forever",
    tagline: "For developers trying Belay on a side project.",
    runners: 1,
    buildMinutes: 500,
    sso: false,
    features: [
      "1 concurrent runner",
      "500 build minutes a month",
      "Unlimited pipelines",
      "Community support",
    ],
  },
  team: {
    name: "Team",
    price: "$49",
    period: "per seat, per month",
    tagline: "For teams that need parallel pipelines and single sign-on.",
    runners: 10,
    buildMinutes: 5000,
    sso: true,
    features: [
      "10 concurrent runners",
      "5,000 build minutes a month",
      "SSO with SAML or OIDC",
      "Verified domains",
      "Enforced MFA",
    ],
  },
  enterprise: {
    name: "Enterprise",
    price: "Custom",
    period: "annual contract",
    tagline: "For organizations with compliance and scale requirements.",
    runners: 100,
    buildMinutes: 100000,
    sso: true,
    features: [
      "Unlimited concurrent runners",
      "SCIM directory sync",
      "Audit log export",
      "Dedicated support",
    ],
  },
} as const

export type Plan = keyof typeof plans

export const PLAN_ORDER: Plan[] = ["free", "team", "enterprise"]
export const DEFAULT_PLAN: Plan = "free"

export function isPlan(value: unknown): value is Plan {
  return typeof value === "string" && value in plans
}

/**
 * The plan the login Action put in the user's token. A missing or unknown
 * value means the workspace was never upgraded, so it is treated as free.
 */
export function getPlan(user: User): Plan {
  const claim = user[PLAN_CLAIM_KEY]
  return isPlan(claim) ? claim : DEFAULT_PLAN
}
