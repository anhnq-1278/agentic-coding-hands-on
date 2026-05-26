# Implementation Plan: Hệ thống giải (Awards Information)

**Frame**: `zFYDgyj_pD-He-thong-giai` (root node `313:8436`)
**Date**: 2026-05-14
**Spec**: [`spec.md`](./spec.md)
**Screenflow detail**: [`../../contexts/screen_specs/he-thong-giai.md`](../../contexts/screen_specs/he-thong-giai.md)
**Constitution**: [`../../constitution.md`](../../constitution.md) (v1.2.0)
**Reuses from**: Login ([`../GzbNeVGJHz-Login/`](../GzbNeVGJHz-Login/)), Homepage SAA ([`../i87tDx10uM-Homepage-SAA/`](../i87tDx10uM-Homepage-SAA/)), Countdown ([`../8PJQswPZmU-Countdown-Prelaunch-page/`](../8PJQswPZmU-Countdown-Prelaunch-page/))

---

## Summary

Build the **Hệ thống giải / Awards Information** page at route
**`/awards-information`** (decision below) — a single long-scroll page that
lists all six SAA 2025 awards with full description, prize count, and prize
value. Layout: standard `AppHeader` + keyvisual cover + two-column body
(sticky scrollspy side-menu on the left + stacked award info-blocks on the
right) + `SunKudosBlock` + `AppFooter`. Anchored deep links (`#top-talent`,
`#mvp`, etc.) work both for inbound Homepage card clicks AND for the
in-page side menu.

The page is **auth-gated** (decision below) — anonymous visitors are
redirected to `/login`, preserving the original `path + hash` as a
`returnTo` cookie so the hash survives the round-trip.

Most chrome (header, footer, Sun* Kudos block) ships unchanged from
Homepage. The new pieces are:

1. A **page route** that reads the awards catalog server-side.
2. An extended **`AwardCategory` type** with count/value/long-description
   fields.
3. A new client component **`<AwardsSideMenu>`** with scrollspy +
   hash-sync.
