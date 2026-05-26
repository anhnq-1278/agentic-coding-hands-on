# Feature Specification: Homepage SAA

**Frame ID**: `i87tDx10uM` (root node `2167:9026`)
**Frame Name**: `Homepage SAA`
**File Key**: `9ypp4enmFmdK3YAFJLIu6C`
**Created**: 2026-05-07
**Status**: Draft

---

## Overview

The **Homepage SAA** is the landing/dashboard hub for the **Sun Annual Awards 2025**
campaign. It is reached automatically after a successful Google sign-in (from
`GzbNeVGJHz` Login) and serves four jobs:

1. **Orient** the user with a campaign hero, countdown to the event date, and event
   logistics (time, location, livestream channel).
2. **Showcase** the six award categories as a card grid that links into the dedicated
   *Awards Information* page (anchored by category slug).
3. **Promote** the parallel **Sun\* Kudos** initiative with a banner block and a
   "Chi tiết" CTA into the Sun\* Kudos detail page (`MaZUn5xHXZ`).
4. **Provide global chrome**: header (logo + 3 nav links + bell + language + avatar
   menu), a fixed-bottom-right floating widget for quick actions, and a footer (logo +
   nav links + copyright).

- **Target users**: Sun\* employees during the SAA 2025 campaign window — both regular
  contributors (read + nominate workflow lives elsewhere) and admins (who additionally
  see an *Admin Dashboard* entry in the avatar menu).
- **Business context**: The page is the campaign's persistent home — visitors return
  here repeatedly to track countdown, jump into category content, and access notifications.
- **Locale**: Bilingual VN / EN; default `VN`. Language is shared with Login via the
  same `saa-locale` cookie.

---

## User Scenarios & Testing *(mandatory)*

### US1: Land on the homepage and orient via the hero + countdown (Priority: P1) 🎯 MVP

**As an** authenticated SAA 2025 participant
**I want to** open the homepage and immediately see the campaign hero plus a live
countdown to the event start
**So that** I know how much time remains and feel oriented in the campaign.

**Why this priority**: This is the first thing every signed-in user sees. Without a
correct hero + countdown, the page fails its primary "orient" job.

**Independent Test**: Visit `/` while signed in; assert the keyvisual hero (`mms_3.5_Keyvisual`)
renders the title "ROOT FURTHER" plus a "Coming soon" subtitle plus three two-digit
countdown tiles labelled `DAYS / HOURS / MINUTES`; advance the system clock by one
minute and assert the countdown decrements.

**Acceptance Scenarios**:

1. **Given** the user lands on `/` before the configured event start time,
   **When** the page renders,
   **Then** the hero (`2167:9027`) shows "ROOT FURTHER" + "Coming soon" subtitle, and
   `mms_B1.3_Countdown` (`2167:9037`) shows three two-digit tiles whose numbers match
   the time remaining to the event datetime (zero-padded).
2. **Given** the page is open with one minute remaining,
   **When** one minute elapses,
   **Then** the countdown auto-updates without a full page reload.
3. **Given** the current time has reached or passed the event start,
   **When** the page renders,
   **Then** all three tiles display `00`, the "Coming soon" label
   (`mms_B1.2_Coming soon`, `2167:9036`) is hidden, and no negative numbers appear.
4. **Given** the event datetime env value is missing or malformed (per test case ID-60),
   **When** the page renders,
   **Then** the system displays a graceful fallback (e.g., placeholder dashes) and does
   NOT crash the page.

---

### US2: Browse all six award categories and drill into details (Priority: P1)

**As an** SAA 2025 participant
**I want to** see all award categories at a glance and open the one I care about
**So that** I can understand the categories I am eligible for or interested in voting on.

**Why this priority**: The award catalog is the primary content of the campaign;
without it the homepage is empty.

**Independent Test**: Open `/`; assert exactly six award cards in the order
`Top Talent → Top Project → Top Project Leader → Best Manager → Signature 2025 - Creator → MVP`;
click each of the three click targets (image, title, "Chi tiết" link) on at least one card and
assert navigation to `/awards-information#<slug>` where `<slug>` matches the category.

**Acceptance Scenarios**:

1. **Given** the homepage is rendered,
   **When** the user reaches the awards section,
   **Then** the six cards display in a 3-column grid on desktop and 2-column grid on
   tablet/mobile, each showing thumbnail + title + 1–2 line description (truncated with
   "…" when overflowing) + "Chi tiết" link.
2. **Given** the user clicks the **image**, the **title**, OR the **"Chi tiết"** link
   on the *Top Talent* card (`2167:9075`),
   **When** the click resolves,
   **Then** the browser navigates to `/awards-information#top-talent` and the *Awards
   Information* page auto-scrolls to the matching anchor.
3. **Given** the user hovers any award card,
   **When** hover triggers,
   **Then** the card lifts slightly with a brighter border / glow (visual treatment
   only — no behaviour change).
4. **Given** an award card lacks a configured slug (test case ID-62),
   **When** the user clicks it,
   **Then** the browser navigates to `/awards-information` with no anchor and no
   auto-scroll.

---

### US3: Navigate primary sections via the header (Priority: P1)

**As a** logged-in user
**I want to** jump between *About SAA 2025*, *Awards Information*, *Sun\* Kudos*, and
back to the homepage
**So that** I can move around the campaign without scrolling or back-button gymnastics.

**Why this priority**: Header nav is reachable from every screen and must work or the
whole product feels broken.

**Independent Test**: From the homepage, click each of the four header targets (logo
`mms_A1.1_LOGO`, *About SAA 2025* selected link, *Awards Information* link, *Sun\* Kudos*
link) and assert correct navigation per the table below.

**Acceptance Scenarios**:

1. **Given** the homepage is rendered,
   **When** the user inspects the header (`2167:9091`),
   **Then** the *About SAA 2025* link (`A1.2`, `I2167:9091;186:1579`) is visually
   selected (yellow / underline), and *Awards Information* (`A1.3`) and *Sun\* Kudos*
   (`A1.5`) are in normal/hover state respectively per the design.
2. **Given** the user is on the homepage,
   **When** they click the already-selected *About SAA 2025* link,
   **Then** the page scrolls to top (no route change).
3. **Given** the user is anywhere in the app,
   **When** they click the header logo,
   **Then** the browser navigates to `/` and scrolls to the top.
4. **Given** the user is on the homepage,
   **When** they click *Awards Information*,
   **Then** the browser navigates to `/awards-information`.
5. **Given** the user is on the homepage,
   **When** they click *Sun\* Kudos*,
   **Then** the browser navigates to `/sun-kudos` (the Sun\* Kudos live board, frame
   `MaZUn5xHXZ`).

---

### US4: Read event time, location, and livestream channel (Priority: P2)

**As a** participant
**I want to** see when and where the SAA 2025 event takes place plus how to watch
remotely
**So that** I can plan to attend or join the livestream.

**Why this priority**: Critical static info; high-value but doesn't block the rest of
the page from being useful.

**Independent Test**: Open `/`; assert that under the hero block, `mms_B2_Thông tin
sự kiện` (`2167:9053`) renders three lines: a time line ("Thời gian: 18h30"), a
location line ("Địa điểm: Nhà hát nghệ thuật quân đội"), and a livestream note
("Tường thuật trực tiếp tại Group Facebook Sun\* Family"); none of them are interactive.

**Acceptance Scenarios**:

1. **Given** the homepage is rendered,
   **When** the user reads the event-info block,
   **Then** all three lines are visible, in the correct order, and not interactive
   (clicks/hovers do nothing).
2. **Given** the viewport is mobile/tablet,
   **When** the page renders,
   **Then** the three lines wrap onto separate rows without overflow.

---

### US5: Switch language between VN and EN (Priority: P2)

**As a** bilingual user
**I want to** switch the homepage between Vietnamese and English
**So that** I can read the page in my preferred language.

**Why this priority**: Content is bilingual and must be switchable; default VN is
acceptable for MVP without the switch.

**Independent Test**: Click the header language button (default "VN") to open the
dropdown; pick "EN" and assert all visible localized strings (hero subtitle, event-info
labels, awards section header, card descriptions, footer copyright, CTA labels)
re-render in English and the language button updates to "EN"; reload and assert the
choice persists via the `saa-locale` cookie.

