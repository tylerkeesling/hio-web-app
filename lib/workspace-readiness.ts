import { managementClient } from "./auth0"
import { DEFAULT_MFA_POLICY, MfaPolicy } from "./mfa-policy"

// Enterprise connection strategies, with the label the Overview shows
const ENTERPRISE_STRATEGIES: Record<string, string> = {
  okta: "Okta",
  waad: "Entra ID",
  samlp: "SAML",
  oidc: "OIDC",
  adfs: "ADFS",
  "google-apps": "Google Workspace",
  pingfederate: "PingFederate",
  ad: "Active Directory",
  "auth0-adldap": "Active Directory",
}

export interface WorkspaceReadiness {
  name: string
  memberTotal: number
  /** Label of the first enterprise connection enabled on the workspace, if any */
  identityProvider: string | null
  verifiedDomains: number
  pendingDomains: number
  mfaEnforced: boolean
}

/**
 * The live state behind the Overview's enterprise-readiness checklist. Each
 * lookup fails soft so one unavailable API never blanks the page.
 */
export async function getWorkspaceReadiness(
  orgId: string,
  fallbackName: string
): Promise<WorkspaceReadiness> {
  const [org, members, connections, domains] = await Promise.all([
    managementClient.organizations.get({ id: orgId }).catch(() => null),
    managementClient.organizations
      .getMembers({ id: orgId, per_page: 1, include_totals: true })
      .catch(() => null),
    managementClient.organizations
      .getEnabledConnections({ id: orgId })
      .catch(() => null),
    managementClient.organizations
      .getAllDiscoveryDomains({ id: orgId })
      .catch(() => null),
  ])

  const enterprise = connections?.data.find(
    (item) => item.connection?.strategy in ENTERPRISE_STRATEGIES
  )
  const domainList = domains?.data.domains ?? []

  return {
    name: org?.data.display_name || org?.data.name || fallbackName,
    memberTotal: members?.data.total ?? 1,
    identityProvider: enterprise
      ? ENTERPRISE_STRATEGIES[enterprise.connection.strategy]
      : null,
    verifiedDomains: domainList.filter((d) => d.status === "verified").length,
    pendingDomains: domainList.filter((d) => d.status !== "verified").length,
    mfaEnforced: parseMfaPolicy(org?.data.metadata?.mfaPolicy).enforce,
  }
}

function parseMfaPolicy(raw?: string): MfaPolicy {
  if (!raw) return DEFAULT_MFA_POLICY
  try {
    return { ...DEFAULT_MFA_POLICY, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_MFA_POLICY
  }
}
