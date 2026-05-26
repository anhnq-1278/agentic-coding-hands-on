# Implementation Plan: Homepage SAA

**Frame**: `i87tDx10uM-Homepage-SAA` (root node `2167:9026`)
**Date**: 2026-05-07
**Spec**: [`spec.md`](./spec.md)
**Screenflow**: [`../../contexts/SCREENFLOW.md`](../../contexts/SCREENFLOW.md)
**Per-screen detail**: [`../../contexts/screen_specs/homepage-saa.md`](../../contexts/screen_specs/homepage-saa.md)
**Constitution**: [`../../constitution.md`](../../constitution.md) (v1.2.0)
**Reuses from Login**: [`../GzbNeVGJHz-Login/spec.md`](../GzbNeVGJHz-Login/spec.md), [`../GzbNeVGJHz-Login/plan.md`](../GzbNeVGJHz-Login/plan.md)

---

## Summary

Build the **Homepage SAA** as a Next.js 16 App Router page at route `/` that serves as
the persistent campaign hub: keyvisual hero with a live countdown to the event start,
a 6-card grid linking into the Awards Information page, a Sun\* Kudos promo block,
plus full chrome (logo + 3 nav links + bell + language + avatar in the header; logo +
4 nav links + copyright in the footer; floating quick-action widget).

This screen is the **first auth-aware content page** after Login. Login's chrome
(`Header`, `Footer`, `HeaderLanguageSwitch`) is intentionally minimal; the Homepage
needs richer chrome that will also be reused by every other authenticated content
page (Awards Information, Sun\* Kudos, Profile, Admin Dashboard, etc.). The plan
introduces `app-header.tsx` and `app-footer.tsx` as the reusable variants and leaves
the simpler Login chrome alone.

The plan also resolves the **public-vs-authenticated access** open decision from the
spec by recommending the homepage stay **public** (per Figma test case ID-0) with
auth-only chrome (bell, avatar) gated by a server-side session check. The current
middleware will be relaxed to allow `/` and the new placeholder routes.

Concrete deliverables in scope:

- US1 (P1) — hero + countdown
- US2 (P1) — 6 award cards + click-through to `/awards-information#<slug>` (placeholder)
- US3 (P1) — header navigation
- US4 (P2) — event info block
- US5 (P2) — language switch (upgrades the placeholder shipped with Login)
- US6 (P2) — account avatar dropdown (Profile / Sign out / Admin Dashboard)
- US7 (P2) — Sun\* Kudos promo + click-through to `/sun-kudos` (placeholder)
- US8 (P3) — notification bell with stubbed unread count (panel itself is OOS)
- US9 (P3) — floating widget with stub menu items (real menu owned by Widget spec)

Out of scope (separate specs / future work):

- The Awards Information page content (only a placeholder route is created here).
- The Sun\* Kudos live-board page content (only a placeholder route).
- The Notification panel itself.
- The Profile / Admin Dashboard pages (placeholder routes only).
- The Widget quick-action menu items.

---

## Technical Context

| Item | Choice |
|------|--------|
| **Language/Framework** | TypeScript 5 (strict) / Next.js 16.2.4 App Router / React 19.2.4 |
| **Auth provider** | Direct Google OAuth via `arctic` + JWT cookie via `jose` (already wired in Login) |
| **Session reader** | `getCurrentUser()` from `lib/auth/session.ts` (server-only) |
| **Persistence** | None new — awards catalog is a static dictionary for MVP; event datetime is an env var |
| **Styling** | Tailwind CSS v4 + CSS variables in `app/globals.css` (Constitution Principle IV) |
| **State Management** | Local `useState` for menu open/close + countdown ticker; cookie-backed locale; no global store |
| **API Style** | Next.js App Router server components + minimal route handlers; no new public APIs for MVP |
| **Testing** | Vitest + Testing Library + jsdom for unit/integration; Playwright for E2E (config already in place) |
| **i18n** | In-app dictionary (extends [`lib/i18n/dictionary.ts`](../../../lib/i18n/dictionary.ts)) |

> **Reused from Login PR**: every dependency, env var, and config is already present.
> No new dependencies are needed for this feature.

---

## Constitution Compliance Check

*GATE: must pass before implementation can begin.*

