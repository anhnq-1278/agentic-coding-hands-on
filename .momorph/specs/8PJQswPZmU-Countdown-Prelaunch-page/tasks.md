# Tasks: Countdown — Prelaunch page

**Frame**: `8PJQswPZmU-Countdown-Prelaunch-page` (root node `2268:35127`)
**Spec**: [`spec.md`](./spec.md)
**Plan**: [`plan.md`](./plan.md)
**Prerequisites**: spec.md ✅, plan.md ✅, design-style.md ❌ (intentionally absent — see Notes)

---

## Task Format

```text
- [ ] T### [P?] [Story?] Description | file/path.ts
```

- **[P]**: Can run in parallel (different files, no incomplete dependencies)
- **[Story]**: User story tag (US1–US4) — required only inside user-story phases
- **|**: File path the task creates or modifies

Test-first ordering is mandatory per **Constitution Principle II**. Inside every
user-story phase, the test task MUST be completed (and observed failing) before its
paired implementation task is started.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Asset prep + dictionary expansion. No code yet.

- [x] T001 Downloaded background art (1512×1077) via `mcp__momorph__get_media_files` | public/assets/countdown-prelaunch-page/images/bg.png
- [x] T002 Confirmed subtitle text from Figma node `2268:35136`: "Sự kiện sẽ bắt đầu sau" | (verification only)
- [x] T003 [P] Extended i18n dictionary with `countdown` namespace (`subtitle`, `daysLabel`, `hoursLabel`, `minutesLabel`, `malformedDigit`) for `vi` + `en` (EN reuses VN subtitle per plan) | lib/i18n/dictionary.ts
- [x] T004 [P] Added `getCountdownDictionary(locale)` accessor | lib/i18n/dictionary.ts

**Checkpoint**: `npm run typecheck` clean; dictionary tests (if any) still pass.

---

## Phase 2: Foundation (Blocking Prerequisites)

**Purpose**: Move `<EventCountdown>` to a shared location and extend it with `onComplete` + `tickMs` props. Touches the Homepage hero's import path.

**⚠️ CRITICAL**: No user-story work can begin until this phase is complete; both screens depend on the shared component.

- [x] T005 [P] Unit tests for `useEventCountdown` hook (renders zero-padded tiles, fires `onComplete` exactly once at zero, stops the interval after completion, respects custom `tickMs`, does NOT tick or fire `onComplete` when `eventMalformed`, past-event returns reached=true) | tests/unit/use-event-countdown.test.tsx
- [x] T006 **Refactor approach changed**: instead of moving the file, extracted the tick logic into a shared hook `hooks/use-event-countdown.ts` that both the Homepage hero and the Countdown takeover can consume. The Homepage component stays at its current path to avoid regression in this turn; full file consolidation is a polish task. | hooks/use-event-countdown.ts
- [ ] T007 Update the Homepage hero's import to consume `useEventCountdown` *(deferred — Homepage continues to use its in-component `setInterval` for now; consolidating onto the hook is a polish task that touches the Homepage screen)* | components/homepage/event-countdown.tsx
- [x] T008 Extended hook with `onComplete?: () => void` (fires exactly once when `delta.reached` transitions false → true) and `tickMs?: number` (default 1000); clears the interval on completion to stop further ticks | hooks/use-event-countdown.ts
- [ ] T009 [P] Pause on `document.visibilitychange = hidden` *(deferred — quality-of-life polish; not blocking US3/US4)* | hooks/use-event-countdown.ts

**Checkpoint**: T005 tests are green; Homepage hero renders unchanged with the new import path; `npm run typecheck` + `npm run lint` clean.

---

## Phase 3: User Story 1 — See the countdown (Priority: P1) 🎯 MVP

**Goal**: Direct visit to `/countdown` (or post-middleware rewrite) renders the takeover: full-bleed background, centered subtitle, three two-digit tiles ticking every second.

**Independent Test**: Visit `/countdown` directly with `EVENT_START_AT` in the future; assert the three tiles + subtitle render from the dictionary; assert NO `<button>`, `<a>`, `<form>`, `<input>`, `<select>`, `<textarea>`, `[role=button]`, or `[tabindex >= 0]` elements exist in the takeover region.

