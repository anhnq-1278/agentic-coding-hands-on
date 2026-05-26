# Feature Specification: Countdown — Prelaunch page

**Frame ID**: `8PJQswPZmU` (root node `2268:35127`)
**Frame Name**: `Countdown - Prelaunch page`
**File Key**: `9ypp4enmFmdK3YAFJLIu6C`
**Created**: 2026-05-12
**Status**: Draft

---

## Overview

The **Countdown — Prelaunch page** is a **full-screen takeover** that gates the entire
SAA 2025 application before the event-start moment. While `now < campaign.start_at`,
every entry point into the app — Login, Homepage SAA, any deep link — is intercepted
and replaced with this screen. The UI shows a centered Days / Hours / Minutes countdown
to the launch moment and a single label "Sự kiện sẽ bắt đầu sau". When the countdown
reaches zero (T-0), the gate unlocks: the screen automatically routes visitors to
**Login** (if no session) or **Homepage SAA** (if signed in).

- **Target users**: any visitor to the SAA 2025 application during the pre-launch window
  — Sun\* employees (authenticated and anonymous) and any external visitor who reaches
  the URL before the event opens.
- **Business context**: marketing/event lever. The campaign deliberately blocks access
  to the bulk of the product until the launch moment, building anticipation. The page
  has **no chrome** (no header, no footer, no nav, no language switch) and **no
  clickable elements** — visitors cannot navigate away or interact with anything.
