import { beforeEach, describe, expect, it } from "vitest";
import { resetStore } from "@/lib/kudos/store";
import {
  validateCursorAndLimit,
  validateFilters,
  validateHeartBody,
  validateSearchQuery,
  validateSendKudosBody,
} from "@/lib/kudos/validators";

beforeEach(() => {
  resetStore();
});

describe("validateFilters", () => {
  it("accepts known hashtag + known department", () => {
    const r = validateFilters("Mentor", "dept-design");
    expect(r.ok).toBe(true);
  });

  it("returns null filters for empty params", () => {
    const r = validateFilters(null, null);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value).toEqual({ hashtag: null, departmentId: null });
    }
  });

  it("rejects unknown hashtag", () => {
    const r = validateFilters("DoesNotExist", null);
    expect(r.ok).toBe(false);
  });

  it("rejects unknown department", () => {
    const r = validateFilters(null, "dept-nope");
    expect(r.ok).toBe(false);
  });
});

describe("validateCursorAndLimit", () => {
  it("defaults limit to 20", () => {
    const r = validateCursorAndLimit(null, null);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.limit).toBe(20);
  });

  it("rejects non-numeric limit", () => {
    const r = validateCursorAndLimit(null, "abc");
    expect(r.ok).toBe(false);
  });

  it("rejects limit out of bounds", () => {
    expect(validateCursorAndLimit(null, "0").ok).toBe(false);
    expect(validateCursorAndLimit(null, "101").ok).toBe(false);
  });
});

describe("validateSendKudosBody", () => {
  const sender = "sunner-anh";

  it("accepts a valid body", () => {
    const r = validateSendKudosBody(
      {
        recipientId: "sunner-bao",
        headline: "Người truyền cảm hứng",
        message: "Cảm ơn anh!",
        hashtags: ["Mentor"],
        images: [],
      },
      sender,
    );
    expect(r.ok).toBe(true);
  });

  it("requires non-empty headline", () => {
    const r = validateSendKudosBody(
      {
        recipientId: "sunner-bao",
        headline: "   ",
        message: "Cảm ơn anh!",
        hashtags: ["Mentor"],
      },
      sender,
    );
    expect(r.ok).toBe(false);
  });

  it("requires non-empty message", () => {
    const r = validateSendKudosBody(
      {
        recipientId: "sunner-bao",
        headline: "Người truyền cảm hứng",
        message: "   ",
      },
      sender,
    );
    expect(r.ok).toBe(false);
  });

  it("rejects self-recipient", () => {
    const r = validateSendKudosBody(
      {
        recipientId: sender,
        headline: "Người truyền cảm hứng",
        message: "hi",
      },
      sender,
    );
    expect(r.ok).toBe(false);
  });

  it("rejects unknown recipient", () => {
    const r = validateSendKudosBody(
      {
        recipientId: "sunner-nope",
        headline: "Người truyền cảm hứng",
        message: "hi",
      },
      sender,
    );
    expect(r.ok).toBe(false);
  });

  it("rejects >5 images", () => {
    const r = validateSendKudosBody(
      {
        recipientId: "sunner-bao",
        headline: "Người truyền cảm hứng",
        message: "hi",
        images: ["a", "b", "c", "d", "e", "f"],
      },
      sender,
    );
    expect(r.ok).toBe(false);
  });
});

describe("validateHeartBody", () => {
  it("requires boolean next", () => {
    expect(validateHeartBody({ next: true }).ok).toBe(true);
    expect(validateHeartBody({ next: false }).ok).toBe(true);
    expect(validateHeartBody({}).ok).toBe(false);
    expect(validateHeartBody({ next: "yes" }).ok).toBe(false);
  });
});

describe("validateSearchQuery", () => {
  it("accepts ≤100 chars", () => {
    const r = validateSearchQuery("a".repeat(100));
    expect(r.ok).toBe(true);
  });

  it("rejects >100 chars", () => {
    const r = validateSearchQuery("a".repeat(101));
    expect(r.ok).toBe(false);
  });

  it("treats empty as null (caller handles required separately)", () => {
    const r = validateSearchQuery("");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBeNull();
  });
});
