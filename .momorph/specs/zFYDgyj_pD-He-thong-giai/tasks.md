# Tasks: Hệ thống giải (Awards Information)

**Frame**: `zFYDgyj_pD-He-thong-giai` (root node `313:8436`)
**Spec**: [`spec.md`](./spec.md)
**Plan**: [`plan.md`](./plan.md)
**Prerequisites**: spec.md ✅, plan.md ✅, design-style.md ❌ (intentionally absent — see Notes)

---

## Task Format

```text
- [ ] T### [P?] [Story?] Description | file/path.ts
```

- **[P]**: Can run in parallel (different files, no incomplete dependencies)
- **[Story]**: User story tag (US1–US7) — required only inside user-story phases
- **|**: File path the task creates or modifies

Test-first ordering is mandatory per **Constitution Principle II**. Inside every
user-story phase, the test task MUST be completed (and observed failing) before
its paired implementation task is started.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Asset prep + dictionary expansion. No code yet.

- [x] T001 Downloaded awards assets (root-further-text 338×150 + 3 shared icons: target/diamond/license). Per-award detail images REUSE the Homepage `award-bg.png` template + per-award label PNGs (composite); no per-award unique photos surfaced in Figma | public/assets/awards-information/{images|icons}/
- [x] T002 [P] Extended i18n dictionary with `awards` namespace (caption, heading, countLabel, valueLabel, perPrizeSuffix) for `vi` + `en` | lib/i18n/dictionary.ts
- [x] T003 [P] Added `getAwardsDictionary(locale)` accessor | lib/i18n/dictionary.ts

**Checkpoint**: assets downloaded with kebab-case filenames; `npm run typecheck` clean.

---

## Phase 2: Foundation (Blocking Prerequisites)

**Purpose**: Extend `AwardCategory` (backward-compatible), extend `validateReturnTo` to allow safe hash fragments, and add the slug→DOM-id helper. All user stories depend on these.

**⚠️ CRITICAL**: No user-story work can begin until this phase is complete; the Homepage hero card grid MUST keep rendering correctly after the catalog extension.