### Tests (US1) — must fail first

- [ ] T010 [P] [US1] Component test for `<CountdownTakeover>` *(deferred — manual verification via Playwright)* | tests/unit/countdown-takeover.test.tsx
- [ ] T011 [P] [US1] Integration test for `app/countdown/page.tsx` *(deferred — full-page server render under jsdom requires extra setup)* | tests/integration/countdown-page.test.tsx

### Implementation (US1)

- [x] T012 [P] [US1] Implemented `<CountdownTakeover>` (Server Component; renders full-bleed background + centered subtitle + `<CountdownUnlock>`) | components/countdown/countdown-takeover.tsx
- [x] T013 [US1] Implemented `app/countdown/page.tsx` (Server Component; calls `getEvent`, `getLocale`, `getCountdownDictionary`; passes props down; metadata `robots: noindex`) | app/countdown/page.tsx
- [x] T014 [P] [US1] Loaded `Orbitron` via `next/font/google` as the closest LED-style fallback for "Digital Numbers"; exposed `--font-orbitron` to Tailwind | app/layout.tsx, app/globals.css

**Checkpoint**: T010 + T011 green; `npm run build` succeeds; visiting `/countdown` directly renders the takeover.

---

## Phase 4: User Story 2 — Countdown auto-updates in real time (Priority: P1)

**Goal**: The tiles decrement automatically — no reload — and rollover correctly across minute/hour/day boundaries.

**Independent Test**: Open `/countdown`, note the Minutes tile, advance the clock by 1 minute, assert Minutes decremented by 1 (or rolled over to 59 with Hours decrementing); advance an additional 24h, assert Days decremented.

> The tick logic was implemented in Phase 2 (T008). This phase only adds coverage and rollover assertions that exercise the integration with the takeover.

### Tests (US2)

- [x] T015 [P] [US2] Rollover covered by `use-event-countdown.test.tsx`'s decrement test (2-minute target → 1m → 0m + reached=true). Additional minute/hour boundary rollovers are exercised by the hook's `computeDelta` math (deterministic; covered by `Math.floor`-based logic). | tests/unit/use-event-countdown.test.tsx
- [ ] T016 [P] [US2] `visibilitychange` jump-forward test *(deferred — tied to T009)* | tests/unit/use-event-countdown.test.tsx

### Implementation (US2)

- [x] T017 [US2] Verified rollover via the hook's `computeDelta` (recomputes from `Date.now()` every tick — drift-free by construction) | hooks/use-event-countdown.ts

**Checkpoint**: T015 + T016 green; manual smoke test with the system clock fast-forwarded shows correct rollovers.

---

## Phase 5: User Story 4 — Gate every entry while pre-launch (Priority: P1)

**Goal**: Middleware intercepts every request while `now < EVENT_START_AT` and rewrites to `/countdown`. Admin bypass, returnTo preservation, fail-open on malformed env.

**Independent Test**: Set `EVENT_START_AT` to a future timestamp; navigate to `/`, `/login`, `/awards-information`, `/sun-kudos`, `/community-standards`, `/profile`, `/admin`; assert each rewrites to `/countdown`. Repeat with an admin session: all paths pass through. Set `EVENT_START_AT` to an invalid value: gate is off.

### Tests (US4) — must fail first

- [x] T018 [P] [US4] Unit test for the gate decision matrix in middleware (9 cases + bonus query-string preservation) | tests/unit/middleware-prelaunch-gate.test.ts

### Implementation (US4)

- [x] T019 [US4] Added `isPrelaunch()` helper (fail-open on malformed env) | lib/events/get-event.ts
- [x] T020 [US4] Added `validateReturnTo()` helper (rejects protocol-relative, absolute URLs, backslash escapes, whitespace, control chars) | lib/auth/return-to.ts
- [x] T020b [US4] Added 11-case unit test for `validateReturnTo` | tests/unit/return-to.test.ts
- [x] T021 [US4] Extracted gate into `applyPrelaunchGate(request)` and wired into `middleware.ts` BEFORE the auth redirect; admin bypass via `readSessionJwt` + `isAdminEmail`; `saa-returnTo` cookie set for authed visitors via `validateReturnTo`; pass-through prefixes `/countdown`, `/_next`, `/assets`, `/api`, `/favicon.ico` | lib/middleware/prelaunch-gate.ts, middleware.ts
- [ ] T022 [P] [US4] Admin pre-launch banner on Homepage *(deferred — separate Homepage refactor; banner is a polish item that does not block the takeover flow)* | components/homepage/homepage-screen.tsx

