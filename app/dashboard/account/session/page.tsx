import { appClient } from "@/lib/auth0"
import { PageHeader } from "@/components/page-header"

/**
 * Shows the claims in the current session's ID token. Useful on stage: the
 * plan and roles the login Actions added are visible without pasting a token
 * into a third-party decoder.
 */
export default async function SessionPage() {
  const session = await appClient.getSession()
  const namespace = process.env.CUSTOM_CLAIMS_NAMESPACE

  const claims =
    decodeJwtPayload(session?.tokenSet.idToken) ??
    (session?.user as Record<string, unknown> | undefined) ??
    {}

  const custom = Object.entries(claims).filter(([key]) =>
    key.startsWith(`${namespace}/`)
  )

  return (
    <div className="space-y-2">
      <PageHeader
        title="Session"
        description="The claims Auth0 issued for this login. Custom claims come from the post-login Actions."
      />

      <div className="space-y-8 px-6 pb-8">
        <section>
          <p className="eyebrow mb-3">Custom claims</p>
          {custom.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No custom claims under {namespace} were found in this token.
            </p>
          ) : (
            <dl className="bg-background divide-y rounded-lg border">
              {custom.map(([key, value]) => (
                <div
                  key={key}
                  className="grid gap-1 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] sm:gap-4"
                >
                  <dt className="truncate font-mono text-xs">
                    <span className="text-muted-foreground">{namespace}/</span>
                    <span className="text-brand-ink font-medium">
                      {key.slice(namespace!.length + 1)}
                    </span>
                  </dt>
                  <dd className="font-mono text-xs">{JSON.stringify(value)}</dd>
                </div>
              ))}
            </dl>
          )}
        </section>

        <section>
          <p className="eyebrow mb-3">Decoded ID token</p>
          <pre className="bg-background overflow-x-auto rounded-lg border p-4 font-mono text-xs leading-relaxed">
            {JSON.stringify(claims, null, 2)}
          </pre>
        </section>
      </div>
    </div>
  )
}

function decodeJwtPayload(token?: string): Record<string, unknown> | null {
  if (!token) return null

  const payload = token.split(".")[1]
  if (!payload) return null

  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"))
  } catch {
    return null
  }
}