**Acceptance Scenarios**:

1. **Given** the user is on the homepage with default `VN`,
   **When** they click the language button (`mms_A1.7_Language`,
   `I2167:9091;186:1696`),
   **Then** the language dropdown (`IiLVGkACbt`) opens with exactly two options: `VN`
   and `EN`.
2. **Given** the language dropdown is open,
   **When** the user selects `EN`,
   **Then** the dropdown closes, the button label updates to "EN", and all visible
   localized strings on the homepage re-render in English (per test cases ID-25 and
   ID-26).
3. **Given** the user has selected `EN` and reloads the page,
   **When** the homepage re-renders,
   **Then** the language remains `EN` (cookie-persisted).
4. **Given** the language dropdown is open,
   **When** the user clicks outside the dropdown OR presses `Esc`,
   **Then** the dropdown closes without changing the language.

---

### US6: Manage account session via the header avatar (Priority: P2)

**As a** signed-in user
**I want to** open my account menu from the avatar icon
**So that** I can access my profile, sign out, or (as an admin) reach the admin
dashboard.

**Why this priority**: Sign-out is essential for shared machines; profile + admin
options are convenience features.

**Independent Test**: Click the avatar button (`mms_A1.8_Button-IC`,
`I2167:9091;186:1597`); assert the dropdown opens with `Profile` and `Sign out` for
regular users, plus `Admin Dashboard` for admins; signing out returns to `/login`
without a session cookie.

**Acceptance Scenarios**:

1. **Given** a regular user is on the homepage,
   **When** they click the avatar,
   **Then** dropdown `z4sCl3_Qtk` opens with exactly two items: `Profile`, `Sign out`.
2. **Given** an admin user is on the homepage,
   **When** they click the avatar,
   **Then** dropdown `54rekaCHG1` opens with three items: `Profile`, `Sign out`,
   `Admin Dashboard`.
3. **Given** the avatar dropdown is open,
   **When** the user clicks `Sign out`,
   **Then** the session cookie is cleared and the browser navigates to `/login`.
4. **Given** the avatar dropdown is open,
   **When** the user clicks outside, presses `Esc`, presses `Tab` away, or clicks the
   avatar again,
   **Then** the dropdown closes without other side effects.
5. **Given** an unauthenticated visitor reaches the homepage (per test case ID-0),
   **When** the page renders,
   **Then** the avatar button and notification bell are hidden or replaced by a
   "Sign in" affordance — TODO clarify with stakeholders (see Edge Cases).

---

### US7: Discover and reach the Sun\* Kudos initiative (Priority: P2)

**As a** participant
**I want to** see the Sun\* Kudos promo on the homepage and click into its details
**So that** I can learn about the parallel recognition initiative.

**Why this priority**: Sun\* Kudos is a sibling product surfaced through this page;
without the link users must hunt through the header for it.

**Independent Test**: Open `/`; assert the Sun\* Kudos block (`mms_D1_Sunkudos`,
`3390:10349`) renders the label "Phong trào ghi nhận", title "Sun\* Kudos", a short
description, and a "Chi tiết" button; click the button and assert navigation to the
Sun\* Kudos detail/live-board page (`/sun-kudos` → frame `MaZUn5xHXZ`).

**Acceptance Scenarios**:

1. **Given** the homepage is rendered,
   **When** the user scrolls to the Sun\* Kudos block,
   **Then** all four elements are visible: label, title, description paragraph, and
   "Chi tiết" button (`mms_D2.1_Button-IC`, `I3390:10349;313:8426`).
2. **Given** the user clicks "Chi tiết" inside the Sun\* Kudos block,
   **When** the click resolves,
   **Then** the browser navigates to `/sun-kudos` (Sun\* Kudos live board).

---

### US8: Receive notifications via the header bell (Priority: P3)

**As a** signed-in user
**I want to** see whether I have unread notifications and open the panel to read them
**So that** I do not miss campaign updates.

**Why this priority**: Useful but not blocking — the rest of the page is functional
without it.