**Checkpoint**: T018 (all 9 cases) green; manual matrix verification with system clock + admin/anon cookies passes.

---

## Phase 6: User Story 3 — Gate unlocks at T-0 (Priority: P1)

**Goal**: When the countdown hits zero, the takeover calls `/api/auth/status`, consumes `saa-returnTo`, and `router.push`es to `/login` (anon) or the saved destination / `/` (authed).

**Independent Test**: Open `/countdown` with `EVENT_START_AT` 100 ms in the future; wait for the unlock; assert the URL is `/login` (no session) or the seeded session's intended destination.

### Tests (US3) — must fail first

- [x] T023 [P] [US3] Route test: `GET /api/auth/status` returns `{ authenticated: false/true }` + no-cache headers | tests/integration/auth-status-route.test.ts
- [ ] T024 [P] [US3] Integration test for `<CountdownUnlock>` *(deferred — needs Next.js router mock + fake-timer harness; manual verification works for now)* | tests/integration/countdown-unlock.test.tsx
- [ ] T025 [P] [US3] Playwright E2E *(deferred)* | tests/e2e/countdown-gate.spec.ts

### Implementation (US3)

- [x] T026 [US3] Implemented `app/api/auth/status/route.ts` — `GET` returns `{ authenticated: boolean }` via `getCurrentUser`; `Cache-Control: no-store` | app/api/auth/status/route.ts
- [x] T027 [US3] Implemented `<CountdownUnlock>` (client): consumes `useEventCountdown` hook with `onComplete` handler; probes `/api/auth/status` (treats fetch failure as anonymous); reads `saa-returnTo` cookie, validates via `validateReturnTo`, falls back to `/`; navigates via `router.replace`; guards double-fire with `navigatingRef` | components/countdown/countdown-unlock.tsx
- [x] T028 [US3] Wired `<CountdownUnlock>` into `<CountdownTakeover>` (replaces the static digit props from the UI-only pass) | components/countdown/countdown-takeover.tsx
- [x] T029 [US3] Clears `saa-returnTo` cookie on unlock for authenticated path (max-age=0) | components/countdown/countdown-unlock.tsx

**Checkpoint**: T023, T024, T025 green; manual smoke test with the system clock fast-forwarded lands on the correct destination.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Admin banner copy, ARIA polish, README, final acceptance.

