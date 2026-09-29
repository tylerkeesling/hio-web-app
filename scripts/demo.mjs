#!/usr/bin/env node
// Demo helpers for the Belay tenant. All of them use the Auth0 CLI session
// (run `auth0 login` first) and read the app's configuration from .env.local.
//
//   npm run demo:action [-- --url https://belay.example.com]
//       Create or update, deploy, and bind the Belay Provisioning Action. Pass
//       the app's public URL once it is deployed; the Action cannot reach localhost.
//
//   npm run demo:bot on|off
//       Force the bot-detection challenge on every password sign-up (on), or
//       restore the default so it only fires when Auth0 suspects a bot (off).
//
//   npm run demo:reset <email>
//       Delete the demo user and any workspace they were the only member of,
//       so the first-login provisioning runs again.
//
//   npm run demo:github <client_id> <client_secret>
//       Create the GitHub social connection, enable it on both apps and on every
//       existing workspace, and record its ID in .env.local and .env.local.user.
import { $ } from "execa"
import ora from "ora"

import {
  applyActionTriggerBindingsChanges,
  applyBelayProvisioningActionChanges,
  BELAY_PROVISIONING_ACTION_NAME,
  checkActionTriggerBindingsChanges,
  checkBelayProvisioningActionChanges,
} from "./utils/actions.mjs"
import { auth0ApiCall } from "./utils/auth0-api.mjs"
import { readEnvFile, upsertEnvValue } from "./utils/env.mjs"
import { checkAuth0CLI, validateAuth0Session } from "./utils/validation.mjs"

const POST_LOGIN_ORDER = [
  BELAY_PROVISIONING_ACTION_NAME,
  "Add Default Role",
  "Add Role to Tokens",
  "Security Policies",
]

async function step(text, fn) {
  const spinner = ora({ text }).start()
  try {
    const result = await fn()
    spinner.succeed()
    return result
  } catch (e) {
    spinner.fail()
    throw e
  }
}

function requireEnv(env, key) {
  if (!env[key]) {
    throw new Error(`${key} is missing from .env.local`)
  }
  return env[key]
}

async function listActions() {
  const { stdout } = await $`auth0 actions list --json`
  return JSON.parse(stdout) || []
}

// ---------------------------------------------------------------------------
// action
// ---------------------------------------------------------------------------
async function deployAction(args) {
  const env = readEnvFile(".env.local")
  const urlFlag = args.indexOf("--url")
  const apiUrl = urlFlag !== -1 ? args[urlFlag + 1] : env.APP_BASE_URL
  const apiKey = requireEnv(env, "PROVISIONING_API_KEY")

  if (!apiUrl) {
    throw new Error("Pass --url <app url> or set APP_BASE_URL in .env.local")
  }
  if (/localhost|127\.0\.0\.1/.test(apiUrl)) {
    console.log(
      `\n⚠️  ${apiUrl} is not reachable from Auth0's cloud. The Action fails open and the app falls back to the "Create your organization" page. Re-run with --url once the app is deployed.\n`
    )
  }

  const existing = await listActions()
  const plan = await checkBelayProvisioningActionChanges(existing)
  // Secrets are not readable back, so always push them on an update
  if (plan.action === "skip") plan.action = "update"

  const action = await applyBelayProvisioningActionChanges(plan, {
    apiUrl,
    apiKey,
  })

  const actions = await listActions()
  const ordered = POST_LOGIN_ORDER.map((name) =>
    actions.find((a) => a.name === name)
  ).filter(Boolean)
  const bindingsPlan = await checkActionTriggerBindingsChanges(actions)
  await applyActionTriggerBindingsChanges(bindingsPlan, ordered)

  console.log(
    `\n✅ ${BELAY_PROVISIONING_ACTION_NAME} (${action.id}) is deployed and calls ${apiUrl}/api/provision\n`
  )
}

// ---------------------------------------------------------------------------
// bot
// ---------------------------------------------------------------------------
async function toggleBotChallenge(args) {
  const mode = args[0]
  if (!["on", "off"].includes(mode)) {
    throw new Error("Usage: npm run demo:bot on|off")
  }

  const policy = mode === "on" ? "always" : "never"
  await step(`Setting bot detection password challenge to "${policy}"`, () =>
    auth0ApiCall("patch", "attack-protection/bot-detection", {
      challenge_password_policy: policy,
    })
  )

  console.log(
    mode === "on"
      ? "\n✅ Every email/password sign-up and login now shows the challenge. Run `npm run demo:bot off` after the demo.\n"
      : "\n✅ Bot detection is back to challenging only suspicious traffic.\n"
  )
}

