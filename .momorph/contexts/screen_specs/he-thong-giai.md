# Screen: Hệ thống giải (Awards Information)

## Screen Info

| Property | Value |
|----------|-------|
| **Figma Frame ID** | zFYDgyj_pD |
| **Frame Node ID** | 313:8436 |
| **Frame Name (Figma)** | Hệ thống giải |
| **Figma Link** | https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/zFYDgyj_pD |
| **Screen Group** | Main Application |
| **Route (assumed)** | `/awards-information` (with `#<slug>` deep links) |
| **Status** | discovered |
| **Discovered At** | 2026-05-14 |
| **Last Updated** | 2026-05-14 |

---

## Description

Authenticated content page that presents the SAA 2025 award catalog (the "**Hệ thống giải thưởng**" — *Awards System*). Acts as the destination for every "Award Information" navigation across the site (header link, footer link, "ABOUT AWARDS" hero CTA, and the six award-card arrow buttons on the Homepage SAA).

The page lists the six award categories in a single long-scroll layout with a **sticky / scrollspy left side-menu**. Clicking a side-menu item scrolls to (or deep-links into) the corresponding section. The current section is highlighted (the design shows `C.1_Top talent` in the active/highlighted variant — `componentId 186:1501` — while the other five use the inactive variant `186:1433`).

Structure (top → bottom):

1. **Header** (shared `186:1602` component — Logo, primary nav [About SAA 2025 / **Award Information** ← active / Sun* Kudos], Language, Notification, Profile).
2. **Cover image** (`3_Keyvisual` group) + **Bìa** intro band with Root Further logo and the page title `Sun* Annual Awards 2025` / `Hệ thống giải thưởng SAA 2025`.
3. **B_Hệ thống giải thưởng** body — two columns:
   - **Left column**: `C_Menu list` — sticky in-page nav (6 anchor links).
   - **Right column**: `D.Danh sách giải thưởng` — vertically stacked sections D.1…D.6 (each section = picture-award medallion + content block with title/description/criteria), separated by 1px dividers.
4. **D1_Sunkudos** promo block (shared `335:11943` component — same as Homepage SAA).
5. **Footer** (shared `342:1427` component — Logo + four nav links + copyright).

The page itself has no forms and no destructive actions — it is purely informational/navigational.

---

## Navigation Analysis

### Incoming Navigations (From)

| Source Screen | Trigger | Condition |
|---------------|---------|-----------|
| Homepage SAA (`i87tDx10uM`) | Header link "Award Information" (`I2167:9091;186:1587`) | Routes to `/awards-information` (top) |
| Homepage SAA (`i87tDx10uM`) | Footer link "Award Information" (`I5001:14800;342:1411` — active style) | Routes to `/awards-information` (top) |
| Homepage SAA (`i87tDx10uM`) | Hero CTA "ABOUT AWARDS" (`2167:9063`) | Routes to `/awards-information` (top) |
| Homepage SAA (`i87tDx10uM`) | Award card `mms_C2.1` arrow (Top Talent) | Deep-link `/awards-information#top-talent` |
| Homepage SAA (`i87tDx10uM`) | Award card `mms_C2.2` arrow (Top Project) | Deep-link `/awards-information#top-project` |
| Homepage SAA (`i87tDx10uM`) | Award card `mms_C2.3` arrow (Top Project Leader) | Deep-link `/awards-information#top-project-leader` |
| Homepage SAA (`i87tDx10uM`) | Award card `mms_C2.4` arrow (Best Manager) | Deep-link `/awards-information#best-manager` |
| Homepage SAA (`i87tDx10uM`) | Award card `mms_C2.5` arrow (Signature 2025 Creator) | Deep-link `/awards-information#signature-2025-creator` |
| Homepage SAA (`i87tDx10uM`) | Award card `mms_C2.6` arrow (MVP) | Deep-link `/awards-information#mvp` |
| Any screen with shared Header | Header "Award Information" button | Same as Homepage header link |
| Any screen with shared Footer | Footer "Award Information" button | Same as Homepage footer link |

### Outgoing Navigations (To)