**Independent Test**: Sign in as a user with at least one unread notification; open
`/`; assert the bell icon (`mms_A1.6_Notification`, `I2167:9091;186:2101`) shows a red
unread-count badge; click the bell and assert the notification panel opens and shows
the unread items.

**Acceptance Scenarios**:

1. **Given** the user has unread notifications,
   **When** the homepage renders,
   **Then** a red dot / count badge is visible on the bell icon.
2. **Given** the user has zero unread notifications,
   **When** the homepage renders,
   **Then** no badge appears on the bell icon.
3. **Given** the user clicks the bell,
   **When** the click resolves,
   **Then** the notification panel opens (target frame TBD —
   `6-1LRz3vqr` or `gWBVcaSVIf`).
4. **Given** an unauthenticated visitor (test case ID-0),
   **When** the homepage renders,
   **Then** the bell is hidden (no notifications without a session).

---

### US9: Use the floating widget for quick actions (Priority: P3)

**As a** participant
**I want to** open a quick-action menu from the floating bottom-right widget
**So that** I can write a Kudo or read campaign rules without scrolling.

**Why this priority**: Convenience shortcut; primary flows still work without it.

**Independent Test**: Open `/`; assert the widget pill (`mms_6_Widget Button`,
`5022:15169`) is fixed at the bottom-right; click it and assert a quick-action menu
opens with at least two options that link to *Viết Kudo* (`ihQ26W78P2`) and *Thể lệ
SAA* (`b1Filzi9i6`).

**Acceptance Scenarios**:

1. **Given** the user scrolls anywhere on the homepage,
   **When** they look at the bottom-right corner,
   **Then** the widget pill is fixed and remains visible across the scroll.
2. **Given** the user clicks the widget pill,
   **When** the click resolves,
   **Then** a quick-action menu opens with options for *Viết Kudo* and *Thể lệ SAA*.

---

### Edge Cases

- **Public vs. authenticated access** — Test case ID-0 says the homepage MUST display
  for unauthenticated visitors with public content only (no bell, no avatar menu).
  This is in tension with the current implementation (middleware redirects unauth →
  `/login`). The product team MUST decide before implementation: (a) keep the public
  homepage and gate only the auth-only chrome, or (b) keep the auth-only redirect and
  remove ID-0 from scope.
- **Invalid event datetime env** (ID-60) — display fallback, never crash.
- **Award card with missing slug** (ID-62) — fall back to `/awards-information` without
  anchor.
- **Countdown reaches zero** (ID-41/ID-42) — show `00 / 00 / 00`, hide "Coming soon".
- **Click outside / Esc** for any open menu (language, profile, widget) MUST close it
  (ID-31 to ID-35).
- **Unread notifications then user reads them** — the badge MUST disappear without
  requiring a full reload (refresh on visibility change).
- **Session expires while on the homepage** — middleware redirects subsequent requests
  to `/login`; the current page MAY surface a "Session expired" toast on its next API
  call.

---

## UI/UX Requirements *(behavior, not pixels)*

### Page sections

