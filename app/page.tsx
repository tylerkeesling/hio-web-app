import Link from "next/link"
import {
  ArrowRightIcon,
  CircleCheckIcon,
  FingerprintIcon,
  GaugeIcon,
  GlobeLockIcon,
  KeyRoundIcon,
  LayersIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
  UsersIcon,
  WorkflowIcon,
} from "lucide-react"

import { appClient } from "@/lib/auth0"
import { brand } from "@/lib/brand"
import { demoControlsUnlocked, getBotChallengePolicy } from "@/lib/demo-controls"
import { Button } from "@/components/ui/button"
import { HeroIllustration } from "@/components/marketing/hero-illustration"
import { MembersMock, PipelineMock } from "@/components/marketing/product-mocks"
import { SiteFooter } from "@/components/marketing/site-footer"
import { SiteHeader } from "@/components/marketing/site-header"

import { BotChallengeTrigger } from "./bot-challenge-trigger"
import { SignUpForm } from "./signup-form"
import { WelcomeBackCard } from "./welcome-back-card"

const stats = [
  { label: "Deployments / mo", value: "4.2M" },
  { label: "Pipelines", value: "180K+" },
  { label: "Platform uptime", value: "99.99%" },
]

const customers = [
  "Contoso",
  "Fabrikam",
  "Northwind",
  "Tailspin",
  "Wingtip",
  "Adatum",
]

const platformPoints = [
  {
    icon: WorkflowIcon,
    title: "Pipelines that reason",
    body: "Every stage adapts to the change: build what moved, test what matters.",
  },
  {
    icon: GaugeIcon,
    title: "Progressive delivery",
    body: "Canary and blue-green rollouts with automatic verification and rollback.",
  },
  {
    icon: LayersIcon,
    title: "Ship anything, anywhere",
    body: "Services, infrastructure, data, and AI agents on any cloud.",
  },
]

const identityFeatures = [
  {
    icon: KeyRoundIcon,
    title: "Self-service SSO",
    body: "Customer admins connect Okta, Entra ID, or any SAML or OIDC provider on their own.",
  },
  {
    icon: RefreshCwIcon,
    title: "Directory sync",
    body: "SCIM provisioning keeps members in step with the customer's directory.",
  },
  {
    icon: GlobeLockIcon,
    title: "Verified domains",
    body: "Prove ownership once, then route every employee to the right login.",
  },
  {
    icon: FingerprintIcon,
    title: "Enforced MFA",
    body: "Passkeys, security keys, and authenticator apps, required per organization.",
  },
]

const protocols = ["SAML 2.0", "OpenID Connect", "SCIM 2.0", "WebAuthn", "TOTP"]

const quotes = [
  {
    company: "Contoso",
    quote:
      "We moved 40 teams onto one delivery platform in a quarter. Releases went from a weekly event to something nobody notices.",
    who: "VP, Platform Engineering",
  },
  {
    company: "Fabrikam",
    quote:
      "Our customers' security reviews used to take weeks. SSO, SCIM, and MFA policies out of the box closed that gap.",
    who: "Director of Security",
  },
  {
    company: "Northwind",
    quote:
      "Canary analysis caught a bad build before it reached one percent of traffic. That paid for the platform on day one.",
    who: "Staff SRE",
  },
]

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="border-field-border bg-field text-foreground/75 rounded-md border px-2.5 py-1 text-xs">
      {children}
    </span>
  )
}

