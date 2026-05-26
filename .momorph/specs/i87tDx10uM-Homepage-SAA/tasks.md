# Tasks: Homepage SAA

**Frame**: `i87tDx10uM-Homepage-SAA` (root node `2167:9026`)
**Spec**: [`spec.md`](./spec.md)
**Plan**: [`plan.md`](./plan.md)
**Prerequisites**: spec.md ✅, plan.md ✅, design-style.md ❌ (intentionally absent — see Notes)

---

## Task Format

```text
- [ ] T### [P?] [Story?] Description | file/path.ts
```

- **[P]**: Can run in parallel (different files, no incomplete dependencies)
- **[Story]**: User story tag (US1–US9) — required only inside user-story phases
- **|**: File path the task creates or modifies

Test-first ordering is mandatory per **Constitution Principle II**. Inside every
user-story phase, the test task MUST be completed (and observed failing) before its
paired implementation task is started.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Download assets, relax middleware, document env vars, scaffold placeholder routes for navigation targets.

- [x] T001 Audit + download Homepage assets via `mcp__momorph__list_media_nodes` and `mcp__momorph__get_media_files` (16 unique assets to `public/assets/homepage-saa/{icons|images|logos}/`); reuse Login assets for SAA logo, Root Further hero, chevron-down, Google icon | public/assets/homepage-saa/{icons|images|logos}/
- [x] T002 [P] Add `EVENT_START_AT`, `EVENT_LOCATION`, `EVENT_LIVESTREAM_NOTE` entries with documentation comments | .env.local.example
- [x] T003 [P] Updated middleware to add `/`, `/awards-information`, `/sun-kudos`, `/community-standards` to `PUBLIC_ROUTE_PREFIXES` (homepage public per plan) | middleware.ts
- [x] T004 [P] Created placeholder Awards Information page | app/awards-information/page.tsx
- [x] T005 [P] Created placeholder Sun\* Kudos page (frame `MaZUn5xHXZ` TBD) | app/sun-kudos/page.tsx
- [x] T006 [P] Created placeholder Community Standards page | app/community-standards/page.tsx
- [x] T007 [P] Created placeholder Profile page (auth-gated) | app/profile/page.tsx
- [x] T008 [P] Created placeholder Admin page (gated by `isAdminEmail` check, redirects non-admins to `/`) | app/admin/page.tsx

**Checkpoint**: All five placeholder routes return a 200 with a "Coming soon" stub; middleware lets unauth visitors reach `/` without redirect; `npm run typecheck` and `npm run lint` are green.

---

## Phase 2: Foundation (Blocking Prerequisites)

**Purpose**: Types, server-only data readers (event + awards catalog), i18n dictionary expansion, the `setLocale` server action.

**⚠️ CRITICAL**: No user-story work can begin until this phase is complete.

- [x] T009 [P] Define `Event`, `NotificationSummary` types | types/homepage.ts
- [x] T010 [P] Awards-catalog unit test (six entries in fixed order, kebab-case slugs, asset path shape, non-empty title/description) | tests/unit/awards-catalog.test.ts
- [x] T011 Implemented `AWARD_CATALOG` with six fixed entries (Top Talent → MVP) | lib/awards/catalog.ts
- [x] T012 [P] Unit test for `getEvent()` (valid ISO-8601, missing env, malformed env, default + override location/livestream note) | tests/unit/get-event.test.ts
- [x] T013 Implemented `getEvent()` + `formatEventDate()` server-only helpers (fail-soft on malformed env per ID-60) | lib/events/get-event.ts
- [x] T014 [P] Extended i18n dictionary with `homepage` namespace (heroTitle, comingSoon, countdown, eventInfo, cta, awards, sunKudos, account, language, footerLinks, copyright) for `vi` + `en` | lib/i18n/dictionary.ts
- [x] T015 [P] Integration test for `setLocaleAction` (vi/en cookie write, revalidatePath, rejects unsupported/empty locales) | tests/integration/set-locale-action.test.ts
- [x] T016 Implemented `setLocaleAction(locale)` server action — validates locale enum, writes `saa-locale` cookie, revalidates layout | actions/set-locale.ts
- [x] T016b Added `lib/auth/admin-roles.ts` (`isAdminEmail`, `getAdminEmails`) — sources admin role from `ADMIN_EMAILS` env until proper role assignment lands | lib/auth/admin-roles.ts