- **Locale**: the visible copy is Vietnamese-only per the design ("Sự kiện sẽ bắt đầu
  sau" + uppercase English labels "DAYS / HOURS / MINUTES"). English locale presentation
  is TBD (see Open Questions).

---

## User Scenarios & Testing *(mandatory)*

### US1: See the countdown to event start (Priority: P1) 🎯 MVP

**As any** visitor to the SAA 2025 app before the event starts
**I want to** see how much time remains until the launch
**So that** I know when to return and feel the campaign anticipation.

**Why this priority**: This is the entire purpose of the screen. Without an accurate
countdown the gate is just a blank takeover.

**Independent Test**: Navigate to any in-app URL while `now < campaign.start_at`;
assert the page renders 3 two-digit tiles (Days / Hours / Minutes) with uppercase
white labels and a Vietnamese subtitle; advance the system clock by one minute and
assert the minutes tile decrements.

**Acceptance Scenarios**:

1. **Given** the visitor is on the Countdown screen at T-1 day 6 hours 30 minutes,
   **When** the page first renders,
   **Then** Days shows `01`, Hours shows `06`, Minutes shows `30`, each as two-digit
   LED-style tiles with the labels "DAYS", "HOURS", "MINUTES" above them.
2. **Given** the page is open with a single-digit value (e.g., 9 days remaining),
   **When** the tile renders,
   **Then** the value is zero-padded to `09` (test cases ID-`33fe648b...`,
   ID-`1bd69f78...`, ID-`8dc4bba6...`, ID-`c715cb38...`).
3. **Given** the page is open with 0 days remaining (less than 24 hours),
   **When** the tile renders,
   **Then** Days shows `00` (test case ID-`b373626d...`).

---

### US2: Countdown auto-updates in real time (Priority: P1)

**As a** visitor who keeps the page open
**I want to** see the countdown decrement without manually refreshing
**So that** the page feels live and accurate.

**Why this priority**: A static number would be misleading and would defeat the
"approaching launch" experience.

**Independent Test**: Open the page, note the current Minutes value, wait one minute
(or advance the clock), and assert the Minutes value decremented by 1 (or rolled over
to 59 with Hours decrementing by 1 if it crossed an hour boundary).

**Acceptance Scenarios**:

1. **Given** the page is open and the timer reads `D:01 H:06 M:30`,
   **When** one minute elapses,
   **Then** the display updates to `D:01 H:06 M:29` without a full reload (test case
   ID-`840dd6be...`).
2. **Given** the Minutes tile reads `00` and Hours reads `06`,
   **When** the next minute boundary passes,
   **Then** Minutes rolls over to `59` and Hours decrements to `05`.
3. **Given** the page is open and Days reads `01`, Hours reads `00`, Minutes reads `00`,
   **When** the next minute boundary passes,
   **Then** the rollover propagates: Days `00`, Hours `23`, Minutes `59`.

---

### US3: Gate unlocks at T-0 (Priority: P1)

**As the** product
**I want to** automatically route visitors out of the Countdown screen the moment the
event starts
**So that** the takeover ends cleanly and the app becomes usable.

**Why this priority**: Without this, visitors would be stuck on the takeover forever
even after the launch moment. This is the unlock mechanism.

**Independent Test**: Open the page with the event 1 second in the future; wait until
the countdown reaches zero; assert the visitor is automatically redirected to either
`/login` (when no session) or `/` (when a valid session exists).

**Acceptance Scenarios**:

1. **Given** a visitor with NO session is on the Countdown screen,
   **When** the countdown reaches `D:00 H:00 M:00` and the next tick fires,
   **Then** the system stops the interval and navigates to `/login`.
2. **Given** a visitor with a valid session is on the Countdown screen,
   **When** the countdown reaches `D:00 H:00 M:00` and the next tick fires,
   **Then** the system stops the interval and navigates to `/` (Homepage SAA,
   `i87tDx10uM`).
3. **Given** the visitor opens the URL after `start_at` has already passed,
   **When** the page renders,
   **Then** the gate immediately routes them as in (1) or (2) above; the countdown UI
   MUST NOT flash.

---

### US4: Gate every entry while pre-launch (Priority: P1)

**As the** product
**I want to** intercept every navigation attempt (Login, Homepage SAA, deep links)
before the event starts and serve the Countdown screen instead
**So that** the takeover is consistent and no path bypasses it.

**Why this priority**: A leaky gate defeats the entire feature.

**Independent Test**: Set the system clock so `now < campaign.start_at`; navigate
directly to `/`, `/login`, `/awards-information`, `/sun-kudos`, `/community-standards`,
`/profile`; assert each request resolves to the Countdown screen (or a redirect that
lands on it) with the same chrome (none).

**Acceptance Scenarios**:

1. **Given** the campaign has not started,
   **When** an anonymous visitor opens any in-app URL,
   **Then** they see the Countdown screen, NOT the requested page (test case
   ID-`e6a59553...` mentions "Access is allowed or the user is blocked/redirected as
   per application configuration" — confirmed as the gate behavior here).
2. **Given** the campaign has not started,
   **When** an authenticated visitor opens any in-app URL,
   **Then** they see the Countdown screen and their session cookie is preserved (the
   original destination MAY be preserved as a `returnTo` for T-0 unlock).
3. **Given** an attempt to reach the Countdown screen at a malformed URL,
   **When** the request resolves,
   **Then** the system serves either an error response or routes them to the canonical
   countdown URL (test case ID-`68d82c58...`).
4. **Given** a user has an expired session and tries to reach `/`,
   **When** the gate is active,
   **Then** they see the Countdown screen. At T-0 they are routed to `/login` (per
   US3.1).

---

### Edge Cases

- **Invalid env value for campaign start** — if `EVENT_START_AT` (or the
  campaign-API equivalent) cannot be parsed, the gate falls back to showing `--` in
  every tile and MUST NOT auto-route. Operators MUST be able to fix this without
  restarting the app.
- **Clock skew between client and server** — the client tick is for display only; the
  T-0 unlock decision MUST be confirmed against the server (`/api/auth/session` or a
  server clock query) before navigating, so a fast/slow client clock cannot
  prematurely unlock the gate.
- **Out-of-range tile values** (`-1`, `60`, `25`) — clamp to the valid range and
  display `00` for negatives (test cases ID-`f98adad8...`, ID-`724e6e17...`).
- **Tab in background for hours** — when the user returns, the display should be
  approximately correct; rely on `Date.now()` at every tick rather than a counter, so
  background throttling does not produce drift.
- **Admin bypass** — TBD policy: should admins (`isAdminEmail`) be allowed to skip
  the gate? See Open Questions.

---

## UI/UX Requirements *(behavior, not pixels)*

### Page sections

| Node ID | Component | Type | Interactive? | Behavior |
|---------|-----------|------|--------------|----------|
| `2268:35127` | Root frame `Countdown - Prelaunch page` | FRAME | No | Full-bleed background; no chrome. |
| `2268:35136` | `Countdown time` wrapper | FRAME (shared component `186:2619`) | No | Hosts the three tiles + the "Sự kiện sẽ bắt đầu sau" subtitle. |
| `2268:35139` | `1_Days` tile | FRAME | No | 2-digit zero-padded value + label "DAYS". |
| `2268:35144` | `2_Hours` tile | FRAME | No | 2-digit zero-padded value + label "HOURS". Range 00–23. |
| `2268:35149` | `3_Minutes` tile | FRAME | No | 2-digit zero-padded value + label "MINUTES". Range 00–59. |

> The countdown tiles SHOULD be the same shared component used by the Homepage hero
> `mms_B1.3_Countdown` (frame `2167:9037`) — the design re-uses the LED flip-card
> component `186:2619`. Implementations MAY share a single component module between
> the Homepage hero and this takeover.

### Component Behavior detail

- **Days / Hours / Minutes tiles**
  - **Trigger**: none — non-interactive, no `onClick`.
  - **Action**: re-render when the parent recomputes the delta from `Date.now()` vs
    `campaign.start_at`.
  - **State transitions**: idle (showing live value) → completion (`00` on the unit's
    completion) → unmount on T-0.
  - **Validation rules**: zero-pad to 2 digits. Days range `00–99`; Hours range
    `00–23`; Minutes range `00–59`. Negative values or out-of-range values display `00`.

- **Subtitle "Sự kiện sẽ bắt đầu sau"** (or the design's actual subtitle copy — TBD;
  the design item registry shows only the three time-unit frames at depth 1).
  - **Trigger**: none.
  - **Action**: static text from the i18n dictionary.

### Navigation Flow (sourced from `.momorph/contexts/SCREENFLOW.md` and the screenflow detail)

- **Incoming** (all automatic gate intercepts while `now < campaign.start_at`):
  - App launch (anonymous) → Countdown.
  - Login → Countdown.
  - Homepage SAA → Countdown.
  - Any deep link / app entry → Countdown (with optional `returnTo` preserved).
- **Outgoing** (no clickable elements — all transitions are time-based):
  - Countdown reaches `D:00 H:00 M:00` AND no session → `/login` (US3.1).
  - Countdown reaches `D:00 H:00 M:00` AND valid session → `/` Homepage SAA (US3.2).
  - Optional: if `returnTo` was captured at gate entry, route to that destination after
    auth check at T-0 (TBD).
- **Conditional**:
  - Malformed event datetime → render fallback `--` tiles; do NOT auto-route.
  - 401 from session probe → treat as no-session → `/login`.

### Visual / Accessibility Requirements (non-prescriptive)

- The page MUST be readable on mobile, tablet, and desktop; the tiles MAY scale but
  the digit count and label position remain consistent.
- Tiles MUST have an accessible name (e.g., `aria-label="Days remaining: 03"`).
- The countdown MUST update at most every minute (per design — Seconds tile is not
  in scope); operators MAY tighten the tick to 1s for smoother UX but the contract
  guarantees minute precision.
- No focus traps, no keyboard navigation — the page has no interactive elements.
  Tab through the page MUST do nothing.

> Pixel-level styling, colours, fonts, asset paths, LED font choice, background image,
> and the exact subtitle treatment are intentionally out of scope; the implementation
> step retrieves them via `query_section` / `get_media_files`.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST intercept every in-app request while
  `now < campaign.start_at` and render the Countdown screen instead of the requested
  page. Public, auth-only, and admin-only routes are all gated.
- **FR-002**: The page MUST display three two-digit tiles labelled `DAYS`, `HOURS`,
  `MINUTES` plus a subtitle, all sourced from the dictionary.
- **FR-003**: Values MUST be zero-padded to 2 digits; single-digit numbers render
  with a leading `0` (e.g., `05`, `09`, `00`).
- **FR-004**: Out-of-range / negative values MUST render as `00` (defensive clamp).
- **FR-005**: The countdown MUST recompute from `Date.now() - campaign.start_at` at
  every tick (drives correctness even after tab backgrounding).
- **FR-006**: When the countdown reaches `D:00 H:00 M:00`, the system MUST stop the
  interval, probe `/api/auth/session`, and navigate to `/login` (no session) or `/`
  (valid session) within 1 second.
- **FR-007**: When `EVENT_START_AT` (or its server equivalent) is missing or
  malformed, the page MUST render `--` in each tile and MUST NOT auto-route.
- **FR-008**: The page MUST NOT render any header, footer, language switch, or
  account menu. It MUST NOT include `<form>`, `<button>`, or any interactive element
  inside the takeover.

### Technical Requirements

- **TR-001 (Performance)**: First paint MUST show the three tiles + subtitle within
  the LCP budget; the takeover is a static page apart from the tick interval.
- **TR-002 (Security)**: The T-0 unlock decision MUST be confirmed against the server
  before navigating, so a fast client clock cannot bypass the gate.
- **TR-003 (Accessibility)**: WCAG 2.1 AA — tiles have accessible names; static page
  has no focus traps.
- **TR-004 (i18n)**: All visible copy MUST come from the dictionary. The screen is
  Vietnamese-only by default per the design; English variant TBD.

### Key Entities

- **Campaign**: `{ id: "saa-2025", startAt: ISO-8601, status: "prelaunch" | "live" |
  "ended" }`. For MVP the project's existing `Event` type with `startAt` is
  sufficient; the campaign abstraction MAY be deferred until multi-event support is
  required.

---

## API Dependencies *(predicted)*

| Endpoint | Method | Purpose | Triggered by | Status |
|----------|--------|---------|--------------|--------|
| `/api/campaign/current` | GET | Returns `{ startAt: ISO-8601, serverNow: ISO-8601 }` so the gate can de-skew the client clock. | Page mount + every ~60s resync | Predicted |
| `/api/auth/session` | GET | Probed at T-0 to decide between `/login` and `/` routing. | T-0 unlock (US3) | Exists (Login spec) |

> If a project-level decision keeps the event datetime as an env var
> (`EVENT_START_AT`, as currently wired in Homepage SAA), the `/api/campaign/current`
> endpoint is unnecessary and the gate can read the env at SSR time. The choice
> impacts how operators change the launch time during the campaign (env var requires
> a redeploy; API allows live update).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of unauthenticated and authenticated in-app navigation while
  `now < campaign.start_at` resolves to the Countdown screen (verified by an
  automated link checker against every published route).
- **SC-002**: When the countdown reaches T-0, ≥ 99% of open clients navigate to the
  correct destination (login vs homepage) within 2 seconds.
- **SC-003**: Countdown drift after one minute is ≤ 2 seconds.
- **SC-004**: Tile values respect the documented ranges in 100% of observed states
  (validated against the test cases ID-`f98adad8`, ID-`724e6e17`, ID-`c715cb38`).
- **SC-005**: Zero interactive elements on the page (confirmed by automated DOM scan
  for `<button>`, `<a>`, `<input>`, `<form>`, `<select>`, `<textarea>`, or `[role]`
  attributes within the countdown takeover region).

---

## State Management

- **Local component state**:
  - `delta`: `{ days, hours, minutes, reached }` derived from `Date.now()` vs the
    campaign start.
  - `transitioning`: boolean — true once T-0 fires while the session probe is in
    flight, to suppress the visible tiles flicker before navigation.
- **Global / app-level state**:
  - `campaignStartAt`: server-supplied (env or API), shared with the Homepage hero
    countdown.
  - `currentSession`: probed at T-0 only; not cached.
- **Server state caching**:
  - `campaign/current` MAY be cached for the lifetime of the page (and re-fetched
    every ~60s to absorb operator edits).
  - `auth/session` MUST NOT be cached at T-0 — the decision drives navigation.
- **Optimistic updates**: none — the takeover is informational only.

---

## Out of Scope

- The destination pages (Login, Homepage SAA, 403) — covered by their own specs.
- The Notification panel, profile dropdown, language switch — none of these chrome
  pieces render on this page.
- Admin bypass UX — TBD (see Open Questions).
- Seconds segment — the design only shows Days / Hours / Minutes. Adding seconds is
  a deliberate non-goal.
- Server-push (WebSocket / SSE) for T-0 unlock — Phase 1 uses a client tick + server
  probe.
- Live-updating event copy ("starts in 30 minutes!" style banners) — out of scope;
  the takeover is intentionally minimal.

---

## Dependencies

- [x] Constitution document exists ([`.momorph/constitution.md`](../../constitution.md)) — v1.2.0
- [x] Screen flow documented ([`.momorph/contexts/SCREENFLOW.md`](../../contexts/SCREENFLOW.md))
- [x] Per-screen detail ([`.momorph/contexts/screen_specs/countdown-prelaunch-page.md`](../../contexts/screen_specs/countdown-prelaunch-page.md))
- [x] Login spec exists ([`../GzbNeVGJHz-Login/spec.md`](../GzbNeVGJHz-Login/spec.md)) — provides the post-T-0 fallback destination
- [x] Homepage SAA spec exists ([`../i87tDx10uM-Homepage-SAA/spec.md`](../i87tDx10uM-Homepage-SAA/spec.md)) — provides the post-T-0 success destination and re-uses the countdown component design (`186:2619`)
- [ ] API specifications available (`.momorph/contexts/api-docs.yaml`) — not yet generated
- [ ] Admin bypass policy decision — see Open Questions

### Constitution Alignment

- **Principle I — Spec-Driven Development**: this spec, the screenflow, and the
  underlying design items are the only allowed inputs. The Days/Hours/Minutes nodes
  carry the Node IDs an implementer needs.
- **Principle II — Test-First**: the 17 test cases from
  `get_frame_test_cases (sheet "Countdown - Prelaunch page_0130")` MUST be converted
  to failing tests before implementation begins.
- **Principle III — Layered Architecture**: the gate logic lives in middleware (or a
  shared server helper) — the takeover page itself is a pure render of the delta.
- **Principle IV — Design Tokens**: any new visual tokens (LED digit colour, glow,
  background art) MUST be added to `app/globals.css` with a one-line rationale; the
  page MUST NOT contain raw hex values.
- **Principle V — Type Safety**: all DTOs (`Campaign`, the shared `Event` shape if
  reused) MUST be typed; no `any`.

---

## Notes

- **Component reuse**: the Homepage SAA hero already ships an `EventCountdown` client
  component ([`components/homepage/event-countdown.tsx`](../../../components/homepage/event-countdown.tsx))
  that ticks every minute and supports a `malformed` fallback. The Countdown takeover
  SHOULD reuse this component (or a small wrapper) rather than duplicating the
  logic — Figma confirms both screens share component `186:2619`.
- **Gate placement**: implementation MUST land in `middleware.ts` so every request
  goes through the check. The takeover page MUST be a server-rendered route (e.g.,
  `/countdown` or a dedicated layout swap) reachable from the middleware redirect.
- **Single-source-of-truth for `start_at`**: today the Homepage uses
  `EVENT_START_AT` env. The Countdown screen MUST read the same source so the two
  screens stay in lockstep.
- **No client-side OAuth attempt**: the Login page is reachable through the gate
  intercept, so a user who tries to sign in before T-0 will instead see the
  countdown. This is by design.

---

## Open Questions

- [ ] **Admin bypass** — should users in `ADMIN_EMAILS` be allowed past the gate
  before T-0 (e.g., to test the production app)? Recommend: **yes, with a banner**.
- [ ] **`returnTo` preservation** — should the gate remember the URL the visitor
  originally requested and route there at T-0? Recommend: yes for authenticated
  users, no for anonymous (who always land on Login).
- [ ] **Server source of `start_at`** — `EVENT_START_AT` env (current Homepage
  approach) vs `/api/campaign/current` (allows live edit without redeploy). Pick one
  before implementation.
- [ ] **English locale copy** — the design is Vietnamese-only. Confirm whether the
  EN locale gets the same Vietnamese subtitle or an English translation.
- [ ] **Tick cadence** — design only requires minute precision. Confirm whether the
  client should tick at 1s or 60s. Recommend: **1s** for visual liveness, but the
  rollover logic stays minute-based.
