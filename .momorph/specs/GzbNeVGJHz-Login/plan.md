# Implementation Plan: Login

**Frame**: `GzbNeVGJHz-Login`
**Date**: 2026-05-06
**Spec**: [`spec.md`](./spec.md)
**Screenflow**: [`../../contexts/SCREENFLOW.md`](../../contexts/SCREENFLOW.md)
**Constitution**: [`../../constitution.md`](../../constitution.md)

---

## Summary

Build the **Login screen** as a Next.js 16 App Router public route that authenticates users
via **Google SSO** through **Supabase Auth** (`@supabase/ssr`). Authenticated visits
short-circuit to Homepage SAA via a server-side session check. Sun\*-domain whitelist is
enforced server-side in the OAuth callback, with rejected accounts immediately signed out
and routed to the Error 403 screen. The page is statically navigable from logout flows and
the 403 screen, and includes a header language switch (default `VN`).

This is the first feature on a fresh Next.js scaffold, so the plan also pins the previously
deferred test-framework choice and adds the Supabase client wiring used by all future
features.

---

## Technical Context

| Item                      | Choice                                                                                  |
| ------------------------- | --------------------------------------------------------------------------------------- |
| **Language/Framework**    | TypeScript 5 (strict) / Next.js 16.2.4 App Router / React 19.2.4                         |
| **Auth provider**         | **Supabase Auth** (Google OAuth) via `@supabase/ssr` for cookie-based SSR sessions      |
| **Database**              | Supabase Postgres (managed) — used here only for the `auth` schema; app tables TBD       |
| **ORM**                   | None for MVP — Supabase JS client suffices for the auth surface area                     |
| **Styling**               | Tailwind CSS v4 with CSS-variable tokens (per Constitution Principle IV)                 |
| **State Management**      | Local component state (`useState`) + Server Components for session reads. No global store yet. |
| **API Style**             | Next.js App Router route handlers (`route.ts`) under `/app/api` and `/app/auth`         |
| **Testing**               | **Vitest** + `@testing-library/react` + `jsdom` (unit/integration) and **Playwright** (E2E) |
| **i18n**                  | Lightweight in-app dictionary for MVP (VN/EN); upgrade to `next-intl` flagged as a follow-up |

> **Constitution amendment required (MINOR → v1.1.0)**: pin Supabase Auth as auth provider,
> pin Vitest + Playwright as test frameworks. To be done in the same PR as scaffolding.

---

## Constitution Compliance Check

*GATE: Must pass before implementation can begin*

| Requirement                            | Constitution Rule                                | Status        |
| -------------------------------------- | ------------------------------------------------ | ------------- |
| Spec exists & traces to Figma          | I — Spec-Driven Development                      | ✅ Compliant  |
| Navigation sourced from SCREENFLOW.md  | I — Spec-Driven Development                      | ✅ Compliant  |
| Tests written before implementation    | II — Test-First (NON-NEGOTIABLE)                 | 📋 Planned    |
| Layered architecture (route → service) | III — Layered Architecture & Thin Boundaries     | 📋 Planned    |
| No hard-coded visual values            | IV — Design Tokens Over Hard-Coded Values        | 📋 Planned    |
| TS strict, ESLint clean, conventions   | V — Type Safety & Convention Conformance         | ✅ Compliant (config in place) |
| `npm run build` & `npm run lint` pass  | V — Quality gate                                 | 📋 Planned (CI to be added) |

**Violations**:

| Violation                                          | Justification                                                                                          | Alternative Rejected                                                                                                                                                |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Plan written before `design-style.md` is generated | Project decision: visual specs are fetched on-demand at implementation time per Constitution Principle IV (tokens) and the spec's own out-of-scope clause. | Generating a frozen `design-style.md` now duplicates Figma data and rots quickly; on-demand fetch via `query_section` keeps the source of truth in Figma.            |
| Plan written before `BACKEND_API_TESTCASES.md`     | The spec's "API Dependencies (Predicted)" table is the only contract source today; the team has not yet authored backend test cases. | Blocking the plan delays MVP. Predicted endpoints are conservative; actual contracts will be reconciled when the backend test cases are authored.                    |
| Test framework not yet pinned in constitution      | The constitution explicitly carries `TODO(TEST_FRAMEWORKS)`; this plan resolves it.                    | Continuing without a pin defers TDD setup. We commit to Vitest + Playwright in the scaffolding PR and amend the constitution to v1.1.0 in the same change.            |

