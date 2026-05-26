# Implementation Plan: Sun* Kudos — Live Board

**Frame**: `MaZUn5xHXZ-Sun-Kudos-Live-board` (root node `2940:13431`)
**Date**: 2026-05-18
**Spec**: [`spec.md`](./spec.md)
**Screenflow detail**: [`../../contexts/SCREENFLOW.md`](../../contexts/SCREENFLOW.md) (row 5)
**Constitution**: [`../../constitution.md`](../../constitution.md) (v1.2.0)
**Reuses from**: Login (`../GzbNeVGJHz-Login/`), Homepage SAA (`../i87tDx10uM-Homepage-SAA/`), Awards Information (`../zFYDgyj_pD-He-thong-giai/`)

---

## Summary

Build the **Sun\* Kudos — Live Board** page at route **`/sun-kudos`**
(already wired as a placeholder) — the social recognition feed for SAA
2025. Anonymous visitors are redirected to login (same pattern as Awards
Information). The page composes:

1. **Keyvisual** banner (text + logo overlay, reuses the established
   keyvisual pattern).
2. Shared **`<AppHeader>`** with `currentPath=/sun-kudos`.
3. **A.1 Send-Kudos pill** that triggers the (out-of-scope) `Viết Kudo`
   dialog.
4. **Highlight band** = `B.1` filters (Hashtag + Phòng ban) + `B.2`
   top-5 carousel + `B.5` pager.
5. **Spotlight word cloud** (`B.7`) with pan/zoom, search, hover
   tooltip, click-to-detail, and a live total-count label.
6. **All Kudos feed** (`C.2`) — infinite scroll of `KUDOpost` cards.
7. **Sidebar (D)** — user stats, "Mở quà" Secret-Box button, and two
   leaderboards.
8. Shared **`<AppFooter>`**.

The page is **auth-gated**: anonymous → `/login?returnTo=/sun-kudos`.

**Persistence is unblocked via local mock route handlers** (in-memory
seed) so the UI ships before the project picks an ORM (constitution
TODO(APP_DATA_PERSISTENCE)). The interface contracts in this plan match
the predicted endpoints in `spec.md` so swapping in a real DB is
mechanical.

The 6 user stories from the spec are sliced into 4 vertical phases (US1
+ US3 are P1 must-have; US2 wires the dialog trigger; US4–US6 enrich;
US7 + US8 polish).

---

## Technical Context

| Item | Choice |
|---|---|
| **Route** | `/sun-kudos` (already declared; `app/sun-kudos/page.tsx` placeholder will be replaced) |
| **Auth** | Required. Anonymous → `/login` via existing middleware once the route is removed from the public list. |
| **Framework** | TypeScript 5 (strict) / Next.js 16 App Router / React 19 |
| **Styling** | Tailwind CSS v4 + CSS variables in `app/globals.css` |
| **Data fetching (read)** | `swr` + `useSWRInfinite` (new dep — see Violations) for infinite scroll, cache invalidation, optimistic mutations |
| **Mutations** | `swr` mutate + native `fetch`; server enforces all business rules (no client-only validation) |
| **Word cloud** | `@visx/wordcloud` (new dep — see Violations) — d3-cloud algorithm wrapped for React |
| **Pan / zoom** | Hand-rolled wrapper over a `<svg>` viewBox + pointer events (no new dep). Falls back to `react-zoom-pan-pinch` if pointer math proves brittle. |
| **Lightbox** | Hand-rolled minimal dialog (`<dialog>` element + Esc / overlay click). Avoids a 30kB lib for one use site. |
| **Clipboard** | `navigator.clipboard.writeText` with `document.execCommand("copy")` fallback for old browsers |
| **Carousel** | Hand-rolled `transform: translateX` slide-track + 2 buttons + pager. Five fixed slides; full lib unnecessary. |
| **State management** | Mostly server state via SWR; small local `useState` for dialog open/draft, carousel index, pan/zoom transform |
| **URL state** | `?hashtag=`, `?department=` query params (per spec TR-005); read in Server Component and passed to client |
| **Testing** | Vitest + Testing Library + jsdom for unit/integration; Playwright for E2E (configs already in place) |
| **i18n** | Extend `lib/i18n/dictionary.ts` with a `kudos` namespace |
| **Backend mock** | Route handlers under `app/api/kudos/*` backed by an in-memory store in `lib/kudos/store.ts`, seeded from `lib/kudos/seed-data.ts`. Module-scope `Map`; replaced by ORM in a follow-up. |

