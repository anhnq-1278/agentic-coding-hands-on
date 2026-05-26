# Tasks: Sun* Kudos — Live Board

**Frame**: `MaZUn5xHXZ-Sun-Kudos-Live-board` (root node `2940:13431`)
**Spec**: [`spec.md`](./spec.md)
**Plan**: [`plan.md`](./plan.md)
**Prerequisites**: spec.md ✅, plan.md ✅, design-style.md ❌ (intentionally absent — see plan §Violations; CSS values fetched on-demand from Figma during implementation)

---

## Task Format

```text
- [ ] T### [P?] [Story?] Description | file/path.ts
```

- **[P]**: Can run in parallel (different files, no incomplete dependencies)
- **[Story]**: User story tag (US1–US8) — required only inside user-story phases
- **|**: File path the task creates or modifies

Test-first ordering is mandatory per **Constitution Principle II**. Inside every
user-story phase, the failing test task MUST be observed red before the paired
implementation task is started.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Dependencies, assets, dictionary, types, mock data — everything that user-story phases will depend on.

- [ ] T001 Install runtime deps: `swr@^2.2`, `@visx/wordcloud@^3` | package.json + package-lock.json
- [ ] T002 [P] Fetch Kudos-specific Figma media via `mcp__momorph__list_media_nodes` on screen `MaZUn5xHXZ`; download into `public/assets/sun-kudos/{icons,images}/` (keyvisual text PNG, pencil, heart-outline, heart-filled, copy-link, secret-box, pan, zoom, search, star-1/2/3, avatar-placeholder) | public/assets/sun-kudos/{icons,images}/
- [ ] T003 [P] Add `kudos` namespace to dictionary (vi + en): keyvisualTitle, sendInputPlaceholder, sendInputAria, filterHashtagLabel, filterDepartmentLabel, allKudosTitle, allKudosEyebrow, spotlightTitle, spotlightEyebrow, spotlightCountLabel, spotlightSearchPlaceholder, viewDetailsLabel, copyLinkLabel, copyLinkToast, heartLabel, emptyKudosMessage, emptyLeaderboardMessage, secretBoxButtonLabel, secretBoxDisabledTooltip, panZoomLabel, sidebarReceivedLabel, sidebarSentLabel, sidebarHeartsLabel, sidebarSecretBoxesOpenedLabel, sidebarSecretBoxesPendingLabel, recentGiftsTitle, perPrizeSuffix (n/a here), hashtagOverflowLabel, sendErrorMessage, heartErrorMessage, searchMaxCharsError, searchRequiredError | lib/i18n/dictionary.ts
- [ ] T004 [P] Add `getKudosDictionary(locale)` accessor mirroring `getAwardsDictionary` | lib/i18n/dictionary.ts
- [ ] T005 [P] Declare Kudos domain types: `Kudos`, `SunnerProfile`, `Hashtag`, `Department`, `SpecialDay`, `SecretBox`, `LeaderboardEntry`, `SpotlightNode`, `FeedCursor`, `SidebarStats`, `KudosFilters` | lib/kudos/types.ts

**Checkpoint**: Dependencies installed, assets staged, dictionary + types ready. No behavior yet.

---

## Phase 2: Foundation (Blocking Prerequisites)

**Purpose**: Mock backend (store + service + validators + handlers) and middleware gate. Required before any user-story phase.

**⚠️ CRITICAL**: All P1 user stories below depend on this phase completing first.

### Mock data + store

- [ ] T006 [P] Create deterministic seed: ~30 mock Sunners across 6 departments, ~12 hashtags, ~80 kudos with mixed `createdAt` distribution, ≥3 image-gallery kudos, ≥3 multi-hashtag (>5) kudos, ≥1 special-day kudos | lib/kudos/seed-data.ts
- [ ] T007 Write failing unit test for in-memory store contracts: `getKudosById`, `listKudos(filters, cursor, limit)`, `insertKudos`, `toggleHeart(userId, kudosId)`, `incrementHeartTotal(senderId, amount)`, `openNextSecretBox(userId)`, `resetStore()` | tests/unit/kudos/store.test.ts
- [ ] T008 Implement `lib/kudos/store.ts` — Map-backed repository with `resetStore()` exported for test isolation; module init seeds from `seed-data.ts` | lib/kudos/store.ts
- [ ] T009 Write failing unit test for validators: hashtag whitelist match, department whitelist match, kudos message non-empty + max length, search query max 100 chars, recipientId required for send | tests/unit/kudos/validators.test.ts
- [ ] T010 Implement hand-rolled validators returning `{ ok: true, value } | { ok: false, errors }` | lib/kudos/validators.ts

### Service layer (business rules)

