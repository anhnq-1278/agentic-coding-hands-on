# Feature Specification: Sun* Kudos — Live Board

**Frame ID**: `2940:13431`
**Frame Name**: `Sun* Kudos - Live board`
**Screen ID**: `MaZUn5xHXZ`
**File Key**: `9ypp4enmFmdK3YAFJLIu6C`
**Figma URL**: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/MaZUn5xHXZ
**Created**: 2026-05-18
**Status**: Draft

---

## Overview

The Sun* Kudos Live Board is the **public recognition feed** for the SAA 2025
campaign. It lets authenticated Sunners send thank-you messages ("Kudos") to
colleagues, browse the most-loved Kudos in a Highlight carousel, see the full
chronological feed, explore recipient names in an interactive Spotlight word
cloud, and view personal stats / leaderboards (received-count, sent-count,
hearts, secret boxes) in a right-hand sidebar.

The page is the social heart of SAA 2025: it surfaces who the community is
thanking, by whom, and provides the gamified secret-box and leaderboard
mechanics that the Heads use as input when selecting award winners.

**Reachable from**: Homepage SAA header `Sun* Kudos` link, Homepage footer
link, Homepage `Sun* Kudos` banner, and the same header/footer/promo on the
Awards Information page.

**Primary users**:
- Authenticated Sunners (Sun* employees) — primary actors.
- Unauthenticated visitors — view-only; any interaction redirects to login.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Read the live Kudos feed (Priority: P1)

A signed-in Sunner lands on the Kudos page from Homepage / Awards header /
footer / banner, scans the Highlight carousel for top-loved Kudos, then
scrolls the All Kudos feed to read recent messages and react.

**Why this priority**: This is the page's reason for existing — surfacing
recognition. Without this view, none of the secondary actions matter.

**Independent Test**: Load `/sun-kudos` while signed in. Verify the page
renders Keyvisual, Highlight carousel (5 cards), Spotlight word cloud,
All Kudos infinite-scroll feed, and the sidebar without errors.

**Acceptance Scenarios**:

1. **Given** the user is authenticated and ≥1 Kudos exists, **when** they
   open `/sun-kudos`, **then** the Highlight carousel shows the top 5 most-
   loved Kudos, All Kudos shows the chronological feed, and Spotlight shows
   a word cloud of recipient names with a total count label (e.g. "388
   KUDOS").
2. **Given** no Kudos exist in the system, **when** the user opens the page,
   **then** Highlight, All Kudos, and Spotlight each display the empty
   message `Hiện tại chưa có Kudos nào.`
3. **Given** the user is unauthenticated, **when** they open the page or
   click any interactive element, **then** the system redirects to `/login`
   with `returnTo=/sun-kudos`.

---

### User Story 2 — Send a Kudos (Priority: P1)

An authenticated Sunner clicks the prominent "Hôm nay, bạn muốn gửi lời cảm
ơn và ghi nhận đến ai?" input below the banner, fills the send-Kudos dialog,
and submits. The new Kudos becomes visible in the feed.

**Why this priority**: Sending Kudos is the page's only write action and
the source of all displayed data. P1 alongside reading.

**Independent Test**: Click the A.1 input; verify dialog opens; submit a
non-empty Kudos with a recipient; verify it persists and appears at the top
of All Kudos.

**Acceptance Scenarios**:

1. **Given** the user is authenticated, **when** they click the A.1 input
   pill, **then** the send-Kudos dialog opens.
2. **Given** the dialog is open with an empty body, **when** they attempt to
   submit, **then** the Submit button is disabled (required-field check).
3. **Given** the dialog has a valid recipient + non-empty message, **when**
   they submit, **then** the Kudos is persisted, the dialog closes, and the
   new Kudos appears at the top of All Kudos without a full page reload.
4. **Given** the user is unauthenticated, **when** they click the input pill,
   **then** they are redirected to `/login?returnTo=/sun-kudos`.

---

### User Story 3 — React (Heart) and copy-link on a Kudos (Priority: P1)

While reading Kudos, the user toggles a heart on a card to express
appreciation, sees the count update, and can copy a shareable link.

**Why this priority**: Hearts feed the Highlight ranking algorithm and the
sender's "hoa thị" (star) thresholds — they're integral to the gamification
loop and must work from day 1.

**Independent Test**: Open a Kudos not authored by the current user;
verify heart toggles count ±1; copy-link writes to clipboard and shows the
toast.

**Acceptance Scenarios**:

1. **Given** the user has not yet hearted a Kudos, **when** they click the
   heart, **then** the heart fills (color toggles), the count increments
   by 1, and the state persists across refresh.
2. **Given** the user has already hearted a Kudos, **when** they click the
   heart again, **then** the heart unfills, the count decrements by 1.
3. **Given** the user is the sender of a Kudos, **when** they view their own
   card, **then** the heart button is disabled (no self-hearting).
4. **Given** an admin has configured a "special day" for the date a Kudos
   was created, **when** any other user hearts it, **then** the sender's
   account is credited **+2 hearts** instead of +1 (admin-configured rule).
5. **Given** the user clicks "Copy Link", **then** the kudos URL is written
   to the clipboard and a toast `Link copied — ready to share!` is shown.
6. **Given** the user attempts to heart twice from the same account, **then**
   the second click is treated as an unheart (toggle behavior), not as a
   second +1.

---

### User Story 4 — Filter the feed by hashtag or department (Priority: P2)

A user clicks the **Hashtag** or **Phòng ban** filter, selects a value, and
both the Highlight carousel and All Kudos feed scope to matching Kudos.
Clicking a hashtag chip inside any card applies the same hashtag filter.

**Why this priority**: Without filters the page is usable, but for a 388+
Kudos board, scoping by category is essential for relevance — P2.

**Independent Test**: Open Hashtag dropdown, pick `IDOL GIỚI TRẺ`, verify
Highlight + All Kudos both refresh to show only matching items. Clear filter
and verify full list returns.

**Acceptance Scenarios**:

1. **Given** ≥1 hashtag exists in the database, **when** the user clicks
   `Hashtag` (B.1.1), **then** a dropdown of all known hashtags opens.
2. **Given** the user selects a hashtag, **when** the selection is applied,
   **then** Highlight (carousel B.2) AND All Kudos (Frame 502 / C.2)
   refresh to show only Kudos containing that hashtag.
3. **Given** the user selects `Phòng ban` (B.1.2) → e.g. `Marketing`,
   **then** both sections scope to Kudos where sender OR recipient belongs
   to Marketing. (Exact scoping rule — sender, recipient, or either —
   **NEEDS CONFIRMATION**; recommended default: either.)
4. **Given** a hashtag chip is rendered on any card (B.4.3 or C.3.7) or any
   D.4 category chip, **when** the user clicks it, **then** the Hashtag
   filter is set to that value and both sections scope accordingly.
5. **Given** filters are applied and no Kudos match, **then** both sections
   show `Hiện tại chưa có Kudos nào.`
6. **Given** the user clears the filter (re-open dropdown → clear /
   deselect), **then** the unfiltered feed is restored.

---

### User Story 5 — Navigate the Highlight carousel (Priority: P2)

The user steps through the top-5 most-loved Kudos using prev/next arrows
and/or the slide pager.

**Why this priority**: Necessary to consume all 5 highlights; carousel
navigation has higher friction than scroll, but the feed still functions
without it.

**Independent Test**: Verify Next on slide 5 is disabled; Prev on slide 1
is disabled; clicking the middle pager number shows the current slide.

**Acceptance Scenarios**:

1. **Given** the carousel shows slide 1 of 5, **when** the user clicks
   Next (B.2.2 / B.5.3), **then** slide 2 becomes active and the pager
   label updates (e.g. `2/5`).
2. **Given** the user is on slide 1, **then** Prev (B.2.1 / B.5.1) is
   disabled.
3. **Given** the user is on slide 5, **then** Next is disabled.
4. **Given** the user clicks the active highlight card or its "Xem chi
   tiết" button, **then** the Kudos detail page opens for that Kudos.
5. **Given** message text exceeds 3 lines, **then** the displayed message
   is truncated with "…".

---

### User Story 6 — Explore Spotlight word cloud (Priority: P2)

The user pans/zooms the Spotlight board, searches for a Sunner by name, and
clicks a node to open the underlying Kudos detail.

**Why this priority**: Cool exploration tool but not on the critical path
for sending or reading Kudos.

**Independent Test**: Hover a node → verify tooltip `name + time received`.
Click → verify Kudos detail page opens. Toggle Pan/Zoom button → verify
mode flips. Type 100 chars in search → verify search runs. Type 101 →
verify rejection.

**Acceptance Scenarios**:

1. **Given** Spotlight is loaded with ≥1 recipient, **when** the user
   hovers a node, **then** a tooltip shows `recipient name — time of
   most-recent Kudos received`.
2. **Given** the user clicks a node, **then** the Kudos detail page opens
   for that recipient's most-recent Kudos (exact target Kudos behavior
   **NEEDS CONFIRMATION** — most-recent vs. random vs. picker).