| Region | Component | Node ID | Type | Source of behavior |
|--------|-----------|---------|------|---------------------|
| A1 | Header | `2167:9091` | INSTANCE | shared chrome |
| A1.1 | Logo | `I2167:9091;178:1033` | INSTANCE (button) | click → `/`, scroll-to-top |
| A1.2 | "About SAA 2025" link (selected) | `I2167:9091;186:1579` | INSTANCE (link) | click → `/`; if already at `/`, scroll-to-top |
| A1.3 | "Awards Information" link | `I2167:9091;186:1587` | INSTANCE (link) | click → `/awards-information` |
| A1.5 | "Sun\* Kudos" link | `I2167:9091;186:1593` | INSTANCE (link) | click → `/sun-kudos` |
| A1.6 | Notification bell | `I2167:9091;186:2101` | INSTANCE (button) | click → notification panel; auth-only |
| A1.7 | Language switch | `I2167:9091;186:1696` | INSTANCE (button) | click → language dropdown |
| A1.8 | Account avatar | `I2167:9091;186:1597` | INSTANCE (button) | click → profile dropdown (`z4sCl3_Qtk` or `54rekaCHG1`); auth-only |
| 3.5 | Hero (Keyvisual) | `2167:9027` | GROUP | hosts B1, B2, B3, B4 |
| B1 | Countdown wrapper | `2167:9035` | FRAME | drives DAYS/HOURS/MINUTES tiles |
| B1.2 | "Coming soon" label | `2167:9036` | TEXT | hidden when countdown = 0 |
| B1.3 | Countdown tiles container | `2167:9037` | FRAME | three two-digit tiles |
| B1.3.1 | Days tile | `2167:9038` | FRAME | zero-padded |
| B1.3.2 | Hours tile | `2167:9043` | FRAME | zero-padded |
| B1.3.3 | Minutes tile | `2167:9048` | FRAME | zero-padded; updates every minute |
| B2 | Event info block | `2167:9053` | FRAME | static text, three lines |
| B3 | CTA pair | `2167:9062` | FRAME | hosts B3.1, B3.2 |
| B3.1 | "ABOUT AWARDS" button | `2167:9063` | INSTANCE | click → `/awards-information` |
| B3.2 | "ABOUT KUDOS" button | `2167:9064` | INSTANCE | click → `/sun-kudos` |
| B4 | "Root Further" description | `5001:14827` | GROUP | static text |
| C1 | Awards section header | `2167:9069` | FRAME | static |
| C2 | Awards grid | `5005:14974` | GROUP | hosts C2.1–C2.6 |
| C2.1 | Top Talent card | `2167:9075` | INSTANCE | click → `/awards-information#top-talent` |
| C2.2 | Top Project card | `2167:9076` | INSTANCE | click → `/awards-information#top-project` |
| C2.3 | Top Project Leader card | `2167:9077` | INSTANCE | click → `/awards-information#top-project-leader` |
| C2.4 | Best Manager card | `2167:9079` | INSTANCE | click → `/awards-information#best-manager` |
| C2.5 | Signature 2025 - Creator card | `2167:9080` | INSTANCE | click → `/awards-information#signature-2025-creator` |
| C2.6 | MVP card | `2167:9081` | INSTANCE | click → `/awards-information#mvp` |
| D1 | Sun\* Kudos promo | `3390:10349` | INSTANCE | hosts D2 |
| D2 | Sun\* Kudos content | `I3390:10349;313:8419` | FRAME | label + title + description + CTA |
| D2.1 | "Chi tiết" CTA | `I3390:10349;313:8426` | INSTANCE | click → `/sun-kudos` |
| 6 | Floating widget | `5022:15169` | INSTANCE | click → quick-action menu |
| 7 | Footer | `5001:14800` | INSTANCE | hosts logo + 3 nav links + "Tiêu chuẩn chung" link + copyright |
| 7.1 | Footer logo | `I5001:14800;342:1408` | INSTANCE | click → `/` scroll-to-top |
| 7.2 | Footer "About SAA 2025" link | `I5001:14800;342:1410` | INSTANCE | click → `/` (scroll-to-top if already there) |
| 7.3 | Footer "Awards Information" link | `I5001:14800;342:1411` | INSTANCE | click → `/awards-information` |
| 7.4 | Footer "Sun\* Kudos" link | `I5001:14800;342:1412` | INSTANCE | click → `/sun-kudos` |
| 7.5 | Footer "Tiêu chuẩn chung" link | `I5001:14800;1161:9487` | INSTANCE | click → community-standards page (`Dpn7C89--r`) |

### Component Behavior detail

- **Cards (US2)** have **three distinct click targets** (image, title, "Chi tiết" link)
  but they all resolve to the same destination URL. Implementations MAY make the entire
  card a single `<Link>` provided the inner targets retain their roles for accessibility
  and analytics.
- **Awards Information anchor map** uses a kebab-case slug derived from the category
  name. Slugs above are derived; the canonical slug list MUST be confirmed during
  implementation when the Awards Information frame is processed.
- **Hover effects** are documented (lift/glow on cards, highlight on links, hover state
  on CTAs) but specific styling is sourced via `query_section` at implementation time.

### Navigation Flow (sourced from `.momorph/contexts/SCREENFLOW.md`)