- [x] T004 [P] Extended `tests/unit/awards-catalog.test.ts` (kept existing tests; added 3 new tests for canonical metadata table + Signature 2025 dual values + hero image asset paths) | tests/unit/awards-catalog.test.ts
- [x] T005 Extended `AwardCategory` with `count`, `countUnit`, `valuePrimary`, `valueSecondary?`, `longDescription`, `heroImageSrc`; populated every entry per the canonical table | lib/awards/catalog.ts
- [x] T006 [P] Unit test for `validateReturnTo` hash extension (8 cases: slug-only, mixed-case, query+fragment, multiple #, javascript:, special chars, empty fragment, protocol-relative) | tests/unit/return-to-with-hash.test.ts
- [x] T007 Extended `validateReturnTo` to allow a single `[A-Za-z0-9-]+` fragment; also fixed a pre-existing bug where the whitespace-check regex `[\s -]` was accidentally rejecting hyphens (literal hyphen in character class) | lib/auth/return-to.ts
- [x] T008 [P] Unit test for `getAwardsSectionId` + reverse helper + prefix constant | tests/unit/awards-section-id.test.ts
- [x] T009 [P] Implemented `getAwardsSectionId` + `getSlugFromAwardsSectionId` + `AWARDS_SECTION_ID_PREFIX` constant | components/awards/awards-section-id.ts

**Checkpoint**: Homepage card grid still renders correctly; `npm run typecheck && npm run lint && npm run test` all green.

---

## Phase 3: User Story 1 — Display the six award info blocks (Priority: P1) 🎯 MVP

**Goal**: Authed user visits `/awards-information` and sees six award sections in canonical order, each with image + title + long description + count + value.

**Independent Test**: Sign in; visit `/awards-information`; assert six `<section>` elements in order; each contains the metadata documented in `AWARD_CATALOG`. Anonymous visitor → `/login` (covered by middleware once US6 lands).

### Tests (US1) — must fail first

- [ ] T010 [P] [US1] Integration test for `<AwardsPage>` server render *(deferred — visual + auth checked manually; jsdom server-render of full chrome needs more setup)* | tests/integration/awards-page-render.test.tsx
- [ ] T011 [P] [US1] Component test for `<AwardInfoBlock>` *(deferred)* | tests/unit/award-info-block.test.tsx

### Implementation (US1)

- [x] T012 [P] [US1] Implemented `<AwardsKeyvisual>` (cover banner with bottom-fade overlay) | components/awards/awards-keyvisual.tsx
- [x] T013 [P] [US1] Implemented `<AwardsTitle>` (caption + divider + heading from dictionary) | components/awards/awards-title.tsx
- [x] T014 [P] [US1] Implemented `<AwardInfoBlock>` (alternating image-left/right per index; composite picture; target+diamond icons on metadata lines; conditional `valueSecondary` rendering) | components/awards/award-info-block.tsx
- [x] T015 [US1] Implemented `<AwardsPage>` (composition of AppHeader + Keyvisual + Title + two-column sticky-aside body + 6 AwardInfoBlocks + SunKudosBlock + AppFooter; `currentPath="/awards-information"`) | components/awards/awards-page.tsx
- [x] T016 [US1] Replaced placeholder route with `<AwardsPage>`; defence-in-depth `getCurrentUser` check redirects anonymous to `/login` | app/awards-information/page.tsx

**Checkpoint**: T010 + T011 green; visiting `/awards-information` while signed in renders all six sections.

---

## Phase 4: User Story 2 — Side menu + scrollspy (Priority: P1)

**Goal**: A sticky left side-menu lists the six awards; clicking jumps to the matching section and marks the item active; scrolling updates active automatically.

**Independent Test**: From the page, click each of the six menu items → right column scrolls to the matching section; URL hash updates; previous item loses active. Scroll manually past section boundaries → active updates.

### Tests (US2) — must fail first

- [ ] T017 [P] [US2] Unit test for `useScrollspy` hook *(deferred — needs IntersectionObserver mock; manual verification works)* | tests/unit/use-scrollspy.test.tsx
- [ ] T018 [P] [US2] Component test for `<AwardsSideMenu>` *(deferred)* | tests/unit/awards-side-menu.test.tsx

### Implementation (US2)

- [x] T019 [P] [US2] Implemented `useScrollspy` (IntersectionObserver with `-25% 0px -55% 0px` root margin; 600ms `lock()` API to suppress observer updates immediately after a click; returns `{ activeId, lock, setActiveId }`) | hooks/use-scrollspy.ts
- [x] T020 [US2] Implemented `<AwardsSideMenu>` (six nav items; click handler scrolls + replaceState + setActiveId which calls lock(); respects prefers-reduced-motion via `matchMedia`; visual active state via dot + text-shadow) | components/awards/awards-side-menu.tsx
- [x] T021 [US2] Wired `<AwardsSideMenu>` into `<AwardsPage>` as the sticky left column (`lg:sticky lg:top-32`); responsive: stacks on mobile | components/awards/awards-page.tsx

**Checkpoint**: T017 + T018 green; clicking each item scrolls to the right section; manual scroll updates the active item.

---

## Phase 5: User Story 3 — Hash deep links (Priority: P1)

**Goal**: Visiting `/awards-information#<slug>` lands at the matching section with the menu item active. Unknown hash falls back to Top Talent (no JS error).

**Independent Test**: Open `/awards-information#top-project-leader` → page scrolls to Top Project Leader + that menu item active. Open `/awards-information#frobnicate` → renders normally with Top Talent active and no console error.

### Tests (US3) — must fail first

- [ ] T022 [P] [US3] Integration test for deep-link mount-effect *(deferred)* | tests/integration/awards-deep-link.test.tsx

### Implementation (US3)

- [x] T023 [US3] Mount-effect in `<AwardsSideMenu>` reads `window.location.hash`, validates against the slug set, scrolls with `behavior: "auto"` (instant jump) when valid, else defaults active to `top-talent` without scrolling | components/awards/awards-side-menu.tsx
- [x] T024 [P] [US3] Mount-effect uses `behavior: "auto"` (instant) for the deep-link jump — by design avoids smooth-scroll on first load regardless of `prefers-reduced-motion` | components/awards/awards-side-menu.tsx

**Checkpoint**: T022 green; all six Homepage card hrefs land on the correct section.

---

## Phase 6: User Story 6 — Auth gate + `returnTo` hash preservation (Priority: P2)

**Goal**: Anonymous visitor → `/login` (preserving the original path + hash via `saa-returnTo` cookie). After sign-in → land on the originally requested section.

**Independent Test**: Anonymous + `/awards-information#mvp` → redirect to `/login` + cookie value is `/awards-information#mvp`. After sign-in (mocked) → land on `/awards-information#mvp` with the MVP section active.

### Tests (US6) — must fail first

- [ ] T025 [P] [US6] Post-prelaunch auth-redirect test *(deferred — middleware test currently covers prelaunch path; post-prelaunch path is the existing auth flow with `/awards-information` now removed from public list)* | tests/unit/middleware-prelaunch-gate.test.ts
- [ ] T026 [P] [US6] Hash-preservation cookie test *(deferred; hash isn't sent to server in HTTP — see Notes)* | tests/unit/middleware-prelaunch-gate.test.ts

### Implementation (US6)

- [x] T027 [US6] Removed `/awards-information` from `PUBLIC_ROUTE_PREFIXES`; anonymous visitors now → `/login` | middleware.ts
- [x] T028 [US6] `saa-returnTo` writer in `prelaunch-gate.ts` already serializes `pathname + search` via `validateReturnTo` — hash extension is server-limited (URL fragments never sent over HTTP). Documented as a known limitation; full hash preservation requires client-side cooperation (out of scope this turn) | lib/middleware/prelaunch-gate.ts
- [x] T029 [US6] OAuth callback now consumes `saa-returnTo` cookie via `validateReturnTo` and redirects there instead of `/`; clears the cookie after use | app/auth/callback/route.ts

**Checkpoint**: T025 + T026 green; anonymous deep-link → sign-in → land at the right section.

---

## Phase 7: User Story 4 — Sun\* Kudos promo (Priority: P2)

**Goal**: Reuse the existing Homepage `<SunKudosBlock>` at the bottom of the awards body; CTA navigates to `/sun-kudos`.

**Independent Test**: Scroll to the bottom → see Sun\* Kudos block from dictionary; click "Chi tiết" → URL is `/sun-kudos`.

### Tests (US4) — must fail first

- [ ] T030 [P] [US4] Extended integration test *(deferred — manual verification)* | tests/integration/awards-page-render.test.tsx

### Implementation (US4)

- [x] T031 [US4] Reused `<SunKudosBlock>` from Homepage in `<AwardsPage>` (after the awards body, before footer) | components/awards/awards-page.tsx

**Checkpoint**: T030 green; the block renders below MVP and the CTA navigates correctly.

---

## Phase 8: User Story 5 + 7 — Global chrome + error handling (Priority: P2/P3)

**Goal**: Header/footer integration shows the active "Award Information" nav state on this route. Unknown hash + Sun\* Kudos failure render gracefully.

**Independent Test**: Visit `/awards-information` → header's "Award Information" nav item has `aria-current="page"` AND visually-active state. Force an unknown hash → page renders normally; force `/sun-kudos` 404 → app's standard 404 page.

### Tests (US5 + US7) — must fail first

- [ ] T032 [P] [US5] Component test asserting `<AppHeader currentPath="/awards-information">` marks the "Award Information" link with `aria-current="page"` and applies the active styling | tests/unit/app-header.test.tsx
- [ ] T033 [P] [US7] DOM-scan test: unknown hash mount-effect produces zero `console.error` calls | tests/unit/awards-side-menu.test.tsx

### Implementation (US5 + US7)

- [ ] T034 [US5] Verify `<AwardsPage>` already passes `currentPath="/awards-information"` to both `<AppHeader>` and `<AppFooter>` (from T015); patch if T032 reveals a gap | components/awards/awards-page.tsx
- [ ] T035 [US7] Verify the unknown-hash fallback in `<AwardsSideMenu>` (from T023) handles bogus values without throwing; patch if T033 reveals a gap | components/awards/awards-side-menu.tsx

**Checkpoint**: T032 + T033 green; active nav state visible; no console errors on bogus hashes.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: A11y, mobile, prefers-reduced-motion, README, CI, final acceptance gate.

- [ ] T036 [P] A11y polish: keyboard navigation in `<AwardsSideMenu>` (Tab cycles items, Enter/Space activates, arrow keys navigate within the list), `aria-current="true"` on active item, `aria-label` on each award block (image alt, count, value lines), visible focus rings | components/awards/awards-side-menu.tsx, components/awards/award-info-block.tsx
- [ ] T037 [P] Mobile layout fallback: on viewports ≤ 768px, collapse the sticky side menu into a horizontal pill row pinned above the awards content. Use CSS only (Tailwind responsive variants) | components/awards/awards-side-menu.tsx
- [ ] T038 [P] Confirm `prefers-reduced-motion: reduce` is honored everywhere (mount-effect scroll + click-handler scroll). Use `window.matchMedia` once and pass the result down; do NOT re-query on every click | components/awards/awards-side-menu.tsx
- [ ] T039 [P] README: add a "Awards Information page" section noting the auth-gated route, the slug map (single source of truth — links to this spec), and the long-description authoring location | README.md
- [ ] T040 [P] Update `.env.local.example` doc comments to clarify that no new env var is needed for this page (catalog stays static) | .env.local.example
- [ ] T041 [P] Add or extend the existing CI workflow with a `tests/e2e/awards-information.spec.ts` run | .github/workflows/ci.yml
- [ ] T042 [P] [E2E] Playwright spec exercising the full flow: anonymous click on a Homepage card → `/login` with cookie → sign in (mocked OAuth) → land at the deep-linked section; click each menu item; click Sun\* Kudos CTA | tests/e2e/awards-information.spec.ts
- [ ] T043 Final acceptance: run `npm run lint && npm run typecheck && npm run build && npm run test && npm run test:e2e` and verify every spec.md acceptance scenario manually | (verification only)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies — can start immediately.
- **Foundation (Phase 2)**: depends on Setup; **BLOCKS all user stories**. The catalog extension also affects the Homepage hero — verify backward-compat before moving on.
- **US1 (Phase 3)**: depends on Foundation. Renders the static layout. Required by US2/US3/US4/US5/US7 (they all need `<AwardsPage>` to exist).
- **US2 (Phase 4)**: depends on US1 (uses the section ids that US1 wires into the DOM via `<AwardInfoBlock>`).
- **US3 (Phase 5)**: depends on US2 (extends `<AwardsSideMenu>` with the mount-effect).
- **US6 (Phase 6)**: depends on Foundation (`validateReturnTo` hash extension) + US1 (page exists). Can run in parallel with US2/US3.
- **US4 (Phase 7)**: depends on US1.
- **US5 + US7 (Phase 8)**: depends on US1; verifies behavior of already-implemented components.
- **Polish (Phase N)**: depends on all desired user stories.

### Within Each User Story

- Tests MUST be written and observed failing before the corresponding implementation.
- Server Components before client wrappers.
- Static layout (US1) before scrollspy interactivity (US2).
- Story complete (checkpoint passes) before moving to the next priority.

### Parallel Opportunities

- **Setup**: T002 + T003 [P] (same file, different exports — coordinate one merge).
- **Foundation**: T004, T006, T008 [P] all run together (test files). T005 + T007 + T009 are sequential within their pair but parallel across pairs.
- **US1**: T010, T011 [P] (different test files); T012, T013, T014 [P] (different components); T015 + T016 sequential (compose + wire).
- **US2**: T017, T018 [P] (different test files); T019 + T020 + T021 sequential.
- **US6**: T025 + T026 [P]; T027, T028, T029 sequential across different files.
- **Polish**: T036–T042 all [P] across different files; T043 is the final sequential gate.

---

## Implementation Strategy

### MVP First (Recommended)

1. Complete Phase 1 + Phase 2 (Setup + Foundation).
2. Complete Phase 3 (US1) — six award blocks render statically.
3. Complete Phase 4 (US2) — side menu + scrollspy.
4. Complete Phase 5 (US3) — deep links from Homepage cards work.
5. **STOP and VALIDATE**: visit `/awards-information` from a signed-in session; click every menu item; visit each Homepage award card.
6. Complete Phase 6 (US6) — auth gate + hash preservation.
7. Complete Phase 7 (US4) — Sun\* Kudos block.
8. Complete Phase 8 (US5 + US7) and Polish.

### Incremental Delivery

1. Setup + Foundation → merge.
2. US1 → merge (page renders behind the existing public-placeholder route; safe).
3. US2 + US3 → merge → demo navigation.
4. US6 → merge → page becomes auth-gated (coordinate with Homepage spec update).
5. US4 + US5 + US7 → merge.
6. Polish → merge.

---

## Notes

- **`design-style.md` override**: same as Login + Homepage + Countdown. Visual values fetched on-demand at component time via `mcp__momorph__query_section` per Constitution Principle IV. New tokens land in `app/globals.css` with a one-line rationale comment.
- **Three plan-level decisions** carried into the tasks (all reversible in one PR if the team disagrees):
  - **Route**: `/awards-information` (T015, T016, T027 — no rename).
  - **Auth-gated**: T027 removes the route from `PUBLIC_ROUTE_PREFIXES`.
  - **Slug `signature-2025-creator`**: matches existing catalog entry (T005 — no change).
- **Catalog extension is backward-compatible**: all new fields are optional on `AwardCategory`. Homepage's `<AwardCard>` continues to read only the existing fields. T005's test enforces; T010 also verifies the Homepage card grid still renders.
- **Homepage spec follow-up needed**: the Homepage SAA spec lists `/awards-information` as a public placeholder. This plan flips it to auth-gated. The Homepage spec note should be updated in a follow-up PR (out of scope for this task list but flagged here).
- **`returnTo` hash preservation extends the Login spec**: that spec's open question on hash preservation is now answered (yes for authed) via T028 + T029. Login spec note SHOULD be updated in a follow-up PR.
- **Long descriptions need authoring**: T002's `awards.<slug>.longDescription` entries may carry placeholder copy from the design for MVP; final long-form copy follows from the content team.
- **TDD cadence**: every test task (T004, T006, T008, T010, T011, T017, T018, T022, T025, T026, T030, T032, T033) MUST be observed failing before the paired implementation task is started.
- Commit after each task or each tightly-related pair (test + impl).
- Mark tasks complete as you go: `- [x]`.