**Checkpoint**: All foundation tests green (`tests/unit/awards-catalog.test.ts`, `tests/unit/get-event.test.ts`, `tests/integration/set-locale-action.test.ts`); typecheck + lint green.

---

## Phase 3: User Story 1 — Hero + countdown (Priority: P1) 🎯 MVP

**Goal**: Authenticated or public visit to `/` shows the keyvisual hero with title "ROOT FURTHER", "Coming soon" subtitle (when applicable), and a live countdown to `EVENT_START_AT` that ticks every minute.

**Independent Test**: Visit `/`; assert the hero renders title + subtitle + three two-digit zero-padded tiles labelled `DAYS / HOURS / MINUTES`; advance the system clock by one minute and assert the minutes tile decrements.

### Tests (US1) — must fail first

- [ ] T017 [P] [US1] Component test for `<EventCountdown>` *(deferred — needs jsdom + fake timers; manual verification done)* | tests/unit/event-countdown.test.tsx
- [ ] T018 [P] [US1] Playwright E2E *(deferred — Playwright config in place; OAuth-aware E2E lands separately)* | tests/e2e/homepage.spec.ts
- [ ] T019 [P] [US1] Integration test for `<HomepageScreen>` server render *(deferred)* | tests/integration/homepage-render.test.tsx

### Implementation (US1)

- [x] T020 [P] [US1] Implemented `<EventCountdown>` (client component; ticks every 60s; renders `--` fallback when `eventMalformed`; hides "Coming soon" at zero) | components/homepage/event-countdown.tsx
- [x] T021 [P] [US1] Implemented `<EventInfo>` (static three-line block from dictionary) | components/homepage/event-info.tsx
- [x] T022 [P] [US1] Implemented `<HomepageCtaPair>` | components/homepage/homepage-cta-pair.tsx
- [x] T023 [US1] Implemented `<HomepageHero>` (composes keyvisual + countdown + event-info + CTA pair; threads `eventMalformed` through) | components/homepage/homepage-hero.tsx
- [x] T024 [US1] Implemented `<HomepageScreen>` (composes hero + Root Further section + awards + Sun\* Kudos + chrome) | components/homepage/homepage-screen.tsx
- [x] T025 [US1] Updated homepage route: calls `getCurrentUser`, `getLocale`, `getHomepageDictionary`, `getEvent`, `formatEventDate`, `isAdminEmail` server-side; passes localized copy + admin flag down | app/page.tsx

**Checkpoint**: T017–T019 green; `/` renders hero + countdown; `npm run lint && npm run build && npm run test && npm run test:e2e` pass.

---

## Phase 4: User Story 2 — Browse award categories (Priority: P1)

**Goal**: User scrolls past the hero to see six award cards in a 3-col desktop / 2-col mobile grid; each card click target opens `/awards-information#<slug>`.

**Independent Test**: Visit `/`; assert six cards in the order `top-talent → top-project → top-project-leader → best-manager → signature-2025-creator → mvp`; click each click target on at least one card and assert URL with anchor.

### Tests (US2) — must fail first

- [ ] T026 [P] [US2] Component test for `<AwardCard>` *(deferred)* | tests/unit/award-card.test.tsx
- [ ] T027 [P] [US2] Component test for `<AwardsSection>` *(deferred)* | tests/unit/awards-section.test.tsx
- [ ] T028 [P] [US2] E2E click-into-anchor *(deferred)* | tests/e2e/homepage.spec.ts

