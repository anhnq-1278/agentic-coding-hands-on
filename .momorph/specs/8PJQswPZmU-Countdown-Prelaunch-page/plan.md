# Implementation Plan: Countdown — Prelaunch page

**Frame**: `8PJQswPZmU-Countdown-Prelaunch-page` (root node `2268:35127`)
**Date**: 2026-05-12
**Spec**: [`spec.md`](./spec.md)
**Screenflow detail**: [`../../contexts/screen_specs/countdown-prelaunch-page.md`](../../contexts/screen_specs/countdown-prelaunch-page.md)
**SCREENFLOW**: [`../../contexts/SCREENFLOW.md`](../../contexts/SCREENFLOW.md)
**Constitution**: [`../../constitution.md`](../../constitution.md) (v1.2.0)
**Reuses heavily from**: Login spec ([`../GzbNeVGJHz-Login/`](../GzbNeVGJHz-Login/)) and Homepage SAA spec ([`../i87tDx10uM-Homepage-SAA/`](../i87tDx10uM-Homepage-SAA/))

---

## Summary

Build the **Countdown — Prelaunch page** as a full-screen takeover gate that intercepts
every in-app request while `now < EVENT_START_AT`. The gate lives in `middleware.ts`,
the page is a public server-rendered route at `/countdown`, and the visible UI re-uses
the existing `<EventCountdown>` client component from the Homepage hero (Figma confirms
both screens share component `186:2619`).

When the countdown hits T-0, the client component fires a `onComplete` callback that:
1. Calls a lightweight server endpoint to confirm the gate has actually expired
   server-side (defeats client clock skew).
2. Probes the session to choose between `/login` (anonymous) and `/` (signed in).
3. `router.push`es to the destination.

Implementation is small — the screen has 3 tiles, no chrome, no clickable elements —
but the **gate semantics** (intercept every URL) are the load-bearing change. Most of
the work is in middleware, not in components.

The plan resolves the spec's 5 open questions with explicit recommendations and pins
them in the Architecture Decisions section. Implementation reuses the existing
`EVENT_START_AT` env (no new API endpoint), adds an `ADMIN_EMAILS`-driven admin
bypass, preserves `returnTo` for authenticated visitors only, keeps the Vietnamese
subtitle for both locales, and ticks every 1 second for visual liveness while keeping
the rollover logic minute-based.

---

## Technical Context

| Item | Choice |
|------|--------|
| **Language/Framework** | TypeScript 5 (strict) / Next.js 16.2.4 App Router / React 19.2.4 |
| **Gate mechanism** | `middleware.ts` rewrite/redirect to `/countdown` while `Date.now() < EVENT_START_AT` |
| **Event datetime source** | **`EVENT_START_AT` env** (already wired into Homepage SAA via `lib/events/get-event.ts`) — single source of truth, no new API |
| **Session probe at T-0** | Reuse existing `getCurrentUser()` from `lib/auth/session.ts` via a tiny `GET /api/auth/status` JSON route |
| **Countdown UI** | Reuse `components/homepage/event-countdown.tsx` (extract to `components/countdown/` so both Homepage hero and the takeover import from one place) |
| **Styling** | Tailwind CSS v4 + CSS variables in `app/globals.css` (Constitution Principle IV) |
| **State management** | Local `useState` for countdown delta + `useTransition` for navigation; no global store |
| **Testing** | Vitest + Testing Library + jsdom (unit/integration); Playwright (E2E) — config already in place |
| **i18n** | In-app dictionary (extend `lib/i18n/dictionary.ts` with `countdown` namespace) |

> **No new dependencies.** Everything is inherited from the Login + Homepage PRs.

---

## Constitution Compliance Check

*GATE: must pass before implementation can begin.*