| Target Screen | Trigger Element | Node ID | Confidence | Notes |
|---------------|-----------------|---------|------------|-------|
| Homepage SAA (`i87tDx10uM`) | Header Logo | `I313:8440;178:1033` | High | Brand logo → `/` |
| Homepage SAA (`i87tDx10uM` / `#about-saa`) | Header link "About SAA 2025" | `I313:8440;186:1579` | High | Inactive nav item — route back to homepage |
| Hệ thống giải / self (`#top-talent`) | Header link "Award Information" (active variant `componentId 186:1501`) | `I313:8440;186:1587` | High | Active in this page — scrolls to top |
| Sun* Kudos - Live board (`MaZUn5xHXZ`) | Header link "Sun* Kudos" | `I313:8440;186:1593` | High | Routes to `/kudos` |
| Language Dropdown (`IiLVGkACbt`) | Header "VN ▾" trigger | `I313:8440;186:1696` | High | Opens locale switcher overlay |
| Notification panel (`gWBVcaSVIf` or `6-1LRz3vqr`) | Header bell icon | `I313:8440;186:2101` | Medium | Opens notification panel; exact target TBD |
| Dropdown-profile (`z4sCl3_Qtk`) or Admin variant (`54rekaCHG1`) | Header user-profile icon | `I313:8440;186:1597` | High | Opens profile dropdown |
| Self anchor `#top-talent` (D.1 section) | Side-menu item `C.1_Top talent` (active) | `313:8460` | High | In-page scroll / scrollspy anchor |
| Self anchor `#top-project` (D.2 section) | Side-menu item `C.2_Top project` | `313:8461` | High | In-page scroll / scrollspy anchor |
| Self anchor `#top-project-leader` (D.3 section) | Side-menu item `C.3_Top Project leader` | `313:8462` | High | In-page scroll / scrollspy anchor |
| Self anchor `#best-manager` (D.4 section) | Side-menu item `C.4_Best manager` | `313:8463` | High | In-page scroll / scrollspy anchor |
| Self anchor `#signature-2025-creator` (D.5 section) | Side-menu item `C.5_Signature 2025` | `313:8464` | High | In-page scroll / scrollspy anchor |
| Self anchor `#mvp` (D.6 section) | Side-menu item `C.6_MVP` | `313:8465` | High | In-page scroll / scrollspy anchor |
| Sun* Kudos - Live board (`MaZUn5xHXZ`) | `D1_Sunkudos` promo block | `335:12023` | Medium | Same shared component as Homepage SAA → likely routes to `/kudos` |
| Homepage SAA (`i87tDx10uM`) | Footer Logo | `I354:4323;342:1408` | High | Brand logo → `/` |
| Homepage SAA (`i87tDx10uM` / `#about-saa`) | Footer link "About SAA 2025" | `I354:4323;342:1410` | High | Route to homepage |
| Hệ thống giải / self (`#top-talent`) | Footer link "Award Information" (active variant) | `I354:4323;342:1411` | High | Active — same page top |
| Sun* Kudos - Live board (`MaZUn5xHXZ`) | Footer link "Sun* Kudos" | `I354:4323;342:1412` | High | `/kudos` |
| Tiêu chuẩn cộng đồng (`Dpn7C89--r`) | Footer link "Tiêu chuẩn chung" | `I354:4323;1161:9487` | High | Community guidelines |

### Conditional / Logic Edges

- **On screen load → no/expired session** → redirect to **Login** (`GzbNeVGJHz`) — protected route.
- **On screen load → pre-launch gate active** (`now < campaign.start_at`) → redirect to **Countdown - Prelaunch page** (`8PJQswPZmU`) per global app behavior.
- **On screen load with `#<slug>` in URL** → scroll target section into view + set matching side-menu item active.
- **Domain-restricted account** → redirect to **Error page - 403** (`T3e_iS9PCL`).
- **Side-menu active state** is driven by scroll position (scrollspy): the visible section's link gets the active variant (`186:1501`).

### Navigation Rules
- **Back behavior**: Browser back returns to source (typically Homepage SAA).
- **Deep link support**: Yes — `/awards-information#<slug>`. Canonical slugs:
  - `#top-talent`
  - `#top-project`
  - `#top-project-leader`
  - `#best-manager`
  - `#signature-2025-creator`
  - `#mvp`
- **Auth required**: Yes — protected route.

---

## Component Schema

### Layout Structure