---

## Architecture Decisions

### Frontend Approach

- **Component Structure**: feature-folder under `components/login/` — one **Server Component**
  (`app/login/page.tsx`) for session detection + initial render, with **Client Components**
  for interactive pieces (login button, language switch).
- **Styling Strategy**: Tailwind v4 utilities backed by CSS variables in `app/globals.css`.
  No raw hex/px/rem in JSX. Tokens added on first need are documented in a one-line
  comment.
- **Data Fetching**:
  - **Session check (US2)**: server-side in `app/login/page.tsx` via the SSR Supabase client;
    if a session exists, return `redirect('/')` before rendering JSX (no flash).
  - **OAuth initiation (US1)**: client-side `supabase.auth.signInWithOAuth({ provider: 'google' })`
    triggered from the button; loading state managed locally.
  - **OAuth callback**: server route handler `app/auth/callback/route.ts` exchanges the
    code for a session and applies the domain whitelist.
- **State Management**:
  - `loginButtonState: 'idle' | 'loading' | 'error'` — local `useState`.
  - `languageMenuOpen: boolean` — local `useState`.
  - `currentLocale` — cookie-backed; read server-side, write client-side via a small server
    action (`set-locale`).
  - No client-side session cache: the SSR client + cookies are the source of truth.

### Backend Approach (Next.js route handlers)

- **API Design**: thin App Router route handlers; business logic lives in
  `lib/auth/auth-service.ts` (Constitution Principle III). Handlers do `Request` → call
  service → `NextResponse`.
- **Data Access**: `@supabase/ssr` — separate `createBrowserClient`, `createServerClient`,
  and middleware helper. No direct DB queries for this feature; all auth state lives in
  Supabase.
- **Validation**: lightweight inline checks (no external validator yet); the auth callback
  validates `code`, `state`, and the resolved user's email domain. Add `zod` only when a
  schema requires reuse — out of scope for MVP.
- **Domain whitelist**: enforced in `app/auth/callback/route.ts` after
  `exchangeCodeForSession` — if the user's email is not in `ALLOWED_DOMAINS`, immediately
  call `supabase.auth.signOut()` and `redirect('/403')`.

### Integration Points

- **Existing services**: none yet — this is the first feature.
- **Shared components**: header (language switch) and footer will live in
  `components/layout/` so they can be reused by Homepage SAA and other screens.
- **API contracts**: the spec's predicted endpoints map onto Supabase + a single locale
  helper. The actual paths used:
  - `GET /auth/callback` (replaces predicted `GET /api/auth/google/callback`)
  - `POST /auth/sign-out` (replaces predicted `POST /api/auth/logout`)
  - `GET /api/i18n/locales` (matches predicted `GET /api/i18n/{locale}` shape)

---

## Project Structure

### Documentation (this feature)

```text
.momorph/specs/GzbNeVGJHz-Login/
├── spec.md            # ✅ exists — feature specification
├── plan.md            # ✅ this file
├── research.md        # 📋 optional — open questions captured below; promote if needed
└── tasks.md           # 📋 next step (run /momorph.tasks)
```

### Source Code (root-flat layout, matching existing scaffold)