| Requirement | Constitution Rule | Status |
|-------------|-------------------|--------|
| Spec exists & traces to Figma | I — Spec-Driven Development | ✅ Compliant |
| Navigation sourced from SCREENFLOW.md | I — Spec-Driven Development | ✅ Compliant (gate-only — no clickable nav) |
| Tests written before implementation | II — Test-First (NON-NEGOTIABLE) | 📋 Planned |
| Layered architecture (route → service) | III — Layered Architecture | 📋 Planned |
| No hard-coded visual values | IV — Design Tokens | 📋 Planned |
| TS strict, ESLint clean, conventions | V — Type Safety & Convention Conformance | ✅ Compliant |
| `npm run build`, `npm run lint`, `npm run test` pass | V — Quality gate | 📋 Planned |

**Violations**:

| Violation | Justification | Alternative Rejected |
|-----------|---------------|---------------------|
| Plan written before `design-style.md` is generated | Same project decision as Login + Homepage: visual specs fetched on-demand at implementation per Constitution Principle IV. | Generating a frozen `design-style.md` duplicates Figma and rots fast. |
| Plan written before `BACKEND_API_TESTCASES.md` | The takeover adds at most one tiny `/api/auth/status` endpoint; the API contract is trivial. Backend test cases for the existing endpoints are tracked under their own specs. | Blocking the plan for documentation that adds no signal. |
| Gate decision made in middleware (cross-cutting) | The takeover MUST intercept every request to honor FR-001 & FR-008. A page-level redirect would leak the requested page's chrome for one frame before redirecting. | Per-page redirects: don't intercept anonymous deep-link visits cleanly. |

---

## Architecture Decisions

### Resolutions for the spec's open questions

| Open question | **Decision** | Rationale |
|---------------|--------------|-----------|
| Admin bypass | **YES, with a banner**. Users in `ADMIN_EMAILS` skip the gate. The Homepage shows a yellow "Pre-launch preview — gate active for everyone else" banner so admins know the campaign is not live yet. | Admins must be able to test the production app pre-launch. Banner makes the bypass non-confusing. |
| `returnTo` preservation | **YES for authenticated users only**. The gate sets a `saa-returnTo` cookie when intercepting an authed visitor and consumes it at T-0. Anonymous visitors always land on `/login` with no `returnTo`. | Anonymous users have no destination to preserve. Authed users opening a deep link deserve to land where they intended. |
| `start_at` source | **`EVENT_START_AT` env** (no new API). | Matches the Homepage hero's existing wiring (`lib/events/get-event.ts`). Single source of truth. Live edit requires a redeploy; acceptable for a one-shot campaign. The API alternative becomes worthwhile only if the launch moment is expected to slip during the campaign — TBD as a follow-up. |
| EN locale copy | **Same Vietnamese subtitle for both locales** ("Sự kiện sẽ bắt đầu sau"). Labels stay English ("DAYS / HOURS / MINUTES"). | Design is Vietnamese-only; translation hasn't been authored. Out-of-scope to write a freeform translation here. |
| Tick cadence | **1 second client tick**; rollover logic uses `Math.floor(delta / 60_000)` so it stays minute-accurate. | Visual liveness without affecting correctness. The existing `EventCountdown` already ticks at 60s; we'll lower it to 1s for the takeover and accept the same change on the Homepage hero (improves perceived freshness there too). |

### Frontend approach

- **Component reuse**: extract `<EventCountdown>` out of `components/homepage/` into
  `components/countdown/event-countdown.tsx`. Both the Homepage hero and the Countdown
  takeover import from one place. The component gains:
  - `onComplete?: () => void` callback fired once `delta.reached` becomes true.
  - Tick cadence configurable via prop (default 1000 ms).
- **Takeover layout**: `components/countdown/countdown-takeover.tsx` — a server
  component that renders the full-bleed background, centered subtitle, and the
  countdown tiles. Receives `eventStartAt` and `dictionary` props from the page.
- **T-0 navigation**: a thin client wrapper `components/countdown/countdown-unlock.tsx`
  hosts the `EventCountdown` and the `onComplete` handler that:
  1. `fetch('/api/auth/status')` → `{ authenticated: boolean }`
  2. `router.push('/login')` or `router.push(returnTo ?? '/')`.
