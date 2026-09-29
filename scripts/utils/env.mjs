import { randomBytes } from "node:crypto"
import { existsSync, readFileSync, writeFileSync } from "node:fs"

/**
 * Read a dotenv-style file into an object. Handles comments, blank lines, and
 * single or double quoted values. Returns {} when the file does not exist.
 */
export function readEnvFile(path) {
  if (!existsSync(path)) return {}

  const env = {}
  for (const rawLine of readFileSync(path, "utf8").split("\n")) {
    const line = rawLine.trim()
    if (!line || line.startsWith("#")) continue

    const separator = line.indexOf("=")
    if (separator === -1) continue

    const key = line.slice(0, separator).trim()
    let value = line.slice(separator + 1).trim()
    if (
      (value.startsWith("'") && value.endsWith("'")) ||
      (value.startsWith('"') && value.endsWith('"'))
    ) {
      value = value.slice(1, -1)
    }
    env[key] = value
  }
  return env
}

/**
 * Set KEY=value in a dotenv-style file, replacing an existing line for the key
 * or appending one. Creates the file when it does not exist.
 */
export function upsertEnvValue(path, key, value) {
  const content = existsSync(path) ? readFileSync(path, "utf8") : ""
  const line = `${key}=${value}`
  const pattern = new RegExp(`^${key}=.*$`, "m")

  const next = pattern.test(content)
    ? content.replace(pattern, line)
    : `${content.replace(/\n*$/, "\n")}${line}\n`

  writeFileSync(path, next)
}

export function randomSecret() {
  return randomBytes(32).toString("hex")
}