- [ ] T011 [P] Write failing test for `service.heartToggle`: self-block 403, idempotent toggle, +1 normal, +2 leaderboard on special day, card counter increments by 1 in both cases | tests/unit/kudos/service-heart.test.ts
- [ ] T012 [P] Write failing test for `service.sendKudos`: requires non-empty body, requires recipient ≠ sender, persists, returns canonical record | tests/unit/kudos/service-send.test.ts
- [ ] T013 [P] Write failing test for `service.listFeed` filter scoping: hashtag scopes correctly; department scopes by either sender OR recipient (per plan decision); cursor pagination is stable | tests/unit/kudos/service-list.test.ts
- [ ] T014 [P] Write failing test for `service.getHighlights`: returns top-5 by heart count, filter-scoped, deterministic tie-break by `createdAt desc` | tests/unit/kudos/service-highlight.test.ts
- [ ] T015 [P] Write failing test for `service.getSpotlightNodes`: returns recipient aggregates `{ recipientId, displayName, kudosCount, mostRecentKudosId, mostRecentReceivedAt }`; filter-scoped | tests/unit/kudos/service-spotlight.test.ts
- [ ] T016 [P] Write failing test for `service.openSecretBox`: 404 when none pending, succeeds for first pending box, idempotent on retry | tests/unit/kudos/service-secret-box.test.ts
- [ ] T017 [P] Write failing test for `service.getSidebarStats`: returns the 5 metric values + 10-recent-gifts leaderboard | tests/unit/kudos/service-sidebar.test.ts
- [ ] T018 Implement `lib/kudos/service.ts` covering all 7 test files above; reads/writes through `store.ts`; never trusts client claims | lib/kudos/service.ts

### Middleware gate

- [ ] T019 Write failing integration test asserting anonymous `GET /sun-kudos` redirects to `/login?returnTo=%2Fsun-kudos` (or sets the `saa-returnTo` cookie depending on existing flow) | tests/integration/sun-kudos-page-auth.test.ts
- [ ] T020 Remove `/sun-kudos` from `PUBLIC_ROUTE_PREFIXES` | middleware.ts

### Route handlers (thin)

- [ ] T021 [P] Write failing integration test for `GET /api/kudos/feed`: auth-required, cursor pagination, filter query params | tests/integration/kudos-feed-route.test.ts
- [ ] T022 [P] Write failing integration test for `GET /api/kudos/highlight`: auth-required, returns ≤5, filter query params | tests/integration/kudos-highlight-route.test.ts
- [ ] T023 [P] Write failing integration test for `GET /api/kudos/spotlight`: auth-required, returns node aggregates, optional `?q=` filter | tests/integration/kudos-spotlight-route.test.ts
- [ ] T024 [P] Write failing integration test for `GET /api/kudos/hashtags` + `GET /api/kudos/departments` | tests/integration/kudos-lookups-route.test.ts
- [ ] T025 [P] Write failing integration test for `POST /api/kudos` (send): 401 anon, 400 empty body, 200 canonical record | tests/integration/kudos-send-route.test.ts
- [ ] T026 [P] Write failing integration test for `POST /api/kudos/:id/heart`: 401 anon, 403 self-heart, 200 toggle, special-day +2 leaderboard | tests/integration/kudos-heart-route.test.ts
- [ ] T027 [P] Write failing integration test for `POST /api/kudos/secret-boxes/open`: 401 anon, 404 no pending, 200 with reward | tests/integration/kudos-secret-box-route.test.ts
- [ ] T028 [P] Write failing integration test for `GET /api/users/me` sidebar shape | tests/integration/kudos-users-me-route.test.ts
- [ ] T029 [P] Implement `app/api/kudos/feed/route.ts` (GET only — thin handler: auth → validate filters → `service.listFeed`) | app/api/kudos/feed/route.ts
- [ ] T030 [P] Implement `app/api/kudos/highlight/route.ts` | app/api/kudos/highlight/route.ts
- [ ] T031 [P] Implement `app/api/kudos/spotlight/route.ts` | app/api/kudos/spotlight/route.ts
- [ ] T032 [P] Implement `app/api/kudos/hashtags/route.ts` | app/api/kudos/hashtags/route.ts
- [ ] T033 [P] Implement `app/api/kudos/departments/route.ts` | app/api/kudos/departments/route.ts
- [ ] T034 [P] Implement `app/api/kudos/route.ts` (POST — send) | app/api/kudos/route.ts
- [ ] T035 [P] Implement `app/api/kudos/[kudosId]/heart/route.ts` (POST — toggle) | app/api/kudos/[kudosId]/heart/route.ts
- [ ] T036 [P] Implement `app/api/kudos/secret-boxes/open/route.ts` (POST) | app/api/kudos/secret-boxes/open/route.ts
- [ ] T037 [P] Implement `app/api/users/me/route.ts` (GET — sidebar stats) — or extend existing if it already exists | app/api/users/me/route.ts

