import { describe, expect, it } from "vitest";
import { AWARD_CATALOG } from "@/lib/awards/catalog";

describe("AWARD_CATALOG", () => {
  it("exposes exactly six categories in the Figma order", () => {
    expect(AWARD_CATALOG).toHaveLength(6);
    expect(AWARD_CATALOG.map((c) => c.slug)).toEqual([
      "top-talent",
      "top-project",
      "top-project-leader",
      "best-manager",
      "signature-2025-creator",
      "mvp",
    ]);
  });

  it("uses kebab-case slugs", () => {
    for (const c of AWARD_CATALOG) {
      expect(c.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });

  it("provides a non-empty title, description, and longDescription for every category", () => {
    for (const c of AWARD_CATALOG) {
      expect(c.title.length).toBeGreaterThan(0);
      expect(c.description.length).toBeGreaterThan(0);
      expect(c.longDescription.length).toBeGreaterThan(0);
    }
  });

  it("references label assets under public/assets/homepage-saa/images/", () => {
    for (const c of AWARD_CATALOG) {
      expect(c.labelSrc).toMatch(
        /^\/assets\/homepage-saa\/images\/award-label-[a-z0-9-]+\.png$/,
      );
      expect(c.labelWidth).toBeGreaterThan(0);
      expect(c.labelHeight).toBeGreaterThan(0);
    }
  });

  it("carries the canonical prize counts and units per Figma `Hệ thống giải`", () => {
    const lookup = Object.fromEntries(AWARD_CATALOG.map((c) => [c.slug, c]));
    expect(lookup["top-talent"]).toMatchObject({
      count: 10,
      countUnit: "Cá nhân",
      valuePrimary: "7.000.000 VNĐ",
    });
    expect(lookup["top-project"]).toMatchObject({
      count: 10,
      countUnit: "Đơn vị",
      valuePrimary: "7.000.000 VNĐ",
    });
    expect(lookup["top-project-leader"]).toMatchObject({
      count: 10,
      countUnit: "Cá nhân",
      valuePrimary: "7.000.000 VNĐ",
    });
    expect(lookup["best-manager"]).toMatchObject({
      count: 10,
      countUnit: "Đơn vị",
      valuePrimary: "7.000.000 VNĐ",
    });
    expect(lookup["mvp"]).toMatchObject({
      count: 10,
      countUnit: "Đơn vị",
      valuePrimary: "7.000.000 VNĐ",
    });
  });

  it("Signature 2025 carries dual values with their own per-prize suffixes", () => {
    const signature = AWARD_CATALOG.find(
      (c) => c.slug === "signature-2025-creator",
    );
    expect(signature?.count).toBe(1);
    // Unit is rendered as 3 stacked lines per Figma `313:8488`.
    expect(signature?.countUnit).toEqual(["Cá nhân", "hoặc", "tập thể"]);
    expect(signature?.valuePrimary).toBe("5.000.000 VNĐ");
    expect(signature?.valuePrimarySuffix).toBe("cho giải cá nhân");
    expect(signature?.valueSecondary).toBe("8.000.000 VNĐ");
    expect(signature?.valueSecondarySuffix).toBe("cho giải tập thể");
  });

  it("MVP title includes the expanded acronym in parentheses", () => {
    const mvp = AWARD_CATALOG.find((c) => c.slug === "mvp");
    expect(mvp?.title).toBe("MVP (Most Valuable Person)");
  });

  it("longDescriptions are unique per category (no shared placeholder)", () => {
    const descriptions = AWARD_CATALOG.map((c) => c.longDescription);
    const unique = new Set(descriptions);
    expect(unique.size).toBe(AWARD_CATALOG.length);
  });

  it("every category points at a valid hero image asset path", () => {
    for (const c of AWARD_CATALOG) {
      expect(c.heroImageSrc).toMatch(
        /^\/assets\/[a-z0-9-]+\/images\/[a-z0-9-]+\.(png|svg)$/,
      );
    }
  });
});