- **Incoming**:
  - `GzbNeVGJHz` Login → on Google OAuth success → Homepage SAA.
  - `GzbNeVGJHz` Login → auto-redirect when session valid.
  - Any authenticated screen → header logo click → Homepage SAA scroll-to-top.
- **Outgoing**:
  - Header logo / footer logo / "About SAA 2025" link (selected) → `/` (scroll-to-top
    when already on the homepage).
  - "Awards Information" (header A1.3 / footer 7.3) / "ABOUT AWARDS" CTA / award cards →
    `/awards-information` (with anchor for cards).
  - "Sun\* Kudos" (header A1.5 / footer 7.4) / "ABOUT KUDOS" CTA / "Chi tiết" in D1 →
    `/sun-kudos` (frame `MaZUn5xHXZ`).
  - Header bell → notification panel (frame TBD).
  - Header language → language dropdown (`IiLVGkACbt`).
  - Header avatar → profile dropdown (`z4sCl3_Qtk` regular / `54rekaCHG1` admin).
  - Profile dropdown "Sign out" → clears session → `/login`.
  - Floating widget → quick-action menu → "Viết Kudo" (`ihQ26W78P2`) / "Thể lệ SAA"
    (`b1Filzi9i6`).
  - Footer "Tiêu chuẩn chung" → community-standards page (`Dpn7C89--r`).
- **Conditional**:
  - Session invalid / expired → middleware redirects to `/login`.
  - Domain not allowed → 403 (`T3e_iS9PCL`) — but this is enforced at sign-in, not on
    homepage.
  - Role = admin → avatar dropdown gains the "Admin Dashboard" entry.
  - Unread notifications > 0 → red badge visible.

### Visual / Accessibility Requirements (non-prescriptive)

- Responsive: awards grid is **3 columns desktop**, **2 columns tablet/mobile**
  (ID-15 / ID-16). Hero, event info, and Sun\* Kudos block stack on smaller widths.
- Countdown auto-update cadence: **once per minute** (ID-39).
- Keyboard a11y: all dropdowns (language, account avatar, widget) MUST open on
  `Enter`/`Space`, close on `Esc` or click-outside, and trap focus (ID-30 to ID-35).
- Bell badge MUST be conveyed to screen readers as well as colour (e.g.,
  `aria-label="2 unread notifications"`).
- All visible copy MUST be sourced from the i18n dictionary; no hard-coded strings.

> Pixel-level styling, colours, fonts, asset paths are intentionally out of scope; the
> implementation step retrieves them via `query_section` / `get_media_files`.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The homepage MUST render the keyvisual hero with title "ROOT FURTHER",
  optional "Coming soon" subtitle, three zero-padded countdown tiles (Days, Hours,
  Minutes), and a static event-info block.
- **FR-002**: The countdown MUST update in the browser at least every minute and MUST
  hide the "Coming soon" label and stop at `00 / 00 / 00` once the event datetime is
  reached.
- **FR-003**: The page MUST render exactly six award cards in the order Top Talent →
  Top Project → Top Project Leader → Best Manager → Signature 2025 - Creator → MVP.
- **FR-004**: Every award card MUST treat image, title, description (where applicable),
  and "Chi tiết" link as click targets that navigate to
  `/awards-information#<category-slug>`.
- **FR-005**: Header navigation MUST behave as documented in the Component Behavior
  table; clicking the active "About SAA 2025" link while already on `/` MUST scroll to
  top.
- **FR-006**: The language switch MUST default to `VN`, MUST offer exactly `VN` and
  `EN`, and MUST persist the choice via the `saa-locale` cookie shared with Login.
- **FR-007**: The account avatar dropdown MUST show `Profile` + `Sign out` for regular
  users and additionally `Admin Dashboard` for users with the admin role; clicking
  `Sign out` MUST clear the session cookie and redirect to `/login`.
- **FR-008**: The notification bell MUST surface a count badge when unread > 0 and MUST
  be hidden for unauthenticated visitors (decision pending — see Edge Cases).
- **FR-009**: The Sun\* Kudos block MUST display label, title, description, and CTA;
  the CTA MUST navigate to `/sun-kudos`.
- **FR-010**: The floating widget MUST be fixed at the bottom-right and open a
  quick-action menu with at least *Viết Kudo* and *Thể lệ SAA* targets.