// ---------------------------------------------------------------------------
// reset
// ---------------------------------------------------------------------------
async function resetDemoUser(args) {
  const email = args[0]
  if (!email) {
    throw new Error("Usage: npm run demo:reset <email>")
  }

  const users = await auth0ApiCall(
    "get",
    `users-by-email?email=${encodeURIComponent(email)}`
  )
  if (!users?.length) {
    console.log(`\nNo user with the email ${email}. Nothing to do.\n`)
    return
  }

  for (const user of users) {
    const orgs =
      (await auth0ApiCall(
        "get",
        `users/${encodeURIComponent(user.user_id)}/organizations`
      )) || []

    for (const org of orgs) {
      const members = await auth0ApiCall(
        "get",
        `organizations/${org.id}/members?per_page=2`
      )
      const memberCount = Array.isArray(members)
        ? members.length
        : members?.members?.length

      if (memberCount === 1) {
        await step(`Deleting workspace ${org.display_name} (${org.id})`, () =>
          auth0ApiCall("delete", `organizations/${org.id}`)
        )
      } else {
        console.log(
          `   Keeping ${org.display_name} (${org.id}): it has other members`
        )
      }
    }

    await step(`Deleting user ${user.user_id}`, () =>
      auth0ApiCall("delete", `users/${encodeURIComponent(user.user_id)}`)
    )
  }

  console.log(`\n✅ ${email} can sign up again from scratch.\n`)
}

// ---------------------------------------------------------------------------
// github
// ---------------------------------------------------------------------------
async function createGithubConnection(args) {
  const [clientId, clientSecret] = args
  if (!clientId || !clientSecret) {
    throw new Error(
      "Usage: npm run demo:github <client_id> <client_secret>\n" +
        "Create the OAuth app at https://github.com/settings/developers with the callback\n" +
        "https://<your auth0 domain>/login/callback"
    )
  }

  const env = readEnvFile(".env.local")
  const dashboardClientId = requireEnv(env, "AUTH0_CLIENT_ID")
  const managementClientId = requireEnv(env, "AUTH0_MANAGEMENT_CLIENT_ID")

  const connections = (await auth0ApiCall("get", "connections?strategy=github")) || []
  let connection = connections[0]

  if (connection) {
    await step(`Updating existing GitHub connection ${connection.id}`, () =>
      auth0ApiCall("patch", `connections/${connection.id}`, {
        options: {
          ...connection.options,
          client_id: clientId,
          client_secret: clientSecret,
          email: true,
          profile: true,
        },
        enabled_clients: Array.from(
          new Set([
            ...(connection.enabled_clients || []),
            dashboardClientId,
            managementClientId,
          ])
        ),
      })
    )
  } else {
    connection = await step("Creating GitHub connection", () =>
      auth0ApiCall("post", "connections", {
        name: "github",
        strategy: "github",
        display_name: "GitHub",
        options: {
          client_id: clientId,
          client_secret: clientSecret,
          email: true,
          profile: true,
        },
        enabled_clients: [dashboardClientId, managementClientId],
      })
    )
  }

  // Existing workspaces need the connection enabled to accept GitHub logins
  const orgs = (await auth0ApiCall("get", "organizations?per_page=50")) || []
  for (const org of orgs) {
    const enabled =
      (await auth0ApiCall(
        "get",
        `organizations/${org.id}/enabled_connections`
      )) || []
    if (enabled.some((c) => c.connection_id === connection.id)) continue

    await step(`Enabling GitHub on ${org.display_name || org.name}`, () =>
      auth0ApiCall("post", `organizations/${org.id}/enabled_connections`, {
        connection_id: connection.id,
        assign_membership_on_login: false,
      })
    )
  }

  for (const file of [".env.local", ".env.local.user"]) {
    upsertEnvValue(file, "GITHUB_CONNECTION_ID", connection.id)
  }

  console.log(
    `\n✅ GitHub connection ${connection.id} is enabled for sign-up and login. Restart \`npm run dev\` to pick up GITHUB_CONNECTION_ID.\n`
  )
}

// ---------------------------------------------------------------------------
async function main() {
  const [command, ...args] = process.argv.slice(2)
  const commands = {
    action: deployAction,
    bot: toggleBotChallenge,
    reset: resetDemoUser,
    github: createGithubConnection,
  }

  if (!commands[command]) {
    console.log("Usage: node scripts/demo.mjs <action|bot|reset|github> [...args]")
    process.exit(1)
  }

  await checkAuth0CLI()
  await validateAuth0Session()
  await commands[command](args)
}

main().catch((error) => {
  console.error(`\n❌ ${error.message}\n`)
  process.exit(1)
})