---

## Constitution Compliance Check

*GATE: Must pass before tasks can be generated.*

| Requirement | Constitution Rule | Status |
|---|---|---|
| Spec exists & traces to Figma | I — Spec-Driven Development | ✅ Compliant — `spec.md` derived from `MaZUn5xHXZ` |
| Navigation sourced from SCREENFLOW.md | I — Spec-Driven Development | ✅ Compliant — row 5 added, profile/kudos-detail flagged TBD |
| Tests written before implementation | II — Test-First (NON-NEGOTIABLE) | 📋 Planned — every API contract + every state-bearing component gets a Vitest spec before code |
| Layered architecture (`route → controller → service → repo`) | III — Layered Architecture | 📋 Planned — `app/api/kudos/[...]/route.ts` → `lib/kudos/service.ts` → `lib/kudos/store.ts` |
| Design tokens, no hex / px magic | IV — Design Tokens | 📋 Planned — extend `app/globals.css` with any new tokens; no inline hex in components |
| TS strict, ESLint clean, conventions | V — Type Safety | ✅ Compliant — no `any`; all new files kebab-case modules, PascalCase components |
| `npm run build`, `npm run lint`, `npm run test` pass | V — Quality gate | 📋 Planned at end of each phase |
| Auth gating server-enforced | I + V + Security | 📋 Planned — route handlers re-check `getCurrentUser`, never trust client claims |

### Violations

| Violation | Justification | Alternative Rejected |
|---|---|---|
| **Plan written before `design-style.md`** | Same as Login / Homepage / Awards Information: visual specs are fetched on-demand from Figma at implementation per Principle IV. Frozen `design-style.md` rots fast. | Generating a duplicated CSS dump that lives forever |
| **Plan written before `BACKEND_API_TESTCASES.md`** | No real backend exists yet (`APP_DATA_PERSISTENCE` is a constitution TODO). Mock route handlers in this plan define the contract; once persistence is chosen, the `BACKEND_API_TESTCASES.md` is generated from these handlers. | Blocking the page indefinitely on backend decisions |
| **New dep: `swr` (~3kB gz)** | Highlight, All Kudos, and Spotlight share a `(hashtag, department)` cache key family. Heart toggle invalidates all three. Send-Kudos invalidates the feed and the sender stats. Hand-rolling this multi-key invalidation with native `fetch + useState` is error-prone — `useSWRInfinite` + `mutate` is purpose-built. | Native `fetch` + custom hooks: more code, more risk of stale cache; TanStack Query: ~13kB, heavier than needed |
| **New dep: `@visx/wordcloud` (~25kB gz)** | Word-cloud collision-free placement is non-trivial; d3-cloud is the canonical algorithm. `@visx/wordcloud` wraps it for React without dragging the full d3 toolkit. | Hand-rolled placement: ~500 LOC + visual-tuning churn; `react-d3-cloud`: less maintained; raw `d3-cloud` + React glue: same wrap @visx provides for free |
| **Mock backend (`lib/kudos/store.ts`)** | Persistence is a constitution TODO. The mock follows Principle III boundaries (route → service → store), so swapping to a real ORM only touches `store.ts`. | Blocking UI on backend decision: pages still need to ship |
| **Modifying middleware (`PUBLIC_ROUTE_PREFIXES`)** | Spec FR-001 requires auth gating; current state lists `/sun-kudos` as public placeholder. Same pattern that landed for `/awards-information` in the Awards plan — already exercised. | Keeping public: contradicts spec; gating in the page only: defeats the middleware layer |

> **No deviations from i18n flow, no new auth library, no new styling system, no new test framework.** Stack pin in constitution §"Technology Stack & Constraints" remains in force.

---

## Architecture Decisions

### Resolutions for spec's flagged "NEEDS CONFIRMATION" items

The spec lists 12 open questions. Plan-level resolutions (revisit with PM before/during implementation):

