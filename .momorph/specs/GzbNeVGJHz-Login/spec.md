# Feature Specification: Login

**Frame ID**: `GzbNeVGJHz`
**Frame Name**: `Login`
**File Key**: `9ypp4enmFmdK3YAFJLIu6C`
**Created**: 2026-05-06
**Status**: Draft

---

## Overview

Single-screen entry point for the **Sun Annual Awards 2025 (SAA)** application. The screen
authenticates users via **Google SSO only** (no email/password form, no registration link, no
"Forgot Password"). Authenticated visits MUST short-circuit to the main application page so
the login UI never flashes for already-signed-in users. Users on a non-whitelisted Google
account (outside the Sun\* domain) are denied access and routed to the 403 / access-denied
screen.

- **Target users**: Sun\* employees who need to enter the SAA 2025 application.
- **Business context**: Internal-only product. The whitelist gate is the primary access
  control mechanism; the rest of the application assumes a valid, in-domain session.
- **Locale**: UI is bilingual; default language is Vietnamese (`VN`). English is selectable
  via the header language switch.

---

## User Scenarios & Testing *(mandatory)*

### US1: Sign in with Google (Priority: P1) 🎯 MVP

**As an** unauthenticated Sun\* employee
**I want to** sign in using my Sun\* Google account
**So that** I can access the SAA 2025 application.

**Why this priority**: This is the *only* path into the application. Without it, no other
feature is reachable.

**Independent Test**: Visit the login route while logged out, click "LOGIN With Google",
complete the Google consent flow with a Sun\*-domain account, and assert the user lands on
the Homepage SAA route.

**Acceptance Scenarios**:

1. **Given** the user is unauthenticated and on the Login screen,
   **When** they click "LOGIN With Google" and complete consent with a valid Sun\*-domain
   Google account,
   **Then** the system creates a session, the button shows a loading state during the
   handshake, and the user is redirected to the Homepage SAA screen (`i87tDx10uM`).
2. **Given** the user clicks "LOGIN With Google",
   **When** the Google flow is in progress,
   **Then** the button is disabled and shows a loading indicator until the flow resolves.
3. **Given** the user opens the Login screen,
   **When** the page first renders,
   **Then** the "LOGIN With Google" button is enabled, idle, and centered below the hero
   description.

---

### US2: Auto-redirect already-authenticated users (Priority: P1)

**As an** already-authenticated user
**I want to** be sent straight to the main application page when I open the login URL
**So that** I do not see a redundant login screen.

**Why this priority**: Required for correctness of access flow and for navigation from
external links/bookmarks; without it, signed-in users see an irrelevant screen and may
trigger a second OAuth round trip.

**Independent Test**: Set up a session, navigate to the login URL, and assert an immediate
redirect to the Homepage SAA route with no visible flash of the login UI.

**Acceptance Scenarios**:

1. **Given** the user already has a valid session,
   **When** they navigate to the login URL,
   **Then** the application detects the session on mount and redirects to Homepage SAA
   (`i87tDx10uM`) without rendering the login form.
2. **Given** a user logs out from any screen (e.g., profile dropdown `z4sCl3_Qtk` /
   `54rekaCHG1`),
   **When** the logout action completes,
   **Then** the user is returned to the Login screen with no session cookies remaining.

---

### US3: Switch interface language (Priority: P2)

**As a** user on the Login screen
**I want to** switch between Vietnamese and English
**So that** I can read the screen in my preferred language.

**Why this priority**: Improves accessibility and aligns with the bilingual product
requirement, but the screen is usable in the default Vietnamese without it.

**Independent Test**: Open the language dropdown from the header, pick the alternate
language, and assert that the hero title/description and button label re-render in that
language.

**Acceptance Scenarios**:

1. **Given** the Login screen is open with the default language `VN`,
   **When** the user clicks the language selector in the header,
   **Then** the language dropdown opens (target frame `IiLVGkACbt`).
2. **Given** the language dropdown is open,
   **When** the user selects an alternate language (e.g., `EN`),
   **Then** the dropdown closes, the selector label updates to the chosen code, and all
   localized text on the screen (hero title, description, button label) re-renders in the
   chosen language.
3. **Given** no explicit language is selected,
   **When** the screen first loads,
   **Then** the language selector shows `VN` and the screen renders Vietnamese copy by
   default.

---

### US4: Reject non-whitelisted accounts (Priority: P2)

**As the** product
**I want to** block users whose Google account is not on the Sun\* domain
**So that** only authorized employees can enter the application.

