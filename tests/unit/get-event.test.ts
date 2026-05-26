import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getEvent, formatEventDate } from "@/lib/events/get-event";

describe("getEvent", () => {
  const original = {
    EVENT_START_AT: process.env.EVENT_START_AT,
    EVENT_LOCATION: process.env.EVENT_LOCATION,
    EVENT_LIVESTREAM_NOTE: process.env.EVENT_LIVESTREAM_NOTE,
  };

  beforeEach(() => {
    delete process.env.EVENT_START_AT;
    delete process.env.EVENT_LOCATION;
    delete process.env.EVENT_LIVESTREAM_NOTE;
  });

  afterEach(() => {
    for (const [k, v] of Object.entries(original)) {
      if (v === undefined) {
        delete process.env[k];
      } else {
        process.env[k] = v;
      }
    }
  });

  it("parses a valid ISO-8601 EVENT_START_AT into epoch ms", () => {
    process.env.EVENT_START_AT = "2025-12-26T18:30:00+07:00";
    const event = getEvent();

    expect(event.malformed).toBe(false);
    expect(event.startAt).toBe(Date.parse("2025-12-26T18:30:00+07:00"));
    expect(event.startAtIso).toBe("2025-12-26T18:30:00+07:00");
  });

  it("falls back gracefully when EVENT_START_AT is missing", () => {
    const event = getEvent();
    expect(event.malformed).toBe(true);
    expect(event.startAt).toBe(0);
  });

  it("falls back gracefully when EVENT_START_AT is malformed", () => {
    process.env.EVENT_START_AT = "not-a-date";
    const event = getEvent();
    expect(event.malformed).toBe(true);
  });

  it("uses default location and livestream note when overrides are absent", () => {
    process.env.EVENT_START_AT = "2025-12-26T18:30:00+07:00";
    const event = getEvent();
    expect(event.location).toBe("Âu Cơ Art Center");
    expect(event.livestreamNote).toBe(
      "Tường thuật trực tiếp qua sóng Livestream",
    );
  });

  it("respects EVENT_LOCATION and EVENT_LIVESTREAM_NOTE overrides", () => {
    process.env.EVENT_START_AT = "2025-12-26T18:30:00+07:00";
    process.env.EVENT_LOCATION = "Custom Hall";
    process.env.EVENT_LIVESTREAM_NOTE = "Watch on Zoom";
    const event = getEvent();
    expect(event.location).toBe("Custom Hall");
    expect(event.livestreamNote).toBe("Watch on Zoom");
  });
});

describe("formatEventDate", () => {
  it("renders DD/MM/YYYY for vi locale", () => {
    const event = {
      startAt: Date.parse("2025-12-26T18:30:00+07:00"),
      startAtIso: "2025-12-26T18:30:00+07:00",
      location: "",
      livestreamNote: "",
      malformed: false,
    };
    expect(formatEventDate(event, "vi")).toMatch(/^\d{2}\/\d{2}\/2025$/);
  });

  it("returns dash for malformed events", () => {
    const event = {
      startAt: 0,
      startAtIso: "",
      location: "",
      livestreamNote: "",
      malformed: true,
    };
    expect(formatEventDate(event, "vi")).toBe("—");
  });
});