| # | Question | **Decision** | Rationale |
|---|---|---|---|
| 1 | Phòng ban filter scope (sender / recipient / either) | **Either** | Maximizes recall; matches the "filter to see Marketing's Kudos activity" mental model |
| 2 | Spotlight node click target | **Most-recent Kudos detail for that recipient** | Simplest deterministic mapping; node click ≈ "see what this person was thanked for most recently" |
| 3 | Spotlight scope under Hashtag/Phòng ban filter | **Rescope** | Consistent with the rest of the page: filters apply universally |
| 4 | Profile route | **`/sunner/[userId]`** | Pending Profile spec; documented as the inferred default so implementation isn't blocked |
| 5 | Kudos detail route | **`/sun-kudos/[kudosId]`** | Pending Kudos-detail spec; the route is a child of the feed page |
| 6 | "Mở quà" button — disabled vs hidden when 0 pending | **Disabled with tooltip** | Discoverability: user learns the feature exists |
| 7 | Hashtag overflow (>5 on a card) | **Clip with `+N more` chip** | Keeps card height stable; `+N` opens the kudos detail |
| 8 | Special-day +2 hearts — where counted | **Sender's leaderboard stat only**; card counter still increments by **+1 per click** | Card counter = unique-likers count (the social signal). Leaderboard hearts = gamified currency. Spec FR-008 only mandates the leaderboard credit. |
| 9 | Long Sunner name in Spotlight | **Truncate to 18 chars with `…`** | Hover tooltip still shows the full name |
| 10 | Mobile / tablet | **Desktop-first; out of scope for v1** | Single-frame Figma; responsive ships in a follow-up |
| 11 | D.4 category chip vs B.4.3 hashtag chip | **Same behavior — set Hashtag filter** | One mental model |
| 12 | Two leaderboard lists in sidebar | **Render only D.3 "10 SUNNER NHẬN QUÀ MỚI NHẤT"** in v1. **"10 SUNNER thăng hạng"** is referenced in design notes but not enumerated — defer until a node tree exists. | Avoids implementing a list with no source-of-truth fields |

### Resolutions for spec's edge cases

- **Special-day card counter** — increments by `+1` per click (one-like-per-user); only the sender's leaderboard heart accumulator is +2. Server enforces both.
- **Optimistic heart on error** — flip back, surface `Could not save your reaction. Try again.` toast.
- **Send-Kudos on error** — keep dialog open with inline error.
- **Empty filter result** — both Highlight and All Kudos show the empty copy; Spotlight rescopes empty.

### Frontend approach

#### Page composition (server-rendered shell + client islands)

```
app/sun-kudos/page.tsx       (Server Component — auth gate, dictionary, initial filter)
└── <SunKudosPage>           (Server Component composition — same pattern as <AwardsPage>)
    ├── <AppHeader currentPath="/sun-kudos" />
    ├── <KudosKeyvisual />
    ├── <KudosSendInputPill />            client — opens external dialog
    ├── <KudosHighlightBand>              client — SWR + filters + carousel
    │   ├── <KudosFilterDropdowns />      client — Hashtag + Phòng ban
    │   ├── <KudosHighlightCarousel />    client — top-5 carousel
    │   └── <KudosCard variant="highlight" />  shared
    ├── <KudosSpotlight />                client — @visx/wordcloud + pan/zoom + search
    ├── <KudosAllList>                    client — useSWRInfinite
    │   └── <KudosCard variant="post" />  shared
    ├── <KudosSidebar />                  client — stats + leaderboard + Secret Box
    └── <AppFooter currentPath="/sun-kudos" />
```

The shell is a Server Component so initial paint is fast; SWR clients hydrate after.

#### Shared card component

`<KudosCard>` renders both Highlight and Post variants via a `variant` prop. Both share:
- `<SenderRecipientBlock>` (avatar + name + stars + title), reused twice with `direction="sender" | "recipient"`.
- `<HashtagChipRow>` with `+N more` overflow.
- `<KudosActionBar>` (Heart + Copy Link + optional "Xem chi tiết" in Highlight).

#### Filters in URL state

- `?hashtag=` and `?department=` are read in the Server Component and threaded into the client islands as initial values; client updates push back via `history.pushState`.
- Carousel index resets to 0 on filter change.
- Hashtag-chip click sets `?hashtag=` and clears `?department=` (per spec FR-006 — one Hashtag at a time).

#### Optimistic mutations

- **Heart toggle**: flip local `isHeartedByCurrentUser`, `heartsCount ± 1`, then `POST /api/kudos/:id/heart`. On failure, revert + toast.
- **Send Kudos**: server returns the canonical record; client prepends to the feed via `swr.mutate(["/api/kudos/feed", filters])`.

### Backend approach (mock layer)

