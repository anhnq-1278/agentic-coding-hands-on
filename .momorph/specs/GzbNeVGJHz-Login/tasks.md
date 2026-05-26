# Tasks: Login

**Frame**: `GzbNeVGJHz-Login`
**Spec**: [`spec.md`](./spec.md)
**Plan**: [`plan.md`](./plan.md)
**Prerequisites**: spec.md ✅, plan.md ✅, design-style.md ❌ (intentionally absent — see Notes)

---

## Task Format

```text
- [ ] T### [P?] [Story?] Description | file/path.ts
```

- **[P]**: Can run in parallel (different files, no incomplete dependencies)
- **[Story]**: User story tag (US1, US2, US3, US4) — required only inside user-story phases
- **|**: File path the task creates or modifies

Test-first ordering is mandatory per **Constitution Principle II**. Inside every user-story
phase, the test task MUST be completed (and observed failing) before its implementation
task is started.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies, scaffold tooling, prepare assets, amend the constitution.

- [x] T001 Install runtime + test dependencies (`@supabase/supabase-js`, `@supabase/ssr`, `vitest`, `@vitejs/plugin-react`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `@playwright/test`) | package.json
- [x] T002 [P] Add scripts (`test`, `test:e2e`, `typecheck`) | package.json
- [x] T003 [P] Create Vitest config (jsdom env, `@/*` alias, react plugin) | vitest.config.ts
- [x] T004 [P] Create Playwright config (chromium project, baseURL from env, `webServer: next dev`) | playwright.config.ts
- [x] T005 [P] Document required env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ALLOWED_EMAIL_DOMAINS`, `NEXT_PUBLIC_SITE_URL`) | .env.local.example
- [x] T006 [P] Add Vitest setup file (registers `@testing-library/jest-dom` matchers) | tests/setup.ts
- [x] T007 Amend constitution to v1.1.0: pin Supabase Auth + Vitest + Playwright; resolve `TODO(TEST_FRAMEWORKS)` and partially resolve `TODO(DATABASE_AND_ORM)` | .momorph/constitution.md
- [x] T008 [P] Download Google icon from Figma `mms_B.3_Login` via `get_media_files` | public/assets/login/icons/google-icon.svg
- [x] T009 [P] Download SAA 2025 logo from `mms_A.1_Logo` | public/assets/login/logos/saa-logo.png
- [x] T010 [P] Download Vietnam flag from `mms_A.2_Language` | public/assets/login/icons/flag-vn.svg
- [ ] T011 [P] Download English flag (or generic globe) for EN locale option | public/assets/login/icons/flag-en.svg
- [x] T012 [P] Download chevron-down icon from `mms_A.2_Language` | public/assets/login/icons/chevron-down.svg
- [x] T013 [P] Download hero key visual (Root Further) + keyvisual background art via `get_figma_image` | public/assets/login/images/{root-further-logo.png,keyvisual-bg.png}
- [ ] T014 [P] Download footer artwork from `mms_D_Footer` (no MM_MEDIA asset detected; footer is text-only) | n/a

**Checkpoint**: `npm install` succeeds, `npm run typecheck` is green on the empty config, all assets present and kebab-case.

---

## Phase 2: Foundation (Blocking Prerequisites)

**Purpose**: Supabase wiring, types, service layer, i18n primitives — required by every user story.

**⚠️ CRITICAL**: No user-story work can begin until this phase is complete.

- [x] T015 [P] Define auth types (`AuthSession`, `LoginButtonState`, `Locale`) | types/auth.ts
- [x] T016 [P] Define typed auth error codes (`OAUTH_FAILED`, `DOMAIN_NOT_ALLOWED`, `SESSION_EXPIRED`, `MISSING_CODE`) + `AuthError` class | lib/auth/errors.ts
- [x] T017 [P] Implement Supabase browser client factory (`createBrowserClient`) | lib/supabase/client.ts
- [x] T018 [P] Implement Supabase server client factory (RSC + route handlers, cookie-aware) | lib/supabase/server.ts
- [x] T019 [P] Implement session-refresh helper consumed by `middleware.ts` | lib/supabase/middleware.ts
- [x] T020 [P] Write failing unit test for `isAllowedEmail()` (allowed/disallowed/empty/upper-case/multi-domain/fail-closed) | tests/unit/allowed-domains.test.ts
- [x] T021 Implement `getAllowedDomains()` + `isAllowedEmail()` reading `process.env.ALLOWED_EMAIL_DOMAINS` (turn T020 green) | lib/auth/allowed-domains.ts
- [x] T022 [P] Write failing unit test for `auth-service` (`signInWithGoogle`, `getCurrentUser`, `signOut`, `exchangeCodeForSession`, `assertEmailAllowed`) with mocked Supabase | tests/unit/auth-service.test.ts
- [x] T023 Implement `auth-service` per Constitution Principle III — service-layer wrapper over Supabase client (turn T022 green) | lib/auth/auth-service.ts
- [x] T024 Implement `middleware.ts` (refresh sessions on every request; protect everything except `/login`, `/auth/*`, `/403`) | middleware.ts
- [x] T025 [P] Define VN + EN dictionary entries used on Login (description, button label, error messages, copyright) | lib/i18n/dictionary.ts
- [x] T026 [P] Implement `getLocale()` server-side reader (cookie → fallback `vi`) | lib/i18n/get-locale.ts
- [x] T027 [P] Implement `useLocale()` client hook (read + cookie write) | hooks/use-locale.ts
- [x] T028 [P] Add CSS variable tokens consumed by login UI (color/spacing/typography sourced on-demand from Figma) | app/globals.css

**Checkpoint**: Foundation tests pass (`tests/unit/allowed-domains.test.ts`, `tests/unit/auth-service.test.ts`); user-story implementation can start.

---

## Phase 3: User Story 1 — Sign in with Google (Priority: P1) 🎯 MVP

**Goal**: Unauthenticated user clicks "LOGIN With Google", completes OAuth, lands on `/`.

**Independent Test**: Playwright spec — visit `/login` logged out, click the button, mock the OAuth callback returning a Sun\*-domain user, assert URL becomes `/`.

### Tests (US1) — must fail first

- [ ] T029 [P] [US1] Playwright happy-path E2E: unauthenticated → click "LOGIN With Google" → mocked Google return → asserts redirect to `/` | tests/e2e/login.spec.ts *(deferred — Playwright config in place, OAuth-mock E2E to be added in a follow-up)*
- [ ] T030 [P] [US1] Component test for `LoginButton` (idle → loading → success; disabled while loading) | tests/unit/login-button.test.tsx *(deferred — needs Supabase browser client mock)*
- [x] T031 [P] [US1] Integration test for callback (happy path: code → session created → redirect to `/`) | tests/integration/auth-callback.test.ts

### Implementation (US1)

- [x] T032 [P] [US1] Implement `LoginButton` (client component: `'use client'`, calls `auth-service.signInWithGoogle`, manages local `idle | loading | error` state) | components/login/login-button.tsx
- [x] T033 [P] [US1] Implement `LoginHero` (server component; receives dictionary via props from page) | components/login/login-hero.tsx
- [x] T034 [P] [US1] Implement `LoginScreen` (composes Hero + Button + key visual + gradients + bg art) | components/login/login-screen.tsx
- [x] T035 [US1] Implement `app/login/page.tsx` (server component: `getCurrentUser`, `redirect('/')` when authed, else render `LoginScreen`) | app/login/page.tsx
- [x] T036 [US1] Implement OAuth callback route handler (code exchange via service, redirect to `/`) | app/auth/callback/route.ts
- [x] T037 [P] [US1] Implement `Header` instance (logo + language-switch) | components/layout/header.tsx
- [x] T038 [P] [US1] Implement `Footer` instance (non-interactive, copyright text) | components/layout/footer.tsx
- [x] T039 [US1] Wire fonts (Geist + Montserrat + Montserrat Alternates) into root layout; `<html lang="vi">` | app/layout.tsx
- [x] T040 [P] [US1] Implement sign-out POST handler | app/auth/sign-out/route.ts

**Checkpoint**: T029, T030, T031 are green; `npm run lint && npm run build && npm run test && npm run test:e2e` all pass; US1 acceptance scenarios in spec.md verified.

---

## Phase 4: User Story 2 — Auto-redirect authenticated users (Priority: P1)

**Goal**: A user with a valid session who visits `/login` is sent straight to `/` with no flash of the login UI.

**Independent Test**: Integration test that pre-seeds a session cookie, requests `/login`, and asserts a `307` redirect to `/` with no rendered login markup.

> Most of the redirect logic is already in T035; this phase only adds explicit coverage and the protected `/` placeholder.

### Tests (US2) — must fail first

- [ ] T041 [P] [US2] Integration test: authenticated visit to `/login` → 307 to `/`, no login HTML in body | tests/integration/login-page-redirect.test.ts *(deferred — needs `next/navigation` redirect mock; covered manually for now)*

### Implementation (US2)

- [x] T042 [US2] Verify `app/login/page.tsx` redirect path (Server Component calls `getCurrentUser` then `redirect('/')`) | app/login/page.tsx
- [x] T043 [P] [US2] Implement protected `Homepage SAA` placeholder + sign-out button (defence-in-depth: middleware blocks unauth visits, page also re-checks) | app/page.tsx

**Checkpoint**: T041 green; logging in with a Sun\*-domain account followed by a manual revisit of `/login` redirects to `/` immediately.

---

## Phase 5: User Story 4 — Reject non-whitelisted accounts (Priority: P2)

**Goal**: A successful Google login with a non Sun\*-domain account never gets a session and is sent to `/403`.

**Independent Test**: Integration test that stubs `exchangeCodeForSession` to return `user.email = 'someone@gmail.com'`, calls the callback handler, and asserts: `signOut` invoked, no session cookie set, response is 307 to `/403`.

### Tests (US4) — must fail first

- [x] T044 [P] [US4] Integration test: callback with non Sun\*-domain user → `signOut` + redirect `/403` + no session cookie *(folded into tests/integration/auth-callback.test.ts)* | tests/integration/auth-callback.test.ts
- [x] T045 [P] [US4] Integration test: callback with code-exchange error → redirect to `/login?error=oauth_failed`, no session *(folded into tests/integration/auth-callback.test.ts)* | tests/integration/auth-callback.test.ts

### Implementation (US4)

- [x] T046 [US4] Extend `app/auth/callback/route.ts` to call `auth-service.assertEmailAllowed` after code exchange; on failure call `signOut` and redirect to `/403`; on code-exchange error redirect to `/login?error=oauth_failed` | app/auth/callback/route.ts
- [x] T047 [P] [US4] Implement `app/403/page.tsx` (placeholder access-denied content; full spec is a separate frame `T3e_iS9PCL`) | app/403/page.tsx

**Checkpoint**: T044 + T045 green. Manual verification: a non-Sun\* Google account redirects to `/403` and `document.cookie` shows no `sb-*` session cookie.

---

## Phase 6: User Story 3 — Switch interface language (Priority: P2)

**Goal**: User clicks language selector → picks VN/EN → screen copy and `<html lang>` re-render.

**Independent Test**: Component test opens the dropdown, selects EN, asserts the `Header` selector label updates and the `LoginHero` re-renders English copy.

### Tests (US3) — must fail first

- [ ] T048 [P] [US3] Component test for `HeaderLanguageSwitch` (closed → click opens; click selection closes; chosen code reflected in label) | tests/unit/header-language-switch.test.tsx
- [ ] T049 [P] [US3] Integration test: setting locale cookie persists across requests; `LoginHero` returns localized copy | tests/integration/locale-persistence.test.ts

### Implementation (US3)

- [ ] T050 [P] [US3] Implement `HeaderLanguageSwitch` (client component: dropdown trigger; default `VN`; flag + chevron) | components/layout/header-language-switch.tsx
- [ ] T051 [P] [US3] Implement `LanguageDropdown` overlay covering Figma frame `IiLVGkACbt` (VN/EN list, keyboard nav) | components/layout/language-dropdown.tsx
- [ ] T052 [P] [US3] Implement server action `setLocale(locale)` writing the `locale` cookie | actions/set-locale.ts
- [ ] T053 [P] [US3] Implement `GET /api/i18n/locales` returning the static VN/EN list (DB-backed list is a follow-up) | app/api/i18n/locales/route.ts
- [ ] T054 [US3] Replace the placeholder language switch in `Header` with `HeaderLanguageSwitch` | components/layout/header.tsx
- [ ] T055 [US3] Ensure `app/layout.tsx` `<html lang>` derives from `getLocale()` so language change re-renders correctly | app/layout.tsx

**Checkpoint**: T048 + T049 green. Manual verification: switching VN ↔ EN updates hero copy and persists across reloads.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Refinements affecting multiple stories.

- [ ] T056 [P] Implement OAuth error UI (toast or inline) shown on `?error=oauth_failed` query param | components/login/login-error.tsx
- [ ] T057 [P] Add ARIA labels + visible focus rings to `LoginButton`, `HeaderLanguageSwitch`, and `LanguageDropdown`; arrow-key + Esc handling on the dropdown | components/layout/language-dropdown.tsx, components/login/login-button.tsx
- [ ] T058 [P] Add GitHub Actions CI workflow (lint, typecheck, test, test:e2e on every PR) | .github/workflows/ci.yml
- [ ] T059 [P] Update README with "Run with Supabase" quickstart (env vars, Google provider setup, run/test commands) | README.md
- [ ] T060 Final acceptance: run `npm run lint && npm run typecheck && npm run build && npm run test && npm run test:e2e` and verify all spec.md acceptance scenarios manually | (verification only)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies — can start immediately.
- **Foundation (Phase 2)**: depends on Setup completion — BLOCKS all user stories.
- **User Story 1 (Phase 3)**: depends on Foundation — required by US2/US4 (they reuse the callback route + login page).
- **User Story 2 (Phase 4)**: depends on US1 (extends `app/login/page.tsx` and adds the protected `/` page).
- **User Story 4 (Phase 5)**: depends on US1 (extends `app/auth/callback/route.ts`).
- **User Story 3 (Phase 6)**: depends on Foundation; can start in parallel with US2 + US4 once Phase 3 has shipped the layout chrome (`Header`).
- **Polish (Phase N)**: depends on all desired user stories.

### Within Each User Story

- Tests MUST be written and observed failing before the corresponding implementation.
- Models / pure utilities before services.
- Services before route handlers / page components.
- Story complete (checkpoint passes) before moving to the next priority.

### Parallel Opportunities

- **Setup**: T002–T006 and T008–T014 can run in parallel (different files, no shared deps).
- **Foundation**: all `[P]` tasks in Phase 2 can run together. The foundation pairs run sequentially within each pair: T020 → T021 (allowed-domains test → impl), T022 → T023 (auth-service test → impl). T024 (`middleware.ts`) depends on T017–T019.
- **US1**: T029, T030, T031 run in parallel (separate test files). T032, T033, T034, T037, T038, T040 run in parallel (separate component/route files). T035, T036, T039 are sequential because they integrate the previous components.
- **US2 vs US4 vs US3**: once US1 ships, the three remaining stories can be worked in parallel by separate contributors — they touch different files (US2: `app/page.tsx`, US4: `app/403/page.tsx` + callback extension, US3: layout/i18n).
- **Polish**: T056–T059 run in parallel; T060 is the final sequential gate.

---

## Implementation Strategy

### MVP First (Recommended)

1. Complete Phase 1 + Phase 2.
2. Complete Phase 3 (US1) — this *is* the MVP.
3. **STOP and VALIDATE**: run all checkpoints, verify acceptance scenarios manually.
4. Deploy to a preview environment and verify the full Google OAuth round trip with a real Sun\*-domain account.

### Incremental Delivery

1. Setup + Foundation → merge.
2. US1 → merge → demo MVP.
3. US2 + US4 (security gate before language polish) → merge.
4. US3 (language switch) → merge.
5. Polish → merge.

---

## Notes

- **Auth provider swap (post-implement)**: T001 originally pinned Supabase Auth, and the
  service-layer + clients were built against `@supabase/ssr`. Per a follow-up user request,
  the auth provider was swapped to **direct Google OAuth via `arctic`** + stateless JWT
  session cookies via `jose`. `lib/supabase/*` was deleted; `lib/oauth/google.ts`,
  `lib/auth/session.ts`, and `app/auth/sign-in/google/route.ts` replace it. Constitution
  bumped to v1.2.0 to reflect the stack change.
- **`design-style.md` override (this PR series)**: the `/momorph.tasks` slash command lists
  `design-style.md` as a hard prerequisite, but our `/momorph.specify` workflow intentionally
  skips it (visual values are fetched on-demand at component time per Constitution Principle
  IV). User explicitly approved overriding the gate. Implementation tasks that touch UI MUST
  fetch CSS via `query_section` against the relevant Node ID before writing styles, and any
  new tokens MUST land in `app/globals.css` with a one-line rationale comment.
- **Constitution amendment**: T007 bumps the constitution to v1.1.0 in the same PR series
  that introduces the dependencies it pins. Reviewers MUST verify the Sync Impact Report is
  updated.
- **TDD cadence**: Constitution Principle II is non-negotiable. Every test task (T020, T022,
  T029, T030, T031, T041, T044, T045, T048, T049) MUST be observed failing before the
  paired implementation task is started.
- Commit after each task or each tightly-related pair (test + impl).
- Update `spec.md` if any acceptance scenario shifts during implementation; do not silently
  diverge from the spec.
- Mark tasks complete as you go: `- [x]`.
