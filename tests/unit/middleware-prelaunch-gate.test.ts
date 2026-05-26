// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const isPrelaunchMock = vi.hoisted(() => vi.fn());
const readSessionJwtMock = vi.hoisted(() => vi.fn());
const isAdminEmailMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/events/get-event", () => ({
  isPrelaunch: isPrelaunchMock,
  getEvent: vi.fn(),
}));

vi.mock("@/lib/auth/session", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth/session")>(
    "@/lib/auth/session",
  );
  return {
    ...actual,
    readSessionJwt: readSessionJwtMock,
  };
});

vi.mock("@/lib/auth/admin-roles", () => ({
  isAdminEmail: isAdminEmailMock,
  getAdminEmails: vi.fn(),
}));

import {
  applyPrelaunchGate,
  PRELAUNCH_RETURN_TO_COOKIE,
} from "@/lib/middleware/prelaunch-gate";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";

function makeRequest(
  pathname: string,
  cookies: Record<string, string> = {},
): NextRequest {
  const url = new URL(`https://app.test${pathname}`);
  const cookieHeader = Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
  return new NextRequest(url, {
    headers: cookieHeader ? { cookie: cookieHeader } : {},
  });
}

const AUTHED_USER = {
  userId: "u-1",
  email: "alice@sun-asterisk.com",
  displayName: "Alice",
  avatarUrl: null,
  domain: "sun-asterisk.com",
};

describe("applyPrelaunchGate", () => {
  beforeEach(() => {
    isPrelaunchMock.mockReset();
    readSessionJwtMock.mockReset();
    isAdminEmailMock.mockReset();
    isAdminEmailMock.mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("[1] returns null (gate off) when isPrelaunch() is false", async () => {
    isPrelaunchMock.mockReturnValue(false);
    const response = await applyPrelaunchGate(makeRequest("/"));
    expect(response).toBeNull();
  });

  it("[2] anonymous + `/` while pre-launch → rewrite to /countdown, no returnTo cookie", async () => {
    isPrelaunchMock.mockReturnValue(true);
    const response = await applyPrelaunchGate(makeRequest("/"));
    expect(response).not.toBeNull();
    expect(response?.headers.get("x-middleware-rewrite")).toContain("/countdown");
    const setCookieHeaders = response?.headers.getSetCookie() ?? [];
    expect(
      setCookieHeaders.some((h) =>
        h.startsWith(`${PRELAUNCH_RETURN_TO_COOKIE}=`),
      ),
    ).toBe(false);
  });

  it("[3] authed + `/awards-information` → rewrite + saa-returnTo cookie set", async () => {
    isPrelaunchMock.mockReturnValue(true);
    readSessionJwtMock.mockResolvedValue(AUTHED_USER);
    isAdminEmailMock.mockReturnValue(false);

    const response = await applyPrelaunchGate(
      makeRequest("/awards-information", { [SESSION_COOKIE_NAME]: "jwt-blob" }),
    );

    expect(response?.headers.get("x-middleware-rewrite")).toContain("/countdown");
    const setCookieHeaders = response?.headers.getSetCookie() ?? [];
    const returnToHeader = setCookieHeaders.find((h) =>
      h.startsWith(`${PRELAUNCH_RETURN_TO_COOKIE}=`),
    );
    expect(returnToHeader).toBeDefined();
    // Cookie value is URL-encoded; "/" becomes "%2F".
    expect(returnToHeader).toMatch(
      /saa-returnTo=(\/awards-information|%2Fawards-information)/,
    );
    expect(returnToHeader).toMatch(/HttpOnly/i);
    expect(returnToHeader).toMatch(/SameSite=lax/i);
  });

  it("[4] admin user → pass-through (no rewrite)", async () => {
    isPrelaunchMock.mockReturnValue(true);
    readSessionJwtMock.mockResolvedValue(AUTHED_USER);
    isAdminEmailMock.mockReturnValue(true);

    const response = await applyPrelaunchGate(
      makeRequest("/awards-information", { [SESSION_COOKIE_NAME]: "jwt" }),
    );
    expect(response).toBeNull();
  });

  it("[5] /countdown → pass-through (the takeover page itself)", async () => {
    isPrelaunchMock.mockReturnValue(true);
    const response = await applyPrelaunchGate(makeRequest("/countdown"));
    expect(response).toBeNull();
  });

  it("[6] /api/auth/status → pass-through", async () => {
    isPrelaunchMock.mockReturnValue(true);
    const response = await applyPrelaunchGate(makeRequest("/api/auth/status"));
    expect(response).toBeNull();
  });

  it("[7] /_next/static/... → pass-through", async () => {
    isPrelaunchMock.mockReturnValue(true);
    const response = await applyPrelaunchGate(
      makeRequest("/_next/static/chunks/main.js"),
    );
    expect(response).toBeNull();
  });

  it("[8] arbitrary /api/* → pass-through", async () => {
    isPrelaunchMock.mockReturnValue(true);
    const response = await applyPrelaunchGate(makeRequest("/api/anything"));
    expect(response).toBeNull();
  });

  it("[9] malformed env (isPrelaunch returns false) → fail-open, no gate", async () => {
    isPrelaunchMock.mockReturnValue(false);
    const response = await applyPrelaunchGate(makeRequest("/awards-information"));
    expect(response).toBeNull();
  });

  it("preserves the requested query string in the saa-returnTo cookie", async () => {
    isPrelaunchMock.mockReturnValue(true);
    readSessionJwtMock.mockResolvedValue(AUTHED_USER);
    isAdminEmailMock.mockReturnValue(false);

    const response = await applyPrelaunchGate(
      makeRequest("/profile?tab=settings", {
        [SESSION_COOKIE_NAME]: "jwt",
      }),
    );

    const setCookieHeaders = response?.headers.getSetCookie() ?? [];
    const returnToHeader = setCookieHeaders.find((h) =>
      h.startsWith(`${PRELAUNCH_RETURN_TO_COOKIE}=`),
    );
    expect(returnToHeader).toBeDefined();
    // Cookie value is URL-encoded; "?" becomes %3F.
    expect(returnToHeader).toMatch(/%3Ftab%3Dsettings|\?tab=settings/);
  });
});
