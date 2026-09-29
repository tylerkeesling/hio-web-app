import { readFile } from "node:fs/promises"
import { $ } from "execa"
import ora from "ora"

import { auth0ApiCall } from "./auth0-api.mjs"
import { ChangeAction, createChangeItem } from "./change-plan.mjs"
import { waitUntilActionIsBuilt } from "./helpers.mjs"

// Constants
export const CUSTOM_CLAIMS_NAMESPACE = "https://belay.dev"
export const BELAY_PROVISIONING_ACTION_NAME = "Belay Provisioning"
const BELAY_PROVISIONING_ACTION_FILE = "./actions/belay-provisioning.js"
export const BLOCK_DISPOSABLE_ACTION_NAME = "Block Disposable Domains"
const BLOCK_DISPOSABLE_ACTION_FILE = "./actions/block-disposable-domains.js"

function secretPairs(secrets) {
  return secrets.map((secret) => {
    const separator = secret.indexOf("=")
    return { name: secret.slice(0, separator), value: secret.slice(separator + 1) }
  })
}

/**
 * Compare an Action's deployed code with the file on disk
 */
async function checkActionCode(existingActions, name, file, resource) {
  const existingAction = existingActions.find((a) => a.name === name)

  if (!existingAction) {
    return createChangeItem(ChangeAction.CREATE, { resource, name })
  }

  const desiredCode = await readFile(file, "utf8")
  const currentAction = await auth0ApiCall(
    "get",
    `actions/actions/${existingAction.id}`
  )

  if (currentAction?.code?.trim() !== desiredCode.trim()) {
    return createChangeItem(ChangeAction.UPDATE, {
      resource,
      name,
      existing: existingAction,
      summary: "Update code",
    })
  }

  return createChangeItem(ChangeAction.SKIP, {
    resource,
    name,
    existing: existingAction,
  })
}

/**
 * Check if the Block Disposable Domains Action needs changes
 */
export function checkBlockDisposableDomainsActionChanges(existingActions) {
  return checkActionCode(
    existingActions,
    BLOCK_DISPOSABLE_ACTION_NAME,
    BLOCK_DISPOSABLE_ACTION_FILE,
    "Block Disposable Domains Action"
  )
}

// ============================================================================
// CHECK FUNCTIONS - Determine what changes are needed
// ============================================================================

/**
 * Check if the Belay Provisioning Action needs changes
 * Compares code with existing action
 */
export async function checkBelayProvisioningActionChanges(existingActions) {
  const existingAction = existingActions.find(
    (a) => a.name === BELAY_PROVISIONING_ACTION_NAME
  )

  if (!existingAction) {
    return createChangeItem(ChangeAction.CREATE, {
      resource: "Belay Provisioning Action",
      name: BELAY_PROVISIONING_ACTION_NAME,
    })
  }

  const desiredCode = await readFile(BELAY_PROVISIONING_ACTION_FILE, "utf8")
  const currentAction = await auth0ApiCall(
    "get",
    `actions/actions/${existingAction.id}`
  )

  if (currentAction?.code?.trim() !== desiredCode.trim()) {
    return createChangeItem(ChangeAction.UPDATE, {
      resource: "Belay Provisioning Action",
      name: BELAY_PROVISIONING_ACTION_NAME,
      existing: existingAction,
      summary: "Update code",
    })
  }

  return createChangeItem(ChangeAction.SKIP, {
    resource: "Belay Provisioning Action",
    name: BELAY_PROVISIONING_ACTION_NAME,
    existing: existingAction,
  })
}

/**
 * Check if Security Policies Action needs changes
 * Compares code with existing action
 */
export async function checkSecurityPoliciesActionChanges(existingActions) {
  const existingAction = existingActions.find(
    (a) => a.name === "Security Policies"
  )

  if (!existingAction) {
    return createChangeItem(ChangeAction.CREATE, {
      resource: "Security Policies Action",
      name: "Security Policies",
    })
  }

  // Read the desired code
  const desiredCode = await readFile("./actions/security-policies.js", "utf8")

  // Get the current action code
  const { stdout } = await $`auth0 api get actions/actions/${existingAction.id}`
  const currentAction = JSON.parse(stdout)

  // Compare code (ignoring whitespace differences)
  const currentCodeNormalized = currentAction.code?.trim()
  const desiredCodeNormalized = desiredCode.trim()

  if (currentCodeNormalized !== desiredCodeNormalized) {
    return createChangeItem(ChangeAction.UPDATE, {
      resource: "Security Policies Action",
      name: "Security Policies",
      existing: existingAction,
      summary: "Update code",
    })
  }

  return createChangeItem(ChangeAction.SKIP, {
    resource: "Security Policies Action",
    name: "Security Policies",
    existing: existingAction,
  })
}

