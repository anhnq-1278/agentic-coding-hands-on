import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { assertEmailAllowed } from "@/lib/auth/auth-service";
import { AuthError, AuthErrorCode } from "@/lib/auth/errors";

describe("auth-service", () => {
  const original = process.env.ALLOWED_EMAIL_DOMAINS;

  beforeEach(() => {
    process.env.ALLOWED_EMAIL_DOMAINS = "sun-asterisk.com";
  });

  afterEach(() => {
    if (original === undefined) {
      delete process.env.ALLOWED_EMAIL_DOMAINS;
    } else {
      process.env.ALLOWED_EMAIL_DOMAINS = original;
    }
  });

  describe("assertEmailAllowed", () => {
    it("returns silently for a Sun*-domain email", () => {
      expect(() => assertEmailAllowed("alice@sun-asterisk.com")).not.toThrow();
    });

    it("throws AuthError(DOMAIN_NOT_ALLOWED) for an outside-domain email", () => {
      expect(() => assertEmailAllowed("eve@gmail.com")).toThrowError(AuthError);
      try {
        assertEmailAllowed("eve@gmail.com");
      } catch (err) {
        expect(err).toBeInstanceOf(AuthError);
        expect((err as AuthError).code).toBe(AuthErrorCode.DOMAIN_NOT_ALLOWED);
      }
    });

    it("throws for missing email", () => {
      expect(() => assertEmailAllowed(undefined)).toThrowError(AuthError);
      expect(() => assertEmailAllowed(null)).toThrowError(AuthError);
      expect(() => assertEmailAllowed("")).toThrowError(AuthError);
    });
  });
});