**Why this priority**: Compliance/access-control gate. The product is internal-only and
external accounts must not establish a session.

**Independent Test**: Complete the Google consent flow using an external (non Sun\*-domain)
account and assert the user lands on the 403 / access-denied screen with no session
created.

**Acceptance Scenarios**:

1. **Given** an unauthenticated user clicks "LOGIN With Google",
   **When** they authenticate successfully with a Google account that is not on the Sun\*
   domain,
   **Then** the server rejects the login, no session is created, and the user is routed to
   the Error 403 screen (`T3e_iS9PCL`).
2. **Given** the OAuth flow fails or is cancelled by the user,
   **When** control returns to the Login screen,
   **Then** the button returns to its idle state and an inline / toast error explains the
   failure; the user remains on the Login screen.

---

### Edge Cases

- **Network/OAuth timeout** — the loading state on the login button MUST resolve to either
  success (redirect) or error (idle button + message) within the OAuth provider's timeout;
  no indefinite spinner.
- **Popup blocker** — if the OAuth popup is blocked by the browser, the user MUST receive a
  message instructing them to allow popups; the button returns to idle.
- **Session expired during use** — when another screen detects an expired session, the user
  is returned to Login (incoming edge from `T3e_iS9PCL`).
- **Deep-link sign-in** — TODO: confirm whether a `returnTo` query parameter is preserved
  through OAuth so deep-link visits land on the originally requested page after sign-in.
- **Multiple language frames** — TODO: SCREENFLOW.md flagged two language-dropdown frames
  (`IiLVGkACbt`, `hUyaaugye2`); confirm which is canonical before implementation.

---

## UI/UX Requirements *(behavior, not pixels)*

### Screen Components

| Node ID                  | Region | Component                               | Type     | Interactive? | Behavior                                                                                  |
| ------------------------ | ------ | --------------------------------------- | -------- | ------------ | ----------------------------------------------------------------------------------------- |
| `662:14391`              | A      | `mms_A_Header`                          | Instance | Container    | Hosts the logo and language switch.                                                       |
| `I662:14391;186:2166`    | A.1    | `mms_A.1_Logo` (SAA 2025 logo)          | Frame    | No           | Decorative; click/hover have no effect.                                                   |
| `I662:14391;186:1601`    | A.2    | `mms_A.2_Language`                      | Frame    | Yes          | Click opens language dropdown (`IiLVGkACbt`); hover shows pointer cursor + highlight.     |
| `662:14388`              | C      | `mms_C_Keyvisual`                       | Group    | No           | Decorative hero artwork.                                                                  |
| `662:14393`              | B      | `mms_B_Bìa`                             | Frame    | No           | Hero cover frame.                                                                         |
| `662:14395`              | B.1    | `mms_B.1_Key Visual`                    | Frame    | No           | Hero key visual.                                                                          |
| `662:14753`              | B.2    | `mms_B.2_content` (hero copy)           | Text     | No           | Localized title ("ROOT FURTHER") + description; not selectable.                           |
| `662:14425`              | B.3    | `mms_B.3_Login` ("LOGIN With Google")   | Frame    | Yes          | Primary CTA. Initiates Google OAuth flow; shows loading and disabled states during auth.  |
| `662:14447`              | D      | `mms_D_Footer`                          | Instance | No           | Footer; fixed at the bottom of the viewport; non-interactive.                             |

### Component Behavior Detail

- **`662:14425` — "LOGIN With Google" button**
  - **Trigger**: user click.
  - **Action**: opens the Google OAuth flow (new tab or popup) and awaits the callback.
  - **States**: `idle` → `loading` (disabled, spinner) → `success` (navigation occurs) or
    `error` (return to `idle`, surface error message).
  - **Validation**: none on the client; the server enforces Sun\*-domain whitelist after
    OAuth.
  - **Navigation on success**: → Homepage SAA (`i87tDx10uM`).
  - **Navigation on whitelist failure**: → Error 403 (`T3e_iS9PCL`).
  - **Navigation on cancel/auth failure**: stay on Login.

- **`I662:14391;186:1601` — Language selector**
  - **Trigger**: user click toggles the dropdown; hover changes the cursor.
  - **Action**: opens the language dropdown frame (`IiLVGkACbt`); selecting an option
    applies the language to the entire screen and persists the choice for subsequent loads.
  - **Default**: `VN` on first visit.
  - **States**: `closed` ↔ `open`.
  - **Navigation**: none (in-place dropdown; no route change).

- **Logo (`I662:14391;186:2166`)** and **Footer (`662:14447`)** are **non-interactive** —
  click and hover MUST have no effect.