```
┌──────────────────────────────────────────────────────────────────────┐
│ HEADER (shared)                                                       │
│ [Logo] [About SAA 2025] [Award Information*] [Sun* Kudos]  [VN▾][🔔•][👤]│
├──────────────────────────────────────────────────────────────────────┤
│ COVER / 3_Keyvisual (image 20)                                       │
├──────────────────────────────────────────────────────────────────────┤
│ Bìa intro                                                             │
│   [Root Further Logo]                                                 │
│   "Sun* Annual Awards 2025"                                           │
│   ―――                                                                 │
│   "Hệ thống giải thưởng SAA 2025"                                    │
├──────────────────────────────────────────────────────────────────────┤
│ B_Hệ thống giải thưởng (2-column body)                                │
│ ┌────────────────────┐ ┌─────────────────────────────────────────┐   │
│ │ C_Menu list        │ │ D.Danh sách giải thưởng                 │   │
│ │ (sticky)           │ │                                          │   │
│ │  • Top Talent  ◀── │ │  D.1_Top talent      [img | content]    │   │
│ │  ○ Top Project     │ │  ────────────────────────────────────   │   │
│ │  ○ Top Project     │ │  D.2_Top Project     [content | img]    │   │
│ │    Leader          │ │  ────────────────────────────────────   │   │
│ │  ○ Best Manager    │ │  D.3_Top Project Leader [img | content] │   │
│ │  ○ Signature 2025  │ │  ────────────────────────────────────   │   │
│ │    Creator         │ │  D.4_Thông tin giải  [content | img]    │   │
│ │  ○ MVP             │ │  ────────────────────────────────────   │   │
│ │                    │ │  D.5_Signature 2025  [img | content]    │   │
│ │                    │ │  ────────────────────────────────────   │   │
│ │                    │ │  D.6_MVP             [content | img]    │   │
│ └────────────────────┘ └─────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────────────────────┤
│ D1_Sunkudos promo block (shared with Homepage SAA)                   │
├──────────────────────────────────────────────────────────────────────┤
│ FOOTER (shared)                                                       │
│ [Logo]  [About SAA 2025] [Award Information*] [Sun* Kudos] [TCC]     │
│ Bản quyền thuộc về Sun* © 2025                                       │
└──────────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
Screen (Hệ thống giải, 313:8436)
├── Cover (RECTANGLE, 313:8439)
├── Header (INSTANCE 186:1602, shared)
│   ├── Logo
│   └── Primary nav buttons (About SAA 2025 / Award Information [active] / Sun* Kudos)
│   └── Actions cluster: Language / Notification (with dot) / Profile
├── 3_Keyvisual (GROUP)
│   └── image 20
├── Bìa (FRAME, 313:8449)
│   ├── KV → Root Further Logo
│   └── A_Title hệ thống giải thưởng
│       ├── "Sun* Annual Awards 2025"
│       └── "Hệ thống giải thưởng SAA 2025"
├── B_Hệ thống giải thưởng (FRAME, 313:8458)
│   ├── C_Menu list (FRAME, 313:8459) — sticky 178px column, gap 16px
│   │   ├── C.1_Top talent      (active variant 186:1501)
│   │   ├── C.2_Top project     (186:1433)
│   │   ├── C.3_Top Project leader (186:1433)
│   │   ├── C.4_Best manager    (186:1433)
│   │   ├── C.5_Signature 2025  (186:1433)
│   │   └── C.6_MVP             (186:1433)
│   └── D.Danh sách giải thưởng (FRAME, 313:8466) — 853px column, gap 80px
│       ├── D.1_Top talent          (Picture left, Content right)
│       ├── D.2_Top Project         (Content left, Picture right)
│       ├── D.3_Top Project Leader  (Picture left, Content right)
│       ├── D.4_Thông tin giải      (Content left, Picture right) — D.4 = Best Manager
│       ├── D.5_Signature 2025      (Picture left, Content right) — taller (7 content children, ~1047px)
│       └── D.6_MVP                 (Content left, Picture right)
├── D1_Sunkudos (INSTANCE 335:11943, shared promo)
└── Footer (INSTANCE 342:1427, shared)
```

### Main Components

| Component | Type | Node ID | Description | Reusable |
|-----------|------|---------|-------------|----------|
| Header | Organism | `I313:8440` (instance of `186:1602`) | Shared site header — same as Homepage SAA / Countdown unlock | Yes |
| Footer | Organism | `354:4323` (instance of `342:1427`) | Shared site footer | Yes |
| AwardSideMenu (`C_Menu list`) | Organism | `313:8459` | Scrollspy left nav, 6 items, sticky | Page-specific |
| AwardMenuItem (active) | Molecule | component `186:1501` | Active state — text + target icon + bottom highlight border | Yes |
| AwardMenuItem (inactive) | Molecule | component `186:1433` | Inactive state | Yes |
| AwardSection (alt layout A) | Organism | component `214:2554` | Image-left / content-right section (D.1, D.3) | Yes |
| AwardSection (alt layout B) | Organism | component `214:2646` | Content-left / image-right section (D.2, D.4, D.6) | Yes |
| AwardSection (D.5 custom) | Organism | `313:8471` | Local frame (7 content children) — Signature 2025 has more sub-info | No |
| Picture-Award medallion | Molecule | component `81:2443` | Circular award-image badge | Yes |
| SunKudos Promo (`D1_Sunkudos`) | Organism | instance of `335:11943` | Shared promo banner | Yes |
| Cover image | Atom | `313:8439` | Top hero cover | No |

---

## Form Fields (If Applicable)

N/A — this is a content/informational page with no forms.

---

## API Mapping

### On Screen Load