| Requirement | Constitution Rule | Status |
|-------------|-------------------|--------|
| Spec exists & traces to Figma | I — Spec-Driven Development | ✅ Compliant |
| Navigation sourced from SCREENFLOW.md | I — Spec-Driven Development | ✅ Compliant |
| Tests written before implementation | II — Test-First (NON-NEGOTIABLE) | 📋 Planned |
| Layered architecture (route → service) | III — Layered Architecture | 📋 Planned |
| No hard-coded visual values | IV — Design Tokens | 📋 Planned |
| TS strict, ESLint clean, conventions | V — Type Safety & Convention Conformance | ✅ Compliant (config in place) |
| `npm run build`, `npm run lint`, `npm run test` pass | V — Quality gate | 📋 Planned |

**Violations**:

| Violation | Justification | Alternative Rejected |
|-----------|---------------|---------------------|
| Plan written before `design-style.md` is generated | Same as Login: project decision per Constitution Principle IV — visual specs fetched on-demand at implementation via `query_section`. | Generating a frozen `design-style.md` duplicates Figma data and rots fast. |
| Plan written before `BACKEND_API_TESTCASES.md` | The spec's predicted API table is the working contract; backend test cases will be authored when the awards/notifications APIs become live. | Blocking the plan for documents that aren't load-bearing for MVP delays delivery. |
| Awards catalog ships as a static dictionary, not a DB-backed API | Catalog is six fixed entries that change once a year; an API + DB is over-engineering for MVP and re-introduces the resolved `TODO(APP_DATA_PERSISTENCE)`. | Wire the API now: pulls in DB choice and migration tooling for no incremental value. |

---

## Architecture Decisions

### Frontend approach

- **Component split**: server-render the page shell + dictionary lookups + session
  check; mark only the truly interactive bits as client components (`EventCountdown`,
  `AccountMenu`, `LanguageMenu`, `FloatingWidget`, `NotificationBell`). The award
  grid, Sun\* Kudos block, hero, and footer stay server.
- **Reusable chrome**:
  - `components/layout/app-header.tsx` (NEW) — Header for the Homepage and every
    future authenticated content page. Takes a `currentUser` prop and decides whether
    to render the bell + avatar.
  - `components/layout/app-footer.tsx` (NEW) — Footer with logo + 4 nav links +
    copyright. Always rendered; no auth dependency.
  - **Login chrome stays untouched** — `components/layout/header.tsx` and
    `components/layout/footer.tsx` keep their minimal "Login-only" purpose. Anything
    that gets richer (e.g., language menu) is extracted into a *shared* component
    used by both.
- **Language menu upgrade**: `HeaderLanguageSwitch` (currently visual-only) is
  promoted to a real client component (`components/layout/language-menu.tsx`) backed
  by a server action `actions/set-locale.ts` that writes the `saa-locale` cookie.
  Both Login's Header and the new `app-header.tsx` consume it.
- **Award grid**: an `<AwardCard>` component takes a typed `AwardCategory`; the grid
  renders six cards from a static catalog in `lib/awards/catalog.ts`. CSS grid with
  `lg:grid-cols-3 sm:grid-cols-2` per ID-15/ID-16.
- **Countdown**: `<EventCountdown>` client component receives `eventStartAt` as an
  epoch-millis number (server-computed). It re-renders every minute using
  `setInterval`. When the delta hits ≤ 0 the "Coming soon" subtitle is hidden and
  all tiles read `00`.
- **Account menu**: `<AccountMenu>` client component takes a `role: "user" | "admin"`
  and renders the dropdown items. Sign-out is a `<form>` POSTing to `/auth/sign-out`
  (already implemented). Other items are `<Link>` to placeholder routes.
- **Notification bell**: `<NotificationBell>` renders the bell icon and an optional
  badge driven by an `unreadCount` prop. For MVP, the page passes `unreadCount={0}`
  unconditionally (and renders no badge); the bell click is a no-op until the
  Notification spec is authored.
- **Widget**: `<FloatingWidget>` renders the fixed pill and opens a stub menu with
  two `<Link>` items pointing to placeholder routes.

### Backend approach (Next.js route handlers)

- **No new public APIs** for MVP. The pieces that *would* otherwise need an endpoint
  are server-rendered:
  - `getCurrentUser()` — already in `lib/auth/session.ts`.
  - `getEvent()` — new server-only helper that reads `process.env.EVENT_START_AT`,
    parses, and returns `{ startAt: number, location, livestreamNote }`. Located at
    `lib/events/get-event.ts`.
  - `getAwardCatalog(locale)` — new server-only helper backed by a static dictionary
    in `lib/awards/catalog.ts`. Returns the six entries localized.