function FeatureList({
  items,
}: {
  items: { icon: React.ElementType; title: string; body: string }[]
}) {
  return (
    <ul className="mt-10 divide-y border-y">
      {items.map(({ icon: Icon, title, body }) => (
        <li key={title} className="flex gap-4 py-5">
          <Icon className="text-foreground/60 mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-medium">{title}</p>
            <p className="text-muted-foreground mt-1">{body}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default async function Home() {
  const [session, demoControls] = await Promise.all([
    appClient.getSession(),
    demoControlsUnlocked(),
  ])
  const botPolicy = demoControls
    ? await getBotChallengePolicy().catch(() => null)
    : null

  return (
    <div className="bg-background min-h-screen">
      <SiteHeader signedIn={!!session} />

      <main>
        {/* Hero */}
        <section className="bg-hero-wash relative overflow-hidden border-b">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pt-14 pb-16 sm:px-6 md:pt-20 lg:grid-cols-[1.1fr_1fr] lg:px-8 lg:pb-24">
            <div>
              {demoControls ? (
                <BotChallengeTrigger initialPolicy={botPolicy}>
                  Software delivery, secured
                </BotChallengeTrigger>
              ) : (
                <p className="eyebrow">Software delivery, secured</p>
              )}
              <h1 className="font-display mt-6 max-w-2xl text-5xl text-balance sm:text-6xl lg:text-[4.5rem]">
                {brand.tagline}
              </h1>
              <p className="text-foreground/75 mt-6 max-w-xl text-lg leading-relaxed">
                {brand.description}
              </p>
              <div id="get-started" className="mt-9 scroll-mt-24">
                {session ? (
                  <WelcomeBackCard name={session.user.name} />
                ) : (
                  <SignUpForm />
                )}
              </div>
            </div>
            <HeroIllustration className="mx-auto w-full max-w-[520px] lg:max-w-none" />
          </div>
        </section>

        {/* Scale band */}
        <section className="border-b">
          <div className="mx-auto max-w-7xl lg:border-x">
            <div className="flex flex-col gap-6 border-b px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:gap-12 lg:px-10">
              <h2 className="font-display text-3xl">
                Built for enterprise scale
              </h2>
              <dl className="flex flex-wrap gap-x-8 gap-y-3">
                {stats.map((s) => (
                  <div key={s.label} className="flex items-center gap-2.5">
                    <dt className="eyebrow">{s.label}</dt>
                    <dd className="bg-brand-soft text-brand-ink rounded-md px-2 py-1 font-mono text-xs font-medium">
                      {s.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="grid grid-cols-2 gap-3 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:grid-cols-6 lg:px-10">
              {customers.map((c) => (
                <div
                  key={c}
                  className="bg-muted/70 font-display text-foreground/40 grid h-16 place-items-center rounded-lg text-xl"
                >
                  {c}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Platform */}
        <section id="platform" className="scroll-mt-14 border-b">
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:border-x lg:px-10 lg:py-28">
            <div>
              <p className="eyebrow">Build · Test · Deploy</p>
              <h2 className="font-display mt-5 text-4xl sm:text-5xl">
                One platform from commit to production
              </h2>
              <p className="text-muted-foreground mt-5 max-w-xl text-lg leading-relaxed">
                {brand.name} connects every step of delivery with guardrails
                that catch risk before customers do, and verification that
                proves every release is healthy.
              </p>
              <a
                href="#security"
                className="text-brand-blue mt-6 inline-flex items-center gap-1 font-medium hover:underline"
              >
                See how it stays secure <ArrowRightIcon className="size-4" />
              </a>
              <FeatureList items={platformPoints} />
              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  "Continuous Integration",
                  "Continuous Delivery",
                  "Feature Flags",
                  "Test Intelligence",
                ].map((c) => (
                  <Chip key={c}>{c}</Chip>
                ))}
              </div>
            </div>
            <PipelineMock className="mx-auto w-full max-w-lg" />
          </div>
        </section>

        {/* Enterprise identity */}
        <section id="security" className="scroll-mt-14 border-b">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:border-x lg:px-10 lg:py-28">
            <div className="mx-auto max-w-2xl text-center">
              <p className="eyebrow">Enterprise ready</p>
              <h2 className="font-display mt-5 text-4xl sm:text-5xl">
                Identity your security team will sign off on
              </h2>
              <p className="text-muted-foreground mt-4 text-lg">
                Every workspace ships with the controls enterprise buyers ask
                for.
              </p>
            </div>

            <div className="bg-card mt-14 overflow-hidden rounded-xl border">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4">
                {identityFeatures.map(({ icon: Icon, title, body }, i) => (
                  <div
                    key={title}
                    className={
                      "border-border p-6 " +
                      (i > 0 ? "border-t sm:border-t-0 " : "") +
                      (i % 2 === 1 ? "sm:border-l " : "") +
                      (i >= 2 ? "sm:border-t lg:border-t-0 " : "") +
                      (i > 0 ? "lg:border-l" : "")
                    }
                  >
                    <Icon className="text-foreground/60 size-5" />
                    <p className="mt-5 font-medium">{title}</p>
                    <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                      {body}
                    </p>
                  </div>
                ))}
              </div>
              <div className="bg-background/60 grid grid-cols-2 gap-3 border-t p-4 sm:grid-cols-3 lg:grid-cols-5">
                {protocols.map((p) => (
                  <div
                    key={p}
                    className="bg-card text-foreground/80 flex items-center justify-center gap-2 rounded-lg border px-3 py-4 text-sm"
                  >
                    <CircleCheckIcon className="size-4 text-[#2d8a5e]" />
                    {p}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-24 grid items-center gap-14 lg:grid-cols-2">
              <MembersMock className="order-last w-full lg:order-first" />
              <div>
                <p className="eyebrow">Admin console</p>
                <h3 className="font-display mt-5 text-4xl">
                  Team management, built in
                </h3>
                <p className="text-muted-foreground mt-5 text-lg leading-relaxed">
                  Customer admins invite teammates, assign roles, and require
                  strong authentication without filing a ticket.
                </p>
                <Link
                  href="/dashboard"
                  className="text-brand-blue mt-6 inline-flex items-center gap-1 font-medium hover:underline"
                >
                  Open the admin console <ArrowRightIcon className="size-4" />
                </Link>
                <FeatureList
                  items={[
                    {
                      icon: UsersIcon,
                      title: "Invitations and roles",
                      body: "Admin and member roles flow into every token.",
                    },
                    {
                      icon: ShieldCheckIcon,
                      title: "Security policies",
                      body: "Require MFA for everyone in the organization.",
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Customers */}
        <section id="customers" className="scroll-mt-14 border-b">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:border-x lg:px-10 lg:py-28">
            <h2 className="font-display mx-auto max-w-3xl text-center text-4xl text-balance sm:text-5xl">
              Engineering teams ship on {brand.name}
            </h2>
            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {quotes.map((q) => (
                <figure
                  key={q.company}
                  className="bg-card flex flex-col justify-between gap-10 border p-7"
                >
                  <p className="font-display text-foreground/50 text-2xl">
                    {q.company}
                  </p>
                  <blockquote className="text-lg leading-relaxed">
                    &ldquo;{q.quote}&rdquo;
                  </blockquote>
                  <figcaption className="text-sm font-medium">
                    — {q.who}, {q.company}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* Call to action */}
        <section className="dark:bg-card bg-[#14120b] text-white">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-4 py-16 sm:px-6 md:flex-row md:items-center lg:px-10">
            <div>
              <p className="eyebrow text-white/50">Get started</p>
              <h2 className="font-display mt-4 text-4xl sm:text-5xl">
                Ready to ship on {brand.name}?
              </h2>
            </div>
            <Button
              size="lg"
              asChild
              className="bg-white text-[#14120b] hover:bg-white/90"
            >
              <a href={session ? "/dashboard" : "#get-started"}>
                {session ? "Go to dashboard" : "Start for free"}
                <ArrowRightIcon className="size-4" />
              </a>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
