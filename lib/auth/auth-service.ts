import { isAllowedEmail } from "@/lib/auth/allowed-domains";
import { AuthError, AuthErrorCode } from "@/lib/auth/errors";

/**
 * Throws AuthError(DOMAIN_NOT_ALLOWED) when the email's domain is not on the
 * whitelist or the email is missing. Used by the OAuth callback to enforce
 * the Sun\* domain gate before a session is committed.
 */
export function assertEmailAllowed(email: string | undefined | null): void {
  if (!isAllowedEmail(email)) {
    throw new AuthError(
      AuthErrorCode.DOMAIN_NOT_ALLOWED,
      `Email domain not allowed: ${email ?? "<missing>"}`,
    );
  }
}
