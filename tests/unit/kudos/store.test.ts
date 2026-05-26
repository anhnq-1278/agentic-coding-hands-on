import { beforeEach, describe, expect, it } from "vitest";
import {
  getDepartments,
  getHashtags,
  getKudosById,
  getSunnerById,
  HeartSelfBlockError,
  insertKudos,
  listKudos,
  openNextSecretBox,
  resetStore,
  resolveSunnerIdForEmail,
  setHeart,
} from "@/lib/kudos/store";
import { DEMO_CURRENT_USER_ID } from "@/lib/kudos/seed-data";

beforeEach(() => {
  resetStore();
});

describe("kudos store — seed integrity", () => {
  it("loads at least 80% of seed kudos with unique IDs", () => {
    const { items } = listKudos(
      { hashtag: null, departmentId: null },
      null,
      1000,
      null,
    );
    expect(items.length).toBeGreaterThanOrEqual(20);
    const ids = new Set(items.map((k) => k.id));
    expect(ids.size).toBe(items.length);
  });

  it("aggregates hashtag and department counts", () => {
    const hashtags = getHashtags();
    const departments = getDepartments();
    expect(hashtags.length).toBeGreaterThan(0);
    expect(departments.length).toBeGreaterThan(0);
    expect(hashtags.every((h) => h.kudosCount >= 0)).toBe(true);
    expect(hashtags.some((h) => h.kudosCount > 0)).toBe(true);
  });

  it("resolves the demo user's id from their email", () => {
    expect(resolveSunnerIdForEmail("nguyen.quoc.anh@sun-asterisk.com")).toBe(
      DEMO_CURRENT_USER_ID,
    );
  });

  it("falls back to the demo user id for unknown emails", () => {
    expect(resolveSunnerIdForEmail("unknown@sun-asterisk.com")).toBe(
      DEMO_CURRENT_USER_ID,
    );
  });
});

describe("kudos store — listKudos pagination", () => {
  it("returns up to `limit` items per page", () => {
    const page = listKudos(
      { hashtag: null, departmentId: null },
      null,
      5,
      null,
    );
    expect(page.items.length).toBe(5);
    expect(page.nextCursor).not.toBeNull();
  });

  it("returns the next page when given the cursor", () => {
    const page1 = listKudos(
      { hashtag: null, departmentId: null },
      null,
      5,
      null,
    );
    const page2 = listKudos(
      { hashtag: null, departmentId: null },
      page1.nextCursor,
      5,
      null,
    );
    expect(page2.items.length).toBe(5);
    const ids1 = new Set(page1.items.map((k) => k.id));
    expect(page2.items.every((k) => !ids1.has(k.id))).toBe(true);
  });

  it("sorts items by createdAt desc", () => {
    const { items } = listKudos(
      { hashtag: null, departmentId: null },
      null,
      10,
      null,
    );
    for (let i = 1; i < items.length; i += 1) {
      expect(items[i].createdAt <= items[i - 1].createdAt).toBe(true);
    }
  });
});

describe("kudos store — filter scoping", () => {
  it("filters by hashtag", () => {
    const tag = "Mentor";
    const { items } = listKudos(
      { hashtag: tag, departmentId: null },
      null,
      1000,
      null,
    );
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((k) => k.hashtags.includes(tag))).toBe(true);
  });

  it("filters by department (either sender or recipient)", () => {
    const dept = "dept-design";
    const { items } = listKudos(
      { hashtag: null, departmentId: dept },
      null,
      1000,
      null,
    );
    expect(items.length).toBeGreaterThan(0);
    for (const k of items) {
      const sender = getSunnerById(k.senderId);
      const recipient = getSunnerById(k.recipientId);
      const match =
        sender?.departmentId === dept || recipient?.departmentId === dept;
      expect(match).toBe(true);
    }
  });
});

