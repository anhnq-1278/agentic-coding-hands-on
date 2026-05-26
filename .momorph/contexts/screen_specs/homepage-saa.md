# Screen: Homepage SAA

## Screen Info

| Property | Value |
|----------|-------|
| **Figma Frame ID** | i87tDx10uM |
| **Figma Link** | https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM |
| **Screen Group** | Main Application |
| **Status** | discovered |
| **Discovered At** | 2026-05-07 |
| **Last Updated** | 2026-05-07 |

---

## Description

Authenticated landing page for the **Sun* Annual Awards 2025 (SAA 2025 / "Root Further")** campaign site. Acts as the central hub once a user successfully logs in via Google OAuth. The screen presents (top → bottom):

1. A keyvisual / cover banner with countdown timer and event info.
2. Two primary CTAs — **ABOUT AWARDS** and **ABOUT KUDOS** — that anchor-scroll or navigate to deeper pages.
3. A long-form narrative section explaining the "Root Further" theme.
4. A floating widget button (icons for "Viết Kudos" and "Thể lệ SAA") for quick actions.
5. A grid of six Award category cards (Top Talent, Top Project, Top Project Leader, Best Manager, Signature 2025 - Creator, MVP) — each card has a "see more" arrow button.
6. A Sun*Kudos promotional block (`mms_D1_Sunkudos`).
7. A footer with logo, navigation links (About SAA 2025 / Award Information / Sun* Kudos / Tiêu chuẩn chung) and copyright.

The header includes brand logo, primary nav (About SAA 2025 [active], Award Information, Sun* Kudos), and an actions cluster on the right: Language switcher (VN), Notification bell with red dot badge, and a User Profile icon button.

---

## Navigation Analysis

### Incoming Navigations (From)

| Source Screen | Trigger | Condition |
|---------------|---------|-----------|
| Login (`GzbNeVGJHz`) | Click "LOGIN With Google" → OAuth success callback | Valid Google account, allowed domain |
| Login (`GzbNeVGJHz`) | Auto-redirect on screen load | Existing valid session detected via `GET /auth/session` |
| Any protected screen | Header logo click | Returns user to homepage |
| Footer "About SAA 2025" link | From any screen with footer | Anchor / route to `/` |

### Outgoing Navigations (To)

| Target Screen | Trigger Element | Node ID | Confidence | Notes |
|---------------|-----------------|---------|------------|-------|
| Homepage SAA (self / `#about-saa` anchor) | Header link "About SAA 2025" (selected state) | I2167:9091;186:1579 | High | Active tab — scroll to top / current page anchor |
| Award Information (TBD frame) | Header link "Award Information" | I2167:9091;186:1587 | High | Likely routes to `/awards` listing — exact frame not yet mapped |
| Sun* Kudos - Live board (`MaZUn5xHXZ`) | Header link "Sun* Kudos" | I2167:9091;186:1593 | High | Routes to `/kudos` (Live board) |
| Language Dropdown (`IiLVGkACbt`) | Header "VN ▾" trigger | I2167:9091;186:1696 | High | Opens locale switcher overlay |
| Notification list (`gWBVcaSVIf` "View thông báo" or `6-1LRz3vqr` "Tất cả thông báo") | Header bell icon | I2167:9091;186:2101 | Medium | Opens notification panel; exact target TBD |
| Dropdown-profile (`z4sCl3_Qtk`) or Dropdown-profile Admin (`54rekaCHG1`) | Header user-profile icon button | I2167:9091;186:1597 | High | Opens profile dropdown; admin variant when role=admin |
| Award Information section / About Awards page (TBD) | CTA "ABOUT AWARDS" (primary, gold) | 2167:9063 | High | Likely anchors/routes to award details |
| Sun* Kudos info page (TBD — possibly `Tiêu chuẩn cộng đồng` `Dpn7C89--r` or About Kudos frame) | CTA "ABOUT KUDOS" (secondary) | 2167:9064 | Medium | Routes to Kudos overview/about |
| Viết Kudo (`ihQ26W78P2`) | Widget button → "icon viết kudos" | I5022:15169;214:3839;186:1935 | High | Floating shortcut to "Send Kudos" composer |
| Thể lệ UPDATE (`b1Filzi9i6`) or Thể lệ - DONE (`4TMyWyKO1U`/`tajvZVN9v7`/`EWoWPJkDtV`) | Widget button → "icon thể lệ saa" | I5022:15169;214:3839;186:1766 | Medium | Routes to SAA rules / regulations page |
| Top Talent Award detail (TBD — possibly `TfCh7y1S-D` "Award" or per-award page) | Card `mms_C2.1` arrow button | I2167:9075;214:1023 | High | Award category drill-in |
| Top Project Award detail (TBD) | Card `mms_C2.2` arrow button | I2167:9076;214:1023 | High | Award category drill-in |
| Top Project Leader Award detail (TBD) | Card `mms_C2.3` arrow button | I2167:9077;214:1023 | High | Award category drill-in |
| Best Manager Award detail (TBD) | Card `mms_C2.4` arrow button | I2167:9079;214:1023 | High | Award category drill-in |
| Signature 2025 - Creator Award detail (TBD) | Card `mms_C2.5` arrow button | I2167:9080;214:1023 | High | Award category drill-in |
| MVP Award detail (TBD) | Card `mms_C2.6` arrow button | I2167:9081;214:1023 | High | Award category drill-in |
| Sun* Kudos - Live board (`MaZUn5xHXZ`) | `mms_D1_Sunkudos` block (likely click) | 3390:10349 | Medium | Promo banner → Kudos board |
| Footer link "About SAA 2025" | `mms_7.2_Button-IC` | I5001:14800;342:1410 | High | Anchor/route to homepage / about section |
| Footer link "Award Information" | `mms_7.3_Button-IC` (active style) | I5001:14800;342:1411 | High | Same target as header "Award Information" |
| Footer link "Sun* Kudos" | `mms_7.4_Button-IC` | I5001:14800;342:1412 | High | Same as header "Sun* Kudos" → Live board |
| Footer link "Tiêu chuẩn chung" | `mms_7.5_Button-IC` | I5001:14800;1161:9487 | High | Routes to "Tiêu chuẩn cộng đồng" (`Dpn7C89--r`) — community guidelines |

