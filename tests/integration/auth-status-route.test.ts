// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentUserMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth/session", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth/session")>(
    "@/lib/auth/session",
  );
  return {
    ...actual,
    getCurrentUser: getCurrentUserMock,
  };
});

import { GET } from "@/app/api/auth/status/route";

describe("GET /api/auth/status", () => {
  beforeEach(() => {
    getCurrentUserMock.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns { authenticated: false } when no session", async () => {
    getCurrentUserMock.mockResolvedValue(null);

    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ authenticated: false });
    expect(response.headers.get("cache-control")).toContain("no-store");
  });

  it("returns { authenticated: true } when a session exists", async () => {
    getCurrentUserMock.mockResolvedValue({
      userId: "u-1",
      email: "alice@sun-asterisk.com",
      displayName: "Alice",
      avatarUrl: null,
      domain: "sun-asterisk.com",
    });

    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ authenticated: true });
  });
});