- **No interactive elements** in the takeover region. Automated DOM scan in
  `tests/integration/countdown-no-interactive.test.tsx` enforces this (SC-005).

### Backend approach (Next.js route handlers + middleware)

- **Middleware (gate logic, single source of truth)** — extend `middleware.ts`:
  1. Compute `eventStartAt` once per request from `EVENT_START_AT`. Malformed env →
     **fail-open** (no gate); operators can fix without breaking the app.
  2. If `Date.now() < eventStartAt`:
     - Allow `_next/*`, `/assets/*`, `/api/*`, `/countdown`, and static images
       through.
     - For an authed visitor in `ADMIN_EMAILS`: allow through (admin bypass).
     - For an authed visitor: set `saa-returnTo` cookie to the requested path
       (max-age 1 day) and rewrite to `/countdown`.
     - For an anonymous visitor: rewrite to `/countdown` (no cookie).
  3. If `Date.now() >= eventStartAt`: existing auth logic applies (the gate is off).
- **`GET /api/auth/status`** (new) — returns `{ authenticated: boolean }` based on
  `getCurrentUser()`. Used by `<CountdownUnlock>` at T-0.
- **No DB changes.**

### Integration points

- **Existing services reused**:
  - `getCurrentUser` (Login PR) — for the middleware admin check + the `/api/auth/status` route.
  - `getEvent` (Homepage PR) — single source of truth for `EVENT_START_AT`; the
    middleware reads from the same module.
  - `EventCountdown` (Homepage PR) — moved, then both screens import.
  - `lib/auth/admin-roles.ts` (Homepage PR) — `isAdminEmail()` drives the admin bypass.
- **Existing components touched**:
  - `EventCountdown` is moved from `components/homepage/event-countdown.tsx` to
    `components/countdown/event-countdown.tsx`. The Homepage hero is updated to
    import from the new path; no behavior change for it apart from the 1s tick
    cadence (improvement).

---

## Project Structure

### Documentation (this feature)

```text
.momorph/specs/8PJQswPZmU-Countdown-Prelaunch-page/
├── spec.md            # ✅ exists — feature specification
├── plan.md            # ✅ this file
└── tasks.md           # 📋 next step (run /momorph.tasks)
```

### Source code (root-flat layout)

```text
app/
├── countdown/
│   └── page.tsx                       # NEW — Server Component: renders <CountdownTakeover>
└── api/
    └── auth/
        └── status/
            └── route.ts               # NEW — GET → { authenticated: boolean }

components/
├── countdown/
│   ├── countdown-takeover.tsx         # NEW — full-bleed page composition
│   ├── countdown-unlock.tsx           # NEW — client wrapper, fires T-0 navigation
│   └── event-countdown.tsx            # MOVED — from components/homepage/event-countdown.tsx
│                                       #   gains `onComplete` + `tickMs` props
└── homepage/
    └── event-countdown.tsx            # DELETED — re-exported via the new path

middleware.ts                           # MODIFIED — adds the prelaunch gate before the auth logic

lib/
└── i18n/
    └── dictionary.ts                  # MODIFIED — adds `countdown` namespace (subtitle, day/hour/minute labels)

types/
└── homepage.ts                        # MODIFIED — add `CampaignGateStatus` (optional, internal)

public/assets/
└── countdown-prelaunch-page/
    ├── images/                        # NEW (Phase 0) — full-bleed background art (if Figma surfaces one)
    └── icons/                         # NEW (Phase 0) — any decorative iconography

tests/
├── unit/
│   ├── middleware-prelaunch-gate.test.ts   # NEW — gate decision matrix (event past/future, admin/anon/authed, path filters)
│   ├── event-countdown.test.tsx            # MOVED — from tests/unit/ if exists; adds onComplete + tickMs cases
│   └── countdown-takeover.test.tsx         # NEW — renders 3 tiles + subtitle + zero interactive elements
├── integration/
│   ├── countdown-unlock.test.tsx           # NEW — mocks /api/auth/status, fakes timers, asserts router.push targets
│   └── auth-status-route.test.ts           # NEW — GET /api/auth/status returns correct shape for authed/anon
└── e2e/
    └── countdown-gate.spec.ts              # NEW — visit `/` before T-0 → see takeover; advance clock → land on /login or /
```