3. **Given** the user types ≤100 characters in the B.7.3 search and
   presses Enter or clicks the search icon, **then** the matching node is
   focused / highlighted.
4. **Given** the user types >100 characters, **then** the system rejects
   the input with an error.
5. **Given** the user submits an empty search query, **then** submission is
   blocked and a required-field message is shown.
6. **Given** the user clicks Pan/Zoom (B.7.2), **then** the interaction
   mode flips between pan and zoom; tooltip on hover reads `Pan` or `Zoom`
   accordingly.
7. **Given** Spotlight has no data, **then** an empty state is shown
   (copy: `Hiện tại chưa có Kudos nào.`).
8. **Given** Spotlight is still loading, **then** a loading indicator is
   shown.

---

### User Story 7 — Sidebar stats and Secret Box (Priority: P3)

The sidebar (D) shows the current user's personal stats (received-count,
sent-count, hearts-received, secret boxes opened, secret boxes pending),
plus two leaderboards: "10 SUNNER NHẬN QUÀ MỚI NHẤT" and "10 SUNNER thăng
hạng". The user can click "Mở quà" (D.1.8) to open a pending Secret Box.

**Why this priority**: Engagement layer for the gamification loop. Not
critical for first ship but planned for the campaign.

**Independent Test**: With a user that has ≥1 unopened secret box, click
"Mở quà" → verify dialog opens. With no secret boxes, verify D.1.8 is
disabled or hidden (**NEEDS CONFIRMATION** — disabled vs hidden).

**Acceptance Scenarios**:

1. **Given** the user has unopened secret boxes, **when** they click "Mở
   quà" (D.1.8), **then** the Secret Box dialog opens.
2. **Given** the sidebar has data, **then** each row shows the metric label
   and current value (received-count / sent-count / hearts-received /
   secret-boxes-opened / secret-boxes-pending).
3. **Given** the leaderboard list is empty, **then** it shows `Chưa có dữ
   liệu`.
4. **Given** the user clicks any leaderboard member's avatar or name, **then**
   the member's profile page opens; hovering shows a profile preview card.

---

### User Story 8 — Open profile / Kudos detail navigation (Priority: P2)

From any sender/recipient avatar or name (Highlight, All Kudos, Spotlight,
Sidebar leaderboards), click navigates to the corresponding profile page.
From any Kudos card content area, "Xem chi tiết" button, or Spotlight node,
click navigates to the Kudos detail page.

**Why this priority**: Drill-in flow is core to discovering people and
specific Kudos but not for reading the feed itself.

**Independent Test**: Click sender avatar on a Highlight card → profile
page opens. Click "Xem chi tiết" on any card → kudos detail page opens.
Unauthenticated user clicking either → redirected to login.

**Acceptance Scenarios**:

1. **Given** the user clicks a sender or recipient avatar/name anywhere
   on the screen, **then** that user's profile page opens.
2. **Given** the user clicks an image thumbnail in C.3.6 gallery, **then**
   the image opens in a full-size viewer/lightbox.
3. **Given** the user clicks a Kudos card body, "Xem chi tiết" (B.4.4 /
   "View Details"), or a Spotlight node, **then** the Kudos detail page
   opens.
4. **Given** the user is unauthenticated and attempts any of the above,
   **then** the system redirects to `/login?returnTo=/sun-kudos`.

---

### Edge Cases