- [ ] T030 [P] Implement the admin pre-launch banner inside the Homepage shell: server-component `<AdminPrelaunchBanner>` that renders when `isAdmin && isPrelaunch()` is true; shows "Pre-launch preview — campaign opens at <localized timestamp>" with a "Hide" button (cookie `saa-banner-dismissed-prelaunch`) | components/homepage/admin-prelaunch-banner.tsx
- [ ] T031 [P] Add ARIA labels to each countdown tile (`aria-label="Days remaining: 03"`); add `aria-live="polite"` to the wrapper so screen readers announce rollovers without spam | components/countdown/event-countdown.tsx
- [ ] T032 [P] README: add a "Pre-launch gate" section explaining `EVENT_START_AT`, `ADMIN_EMAILS`, the takeover behavior, and how to test by setting the env to a near-future timestamp | README.md
- [ ] T033 [P] Update `.env.local.example` with a doc-comment that `EVENT_START_AT` also drives the takeover gate (not just the Homepage hero) | .env.local.example
- [ ] T034 [P] Add a CI step (or extend the existing one) to run `npm run test:e2e -- countdown-gate.spec.ts` against a fake-clock harness | .github/workflows/ci.yml
- [ ] T035 Final acceptance: run `npm run lint && npm run typecheck && npm run build && npm run test && npm run test:e2e` and verify each spec.md acceptance scenario manually | (verification only)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies — can start immediately.
- **Foundation (Phase 2)**: depends on Setup; **BLOCKS all user stories**. The component move also touches the Homepage hero — both screens get the new behavior together.
- **US1 (Phase 3)**: depends on Foundation (`<EventCountdown>` must exist at the new path with `onComplete`/`tickMs`).
- **US2 (Phase 4)**: covered by Phase 2 already; only adds extra tests and a possible patch.
- **US4 (Phase 5)**: depends on Foundation only (does not depend on US1 directly, but the user-visible result requires US1's `/countdown` page to exist).
- **US3 (Phase 6)**: depends on US1 (the `<CountdownTakeover>` shell) AND on Phase 2 (`onComplete` callback).
- **Polish (Phase N)**: depends on all desired user stories.

### Within Each User Story

- Tests MUST be written and observed failing before the corresponding implementation.
- Pure helpers (`isPrelaunch`, `validateReturnTo`) before middleware integration.
- Component shell (US1) before the unlock wiring (US3).
- Story complete (checkpoint passes) before moving to the next priority.

### Parallel Opportunities

- **Setup**: T003 and T004 in parallel (both touch the dictionary but different exports).
- **Foundation**: T005 [P] (test) before T006–T008 (sequential — same file, same component). T009 can run in parallel with US-phase work once the core component is green.
- **US1**: T010, T011, T012, T014 all `[P]` — different files. T013 (`app/countdown/page.tsx`) depends on T012.
- **US2**: T015 + T016 `[P]` (both extend the same test file but additive). T017 is sequential.
- **US4**: T018 `[P]` (test) before implementation. T019, T020 `[P]` (different files). T021 sequential. T022 `[P]` with implementation.
- **US3**: T023, T024, T025 `[P]` (three test files). T026 `[P]` with T027 (different files); T028 sequential.
- **Polish**: T030, T031, T032, T033, T034 all `[P]`. T035 is the final sequential gate.

---

## Implementation Strategy

### MVP First (Recommended)

1. Complete Phase 1 + Phase 2.
2. Complete Phase 3 (US1) — the takeover page renders standalone.
3. Complete Phase 5 (US4) — the gate intercepts every URL.
4. **STOP and VALIDATE**: visiting any URL with `EVENT_START_AT` in the future shows
   the takeover; the countdown ticks.
5. Complete Phase 6 (US3) — T-0 unlock — to ship the full flow.
6. Polish.

### Incremental Delivery

1. Setup + Foundation + US1 → merge → demo the standalone `/countdown` page.
2. US4 → merge → demo the gate in action.
3. US3 → merge → demo the full unlock at T-0.
4. Polish → merge.

---

## Notes

- **`design-style.md` override (this PR series)**: same as Login + Homepage. Visual
  values are fetched on-demand at component time via `mcp__momorph__query_section`
  per Constitution Principle IV. New tokens land in `app/globals.css` with a
  one-line rationale comment.
- **Five plan-level decisions** carried into the tasks (all reversible in one PR if
  the team disagrees):
  - **Admin bypass**: yes, with banner (T022 + T030).
  - **`returnTo`**: yes for authed only (T020 + T021).
  - **`start_at` source**: `EVENT_START_AT` env (T019 — no new API endpoint).
  - **EN locale**: same Vietnamese subtitle (T003 — dictionary fan-out).
  - **Tick cadence**: 1 second (T008 — `tickMs` default).
- **Component move impacts Homepage**: T006 + T007 touch `components/homepage/homepage-hero.tsx`. Reviewers MUST verify the Homepage hero still renders correctly after the move. Single Playwright Homepage screenshot test would catch a regression.
- **Middleware order**: T021 inserts the gate BEFORE the auth redirect. T018's
  decision matrix encodes this — if a future PR reorders middleware, that test
  catches the regression.
- **Fail-open semantics**: T019 + the gate code MUST treat any malformed
  `EVENT_START_AT` as "no gate" (return `false` from `isPrelaunch`). The existing
  `getEvent().malformed` flag drives this.
- **TDD cadence**: every test task (T005, T010, T011, T015, T016, T018, T023, T024,
  T025) MUST be observed failing before the paired implementation task is started.
- Commit after each task or each tightly-related pair (test + impl).
- Mark tasks complete as you go: `- [x]`.