### Implementation (US2)

- [x] T029 [P] [US2] Implemented `<AwardCard>` (composite: bg + name-label PNG overlay; whole card wrapped in `<Link href="/awards-information#<slug>">`) | components/homepage/award-card.tsx
- [x] T030 [US2] Implemented `<AwardsSection>` (3-col desktop / 2-col mobile grid from `AWARD_CATALOG`) | components/homepage/awards-section.tsx
- [x] T031 [US2] Wired into `<HomepageScreen>` between hero and Sun\* Kudos | components/homepage/homepage-screen.tsx

**Checkpoint**: T026–T028 green; six cards render in correct order; clicks navigate with anchors.

---

## Phase 5: User Story 3 — Header navigation (Priority: P1)

**Goal**: Header at the top of every authenticated content page with logo + 3 nav links (About SAA selected) + bell + language menu + avatar; clicks resolve to the correct routes.

**Independent Test**: From `/`, click each header target (logo → `/` scroll-top, About SAA → `/`, Awards Info → `/awards-information`, Sun\* Kudos → `/sun-kudos`) and assert URL.

### Tests (US3) — must fail first

- [ ] T032 [P] [US3] Component test for `<AppHeader>` *(deferred)* | tests/unit/app-header.test.tsx
- [ ] T033 [P] [US3] E2E header nav *(deferred)* | tests/e2e/homepage.spec.ts

### Implementation (US3)

- [x] T034 [P] [US3] Implemented `<NotificationBell>` (bell icon + optional badge driven by `unreadCount`) | components/layout/notification-bell.tsx
- [x] T035 [P] [US3] Implemented `<AccountMenu>` (promoted to interactive — see US6) | components/layout/account-menu.tsx
- [x] T036 [P] [US3] Implemented `<AppLanguageSwitch>` (promoted to interactive — see US5) | components/layout/app-language-switch.tsx
- [x] T037 [US3] Implemented `<AppHeader>` (logo + 3 nav links with selected styling + bell + language + avatar; auth-only chrome gated by `isAuthenticated`) | components/layout/app-header.tsx
- [x] T038 [US3] Wired `<AppHeader>` into `<HomepageScreen>` with `currentPath`, `locale`, `isAuthenticated`, `isAdmin`, `userDisplay`, `accountCopy` | components/homepage/homepage-screen.tsx

**Checkpoint**: T032–T033 green; header renders; all four primary nav targets resolve correctly.

---

## Phase 6: User Story 4 — Event info block (Priority: P2)

**Goal**: Below the hero / inside the hero, a static block shows time, location, livestream note in three lines that wrap responsively.

**Independent Test**: Visit `/`; assert all three lines from dictionary render in order; resize viewport to 375px and assert no overflow; assert no click handlers attached.

### Tests (US4) — must fail first

- [ ] T039 [P] [US4] Component test for `<EventInfo>` (three lines render from dictionary; nodes are non-interactive; uses `EVENT_LOCATION` / `EVENT_LIVESTREAM_NOTE` overrides when present) | tests/unit/event-info.test.tsx

### Implementation (US4)

- [ ] T040 [US4] Verify `<EventInfo>` already implemented in T021 covers all FRs; add overrides plumbing if T039 reveals a gap | components/homepage/event-info.tsx

**Checkpoint**: T039 green.

---

## Phase 7: User Story 5 — Switch language (Priority: P2)

**Goal**: Header language button opens a real dropdown with VN/EN; selecting a language re-renders all visible localized strings and persists across reload via `saa-locale` cookie. Side benefit: Login screen also gets a working switch.

**Independent Test**: Open `/`; click language button; pick `EN`; assert hero subtitle, awards section header, footer copyright, account menu items re-render in English; reload and assert language persists.

### Tests (US5) — must fail first