- **`actions/set-locale.ts`** — server action callable from the language menu. Writes
  the `saa-locale` cookie via `next/headers`'s `cookies().set(...)`.
- **No DB changes** — re-pinning persistence stays as TODO(APP_DATA_PERSISTENCE).

### Integration points

- **Existing services** reused:
  - `getCurrentUser` (Login PR) — drives `<AppHeader>` chrome decisions.
  - `getLocale` / `getLoginDictionary` (Login PR) — extended to a `getHomepageDictionary`
    sharing the same locale source and cookie.
  - `/auth/sign-out` (Login PR) — used by `<AccountMenu>` form.
  - `middleware.ts` — relaxed to allow `/`, `/awards-information`, `/sun-kudos`,
    `/community-standards` as public routes (driven by the spec's ID-0 finding).
- **Shared components** introduced or upgraded:
  - `LanguageMenu` (new shared client component) — replaces the Login `HeaderLanguageSwitch`.
  - `AppHeader` / `AppFooter` (new) — used by Homepage now and every other
    authenticated content page later.
- **Placeholder routes** created so navigation does not 404:
  - `/awards-information` — placeholder page; full spec TBD.
  - `/sun-kudos` — placeholder; full spec TBD (`MaZUn5xHXZ`).
  - `/community-standards` — placeholder for footer "Tiêu chuẩn chung".
  - `/profile` — placeholder for AccountMenu Profile item.
  - `/admin` — placeholder for AccountMenu Admin Dashboard item.

---

## Project Structure

### Documentation (this feature)

```text
.momorph/specs/i87tDx10uM-Homepage-SAA/
├── spec.md            # ✅ exists — feature specification
├── plan.md            # ✅ this file
├── research.md        # 📋 optional — open questions captured below; promote if needed
└── tasks.md           # 📋 next step (run /momorph.tasks)
```

### Source code (root-flat layout)

```text
app/
├── page.tsx                              # MODIFIED — render <HomepageScreen />, no redirect
├── awards-information/
│   └── page.tsx                          # NEW — placeholder (Coming soon stub)
├── sun-kudos/
│   └── page.tsx                          # NEW — placeholder
├── community-standards/
│   └── page.tsx                          # NEW — placeholder
├── profile/
│   └── page.tsx                          # NEW — placeholder
└── admin/
    └── page.tsx                          # NEW — placeholder, role-gated

actions/
├── set-locale.ts                         # NEW — server action: write saa-locale cookie

components/
├── layout/
│   ├── app-header.tsx                    # NEW — Homepage + future authed content header
│   ├── app-footer.tsx                    # NEW — Homepage + future authed content footer
│   ├── language-menu.tsx                 # NEW — interactive replacement for HeaderLanguageSwitch
│   ├── account-menu.tsx                  # NEW — avatar dropdown (Profile/Sign out/Admin)
│   ├── notification-bell.tsx             # NEW — bell + badge
│   ├── header-language-switch.tsx        # MODIFIED — internally delegate to <LanguageMenu>
│   ├── header.tsx                        # unchanged (Login-only)
│   └── footer.tsx                        # unchanged (Login-only)
└── homepage/
    ├── homepage-screen.tsx               # NEW — composes hero + sections + chrome
    ├── homepage-hero.tsx                 # NEW — keyvisual + countdown + event info + CTA
    ├── event-countdown.tsx               # NEW — client component, ticks each minute
    ├── event-info.tsx                    # NEW — static block (time/location/livestream)
    ├── homepage-cta-pair.tsx             # NEW — ABOUT AWARDS / ABOUT KUDOS buttons
    ├── awards-section.tsx                # NEW — section header + grid
    ├── award-card.tsx                    # NEW — one award category card
    ├── sun-kudos-block.tsx               # NEW — D1 promo block
    └── floating-widget.tsx               # NEW — fixed bottom-right widget

lib/
├── awards/
│   └── catalog.ts                        # NEW — six fixed AwardCategory entries (VN + EN)
├── events/
│   └── get-event.ts                      # NEW — read EVENT_START_AT, return Event
└── i18n/
    └── dictionary.ts                     # MODIFIED — add homepage namespace (heroSubtitle, eventInfo, awardsHeader, sunKudos, footer, account, errors)

types/
└── homepage.ts                           # NEW — Event, AwardCategory, NotificationSummary types

middleware.ts                              # MODIFIED — public list extended

public/assets/
├── homepage/
│   ├── images/                            # NEW (Phase 0)
│   │   ├── keyvisual-bg.png               # likely identical to login's; reuse if so
│   │   ├── root-further.png               # may reuse login's root-further-logo.png
│   │   ├── kudos-banner.png
│   │   └── award-{slug}.png × 6           # one thumbnail per award category
│   ├── icons/
│   │   ├── bell.svg
│   │   ├── avatar-default.svg
│   │   ├── widget-pencil.svg
│   │   ├── widget-saa.svg
│   │   └── chevron-right.svg              # for "Chi tiết" affordance
│   └── logos/
│       └── saa-logo.png                   # reuse login's saa-logo.png if same node
└── login/                                 # already populated from Login PR

tests/
├── unit/
│   ├── event-countdown.test.tsx           # NEW — idle ticks + zero state
│   ├── award-card.test.tsx                # NEW — renders title + description + correct href
│   ├── account-menu.test.tsx              # NEW — role-based items (user vs admin)
│   ├── language-menu.test.tsx             # NEW — open/close + selection
│   └── awards-catalog.test.ts             # NEW — six entries, slugs, locale switching
├── integration/
│   ├── homepage-render.test.tsx           # NEW — public vs authenticated chrome, server render
│   └── set-locale-action.test.ts          # NEW — cookie set + redirect
└── e2e/
    └── homepage.spec.ts                    # NEW — header nav + cards + language switch + countdown decrement
```

### Dependencies to add

**None.** All dependencies are inherited from the Login PR (`arctic`, `jose`,
`vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`,
`vite-tsconfig-paths`, `@playwright/test`).

### Environment variables (additions)

| Var | Where | Purpose |
|-----|-------|---------|
| `EVENT_START_AT` | server only | ISO-8601 datetime of the event start (e.g., `2025-12-31T18:30:00+07:00`). Drives the countdown. |
| `EVENT_LOCATION` | server only (optional) | Override for the event location string. Defaults to "Nhà hát nghệ thuật quân đội". |
| `EVENT_LIVESTREAM_NOTE` | server only (optional) | Override for the livestream note. Defaults to "Tường thuật trực tiếp tại Group Facebook Sun\* Family". |

> Existing env vars (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SESSION_SECRET`,
> `ALLOWED_EMAIL_DOMAINS`, `NEXT_PUBLIC_SITE_URL`) are unchanged. Update
> `.env.local.example` to add the new entries.

---

## Implementation Approach

### Phase 0: Asset preparation + middleware relaxation

- Run `mcp__momorph__list_media_nodes` and `mcp__momorph__get_media_files` for frame
  `i87tDx10uM`. Audit each asset's true pixel dimensions before referencing it.
- Download to `public/assets/homepage/{icons|images|logos}/` with kebab-case
  filenames (per [`.momorph/guidelines/frontend.md`](../../guidelines/frontend.md)).
- Fetch any composite-only assets (e.g., the keyvisual background) via
  `mcp__momorph__get_figma_image` if `get_media_files` does not surface them — same
  recovery pattern used in Login PR.
- Where Login's assets cover an exact node (SAA logo, Google icon),
  re-use them via the existing `public/assets/login/...` paths rather than duplicating.
- Update [`.env.local.example`](../../../.env.local.example) with the new event vars.
- Update [`middleware.ts`](../../../middleware.ts) to add `/`, `/awards-information`,
  `/sun-kudos`, `/community-standards` to the public-route prefixes (decision below).

### Phase 1: Foundation

- `types/homepage.ts` — `Event`, `AwardCategory`, `NotificationSummary` types.
- `lib/events/get-event.ts` — server-only reader (parses `EVENT_START_AT`, returns
  `Event`). Failing-fallback behaviour per ID-60.
- `lib/awards/catalog.ts` — six fixed `AwardCategory` entries, locale-aware copy.
  Includes a `getAwardCategory(locale, slug)` helper. Comes with `awards-catalog.test.ts`
  written first (RED → GREEN).
- `lib/i18n/dictionary.ts` — extend with a `homepage` namespace covering hero
  subtitle, event-info labels, awards section header, Sun\* Kudos block, footer,
  account menu items, and any error/copy strings the page renders.
- `actions/set-locale.ts` — server action that validates the locale and writes the
  `saa-locale` cookie. Comes with `set-locale-action.test.ts`.

### Phase 2: User Story 1 (P1) — Hero + countdown 🎯 MVP

Vertical slice, TDD throughout:

1. Failing `event-countdown.test.tsx`: idle render at 7d/3h/12m, tick decrement,
   zero state hides "Coming soon", malformed env value renders fallback.
2. Implement `<EventCountdown>` (client component), `<HomepageHero>`,
   `<EventInfo>`, `<HomepageCtaPair>`.
3. `<HomepageScreen>` server component composes hero + sections.
4. Update `app/page.tsx`: drop the `redirect('/login')` gate, call
   `getCurrentUser` (may return null for public visit), render `<HomepageScreen>`.
5. Failing E2E `homepage.spec.ts` Phase A: hero + countdown + minute decrement.

### Phase 3: User Story 2 (P1) — Award grid

1. Failing `award-card.test.tsx`: renders title, description, href to
   `/awards-information#<slug>`, hover treatment is keyboard-equivalent.
2. Implement `<AwardCard>` and `<AwardsSection>`.
3. Wire into `<HomepageScreen>` between hero and Sun\* Kudos block.
4. Add `app/awards-information/page.tsx` placeholder (renders a stub).
5. Extend the homepage E2E to click a card and assert the URL + anchor.

### Phase 4: User Story 3 (P1) — Header navigation

1. Implement `<AppHeader>`: logo + 3 nav links + bell + language menu + avatar.
2. Compose into `<HomepageScreen>`. Pass `currentUser`.
3. Add placeholder pages (`/sun-kudos`, `/community-standards`, `/profile`, `/admin`).
4. Extend E2E: click logo (scroll-to-top), click each nav target, assert URL.

### Phase 5: User Story 4 (P2) — Event info block

(Delivered alongside Phase 2's `<EventInfo>`; just confirm responsive wrapping
behaviour.)

### Phase 6: User Story 5 (P2) — Language switch

1. Failing `language-menu.test.tsx`: dropdown open/close, VN/EN options, server
   action call on selection.
2. Implement `<LanguageMenu>` (client component) backed by `actions/set-locale.ts`.
3. Internally delegate the existing `HeaderLanguageSwitch` to `<LanguageMenu>` so
   the Login screen also gets a working switch (resolves a deferred Login Phase 6
   task in passing).
4. Extend E2E: switch VN ↔ EN, assert hero subtitle + footer copyright re-render.

### Phase 7: User Story 6 (P2) — Account avatar dropdown

1. Failing `account-menu.test.tsx`: regular user → 2 items, admin → 3 items, sign-out
   form action.
2. Implement `<AccountMenu>`. Role gating: read `currentUser.role` (currently always
   `"user"` until role assignment is added — see Open Questions).
3. Wire into `<AppHeader>`.
4. Extend E2E: open menu, assert items per role, sign-out → land on `/login`.

### Phase 8: User Story 7 (P2) — Sun\* Kudos block

1. Implement `<SunKudosBlock>` (server component) reading dictionary copy and image.
2. CTA is a server `<Link href="/sun-kudos">`.
3. Extend E2E: click "Chi tiết" → land on `/sun-kudos` placeholder.

### Phase 9: User Story 8 (P3) — Notification bell stub

1. Implement `<NotificationBell>`: bell icon + badge driven by `unreadCount` prop.
2. For MVP the page passes `unreadCount={0}` unconditionally; clicking the bell is
   a no-op (with a `console.warn` so engineers know the panel spec is pending).
3. Hide the bell entirely when `currentUser` is null.

### Phase 10: User Story 9 (P3) — Floating widget

1. Implement `<FloatingWidget>` with two stub menu items linking to `/profile`
   and `/community-standards` for now. Real items land with the Widget spec.

### Phase 11: Footer (component, no new US)

1. Implement `<AppFooter>` with logo + 4 nav links + copyright.
2. Compose into `<HomepageScreen>`.

### Phase 12: Polish

- A11y: keyboard focus rings, dropdown arrow-key navigation, `Esc` close, ARIA on
  the bell badge.
- Loading skeleton for the hero asset (`priority` set on `next/image`).
- Update README with the homepage env var checklist.
- Final acceptance: `npm run lint && npm run typecheck && npm run build && npm run test && npm run test:e2e`.

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Public-vs-authenticated decision is reversed mid-build | Medium | Medium | Decision recorded in this plan + a single middleware change controls it; reversing is one PR. |
| Award slugs differ from the Awards Information frame's anchors | Medium | Low | Plan uses derived slugs; the *Awards Information* spec, when authored, MUST be reconciled in a small follow-up PR. |
| Countdown drift from client clock skew | Low | Low | Server passes `eventStartAt` epoch-ms; client computes deltas locally. ID-39 budget allows ≤ 2 s drift / minute. |
| `HeaderLanguageSwitch` upgrade breaks the existing Login layout | Medium | Low | Keep the same external API; only the internal implementation changes. Visual regression caught by Playwright. |
| Notification bell stub causes user confusion | Low | Low | Bell click is a no-op; no badge appears for MVP. Real wiring comes with the Notification panel spec. |
| Asset overlap with Login causes drift | Medium | Low | Re-use `public/assets/login/{logos|icons}/...` directly when the node ID matches. |

### Estimated complexity

- **Frontend**: Medium-High (many components, role-gated chrome, language menu upgrade).
- **Backend**: Low (no new public endpoints; one server action; one env reader).
- **Testing**: Medium (component tests + role-driven integration + E2E nav suite).

---

## Integration Testing Strategy

### Test scope

- **Component/Module interactions**:
  - `<HomepageScreen>` ↔ `getCurrentUser`, `getLocale`, `getEvent`, `getAwardCatalog`.
  - `<AppHeader>` ↔ `<LanguageMenu>` ↔ `setLocale` server action.
  - `<AccountMenu>` ↔ `currentUser.role` ↔ `<form action="/auth/sign-out">`.
  - `<EventCountdown>` ↔ event datetime epoch.
- **External dependencies**: none new.
- **Data layer**: locale cookie, session JWT cookie (read-only here).
- **User workflows**: public visit → authed visit → language switch → sign out.

### Test categories

| Category | Applicable? | Key Scenarios |
|----------|-------------|---------------|
| UI ↔ Logic | Yes | Card click → URL with anchor; menu open/close; countdown tick. |
| Service ↔ Service | Yes | `set-locale` action → cookie set + redirect. |
| App ↔ External API | No | No external APIs in scope. |
| App ↔ Data Layer | Yes | Locale + session cookies. |
| Cross-platform | Yes | Awards grid 3-col desktop / 2-col tablet/mobile (ID-15/16). |

### Mocking strategy

| Dependency Type | Strategy | Rationale |
|-----------------|----------|-----------|
| `getCurrentUser` | Mock to `null` / `user` / `admin` shapes | Drives chrome decisions; pure function of cookie. |
| `getEvent` | Real env via test setup | Pure parsing; trivial to set `process.env`. |
| `getAwardCatalog` | Real | Pure dictionary lookup. |
| `setLocale` server action | Real | Cookies API works in Node test env; same pattern as Login's auth-callback test. |
| `next/headers` cookies | Mock for integration | Same `vi.mock` pattern as the Login auth-callback test. |
| OAuth | Out of scope | Not exercised by the Homepage; covered by Login test suite. |

### Test scenarios outline

1. **Happy path**
   - [ ] Unauthenticated visit → public homepage renders with no bell/avatar.
   - [ ] Authenticated visit → homepage renders bell (no badge for MVP) + avatar dropdown trigger.
   - [ ] Hero shows live countdown matching the env value (delta within ±2 s after a minute tick).
   - [ ] All six award cards render with correct titles + slugs.
2. **Error handling**
   - [ ] Invalid `EVENT_START_AT` → fallback dashes, no crash.
   - [ ] `getCurrentUser` throws (e.g., malformed JWT) → treat as null, render public chrome.
3. **Edge cases**
   - [ ] Admin user → AccountMenu includes "Admin Dashboard".
   - [ ] Language switch persists across reload (cookie set).
   - [ ] Click outside / `Esc` closes any open dropdown.
   - [ ] Award card with missing slug navigates to `/awards-information` without anchor.

### Tooling & framework

- Vitest + Testing Library + jsdom (unit/integration), Playwright (E2E) — already in
  place from the Login PR. The auth-callback test already uses
  `// @vitest-environment node` for jose; the integration tests here will follow the
  same per-file directive when they touch `next/headers` cookie mutations.

### Coverage goals

| Area | Target | Priority |
|------|--------|----------|
| `lib/awards/*` | 95%+ | High |
| `lib/events/*` | 95%+ | High |
| `actions/set-locale.ts` | 100% (line + branch) | High |
| `components/homepage/*` | 80%+ | High |
| `components/layout/app-*` | 80%+ | High |
| `components/layout/account-menu.tsx` | 90%+ | High (role gate) |
| Notification bell / floating widget stubs | 50%+ | Medium |

---

## Dependencies & Prerequisites

### Required before start

- [x] `constitution.md` reviewed (v1.2.0)
- [x] `spec.md` approved by stakeholders *(self-approved by user — confirm)*
- [ ] Public-vs-authenticated access decision **resolved** — see Open Questions
- [ ] `EVENT_START_AT` confirmed by the campaign owner
- [ ] Sun\*-domain assumption for placeholder routes (`/awards-information` etc. are
  publicly visible per the spec recommendation)

### External dependencies

- None (no new third-party services).

---

## Open Questions

- [ ] **Public vs auth-gated homepage** — RECOMMENDED: keep the homepage public (per
  ID-0). Confirm with stakeholders. If reversed, drop `/` from the middleware public
  list and re-introduce the `redirect('/login')` in `app/page.tsx`.
- [ ] **Role assignment** — `currentUser.role` is currently not produced by
  `getCurrentUser` (the Login PR only stores `userId`, `email`, `displayName`,
  `avatarUrl`, `domain`). For MVP, treat every user as `"user"` and ship the admin
  dropdown variant when role assignment is added (probably another env var for
  `ADMIN_EMAILS` or a `users.role` column once persistence lands).
- [ ] **Award slugs** — derived from titles for MVP; reconcile with the *Awards
  Information* spec when authored.
- [ ] **Sun\* Kudos route name** — assumed `/sun-kudos`; confirm with the live-board
  spec.
- [ ] **Notification panel target** — `6-1LRz3vqr` vs `gWBVcaSVIf`. Bell click is a
  no-op until this is resolved.
- [ ] **Widget menu items** — the Widget spec (TBD) decides; for MVP we ship two
  placeholder links.
- [ ] **CI gate** — Playwright job's expectation for headless run on CI (real
  Supabase replaced by direct Google OAuth which is harder to mock end-to-end). E2E
  for the homepage is mostly anonymous so it's straightforward; the auth path stays
  the Login PR's responsibility.

---

## Next Steps

After plan approval:

1. **Run** `/momorph.tasks` to generate the task breakdown (will skip the
   `design-style.md` gate per the documented violation, same as Login).
2. **Confirm** the Public-vs-authenticated decision before implementation begins.
3. **Begin** Phase 0 (assets) and Phase 1 (foundation) — both have no UI and can
   land in parallel.

---

## Notes

- **Reuse first**: the Login PR shipped `Header`, `Footer`, `HeaderLanguageSwitch`,
  `getCurrentUser`, `getLocale`, the auth-service, and the middleware. This plan
  introduces *parallel* `app-header.tsx` / `app-footer.tsx` rather than mutating the
  Login chrome to keep blast radius small. The `LanguageMenu` upgrade is the one
  shared change — it improves Login as a side effect.
- **Asset overlap**: the SAA logo, Root Further hero PNG, Google icon, language flag,
  and chevron are already downloaded under `public/assets/login/`. Where the Figma
  node ID matches, re-use those paths rather than duplicating. New assets specific
  to the Homepage (bell, avatar default, six award thumbnails, kudos banner, widget
  icons) go under `public/assets/homepage/`.
- **Spec discrepancy reconciliation**: when the Awards Information spec is authored,
  expect a small follow-up PR adjusting slugs and (optionally) replacing the
  placeholder route with the real page.
- **Visual fidelity** (per Constitution Principle IV): all colours/spacing/typography
  for the new components MUST be sourced via `mcp__momorph__query_section` against
  the relevant Node ID at implementation time. New tokens land in
  [`app/globals.css`](../../../app/globals.css) with one-line rationale comments.
