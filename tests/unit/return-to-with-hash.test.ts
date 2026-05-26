import { describe, expect, it } from "vitest";
import { validateReturnTo } from "@/lib/auth/return-to";

describe("validateReturnTo with hash fragment", () => {
  it("accepts a relative path with a slug-only fragment", () => {
    expect(validateReturnTo("/awards-information#top-talent")).toBe(
      "/awards-information#top-talent",
    );
    expect(validateReturnTo("/awards-information#mvp")).toBe(
      "/awards-information#mvp",
    );
  });

  it("accepts a path with mixed-case fragment", () => {
    expect(validateReturnTo("/awards-information#Top-Talent")).toBe(
      "/awards-information#Top-Talent",
    );
  });

  it("accepts a path with query string + fragment", () => {
    expect(validateReturnTo("/profile?tab=settings#general")).toBe(
      "/profile?tab=settings#general",
    );
  });

  it("rejects multiple fragments", () => {
    expect(validateReturnTo("/path#one#two")).toBeNull();
  });

  it("rejects javascript-style fragment", () => {
    // `/path#javascript:alert(1)` has a colon — caught by existing rule.
    expect(validateReturnTo("/path#javascript:alert(1)")).toBeNull();
  });

  it("rejects fragments with special characters", () => {
    expect(validateReturnTo("/path#hello world")).toBeNull(); // space
    expect(validateReturnTo("/path#x<script>")).toBeNull(); // angle bracket
    expect(validateReturnTo("/path#x/y")).toBeNull(); // slash inside fragment
  });

  it("rejects an empty fragment", () => {
    // `/path#` — fragment present but empty
    expect(validateReturnTo("/path#")).toBeNull();
  });

  it("still rejects protocol-relative URLs", () => {
    expect(validateReturnTo("//evil.com#x")).toBeNull();
  });
});