```text
app/
├── login/
│   └── page.tsx                 # NEW — server component: session check + LoginScreen render
├── auth/
│   ├── callback/
│   │   └── route.ts             # NEW — OAuth callback handler (code exchange + domain check)
│   └── sign-out/
│       └── route.ts             # NEW — POST sign-out (used by future logout buttons)
├── 403/
│   └── page.tsx                 # NEW — access-denied screen (placeholder; full spec separate)
├── api/
│   └── i18n/
│       └── locales/
│           └── route.ts         # NEW — GET supported locales
├── globals.css                   # MODIFIED — add CSS-variable tokens used by login UI
├── layout.tsx                    # MODIFIED — wire HtmlLang from cookie locale
└── page.tsx                      # MODIFIED — Homepage SAA placeholder (gated by middleware)

components/
├── layout/
│   ├── header.tsx                # NEW — header instance with logo + language switch
│   ├── header-language-switch.tsx# NEW — client component: language dropdown trigger
│   ├── language-dropdown.tsx     # NEW — overlay (covers Figma frame IiLVGkACbt for the dropdown menu)
│   └── footer.tsx                # NEW — non-interactive footer (frame mms_D_Footer)
└── login/
    ├── login-screen.tsx          # NEW — orchestrates hero + button (server + client mix)
    ├── login-hero.tsx            # NEW — server component: title + description (i18n-aware)
    └── login-button.tsx          # NEW — client component: Google OAuth button + states

lib/
├── supabase/
│   ├── client.ts                 # NEW — createBrowserClient(...) factory
│   ├── server.ts                 # NEW — createServerClient(...) for RSC + route handlers
│   └── middleware.ts             # NEW — refresh-session helper used by middleware.ts
├── auth/
│   ├── auth-service.ts           # NEW — service layer (signInWithGoogle, signOut, getSession)
│   ├── allowed-domains.ts        # NEW — exports ALLOWED_DOMAINS + isAllowedEmail()
│   └── errors.ts                 # NEW — typed auth error codes
└── i18n/
    ├── dictionary.ts             # NEW — VN/EN strings used on Login (title, description, button)
    └── get-locale.ts             # NEW — read locale cookie server-side

hooks/
└── use-locale.ts                 # NEW — client-side locale read + setter (cookie + server action)

types/
└── auth.ts                       # NEW — AuthSession, OAuthErrorCode types

middleware.ts                     # NEW — session refresh + protect "/" route
.env.local.example                # NEW — document required Supabase env vars
public/
└── assets/
    └── login/
        ├── icons/                # NEW (Phase 0) — Google icon, language flag(s), chevron
        ├── images/               # NEW (Phase 0) — hero key visual, footer artwork
        └── logos/                # NEW (Phase 0) — SAA 2025 logo

tests/
├── unit/
│   ├── allowed-domains.test.ts   # NEW — pure-function whitelist
│   ├── auth-service.test.ts      # NEW — service-layer logic with mocked Supabase
│   └── login-button.test.tsx     # NEW — UI states (idle/loading/error)
├── integration/
│   └── auth-callback.test.ts     # NEW — exercises route handler with a stubbed Supabase
└── e2e/
    └── login.spec.ts             # NEW — Playwright happy + 403 flows
```

### Dependencies to add

| Package                           | Version (target) | Purpose                                           |
| --------------------------------- | ---------------- | ------------------------------------------------- |
| `@supabase/supabase-js`           | latest 2.x       | Core Supabase JS client                           |
| `@supabase/ssr`                   | latest 0.x       | SSR-safe cookie wiring for Next.js App Router     |
| `vitest`                          | latest           | Unit + integration test runner                    |
| `@vitejs/plugin-react`            | latest           | Vite/Vitest React plugin for `.tsx`               |
| `@testing-library/react`          | latest           | Component testing                                 |
| `@testing-library/jest-dom`       | latest           | DOM assertions                                    |
| `jsdom`                           | latest           | DOM env for Vitest                                |
| `@playwright/test`                | latest           | E2E test framework                                |

> Pin exact versions in `package.json` at install time; avoid wildcards.

### Environment variables

| Var                                     | Where                | Purpose                                  |
| --------------------------------------- | -------------------- | ---------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`               | client + server      | Supabase project URL                     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`          | client + server      | Anonymous public key                     |
| `SUPABASE_SERVICE_ROLE_KEY`              | server only          | Used by future admin paths (not by Login itself) — **NEVER ship to client** |
| `ALLOWED_EMAIL_DOMAINS`                  | server only          | Comma-separated list (e.g., `sun-asterisk.com`) |
| `NEXT_PUBLIC_SITE_URL`                   | client + server      | Base URL used to build the OAuth `redirectTo` |