- **Empty global state** — no Kudos exist at all → all three feed sections
  show `Hiện tại chưa có Kudos nào.`; sidebar leaderboards show `Chưa có
  dữ liệu`; total-count label shows `0 KUDOS`.
- **Hashtag filter yields zero** → Highlight and All Kudos both show
  `Hiện tại chưa có Kudos nào.`; Spotlight scoping behavior under filter
  **NEEDS CONFIRMATION** (assume same scope).
- **Image gallery >5** — backend should clamp to 5 (test cases call out
  "Kudos post with thumbnail images (max 5 images)"); excess images are not
  rendered.
- **Hashtag chips >5 on a single card** — design caps at "max 5 per row";
  overflow behavior **NEEDS CONFIRMATION** (clip vs wrap).
- **Truncation** — Highlight card message truncates at 3 lines; All Kudos
  card message truncates at 5 lines; both use ellipsis.
- **Long Sunner name in Spotlight** — node label rendering / clipping rule
  **NEEDS CONFIRMATION**.
- **Special-day +2 hearts** — if multiple users heart the same Kudos on a
  special day, each contributes +2 to the sender's running heart total.
  Display count on the card increments by +1 per click (assumption — the
  +2 applies to the sender's leaderboard stat, not the card counter;
  **NEEDS CONFIRMATION**).
- **Sender hearting own Kudos** — heart button is disabled; clicking has
  no effect.
- **Search field validation** — max 100 chars; empty submit blocked.
- **Concurrent submissions** — if the user submits a Kudos and immediately
  hearts a sibling Kudos, both operations should resolve independently.
- **Star (hoa thị) thresholds** — 1 ★ at 10 Kudos received, 2 ★ at 20, 3 ★
  at 50 (per Spec Agent summary); tooltip explains.
- **Network failure on heart toggle** — optimistic UI should revert the
  toggle if the server rejects.
- **Network failure on send-Kudos submit** — keep the dialog open, show
  inline error; do not close until success.
- **Locale switch** — placeholder texts and copy MUST localize via the
  shared `dictionary.ts` (no hard-coded Vietnamese in the JSX).

---

## UI/UX Requirements *(from Figma)*

### Screen Components

| Component | Frame / Node ID | Description | Interactions |
|---|---|---|---|
| Keyvisual banner | `2940:13432` (`A_KV Kudos` 2940:13437) | Hero with "SAA 2025 KUDOS" logo + "Hệ thống ghi nhận lời cảm ơn" title | View-only |
| App Header | `2940:13433` | Shared chrome (logo / nav links / language / notification / profile) | Reused from existing `AppHeader` |
| A.1 Send-Kudos input pill | `2940:13449` | Pill button with pencil icon + placeholder `Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?` | Click → opens send-Kudos dialog |
| B.1.1 Hashtag filter | `2940:13459` | Dropdown filter (active state shows selection) | Click → opens hashtag dropdown |
| B.1.2 Phòng ban filter | `2940:13460` | Dropdown filter (active state shows selection) | Click → opens department dropdown |
| B.2 Highlight carousel | `2940:13461` | Top-5 most-loved Kudos | Prev/Next arrows + slide pager |
| B.2.1 / B.2.2 Carousel arrows | `2940:13470` / `2940:13468` | Prev / Next | Click navigates slide; disabled at ends |
| B.5 Slide pager | `2940:13471` | `<prev> N/5 <next>` | Same arrows + read-only label |
| B.3 Highlight Kudos card | `2940:13465` | One repeating card (sender, recipient, message, hashtags, actions) | Click body or "Xem chi tiết" → Kudos detail |
| B.3.1 / B.3.5 Avatars | within B.3 | Sender / recipient avatar | Click → profile; hover → preview |
| B.4.1 Timestamp | within B.3 | `HH:mm - MM/DD/YYYY` | View-only |
| B.4.2 Message | within B.3 | Truncated 3 lines + `…` | Click → Kudos detail |
| B.4.3 Hashtags row | within B.3 | Up to 5 hashtag chips | Click chip → sets Hashtag filter |
| B.4.4 Action bar | within B.3 | Heart toggle + count, Copy Link, Xem chi tiết | See US3 / US8 |
| B.6 Header — Spotlight | `2940:13476` | "Sun* Annual Awards 2025" eyebrow + "SPOTLIGHT BOARD" title | View-only |
| B.7 Spotlight word cloud | `2940:14174` | Recipient-name word cloud (118 children) | Pan/zoom; hover tooltip; click node → Kudos detail |
| B.7.1 Total count label | `3007:17482` | e.g. "388 KUDOS" | View-only, live-bound to feed total |
| B.7.2 Pan/Zoom toggle | `3007:17479` | Mode switch | Click toggles pan ↔ zoom |
| B.7.3 Sunner search | `2940:14833` | Input + magnifier; placeholder `Tìm kiếm` | Submit on Enter / icon-click; max 100 chars; non-empty required |
| C.1 Header — All Kudos | `2940:14221` | Eyebrow + "ALL KUDOS" title | View-only |
| C.2 All Kudos list | `2940:13482` | Infinite-scroll feed of `KUDOpost` cards | Scroll; click card → detail |
| C.3 KUDOpost card | `3127:21871` / `3127:22053` / `3127:22375` / `3127:22439` | Repeating | Sender, recipient, message, gallery, hashtags, action bar |
| C.3.6 Gallery | within C.3 | Up to 5 thumbnails | Click thumb → full-size viewer |
| C.4.1 Heart | `I3127:21871;256:5175` | Like toggle | See US3 |
| C.4.2 Copy Link | within C.4 | Clipboard copy | See US3 |
| D Sidebar | within C | Stats + leaderboards | See US7 |
| D.1.8 "Mở quà" button | `2940:13497` | Open Secret Box | Click → opens dialog |
| D.3 "10 SUNNER NHẬN QUÀ MỚI NHẤT" | within D | Leaderboard list (avatar, name, gift) | Click member → profile; hover → preview |
| Footer | `2940:13522` | Shared chrome | Reused from existing `AppFooter` |