### Dependencies to add

**None.** Everything is inherited.

### Environment variables

| Var | Where | Purpose |
|-----|-------|---------|
| `EVENT_START_AT` | server only | **Reused** from Homepage. The gate compares `Date.now()` to this. |
| `ADMIN_EMAILS` | server only | **Reused** from Homepage `lib/auth/admin-roles.ts`. Comma-separated list of admin emails that bypass the gate. |

> No new env vars. The gate piggybacks entirely on existing config.

---

## Implementation Approach

### Phase 0: Asset preparation + dictionary scaffolding

- Query Figma for the takeover's background asset (if any) via `list_media_nodes`
  on screenId `8PJQswPZmU`. Download to `public/assets/countdown-prelaunch-page/`
  per the asset-placement guideline.
- Inspect Figma node `2268:35127` for the subtitle text — the spec assumes "Sự kiện
  sẽ bắt đầu sau" but the actual character string MUST be captured at implementation
  time via `query_section`.
- Extend `lib/i18n/dictionary.ts` with a `countdown` namespace for both locales.
  Initial entries: `subtitle`, `daysLabel`, `hoursLabel`, `minutesLabel`,
  `malformedFallback`.

### Phase 1: Foundation — refactor + share EventCountdown

1. Move `components/homepage/event-countdown.tsx` →
   `components/countdown/event-countdown.tsx`. Update the Homepage hero's import.
2. Extend the component:
   - Add `onComplete?: () => void` prop. Fire exactly once when `delta.reached`
     transitions false → true.
   - Add `tickMs?: number` prop (default 1000).
   - Adjust the interval to use `tickMs`.
3. Add `tests/unit/event-countdown.test.tsx` (TDD: failing tests first):
   - Renders zero-padded tiles for the given delta.
   - Calls `onComplete` exactly once when the delta reaches zero.
   - Stops the interval after completion (no further `setState` calls).
   - Renders `--` when `eventMalformed` is true and does NOT call `onComplete`.

**Phase 1 Checkpoint**: `npm run typecheck` clean; Homepage hero still renders
correctly with the new import path; `event-countdown.test.tsx` is green.

### Phase 2: US1 + US2 — Display the countdown

1. Failing component test: `tests/unit/countdown-takeover.test.tsx` asserts:
   - Three tiles render with the correct labels from the dictionary.
   - Subtitle renders from the dictionary.
   - Zero interactive elements in the takeover region (`<button>`, `<a>`, `<form>`,
     `<input>`, `<select>`, `<textarea>`, `[role=button]`, `[tabindex]` ≥ 0).
2. Implement `components/countdown/countdown-takeover.tsx` (Server Component):
   - Full-bleed page wrapper with the background asset (Phase 0).
   - Centered subtitle + three tiles via `<CountdownUnlock>`.
3. Implement `app/countdown/page.tsx`:
   - Reads `getEvent()` + `getLocale()` server-side; passes `event.startAt` +
     dictionary down.
   - Public route (middleware lets `/countdown` through).
   - Metadata: `noindex` (this is a temporary takeover; we don't want the gate page
     indexed).

**Phase 2 Checkpoint**: visit `/countdown` directly → renders 3 tiles ticking every
second.

### Phase 3: US4 — Gate middleware