4. A new server component **`<AwardInfoBlock>`** (per-award stacked layout —
   different from Homepage's compact `<AwardCard>`).
5. Middleware adjustment: remove `/awards-information` from
   `PUBLIC_ROUTE_PREFIXES` so the auth gate kicks in.
6. A `returnTo` enhancement at sign-in: preserve the hash through the
   OAuth round-trip (lives in the Login flow, but this plan triggers the
   change).

---

## Technical Context

| Item | Choice |
|------|--------|
| **Route** | `/awards-information` (decision — see below) |
| **Auth** | Required. Anonymous → `/login` via existing middleware once the route is removed from the public list. |
| **Framework** | TypeScript 5 (strict) / Next.js 16 App Router / React 19 |
| **Styling** | Tailwind CSS v4 + CSS variables in `app/globals.css` |
| **State management** | Local `useState` for scroll-active slug; URL hash via `history.replaceState`; no global store |
| **Scrollspy** | `IntersectionObserver` per section (threshold 25%); pure browser API, no library |
| **API style** | No new APIs. Awards catalog stays static in `lib/awards/catalog.ts` (extended in this PR). |
| **Testing** | Vitest + Testing Library + jsdom (unit/integration); Playwright (E2E) — config already in place |
| **i18n** | In-app dictionary (extend `lib/i18n/dictionary.ts` with `awards` namespace for the page-specific copy) |

> **No new dependencies.** Everything inherited.

---

## Constitution Compliance Check

*GATE: must pass before implementation can begin.*

| Requirement | Constitution Rule | Status |
|-------------|-------------------|--------|
| Spec exists & traces to Figma | I — Spec-Driven Development | ✅ Compliant |
| Navigation sourced from SCREENFLOW.md | I — Spec-Driven Development | ✅ Compliant |
| Tests written before implementation | II — Test-First (NON-NEGOTIABLE) | 📋 Planned |
| Layered architecture | III — Layered Architecture | 📋 Planned |
| No hard-coded visual values | IV — Design Tokens | 📋 Planned |
| TS strict, ESLint clean, conventions | V — Type Safety & Convention Conformance | ✅ Compliant |
| `npm run build`, `npm run lint`, `npm run test` pass | V — Quality gate | 📋 Planned |

**Violations**:

| Violation | Justification | Alternative Rejected |
|-----------|---------------|---------------------|
| Plan written before `design-style.md` is generated | Same as Login/Homepage/Countdown: visual specs fetched on-demand at implementation per Constitution Principle IV. | Generating a frozen `design-style.md` duplicates Figma and rots fast. |
| Plan written before `BACKEND_API_TESTCASES.md` | No new APIs introduced; awards metadata stays static. The contract is the spec's "Canonical metadata table". | Blocking the plan for documentation that adds no signal. |
| Modifying the existing Homepage `AWARD_CATALOG` (extending fields) | The catalog is the shared single source of truth for both screens. Extension is backward-compatible (new optional fields). | Duplicating the catalog for this page diverges the data; reviewers would have to keep two copies in sync. |

---

## Architecture Decisions

### Resolutions for the spec's three flagged inconsistencies

| Inconsistency | **Decision** | Why |
|---------------|--------------|-----|
| Route name (`/he-thong-giai` per test cases vs `/awards-information` per existing code) | **Keep `/awards-information`** | (a) Already wired into Homepage `AWARD_CATALOG` hrefs, middleware public list, and the existing placeholder page. Changing it touches 4+ files for cosmetic gain. (b) Vietnamese-only route slug fights bilingualism. (c) The test case URL is one piece of authored copy — easier to update than the established route. The Vietnamese title still renders in the page heading; the URL stays English. |
| Auth gate (test case ID-1 says anon → `/login`; Homepage spec listed `/awards-information` as a public placeholder) | **Auth-gated** | (a) Test case ID-1 is explicit and authoritative. (b) Awards content is internal-only campaign material. (c) The Homepage spec's "public placeholder" was a pre-implementation guess; we never shipped the real page as public. **Action**: this PR removes `/awards-information` from `PUBLIC_ROUTE_PREFIXES` in `middleware.ts`. |
| `signature-2025-creator` slug confirmation | **Canonical: `signature-2025-creator`** (no special hyphen escaping) | Matches existing Homepage `AWARD_CATALOG`. The Figma title "Signature 2025 - Creator" maps to this slug via kebab-case with a single internal hyphen. The current Homepage entry already uses this slug; no change needed. |

### Frontend approach

- **Page composition**: Server Component reading `getCurrentUser` (gate),
  `getLocale`, `getHomepageDictionary`/`getAwardsDictionary` (new), and the
  extended `AWARD_CATALOG`. Renders the static layout; the side menu's
  active state is owned by a client component.
- **Component split**:
  - `<AwardsPage>` (Server): page composition.
  - `<AwardsSideMenu>` (Client): the only interactive piece. Hosts the
    scrollspy `IntersectionObserver` + click handlers + hash sync.
  - `<AwardInfoBlock>` (Server): one of the six stacked sections — image +
    title + long description + count line + value line. Different from
    Homepage's compact `<AwardCard>`.
  - `<AwardsKeyvisual>` (Server): cover banner.
  - `<SunKudosBlock>` (existing, shared from Homepage): no changes.
- **Catalog extension**: `AwardCategory` gains optional fields. The
  Homepage `<AwardCard>` continues to read the existing fields only —
  backward compatible.
- **Side menu sticky behavior**: standard `position: sticky` with a
  `top` offset matching the header height; the menu stops sticking at
  the bottom of the awards container so it does not overlap the
  Sun\* Kudos block (use CSS containment within the body's left column).
- **Hash sync rules**:
  - Click a menu item → smooth-scroll to section → `history.replaceState`
    with the new hash.
  - Manual scroll → IntersectionObserver fires → update active state
    AND `history.replaceState` (debounced 200ms to avoid spam).
  - Initial load with a hash → scroll instantly to that section + mark
    active.
  - Unknown hash → default to `top-talent` active, no scroll.
  - `prefers-reduced-motion: reduce` → instant jumps, no smooth-scroll.

### Backend approach

- **No new endpoints.** The catalog stays static.
- **Middleware change** (cross-cutting, but small): remove
  `/awards-information` from `PUBLIC_ROUTE_PREFIXES` in `middleware.ts`.
  The Login PR's existing gate now handles redirect to `/login`.
- **`returnTo` hash preservation** (small Login flow tweak): the existing
  middleware-set `saa-returnTo` cookie already includes the query string;
  this plan extends it to **include the hash** as well, so an anonymous
  user clicking `/awards-information#mvp` lands back on the right anchor
  after sign-in. (Implementation note below.)

### Integration points

- **Existing services / components reused**:
  - `getCurrentUser` (Login PR) — auth gate.
  - `getLocale` (Login PR) — locale read.
  - `AppHeader`, `AppFooter` (Homepage PR) — chrome.
  - `SunKudosBlock` (Homepage PR) — promo block.
  - `AWARD_CATALOG` (Homepage PR) — extended in this PR.
  - `validateReturnTo` (Countdown PR) — hash validation extension.
- **Shared catalog**: the Homepage's `<AwardCard>` and this page's
  `<AwardInfoBlock>` read from one `AWARD_CATALOG`. The Homepage
  rendering MUST NOT regress after the extension.

---

## Project Structure

### Documentation (this feature)

```text
.momorph/specs/zFYDgyj_pD-He-thong-giai/
├── spec.md            # ✅ exists — feature specification
├── plan.md            # ✅ this file
└── tasks.md           # 📋 next step (run /momorph.tasks)
```

### Source code (root-flat layout)

```text
app/
└── awards-information/
    └── page.tsx                          # MODIFIED — replace placeholder with the real implementation; auth-gated

components/
├── awards/                               # NEW directory
│   ├── awards-page.tsx                   # NEW — Server Component composition
│   ├── awards-keyvisual.tsx              # NEW — cover banner (Server)
│   ├── awards-title.tsx                  # NEW — caption + heading (Server)
│   ├── awards-side-menu.tsx              # NEW — Client: scrollspy + hash sync
│   ├── award-info-block.tsx              # NEW — Server: per-award stacked section
│   └── awards-section-id.ts              # NEW — helper that maps slug → DOM id `award-section-{slug}`
└── homepage/
    └── award-card.tsx                    # UNCHANGED — backward-compatible

hooks/
└── use-scrollspy.ts                      # NEW — IntersectionObserver helper, returns active slug

lib/
├── awards/
│   └── catalog.ts                        # MODIFIED — extend AwardCategory with count/value/longDescription/heroImageSrc
├── auth/
│   └── return-to.ts                      # MODIFIED — extend validation to permit a single `#fragment`
└── i18n/
    └── dictionary.ts                     # MODIFIED — add `awards` namespace (page heading, side-menu labels, count units, value labels, kudos block copy)

middleware.ts                              # MODIFIED — remove `/awards-information` from PUBLIC_ROUTE_PREFIXES
lib/middleware/prelaunch-gate.ts           # UNCHANGED — already pass-through for /awards-information once the prelaunch gate is off

types/
└── homepage.ts                            # (existing — AwardCategory lives in lib/awards/catalog.ts; types/homepage.ts unchanged)

public/assets/
└── awards-information/
    ├── images/                            # NEW — 6 award detail images (336×336), keyvisual cover
    └── logos/                             # NEW (if surfaced)

tests/
├── unit/
│   ├── awards-catalog-extended.test.ts   # NEW — verifies the new fields per the canonical metadata table
│   ├── awards-section-id.test.ts         # NEW — slug → DOM id stable mapping
│   ├── awards-side-menu.test.tsx         # NEW — click scrolls/sets hash, scrollspy updates active, hash respects prefers-reduced-motion
│   └── return-to-with-hash.test.ts       # NEW — `validateReturnTo` allows a safe hash fragment
├── integration/
│   ├── awards-page-render.test.tsx       # NEW — anonymous → redirect (middleware); authed → renders 6 sections in order
│   └── awards-deep-link.test.tsx         # NEW — visiting `?error=...&hash=top-project-leader` scrolls + sets active
└── e2e/
    └── awards-information.spec.ts        # NEW — click each menu item, deep link, sign-in returnTo preserves the hash
```

### Dependencies to add

**None.** Already covered.

### Environment variables

**No new env vars.**

---

## Implementation Approach

### Phase 0: Asset preparation + dictionary scaffolding

- Query Figma for the six award detail images via `mcp__momorph__get_media_files`
  on screenId `zFYDgyj_pD`. Each award block has a 336×336 picture
  (`D.1.1_Picture-Award`). Some MAY already be downloaded under
  `public/assets/homepage-saa/images/` (Homepage's `award-bg.png` +
  six `award-label-*.png` files); cross-check by hash and reuse where
  the Figma node IDs match.
- Download the keyvisual cover banner (`3_Keyvisual` group).
- Extend `lib/i18n/dictionary.ts` with an `awards` namespace covering:
  - Page caption ("Sun\* annual awards 2025")
  - Page heading ("Hệ thống giải thưởng SAA 2025")
  - Side-menu labels (× 6 awards)
  - Long descriptions (× 6 awards)
  - Count units ("Đơn vị", "Tập thể", "Cá nhân")
  - Value labels ("Số lượng giải thưởng", "Giá trị giải thưởng")
  - Per-award value lines (handle the Signature 2025 dual-value case)

### Phase 1: Foundation — extend `AwardCategory` + `validateReturnTo` + helpers

1. **TDD: `tests/unit/awards-catalog-extended.test.ts`** — fails first.
   Asserts the six entries carry the new fields per the spec's canonical
   metadata table.
2. Extend `lib/awards/catalog.ts`:
   - Add optional `count: number`, `countUnit: "Đơn vị" | "Tập thể" | "Cá nhân"`,
     `valuePrimary: string`, `valueSecondary?: string`, `longDescription: string`,
     `heroImageSrc: string`.
   - Populate every entry per the canonical table.
3. **TDD: `tests/unit/return-to-with-hash.test.ts`** — fails first. Asserts
   `validateReturnTo` accepts `/awards-information#top-talent` and rejects
   `/path#hash#another`, `/path#javascript:`, etc.
4. Extend `lib/auth/return-to.ts` to permit a single `#fragment` whose body
   matches `[a-z0-9-]+` (case-insensitive). Anything else returns `null`.
5. **TDD: `tests/unit/awards-section-id.test.ts`** — fails first. Asserts
   `getAwardsSectionId(slug)` returns `award-section-{slug}` and is the
   only place we read/write this DOM id.
6. Implement `components/awards/awards-section-id.ts`.

**Phase 1 Checkpoint**: Homepage still renders correctly (backward-compat);
`npm run typecheck && npm run lint && npm run test` green.

### Phase 2: US1 — Display the six award info blocks

1. **TDD: `tests/integration/awards-page-render.test.tsx`** — renders the
   six blocks in order; verifies copy from the dictionary; verifies each
   block has a DOM id from `getAwardsSectionId(slug)`.
2. Implement `<AwardsKeyvisual>` + `<AwardsTitle>` (Server Components).
3. Implement `<AwardInfoBlock>` (Server Component) — takes one
   `AwardCategory`, renders image + title + long description + count line +
   value line; carries the Signature 2025 dual-value case.
4. Implement `<AwardsPage>` (Server Component) — composition.
5. Update `app/awards-information/page.tsx` to render `<AwardsPage>`. Add
   `getCurrentUser` check: redirect to `/login` if anonymous (defence in
   depth — middleware already gates this).

**Phase 2 Checkpoint**: visit `/awards-information` while signed in → all six
sections render with correct copy. Anonymous → redirected to `/login`.

### Phase 3: US2 — Side menu + scrollspy + click navigation

1. **TDD: `tests/unit/awards-side-menu.test.tsx`** — click sets active +
   replaceState; scrollspy updates active; respects
   `prefers-reduced-motion`.
2. Implement `hooks/use-scrollspy.ts` — wraps `IntersectionObserver` over
   an array of section ids; returns the active id.
3. Implement `<AwardsSideMenu>` (Client Component) — six nav items;
   click handler: smooth-scroll (or instant if reduced-motion) +
   `history.replaceState('#slug')` + set active; subscribes to
   `useScrollspy` for scroll-driven updates.
4. Wire `<AwardsSideMenu>` into `<AwardsPage>` as the left column of the
   two-column body.

**Phase 3 Checkpoint**: clicking each item scrolls to the right section;
manual scroll updates the active item.

### Phase 4: US3 — Hash deep links

1. **TDD: `tests/integration/awards-deep-link.test.tsx`** — page mounts
   with `#top-project-leader` → page scrolls + active = `top-project-leader`.
2. In `<AwardsSideMenu>`'s mount effect: read `window.location.hash`,
   strip the `#`, look up via the slug map, scroll, set active. If the
   hash is unknown, fall back to `top-talent` active and DO NOT scroll.
3. Extend the E2E spec (Phase N) to cover deep-link entry.

**Phase 4 Checkpoint**: all six Homepage award cards (`/awards-information#<slug>`)
land at the correct section. Unknown hash falls back gracefully.

### Phase 5: US6 — Auth gate (middleware + page-level)

1. **TDD: extend `tests/unit/middleware-prelaunch-gate.test.ts`** — add a
   case asserting `/awards-information` is **NOT** in the post-prelaunch
   public list (so anonymous → `/login` after T-0).
2. Edit `middleware.ts`: remove `/awards-information` from
   `PUBLIC_ROUTE_PREFIXES`.
3. Verify `app/awards-information/page.tsx` already calls `getCurrentUser`
   and redirects anonymous (defence in depth from Phase 2).
4. **TDD: `returnTo` hash preservation** — write/extend a test asserting
   that a request to `/awards-information#mvp` while anonymous results in
   a `saa-returnTo` cookie that contains `/awards-information#mvp` (not
   just `/awards-information`).
5. Extend the prelaunch-gate cookie-writer (or the existing auth redirect)
   to preserve the hash in `saa-returnTo` if the hash is safe per the
   extended `validateReturnTo`.

**Phase 5 Checkpoint**: anonymous + `/awards-information#mvp` → `/login` +
cookie set; after sign-in → land on `/awards-information#mvp` with the
MVP section active.

### Phase 6: US4 — Sun\* Kudos promo (reuse)

1. Add `<SunKudosBlock>` (the existing Homepage component) below the
   awards body in `<AwardsPage>`.
2. **TDD: extend `awards-page-render.test.tsx`** to assert the block is
   present and the "Chi tiết" CTA href is `/sun-kudos`.

**Phase 6 Checkpoint**: page renders the Kudos block; click navigates to
`/sun-kudos`.

### Phase 7: US5 + US7 — Header/footer integration + error handling

1. Verify `<AppHeader>` + `<AppFooter>` render via `<AwardsPage>` with
   `currentPath="/awards-information"` so the matching nav item is marked
   active.
2. Add the unknown-hash fallback test (already covered by Phase 4) +
   manual JS-error test (DOM scan: no console errors on bogus hash).
3. Sun\* Kudos failure (test case ID-14) — relies on Next.js' standard
   404 for the placeholder route; no new code required.

### Phase 8: Polish — a11y + mobile + reduced-motion

- `aria-current="true"` on the active side-menu item.
- `aria-label` on each award block (image, count, value).
- Keyboard navigation in the side menu (Tab + Enter/Space).
- Mobile layout (Figma desktop-only — confirm with design or implement a
  sensible fallback: side menu collapses into a horizontal pill row above
  the awards on viewports ≤ 768px).
- `prefers-reduced-motion: reduce` → instant scroll.
- README touch-up: list the new auth-gated route.
- Final acceptance: `npm run lint && npm run typecheck && npm run build && npm run test && npm run test:e2e`.

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Catalog extension breaks Homepage** | High (regression-prone) | Medium | All new fields are **optional**; Homepage `<AwardCard>` continues to read only `slug/title/description/labelSrc/...`. Backward-compat asserted by an existing Homepage integration test (renders the grid). |
| **Auth gate flip breaks public-Homepage flow** | Medium | High | Anonymous visitors clicking a Homepage award card NOW land on `/login` (was: a public placeholder page). This is the **right** behavior per the spec, but the Homepage SAA spec needs a follow-up edit to remove the "public placeholder" assumption. Document this clearly in tasks.md. |
| **Hash preservation across OAuth** | Medium | Medium | The existing `saa-returnTo` cookie writer needs to learn about hashes. `validateReturnTo` extension is small (regex on the fragment). E2E test in Phase 5 enforces. |
| **Scrollspy + click conflict** | Medium | Low | Common pitfall: a click sets the active state, the scroll fires, IntersectionObserver immediately overrides. Mitigation: ignore IntersectionObserver updates for ~600ms after a programmatic scroll. |
| **`prefers-reduced-motion` ignored** | Low | Low | One CSS media query + a runtime check before `behavior: "smooth"`. |
| **Mobile layout untested in design** | Medium | Medium | Implement the pill-row fallback; flag in Open Questions for the design team. |
| **Award image hashes diverge from Homepage** | Low | Low | The Homepage's `award-bg.png` is the SAME shared template for all six cards; this page may have six DIFFERENT detail images (per `D.1.1_Picture-Award` per award). Confirm in Phase 0 — if six unique images exist, download them; if not, reuse the shared template. |

### Estimated complexity

- **Frontend**: Medium. Two new server components, one new client
  component, one new hook. Bulk of work is in the side menu.
- **Backend**: Low. Middleware diff is one line; no new endpoints.
- **Testing**: Medium. Scrollspy testing needs `IntersectionObserver`
  mocks (jsdom doesn't ship them by default — use `@testing-library`
  helpers or a small mock).

---

## Integration Testing Strategy

### Test scope

- **Component/Module interactions**:
  - `<AwardsPage>` ↔ `getCurrentUser`, `getLocale`, `AWARD_CATALOG`.
  - `<AwardsSideMenu>` ↔ `useScrollspy` + `history.replaceState` +
    `window.location.hash`.
  - middleware ↔ `getCurrentUser` (existing auth flow gates the route).
- **External dependencies**: none new.
- **Data layer**: `saa-returnTo` cookie (hash-preserving).
- **User workflows**:
  - Anonymous visit → `/login` → sign in → land on the originally
    requested section.
  - Authed visit → page renders; click each side-menu item → correct
    section.
  - Homepage card click → deep link works.
  - Sun\* Kudos CTA → `/sun-kudos`.

### Test categories

| Category | Applicable? | Key Scenarios |
|----------|-------------|---------------|
| UI ↔ Logic | Yes | Side-menu click + scrollspy + hash sync. |
| Service ↔ Service | Yes | Page ↔ `getCurrentUser` (gate at SSR). |
| App ↔ External API | No | No external APIs in scope. |
| App ↔ Data Layer | Yes | `saa-returnTo` cookie with hash. |
| Cross-platform | Yes | Desktop + mobile (pill-row fallback). |

### Mocking strategy

| Dependency Type | Strategy | Rationale |
|-----------------|----------|-----------|
| `getCurrentUser` | Mock null / authed user | Drives the gate. |
| `IntersectionObserver` | Mock with a tiny helper that lets tests trigger `entry` callbacks manually | jsdom doesn't ship one; standard pattern. |
| `window.scrollTo` | Spy | Verifies click → scroll target. |
| `window.location.hash` | Set via jsdom in beforeEach | Drives deep-link tests. |
| `matchMedia("(prefers-reduced-motion: reduce)")` | Mock | Drives instant-vs-smooth scroll branches. |

### Test scenarios outline

1. **Happy path**
   - Authed user visits `/awards-information` → six blocks in order;
     side-menu present; Top Talent active.
   - Click each side-menu item → scrolls + hash updates + active changes.
   - Manual scroll → active changes as sections cross the threshold.
   - Inbound `/awards-information#mvp` from Homepage → lands at MVP active.
2. **Error handling**
   - Anonymous visit → `/login`; cookie preserves the requested path + hash.
   - Unknown hash (`#frobnicate`) → Top Talent active, no scroll, no JS error.
3. **Edge cases**
   - `prefers-reduced-motion: reduce` → all scrolls are instant.
   - Sun\* Kudos block click → `/sun-kudos`.
   - Click a menu item while a previous scroll is still animating → the
     latest click wins, no flicker.

### Coverage goals

| Area | Target | Priority |
|------|--------|----------|
| `lib/awards/catalog.ts` (extended fields) | 100% data coverage | High |
| `lib/auth/return-to.ts` (hash branch) | 100% line+branch | High |
| `hooks/use-scrollspy.ts` | 90%+ | High |
| `components/awards/awards-side-menu.tsx` | 85%+ | High |
| `components/awards/award-info-block.tsx` | 80%+ | Medium |
| middleware diff | 100% (one removed entry) | High |

---

## Dependencies & Prerequisites

### Required before start

- [x] `constitution.md` reviewed (v1.2.0)
- [x] `spec.md` approved by stakeholders *(self-approved by user — confirm)*
- [x] Login PR merged
- [x] Homepage PR merged
- [x] Countdown PR merged (provides `validateReturnTo` and the prelaunch
  gate that pre-empts this route during pre-launch)
- [x] **Three flagged inconsistencies resolved**:
  - [x] Route: `/awards-information` (decided above)
  - [x] Auth: auth-gated (decided above)
  - [x] Slug `signature-2025-creator` (decided above)

### External dependencies

- None.

---

## Open Questions

- [ ] **Mobile layout** — Figma surfaces a desktop frame only. Confirm
  whether the side menu collapses into a horizontal pill row (recommended)
  or a sticky top tab strip.
- [ ] **Six unique award detail images vs shared template** — Phase 0
  reveals which.
- [ ] **Smooth-scroll lock window after a click** — `600ms` is a guess;
  confirm with the UX team if a different cadence is preferred.
- [ ] **Notification panel target frame** — `6-1LRz3vqr` vs `gWBVcaSVIf`
  (still open from Homepage; not blocking this page).
- [ ] **Long-description copy source** — the design surfaces short
  descriptions only in the card grid; this page's long descriptions need
  to be authored and added to the dictionary. Coordinate with the content
  team.

---

## Next Steps

After plan approval:

1. **Run** `/momorph.tasks` to generate the executable task breakdown.
2. **Confirm** the three resolved inconsistencies with the team (the plan
   commits to defaults; reviewers can flip any).
3. **Begin** Phase 0 (assets + dictionary) + Phase 1 (catalog extension +
   helpers) — both touch existing files (catalog) so they go first.

---

## Notes

- **Catalog extension impacts Homepage**: the Homepage's `AWARD_CATALOG`
  shape grows. Phase 1's test ensures backward compatibility. Reviewers
  MUST verify the Homepage card grid still renders correctly.
- **Auth gate flip is a Homepage-spec follow-up**: the Homepage SAA
  spec's "Open Questions" entry on public-vs-auth is now decided by this
  plan in favor of auth-gated. Update the Homepage spec note in a
  follow-up PR.
- **`returnTo` hash preservation is a Login follow-up**: the Login spec's
  open question on `returnTo` hash is now decided (yes for authed) by
  this plan. The middleware change lives here; the Login spec note will
  be updated in a follow-up PR.
- **Long descriptions need authoring**: the static catalog will need
  multi-paragraph copy for each award. For MVP, the placeholder content
  from the design can ship; final copy follows from the content team.
- **Visual fidelity**: all colours/spacing/typography for `<AwardInfoBlock>`,
  `<AwardsSideMenu>`, and `<AwardsKeyvisual>` MUST be sourced via
  `mcp__momorph__query_section` against the relevant Node IDs at
  implementation time. New tokens land in `app/globals.css` with one-line
  rationale comments.