### Page shell (auth-gated)

- [ ] T038 Replace `/sun-kudos` placeholder with auth-gated server-component page that renders only `<AppHeader currentPath="/sun-kudos">` + a "WIP" placeholder body + `<AppFooter>`. Reads `getCurrentUser`, `getLocale`, `getHomepageDictionary` (chrome strings) — defence-in-depth `redirect("/login")` if no user | app/sun-kudos/page.tsx
- [ ] T039 Compose `<SunKudosPage>` server-component skeleton (chrome only, body still placeholder); accepts initial filter (hashtag, department) parsed from `searchParams` | components/kudos/sun-kudos-page.tsx

**Checkpoint**: Backend mock is fully tested + green. Middleware redirects anonymous traffic. Page chrome renders for authed users. User-story phases can now begin in parallel where independence allows.

---

## Phase 3: User Story 1 — Read the live Kudos feed (Priority: P1) 🎯 MVP

**Goal**: Authed user opens `/sun-kudos` and sees a populated Highlight carousel (top-5 by hearts), an All Kudos infinite-scroll feed, a Spotlight word cloud, and the keyvisual + sidebar shell — all driven from the mock backend. No write actions yet.

**Independent Test**: Open `/sun-kudos` as an authed user. Verify Highlight carousel paints with 5 cards, All Kudos paints with the first page of seed data, Spotlight shows nodes with a total-count label, empty-state copy appears when filter would yield zero. Logout and verify redirect to `/login`.

### Hooks + utilities (US1)

- [ ] T040 [P] [US1] Write failing test for `use-kudos-feed` hook: returns `{ items, isLoadingInitial, isLoadingMore, hasMore, loadMore, error }`; respects `(hashtag, department)` key; resets on filter change | tests/unit/use-kudos-feed.test.ts
- [ ] T041 [P] [US1] Write failing test for `use-kudos-filters` hook: reads `?hashtag=` `?department=` from URL on mount; updates via `history.pushState`; one filter at a time (setting hashtag clears department per plan §1) | tests/unit/use-kudos-filters.test.ts
- [ ] T042 [P] [US1] Implement `hooks/use-kudos-feed.ts` wrapping `useSWRInfinite` | hooks/use-kudos-feed.ts
- [ ] T043 [P] [US1] Implement `hooks/use-kudos-filters.ts` (URL ↔ state) | hooks/use-kudos-filters.ts

### Shared card components (US1, used by Highlight + All Kudos)

- [ ] T044 [P] [US1] Write failing test for `<KudosCard>`: renders both `variant="highlight"` and `variant="post"`, message truncates (3 lines / 5 lines), self-author makes heart disabled, `aria-pressed` reflects `isHeartedByCurrentUser` | tests/unit/kudos/kudos-card.test.tsx
- [ ] T045 [P] [US1] Write failing test for `<HashtagChipRow>`: shows ≤5 chips, overflow renders `+N more` label, click on chip emits selected tag | tests/unit/kudos/kudos-card-hashtags.test.tsx
- [ ] T046 [P] [US1] Write failing test for `<SenderRecipientBlock>`: renders avatar + name + star tier (1/2/3 ★ based on receivedCount thresholds 10/20/50) + title; click avatar/name calls onProfileClick | tests/unit/kudos/kudos-card-sender-recipient.test.tsx
- [ ] T047 [US1] Implement `<KudosCard>` composing `<SenderRecipientBlock>` × 2, `<HashtagChipRow>`, message body, image gallery (calls into `<KudosImageLightbox>` from Phase 7), `<KudosActionBar>` (heart + copy-link wired in US3) | components/kudos/kudos-card.tsx
- [ ] T048 [P] [US1] Implement `<SenderRecipientBlock>` + tier helper `getStarTier(receivedCount): 0|1|2|3` | components/kudos/kudos-card-sender-recipient.tsx
- [ ] T049 [P] [US1] Implement `<HashtagChipRow>` with `+N more` overflow | components/kudos/kudos-card-hashtags.tsx
- [ ] T050 [P] [US1] Implement read-only `<KudosActionBar>` (heart button disabled stub, copy button stub) | components/kudos/kudos-card-action-bar.tsx

### Highlight band (US1, display only — filters wired in US4, full interactivity in US5)