1. Failing unit test for the gate decision matrix:
   `tests/unit/middleware-prelaunch-gate.test.ts`. Cases:
   - `now < startAt` + path `/` + anonymous → rewrite to `/countdown`, no cookie.
   - `now < startAt` + path `/` + authed non-admin → rewrite to `/countdown`,
     `saa-returnTo` cookie set to `/`.
   - `now < startAt` + path `/awards-information` + authed non-admin → rewrite,
     `saa-returnTo` = `/awards-information`.
   - `now < startAt` + path `/` + admin → pass through, no rewrite.
   - `now < startAt` + path `/countdown` → pass through (the page itself).
   - `now < startAt` + path `/api/auth/status` → pass through.
   - `now < startAt` + path `/_next/static/...` → pass through.
   - `now >= startAt` → behave as the existing middleware (auth check only).
   - Malformed `EVENT_START_AT` → fail-open (no gate).
2. Extend `middleware.ts`:
   - Insert the gate check **before** the auth redirect logic.
   - Use `lib/events/get-event.ts` for `eventStartAt`.
   - Use `lib/auth/session.ts#readSessionJwt` for the admin check (the cookie is
     already read in the existing flow).
   - Use `lib/auth/admin-roles.ts#isAdminEmail`.

**Phase 3 Checkpoint**: all 9 gate-matrix tests green; manually verify every URL in
the existing app routes redirects to `/countdown` (with the env set to a future
date).

### Phase 4: US3 — T-0 unlock

1. Failing integration test: `tests/integration/countdown-unlock.test.tsx`:
   - Mocks `/api/auth/status` to return `{ authenticated: false }` → asserts
     `router.push('/login')` is called.
   - Mocks `{ authenticated: true }` → asserts `router.push('/')` is called.
   - Reads the `saa-returnTo` cookie (when present) and routes there for authed.
   - Calls `/api/auth/status` exactly once at T-0 (no spam on subsequent ticks).
2. Failing route test: `tests/integration/auth-status-route.test.ts`:
   - Returns `{ authenticated: false }` when `getCurrentUser` resolves to `null`.
   - Returns `{ authenticated: true }` when `getCurrentUser` resolves to a session.
3. Implement `app/api/auth/status/route.ts` (~10 lines).
4. Implement `components/countdown/countdown-unlock.tsx` (client):
   - Hosts `<EventCountdown>` with `onComplete` set to a navigation handler.
   - On `onComplete`: `useTransition` → fetch `/api/auth/status` → consume
     `saa-returnTo` cookie → `router.push(target)`.
5. Failing E2E: `tests/e2e/countdown-gate.spec.ts` — visit `/` with system time
   100 ms before `EVENT_START_AT`, wait for the unlock, assert URL is `/login` (or
   `/` if seeded session).

**Phase 4 Checkpoint**: all of US3 acceptance scenarios pass; manual smoke test with
clock set 5 seconds before `EVENT_START_AT` lands on the correct destination.

### Phase 5: Polish

- Admin banner (when admin bypasses the gate): a sticky yellow strip at the top of
  the Homepage saying "Pre-launch preview — campaign opens at <timestamp>". Owned
  by the Homepage; the Countdown plan only specifies its existence.
- ARIA: each tile gets `aria-label="<label>: <value>"` so screen readers announce
  "Days: 03".
- README touch-up: add "Pre-launch gate" section explaining the env wiring + admin
  bypass.