/**
 * Check if Add Default Role Action needs changes
 * Compares code with existing action
 */
export async function checkAddDefaultRoleActionChanges(existingActions) {
  const existingAction = existingActions.find(
    (a) => a.name === "Add Default Role"
  )

  if (!existingAction) {
    return createChangeItem(ChangeAction.CREATE, {
      resource: "Add Default Role Action",
      name: "Add Default Role",
    })
  }

  // Read the desired code
  const desiredCode = await readFile("./actions/add-default-role.js", "utf8")

  // Get the current action code
  const { stdout } = await $`auth0 api get actions/actions/${existingAction.id}`
  const currentAction = JSON.parse(stdout)

  // Compare code (ignoring whitespace differences)
  const currentCodeNormalized = currentAction.code?.trim()
  const desiredCodeNormalized = desiredCode.trim()

  if (currentCodeNormalized !== desiredCodeNormalized) {
    return createChangeItem(ChangeAction.UPDATE, {
      resource: "Add Default Role Action",
      name: "Add Default Role",
      existing: existingAction,
      summary: "Update code",
    })
  }

  return createChangeItem(ChangeAction.SKIP, {
    resource: "Add Default Role Action",
    name: "Add Default Role",
    existing: existingAction,
  })
}

/**
 * Check if Add Role to Tokens Action needs changes
 * Compares code with existing action
 */
export async function checkAddRoleToTokensActionChanges(existingActions) {
  const existingAction = existingActions.find(
    (a) => a.name === "Add Role to Tokens"
  )

  if (!existingAction) {
    return createChangeItem(ChangeAction.CREATE, {
      resource: "Add Role to Tokens Action",
      name: "Add Role to Tokens",
    })
  }

  // Read the desired code
  const desiredCode = await readFile("./actions/add-role-to-tokens.js", "utf8")

  // Get the current action code
  const { stdout } = await $`auth0 api get actions/actions/${existingAction.id}`
  const currentAction = JSON.parse(stdout)

  // Compare code (ignoring whitespace differences)
  const currentCodeNormalized = currentAction.code?.trim()
  const desiredCodeNormalized = desiredCode.trim()

  if (currentCodeNormalized !== desiredCodeNormalized) {
    return createChangeItem(ChangeAction.UPDATE, {
      resource: "Add Role to Tokens Action",
      name: "Add Role to Tokens",
      existing: existingAction,
      summary: "Update code",
    })
  }

  return createChangeItem(ChangeAction.SKIP, {
    resource: "Add Role to Tokens Action",
    name: "Add Role to Tokens",
    existing: existingAction,
  })
}

/**
 * Check if Action Trigger Bindings need changes
 * Compares current bindings with desired bindings
 */
export async function checkActionTriggerBindingsChanges(existingActions) {
  try {
    // Get current bindings for post-login trigger
    const { stdout } =
      await $`auth0 api get actions/triggers/post-login/bindings`
    const currentBindings = JSON.parse(stdout)

    // Build desired binding order based on existing actions
    const belayProvisioningAction = existingActions.find(
      (a) => a.name === BELAY_PROVISIONING_ACTION_NAME
    )
    const securityPoliciesAction = existingActions.find(
      (a) => a.name === "Security Policies"
    )
    const addDefaultRoleAction = existingActions.find(
      (a) => a.name === "Add Default Role"
    )
    const addRoleToTokensAction = existingActions.find(
      (a) => a.name === "Add Role to Tokens"
    )

    // If any action doesn't exist yet, we'll need to update bindings later
    if (
      !belayProvisioningAction ||
      !securityPoliciesAction ||
      !addDefaultRoleAction ||
      !addRoleToTokensAction
    ) {
      return createChangeItem(ChangeAction.UPDATE, {
        resource: "Action Trigger Bindings",
        summary: "Update post-login trigger bindings (actions not yet created)",
      })
    }

    // Check if current bindings match desired order
    // Correct order: Belay Provisioning -> Add Default Role -> Add Role to Tokens -> Security Policies
    const desiredOrder = [
      belayProvisioningAction.id,
      addDefaultRoleAction.id,
      addRoleToTokensAction.id,
      securityPoliciesAction.id,
    ]

    const currentOrder = currentBindings.bindings?.map((b) => b.action.id) || []

    // Compare arrays
    const bindingsMatch =
      desiredOrder.length === currentOrder.length &&
      desiredOrder.every((id, index) => id === currentOrder[index])

    if (bindingsMatch) {
      return createChangeItem(ChangeAction.SKIP, {
        resource: "Action Trigger Bindings",
        summary: "Post-login trigger bindings already up-to-date",
      })
    }

    return createChangeItem(ChangeAction.UPDATE, {
      resource: "Action Trigger Bindings",
      summary: "Update post-login trigger bindings",
    })
  } catch (e) {
    // If we can't fetch current bindings, assume we need to update
    console.warn(
      `⚠️  Warning: Could not check current action bindings: ${e.message}`
    )
    return createChangeItem(ChangeAction.UPDATE, {
      resource: "Action Trigger Bindings",
      summary: "Update post-login trigger bindings (couldn't verify current)",
    })
  }
}