### Conditional / Logic Edges

- **On screen load → no/expired session** → redirect to **Login** (`GzbNeVGJHz`).
- **On screen load → valid session** → fetch user profile + countdown + awards list + kudos feed.
- **Notification dot visible** when `unreadCount > 0`; clears on opening notification panel.
- **Profile dropdown variant**: regular user → `Dropdown-profile` (`z4sCl3_Qtk`); admin role → `Dropdown-profile Admin` (`54rekaCHG1`).
- **Logout from profile dropdown** → returns user to **Login** (`GzbNeVGJHz`).
- **Domain-restricted account** that somehow reaches this URL → redirect to **Error page - 403** (`T3e_iS9PCL`).
- **Countdown timer reaches 0** → likely transitions screen state (event-live vs pre-launch) — exact behavior TBD.

### Navigation Rules
- **Back behavior**: N/A — root of the authenticated app.
- **Deep link support**: Yes — `/` (or `/home`).
- **Auth required**: Yes — protected route.

---

## Component Schema

### Layout Structure

```
┌──────────────────────────────────────────────────────────────┐
│ HEADER (sticky)                                               │
│ [Logo] [About SAA 2025*] [Award Info] [Sun* Kudos]   [VN▾] [🔔•] [👤] │
├──────────────────────────────────────────────────────────────┤
│              KEYVISUAL / COVER (Bìa)                         │
│   [Root Further Logo]                                         │
│   [Countdown timer]   [Event info]                           │
│   [ ABOUT AWARDS ]  [ ABOUT KUDOS ]                          │
├──────────────────────────────────────────────────────────────┤
│   "Root Further" narrative (long-form Vietnamese copy)        │
│   pull-quote · closing paragraph                              │
├──────────────────────────────────────────────────────────────┤
│   AWARDS SECTION  ── "Sun* annual awards 2025"               │
│   [Top Talent]  [Top Project]  [Top Project Leader]           │
│   [Best Manager] [Signature 2025 Creator] [MVP]               │
├──────────────────────────────────────────────────────────────┤
│   SUNKUDOS BANNER (mms_D1_Sunkudos)                          │
├──────────────────────────────────────────────────────────────┤
│ FOOTER                                                        │
│ [Logo]  About SAA 2025 · Award Information · Sun* Kudos ·    │
│         Tiêu chuẩn chung           "Bản quyền © 2025"        │
└──────────────────────────────────────────────────────────────┘
                  [Floating Widget Button] (Kudos / Rules)
```

### Component Hierarchy