### Navigation Flow

- **From**: Homepage SAA (header link / footer link / "Sun*Kudos banner");
  Awards Information (header link / footer link / `D1_Sunkudos` promo);
  Login redirect after authentication (when `returnTo=/sun-kudos`).
- **To**: Profile page (avatar/name click — destination route TBD,
  **NEEDS CONFIRMATION**); Kudos detail page (route TBD); Login (when
  unauthenticated); Send-Kudos dialog (in-page modal); Secret-Box dialog
  (in-page modal); Lightbox/image viewer (in-page).
- **Self anchors**: none — single-page layout; no in-page scrollspy
  expected.

### Visual Requirements

- Responsive breakpoints: desktop primary (≥1024px); tablet and mobile
  layouts **NEEDS CONFIRMATION** (single Figma frame is desktop).
- Animations / transitions: carousel slide transitions; heart toggle
  state change; hover preview popovers; Spotlight pan/zoom inertia.
- Accessibility: WCAG AA — keyboard navigation across Highlight carousel
  arrows, dropdowns, send-Kudos pill, sidebar buttons; `aria-pressed` on
  heart toggle; `aria-current` on carousel pager; alt text on avatars and
  gallery images; live region for "Link copied" toast.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST gate all interactions behind authentication —
  unauthenticated users see view-only chrome and any click action
  redirects to `/login?returnTo=/sun-kudos`.
- **FR-002**: System MUST display the Highlight carousel containing the
  top 5 Kudos ordered by total heart count (descending), scoped by any
  active Hashtag / Phòng ban filter.
- **FR-003**: System MUST display the All Kudos feed in reverse-chronological
  order with infinite-scroll pagination (no numbered pagination).
- **FR-004**: System MUST render the Spotlight word cloud showing recipient
  names sized proportional to their received-Kudos count, with pan and zoom
  interactions and a total-count label.
- **FR-005**: Users MUST be able to send a Kudos via the A.1 input pill →
  send-Kudos dialog; submission requires a non-empty message and a
  recipient.
- **FR-006**: Users MUST be able to filter both Highlight and All Kudos by
  Hashtag (B.1.1) and by Phòng ban (B.1.2); selecting a hashtag chip on a
  card (B.4.3 / C.3.7 / D.4) MUST apply the Hashtag filter.
