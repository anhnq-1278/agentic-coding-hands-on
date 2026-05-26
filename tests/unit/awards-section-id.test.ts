import { describe, expect, it } from "vitest";
import {
  AWARDS_SECTION_ID_PREFIX,
  getAwardsSectionId,
  getSlugFromAwardsSectionId,
} from "@/components/awards/awards-section-id";

describe("awards-section-id", () => {
  it("prefixes the slug with `award-section-`", () => {
    expect(getAwardsSectionId("top-talent")).toBe("award-section-top-talent");
    expect(getAwardsSectionId("mvp")).toBe("award-section-mvp");
  });

  it("round-trips slug ↔ id", () => {
    const slugs = [
      "top-talent",
      "top-project",
      "top-project-leader",
      "best-manager",
      "signature-2025-creator",
      "mvp",
    ];
    for (const slug of slugs) {
      const id = getAwardsSectionId(slug);
      expect(getSlugFromAwardsSectionId(id)).toBe(slug);
    }
  });

  it("returns null for a non-section id", () => {
    expect(getSlugFromAwardsSectionId("some-other-id")).toBeNull();
    expect(getSlugFromAwardsSectionId("")).toBeNull();
  });

  it("exports the prefix constant", () => {
    expect(AWARDS_SECTION_ID_PREFIX).toBe("award-section-");
  });
});
