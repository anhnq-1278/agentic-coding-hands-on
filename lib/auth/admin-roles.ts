/**
 * Returns the comma-separated `ADMIN_EMAILS` env list, lowercased.
 * Until role assignment lands properly, this is the source of truth for the
 * admin distinction shown in the avatar dropdown.
 */
export function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.length > 0);
}

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) {
    return false;
  }
  return getAdminEmails().includes(email.toLowerCase());
}