- [ ] T051 [US1] Implement `<KudosKeyvisual>` reusing layered-image pattern from `<AwardsKeyvisual>` (background + overlay text PNG) | components/kudos/kudos-keyvisual.tsx
- [ ] T052 [US1] Implement `<KudosSendInputPill>` (display-only pill with pencil icon + placeholder; click is no-op in this phase) | components/kudos/kudos-send-input-pill.tsx
- [ ] T053 [US1] Implement `<KudosHighlightCarousel>`: receives `items: Kudos[]` (≤5), renders one active card + prev/next + pager; arrows disabled at ends; pager label `N/5` | components/kudos/kudos-highlight-carousel.tsx
- [ ] T054 [US1] Implement `<KudosHighlightBand>`: client component that fetches via SWR (`/api/kudos/highlight?hashtag&department`), renders `<KudosFilterDropdowns>` (Phase 5 — placeholder static button in this phase) + `<KudosHighlightCarousel>` + empty state | components/kudos/kudos-highlight-band.tsx

### Spotlight (US1, display only — interactivity in US6)

- [ ] T055 [US1] Implement `<KudosSpotlight>`: client component that fetches via SWR (`/api/kudos/spotlight?hashtag&department`), renders `<KudosSpotlightCloud>` (sub-component using `@visx/wordcloud`) inside a fixed-viewport `<svg>`, shows total-count label, loading skeleton, empty state | components/kudos/kudos-spotlight.tsx
- [ ] T056 [P] [US1] Implement `<KudosSpotlightCloud>` sub-component: pure `@visx/wordcloud` wrapper that takes `nodes: SpotlightNode[]` and emits `<text>` elements sized by `kudosCount` | components/kudos/kudos-spotlight-cloud.tsx

### All Kudos infinite list (US1)

- [ ] T057 [US1] Implement `<KudosAllList>`: client component using `use-kudos-feed`; uses `IntersectionObserver` on a sentinel to call `loadMore`; renders `<KudosCard variant="post">` per item; empty state; "no more" footer | components/kudos/kudos-all-list.tsx

### Sidebar skeleton (US1, fully wired in US7)

- [ ] T058 [US1] Implement `<KudosSidebar>` skeleton: fetches `/api/users/me`; renders the 5 metric rows (received / sent / hearts / secret-boxes opened / pending) and a placeholder "10 SUNNER NHẬN QUÀ MỚI NHẤT" list. "Mở quà" button is a non-functional stub here | components/kudos/kudos-sidebar.tsx

### Page composition (US1)

- [ ] T059 [US1] Replace the WIP body in `<SunKudosPage>` with the full composition: `<AppHeader>` → `<KudosKeyvisual>` → `<KudosSendInputPill>` → `<KudosHighlightBand>` → `<KudosSpotlight>` → two-column row (`<KudosAllList>` + `<KudosSidebar>`) → `<AppFooter>` | components/kudos/sun-kudos-page.tsx
- [ ] T060 [US1] Wire `<SunKudosPage>` props through `app/sun-kudos/page.tsx` (locale, isAuthenticated, isAdmin, userDisplay, unreadCount, kudosDictionary, homepageDictionary, initialFilters parsed from `searchParams`) | app/sun-kudos/page.tsx

### Verification (US1)

- [ ] T061 [US1] E2E spec — read flow | tests/e2e/kudos-read.spec.ts
- [ ] T062 [US1] Run `npm run lint && npm run typecheck && npm run test && npm run build`; resolve before checkpoint | (none)

**Checkpoint US1 complete**: Page reads end-to-end from mock backend; carousel + spotlight + infinite list paint; auth gate works; write actions still no-op.

---

## Phase 4: User Story 3 — Heart + Copy Link (Priority: P1)

**Goal**: User can heart any Kudos not authored by themselves with optimistic UI, server-enforced rules (self-block, +2 on special days for leaderboard, idempotent toggle), and copy a shareable URL to clipboard with success toast.

**Independent Test**: On a Kudos not authored by the current user, click heart → count +1, button filled, persists after refresh. Click again → count -1, button unfilled. On own Kudos → heart disabled. Click Copy Link → clipboard contains URL + toast appears.

### Mutation hook (US3)

- [ ] T063 [US3] Write failing test for `use-kudos-heart` hook: optimistic flip + revert on 4xx/5xx; debounce 200ms on rapid clicks; idempotent (server treats as set, not increment) | tests/unit/use-kudos-heart.test.ts
- [ ] T064 [US3] Implement `hooks/use-kudos-heart.ts` (optimistic mutation via `swr.mutate`) | hooks/use-kudos-heart.ts

### Clipboard utility (US3)