### Navigation Flow (sourced from `.momorph/contexts/SCREENFLOW.md`)

- **Incoming**:
  - App launch when unauthenticated → Login.
  - Profile dropdown "Logout" (`z4sCl3_Qtk`, `54rekaCHG1`) → Login.
  - Error 403 (`T3e_iS9PCL`) session-expired → Login.
- **Outgoing**:
  - "LOGIN With Google" success → Homepage SAA (`i87tDx10uM`).
  - "LOGIN With Google" whitelist failure → Error 403 (`T3e_iS9PCL`).
  - "LOGIN With Google" cancel/failure → stay on Login (toast).
  - Header language click → Language Dropdown (`IiLVGkACbt`).

### Visual / Accessibility Requirements (non-prescriptive)

- Responsive: layout MUST adapt to mobile, tablet, and desktop breakpoints; logo stays
  top-left, language selector stays top-right, footer stays at the bottom across all sizes.
- Animation: the login button MUST visually communicate `loading` while OAuth is in flight.
- Accessibility: button and language selector MUST be keyboard-focusable, have visible
  focus rings, and expose accessible names; the language dropdown MUST be operable with
  arrow keys + Enter/Esc.

> Pixel-level styling, colors, fonts, and asset paths are intentionally out of scope; the
> implementation step retrieves them via `query_section` / `get_media_files`.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST authenticate users exclusively via Google OAuth on this
  screen. No email/password form is permitted.
- **FR-002**: The system MUST detect an existing valid session on screen mount and redirect
  authenticated users to Homepage SAA (`i87tDx10uM`) before rendering any login UI.
- **FR-003**: On clicking "LOGIN With Google", the system MUST initiate Google OAuth and
  disable the button with a loading indicator until the flow resolves.
- **FR-004**: On OAuth success with a Sun\*-domain account, the system MUST create a
  session and redirect to Homepage SAA.
- **FR-005**: On OAuth success with a non Sun\*-domain account, the system MUST refuse to
  create a session and redirect to the Error 403 screen (`T3e_iS9PCL`).
- **FR-006**: On OAuth failure or user cancel, the system MUST keep the user on the Login
  screen, surface an error message, and return the button to its idle state.
- **FR-007**: The language selector MUST default to `VN` and offer at least Vietnamese and
  English; selecting a language MUST update all visible localized strings on the screen.
- **FR-008**: The logo and footer MUST be non-interactive (no click/hover behavior).

### Technical Requirements

- **TR-001 (Performance)**: Session detection on mount MUST complete and either redirect or
  render the login UI within 1 second on a warm cache; the screen MUST avoid a flash of
  login UI for already-authenticated users.
- **TR-002 (Security)**: OAuth state/PKCE MUST be enforced; the Sun\*-domain whitelist MUST
  be validated server-side (never trust client-side claims).
- **TR-003 (Reliability)**: The button's `loading` state MUST resolve within the OAuth
  provider's timeout; an indefinite loading state is a defect.
- **TR-004 (Accessibility)**: The screen MUST meet WCAG 2.1 AA for keyboard navigation,
  focus visibility, and accessible names.
- **TR-005 (i18n)**: All visible copy MUST be sourced from a localization mechanism; no
  hard-coded user-facing strings in components.

### Key Entities

- **AuthSession**: represents an authenticated user. Attributes (predicted): `userId`,
  `email`, `displayName`, `avatarUrl`, `domain`, `issuedAt`, `expiresAt`.
- **OAuthState**: short-lived value used to defend against CSRF during the OAuth round
  trip. Attributes (predicted): `state`, `nonce`, `returnTo` (optional), `expiresAt`.

---

## API Dependencies *(predicted)*

| Endpoint                       | Method | Purpose                                                                                | Triggered by                              | Status    |
| ------------------------------ | ------ | -------------------------------------------------------------------------------------- | ----------------------------------------- | --------- |
| `/api/auth/session` (or `/me`) | GET    | Check whether the visitor already has a valid session; drives the auto-redirect (US2). | Screen mount                              | Predicted |
| `/api/auth/google`             | GET    | Begin Google OAuth (server-issued redirect to Google with `state`/PKCE).               | Click "LOGIN With Google" (US1)           | Predicted |
| `/api/auth/google/callback`    | GET    | Receive Google callback, validate Sun\*-domain whitelist, create session or 403.       | OAuth provider redirect                   | Predicted |
| `/api/auth/logout`             | POST   | Clear session; reused by other screens that send users back to Login.                  | "Logout" in profile dropdown (other screens) | Predicted |
| `/api/i18n/{locale}`           | GET    | Fetch localized strings for the chosen language (if not bundled at build time).        | Language change (US3)                     | Predicted |