---

## Implementation Approach

### Phase 0: Asset Preparation & Toolchain Bootstrap

- Run `get_media_files` for frame `662:14387` and download:
  - SAA 2025 logo (from `mms_A.1_Logo`) → `public/assets/login/logos/`
  - Google icon (from `mms_B.3_Login`) → `public/assets/login/icons/google-icon.svg`
  - Vietnam flag (from `mms_A.2_Language`) → `public/assets/login/icons/flag-vn.svg`
  - Hero key visual (from `mms_B.1_Key Visual` / `mms_C_Keyvisual`) → `public/assets/login/images/`
  - Footer artwork (from `mms_D_Footer`) → `public/assets/login/images/`
- Use **kebab-case filenames**, organize under `public/assets/login/{icons|images|logos}/`
  per the frontend guideline.
- Install dependencies (`@supabase/*`, Vitest, Playwright, etc.).
- Add `vitest.config.ts`, `playwright.config.ts`, `.env.local.example`.
- Add `npm run test`, `npm run test:e2e`, `npm run typecheck` scripts.
- Amend constitution to **v1.1.0** to pin Supabase Auth + Vitest + Playwright (resolves
  `TODO(DATABASE_AND_ORM)` partially and `TODO(TEST_FRAMEWORKS)` fully).

### Phase 1: Foundation

- `lib/supabase/{client,server,middleware}.ts` — three Supabase client factories.
- `middleware.ts` — refresh session on every request, gate `/` to authenticated users.
- `lib/auth/allowed-domains.ts` + unit test — pure function, easiest TDD entry point.
- `lib/auth/errors.ts` + `types/auth.ts` — shared types/codes.
- `lib/auth/auth-service.ts` (skeleton with `getSession`, `signInWithGoogle`, `signOut`,
  `assertEmailAllowed`) and a unit test that mocks the Supabase client.
- `lib/i18n/{dictionary,get-locale}.ts` and `hooks/use-locale.ts` (minimal VN/EN strings
  for Login only).

**Phase 1 Checkpoint**: tests for `allowed-domains` and `auth-service` are green; no UI yet.

### Phase 2: User Story 1 (P1) — Sign in with Google 🎯 MVP

Vertical slice end-to-end:

1. Write failing test: Playwright spec that visits `/login`, clicks the button, mocks the
   Supabase popup callback URL, and asserts redirect to `/`.
2. Write failing unit test for `LoginButton` (idle → loading → success path with mocked
   `signInWithOAuth`).
3. Implement `LoginButton` (client component) — wires `auth-service.signInWithGoogle()`.
4. Implement `LoginHero` (server component) — pulls strings from the dictionary.
5. Implement `LoginScreen` and `app/login/page.tsx` (server component does session check
   first; redirect to `/` if signed in — covers US2 implicitly).
6. Implement `app/auth/callback/route.ts` — exchanges code, applies whitelist, redirects.
   Whitelist failure path is unit-tested; happy path is covered by the Playwright test.

**Phase 2 Checkpoint**: US1 + US2 acceptance scenarios pass; `npm run test`, `npm run test:e2e`, and `npm run build` succeed.

### Phase 3: User Story 4 (P2) — Domain whitelist (security gate)

- Failing integration test: stub `exchangeCodeForSession` to return a non-Sun\* email →
  expect `signOut` called, response is `307` to `/403`, no session cookie set.
- Implement the whitelist check in the callback route (logic already exists from Phase 1
  service; wire it).
- Implement `app/403/page.tsx` (placeholder content; full spec is a separate frame).

**Phase 3 Checkpoint**: a non-Sun\* account never reaches `/`.

### Phase 4: User Story 3 (P2) — Language switch

- `HeaderLanguageSwitch` (client component) — opens `LanguageDropdown` overlay.
- `LanguageDropdown` — minimal VN/EN list; on select, writes the `locale` cookie via a
  server action and refreshes the route.
- `app/api/i18n/locales/route.ts` — returns the static list for now (DB-backed list is a
  follow-up).
