export const AuthErrorCode = {
  OAUTH_FAILED: "oauth_failed",
  DOMAIN_NOT_ALLOWED: "domain_not_allowed",
  SESSION_EXPIRED: "session_expired",
  MISSING_CODE: "missing_code",
} as const;

export type AuthErrorCode = (typeof AuthErrorCode)[keyof typeof AuthErrorCode];

export class AuthError extends Error {
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode, message?: string) {
    super(message ?? code);
    this.name = "AuthError";
    this.code = code;
  }
}