> **Note**: The exact callback path name is a TODO (`/api/auth/google/callback` is the
> assumed convention). Confirm with the API spec before implementation.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of unauthenticated visits to the login URL render the login UI without
  errors; 100% of authenticated visits redirect to Homepage SAA without rendering the form.
- **SC-002**: ≥ 99% of OAuth attempts with a Sun\*-domain account result in a successful
  session and redirect within 5 seconds end-to-end (excluding Google's own latency).
- **SC-003**: 100% of OAuth attempts with a non Sun\*-domain account result in no session
  and a redirect to the 403 screen.
- **SC-004**: The "LOGIN With Google" button never remains in the `loading` state after the
  OAuth flow resolves (no indefinite spinners).

---

## State Management

- **Local component state** (Login screen):
  - `loginButtonState`: `idle` | `loading` | `error` (with optional message).
  - `languageMenuOpen`: `boolean`.
- **Global / app-level state**:
  - `currentSession`: read on mount via `/api/auth/session`. Drives the US2 auto-redirect.
    Cleared on logout.
  - `currentLocale`: shared across the app; default `VN`. Persisted (cookie or
    `localStorage`) so the user's language choice survives across visits.
- **Server state caching**:
  - `currentSession` SHOULD be cached for the lifetime of the page load only (no stale
    reuse across logins).
  - Localization bundles MAY be cached aggressively (per locale) since they change rarely.
- **Optimistic updates**: none on this screen — login state changes are server-authoritative
  and the UI MUST reflect the actual outcome of the OAuth round trip.

---

## Out of Scope

- Email/password sign-in, registration, "Forgot Password" recovery — explicitly absent.
- Multi-factor authentication beyond Google's own.
- Account creation / first-time onboarding flows.
- Visual styling (colors, fonts, spacing, asset paths) — handled at implementation time.
- Detailed contents of the language dropdown (`IiLVGkACbt`) — covered by its own spec.
- Detailed contents of the Error 403 screen (`T3e_iS9PCL`) — covered by its own spec.

---

## Dependencies

- [x] Constitution document exists ([`.momorph/constitution.md`](../../constitution.md))
- [x] Screen flow documented ([`.momorph/contexts/SCREENFLOW.md`](../../contexts/SCREENFLOW.md))
- [ ] API specifications available (`.momorph/API.yml`) — not yet generated
- [ ] Database design completed (`.momorph/database.sql`) — not required for OAuth-only
  client work; backend session storage decision pending (`TODO(DATABASE_AND_ORM)` in
  constitution)
- [ ] Test framework pinned (`TODO(TEST_FRAMEWORKS)` in constitution) — required before US1
  can ship behind the project's TDD principle

### Constitution Alignment

- **Principle I — Spec-Driven Development**: this spec, plus SCREENFLOW.md, will drive the
  implementation. All navigation targets are sourced from SCREENFLOW.md, not guessed.
- **Principle II — Test-First**: the test cases under
  `get_frame_test_cases` (sheet `Login_0130`) MUST be converted to failing tests before
  implementation begins.
- **Principle III — Layered Architecture**: the OAuth flow MUST live behind a service layer
  (e.g., `auth-service.ts`); the route handler stays thin.
- **Principle IV — Design Tokens**: any visual values added at implementation time MUST go
  through Tailwind/CSS variables — out of scope for this spec.
- **Principle V — Type Safety**: all DTOs (`AuthSession`, `OAuthState`) MUST be typed; no
  `any`.

---

## Notes

- Login is **Google SSO only** — confirmed by both `list_design_items` (only one button
  child of `mms_B.3_Login`) and the test cases (no email/password test coverage). Do not
  add a fallback form during implementation.
- Hero copy currently observed in test cases: title "ROOT FURTHER", descriptions
  "Bắt đầu hành trình của bạn cùng SAA 2025." and "Đăng nhập để khám phá!". Treat these as
  default-locale (`VN`) source strings for i18n keys.
- Open TODOs to resolve before/with implementation:
  - Confirm OAuth callback route name.
  - Confirm canonical language dropdown frame (`IiLVGkACbt` vs `hUyaaugye2`).
  - Confirm `returnTo` deep-link preservation through the OAuth flow.
  - Confirm whether the Sun\*-domain failure surfaces as a full-page 403 (`T3e_iS9PCL`) or
    an inline message; SCREENFLOW.md notes both possibilities.
