/**
 * Block Disposable Domains. Runs before a database sign-up creates the user,
 * so a throwaway address never becomes an account.
 *
 * Pre-user-registration does not run for social sign-ups; if a social
 * connection is ever added, move this check into the post-login Action.
 *
 * @param {Event} event - Details about the user being registered.
 * @param {PreUserRegistrationAPI} api - Interface whose methods can be used to change the behavior of the sign-up.
 */
const DISPOSABLE_DOMAINS = ["mailinator.com", "guerrillamail.com", "10minutemail.com", "yopmail.com", "sharklasers.com"];

exports.onExecutePreUserRegistration = async (event, api) => {
  const emailDomain = (event.user.email || "").split("@")[1]?.toLowerCase();
  if (DISPOSABLE_DOMAINS.includes(emailDomain)) {
    api.access.deny("disposable_email", "Please sign up with a work email address.");
  }
};