```
Homepage SAA (Frame 2167:9026)
├── mms_3.5_Keyvisual (Group)
├── Cover (Rectangle)
├── mms_A1_Header (Organism, instance 186:1602)
│   ├── mms_A1.1_LOGO (Atom)
│   ├── Frame 476 (Nav cluster)
│   │   ├── mms_A1.2_Button-Selected ("About SAA 2025")
│   │   ├── mms_A1.3_Button Hover ("Award Information")
│   │   └── mms_A1.5_Button-Normal ("Sun* Kudos")
│   ├── mms_A1.7_Language (Dropdown trigger, "VN ▾")
│   ├── mms_A1.6_Notification (icon + Badge/Dot)
│   └── mms_A1.8_Button-IC (User Profile)
├── Bìa (Body)
│   ├── Frame 487
│   │   ├── Root Further Logo
│   │   ├── Frame 523 → mms_B1_Countdown time + mms_B2_Thông tin sự kiện
│   │   └── mms_B3_Call-To-Action
│   │       ├── mms_B3.1_Button-IC About ("ABOUT AWARDS")
│   │       └── mms_B3.2_Button-IC Kudos ("ABOUT KUDOS")
│   ├── Frame 486 (Root Further title art)
│   └── mms_B4_content (long-form narrative TEXT × 3)
├── mms_6_Widget Button (Floating, instance 214:3908)
│   └── Button: "icon viết kudos" + "icon thể lệ saa"
├── Hệ thống giải thưởng
│   ├── mms_C1_Header Giải thưởng ("Sun* annual awards 2025")
│   └── mms_C2_Award list
│       ├── Frame 491
│       │   ├── mms_C2.1_Top Talent Award
│       │   ├── mms_C2.2_Top Project Award
│       │   └── mms_C2.3_Top Project Leader Award
│       └── Frame 493
│           ├── mms_C2.4_Best Manager Award
│           ├── mms_C2.5_Signature 2025 - Creator Award
│           └── mms_C2.6_MVP Award
├── mms_D1_Sunkudos (Banner, instance 335:11943)
└── mms_7_Footer (Organism, instance 342:1427)
    ├── mms_7.1_LOGO
    ├── mms_7.2_Button-IC ("About SAA 2025")
    ├── mms_7.3_Button-IC ("Award Information", active)
    ├── mms_7.4_Button-IC ("Sun* Kudos")
    ├── mms_7.5_Button-IC ("Tiêu chuẩn chung")
    └── Copyright text
```

### Main Components

| Component | Type | Node ID | Description | Reusable |
|-----------|------|---------|-------------|----------|
| mms_A1_Header | Organism | 2167:9091 | Top header (logo + nav + actions) | Yes |
| mms_A1.7_Language | Molecule | I2167:9091;186:1696 | Language dropdown trigger ("VN ▾") | Yes |
| mms_A1.6_Notification | Molecule | I2167:9091;186:2101 | Bell icon + unread Badge/Dot | Yes |
| mms_A1.8_Button-IC (Profile) | Atom | I2167:9091;186:1597 | User profile dropdown trigger | Yes |
| mms_B3.1_Button-IC About | Atom | 2167:9063 | Primary CTA "ABOUT AWARDS" | Yes |
| mms_B3.2_Button-IC Kudos | Atom | 2167:9064 | Secondary CTA "ABOUT KUDOS" | Yes |
| mms_6_Widget Button | Molecule | 5022:15169 | Floating quick-action (Kudos / Rules) | Yes |
| mms_C2.1–6 Award Cards | Molecule | 2167:9075…9081 | Six award category cards w/ image, title, desc, arrow | Yes |
| mms_D1_Sunkudos | Organism | 3390:10349 | Kudos promotional banner block | Yes |
| mms_7_Footer | Organism | 5001:14800 | Footer with nav links + copyright | Yes |

---

## Form Fields

N/A — Homepage SAA contains no input form (display + navigation only).

---

## API Mapping

### On Screen Load

| API | Method | Purpose | Response Usage |
|-----|--------|---------|----------------|
| /auth/session | GET | Validate session; redirect to Login if invalid | Gate render |
| /users/me | GET | Current user info (name, avatar, role) | Header profile icon, role-based dropdown variant |
| /campaign/current | GET | Current SAA campaign info, theme, dates | Hero copy, countdown end date |
| /awards | GET | List of award categories shown on homepage | Render six award cards |
| /notifications/unread-count | GET | Unread notification count | Notification dot badge |
| /kudos/feed?limit=N | GET | Recent Kudos for the SunKudos banner | `mms_D1_Sunkudos` content |
| /i18n/locales | GET | Available locales for header switcher | Language dropdown |

### On User Action

| Action | API | Method | Request Body | Response |
|--------|-----|--------|--------------|----------|
| Open notification panel | /notifications?cursor= | GET | — | Paginated list |
| Mark notifications read | /notifications/read | POST | `{ids:[…]}` | `{ok}` |
| Change language | /i18n/preference | PUT | `{locale}` | `{ok}` |
| Open profile dropdown | — | — | Local UI only | — |
| Logout (from profile dropdown) | /auth/logout | POST | — | 204 → redirect to Login |
| Click an Award card | (Navigation) | — | — | Route to award detail |
| Click "Viết Kudos" widget | (Navigation) | — | — | Route to Viết Kudo screen |

