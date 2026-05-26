import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { isAllowedEmail, getAllowedDomains } from "@/lib/auth/allowed-domains";

const ENV_KEY = "ALLOWED_EMAIL_DOMAINS";

describe("isAllowedEmail", () => {
  const original = process.env[ENV_KEY];

  beforeEach(() => {
    process.env[ENV_KEY] = "sun-asterisk.com";
  });

  afterEach(() => {
    if (original === undefined) {
      delete process.env[ENV_KEY];
    } else {
      process.env[ENV_KEY] = original;
    }
  });

  it("accepts an email whose domain matches the whitelist (lowercase)", () => {
    expect(isAllowedEmail("alice@sun-asterisk.com")).toBe(true);
  });

  it("accepts an email whose domain matches the whitelist (uppercase)", () => {
    expect(isAllowedEmail("ALICE@SUN-ASTERISK.COM")).toBe(true);
  });

  it("rejects an email outside the whitelist", () => {
    expect(isAllowedEmail("alice@gmail.com")).toBe(false);
  });

  it("rejects an empty / undefined email", () => {
    expect(isAllowedEmail("")).toBe(false);
    expect(isAllowedEmail(undefined)).toBe(false);
  });

  it("rejects a malformed email with no @ separator", () => {
    expect(isAllowedEmail("alicesun-asterisk.com")).toBe(false);
  });

  it("supports multiple whitelisted domains via comma separation", () => {
    process.env[ENV_KEY] = "sun-asterisk.com, contractor.sun-asterisk.com";
    expect(isAllowedEmail("bob@contractor.sun-asterisk.com")).toBe(true);
    expect(isAllowedEmail("eve@evil.com")).toBe(false);
  });

  it("rejects everything when the whitelist is empty (fail-closed)", () => {
    process.env[ENV_KEY] = "";
    expect(isAllowedEmail("alice@sun-asterisk.com")).toBe(false);
  });

  it("getAllowedDomains returns parsed lowercase list", () => {
    process.env[ENV_KEY] = "Sun-Asterisk.com,  EXAMPLE.io";
    expect(getAllowedDomains()).toEqual(["sun-asterisk.com", "example.io"]);
  });
});