- [ ] T065 [P] [US3] Write failing test for `use-clipboard-copy`: success path → toast `Link copied — ready to share!`; jsdom fallback path via `document.execCommand` stub | tests/unit/use-clipboard-copy.test.ts
- [ ] T066 [P] [US3] Implement `hooks/use-clipboard-copy.ts` (`navigator.clipboard.writeText` with `execCommand` fallback) | hooks/use-clipboard-copy.ts
- [ ] T067 [P] [US3] Implement minimal `<Toast>` component (or reuse if one already exists in `components/feedback/`) — `role="status"`, `aria-live="polite"`, auto-dismiss 3s | components/feedback/toast.tsx

### Wire action bar (US3)

- [ ] T068 [US3] Write failing test extending `kudos-card.test.tsx`: heart click triggers mutation, optimistic flip; copy-link click writes to clipboard + shows toast; self-author still disabled | tests/unit/kudos/kudos-card.test.tsx
- [ ] T069 [US3] Update `<KudosActionBar>` to use `use-kudos-heart` + `use-clipboard-copy`; show toast via shared `<ToastHost>` mounted once in `<SunKudosPage>` | components/kudos/kudos-card-action-bar.tsx
- [ ] T070 [US3] Mount `<ToastHost>` once at the top of `<SunKudosPage>` body | components/kudos/sun-kudos-page.tsx

### Verification (US3)

- [ ] T071 [US3] E2E spec — heart toggle (own vs other), special-day Kudos leaderboard +2, copy-link toast | tests/e2e/kudos-heart.spec.ts
- [ ] T072 [US3] Run `npm run lint && npm run typecheck && npm run test && npm run build` | (none)

**Checkpoint US3 complete**: Heart + Copy Link work with optimistic UI + server enforcement of every business rule.

---

## Phase 5: User Story 2 — Send Kudos trigger (Priority: P1)

**Goal**: Clicking the A.1 input pill opens the (out-of-scope) Send-Kudos dialog at `/viet-kudo` (placeholder route); on dialog success the feed prepends the new Kudos.

**Independent Test**: Click the A.1 pill → navigates to `/viet-kudo` (placeholder page acceptable). When the dialog (separate spec) `POST`s to `/api/kudos`, the feed receives the canonical record and prepends it.

### Send pill wiring (US2)

- [ ] T073 [US2] Write failing test for `<KudosSendInputPill>`: keyboard-accessible button role, click navigates to `/viet-kudo`, accepts `onClick` override for tests | tests/unit/kudos/kudos-send-input-pill.test.tsx
- [ ] T074 [US2] Implement `<KudosSendInputPill>` navigation behavior — `next/link` to `/viet-kudo`, falls back to `onClick` prop when provided | components/kudos/kudos-send-input-pill.tsx
- [ ] T075 [P] [US2] Add minimal `/viet-kudo` placeholder page (note: full spec is a separate screen). Page shows "WIP — Send Kudos dialog" and links back to `/sun-kudos` | app/viet-kudo/page.tsx
- [ ] T076 [US2] Expose a documented `swr.mutate(['/api/kudos/feed', filters])` invalidation contract in `lib/kudos/cache-keys.ts` for the future dialog to invoke after successful send | lib/kudos/cache-keys.ts

### Verification (US2)

- [ ] T077 [US2] E2E spec — pill navigation; once dialog ships separately, send → feed-prepend will be validated there | tests/e2e/kudos-send-trigger.spec.ts

**Checkpoint US2 complete**: Pill triggers the (still-to-be-built) dialog; cache invalidation contract documented so the dialog can wire in.

---

## Phase 6: User Story 4 — Filter the feed (Priority: P2)

**Goal**: Hashtag and Department dropdowns scope Highlight + All Kudos + Spotlight simultaneously; clicking any hashtag chip applies the Hashtag filter; clearing returns to unfiltered.

**Independent Test**: Open Hashtag dropdown, pick `IDOL GIỚI TRẺ`, verify all three sections refresh to scoped data, URL shows `?hashtag=IDOL+GIỚI+TRẺ`, carousel resets to slide 0. Click a department from B.1.2 dropdown, verify scope. Clear → unfiltered. Click any chip → filter set.

### Filter dropdowns (US4)