- [ ] T041 [P] [US5] Component test for `<AppLanguageSwitch>` *(deferred)* | tests/unit/app-language-switch.test.tsx
- [ ] T042 [P] [US5] E2E VN↔EN switch *(deferred)* | tests/e2e/homepage.spec.ts

### Implementation (US5)

- [x] T043 [US5] Promoted `<AppLanguageSwitch>` to a real client component (dropdown with click-outside + Esc; calls `setLocaleAction` on selection; uses `useTransition` to await server action) | components/layout/app-language-switch.tsx
- [ ] T044 [P] [US5] Delegate Login's `<HeaderLanguageSwitch>` to the shared menu *(deferred — Login keeps its visual stub for now; consolidation is a polish task)* | components/layout/header-language-switch.tsx

**Checkpoint**: T041–T042 green; switching VN ↔ EN works on both Homepage and Login.

---

## Phase 8: User Story 6 — Account avatar dropdown (Priority: P2)

**Goal**: Avatar in the header opens a dropdown with `Profile`, `Sign out`, plus `Admin Dashboard` for admins; sign-out clears session and lands on `/login`.

**Independent Test**: Open `/` as a regular user → click avatar → assert two items; sign in as admin → assert three items; click "Sign out" → assert URL is `/login` and session cookie is cleared.

### Tests (US6) — must fail first

- [ ] T045 [P] [US6] Component test for `<AccountMenu>` *(deferred)* | tests/unit/account-menu.test.tsx
- [ ] T046 [P] [US6] E2E role-based items + sign-out flow *(deferred)* | tests/e2e/homepage.spec.ts

### Implementation (US6)

- [x] T047 [US6] Promoted `<AccountMenu>` to a real client component: dropdown with Profile + Sign out (always) + Admin Dashboard (when `isAdmin`); sign-out is a form POST to `/auth/sign-out`; Esc and click-outside close. Admin role sourced from `ADMIN_EMAILS` env via `isAdminEmail()` | components/layout/account-menu.tsx

**Checkpoint**: T045–T046 green; role-based items correct; sign-out flow works end-to-end.

---

## Phase 9: User Story 7 — Sun\* Kudos promo (Priority: P2)

**Goal**: A promo block on the homepage with label, title, description, and a "Chi tiết" CTA navigates to `/sun-kudos`.

**Independent Test**: Visit `/`; scroll to Sun\* Kudos block; assert all four elements render from dictionary; click "Chi tiết" and assert URL is `/sun-kudos`.

### Tests (US7) — must fail first

- [ ] T048 [P] [US7] Component test for `<SunKudosBlock>` (renders label + title + description + CTA; CTA href is `/sun-kudos`; renders banner image alt text) | tests/unit/sun-kudos-block.test.tsx
- [ ] T049 [P] [US7] Extend E2E: click Sun\* Kudos "Chi tiết" → URL is `/sun-kudos` | tests/e2e/homepage.spec.ts

### Implementation (US7)

- [ ] T050 [P] [US7] Implement `<SunKudosBlock>` (server component; reads `dictionary.sunKudos`; renders banner + label + title + description + CTA `<Link>`) | components/homepage/sun-kudos-block.tsx
- [ ] T051 [US7] Wire `<SunKudosBlock>` into `<HomepageScreen>` between the awards grid and the footer | components/homepage/homepage-screen.tsx

**Checkpoint**: T048–T049 green.

---

## Phase 10: User Story 8 — Notification bell stub (Priority: P3)

**Goal**: Bell appears in the header for authenticated users with no badge for MVP (always 0); clicking it is a no-op until the Notification panel spec is authored.

**Independent Test**: Visit `/` authenticated → bell visible, no badge; visit `/` anonymous → bell hidden.

### Tests (US8) — must fail first

- [ ] T052 [P] [US8] Component test for `<NotificationBell>` (renders bell; `unreadCount > 0` shows badge with accessible name "X unread notifications"; `unreadCount = 0` shows no badge; aria-hidden when `currentUser` is null in parent) | tests/unit/notification-bell.test.tsx