describe("kudos store — setHeart business rules", () => {
  it("blocks self-hearting", () => {
    // The demo user has kudos sent — find one
    const { items } = listKudos(
      { hashtag: null, departmentId: null },
      null,
      1000,
      null,
    );
    const ownKudos = items.find((k) => k.senderId === DEMO_CURRENT_USER_ID);
    expect(ownKudos).toBeDefined();
    expect(() =>
      setHeart(DEMO_CURRENT_USER_ID, ownKudos!.id, true),
    ).toThrow(HeartSelfBlockError);
  });

  it("toggles heart on/off (idempotent set)", () => {
    const { items } = listKudos(
      { hashtag: null, departmentId: null },
      null,
      1000,
      null,
    );
    const target = items.find((k) => k.senderId !== DEMO_CURRENT_USER_ID);
    expect(target).toBeDefined();
    const startHearts = target!.heartsCount;

    const r1 = setHeart(DEMO_CURRENT_USER_ID, target!.id, true);
    expect(r1?.kudos.heartsCount).toBe(startHearts + 1);
    expect(r1?.kudos.isHeartedByCurrentUser).toBe(true);

    // Idempotent: calling again with same target value is no-op
    const r2 = setHeart(DEMO_CURRENT_USER_ID, target!.id, true);
    expect(r2?.kudos.heartsCount).toBe(startHearts + 1);
    expect(r2?.senderHeartDelta).toBe(0);

    const r3 = setHeart(DEMO_CURRENT_USER_ID, target!.id, false);
    expect(r3?.kudos.heartsCount).toBe(startHearts);
    expect(r3?.kudos.isHeartedByCurrentUser).toBe(false);
  });

  it("credits sender +2 on special days", () => {
    // The seed includes one kudos on the 2026-04-30 special day
    // (kudos-003 per seed-data ordering).
    const special = getKudosById("kudos-003", null);
    expect(special).toBeDefined();
    expect(special!.isSpecialDay).toBe(true);

    const senderId = special!.senderId;
    const beforeHearts = getSunnerById(senderId)!.heartsReceived;
    const beforeCardHearts = special!.heartsCount;

    const r = setHeart(DEMO_CURRENT_USER_ID, special!.id, true);
    expect(r?.senderHeartDelta).toBe(2);
    // Sender's leaderboard heart total bumps by 2
    expect(getSunnerById(senderId)!.heartsReceived).toBe(beforeHearts + 2);
    // Card counter still only increments by 1
    expect(r!.kudos.heartsCount).toBe(beforeCardHearts + 1);
  });

  it("returns null for unknown kudos id", () => {
    expect(setHeart(DEMO_CURRENT_USER_ID, "kudos-nope", true)).toBeNull();
  });
});

describe("kudos store — insertKudos", () => {
  it("persists a new kudos and updates sender/recipient counts", () => {
    const sender = getSunnerById(DEMO_CURRENT_USER_ID);
    const recipient = getSunnerById("sunner-bao");
    const beforeSent = sender!.kudosSent;
    const beforeRecv = recipient!.kudosReceived;
    const k = insertKudos({
      id: "kudos-test",
      senderId: DEMO_CURRENT_USER_ID,
      recipientId: "sunner-bao",
      headline: "Người truyền cảm hứng",
      message: "test",
      hashtags: ["Mentor"],
      images: [],
      createdAt: new Date("2026-05-18T10:00:00Z").toISOString(),
    });
    expect(k.id).toBe("kudos-test");
    expect(getSunnerById(DEMO_CURRENT_USER_ID)!.kudosSent).toBe(beforeSent + 1);
    expect(getSunnerById("sunner-bao")!.kudosReceived).toBe(beforeRecv + 1);
  });
});

describe("kudos store — openNextSecretBox", () => {
  it("opens the first pending box for the user", () => {
    const before = getSunnerById(DEMO_CURRENT_USER_ID)!;
    const beforeOpened = before.secretBoxesOpened;
    const beforePending = before.secretBoxesPending;
    expect(beforePending).toBeGreaterThan(0);
    const box = openNextSecretBox(DEMO_CURRENT_USER_ID);
    expect(box).not.toBeNull();
    expect(box!.status).toBe("opened");
    expect(box!.openedAt).not.toBeNull();
    const after = getSunnerById(DEMO_CURRENT_USER_ID)!;
    expect(after.secretBoxesOpened).toBe(beforeOpened + 1);
    expect(after.secretBoxesPending).toBe(beforePending - 1);
  });

  it("returns null when no pending boxes remain", () => {
    // Open the only pending box for the demo user, then try again.
    openNextSecretBox(DEMO_CURRENT_USER_ID);
    expect(openNextSecretBox(DEMO_CURRENT_USER_ID)).toBeNull();
  });
});
