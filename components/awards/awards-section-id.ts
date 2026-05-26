/**
 * Single source of truth for the DOM ids used to mark each award's section on
 * the Awards Information page. Both `<AwardInfoBlock>` (assigns the id) and
 * `<AwardsSideMenu>` (reads the ids via IntersectionObserver + smooth-scroll
 * targets) MUST go through these helpers.
 */
export const AWARDS_SECTION_ID_PREFIX = "award-section-" as const;

export function getAwardsSectionId(slug: string): string {
  return `${AWARDS_SECTION_ID_PREFIX}${slug}`;
}

export function getSlugFromAwardsSectionId(id: string): string | null {
  if (!id.startsWith(AWARDS_SECTION_ID_PREFIX)) {
    return null;
  }
  const slug = id.slice(AWARDS_SECTION_ID_PREFIX.length);
  return slug.length > 0 ? slug : null;
}