Layered per constitution Principle III:

```
app/api/kudos/feed/route.ts        ← thin: parses query + auth, calls service
   └─ lib/kudos/service.ts          ← list/highlight/spotlight/send/heart/openBox business logic
       └─ lib/kudos/store.ts         ← in-memory Map<UserId|KudosId, ...>, seeded once
```

- Auth: each route reads `getCurrentUser()`. If null, `401`.
- Validation: a single shared `zod` schema per request body — **wait**, `zod` is not currently in the project. To avoid a new dep, hand-rolled validators in `lib/kudos/validators.ts` (small surface area).
- Seed data: `lib/kudos/seed-data.ts` — 60–80 representative kudos across ~30 mock Sunners and ~12 hashtags + 6 departments, loaded once at module init.
- Specials: a hard-coded `SPECIAL_DAYS = new Set<string>([...])` env-overridable list to exercise FR-008. (Replaced by an admin table in v2.)

> **Mock store is single-process, ephemeral.** It is fine for the campaign demo and Playwright runs. For production, the store gets replaced by an ORM-backed repository sharing the same `KudosRepository` interface.

### Integration points

- **Existing services**: `getCurrentUser` (session.ts), `isAdminEmail` (admin-roles.ts), `getLocale`, `getHomepageDictionary` (header chrome strings) — same trio that `/awards-information` uses.
- **Shared components**: `<AppHeader>`, `<AppFooter>`, `<AccountMenu>`, `<NotificationBell>` — already wired with notification badge support.
- **Existing assets**: `keyvisual-bg.png` (reuse for Kudos keyvisual). Kudos-specific media (logo `SAA 2025 KUDOS`, Mở quà icon, default avatar fallback) fetched in Phase 0.
- **API contracts**: defined inline in `lib/kudos/service.ts` types; downstream `BACKEND_API_TESTCASES.md` will be generated when the real DB lands.

---

## Project Structure

### Documentation (this feature)

```text
.momorph/specs/MaZUn5xHXZ-Sun-Kudos-Live-board/
├── spec.md              # Done
├── plan.md              # This file
├── tasks.md             # Next (momorph.tasks)
└── (no design-style.md, no research.md — see Violations)
```

### Source code