| API | Method | Purpose | Response Usage |
|-----|--------|---------|----------------|
| `/auth/session` | GET | Verify session (protected route) | Redirect to Login if unauthorized |
| `/users/me` | GET | Current user (for header user icon / locale) | Header avatar, role |
| `/campaign/current` | GET | Active SAA campaign metadata | Header branding, pre-launch gate check |
| `/awards` | GET | List of 6 award categories with full descriptions, criteria, prizes | Populates D.1…D.6 sections |
| `/notifications/unread-count` | GET | Unread badge dot | Header bell badge state |
| `/i18n/locales` | GET | Supported locales | Language dropdown content |

### On User Action

| Action | API | Method | Request Body | Response |
|--------|-----|--------|--------------|----------|
| Click side-menu item | — | — | In-page anchor scroll only (`history.replaceState` updates `#slug`) | — |
| Click header logo / "About SAA 2025" / footer "About SAA 2025" | — | — | Client-side route to `/` | — |
| Click header / footer "Sun* Kudos" | — | — | Client-side route to `/kudos` | — |
| Click footer "Tiêu chuẩn chung" | — | — | Route to community guidelines | — |
| Click bell icon | `/notifications` | GET | — | Notification list (panel content) |
| Click profile icon | — | — | Toggle dropdown overlay | — |
| Click language switcher item | `/i18n/preference` | PUT | `{ locale }` | Updated user locale, page may re-render |

### Error Handling

| Error Code | Message | UI Action |
|------------|---------|-----------|
| 401 | Session expired | Redirect to Login |
| 403 | Domain not allowed | Redirect to 403 page (`T3e_iS9PCL`) |
| 404 | Award not found (if `/awards/:id` is later added) | Show error placeholder |
| 500 | Server error | Show retry message in section |

---

## State Management

### Local State

| State | Type | Initial | Purpose |
|-------|------|---------|---------|
| activeAnchor | string | `'top-talent'` (or from URL hash) | Drives side-menu active highlight |
| isScrolling | boolean | false | Suppresses scrollspy updates during programmatic scroll |

### Global State (If Applicable)

| State | Store | Read/Write | Purpose |
|-------|-------|------------|---------|
| user | authStore | Read | Header user icon, role-based admin dropdown |
| campaign | campaignStore | Read | Active campaign branding, pre-launch gate |
| awards | awardsStore | Read | Cached awards list, shared with Homepage SAA grid |
| locale | uiStore | Read | Active language |
| unreadCount | notificationsStore | Read | Header bell badge |

---

## UI States

### Loading State
- Skeleton placeholder for each of the six D-sections while `/awards` is in flight.
- Header avatar shows neutral placeholder until `/users/me` resolves.

### Error State
- If `/awards` fails: show inline error inside each section with retry; side-menu still functional but anchors scroll to empty placeholders.

### Success State
- All six sections populated; first section visible; side-menu highlights current section as the user scrolls.

### Empty State
- N/A — six awards are fixed for SAA 2025 (the dataset is not user-driven). If the array returns empty, treat as Error.

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Side-menu semantics | Render as `<nav aria-label="Awards sections">` with `<a href="#slug">` anchors |
| Focus management | Anchor click moves focus to target heading; `prefers-reduced-motion` disables smooth scroll |
| Scrollspy ARIA | `aria-current="location"` on the active anchor |
| Section headings | Each D-section has an `<h2>` with `id` matching its slug |
| Keyboard navigation | Tab through side-menu, Enter activates anchor |
| Color contrast | Active gold text + bottom border must meet WCAG AA |

---

## Analysis Metadata

| Property | Value |
|----------|-------|
| Analyzed By | Screen Flow Discovery |
| Analysis Date | 2026-05-14 |
| Needs Deep Analysis | Yes — D.5 Signature 2025 has an extra content row count (7 children vs the others' 5); confirm whether this is "Creator + Co-Creator" subtypes or just extended copy |
| Confidence Score | High (header/footer/side-menu) · Medium (SunKudos promo link & D.5 section variant) |

### Next Steps
- [ ] Confirm canonical slug for Signature 2025 — design label is "Signature 2025 Creator" (homepage card called it "Signature 2025 - Creator"). Slug above standardized to `signature-2025-creator`.
- [ ] Confirm whether D.4 "Thông tin giải" is genuinely the Best Manager content (frame name is generic) — content inspection via `momorph.specs` recommended.
- [ ] Confirm whether `D1_Sunkudos` block is clickable here (treat same as Homepage SAA).
- [ ] Verify scrollspy / sticky-side-menu behavior (the Figma static frame can't express scroll behavior — confirm with design team).
- [ ] Run `momorph.specs` on this frame to extract per-section copy, criteria, and prize details.
- [ ] Update API contract for `GET /awards` to ensure response shape supplies title, slug, criteria, prizes, illustration URL per category.
