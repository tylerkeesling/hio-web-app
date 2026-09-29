export function capitalize(value: string) {
  return value ? value[0].toUpperCase() + value.slice(1) : value
}

/**
 * A first name to greet the user with. Database sign-ups carry the email as
 * their name, so fall back to the nickname or the email's local part, and
 * take only the first word of it ("tyler.keesling" becomes "Tyler").
 */
export function firstNameOf(user: {
  name?: string | null
  given_name?: string | null
  nickname?: string | null
  email?: string | null
}) {
  const raw =
    user.given_name ||
    (user.name && !user.name.includes("@") ? user.name.split(" ")[0] : "") ||
    user.nickname ||
    user.email?.split("@")[0] ||
    ""

  return capitalize(raw.split(/[._+-]/)[0])
}