```text
app/
├── api/kudos/                              NEW
│   ├── feed/route.ts                       GET — paged feed
│   ├── highlight/route.ts                  GET — top 5
│   ├── spotlight/route.ts                  GET — word-cloud nodes
│   ├── hashtags/route.ts                   GET — dropdown options
│   ├── departments/route.ts                GET — dropdown options
│   ├── route.ts                            POST — send Kudos
│   ├── [kudosId]/heart/route.ts            POST — toggle heart
│   └── secret-boxes/open/route.ts          POST — open box
├── api/users/me/route.ts                   NEW — sidebar stats (or extend existing if present)
└── sun-kudos/
    └── page.tsx                            REWRITE — replaces placeholder

components/kudos/                           NEW
├── sun-kudos-page.tsx                      composition (server)
├── kudos-keyvisual.tsx                     hero banner
├── kudos-send-input-pill.tsx               client — opens dialog
├── kudos-highlight-band.tsx                client — SWR + filters + carousel container
├── kudos-filter-dropdowns.tsx              client — Hashtag + Phòng ban
├── kudos-highlight-carousel.tsx            client — hand-rolled 5-slide carousel
├── kudos-card.tsx                          shared variant component
├── kudos-card-sender-recipient.tsx         sub-component
├── kudos-card-hashtags.tsx                 sub-component with +N overflow
├── kudos-card-action-bar.tsx               sub-component (Heart, Copy)
├── kudos-spotlight.tsx                     client — @visx/wordcloud + pan/zoom
├── kudos-spotlight-search.tsx              client — search input (max 100 chars)
├── kudos-all-list.tsx                      client — useSWRInfinite
├── kudos-sidebar.tsx                       client — stats + leaderboard + box
├── kudos-secret-box-button.tsx             client — disabled vs enabled
└── kudos-image-lightbox.tsx                client — minimal <dialog>

hooks/                                      EXTEND
├── use-kudos-feed.ts                       NEW — useSWRInfinite wrapper
├── use-kudos-heart.ts                      NEW — optimistic mutation
├── use-clipboard-copy.ts                   NEW — copy + toast helper
└── use-kudos-filters.ts                    NEW — URL ↔ filter state

lib/kudos/                                  NEW
├── catalog.ts                              (if needed) static lists
├── seed-data.ts                            ~80 kudos + ~30 sunners + ~12 hashtags + 6 departments
├── store.ts                                in-memory repository
├── service.ts                              business logic (heart toggle, special-day +2, self-block, ranking)
├── validators.ts                           hand-rolled request validation
└── types.ts                                Kudos, SunnerProfile, Hashtag, Department, SpecialDay, SecretBox, SpotlightNode, FeedCursor

lib/i18n/dictionary.ts                      EXTEND — add `kudos` namespace (placeholders, empty messages, button labels, toasts)
lib/auth/return-to.ts                       (already supports /sun-kudos via existing path validator — no change)

middleware.ts                               MODIFY — remove "/sun-kudos" from PUBLIC_ROUTE_PREFIXES

components/layout/app-footer.tsx            CHECK — confirm `/sun-kudos` highlights correctly (already a known target)
components/layout/app-header.tsx            CHECK — confirm `/sun-kudos` highlights correctly

public/assets/sun-kudos/                    NEW
├── images/keyvisual-text.png               "Hệ thống ghi nhận lời cảm ơn" + "SAA 2025 KUDOS" overlay
├── icons/pencil.svg                        A.1 pencil
├── icons/heart-outline.svg                 heart unfilled
├── icons/heart-filled.svg                  heart filled (uses --color-saa-cta-bg)
├── icons/copy-link.svg
├── icons/secret-box.svg                    D.1.8 "Mở quà"
├── icons/pan.svg / zoom.svg / search.svg
├── icons/star-1.svg / star-2.svg / star-3.svg     hoa thị tiers
└── images/avatar-placeholder.svg

tests/                                      NEW
├── unit/
│   ├── kudos/
│   │   ├── service-heart.test.ts           +2 special-day, self-block, toggle
│   │   ├── service-send.test.ts            required-body, returns canonical record
│   │   ├── service-list.test.ts            filter scoping (hashtag, department)
│   │   ├── store.test.ts                   seed integrity, IDs unique
│   │   ├── validators.test.ts              hashtag/department whitelist, max chars
│   │   └── catalog.test.ts                 if added — same pattern as awards-catalog
│   ├── kudos-filters-url.test.ts           hook URL ↔ state sync
│   ├── kudos-clipboard.test.ts             copy + fallback path
│   └── kudos-card.test.tsx                 renders both variants, heart disabled for self
├── integration/
│   ├── kudos-feed-route.test.ts            GET /api/kudos/feed pagination + filter
│   ├── kudos-heart-route.test.ts           POST /api/kudos/:id/heart (toggle, self-block, special-day)
│   └── sun-kudos-page-auth.test.ts         anonymous → /login redirect
└── e2e/
    ├── kudos-read.spec.ts                  US1 — load page, see feed
    ├── kudos-heart.spec.ts                 US3 — toggle heart, copy link
    └── kudos-filter.spec.ts                US4 — hashtag chip → list scopes
```

### Dependencies

| Package | Version | Purpose | Justified in Violations |
|---|---|---|---|
| `swr` | ^2.2 | Infinite scroll feed + multi-key cache invalidation + optimistic heart | ✅ |
| `@visx/wordcloud` | ^3.x | Spotlight word-cloud layout (d3-cloud algorithm) | ✅ |

No other new deps. Pan/zoom, lightbox, carousel are hand-rolled.

---

## Implementation Strategy

### Phase 0 — Asset preparation

- Fetch all Kudos-specific media nodes from Figma (`mcp__momorph__list_media_nodes` on `MaZUn5xHXZ`).
- Download via `mcp__momorph__get_media_files` into `public/assets/sun-kudos/{icons,images}/`.
- Audit naming/size; commit the assets.

### Phase 1 — Setup & Foundation

1. Install `swr` + `@visx/wordcloud`.
2. Create `lib/kudos/types.ts`, `seed-data.ts`, `store.ts`, `service.ts`, `validators.ts` with **failing unit tests first** (TDD per Principle II).
3. Add `kudos` namespace to `lib/i18n/dictionary.ts` (vi + en).
4. Remove `/sun-kudos` from `PUBLIC_ROUTE_PREFIXES` in `middleware.ts`. Update existing `tests/unit/middleware.test.ts` (if any) to assert the new gate.
5. Replace `app/sun-kudos/page.tsx` placeholder with a minimal auth-gated stub that renders the chrome (`AppHeader` + `AppFooter`) — verifies the gate works before we add features.