- `Header` integrates the switch; layout uses `lang` attribute from the cookie.

**Phase 4 Checkpoint**: switching VN ↔ EN re-renders Login copy correctly; choice persists
across reloads.

### Phase 5: Polish

- Loading + error UI for the login button (toast or inline message).
- Keyboard navigation: focus rings, dropdown arrow-key navigation, Esc to close.
- ARIA labels on the language switch and login button.
- Telemetry hooks (placeholder; full observability is a separate concern).
- README update: `Run with Supabase` quickstart.

---

## Risk Assessment

| Risk                                                                             | Probability | Impact | Mitigation                                                                                                                                |
| -------------------------------------------------------------------------------- | ----------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Supabase Google provider not yet configured in the project                       | High        | High   | Provision Supabase project + Google OAuth credentials before Phase 2; document in `.env.local.example`. Phase 1 can complete without this. |
| Domain whitelist enforced only client-side leaks access                          | Low (with this plan) | High | The whitelist runs in `app/auth/callback/route.ts` server-side; never trust the Supabase JWT email until the server confirms it.            |
| `@supabase/ssr` cookie handling subtly breaks under React Server Components      | Medium      | Medium | Follow the official `@supabase/ssr` Next.js App Router pattern verbatim; cover with the Playwright happy-path E2E.                         |
| Test framework choice diverges from team consensus                               | Medium      | Low    | Constitution amendment (v1.1.0) is the gate; if rejected in review, swap before any tests are written.                                     |
| design-style.md absent → visual drift                                            | Medium      | Low    | Implementation-time `query_section` calls per component; reviewer checks against Figma frame.                                              |
| `returnTo` deep-link handling not specified                                      | Medium      | Low    | MVP ignores `returnTo` (always lands on `/`). Add as a Phase 5 follow-up if the team confirms the requirement.                              |

### Estimated Complexity

- **Frontend**: Medium (server/client split, language switch, asset wiring)
- **Backend**: Low (single OAuth callback handler + sign-out + locale list)
- **Testing**: Medium (Vitest + Playwright are new to the repo)

---

## Integration Testing Strategy

### Test Scope

- **Component/Module interactions**:
  - `LoginButton` ↔ `auth-service.signInWithGoogle`
  - `app/auth/callback/route.ts` ↔ `auth-service.assertEmailAllowed`
  - `app/login/page.tsx` ↔ `auth-service.getSession`
- **External dependencies**: Supabase Auth (OAuth + session cookies); Google as the
  identity provider.
- **Data layer**: cookies (session + locale).
- **User workflows**: unauthenticated login flow; authenticated auto-redirect; whitelist
  reject; language switch persistence.

### Test Categories

| Category             | Applicable? | Key Scenarios                                                                                  |
| -------------------- | ----------- | ---------------------------------------------------------------------------------------------- |
| UI ↔ Logic           | Yes         | Button click → service call → loading state; dropdown open/close.                              |
| Service ↔ Service    | Yes         | `auth-service` ↔ Supabase client (mocked); callback route ↔ `auth-service`.                    |
| App ↔ External API   | Yes         | OAuth round trip (mocked in unit/integration; real in a single Playwright happy-path test).    |
| App ↔ Data Layer     | Yes         | Session cookie set/cleared; locale cookie written and read across requests.                    |
| Cross-platform       | Yes         | Layout adapts at mobile/tablet/desktop (Playwright projects).                                  |

### Test Environment

- **Type**: local dev for unit/integration; ephemeral Supabase test project for E2E
  happy-path (or fully mocked OAuth using Playwright route interception for CI determinism).
- **Test data**: factory helpers for fake `User` / `Session` shapes; no shared DB writes.
- **Isolation**: each test gets a fresh Supabase client mock; Playwright resets cookies
  between specs.

### Mocking Strategy

| Dependency Type         | Strategy        | Rationale                                                                       |
| ----------------------- | --------------- | ------------------------------------------------------------------------------- |
| Supabase JS client      | Mock (unit/int) | Keeps tests deterministic; we own the integration boundary.                     |
| Google OAuth provider   | Mock via Playwright route interception | Real Google not callable from CI; mocking lets us drive every callback shape.  |
| Cookies                 | Real            | The whole flow depends on cookie-set semantics; no value in mocking these.      |

