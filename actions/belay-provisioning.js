/**
 * Belay Provisioning. Runs on every login and does the two things that are
 * unique to Belay; Auth0 handles everything else.
 *
 *   1. On a developer's first login, asks Belay's provisioning API for a workspace.
 *   2. Puts the workspace's plan in the tokens so the app can gate features by it.
 *
 * Secrets: BELAY_API_URL, BELAY_API_KEY, CUSTOM_CLAIMS_NAMESPACE
 *
 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
 */
exports.onExecutePostLogin = async (event, api) => {
  // First login outside an organization: provision the developer's workspace.
  // Fails open so a provisioning outage never blocks login; the app falls back to manual setup.
  if (!event.organization && !event.user.app_metadata?.workspace_id) {
    try {
      const response = await fetch(`${event.secrets.BELAY_API_URL}/api/provision`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${event.secrets.BELAY_API_KEY}` },
        body: JSON.stringify({ user_id: event.user.user_id, email: event.user.email, name: event.user.name, nickname: event.user.nickname }),
      });
      if (response.ok) {
        const { workspace_id } = await response.json();
        api.user.setAppMetadata("workspace_id", workspace_id);
      } else {
        console.log(`Belay provisioning returned ${response.status}`);
      }
    } catch (e) {
      console.log(`Belay provisioning unreachable: ${e.message}`);
    }
  }

  // The plan lives on the workspace (the Organization), so one change upgrades the whole team
  const plan = event.organization?.metadata?.plan || "free";
  api.idToken.setCustomClaim(`${event.secrets.CUSTOM_CLAIMS_NAMESPACE}/plan`, plan);
  api.accessToken.setCustomClaim(`${event.secrets.CUSTOM_CLAIMS_NAMESPACE}/plan`, plan);
};