// ============================================================================
// APPLY FUNCTIONS - Execute changes based on cached plan
// ============================================================================

/**
 * Update an existing action with new code and secrets
 */
async function updateAction(actionId, code, secrets, dependencies = []) {
  const spinner = ora({
    text: `Updating action code and secrets`,
  }).start()

  try {
    // Update the action with new code
    const updateData = {
      code,
    }

    await $`auth0 api patch actions/actions/${actionId} --data ${JSON.stringify(updateData)}`

    // Update secrets if provided (split on the first "=" only; values may contain one)
    if (secrets && secrets.length > 0) {
      const mappedSecrets = secrets.map((secret) => {
        const separator = secret.indexOf("=")
        return {
          name: secret.slice(0, separator),
          value: secret.slice(separator + 1),
        }
      })
      await $`auth0 api patch actions/actions/${actionId} --data ${JSON.stringify({ secrets: mappedSecrets })}`
    }

    // Update dependencies if provided
    if (dependencies && dependencies.length > 0) {
      const depsData = {
        dependencies: dependencies.map((dep) => {
          const [name, version] = dep.split("=")
          return { name, version }
        }),
      }
      await $`auth0 api patch actions/actions/${actionId} --data ${JSON.stringify(depsData)}`
    }

    await waitUntilActionIsBuilt(actionId)

    // Deploy the updated action
    await $`auth0 actions deploy ${actionId} --json --no-input`

    spinner.succeed("Action updated and deployed")
  } catch (e) {
    spinner.fail("Failed to update action")
    throw e
  }
}

/**
 * Apply Block Disposable Domains Action changes (pre-user-registration, no secrets)
 */
export async function applyBlockDisposableDomainsActionChanges(changePlan) {
  if (changePlan.action === ChangeAction.SKIP) {
    const spinner = ora({
      text: `Using existing ${BLOCK_DISPOSABLE_ACTION_NAME} Action without changes`,
    }).start()
    spinner.succeed()
    return changePlan.existing
  }

  const code = await readFile(BLOCK_DISPOSABLE_ACTION_FILE, {
    encoding: "utf-8",
  })

  if (changePlan.action === ChangeAction.CREATE) {
    const spinner = ora({
      text: `Creating ${BLOCK_DISPOSABLE_ACTION_NAME} Action`,
    }).start()

    try {
      const action = await auth0ApiCall("post", "actions/actions", {
        name: BLOCK_DISPOSABLE_ACTION_NAME,
        code,
        runtime: "node22",
        supported_triggers: [{ id: "pre-user-registration", version: "v2" }],
      })

      await waitUntilActionIsBuilt(action.id)
      await $`auth0 actions deploy ${action.id} --json --no-input`

      spinner.succeed(`Created ${BLOCK_DISPOSABLE_ACTION_NAME} Action`)
      return action
    } catch (e) {
      spinner.fail(`Failed to create the ${BLOCK_DISPOSABLE_ACTION_NAME} Action`)
      throw e
    }
  }

  if (changePlan.action === ChangeAction.UPDATE) {
    await updateAction(changePlan.existing.id, code, [])
    return changePlan.existing
  }
}

/**
 * Bind the Block Disposable Domains Action to the pre-user-registration trigger.
 * The trigger has a single binding, so this is applied unconditionally.
 */
export async function applyPreUserRegistrationBindingsChanges(action) {
  const spinner = ora({
    text: `Updating pre-user-registration trigger bindings`,
  }).start()

  try {
    await auth0ApiCall("patch", "actions/triggers/pre-user-registration/bindings", {
      bindings: [
        {
          ref: { type: "action_name", value: action.name },
          display_name: action.name,
        },
      ],
    })
    spinner.succeed("Updated pre-user-registration trigger bindings")
  } catch (e) {
    spinner.fail("Failed to update pre-user-registration trigger bindings")
    throw e
  }
}