- **FR-011**: The footer MUST display logo + four nav links + copyright text "Bản
  quyền thuộc về Sun\* © 2025" with the same navigation behaviour as the header.

### Technical Requirements

- **TR-001 (Configuration)**: The event start datetime MUST come from a single ISO-8601
  env value (e.g., `EVENT_START_AT=2025-12-31T18:30:00+07:00`) so the countdown is
  configurable without a code change.
- **TR-002 (Performance)**: Initial render MUST display the hero + first row of award
  cards within the LCP budget; the keyvisual asset MUST be `priority`-loaded.
- **TR-003 (Security)**: All auth-only chrome (notifications, account menu) MUST be
  driven by the server-side session check; the client MUST NOT fabricate role state.
- **TR-004 (Accessibility)**: WCAG 2.1 AA — keyboard reachable, focus visible, ARIA
  roles on dropdowns and the bell badge.
- **TR-005 (i18n)**: All visible copy MUST be sourced from the dictionary; the
  homepage MUST be re-renderable into either VN or EN without code changes.

### Key Entities

- **Event**: `{ id, slug: "saa-2025", startAt: ISO-8601, location, livestreamNote }`.
- **AwardCategory**: `{ slug, name (VN/EN), shortDescription (VN/EN), thumbnailKey }`
  — six fixed entries for MVP.
- **CurrentUser** (extends `AuthSession` from Login): `{ userId, email, displayName,
  avatarUrl, domain, role: "user" | "admin" }`.
- **Notification** (lightweight): `{ id, title, body, link?, readAt? }`.

---

## API Dependencies *(predicted)*

| Endpoint | Method | Purpose | Triggered by | Status |
|----------|--------|---------|--------------|--------|
| `/api/events/saa-2025` | GET | Returns the event's `startAt`, location, livestream note. | Page server-render (US1, US4) | Predicted |
| `/api/auth/session` | GET | Returns current user incl. role for chrome decisions. | Page server-render (US3, US6) | Exists (Login spec) |
| `/api/notifications/unread-count` | GET | Drives the bell badge. | Page mount + visibility change (US8) | Predicted |
| `/api/notifications` | GET | Returns notification list for the panel. | Bell click (US8) | Predicted |
| `/api/awards/categories` | GET | Returns the six category entries (or static for MVP). | Page server-render (US2) | Predicted |
| `/api/i18n/locales` | GET | Lists supported locales. | Language dropdown open (US5) | Exists (Login spec) |
| `/api/i18n/preference` | PUT | Persists a chosen locale. | Locale selection (US5) | Predicted |
| `/api/auth/sign-out` | POST | Clears session. | Avatar → "Sign out" (US6) | Exists (Login spec) |

> Award category data MAY be static (bundled in the dictionary) for MVP; the API only
> becomes load-bearing when categories become editable from the admin dashboard.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of homepage page views show all six award cards and the hero+countdown
  on the first paint (no FOUC, no skeleton stuck longer than 1 s).
- **SC-002**: 100% of award-card clicks resolve to the correct anchor on
  `/awards-information` (verified by automated link checker, ID-59).
- **SC-003**: Countdown drift after one minute is ≤ 2 seconds (ID-39).
- **SC-004**: Language switch updates all visible localized strings (no untranslated
  copy detected by an automated screenshot diff between VN and EN).
- **SC-005**: Avatar dropdown shows the *Admin Dashboard* entry to ≥ 99% of admin
  users (ID-37) and never shows it to regular users (ID-38).

---

## State Management

- **Local component state**:
  - `languageMenuOpen`, `accountMenuOpen`, `widgetMenuOpen`, `notificationPanelOpen` —
    booleans, mutually exclusive only loosely (each closes on `Esc` / outside-click).
  - `unreadCount` — fetched on mount, optimistic to 0 when the panel is opened.
- **Global / app-level state**:
  - `currentUser` — server-side via session JWT (from Login spec).
  - `currentLocale` — cookie-backed `saa-locale`; same store as Login.
  - `eventStartAt` — server-supplied at SSR; client only re-derives the countdown
    delta locally.
