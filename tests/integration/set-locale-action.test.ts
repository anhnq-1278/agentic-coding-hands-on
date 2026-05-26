// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const cookieStore = vi.hoisted(() => ({
  set: vi.fn(),
}));

const revalidatePathMock = vi.hoisted(() => vi.fn());

vi.mock("next/headers", () => ({
  cookies: async () => cookieStore,
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

import { setLocaleAction } from "@/actions/set-locale";
import { LOCALE_COOKIE_NAME } from "@/lib/i18n/get-locale";

describe("setLocaleAction", () => {
  beforeEach(() => {
    cookieStore.set.mockReset();
    revalidatePathMock.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("writes the saa-locale cookie when locale is 'vi'", async () => {
    await setLocaleAction("vi");

    expect(cookieStore.set).toHaveBeenCalledWith(
      LOCALE_COOKIE_NAME,
      "vi",
      expect.objectContaining({
        httpOnly: false,
        sameSite: "lax",
        path: "/",
      }),
    );
    expect(revalidatePathMock).toHaveBeenCalledWith("/", "layout");
  });

  it("writes the saa-locale cookie when locale is 'en'", async () => {
    await setLocaleAction("en");
    expect(cookieStore.set).toHaveBeenCalledWith(
      LOCALE_COOKIE_NAME,
      "en",
      expect.any(Object),
    );
  });

  it("rejects unsupported locales", async () => {
    await expect(setLocaleAction("fr")).rejects.toThrow(
      /Unsupported locale: fr/,
    );
    expect(cookieStore.set).not.toHaveBeenCalled();
  });

  it("rejects empty locale", async () => {
    await expect(setLocaleAction("")).rejects.toThrow();
  });
});