### Error Handling

| Error Code | Message | UI Action |
|------------|---------|-----------|
| 401 | Session expired | Redirect to Login |
| 403 | Domain not allowed | Redirect to Error page - 403 |
| 500 | Server error | Toast + skeleton retry |

---

## State Management

### Local State

| State | Type | Initial | Purpose |
|-------|------|---------|---------|
| isLoadingHomepage | boolean | true | Show skeletons while initial data loads |
| isLanguageOpen | boolean | false | Language dropdown overlay visibility |
| isProfileOpen | boolean | false | Profile dropdown overlay visibility |
| isNotificationOpen | boolean | false | Notification panel visibility |
| unreadCount | number | 0 | Drives red dot on bell |
| countdownRemaining | number | calc | Live countdown to event start |

### Global State

| State | Store | Read/Write | Purpose |
|-------|-------|------------|---------|
| user | authStore | Read | Header avatar, role gate (admin vs user dropdown) |
| token | authStore | Read | Auth header for all API calls |
| locale | uiStore | Read/Write | App-wide language |
| campaign | campaignStore | Read | Current SAA campaign meta |
| awards | awardsStore | Read | Cached award list |

---

## UI States

### Loading State
- Skeleton placeholders for keyvisual countdown, award cards grid, and SunKudos banner.
- Header avatar shows initials placeholder until `/users/me` resolves.

### Error State
- Inline retry on each section if its API fails (awards / kudos feed / notifications).
- 401 → silent redirect to Login.

### Success State
- Full hero, six award cards visible, kudos banner populated, countdown ticking.

### Empty State
- If `/awards` returns empty → fallback "Awards coming soon" message in `mms_C2_Award list`.
- If kudos feed empty → static promotional `mms_D1_Sunkudos` content only.

---

## Analysis Metadata

| Property | Value |
|----------|-------|
| Analyzed By | Screen Flow Discovery (momorph.screenflow) |
| Analysis Date | 2026-05-07 |
| Needs Deep Analysis | Partial — child destination frames not yet mapped |
| Confidence Score | High (for explicit nav); Medium (for award-detail and About-Awards/Kudos targets) |

### TODOs / Unresolved

- [ ] Map "Award Information" header/footer destination — likely a separate Awards listing page; frame ID not yet identified.
- [ ] Map "ABOUT KUDOS" CTA destination — could be `Tiêu chuẩn cộng đồng` (`Dpn7C89--r`) or a dedicated About-Kudos page; not yet confirmed.
- [ ] Map per-award detail screens (Top Talent, Top Project, Top Project Leader, Best Manager, Signature 2025 - Creator, MVP) — the file lists generic `Award` (`TfCh7y1S-D`), `Awards-Name` (`uD4Z8gOjEk`), and several `danh hiệu`/`Danh hiệu` frames; iOS variants exist (`[iOS] Award_*`). Web detail frames need confirmation.
- [ ] Map "icon thể lệ saa" widget destination — candidates: `Thể lệ UPDATE` (`b1Filzi9i6`) or one of `Thể lệ - DONE` frames.
- [ ] Map Notification bell click target — candidate: `Tất cả thông báo` (`6-1LRz3vqr`) for full list, or `View thông báo` (`gWBVcaSVIf`) for an inline panel.
- [ ] Confirm whether Header "About SAA 2025" is `href="/"` (current page) or scrolls to a section anchor.
- [ ] Confirm Sun*Kudos banner click is the entire block or a specific CTA inside it.
- [ ] Confirm role-based logic: when does Profile icon open `Dropdown-profile` vs `Dropdown-profile Admin`?

### Next Steps
- [ ] Process `Sun* Kudos - Live board` (`MaZUn5xHXZ`) — known navigation target.
- [ ] Process `Dropdown-profile` (`z4sCl3_Qtk`) and Admin variant.
- [ ] Process `Language Dropdown` (`IiLVGkACbt`).
- [ ] Process `Viết Kudo` (`ihQ26W78P2`).
- [ ] Process `Thể lệ UPDATE` (`b1Filzi9i6`).
- [ ] Process `Tiêu chuẩn cộng đồng` (`Dpn7C89--r`).
- [ ] Process the per-award detail frames once identified.
- [ ] Run `momorph.specs` for component-level spec.
- [ ] Run `momorph.apispecs` to lock the GET endpoints listed above.
