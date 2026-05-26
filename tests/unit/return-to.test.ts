import { describe, expect, it } from "vitest";
import { validateReturnTo } from "@/lib/auth/return-to";

describe("validateReturnTo", () => {
  it("accepts a simple relative path", () => {
    expect(validateReturnTo("/awards-information")).toBe("/awards-information");
  });

  it("accepts a relative path with a hash", () => {
    expect(validateReturnTo("/awards-information#top-talent")).toBe(
      "/awards-information#top-talent",
    );
  });

  it("accepts a relative path with a query string", () => {
    expect(validateReturnTo("/profile?tab=settings")).toBe(
      "/profile?tab=settings",
    );
  });

  it("rejects empty string", () => {
    expect(validateReturnTo("")).toBeNull();
  });

  it("rejects null / undefined", () => {
    expect(validateReturnTo(null)).toBeNull();
    expect(validateReturnTo(undefined)).toBeNull();
  });

  it("rejects protocol-relative URLs", () => {
    expect(validateReturnTo("//evil.com/x")).toBeNull();
  });

  it("rejects absolute URLs (http/https)", () => {
    expect(validateReturnTo("https://evil.com")).toBeNull();
    expect(validateReturnTo("http://evil.com")).toBeNull();
  });

  it("rejects javascript: URIs", () => {
    expect(validateReturnTo("/javascript:alert(1)")).toBeNull();
  });

  it("rejects backslash-prefixed escape", () => {
    expect(validateReturnTo("/\\evil.com")).toBeNull();
  });

  it("rejects paths containing whitespace or control characters", () => {
    expect(validateReturnTo("/path with space")).toBeNull();
    expect(validateReturnTo("/path\nwith-newline")).toBeNull();
  });

  it("rejects paths that do not start with /", () => {
    expect(validateReturnTo("awards-information")).toBeNull();
    expect(validateReturnTo("./relative")).toBeNull();
  });
});
