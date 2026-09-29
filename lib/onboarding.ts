// Whether onboarding requires a verified email before a user can create an
// organization. Set REQUIRE_EMAIL_VERIFICATION=false to skip the verify step;
// the verify page and resend action stay in place. Defaults to required.
export const emailVerificationRequired =
  process.env.REQUIRE_EMAIL_VERIFICATION !== "false"