- **FR-007**: Users MUST be able to toggle a heart on any Kudos NOT
  authored by themselves; one heart per (user, kudos) — re-clicking
  unhearts. Self-hearting MUST be disabled.
- **FR-008**: System MUST credit the sender's heart total by +1 on a normal
  heart and **+2** when the Kudos was created on an admin-configured
  "special day".
- **FR-009**: Users MUST be able to copy a shareable Kudos URL via the
  Copy Link button; the system MUST show a `Link copied — ready to share!`
  toast on success.
- **FR-010**: System MUST navigate to the profile page when a sender /
  recipient / leaderboard member avatar or name is clicked.
- **FR-011**: System MUST navigate to the Kudos detail page when a card
  body, "Xem chi tiết" button, or Spotlight node is clicked.
- **FR-012**: System MUST open the Secret Box dialog when D.1.8 "Mở quà"
  is clicked; the button SHOULD be disabled when no unopened boxes
  remain (final disabled-vs-hidden behavior **NEEDS CONFIRMATION**).
- **FR-013**: System MUST display the empty message `Hiện tại chưa có
  Kudos nào.` in any of Highlight, All Kudos, or Spotlight when their
  scoped data set is empty.
- **FR-014**: System MUST display `Chưa có dữ liệu` for empty sidebar
  leaderboards.
- **FR-015**: Spotlight search input MUST accept up to 100 characters and
  reject inputs above 100 with an inline error; empty submissions MUST be
  blocked with a required-field message.
- **FR-016**: Send-Kudos dialog submit button MUST be disabled while the
  message body is empty.
- **FR-017**: System MUST display the star (hoa thị) badge tier in each
  sender/recipient info block per the campaign rules: 1★ ≥10 Kudos
  received, 2★ ≥20, 3★ ≥50.
- **FR-018**: System MUST refresh Highlight and All Kudos when filters
  change; the carousel resets to slide 1.
- **FR-019**: All Kudos cards MUST truncate the message at 5 lines with
  ellipsis; Highlight cards truncate at 3 lines.
- **FR-020**: System MUST render at most 5 image thumbnails per Kudos
  gallery; clicking a thumbnail opens a full-size viewer.
- **FR-021**: System MUST render at most 5 hashtag chips per card row;
  overflow behavior **NEEDS CONFIRMATION**.
- **FR-022**: All static copy (placeholders, empty states, toasts, button
  labels) MUST be sourced from `dictionary.ts` keyed by `Locale` — no
  hard-coded Vietnamese in JSX.
- **FR-023**: Page MUST render the AppHeader (with `currentPath=/sun-kudos`)
  and AppFooter shared with Homepage / Awards Information.

### Technical Requirements

- **TR-001 (Perf)**: All Kudos feed MUST page in batches (e.g. 20 items)
  via infinite scroll; initial paint MUST not require the full dataset.
- **TR-002 (Perf)**: Spotlight word cloud MUST handle up to 1000 nodes at
  60fps pan/zoom on a 2020-era MacBook.
- **TR-003 (Security)**: Heart toggle and send-Kudos requests MUST be
  authenticated; self-hearting MUST be enforced server-side (not only
  client-disabled).
- **TR-004 (Security)**: Copy Link clipboard write MUST only target the
  user's own clipboard via the Async Clipboard API; fall back to
  `document.execCommand('copy')` for older browsers.
- **TR-005 (State)**: Filter state (Hashtag, Phòng ban) MUST be reflected
  in the URL via query params so deep links can scope the feed.
- **TR-006 (a11y)**: All interactive elements MUST be keyboard-reachable
  in logical reading order; carousel arrows announce `Trang X/5` to screen
  readers.
- **TR-007 (i18n)**: Page MUST localize via the existing `Locale` cookie
  + `dictionary.ts` flow used by Homepage / Awards / Countdown.
- **TR-008 (Defence-in-depth)**: Although the middleware gates the route,
  the page route handler MUST re-check session and `redirect('/login')`
  on miss.

### Key Entities *(if feature involves data)*

- **Kudos**: id, senderId, recipientId, message (text), hashtags
  (`string[]`), images (`url[]`, ≤5), createdAt, heartsCount,
  isHeartedByCurrentUser, isSpecialDay (boolean — admin-configured),
  detailUrl.