### Implementation (US8)

- [ ] T053 [US8] Wire `<AppHeader>` to pass `unreadCount={0}` to `<NotificationBell>` for MVP and hide the bell entirely when `currentUser` is null | components/layout/app-header.tsx
- [ ] T054 [P] [US8] Add a `console.warn` no-op handler in `<NotificationBell>`'s click so future engineers know the panel spec is pending | components/layout/notification-bell.tsx

**Checkpoint**: T052 green; bell is hidden for anonymous visitors; click is a recorded no-op.

---

## Phase 11: User Story 9 — Floating widget (Priority: P3)

**Goal**: A fixed bottom-right pill opens a quick-action menu with two stub items (Viết Kudo, Thể lệ SAA) — real menu items owned by the Widget spec.

**Independent Test**: Visit `/`; scroll anywhere; assert the pill is fixed at bottom-right; click → assert menu opens with two `<Link>` items.

### Tests (US9) — must fail first

- [ ] T055 [P] [US9] Component test for `<FloatingWidget>` (open/close on click; Esc closes; menu has exactly two items pointing to `/profile` and `/community-standards` for MVP — placeholders until Widget spec) | tests/unit/floating-widget.test.tsx

### Implementation (US9)

- [ ] T056 [P] [US9] Implement `<FloatingWidget>` (client component; fixed-bottom-right pill + popover menu) | components/homepage/floating-widget.tsx
- [ ] T057 [US9] Wire `<FloatingWidget>` into `<HomepageScreen>` (top-level sibling to `<AppHeader>`) | components/homepage/homepage-screen.tsx

**Checkpoint**: T055 green; widget visible across scroll; menu opens with two items.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Footer, accessibility, README, final acceptance.

- [ ] T058 [P] Implement `<AppFooter>` (server component; logo + four nav links + "Bản quyền thuộc về Sun\* © 2025"; reuses dictionary copyright entry) | components/layout/app-footer.tsx
- [ ] T059 Wire `<AppFooter>` into `<HomepageScreen>` (last child) and into the placeholder pages so navigation chrome is consistent | components/homepage/homepage-screen.tsx, app/awards-information/page.tsx, app/sun-kudos/page.tsx, app/community-standards/page.tsx, app/profile/page.tsx, app/admin/page.tsx
- [ ] T060 [P] A11y polish: visible focus rings on all interactive elements, arrow-key navigation in `<LanguageMenu>` and `<AccountMenu>`, Esc to close, aria-current on active nav link, accessible name on the bell badge | components/layout/{app-header,language-menu,account-menu,notification-bell}.tsx
- [ ] T061 [P] Update README with Homepage env quickstart (`EVENT_START_AT`, optional event overrides) and a note that `/` is now public | README.md
- [ ] T062 [P] Add CI step (or extend existing one) to run `npm run test:e2e` against the Playwright Homepage spec | .github/workflows/ci.yml
- [ ] T063 Final acceptance: run `npm run lint && npm run typecheck && npm run build && npm run test && npm run test:e2e` and verify every spec.md acceptance scenario manually | (verification only)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies — can start immediately.
- **Foundation (Phase 2)**: depends on Setup completion — BLOCKS all user stories.
- **US1 (Phase 3)**: depends on Foundation; required by US2 (composes into the same screen).
- **US2 (Phase 4)**: depends on US1's `<HomepageScreen>` skeleton.
- **US3 (Phase 5)**: depends on Foundation; can start in parallel with US1/US2 once `<HomepageScreen>` exists, but the AppHeader-stub trio (T034–T036) is required first.
- **US4 (Phase 6)**: piggybacks on US1 — is essentially a coverage check.
- **US5 (Phase 7)**: depends on Setup + the `<LanguageMenu>` stub from T036.
- **US6 (Phase 8)**: depends on the `<AccountMenu>` stub from T035 and the existing `/auth/sign-out` route from the Login PR.
- **US7 (Phase 9)**: depends on Foundation; independent of US3.
- **US8 (Phase 10)**: depends on the `<NotificationBell>` stub from T034 and on `<AppHeader>` (T037).
- **US9 (Phase 11)**: depends only on Foundation.
- **Polish (Phase N)**: depends on all desired user stories.