/**
 * Apply Belay Provisioning Action changes
 * @param {object} changePlan
 * @param {{ apiUrl: string, apiKey: string }} belay - where the Action reaches the app, and the shared secret
 */
export async function applyBelayProvisioningActionChanges(
  changePlan,
  { apiUrl, apiKey }
) {
  const secrets = [
    `BELAY_API_URL=${apiUrl.replace(/\/$/, "")}`,
    `BELAY_API_KEY=${apiKey}`,
    `CUSTOM_CLAIMS_NAMESPACE=${CUSTOM_CLAIMS_NAMESPACE}`,
  ]

  if (changePlan.action === ChangeAction.SKIP) {
    const spinner = ora({
      text: `Using existing ${BELAY_PROVISIONING_ACTION_NAME} Action without changes`,
    }).start()
    spinner.succeed()
    return changePlan.existing
  }

  const code = await readFile(BELAY_PROVISIONING_ACTION_FILE, {
    encoding: "utf-8",
  })

  if (changePlan.action === ChangeAction.CREATE) {
    const spinner = ora({
      text: `Creating ${BELAY_PROVISIONING_ACTION_NAME} Action`,
    }).start()

    try {
      // Created through the API rather than the CLI to pin the Node 22 runtime (global fetch)
      const action = await auth0ApiCall("post", "actions/actions", {
        name: BELAY_PROVISIONING_ACTION_NAME,
        code,
        runtime: "node22",
        supported_triggers: [{ id: "post-login", version: "v3" }],
        secrets: secretPairs(secrets),
      })

      await waitUntilActionIsBuilt(action.id)
      await $`auth0 actions deploy ${action.id} --json --no-input`

      spinner.succeed(`Created ${BELAY_PROVISIONING_ACTION_NAME} Action`)
      return action
    } catch (e) {
      spinner.fail(`Failed to create the ${BELAY_PROVISIONING_ACTION_NAME} Action`)
      throw e
    }
  }

  if (changePlan.action === ChangeAction.UPDATE) {
    await updateAction(changePlan.existing.id, code, secrets)
    return changePlan.existing
  }
}

/**
 * Apply Security Policies Action changes
 */
export async function applySecurityPoliciesActionChanges(
  changePlan,
  dashboardClientId
) {
  if (changePlan.action === ChangeAction.SKIP) {
    const spinner = ora({
      text: `Using existing Security Policies Action without changes`,
    }).start()
    spinner.succeed()
    return changePlan.existing
  }

  if (changePlan.action === ChangeAction.CREATE) {
    const spinner = ora({
      text: `Creating Security Policies Action`,
    }).start()

    try {
      const code = await readFile("./actions/security-policies.js", {
        encoding: "utf-8",
      })

      // prettier-ignore
      const createActionArgs = [
        "actions", "create",
        "--name", "Security Policies",
        "--code", code,
        "--trigger", "post-login",
        "--secret", `DASHBOARD_CLIENT_ID=${dashboardClientId}`,
        "--json", "--no-input"
      ];

      const { stdout } = await $`auth0 ${createActionArgs}`
      const action = JSON.parse(stdout)

      await waitUntilActionIsBuilt(action.id)

      // prettier-ignore
      const deployActionArgs = [
        "actions", "deploy", action.id,
        "--json", "--no-input"
      ];
      await $`auth0 ${deployActionArgs}`

      spinner.succeed("Created Security Policies Action")
      return action
    } catch (e) {
      spinner.fail(`Failed to create the Security Policies Action`)
      throw e
    }
  }

  if (changePlan.action === ChangeAction.UPDATE) {
    const code = await readFile("./actions/security-policies.js", {
      encoding: "utf-8",
    })
    await updateAction(changePlan.existing.id, code, [
      `DASHBOARD_CLIENT_ID=${dashboardClientId}`,
    ])
    return changePlan.existing
  }
}

/**
 * Apply Add Default Role Action changes
 */