- [ ] T078 [P] [US4] Write failing test for `<KudosFilterDropdowns>`: renders the two trigger buttons, opens menu on click, selecting an option calls `setFilters`, active state on selected | tests/unit/kudos/kudos-filter-dropdowns.test.tsx
- [ ] T079 [US4] Implement `<KudosFilterDropdowns>` (Hashtag + Phòng ban) with `aria-expanded`, keyboard navigation (Esc to close, arrow keys) — fetches options from `/api/kudos/hashtags` and `/api/kudos/departments` via SWR | components/kudos/kudos-filter-dropdowns.tsx
- [ ] T080 [US4] Replace the Phase 3 stub in `<KudosHighlightBand>` with the real `<KudosFilterDropdowns>`; pass setFilters from `use-kudos-filters` | components/kudos/kudos-highlight-band.tsx
- [ ] T081 [US4] Wire hashtag-chip click in `<KudosCard>` (via `<HashtagChipRow>`'s onSelectTag callback) — applies Hashtag filter (clears Department per plan §1) | components/kudos/kudos-card.tsx

### Filter propagation (US4)

- [ ] T082 [US4] Wire filter into Spotlight's SWR key: `/api/kudos/spotlight?hashtag&department` | components/kudos/kudos-spotlight.tsx
- [ ] T083 [US4] On filter change, reset carousel to slide 0 (controlled `slideIndex` in `<KudosHighlightCarousel>`) | components/kudos/kudos-highlight-carousel.tsx
- [ ] T084 [US4] Push filter changes into URL via `history.pushState`; back-button restores prior filter state | hooks/use-kudos-filters.ts

### Verification (US4)

- [ ] T085 [US4] E2E spec — filter scoping across Highlight + All Kudos + Spotlight; back-button restores previous state | tests/e2e/kudos-filter.spec.ts

**Checkpoint US4 complete**: One-filter-at-a-time semantics enforced; URL deep-linkable.

---

## Phase 7: User Stories 5 + 6 — Carousel polish + Spotlight interactivity (Priority: P2)

**Goal**: Carousel arrow disabled states + pager click + accessibility. Spotlight gains pan/zoom toggle, hover tooltip with name + time, click → kudos detail, search with max-100-chars validation.

**Independent Test (US5)**: Cycle slides 1→5; Prev disabled at 1, Next disabled at 5; pager label updates each step.
**Independent Test (US6)**: Hover node → tooltip; click → `/sun-kudos/[id]` placeholder. Pan/Zoom button toggles mode (tooltip reads `Pan` or `Zoom`). Search: 100-char input → ok; 101 → error; empty → required.

### Carousel polish (US5)

- [ ] T086 [US5] Write failing test for `<KudosHighlightCarousel>`: prev disabled on slide 0; next disabled on slide N-1; `aria-current="true"` on active slide; pager click jumps; `aria-pressed` on prev/next; respects `prefers-reduced-motion` (instant slide, no transform animation) | tests/unit/kudos/kudos-highlight-carousel.test.tsx
- [ ] T087 [US5] Update `<KudosHighlightCarousel>` to satisfy the test (disabled state, ARIA, reduced-motion) | components/kudos/kudos-highlight-carousel.tsx

### Spotlight interactivity (US6)

- [ ] T088 [P] [US6] Write failing test for `<KudosSpotlight>` pan/zoom: button toggles `mode` state between `pan` and `zoom`; tooltip on hover shows recipient name + relative time; node click calls `onSelectNode` | tests/unit/kudos/kudos-spotlight.test.tsx
- [ ] T089 [P] [US6] Write failing test for `<KudosSpotlightSearch>`: input rejects strings > 100 chars (inline error), blocks empty submit (required message), Enter or icon-click runs search | tests/unit/kudos/kudos-spotlight-search.test.tsx
- [ ] T090 [US6] Implement pan/zoom: track `{ x, y, k }` viewport transform in state; pointer drag in `pan` mode translates; wheel + double-click in `zoom` mode scales; `prefers-reduced-motion` disables zoom inertia | components/kudos/kudos-spotlight.tsx
- [ ] T091 [P] [US6] Implement `<KudosSpotlightSearch>` (input + magnifier icon + inline error region) | components/kudos/kudos-spotlight-search.tsx
- [ ] T092 [US6] Wire search submit → highlight matching node (visual emphasis + auto-pan to it) | components/kudos/kudos-spotlight.tsx
- [ ] T093 [US6] Wire node click → `/sun-kudos/[kudosId]` (placeholder); hover tooltip portal positioned via viewport math | components/kudos/kudos-spotlight.tsx
- [ ] T094 [P] [US6] Add minimal `/sun-kudos/[kudosId]` placeholder page (WIP — Kudos detail; separate spec) | app/sun-kudos/[kudosId]/page.tsx

### Verification (US5 + US6)

- [ ] T095 [US5+US6] E2E spec — carousel navigation + spotlight pan/zoom + node click | tests/e2e/kudos-carousel-spotlight.spec.ts

**Checkpoint US5 + US6 complete**: Both P2 stories work; accessibility checked.

---

## Phase 8: User Stories 7 + 8 — Sidebar Secret Box + Drill-in navigation (Priority: P3)

**Goal**: Sidebar shows the 5 stats + 10-recent-gifts leaderboard; "Mở quà" opens (out-of-scope) Secret Box dialog or is disabled with tooltip when no pending boxes. Avatar/name clicks navigate to profile; image thumbnails open in a lightbox.

**Independent Test (US7)**: With a user that has ≥1 pending box, click "Mở quà" → navigates to `/secret-box` placeholder. With 0 pending → button disabled + tooltip. Leaderboard empty → `Chưa có dữ liệu`.
**Independent Test (US8)**: Click any avatar/name → `/sunner/[id]` placeholder. Click any image thumb → lightbox opens, Esc closes.

### Sidebar Secret Box (US7)

- [ ] T096 [P] [US7] Write failing test for `<KudosSecretBoxButton>`: disabled with tooltip when `pending === 0`, enabled link to `/secret-box` otherwise | tests/unit/kudos/kudos-secret-box-button.test.tsx
- [ ] T097 [P] [US7] Implement `<KudosSecretBoxButton>` | components/kudos/kudos-secret-box-button.tsx
- [ ] T098 [P] [US7] Add minimal `/secret-box` placeholder page (WIP — separate spec) | app/secret-box/page.tsx
- [ ] T099 [US7] Replace sidebar placeholder leaderboard with real `<RecentGiftsList>` from `/api/users/me`; empty-state `Chưa có dữ liệu` | components/kudos/kudos-sidebar.tsx

### Drill-in navigation (US8)

- [ ] T100 [P] [US8] Write failing test for `<KudosImageLightbox>`: open on `isOpen`, Esc closes, overlay click closes, focus-trap inside, `aria-modal="true"` | tests/unit/kudos/kudos-image-lightbox.test.tsx
- [ ] T101 [P] [US8] Implement `<KudosImageLightbox>` using native `<dialog>` element with `useEffect` `show/close` | components/kudos/kudos-image-lightbox.tsx
- [ ] T102 [US8] Wire image-gallery thumbnails in `<KudosCard>` to open the lightbox | components/kudos/kudos-card.tsx
- [ ] T103 [P] [US8] Add minimal `/sunner/[userId]` placeholder page (WIP — Profile, separate spec) | app/sunner/[userId]/page.tsx
- [ ] T104 [US8] Wire avatar/name clicks in `<SenderRecipientBlock>` to `/sunner/[userId]` (already wired from US1 callback — connect here) | components/kudos/kudos-card-sender-recipient.tsx
- [ ] T105 [US8] Wire avatar/name clicks in the recent-gifts list to `/sunner/[userId]` | components/kudos/kudos-sidebar.tsx

### Verification (US7 + US8)

- [ ] T106 [US7+US8] E2E spec — sidebar render, Mở quà states, profile click, lightbox open/close | tests/e2e/kudos-sidebar-drill-in.spec.ts

**Checkpoint US7 + US8 complete**: All 8 user stories live.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility audit, error/loading polish, performance verification, screenflow sync.

- [ ] T107 [P] ARIA audit pass: `aria-current` on carousel pager item, `aria-pressed` on heart, `aria-expanded` on dropdowns, `aria-modal="true"` on lightbox, `role="status"`+`aria-live="polite"` on toast, descriptive `aria-label` on icon-only buttons (`Mở quà`, `Pan/Zoom`, `Tìm kiếm`) | components/kudos/*.tsx
- [ ] T108 [P] `prefers-reduced-motion` audit: disable carousel slide transition, disable spotlight zoom inertia, snap toast in/out | components/kudos/*.tsx
- [ ] T109 [P] Loading skeletons: All Kudos initial fetch, Highlight initial fetch, Spotlight initial fetch, sidebar `/api/users/me` initial fetch | components/kudos/*.tsx
- [ ] T110 [P] Error boundary wrapping `<SunKudosPage>` body so feed/Spotlight failures don't blank the whole page | components/kudos/sun-kudos-error-boundary.tsx
- [ ] T111 [P] Bundle size check: confirm `/sun-kudos` initial JS ≤ 200kB gz (run `npm run build` and inspect `.next/build-manifest.json`) | (none)
- [ ] T112 Sync `SCREENFLOW.md` — confirm row 5 (Sun* Kudos) is accurate; update "Discovery Log" with implementation date once shipped | .momorph/contexts/SCREENFLOW.md
- [ ] T113 Final gate: `npm run lint && npm run typecheck && npm run test && npm run test:e2e && npm run build` ALL pass | (none)

---

## Dependency Graph

```
Phase 1 (Setup) ─┐
                 ├──> Phase 2 (Foundation) ─┐
                                            ├──> Phase 3 (US1) ─┐
                                            │                   ├──> Phase 4 (US3) ─┐
                                            │                   │                   ├──> Phase 9 (Polish)
                                            │                   ├──> Phase 5 (US2) ─┤
                                            │                   ├──> Phase 6 (US4) ─┤
                                            │                   ├──> Phase 7 (US5+US6)
                                            │                   └──> Phase 8 (US7+US8)
```

- **Phases 4, 5, 6 are independent of each other** once Phase 3 (US1) is in — they touch different files (heart hook vs. send pill vs. filter dropdowns).
- **Phase 7 (US5+US6) depends on Phase 3** (carousel/spotlight skeletons exist).
- **Phase 8 (US7+US8) depends on Phase 3** (sidebar skeleton + card-image-thumbs exist).
- **Phase 9 (Polish)** is a separate workstream once any P1 phase lands.

---

## Parallel Execution Examples

### Within Phase 2 (Foundation)

The 7 service test files are mutually independent — run T011–T017 in one batch, then T018 once they're all red. The 8 route-handler integration tests T021–T028 are independent — same pattern. Then the 9 route-handler implementations T029–T037 are independent (different files).

### Within Phase 3 (US1)

- T040–T043 (hooks) parallel with each other.
- T044–T046 (card sub-component tests) parallel with each other.
- T048–T050 (card sub-component implementations) parallel after their tests are red.
- T051, T052, T056 (keyvisual, send pill, spotlight cloud sub) parallel.
- T053, T054, T055, T057, T058 each touch a different file — parallelizable after their dependencies.

### Within Phase 6 (US4)

- T078 (test) → T079 (impl). T080, T081, T082 each touch a different file — parallelizable after T079.

### Within Phase 8 (US7 + US8)

- US7 (T096–T099) and US8 (T100–T105) touch different files — fully parallel after Phase 3.

### Within Phase 9 (Polish)

- T107–T111 are file-disjoint — fully parallel.

---

## Implementation Strategy

### Minimum Viable Product (MVP)

**MVP = Phases 1 + 2 + 3.** After completing User Story 1 the page renders the full Kudos feed for authed users (read-only). This is the smallest shippable surface that delivers user value (consume recognition feed).

### Suggested incremental delivery

1. **Day 1–2**: Phase 1 (Setup) + Phase 2 (Foundation). Mock backend is fully unit-tested.
2. **Day 3–5**: Phase 3 (US1 — Read feed). End of day 5 → page is read-only live and demoable.
3. **Day 6**: Phase 4 (US3 — Heart + Copy). Engagement actions land.
4. **Day 7**: Phase 5 (US2 — Send pill trigger) + Phase 6 (US4 — Filters). P1 + first P2 in.
5. **Day 8–9**: Phase 7 (US5 + US6 — Carousel/Spotlight interactivity).
6. **Day 10**: Phase 8 (US7 + US8 — Sidebar/drill-in).
7. **Day 11**: Phase 9 (Polish), final gate, ship.

### Test discipline

- Every implementation task has a paired failing test task that **MUST** be observed red before implementation begins (Constitution Principle II).
- E2E specs go last in each user-story phase — they validate the full vertical slice across the mock backend, hooks, and components.
- `npm run lint && npm run typecheck && npm run test && npm run build` MUST be green at each Checkpoint.

---

## Notes

### Out-of-scope dependencies (placeholder routes only)

- `/viet-kudo` (Send Kudos dialog) — placeholder page; separate spec (`ihQ26W78P2`).
- `/sun-kudos/[kudosId]` (Kudos detail) — placeholder; separate spec TBD.
- `/sunner/[userId]` (Profile) — placeholder; separate spec TBD.
- `/secret-box` (Open Secret Box dialog) — placeholder; separate spec TBD.

Each placeholder page is a one-line "WIP" page with a back-link to `/sun-kudos`. Once the real spec lands, the placeholder is replaced.

### Why mock backend in v1

Constitution `TODO(APP_DATA_PERSISTENCE)` — no ORM has been picked yet. The mock `lib/kudos/store.ts` follows the same layered contract a real repository would, so the swap is one file. See plan §"Why no real backend in v1".

### Counts

- **Total tasks**: 113 (T001 – T113)
- **Setup (Phase 1)**: 5 tasks (T001–T005)
- **Foundation (Phase 2)**: 34 tasks (T006–T039)
- **US1 (Phase 3, P1 — MVP)**: 23 tasks (T040–T062)
- **US3 (Phase 4, P1)**: 10 tasks (T063–T072)
- **US2 (Phase 5, P1)**: 5 tasks (T073–T077)
- **US4 (Phase 6, P2)**: 8 tasks (T078–T085)
- **US5 + US6 (Phase 7, P2)**: 10 tasks (T086–T095)
- **US7 + US8 (Phase 8, P3)**: 11 tasks (T096–T106)
- **Polish (Phase 9)**: 7 tasks (T107–T113)