### Phase 2 — User Story 1 (P1): Read the live Kudos feed

1. Implement route handlers `feed`, `highlight`, `hashtags`, `departments`, `spotlight` (all GET, all 401 if unauthenticated).
2. Implement `<KudosCard>` (post variant first), `<SenderRecipientBlock>`, `<HashtagChipRow>`, `<KudosActionBar>` (read-only stub for now).
3. Implement `<KudosAllList>` with `useSWRInfinite`.
4. Implement `<KudosHighlightBand>` + `<KudosHighlightCarousel>` + `<KudosFilterDropdowns>` (filter wiring deferred to Phase 4).
5. Implement `<KudosSpotlight>` (display-only, no pan/zoom/search yet).
6. Wire `<KudosKeyvisual>` + `<KudosSendInputPill>` (pill is non-functional — clicking does nothing in Phase 2).
7. **Acceptance**: opening `/sun-kudos` as an authed user shows the feed populated from the mock seed; carousel arrows work; logged-out users → `/login`.

### Phase 3 — User Story 3 (P1): Heart + Copy Link

1. Implement `POST /api/kudos/:id/heart` with self-block + toggle + special-day server logic.
2. Implement `use-kudos-heart` hook (optimistic flip + revert on 4xx/5xx).
3. Wire heart button in `<KudosActionBar>`.
4. Implement `use-clipboard-copy` + toast (reuse existing toast if one exists; otherwise add a minimal one in `components/feedback/`).
5. Add "Copy Link" wiring.

### Phase 4 — User Story 2 (P1, dialog trigger only)

1. Wire `<KudosSendInputPill>` to open the (out-of-scope) `Viết Kudo` dialog. Until that screen exists, the pill links to `/viet-kudo` route (placeholder) which is a separate spec.
2. Add `POST /api/kudos` route handler (so the dialog spec can plug in directly).
3. On successful `POST`, the calling code (lives in the dialog) calls `swr.mutate(["/api/kudos/feed", filters])`.

### Phase 5 — User Story 4 (P2): Filters

1. Implement `use-kudos-filters` (URL ↔ state).
2. Wire `<KudosFilterDropdowns>` (Hashtag + Phòng ban) and hashtag-chip click handlers in `<KudosCard>`.
3. Pass filter into `feed`, `highlight`, `spotlight` SWR keys → server-side filtering already implemented in Phase 2.
4. Empty-state copy when filter yields zero.

### Phase 6 — User Stories 5 + 6 (P2): Carousel polish + Spotlight interactivity

1. Carousel: disable prev on slide 0, next on slide N-1; sync `B.5` pager label.
2. Spotlight: implement pan/zoom (svg `viewBox` math + pointer events).
3. Spotlight: implement `Pan/Zoom` toggle button.
4. Spotlight: hover tooltip (recipient name + most-recent timestamp).
5. Spotlight: search input (max 100 chars, empty rejected, focuses matching node).
6. Spotlight: node click → `/sun-kudos/[kudosId]` (placeholder route; real detail page is a separate spec).

### Phase 7 — User Story 7 + 8 (P3): Sidebar + drill-in navigation

1. Implement `<KudosSidebar>` stats + 10-recent-gifts leaderboard.
2. Implement `<KudosSecretBoxButton>` (`Mở quà`) → opens dialog (placeholder until Secret Box screen exists).
3. Wire avatar/name clicks → `/sunner/[userId]` (placeholder route).
4. Wire image gallery thumbnails → `<KudosImageLightbox>`.

### Phase 8 — Polish

- ARIA pass (carousel `aria-current`, heart `aria-pressed`, dropdown `aria-expanded`, toast `role="status"`).
- `prefers-reduced-motion`: disable carousel slide animation, Spotlight pan inertia.
- Loading skeletons for slow networks.
- Error boundary for the page (graceful degradation if `/api/kudos/feed` fails).
- Verify `npm run lint && npm run typecheck && npm run test && npm run build` clean.