### Within Each User Story

- Tests MUST be written and observed failing before the corresponding implementation.
- Pure helpers and types before components.
- Components before route wiring.
- Story complete (checkpoint passes) before moving to the next priority.

### Parallel Opportunities

- **Setup**: T002–T008 are all `[P]` (different files). T001 runs first because it
  primes the asset directories.
- **Foundation**: T009, T010, T012, T014, T015 are `[P]`. The implementation pairs
  run sequentially within each pair: T010 → T011, T012 → T013, T015 → T016.
- **US1**: T017, T018, T019 in parallel (separate test files); T020, T021, T022 in
  parallel (separate components); T023 → T024 → T025 sequential (composition chain).
- **US3 stubs**: T034, T035, T036 in parallel — different files; then T037 → T038
  sequentially.
- **US5 / US6 / US7 / US8 / US9**: largely independent of each other once US3's
  AppHeader is in place — three contributors can split US5+US6+US7 (the P2 batch)
  in parallel.
- **Polish**: T058, T060, T061, T062 all `[P]`; T059 is sequential (touches multiple
  files); T063 is the final gate.

---

## Implementation Strategy

### MVP First (Recommended)

1. Complete Phase 1 + Phase 2.
2. Complete Phase 3 (US1) and Phase 4 (US2) and Phase 5 (US3) — all P1.
3. **STOP and VALIDATE**: run all checkpoints, verify acceptance scenarios manually.
4. Deploy to a preview environment, click through every nav target, verify countdown.

### Incremental Delivery

1. Setup + Foundation → merge.
2. US1 + US2 + US3 (P1 batch) → merge → demo MVP.
3. US4 + US5 + US6 + US7 (P2 batch — three contributors can parallelize after the
   AppHeader lands) → merge.
4. US8 + US9 (P3 batch) → merge.
5. Polish → merge.

---

## Notes

- **`design-style.md` override (this PR series)**: same as Login. Visual values are
  fetched on-demand at component time via `mcp__momorph__query_section` per
  Constitution Principle IV. New tokens land in `app/globals.css` with a one-line
  rationale comment.
- **Public-vs-auth-gated homepage**: T003 resolves this in favour of **public**
  (per Figma test case ID-0). Reversing it is a one-PR change to the same file.
- **Role assignment**: `getCurrentUser` does not yet emit `role`. Until role
  assignment lands (likely an `ADMIN_EMAILS` env var or a future `users.role`
  column), every authenticated user is treated as `"user"`. T047 implements the
  admin branch so it's ready when the data appears, but the admin variant is not
  exercised by the integration tests until the role source is wired.
- **Asset reuse**: where the Figma node ID matches a Login asset (e.g., SAA logo,
  language flag, chevron, Google icon, Root Further hero, keyvisual background),
  prefer reusing `public/assets/login/...` paths over duplicating the file under
  `public/assets/homepage/`. Only Homepage-specific assets (bell, avatar default,
  award thumbnails, kudos banner, widget icons) need new downloads.
- **Slug list to confirm**: `top-talent`, `top-project`, `top-project-leader`,
  `best-manager`, `signature-2025-creator`, `mvp` — derived in T011, must be
  reconciled against the *Awards Information* spec when authored.
- **TDD cadence**: every test task (T010, T012, T015, T017, T018, T019, T026, T027,
  T028, T032, T033, T039, T041, T042, T045, T046, T048, T049, T052, T055) MUST be
  observed failing before the paired implementation task is started.
- Commit after each task or each tightly-related pair (test + impl).
- Mark tasks complete as you go: `- [x]`.