- Final acceptance: `npm run lint && npm run typecheck && npm run build &&
  npm run test && npm run test:e2e`.

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Middleware order** — gate must run BEFORE the existing auth redirect | High (regression-prone) | High | Single integration test asserts that `/awards-information` with an anonymous user → `/countdown` (gate fires) NOT `/login` (auth fires). Order-of-operations encoded in the test matrix. |
| **Fast client clock fires `onComplete` early** | Medium | High | T-0 navigation MUST call `/api/auth/status` (server-side) before navigating. If the server still thinks the gate is active, we get back `503 gate-active` and stay on the takeover. |
| **Malformed env locks the entire app** | Low | Critical | Fail-open: malformed `EVENT_START_AT` → no gate. Operators get the existing behavior. Encoded in the malformed-env test case. |
| **Component move breaks Homepage hero** | High | Low | Single search-and-replace of the import; Homepage hero E2E catches a regression on the first build. |
| **1s tick costs battery on mobile** | Medium | Low | Use `setInterval(1000)` only when the page is visible (listen to `document.visibilitychange`); pause when hidden. |
| **Admin bypass leaks gate URL to anonymous tab** | Low | Medium | Admin cookie is HttpOnly + bound to the session JWT; an anonymous tab can't impersonate an admin. |
| **`returnTo` cookie injection** | Low | Medium | Validate the cookie value is a relative path starting with `/` and does not contain `\` or `://`. Reject otherwise → fall back to `/`. |

### Estimated complexity

- **Frontend**: Low — three tiles + thin client wrapper. Most of the work is the
  component move.
- **Backend**: Low — one new 10-line API route + middleware diff.
- **Testing**: Medium — gate decision matrix is the bulk of the test code.

---

## Integration Testing Strategy

### Test scope

- **Component/Module interactions**:
  - `<CountdownUnlock>` ↔ `/api/auth/status` (mocked).
  - `<CountdownUnlock>` ↔ `<EventCountdown>` (via `onComplete`).
  - middleware ↔ `getEvent()` / `isAdminEmail()` / `readSessionJwt()`.
- **External dependencies**: none new.
- **Data layer**: `saa-returnTo` cookie (read at T-0, cleared after navigation).
- **User workflows**:
  - Anonymous visit before T-0 → see takeover → at T-0 → land on `/login`.
  - Authed non-admin visit before T-0 → see takeover, `saa-returnTo` saved → at T-0
    → land on the saved destination.
  - Admin visit before T-0 → bypass gate, see banner on Homepage.
  - Visit after T-0 → no gate, existing flow applies.

### Test categories

| Category | Applicable? | Key Scenarios |
|----------|-------------|---------------|
| UI ↔ Logic | Yes | `<EventCountdown>` fires `onComplete` once at zero; `<CountdownUnlock>` navigates. |
| Service ↔ Service | Yes | middleware ↔ `getEvent` + `readSessionJwt` + `isAdminEmail`. |
| App ↔ External API | No | The single `/api/auth/status` is in-process; not external. |
| App ↔ Data Layer | Yes | `saa-returnTo` cookie lifecycle. |
| Cross-platform | Yes | Mobile/tablet/desktop layouts; visibilitychange pause. |

### Mocking strategy

| Dependency Type | Strategy | Rationale |
|-----------------|----------|-----------|
| `Date.now()` | Vitest fake timers | Drives countdown deterministically. |
| `next/headers` cookies | `vi.mock` (same pattern as auth-callback test) | Middleware reads `saa-session`; tests inject. |
| `fetch('/api/auth/status')` | `vi.fn()` mock | Tests don't need a real server. |
| `useRouter().push` | Spy via Testing Library helpers | Asserts navigation target. |

### Test scenarios outline

1. **Happy path**
   - [ ] Anonymous user visits `/` 5 minutes before `EVENT_START_AT` → sees takeover
     → at T-0 → lands on `/login`.
   - [ ] Authed user visits `/awards-information` 5 minutes before → sees takeover
     → at T-0 → lands on `/awards-information` (returnTo honored).
   - [ ] Admin user visits `/` before T-0 → no gate; banner visible.
   - [ ] Anyone visits `/` after T-0 → no gate; existing flow.
2. **Error handling**
   - [ ] Malformed `EVENT_START_AT` → no gate; warning logged.
   - [ ] `/api/auth/status` returns 500 → fall back to `/login` (treat as anonymous).
   - [ ] `saa-returnTo` cookie contains a protocol-relative URL → reject, route to
     `/` instead.
