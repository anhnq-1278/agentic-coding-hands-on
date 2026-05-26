# Feature Specification: Hệ thống giải (Awards Information)

**Frame ID**: `zFYDgyj_pD` (root node `313:8436`)
**Frame Name**: `Hệ thống giải` (English: Awards System / Awards Information)
**File Key**: `9ypp4enmFmdK3YAFJLIu6C`
**Created**: 2026-05-14
**Status**: Draft

---

## Overview

The **Hệ thống giải / Awards Information** page is the single source of truth for
the six SAA 2025 award categories. Users arriving from the Homepage's six award
cards, the header/footer "Award Information" link, or the hero "ABOUT AWARDS" CTA
land on this page, optionally deep-linked to a specific award via a `#<slug>`
hash. The page lists every award (image, title, description, prize count, prize
value) in a single long-scroll right column driven by a sticky scrollspy
side-menu on the left. A Sun\* Kudos promo block sits at the bottom and links
across to the parallel Kudos initiative.

- **Target users**: Sun\* employees who want to understand the SAA 2025 awards
  system before voting / nominating. Used both during the campaign window and
  after, as the canonical reference page.
- **Business context**: The page is the campaign's persistent reference. Award
  metadata (count and value) is published copy — visitors return here to confirm
  prize money and eligibility.
- **Locale**: bilingual VN / EN; default `vi` (matches Login + Homepage). EN
  fallback uses the same shared dictionary mechanism as the Homepage.

---

## User Scenarios & Testing *(mandatory)*

### US1: Browse all six awards on one page (Priority: P1) 🎯 MVP

**As a** signed-in Sun\* employee
**I want to** scroll through every SAA 2025 award category on one page
**So that** I can compare the categories at a glance and understand the program.

**Why this priority**: This is the page's core job. Without the listing, the
page is empty.

**Independent Test**: Open `/he-thong-giai` (or `/awards-information` — see Open
Questions) while signed in; assert exactly six award sections render in the
order Top Talent → Top Project → Top Project Leader → Best Manager → Signature
2025 - Creator → MVP; each section shows image + title + description + "Số
lượng giải thưởng" + "Giá trị giải thưởng".

**Acceptance Scenarios**:

1. **Given** a signed-in user opens the page,
   **When** the page renders,
   **Then** six award info-blocks (D.1 → D.6) are visible in the documented
   order, each with the metadata listed in the table below.
2. **Given** the page is open,
   **When** the user scrolls past all six awards,
   **Then** the Sun\* Kudos promo block (D1_Sunkudos) is visible at the bottom
   above the footer.
3. **Given** the page is open,
   **When** the user inspects any award block,
   **Then** the block displays exactly the metadata documented in the "Data
   Requirements" section (count + value, exact strings).

---

### US2: Navigate via the sticky side-menu (Priority: P1)

**As a** user reading the awards list
**I want to** jump straight to a specific award category from a left-side menu
**So that** I do not have to scroll past the others to reach the one I care about.

**Why this priority**: Six long blocks on one page make scrolling tedious; the
side-menu is the standard navigation affordance.

**Independent Test**: Open the page; click each of the six menu items
(C.1 Top Talent → C.6 MVP); assert the right-hand column scrolls to the
corresponding section AND the clicked menu item becomes the only active item
(yellow color + underline).

**Acceptance Scenarios**:

1. **Given** the page is open with Top Talent active by default (per C.1's
   variant `186:1501` in the static design),
   **When** the user clicks "MVP" in the side menu,
   **Then** the right column scrolls smoothly to the MVP section, the URL hash
   updates to `#mvp`, and only the MVP menu item is active.
2. **Given** the user clicks any menu item and then scrolls manually,
   **When** the scroll position crosses into another award section,
   **Then** the active item in the side menu updates to match the section in
   view (scrollspy).
3. **Given** the user hovers a menu item without clicking,
   **When** the hover is detected,
   **Then** the item is highlighted (visual hover state).

