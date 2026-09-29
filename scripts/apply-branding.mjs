#!/usr/bin/env node
// Applies the Universal Login look: theme, page template, and custom text.
// Usage: npm run auth0:branding <tenant-domain>
import { readdirSync, readFileSync } from "fs"
import path from "path"
import ora from "ora"

import { auth0ApiCall } from "./utils/auth0-api.mjs"
import {
  checkAuth0CLI,
  validateAuth0Session,
  validateTenant,
} from "./utils/validation.mjs"

const THEME_FILE = "./themes/universal-login.json"
const TEMPLATE_FILE = "./themes/universal-login.liquid"
const PROMPTS_DIR = "./themes/prompts"
const ILLUSTRATION_FILE = "./public/brand/hero-cubes.svg"
const FAVICON_FILE = "./app/icon.svg"

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

// Universal Login only renders the default theme, and PATCH needs the full object
async function applyTheme() {
  const theme = JSON.parse(readFileSync(THEME_FILE, "utf8"))
  let current = null
  try {
    current = await auth0ApiCall("get", "branding/themes/default")
  } catch {
    // 404: the tenant has never had a theme
  }

  if (current?.themeId) {
    await auth0ApiCall("patch", `branding/themes/${current.themeId}`, theme)
  } else {
    await auth0ApiCall("post", "branding/themes", theme)
  }
}

// Page templates require a verified custom domain on the tenant
async function applyTemplate() {
  const favicon =
    "data:image/svg+xml," +
    encodeURIComponent(readFileSync(FAVICON_FILE, "utf8").trim())
  const template = readFileSync(TEMPLATE_FILE, "utf8")
    .replace("__FAVICON_DATA_URI__", favicon)
    .replace("__HERO_CUBES_SVG__", readFileSync(ILLUSTRATION_FILE, "utf8").trim())

  await auth0ApiCall("put", "branding/templates/universal-login", { template })
}

// PUT replaces all text for a prompt/language, so merge with what is there
async function applyCustomText() {
  const files = readdirSync(PROMPTS_DIR).filter((f) => f.endsWith(".json"))
  for (const file of files) {
    const prompt = path.basename(file, ".json")
    const desired = JSON.parse(readFileSync(path.join(PROMPTS_DIR, file), "utf8"))
    const current =
      (await auth0ApiCall("get", `prompts/${prompt}/custom-text/en`)) || {}

    const merged = { ...current }
    for (const [screen, texts] of Object.entries(desired)) {
      merged[screen] = { ...(current[screen] || {}), ...texts }
    }
    await auth0ApiCall("put", `prompts/${prompt}/custom-text/en`, merged)
  }
  return files.length
}

async function main() {
  console.log("\n🎨 Universal Login branding\n")

  const tenantName = process.argv[2]
  await checkAuth0CLI()
  await validateAuth0Session()
  await validateTenant(tenantName)

  await step("Updating the default Universal Login theme", applyTheme)
  await step("Publishing the page template", applyTemplate)
  await step("Updating login and signup text", applyCustomText)

  console.log("\n✅ Branding applied. Open your app and click Log in to see it.\n")
}

main().catch((error) => {
  console.error("\n❌ Branding failed:", error.message)
  process.exit(1)
})