3. **Edge cases**
   - [ ] Page hidden then visible after a long pause → `delta` recomputes correctly;
     unlock fires if T-0 was crossed while hidden.
   - [ ] Tab open across midnight → day rollover updates without reload.
   - [ ] T-0 fires while `/api/auth/status` is still in-flight → only one
     `router.push` (no double navigation).

### Tooling & framework

- Vitest + Testing Library + jsdom (unit/integration), Playwright (E2E) — already
  in place. Integration tests for middleware use `// @vitest-environment node`
  (matches the auth-callback test).

### Coverage goals

| Area | Target | Priority |
|------|--------|----------|
| `middleware.ts` gate logic | 100% (line + branch) | High |
| `app/api/auth/status/route.ts` | 100% | High |
| `components/countdown/event-countdown.tsx` | 90%+ | High |
| `components/countdown/countdown-unlock.tsx` | 85%+ | High |
| `components/countdown/countdown-takeover.tsx` | 80%+ | Medium |

---

## Dependencies & Prerequisites

### Required before start

- [x] `constitution.md` reviewed (v1.2.0)
- [x] `spec.md` approved by stakeholders *(self-approved by user — confirm)*
- [x] Login PR merged (provides `getCurrentUser`, `/auth/sign-out`, session JWT)
- [x] Homepage PR merged (provides `EventCountdown`, `getEvent`, `lib/auth/admin-roles.ts`)
- [ ] **Open-question decisions confirmed**:
  - [x] Admin bypass: yes, with banner (decided in this plan)
  - [x] `returnTo`: yes for authed only (decided in this plan)
  - [x] `start_at` source: `EVENT_START_AT` env (decided in this plan)
  - [x] EN locale: same Vietnamese subtitle (decided in this plan)
  - [x] Tick cadence: 1 second (decided in this plan)
  - All 5 decisions documented above are working defaults; confirm with the team
    before merging.

### External dependencies

- None.

---

## Open Questions

- [ ] **Admin banner copy** — confirm the exact wording (suggested:
  "Pre-launch preview — campaign opens at <localized timestamp>").
- [ ] **Background asset** — Figma's `2268:35127` may carry a full-bleed background
  image; query at Phase 0 to confirm.
- [ ] **Exact subtitle text** — spec assumed "Sự kiện sẽ bắt đầu sau"; confirm
  against Figma node `2268:35136` (the shared `Countdown time` wrapper).
- [ ] **Logging** — should the gate emit an analytics event for every intercepted
  visit, or only at T-0 unlock?
- [ ] **CI clock** — Playwright E2E that exercises the unlock needs a fake clock;
  recommended: Playwright's `Clock` API. Confirm with infra team.

---

## Next Steps

After plan approval:

1. **Run** `/momorph.tasks` to generate the executable task breakdown (will use the
   same `design-style.md` gate override documented under Violations).
2. **Confirm** the five resolved open questions with stakeholders before Phase 0.
3. **Begin** Phase 0 (assets + dictionary) and Phase 1 (component move) — both
   touch the existing Homepage code, so they go first to surface any regression in
   one PR.

---

## Notes

- **Tiny screen, big consequences**: this spec is the smallest in the project (3
  components) but introduces a cross-cutting middleware change. Reviewers MUST pay
  attention to the gate decision matrix tests in Phase 3 — they encode the
  intended order-of-operations and prevent regressions when other features extend
  middleware later.
- **Component reuse is the headline win**: the Homepage hero already ships an
  `EventCountdown` that we extend rather than duplicate. Future event-related
  features can keep importing from `components/countdown/` without a second move.
- **Banner is owned by the Homepage**: the admin bypass banner is mentioned here
  for completeness but the actual implementation lands in the Homepage spec's
  follow-up PR.
- **Visual fidelity**: all colours/spacing/typography for `<CountdownTakeover>` MUST
  be sourced via `mcp__momorph__query_section` against `2268:35127` and its
  children at implementation time. New tokens land in
  [`app/globals.css`](../../../app/globals.css) with one-line rationale comments.
