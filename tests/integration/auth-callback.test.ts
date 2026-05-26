// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Cookie store the route handler will read from via next/headers cookies()
let cookieStore: Record<string, { name: string; value: string }> = {};

const { validateAuthorizationCodeMock, decodeIdTokenMock } = vi.hoisted(() => ({
  validateAuthorizationCodeMock: vi.fn(),
  decodeIdTokenMock: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => cookieStore[name],
  }),
}));

vi.mock("@/lib/oauth/google", async () => {
  const actual = await vi.importActual<typeof import("@/lib/oauth/google")>(
    "@/lib/oauth/google",
  );
  return {
    ...actual,
    createGoogleClient: () => ({
      validateAuthorizationCode: validateAuthorizationCodeMock,
    }),
    decodeIdToken: decodeIdTokenMock,
  };
});

import { GET } from "@/app/auth/callback/route";
import {
  OAUTH_STATE_COOKIE,
  OAUTH_VERIFIER_COOKIE,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session";

const ORIGIN = "https://app.test";

function makeRequest(query: string): Request {
  return new Request(`${ORIGIN}/auth/callback${query}`);
}

function setOAuthCookies(state: string, verifier: string) {
  cookieStore = {
    [OAUTH_STATE_COOKIE]: { name: OAUTH_STATE_COOKIE, value: state },
    [OAUTH_VERIFIER_COOKIE]: { name: OAUTH_VERIFIER_COOKIE, value: verifier },
  };
}

describe("GET /auth/callback (Google OAuth + JWT session)", () => {
  const originalAllowed = process.env.ALLOWED_EMAIL_DOMAINS;
  const originalSecret = process.env.SESSION_SECRET;

  beforeEach(() => {
    process.env.ALLOWED_EMAIL_DOMAINS = "sun-asterisk.com";
    process.env.SESSION_SECRET = "0123456789abcdef0123456789abcdef-test";
    cookieStore = {};
    validateAuthorizationCodeMock.mockReset();
    decodeIdTokenMock.mockReset();
  });

  afterEach(() => {
    process.env.ALLOWED_EMAIL_DOMAINS = originalAllowed;
    process.env.SESSION_SECRET = originalSecret;
  });

  it("redirects to /login?error=missing_code when ?code is absent", async () => {
    setOAuthCookies("s", "v");

    const response = await GET(makeRequest(""));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      `${ORIGIN}/login?error=missing_code`,
    );
    expect(validateAuthorizationCodeMock).not.toHaveBeenCalled();
  });

  it("redirects to /login?error=missing_code when state/verifier cookies are missing", async () => {
    cookieStore = {};

    const response = await GET(makeRequest("?code=c&state=s"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      `${ORIGIN}/login?error=missing_code`,
    );
  });

  it("redirects to /login?error=oauth_failed when state mismatches", async () => {
    setOAuthCookies("expected-state", "v");

    const response = await GET(makeRequest("?code=c&state=tampered"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      `${ORIGIN}/login?error=oauth_failed`,
    );
  });

  it("redirects to /login?error=oauth_failed when validateAuthorizationCode throws", async () => {
    setOAuthCookies("s", "v");
    validateAuthorizationCodeMock.mockRejectedValue(new Error("invalid_grant"));

    const response = await GET(makeRequest("?code=bad&state=s"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      `${ORIGIN}/login?error=oauth_failed`,
    );
  });

  it("redirects to /403 and does NOT issue a session for a non-Sun* email", async () => {
    setOAuthCookies("s", "v");
    validateAuthorizationCodeMock.mockResolvedValue({
      idToken: () => "fake.id.token",
    });
    decodeIdTokenMock.mockReturnValue({
      sub: "g-1",
      email: "eve@gmail.com",
      name: "Eve",
    });

    const response = await GET(makeRequest("?code=c&state=s"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(`${ORIGIN}/403`);
    // No session cookie in the response — only the OAuth-flow cookie deletions.
    const setCookieHeaders = response.headers.getSetCookie();
    expect(
      setCookieHeaders.some((h) => h.startsWith(`${SESSION_COOKIE_NAME}=`)),
    ).toBe(false);
  });

  it("issues a session JWT cookie and redirects to / for a Sun*-domain user", async () => {
    setOAuthCookies("s", "v");
    validateAuthorizationCodeMock.mockResolvedValue({
      idToken: () => "fake.id.token",
    });
    decodeIdTokenMock.mockReturnValue({
      sub: "g-2",
      email: "alice@sun-asterisk.com",
      name: "Alice",
      picture: "https://lh3/.../alice.jpg",
    });

    const response = await GET(makeRequest("?code=c&state=s"));

    expect(validateAuthorizationCodeMock).toHaveBeenCalledWith("c", "v");
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(`${ORIGIN}/`);

    const setCookieHeaders = response.headers.getSetCookie();
    const sessionHeader = setCookieHeaders.find((h) =>
      h.startsWith(`${SESSION_COOKIE_NAME}=`),
    );
    expect(sessionHeader).toBeDefined();
    expect(sessionHeader).toMatch(/HttpOnly/i);
    expect(sessionHeader).toMatch(/Path=\//i);
    expect(sessionHeader).toMatch(/SameSite=lax/i);
  });
});
