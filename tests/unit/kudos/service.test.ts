import { beforeEach, describe, expect, it } from "vitest";
import { resetStore } from "@/lib/kudos/store";
import { DEMO_CURRENT_USER_ID } from "@/lib/kudos/seed-data";
import {
  getHighlights,
  getSidebarStats,
  getSpotlightNodes,
  getViewerId,
  HeartSelfBlockError,
  listFeed,
  openSecretBox,
  sendKudos,
  toggleHeart,
} from "@/lib/kudos/service";

beforeEach(() => {
  resetStore();
});

describe("service — listFeed", () => {
  it("returns paginated feed with stable ordering", () => {
    const viewer = DEMO_CURRENT_USER_ID;
    const p1 = listFeed({ hashtag: null, departmentId: null }, null, 5, viewer);
    expect(p1.items.length).toBe(5);
    expect(p1.nextCursor).not.toBeNull();
    const p2 = listFeed(
      { hashtag: null, departmentId: null },
      p1.nextCursor,
      5,
      viewer,
    );
    const ids1 = new Set(p1.items.map((k) => k.id));
    expect(p2.items.every((k) => !ids1.has(k.id))).toBe(true);
  });

  it("scopes by hashtag", () => {
    const r = listFeed(
      { hashtag: "Mentor", departmentId: null },
      null,
      1000,
      DEMO_CURRENT_USER_ID,
    );
    expect(r.items.length).toBeGreaterThan(0);
    expect(r.items.every((k) => k.hashtags.includes("Mentor"))).toBe(true);
  });
});

describe("service — getHighlights", () => {
  it("returns top 5 by hearts (filter-scoped)", () => {
    const r = getHighlights(
      { hashtag: null, departmentId: null },
      DEMO_CURRENT_USER_ID,
    );
    expect(r.length).toBeLessThanOrEqual(5);
    for (let i = 1; i < r.length; i += 1) {
      expect(r[i].heartsCount).toBeLessThanOrEqual(r[i - 1].heartsCount);
    }
  });
});

describe("service — getSpotlightNodes", () => {
  it("aggregates by recipient", () => {
    const nodes = getSpotlightNodes(
      { hashtag: null, departmentId: null },
      null,
    );
    expect(nodes.length).toBeGreaterThan(0);
    for (const n of nodes) {
      expect(n.kudosCount).toBeGreaterThan(0);
      expect(n.mostRecentKudosId).toMatch(/^kudos-/);
    }
  });

  it("filters by query (case-insensitive)", () => {
    const all = getSpotlightNodes(
      { hashtag: null, departmentId: null },
      null,
    );
    const sample = all[0]!;
    const q = sample.displayName.slice(0, 3).toUpperCase();
    const filtered = getSpotlightNodes(
      { hashtag: null, departmentId: null },
      q,
    );
    expect(filtered.some((n) => n.recipientId === sample.recipientId)).toBe(
      true,
    );
  });
});

describe("service — sendKudos + toggleHeart", () => {
  it("inserts a new kudos with default fields", () => {
    const k = sendKudos(DEMO_CURRENT_USER_ID, {
      recipientId: "sunner-bao",
      headline: "Người truyền cảm hứng",
      message: "Cảm ơn anh!",
      hashtags: ["Mentor"],
      images: [],
      isAnonymous: false,
      anonymousAlias: null,
    });
    expect(k.senderId).toBe(DEMO_CURRENT_USER_ID);
    expect(k.recipientId).toBe("sunner-bao");
    expect(k.heartsCount).toBe(0);
    expect(k.isHeartedByCurrentUser).toBe(false);
  });

  it("blocks self-hearting via service layer", () => {
    const own = listFeed(
      { hashtag: null, departmentId: null },
      null,
      100,
      DEMO_CURRENT_USER_ID,
    ).items.find((k) => k.senderId === DEMO_CURRENT_USER_ID);
    expect(own).toBeDefined();
    expect(() => toggleHeart(DEMO_CURRENT_USER_ID, own!.id, true)).toThrow(
      HeartSelfBlockError,
    );
  });

  it("normal heart returns senderHeartDelta=1; special day=2", () => {
    // Find a non-self kudos
    const r = listFeed(
      { hashtag: null, departmentId: null },
      null,
      100,
      DEMO_CURRENT_USER_ID,
    );
    const normal = r.items.find(
      (k) => k.senderId !== DEMO_CURRENT_USER_ID && !k.isSpecialDay,
    );
    expect(normal).toBeDefined();
    const t1 = toggleHeart(DEMO_CURRENT_USER_ID, normal!.id, true);
    expect(t1.senderHeartDelta).toBe(1);

    const special = r.items.find(
      (k) => k.senderId !== DEMO_CURRENT_USER_ID && k.isSpecialDay,
    );
    expect(special).toBeDefined();
    const t2 = toggleHeart(DEMO_CURRENT_USER_ID, special!.id, true);
    expect(t2.senderHeartDelta).toBe(2);
  });
});

describe("service — sidebar & secret box", () => {
  it("returns sidebar stats with recent gifts (≤10)", () => {
    const s = getSidebarStats(DEMO_CURRENT_USER_ID);
    expect(s).not.toBeNull();
    expect(s!.recentGifts.length).toBeLessThanOrEqual(10);
    expect(s!.user.id).toBe(DEMO_CURRENT_USER_ID);
  });

  it("openSecretBox returns box for first pending and null when exhausted", () => {
    const a = openSecretBox(DEMO_CURRENT_USER_ID);
    expect(a.box).not.toBeNull();
    const b = openSecretBox(DEMO_CURRENT_USER_ID);
    expect(b.box).toBeNull();
  });
});

describe("service — getViewerId", () => {
  it("resolves email → sunner id", () => {
    expect(getViewerId("nguyen.quoc.anh@sun-asterisk.com")).toBe(
      DEMO_CURRENT_USER_ID,
    );
    expect(getViewerId("unknown@sun-asterisk.com")).toBe(DEMO_CURRENT_USER_ID);
  });
});