- **Server state caching**:
  - `currentUser`, `eventStartAt` — read at SSR per request, no client cache.
  - `awards/categories` — cacheable (low cardinality, rarely changes).
  - `notifications/unread-count` — short cache (<= 30 s) with refetch on tab-focus.
- **Optimistic updates**:
  - Marking notifications as read MAY decrement the badge optimistically; the panel
    interactions are scoped to a separate spec.

---

## Out of Scope

- The *Awards Information* destination page (separate spec).
- The *Sun\* Kudos* live-board destination page (separate spec; frame `MaZUn5xHXZ`).
- The Notification panel content/behavior (separate spec; frame TBD).
- The Profile dropdown's items (Profile / Sign out / Admin Dashboard) — covered by the
  *Dropdown-profile* specs (`z4sCl3_Qtk` / `54rekaCHG1`).
- The Language dropdown overlay (`IiLVGkACbt`) content — owned by its own spec.
- The 403 access-denied page — already handled by the Login spec.
- Visual styling (colours, fonts, asset paths, spacing) — fetched on-demand at
  implementation time per Constitution Principle IV.
- Detailed contents of the floating widget's quick-action menu — the menu is referenced
  but the menu's options live in the *Widget* component spec.

---

## Dependencies

- [x] Constitution document exists ([`.momorph/constitution.md`](../../constitution.md)) — current version v1.2.0
- [x] Screen flow documented ([`.momorph/contexts/SCREENFLOW.md`](../../contexts/SCREENFLOW.md))
- [x] Per-screen detail ([`.momorph/contexts/screen_specs/homepage-saa.md`](../../contexts/screen_specs/homepage-saa.md))
- [x] Login spec exists ([`../GzbNeVGJHz-Login/spec.md`](../GzbNeVGJHz-Login/spec.md))
- [ ] API specifications available (`.momorph/contexts/api-docs.yaml`) — not yet generated
- [ ] *Awards Information* spec — required to lock final category slugs
- [ ] *Sun\* Kudos live board* spec — required to confirm `/sun-kudos` route name
- [ ] *Dropdown-profile* specs — required for US6 detail
- [ ] *Notification panel* spec — required for US8 detail

### Constitution Alignment

- **Principle I — Spec-Driven Development**: this spec + SCREENFLOW.md will drive
  implementation; navigation targets are sourced from the screenflow, not guessed. The
  six award slugs are derived but explicitly flagged as needing confirmation when the
  Awards Information frame is specified.
- **Principle II — Test-First**: the 62 test cases (ID-0 to ID-62) MUST be converted
  to failing tests before implementation begins.
- **Principle III — Layered Architecture**: API calls (`/api/events/saa-2025`,
  `/api/notifications/...`, `/api/awards/categories`) MUST be wrapped behind service
  modules; the page reads via the service layer, not from raw fetches.
- **Principle IV — Design Tokens**: any new tokens introduced for the homepage MUST be
  added to `app/globals.css` with a one-line rationale; no inline magic numbers.
- **Principle V — Type Safety**: all DTOs (`Event`, `AwardCategory`, `Notification`)
  MUST be typed; no `any`.

---

## Notes

- **Public-vs-authenticated access discrepancy** — The original test cases (ID-0)
  describe an unauthenticated experience for this page; the current Login + middleware
  implementation gates the homepage. Reconcile with stakeholders before implementation
  begins; this is the single most impactful open decision in this spec.
- **Slug list to confirm**: `top-talent`, `top-project`, `top-project-leader`,
  `best-manager`, `signature-2025-creator`, `mvp` — these mirror the card titles in
  kebab-case but the *Awards Information* spec MUST be the authoritative source.
- **Sun\* Kudos route name** — the screenflow report uses `/sun-kudos`; confirm with
  the *Sun\* Kudos live board* spec when authored.
- **Notification panel target frame** ambiguous — `6-1LRz3vqr` ("Tất cả thông báo")
  vs. `gWBVcaSVIf` ("View thông báo"). Capture the chosen frame when the Notification
  spec is authored.
- The floating widget is referenced by `mms_6_Widget Button` (`5022:15169`); its
  quick-action menu items live in a sibling spec.