export async function applyAddDefaultRoleActionChanges(
  changePlan,
  domain,
  managementClientId,
  managementClientSecret,
  memberRoleId
) {
  if (changePlan.action === ChangeAction.SKIP) {
    const spinner = ora({
      text: `Using existing Add Default Role Action without changes`,
    }).start()
    spinner.succeed()
    return changePlan.existing
  }

  if (changePlan.action === ChangeAction.CREATE) {
    const spinner = ora({
      text: `Creating Add Default Role Action`,
    }).start()

    try {
      const code = await readFile("./actions/add-default-role.js", {
        encoding: "utf-8",
      })

      // prettier-ignore
      const createActionArgs = [
        "actions", "create",
        "--name", "Add Default Role",
        "--code", code,
        "--trigger", "post-login",
        "--secret", `DOMAIN=${domain}`,
        "--secret", `CLIENT_ID=${managementClientId}`,
        "--secret", `CLIENT_SECRET=${managementClientSecret}`,
        "--secret", `MEMBER_ROLE_ID=${memberRoleId}`,
        "--dependency", "auth0=4.4.0",
        "--json", "--no-input"
      ];

      const { stdout } = await $`auth0 ${createActionArgs}`
      const action = JSON.parse(stdout)

      await waitUntilActionIsBuilt(action.id)

      // prettier-ignore
      const deployActionArgs = [
        "actions", "deploy", action.id,
        "--json", "--no-input"
      ];
      await $`auth0 ${deployActionArgs}`

      spinner.succeed("Created Add Default Role Action")
      return action
    } catch (e) {
      spinner.fail(`Failed to create the Add Default Role Action`)
      throw e
    }
  }

  if (changePlan.action === ChangeAction.UPDATE) {
    const code = await readFile("./actions/add-default-role.js", {
      encoding: "utf-8",
    })
    await updateAction(
      changePlan.existing.id,
      code,
      [
        `DOMAIN=${domain}`,
        `CLIENT_ID=${managementClientId}`,
        `CLIENT_SECRET=${managementClientSecret}`,
        `MEMBER_ROLE_ID=${memberRoleId}`,
      ],
      ["auth0=4.4.0"]
    )
    return changePlan.existing
  }
}

/**
 * Apply Add Role to Tokens Action changes
 */
export async function applyAddRoleToTokensActionChanges(changePlan) {
  if (changePlan.action === ChangeAction.SKIP) {
    const spinner = ora({
      text: `Using existing Add Role to Tokens Action without changes`,
    }).start()
    spinner.succeed()
    return changePlan.existing
  }

  if (changePlan.action === ChangeAction.CREATE) {
    const spinner = ora({
      text: `Creating Add Role to Tokens Action`,
    }).start()

    try {
      const code = await readFile("./actions/add-role-to-tokens.js", {
        encoding: "utf-8",
      })

      // prettier-ignore
      const createActionArgs = [
        "actions", "create",
        "--name", "Add Role to Tokens",
        "--code", code,
        "--trigger", "post-login",
        "--secret", `CUSTOM_CLAIMS_NAMESPACE=${CUSTOM_CLAIMS_NAMESPACE}`,
        "--json", "--no-input"
      ];

      const { stdout } = await $`auth0 ${createActionArgs}`
      const action = JSON.parse(stdout)

      await waitUntilActionIsBuilt(action.id)

      // prettier-ignore
      const deployActionArgs = [
        "actions", "deploy", action.id,
        "--json", "--no-input"
      ];
      await $`auth0 ${deployActionArgs}`

      spinner.succeed("Created Add Role to Tokens Action")
      return action
    } catch (e) {
      spinner.fail(`Failed to create the Add Role to Tokens Action`)
      throw e
    }
  }

  if (changePlan.action === ChangeAction.UPDATE) {
    const code = await readFile("./actions/add-role-to-tokens.js", {
      encoding: "utf-8",
    })
    await updateAction(changePlan.existing.id, code, [
      `CUSTOM_CLAIMS_NAMESPACE=${CUSTOM_CLAIMS_NAMESPACE}`,
    ])
    return changePlan.existing
  }
}

/**
 * Apply Action Trigger Bindings changes
 * @param {object} changePlan
 * @param {Array<{ name: string }>} actions - the post-login Actions, in the order they should run
 */
export async function applyActionTriggerBindingsChanges(changePlan, actions) {
  if (changePlan?.action === ChangeAction.SKIP) {
    const spinner = ora({
      text: `Trigger bindings for Actions are up to date`,
    }).start()
    spinner.succeed()
    return
  }

  const spinner = ora({
    text: `Updating trigger bindings for Actions`,
  }).start()

  try {
    // prettier-ignore
    const updateTriggerBindingsArgs = [
      "api", "patch", "actions/triggers/post-login/bindings",
      "--data", JSON.stringify({
        bindings: actions.map((action) => ({
          ref: { type: "action_name", value: action.name },
          display_name: action.name,
        })),
      }),
    ];

    await $`auth0 ${updateTriggerBindingsArgs}`
    spinner.succeed("Updated trigger bindings")
  } catch (e) {
    spinner.fail(`Failed to update trigger bindings for Actions`)
    throw e
  }
}
