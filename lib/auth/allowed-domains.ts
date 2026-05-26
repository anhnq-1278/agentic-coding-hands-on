/**
 * Reads the comma-separated `ALLOWED_EMAIL_DOMAINS` env var and decides whether
 * a given email's domain is on the whitelist.
 *
 * The check is fail-closed: if the env var is missing or empty, no email is
 * accepted.
 */
export function getAllowedDomains(): string[] {
  const raw = process.env.ALLOWED_EMAIL_DOMAINS ?? "";
  return raw
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter((d) => d.length > 0);
}

export function isAllowedEmail(email: string | undefined | null): boolean {
  if (!email) {
    return false;
  }

  const atIndex = email.lastIndexOf("@");
  if (atIndex < 0 || atIndex === email.length - 1) {
    return false;
  }

  const domain = email.slice(atIndex + 1).toLowerCase();
  const allowed = getAllowedDomains();
  if (allowed.length === 0) {
    return false;
  }

  return allowed.includes(domain);
}