---

### US3: Deep-link to a specific award via `#<slug>` (Priority: P1)

**As an** external visitor arriving from a shared link (e.g., a Homepage award
card)
**I want to** land directly at the targeted award on this page
**So that** I do not lose context from the inbound link.

**Why this priority**: The Homepage's six cards each link to
`/<route>#<slug>` — without anchor support, those links are broken.

**Independent Test**: Open the page with `#top-project-leader` in the URL;
assert the page auto-scrolls to the Top Project Leader section AND that item
is the active side-menu entry. Repeat for every canonical slug.

**Canonical slug map** (now confirmed by this spec — supersedes the Homepage
spec's derived list):

| Award | Anchor |
|-------|--------|
| Top Talent | `#top-talent` |
| Top Project | `#top-project` |
| Top Project Leader | `#top-project-leader` |
| Best Manager | `#best-manager` |
| Signature 2025 - Creator | `#signature-2025-creator` |
| MVP | `#mvp` |

**Acceptance Scenarios**:

1. **Given** the page URL contains `#top-talent`,
   **When** the page loads,
   **Then** the right column scrolls to the Top Talent section and the Top
   Talent menu item is marked active.
2. **Given** the page URL contains an unknown anchor (e.g., `#frobnicate`),
   **When** the page loads,
   **Then** the page renders normally with Top Talent as the active default;
   no JavaScript error is thrown (test case ID-13).
3. **Given** the user clicks a Homepage award card,
   **When** the browser navigates to this page with the matching anchor,
   **Then** scrolling and active state behave as in (1).

---

### US4: Discover Sun\* Kudos via the promo block (Priority: P2)

**As a** user finishing the awards list
**I want to** see the Sun\* Kudos initiative below the last award
**So that** I learn about the parallel recognition program without leaving the
flow.

**Why this priority**: The block reinforces a sibling product; useful but the
awards content stands on its own without it.

**Independent Test**: Scroll to the bottom of the right column; assert the
`D1_Sunkudos` block renders with label "Phong trào ghi nhận", title "Sun\*
Kudos", description, and a "Chi tiết" CTA; click the CTA and assert navigation
to `/sun-kudos`.

**Acceptance Scenarios**:

1. **Given** the user scrolls past D.6 (MVP),
   **When** the Sun\* Kudos block enters the viewport,
   **Then** the four elements (label, title, description, "Chi tiết" CTA) are
   visible (test case ID-8).
2. **Given** the user clicks the "Chi tiết" button in the Sun\* Kudos block,
   **When** the click resolves,
   **Then** the browser navigates to the Sun\* Kudos page (`MaZUn5xHXZ`,
   `/sun-kudos`) — test case ID-12.
3. **Given** the Sun\* Kudos destination is unavailable (e.g., 404),
   **When** the user clicks "Chi tiết",
   **Then** the browser shows a friendly 404 page (test case ID-14).

---

### US5: Access from the global app chrome (Priority: P2)

**As a** user anywhere in the app
**I want to** click the "Award Information" link in the header or footer to
reach this page
**So that** the page is always one click away.

**Why this priority**: Header/footer nav must work consistently; ranks below
the page's own content but above polish.

**Independent Test**: From any other screen with the global chrome, click
header "Award Information"; assert URL is the awards-information route and the
page renders with the side-menu in its default active state. Repeat for
footer's link.

**Acceptance Scenarios**:

1. **Given** the user is on the Homepage,
   **When** they click the header "Award Information" link (`A1.3`),
   **Then** the browser navigates to this page; the side menu defaults to
   Top Talent.
2. **Given** the user is on the Homepage,
   **When** they click the footer "Award Information" link (`7.3`),
   **Then** the browser navigates to this page identically to (1).
3. **Given** the user is already on this page,
   **When** they click the header or footer "Award Information" link,
   **Then** the page scrolls to the top (no full reload).

---

### US6: Auth gate (Priority: P2)

**As the** product
**I want to** require a signed-in session to read this page
**So that** the awards content remains internal to Sun\*.

**Why this priority**: Compliance / scoping; the rest of the page does not
work without a session anyway. Note: this contradicts the Homepage spec which
treated `/awards-information` as a public placeholder (see Open Questions).

**Independent Test**: Visit the page URL without a session; assert a redirect
to `/login`. Sign in; revisit; assert the page renders normally (test cases
ID-0 + ID-1).

**Acceptance Scenarios**:

1. **Given** the user has a valid session,
   **When** they navigate to the page URL directly,
   **Then** the page renders (test case ID-0).
2. **Given** the user is anonymous,
   **When** they navigate to the page URL directly,
   **Then** they are redirected to `/login` (test case ID-1).
3. **Given** an anonymous user clicks an inbound deep link
   (`/<route>#top-talent`),
   **When** the navigation resolves,
   **Then** they land on `/login`; after sign-in the original anchor MAY be
   preserved via `returnTo` (project-wide policy from the Login spec).

---

### US7: Graceful invalid-section / failed-navigation handling (Priority: P3)

**As a** user who somehow triggers an invalid scroll target or whose Sun\*
Kudos link fails
**I want to** see a friendly message rather than a broken page
**So that** the experience remains usable.

**Why this priority**: Defensive UX; rare edge case.

**Independent Test**:
- Force an invalid section ID via dev tools (test case ID-13) → no JS error,
  page state unchanged.
- Simulate a `/sun-kudos` 404 (test case ID-14) → friendly 404 page on click.

**Acceptance Scenarios**:

1. **Given** the URL contains an unknown hash,
   **When** the page handles the hash,
   **Then** the active state defaults to Top Talent and no console error is
   thrown.
2. **Given** the Sun\* Kudos destination returns 404,
   **When** the user clicks "Chi tiết",
   **Then** the browser shows the project's standard 404 page.

---

### Edge Cases

- **Manual scroll without clicking the menu** — scrollspy MUST update the
  active item; do not require a click to advance.
- **Smooth-scroll preference** — respect the user's
  `prefers-reduced-motion`; jump instantly when the user prefers reduced
  motion.
- **History API behavior** — clicking a menu item should `replaceState` (not
  push) so the back button does not become cluttered with intra-page anchors.
  Direct deep-link visits use the standard hash (browser handles it).
- **Award metadata is static for MVP** — copy is committed to the codebase /
  dictionary; no admin edit surface in this scope.
- **Sun\* Kudos block reused from Homepage** — the same shared component
  (`186:1567`-family) is used; consolidate the implementation rather than
  duplicating.

---

## UI/UX Requirements *(behavior, not pixels)*

### Page sections

| Node ID | Region | Component | Type | Interactive? | Behavior |
|---------|--------|-----------|------|--------------|----------|
| `313:8436` | root | `Hệ thống giải` | FRAME | container | Hosts the page; standard app chrome wraps it. |
| `313:8437` | 3 | `3_Keyvisual` | GROUP | No | Decorative cover banner; alt "Keyvisual Sun* Annual Award 2025". |
| `313:8453` | A | `A_Title hệ thống giải thưởng` | FRAME | No | Two-line title block (caption + heading). |
| `313:8458` | B | `B_Hệ thống giải thưởng` | FRAME | container | Two-column body. |
| `313:8459` | C | `C_Menu list` | FRAME | container | Sticky scrollspy side-menu. |
| `313:8460` | C.1 | `C.1_Top talent` | INSTANCE | nav item | Click → smooth-scroll to D.1 + URL hash `#top-talent` + activate. **Default active** on first paint. |
| `313:8461` | C.2 | `C.2_Top project` | INSTANCE | nav item | → D.2 + `#top-project`. |
| `313:8462` | C.3 | `C.3_Top Project leader` | INSTANCE | nav item | → D.3 + `#top-project-leader`. |
| `313:8463` | C.4 | `C.4_Best manager` | INSTANCE | nav item | → D.4 + `#best-manager`. |
| `313:8464` | C.5 | `C.5_Signature 2025` | INSTANCE | nav item | → D.5 + `#signature-2025-creator`. |
| `313:8465` | C.6 | `C.6_MVP` | INSTANCE | nav item | → D.6 + `#mvp`. |
| `313:8467` | D.1 | `D.1_Top talent` | INSTANCE | No | Award info block — image + title + description + metadata. |
| `313:8468` | D.2 | `D.2_Top Project` | INSTANCE | No | Same structure as D.1. |
| `313:8469` | D.3 | `D.3_Top Project Leader` | INSTANCE | No | Same structure. |
| `313:8470` | D.4 | `D.4_Thông tin giải` | INSTANCE | No | Best Manager content (frame name is generic per assumption in the screenflow report). |
| `313:8471` | D.5 | `D.5_Signature 2025` | FRAME | No | Custom local frame (not shared) — 7 content children; carries the dual-value treatment for Cá nhân vs Tập thể. |
| `313:8510` | D.6 | `D.6_MVP` | INSTANCE | No | Same structure as D.1. |
| `335:12023` | D1 | `D1_Sunkudos` | INSTANCE | container | Promo block; identical shared component to Homepage's. |
| `I335:12023;313:8426` | D2.1 | `D2.1_Button-IC` | INSTANCE | button | "Chi tiết" → `/sun-kudos`. |

### Component Behavior detail

- **Side-menu items (C.1 → C.6)**:
  - **Trigger**: click.
  - **Action**: smooth-scroll the right column to the matching `D.X`; update
    URL hash via `history.replaceState`; set this item active and clear the
    previous active state.
  - **States**: `idle` → `hover` → `active`. Only one `active` at a time.
  - **Navigation**: in-page (no route change).
  - **Validation**: clamp invalid scrolls (ID-13) to a no-op.

- **D1_Sunkudos → D2.1 "Chi tiết"**:
  - **Trigger**: click.
  - **Action**: navigate to `/sun-kudos` (Sun\* Kudos live board, frame
    `MaZUn5xHXZ`).
  - **States**: idle / hover.

- **Award info blocks (D.1 → D.6)**: non-interactive — static read-only
  display. No `onClick`, no `<button>`, no `<a>` inside the block body.

### Navigation Flow (sourced from `.momorph/contexts/SCREENFLOW.md`)

- **Incoming**:
  - Homepage SAA header link "Award Information" (`A1.3`) → page top.
  - Homepage SAA footer link "Award Information" (`7.3`) → page top.
  - Homepage SAA hero CTA "ABOUT AWARDS" (`mms_B3.1`) → page top.
  - Homepage SAA award cards (`mms_C2.1`…`mms_C2.6`) → page with the matching
    `#<slug>` anchor.
  - Any other screen sharing the app chrome with the "Award Information" link.
- **Outgoing**:
  - Header logo / "About SAA 2025" → `/` (Homepage SAA).
  - Header "Sun\* Kudos" → `/sun-kudos`.
  - Header bell → Notification panel (target TBD).
  - Header language switch → Language Dropdown (`IiLVGkACbt`).
  - Header avatar → Profile dropdown (`z4sCl3_Qtk` or `54rekaCHG1`).
  - Footer "Sun\* Kudos" → `/sun-kudos`.
  - Footer "Tiêu chuẩn chung" → `/community-standards`.
  - `D1_Sunkudos` "Chi tiết" → `/sun-kudos`.
  - Side-menu items → self anchors (intra-page).
- **Conditional**:
  - Session invalid / expired → redirect to `/login` (US6).
  - Sign-out from profile dropdown → `/login`.

### Visual / Accessibility Requirements (non-prescriptive)

- The side-menu MUST be reachable by keyboard (`Tab` cycles through C.1 → C.6;
  `Enter`/`Space` activates; arrow keys MAY navigate within the menu).
- Each side-menu item MUST expose `aria-current="true"` when active (replaces
  the visual yellow + underline for assistive tech).
- The active state MUST be conveyed by something other than color alone (the
  underline already satisfies this).
- Smooth scroll MUST respect `prefers-reduced-motion: reduce` and fall back
  to an instant jump.
- The sticky menu MUST stop sticking at the bottom of the awards section so
  it does not overlap the Sun\* Kudos block.

> Pixel-level styling, colours, fonts, asset paths are intentionally out of
> scope; the implementation step retrieves them via `query_section` /
> `get_media_files`.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The page MUST render exactly six award info-blocks in the order
  Top Talent → Top Project → Top Project Leader → Best Manager → Signature
  2025 - Creator → MVP.
- **FR-002**: Each award block MUST display image, title, description, "Số
  lượng giải thưởng" + numeric count + unit ("Đơn vị" / "Tập thể" / "Cá
  nhân"), and "Giá trị giải thưởng" + amount.
- **FR-003**: A sticky side-menu MUST list the six awards. Clicking an item
  MUST: (a) smooth-scroll the right column to the matching block; (b) update
  the URL hash via `replaceState`; (c) set the item active.
- **FR-004**: Scrollspy MUST update the active menu item as the right column
  scrolls past section boundaries, regardless of whether the user clicked.
- **FR-005**: Direct deep-link with a valid `#<slug>` MUST auto-scroll on
  load. An unknown hash MUST fall back to Top Talent active and MUST NOT
  throw a JS error.
- **FR-006**: The Sun\* Kudos promo block MUST appear after the last award
  and MUST navigate to `/sun-kudos` when its "Chi tiết" CTA is clicked.
- **FR-007**: The page MUST require an authenticated session; anonymous
  visitors MUST be redirected to `/login`.
- **FR-008**: Award metadata (counts, values) is static and MUST come from a
  single canonical source (dictionary or constants module).
- **FR-009**: Smooth scroll MUST respect `prefers-reduced-motion`.

### Technical Requirements

- **TR-001 (Performance)**: Initial render MUST display the first award
  (Top Talent) within the LCP budget. Other sections are below the fold and
  MAY lazy-load images.
- **TR-002 (Accessibility)**: WCAG 2.1 AA — keyboard navigable side-menu,
  `aria-current` on active item, sufficient contrast on text, alt text on
  every award image.
- **TR-003 (i18n)**: All visible copy MUST come from the dictionary. Award
  metadata constants (e.g., "7.000.000 VNĐ") MAY remain locale-agnostic
  numeric strings.

### Key Entities

- **AwardCategory** (extends the Homepage's `AwardCategory`):
  - Existing: `slug`, `title`, `description`, `labelSrc`, `labelWidth`,
    `labelHeight`.
  - **New** on this page: `count: number`, `countUnit: "Đơn vị" | "Tập thể"
    | "Cá nhân"`, `valuePrimary: string` (e.g., "7.000.000 VNĐ"),
    `valueSecondary?: string` (only for Signature 2025 - Creator which has
    separate Cá nhân / Tập thể values), `longDescription: string`
    (multi-paragraph for this page), `heroImageSrc: string` (336×336 image
    for the award block — same asset as the Homepage card).

**Canonical metadata table** (committed copy — per test case ID-6):

| Slug | Title | Count | Unit | Value (primary) | Value (secondary) |
|------|-------|-------|------|------------------|---------------------|
| top-talent | Top Talent | 10 | Đơn vị | 7.000.000 VNĐ / giải | — |
| top-project | Top Project | 02 | Tập thể | 15.000.000 VNĐ / giải | — |
| top-project-leader | Top Project Leader | 03 | Cá nhân | 7.000.000 VNĐ / giải | — |
| best-manager | Best Manager | 01 | Cá nhân | 10.000.000 VNĐ | — |
| signature-2025-creator | Signature 2025 - Creator | 01 | Cá nhân / Tập thể | 5.000.000 VNĐ (cá nhân) | 8.000.000 VNĐ (tập thể) |
| mvp | MVP (Most Valuable Person) | 01 | Cá nhân | 15.000.000 VNĐ | — |

---

## API Dependencies *(predicted)*

| Endpoint | Method | Purpose | Triggered by | Status |
|----------|--------|---------|--------------|--------|
| `/api/auth/session` (or `getCurrentUser` on the server) | GET | Auth gate on page render (US6) | Page server-render | Exists (Login spec) |
| `/api/awards/categories` (optional, deferred) | GET | Returns extended `AwardCategory` for this page when the catalog moves out of code. | Page server-render | Predicted; **defer** — keep the catalog in code per Homepage plan's stance |

> No new endpoints are load-bearing for MVP. The awards metadata is static
> and lives in `lib/awards/catalog.ts` (already in place from Homepage),
> extended with the new fields documented above.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of inbound `#<slug>` deep links scroll to the correct
  section on first load (verified by automated link checker against the six
  Homepage card hrefs).
- **SC-002**: Side-menu click-to-scroll completes within 600 ms for any
  award; instant jump under `prefers-reduced-motion`.
- **SC-003**: Scrollspy active-state update lags scroll by ≤ 200 ms (no
  visible "stuck" highlight on a different section).
- **SC-004**: Anonymous visits redirect to `/login` 100% of the time; no
  flash of the awards content.
- **SC-005**: All six award blocks render the exact metadata documented
  above (verified against test case ID-6).

---

## State Management

- **Local component state**:
  - `activeSlug`: which side-menu item is active. Initialized from
    `window.location.hash` on mount (fallback Top Talent). Updated by clicks
    AND by scrollspy (IntersectionObserver).
- **Global / app-level state**:
  - `currentUser` — server-side via session JWT (Login PR). Drives the auth
    gate.
  - `currentLocale` — cookie-backed `saa-locale`; same store as Login +
    Homepage.
- **Server state caching**:
  - Awards catalog is build-time static — no client cache needed.
- **Optimistic updates**: none.

---

## Out of Scope

- Per-award detail page — there are no separate detail screens; everything
  fits on this one page (confirmed by SCREENFLOW report).
- Voting / nomination workflows — a separate spec.
- Admin edit surface for award metadata — out of scope; catalog is committed.
- Visual styling (LED treatment, gold gradients, asset paths) — handled at
  implementation time per Constitution Principle IV.
- Sun\* Kudos block's content — owned by the Sun\* Kudos spec; only the CTA
  navigation is in this spec's scope.

---

## Dependencies

- [x] Constitution document exists ([`.momorph/constitution.md`](../../constitution.md)) — v1.2.0
- [x] Screen flow documented ([`.momorph/contexts/SCREENFLOW.md`](../../contexts/SCREENFLOW.md))
- [x] Per-screen detail ([`.momorph/contexts/screen_specs/he-thong-giai.md`](../../contexts/screen_specs/he-thong-giai.md))
- [x] Login spec exists ([`../GzbNeVGJHz-Login/spec.md`](../GzbNeVGJHz-Login/spec.md)) — auth gate
- [x] Homepage SAA spec exists ([`../i87tDx10uM-Homepage-SAA/spec.md`](../i87tDx10uM-Homepage-SAA/spec.md)) — inbound nav + shared award catalog
- [ ] Sun\* Kudos spec — TBD; needed to lock the canonical route name for the CTA.
- [ ] Dropdown-profile spec — TBD; chrome surface only.
- [ ] Notification panel spec — TBD; chrome surface only.

### Constitution Alignment

- **Principle I — Spec-Driven Development**: this spec is the canonical source
  for the slug map. The Homepage spec's derived slugs are now confirmed; any
  drift between this spec and the Homepage `AWARD_CATALOG` MUST be resolved
  by treating this spec as authoritative.
- **Principle II — Test-First**: the 15 test cases (ID-0 → ID-14) MUST be
  converted to failing tests before implementation begins.
- **Principle III — Layered Architecture**: scrollspy + hash sync live in
  client components; the page itself is a Server Component reading
  `getCurrentUser` + the awards catalog.
- **Principle IV — Design Tokens**: any new visual tokens (e.g., scrollspy
  active glow) land in `app/globals.css` with a one-line rationale. No hard
  hex values inline.
- **Principle V — Type Safety**: extended `AwardCategory` type MUST cover
  the new fields (`count`, `countUnit`, `valuePrimary`, `valueSecondary`,
  `longDescription`, `heroImageSrc`). No `any`.

---

## Notes

- **Component reuse**: this page shares the **AppHeader**, **AppFooter**,
  and **SunKudosBlock** components with the Homepage. Reviewers MUST verify
  that any change to those shared components is consistent with both screens.
- **Award catalog extension**: the Homepage's existing `AWARD_CATALOG` in
  `lib/awards/catalog.ts` will need new fields. Backward compatibility for
  the Homepage card rendering MUST be preserved.
- **D.4 frame-name vs content**: the design item registry generically names
  D.4 as `D.4_Thông tin giải`. Per the screenflow report and the side-menu
  order, D.4 = Best Manager. Implementers SHOULD rely on the spec table
  above rather than the Figma frame name.
- **D.5 custom shape**: D.5 (Signature 2025 - Creator) is the only custom
  local frame in the D.X family — it carries 7 content children instead of
  the standard 5 because it has the dual Cá nhân / Tập thể value treatment.
  Implementation MUST render two value lines for this entry.

---

## Open Questions

- [ ] **Route mismatch** — Test case ID-0 uses `/he-thong-giai`; the
  Homepage spec and current project (Homepage `AWARD_CATALOG` hrefs +
  middleware `PUBLIC_ROUTE_PREFIXES`) use `/awards-information`. **Decision
  needed**: pick one route. Recommended: align on `/awards-information`
  (matches existing code) and document the Vietnamese alias either as an
  i18n redirect or drop it. If the team chooses `/he-thong-giai`, the
  Homepage card hrefs + middleware list MUST be updated in lockstep.
- [ ] **Auth gate** — Test case ID-1 says anonymous → redirect to `/login`.
  The Homepage SAA spec listed `/awards-information` as a public placeholder
  route (anonymous visitors CAN reach it from the public Homepage). Pick
  one. Recommended: **auth-gated** per this spec; update Homepage spec +
  middleware to remove the placeholder from `PUBLIC_ROUTE_PREFIXES`. If
  public is required, US6 + FR-007 in this spec are voided.
- [ ] **`signature-2025-creator` slug** — the Homepage spec assumed this
  slug. Test cases here use the title "Signature 2025 - Creator" with a
  hyphen. Confirm: is the canonical slug `signature-2025-creator` (drops the
  hyphen), `signature-2025---creator` (preserves it as three hyphens — ugly),
  or something else? Recommended: keep `signature-2025-creator`.
- [ ] **`returnTo` preservation through the auth redirect** — if an
  anonymous user clicks a Homepage card `#top-talent` link, do we preserve
  the anchor through Login → back to this page? Recommended: yes (the
  Login flow already supports `returnTo`; just include the hash).
- [ ] **Scrollspy threshold** — what intersection threshold marks a section
  as "active"? Recommended: top of the section crosses 25% of the viewport
  from the top.
- [ ] **Mobile layout** — Figma only surfaces a desktop frame. Confirm
  whether mobile collapses the side-menu into a top tab strip / sticky
  pills / a "scroll-to-section" select.
- [ ] **Notification panel target frame** — `6-1LRz3vqr` vs `gWBVcaSVIf`
  (carried over from Homepage's open question).