### Risk Assessment

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| `@visx/wordcloud` produces visually-different layout from Figma | Medium | Medium | Tune `padding`, `rotate`, `fontSize` until close; accept "spirit of" match — Figma word cloud is illustrative, not pixel-fixed |
| Pan/zoom hand-roll is brittle on touchpads | Medium | Low (desktop-first) | Fall back to `react-zoom-pan-pinch` if QA fails |
| Mock store loses data on dev server reload | High | Low | Document; not a regression target |
| Send-Kudos dialog not yet built — pill click has nothing to open | High | Medium | Pill links to a placeholder `/viet-kudo` route; full integration after the dialog spec lands |
| Profile + Kudos-detail routes not yet specified | High | Medium | Use placeholder URLs; document as inbound TBD in `SCREENFLOW.md` (already flagged) |
| Heart-toggle race condition on rapid clicks | Low | Low | Debounce 200ms client-side + idempotent server (state-set rather than increment) |
| Special-day +2 leaderboard math drifts from spec | Low | High | Server-only; unit tests cover the +1 vs +2 cases (`service-heart.test.ts`) |
| Bundle size grows beyond Homepage budget | Medium | Low | `swr` + `@visx/wordcloud` ≈ 28kB gz; well below the 200kB initial-route budget |

### Estimated Complexity

- **Frontend**: High — many discrete interactive surfaces (feed, carousel, spotlight, dropdowns, sidebar, lightbox); two new deps to learn.
- **Backend (mock)**: Medium — small surface area, but ranking and special-day rules need careful tests.
- **Testing**: High — TDD pass covers heart toggle edge cases, filter scoping, infinite-scroll cursor handling, auth gating.

---

## Integration Testing Strategy

### Test Scope

- [x] **Component / module interactions**: `<KudosAllList>` ↔ `useSWRInfinite` ↔ `/api/kudos/feed`; `<KudosCard>` heart button ↔ `use-kudos-heart` ↔ `POST /:id/heart`; `<KudosFilterDropdowns>` ↔ URL ↔ feed cache key.
- [x] **External dependencies**: none in v1 (mock store is internal).
- [x] **Data layer**: `lib/kudos/store.ts` ↔ `service.ts` ↔ route handlers.
- [x] **User workflows**: load → scroll → heart → filter → see scoped result.

### Test Categories

| Category | Applicable? | Key Scenarios |
|---|---|---|
| UI ↔ Logic | Yes | Heart toggle optimistic + rollback; hashtag chip click sets URL; carousel arrow disabled at ends |
| Service ↔ Service | No | Single-process mock |
| App ↔ External API | No | None until real backend |
| App ↔ Data Layer | Yes | Store seeded; service rules (self-block, special-day +2) |
| Cross-platform | Partial | Desktop-only v1; mobile snapshot tests deferred |

### Test Environment

- **Environment**: Local Vitest (unit/integration with jsdom) + Playwright headless against `next dev` for E2E.
- **Test data**: fixtures co-located in `tests/fixtures/kudos/`. Mock store is **reset between tests** via a `resetStore()` helper that re-seeds from `seed-data.ts`.
- **Isolation**: fresh state per test (store reset in `beforeEach`).

### Mocking Strategy

| Dependency | Strategy | Rationale |
|---|---|---|
| Auth (`getCurrentUser`) | Real wrapped in test-only helper that injects a mock user | Keeps the auth gate honest in tests; only the upstream JWT verification is mocked |
| Clipboard API | Stub `navigator.clipboard.writeText` in jsdom | jsdom doesn't ship the Clipboard API |
| `@visx/wordcloud` | Real, but render hooked in `<div>` for the click/hover smoke tests | Layout pixel positions are not asserted |
| `next/navigation` (`useRouter`, `usePathname`, `useSearchParams`) | `vi.mock` in client-island tests | Standard pattern shared with Awards + Homepage tests |

### Test Scenarios Outline

1. **Happy Path**
   - [ ] Authed user loads `/sun-kudos`; feed paints with seed data; carousel cycles through 5 highlights; word cloud renders ≥1 node.
   - [ ] Heart a Kudos: count +1, button shows filled state, persists after refresh.
   - [ ] Click hashtag chip: URL gets `?hashtag=…`, list rescopes, carousel resets to slide 0.

2. **Error Handling**
   - [ ] `POST /heart` returns 500: optimistic UI reverts, toast shown.
   - [ ] Unauthenticated `GET /feed`: 401, page redirects to `/login`.
   - [ ] Search >100 chars: input rejected with inline error.