- **User (Sunner)**: id, displayName, email, avatarUrl, department,
  starsCount (1–3), receivedCount, sentCount, heartsReceived,
  secretBoxesOpened, secretBoxesPending.
- **Hashtag**: tag (string, e.g. `IDOL GIỚI TRẺ`), kudosCount (for
  dropdown ordering).
- **Department**: id, name (e.g. `Marketing`), kudosCount.
- **SpecialDay (admin)**: date, multiplier (default 2), createdBy.
- **SecretBox**: id, userId, status (`opened` | `pending`), rewardId,
  openedAt.
- **LeaderboardEntry** (D.3): rank, userId, displayName, avatarUrl, gift
  description.
- **SpotlightNode**: recipientId, displayName, kudosCount (for size),
  mostRecentKudosId, mostRecentReceivedAt.

---

## API Dependencies

| Endpoint | Method | Purpose | Status |
|---|---|---|---|
| `/api/auth/session` | GET | Read current user (gate page) | Exists |
| `/api/users/me` | GET | User stats for sidebar | Predicted |
| `/api/kudos/highlight?hashtag=&department=` | GET | Top-5 most-loved (scoped) | Predicted |
| `/api/kudos/feed?cursor=&limit=20&hashtag=&department=` | GET | Paged All Kudos | Predicted |
| `/api/kudos/spotlight?hashtag=&department=&q=` | GET | Spotlight nodes (word cloud) | Predicted |
| `/api/kudos` | POST | Send a Kudos | Predicted |
| `/api/kudos/:id/heart` | POST | Toggle heart (server enforces toggle + self-hearting block + special-day multiplier) | Predicted |
| `/api/hashtags` | GET | Dropdown options (B.1.1) | Predicted |
| `/api/departments` | GET | Dropdown options (B.1.2) | Predicted |
| `/api/leaderboards/recent-gifts?limit=10` | GET | Sidebar D.3 list | Predicted |
| `/api/leaderboards/rank-ups?limit=10` | GET | Sidebar second list | Predicted |
| `/api/secret-boxes/open` | POST | Open the next pending box | Predicted |
| `/api/notifications/unread-count` | GET | Header badge (shared) | Exists |

> Endpoint shapes and auth header conventions to be defined in
> `.momorph/contexts/api-docs.yaml` — this list is a **prediction** based
> on observed UI behavior.

---

## State Management

- **Local component state**:
  - Send-Kudos dialog open/closed + draft body + selected recipient.
  - Carousel current slide index.
  - Spotlight pan/zoom mode + viewport transform.
  - Spotlight search input draft.
  - Optimistic heart toggle (`isHearted`, `heartsCount`) per card.
- **URL state** (per TR-005):
  - `?hashtag=` and `?department=` filter selections.
  - Initial slide (optional — `?slide=` for deep links into a specific
    Highlight) — **NICE-TO-HAVE**, P3.
- **Server cache / invalidation**:
  - `kudos/feed`, `kudos/highlight`, `kudos/spotlight` SHOULD share a
    cache key family scoped by `(hashtag, department)`; sending a new
    Kudos or toggling a heart invalidates all three.
  - `users/me`, leaderboards: refresh on Secret-Box open and on heart
    toggle (sender stats).
- **Optimistic updates**:
  - Heart toggle: flip locally, then submit; revert on error.
  - Send Kudos: prepend the new card to the feed on success; do NOT
    optimistically prepend (server returns the canonical record because
    fields like createdAt, isHeartedByCurrentUser, computed fields must
    match the rest of the feed).
- **Cross-page navigation state**:
  - `returnTo` cookie consumed by `/auth/callback` (existing flow) when
    an unauthenticated visitor is redirected to login.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: ≥80% of active Sunners (defined as visiting Homepage at
  least once during the campaign) open `/sun-kudos` at least once.
- **SC-002**: ≥30% of active Sunners send at least one Kudos via the A.1
  input within the first two weeks after launch.
- **SC-003**: Median first-contentful-paint of `/sun-kudos` ≤ 1500ms on a
  4G connection with 100 cached Kudos.