### Test Scenarios Outline

1. **Happy Path**
   - [ ] Unauthenticated user signs in with Google (Sun\* domain) → lands on `/`.
   - [ ] Authenticated user visits `/login` → server redirects to `/` (no UI flash).
2. **Error Handling**
   - [ ] OAuth code exchange fails → user stays on `/login`, sees error toast.
   - [ ] User cancels Google consent → user stays on `/login`, button returns to idle.
3. **Edge Cases**
   - [ ] Non Sun\*-domain Google account → server signs out + redirects to `/403`.
   - [ ] Session expired mid-app → middleware bounces to `/login`.
   - [ ] Language switched to EN → reload preserves EN.

### Tooling & Framework

- **Test framework**: Vitest (unit + integration), Playwright (E2E).
- **Supporting tools**: `@testing-library/react` for component tests; Playwright route
  interception for OAuth mocking.
- **CI integration**: GitHub Actions workflow runs `npm run lint`, `npm run typecheck`,
  `npm run test`, `npm run test:e2e` on every PR (CI to be added in Phase 0).

### Coverage Goals

| Area                           | Target | Priority |
| ------------------------------ | ------ | -------- |
| `lib/auth/*`                   | 95%+   | High     |
| `app/auth/callback/route.ts`   | 100% (line + branch) | High |
| `components/login/*`           | 80%+   | High     |
| `lib/i18n/*`                   | 80%+   | Medium   |
| Layout / shared chrome         | 60%+   | Low      |

---

## Dependencies & Prerequisites

### Required Before Start

- [x] `constitution.md` reviewed and understood
- [x] `spec.md` approved by stakeholders *(self-approved by user — confirm)*
- [ ] `research.md` completed *(optional; this plan covers the salient findings)*
- [x] API contracts defined *(predicted only — see spec)*
- [ ] Database migrations planned *(N/A for Login MVP — Supabase manages auth schema)*

### External Dependencies

- Supabase project (URL + anon key + service-role key) — must be provisioned.
- Google OAuth client (Client ID + secret) registered with Supabase as a provider.
- `ALLOWED_EMAIL_DOMAINS` env value confirmed with security/IT.

---

## Open Questions

- [ ] Confirm Supabase project ownership + how secrets are distributed to developers/CI.
- [ ] Confirm the canonical Sun\* email domain(s) for the whitelist (`sun-asterisk.com`?
      additional subdomains?).
- [ ] Confirm `returnTo` deep-link preservation requirement (Phase 5 vs. cut).
- [ ] Confirm whether Sun\*-domain failure should render the full 403 page (`T3e_iS9PCL`)
      *and* an inline message, or 403 only (current plan: 403 only).
- [ ] Confirm canonical language-dropdown frame (`IiLVGkACbt` vs. `hUyaaugye2`).
- [ ] Confirm CI provider (GitHub Actions assumed) and the expected baseline for
      `npm run test:e2e` in CI (real Supabase project vs. fully mocked).

---

## Next Steps

After plan approval:

1. **Run** `/momorph.tasks` to generate the task breakdown for this plan.
2. **Review** `tasks.md` for parallelization opportunities (Phases 0 + 1 have several
   `[P]` candidates).
3. **Begin** implementation following task order — TDD cadence per Constitution
   Principle II.

---

## Notes

- This plan deliberately bundles a few "first-feature" concerns (test framework choice,
  Supabase wiring, layout chrome) into Login because the repo is a fresh scaffold. They
  surface as separate phases/tasks, but live in the same PR series.
- All asset filenames adopt kebab-case under `public/assets/login/{icons|images|logos}/`,
  matching the frontend guideline.
- All visual values (colors, spacing, typography) MUST be added as CSS variables in
  `app/globals.css` and consumed via Tailwind utilities — no inline magic numbers
  (Constitution Principle IV). Specific values are fetched from Figma via `query_section`
  at implementation time.