3. **Edge Cases**
   - [ ] Empty seed: all three sections show `Hiện tại chưa có Kudos nào.`, sidebar shows `Chưa có dữ liệu`.
   - [ ] Self-heart attempt: button disabled; server rejects 403 if bypassed.
   - [ ] Special-day Kudos: hearted by user A → sender's `heartsReceived` +2; card counter still +1.
   - [ ] Carousel on slide 0: prev disabled; on slide 4: next disabled.

### Tooling & Framework

- **Test framework**: Vitest (unit + integration), Playwright (E2E).
- **Supporting tools**: Testing Library, jsdom, `next-router-mock` (already in deps), `whatwg-fetch` polyfill for Vitest node tests of route handlers.
- **CI integration**: existing pipeline — `npm run lint && npm run typecheck && npm run test && npm run build`; E2E gated by separate workflow.

### Coverage Goals

| Area | Target | Priority |
|---|---|---|
| Heart toggle business rules | 100% | High |
| Filter scoping (feed + highlight + spotlight) | 100% | High |
| Auth gating (anonymous redirect) | 100% | High |
| Cursor pagination | 90%+ | High |
| Carousel + Spotlight interaction smoke | 70%+ | Medium |
| Sidebar / Secret Box (P3) | 60%+ | Low |

---

## Dependencies & Prerequisites

### Required before start

- [x] `constitution.md` v1.2.0
- [x] `spec.md` (this PR)
- [ ] `research.md` — N/A (existing-code patterns from Awards Info + Homepage are sufficient; no novel architecture)
- [ ] API contracts — defined inline in `lib/kudos/service.ts` for v1; formalized in `BACKEND_API_TESTCASES.md` when persistence lands
- [ ] Database migrations — N/A in v1 (in-memory mock)

### External dependencies

- **Send-Kudos dialog** (`Viết Kudo` frame `ihQ26W78P2`) — spec pending. Plan stubs the pill → placeholder route until the dialog ships.
- **Kudos detail page** (route TBD) — placeholder URL `/sun-kudos/[id]`; spec pending.
- **Profile page** (route TBD) — placeholder URL `/sunner/[id]`; spec pending.
- **Secret-Box dialog** (`Open secret box`) — spec pending; "Mở quà" links to a placeholder until ready.

### Internal blockers

- None. All required infrastructure (auth gate, dictionary, header/footer, return-to flow) exists.

---

## Next Steps

After plan approval:

1. **Run** `/momorph.tasks` to generate the task breakdown from this plan.
2. **Review** tasks.md for `[P]` parallelization tags (route handlers, hooks, and pure-data tests can run in parallel; component composition cannot).
3. **Begin** implementation following the Phase 0 → Phase 8 order.

---

## Notes

### Why no real backend in v1

The constitution explicitly lists `APP_DATA_PERSISTENCE` as TODO. Picking
Postgres / Mongo / SQLite + an ORM is a project-wide decision that
shouldn't gate one screen. Mock store keeps the page shippable for
campaign demos and Playwright runs; the layered architecture means the
swap is a single-file replacement of `store.ts`.

### Why hand-roll pan/zoom and lightbox

Each adds ~10–30kB gz for a single mount point. The math is shallow
(`viewBox = "x y w h"` plus pointer-delta tracking) and the visual spec
in Figma is simple. If implementation reveals touchpad gestures are
painful, we'll fall back to `react-zoom-pan-pinch` — flagged as a Phase 6
risk above.

### Why `swr` over `tanstack-query`

Both fit. `swr` is ~3kB and ships with `useSWRInfinite` for cursor
pagination + a simple `mutate` API for cache invalidation, which covers
every server-state need on this page. `tanstack-query` is ~13kB and its
extra power (background refetch policies, query observers) is not needed
here. Smaller stack = smaller bundle = better LCP on the Homepage of
the campaign.

### What's out of scope

Reiterated from spec: Kudos detail page, Profile page, Send-Kudos
dialog, Secret-Box dialog, admin "special day" config UI, mobile/tablet
breakpoints, notification panel content, hashtag autocomplete in the
dialog, star-tier upgrade animations. Each will land via its own
`spec.md` → `plan.md` → `tasks.md` chain.

### Real-time updates

Live "someone hearted your Kudos" or "new Kudos arrived" notifications
are **not** in the spec. SWR's revalidation-on-focus gives near-real-time
freshness without a WebSocket / SSE channel — adequate for v1.