- **SC-004**: ≤1% of heart-toggle requests fail (4xx/5xx) over a 7-day
  window once stabilized.
- **SC-005**: 0 unauthenticated requests can mutate state (send Kudos,
  toggle heart, open Secret Box) — enforced by middleware + server
  re-check (audit by attempting unauthenticated mutation tests in CI).

---

## Out of Scope

- **Kudos detail page** (target of multiple click actions) — separate
  screen / spec.
- **Profile page** (target of avatar/name clicks) — separate screen /
  spec.
- **Send-Kudos dialog UI** — separate screen / spec (slug TBC); this spec
  only covers triggering the dialog from A.1.
- **Secret Box dialog UI** — separate screen / spec.
- **Admin "special day" configuration UI** — admin-only flow, separate
  scope.
- **Mobile / tablet layouts** — desktop-only in v1; responsive
  refinement deferred.
- **Notifications panel content** — only the unread-count badge is in
  scope here (consumed via shared `AppHeader`).
- **Hashtag autocomplete inside the send-Kudos dialog** — dialog-side
  concern.
- **Star-tier upgrade ceremony / animation** — visual treatment of star
  threshold transitions is a follow-up.

---

## Dependencies

- [x] Constitution document (`.momorph/constitution.md`)
- [x] Screen flow documented (`.momorph/contexts/SCREENFLOW.md`) — Sun*
  Kudos already referenced as an inbound target from Homepage & Awards.
- [ ] API specifications (`.momorph/contexts/api-docs.yaml`) — the
  endpoints above are predicted and need formalization.
- [ ] Database design (`.momorph/contexts/database-schema.sql`) — Kudos,
  User stats, Hashtag, Department, SpecialDay, SecretBox, Leaderboard
  tables need definition.
- [ ] Send-Kudos dialog spec (`Viết Kudo` screen, frame `ihQ26W78P2`).
- [ ] Kudos detail page spec (frame TBD).
- [ ] Profile page spec (frame TBD).
- [x] Existing shared `AppHeader`, `AppFooter`, `Locale`, `getCurrentUser`,
  session-cookie middleware, dictionary `dictionary.ts`.

---

## Notes

### Items needing confirmation before implementation

1. **Phòng ban filter scope**: does it match sender, recipient, or
   either? (Default assumption above: either.)
2. **Spotlight node click destination**: most-recent Kudos for that
   recipient vs. a picker vs. a recipient profile? (Default assumption:
   most-recent Kudos detail.)
3. **Spotlight scope under Hashtag filter**: does Spotlight rescope to
   only recipients of filtered Kudos, or always show the full word
   cloud? (Default assumption: rescope.)
4. **Profile page route** — exact path (`/sunner/[id]`?).
5. **Kudos detail route** — exact path (`/sun-kudos/[id]`?).
6. **Secret Box button disabled-vs-hidden** when no pending boxes.
7. **Hashtag overflow** — clip vs wrap when a card has >5 tags.
8. **"Special day" +2 hearts semantics** — does it affect the card
   counter or only the sender's leaderboard? (Default: leaderboard only.)
9. **Long Sunner name in Spotlight** — clip / ellipsis / wrap?
10. **Mobile / tablet behavior** — out of scope for v1, but the breakpoint
    boundary should be confirmed.
11. **Hashtag chip / Phòng ban chip on D.4** — exact behavior of these
    "category chips" on individual cards (filter the list, navigate to a
    detail page, or just decorative?).
12. **Two leaderboard lists in sidebar** — D.3 "NHẬN QUÀ MỚI NHẤT" is
    clearly named; the "10 SUNNER thăng hạng" companion list referenced
    in design summary but not enumerated separately — confirm presence
    and source query.

### Design references

- Figma frame: `2940:13431` — `Sun* Kudos - Live board`.
- Source URL: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/MaZUn5xHXZ
- Inbound traffic mapped in `.momorph/contexts/SCREENFLOW.md` (Homepage
  header / footer / banner; Awards header / footer / promo).
- Test cases (40 scenarios) authored 2026-01-30 — covers navigation,
  layout, data validation, business rules (Like / special-day / max
  characters / empty states). All Given/When/Then scenarios above derive
  from or extend that corpus.
