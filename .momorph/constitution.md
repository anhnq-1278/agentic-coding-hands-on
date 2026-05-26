<!--
SYNC IMPACT REPORT
==================
Version change: 1.1.0 → 1.2.0
Bump rationale: MINOR — material change to the pinned tech stack. The auth
                provider is replaced with direct Google OAuth via `arctic` +
                stateless JWT sessions via `jose`; the previous Supabase Auth
                pin is removed. No principles are added, removed, or
                redefined; governance rules are unchanged. Test frameworks
                pin (Vitest + Playwright) carries over from 1.1.0.

Modified principles: none.
Added sections / expansions:
  - "Technology Stack & Constraints" — auth provider entry rewritten to
    pin `arctic` + `jose` and the server-side OAuth flow with a JWT
    session cookie. Removed the prior managed Supabase Postgres pin —
    application persistence is now an open TODO again.
Removed sections: none.

Templates requiring updates:
  - .momorph/templates/plan-template.md      ✅ aligned
  - .momorph/templates/spec-template.md      ✅ aligned
  - .momorph/templates/tasks-template.md     ✅ aligned
  - README.md                                ⚠ pending (auth quickstart needs refresh)
  - AGENTS.md                                ✅ aligned

Follow-up TODOs (deferred placeholders):
  - TODO(PROJECT_NAME): replace "MockProject" with the real product name once chosen.
  - TODO(APP_DATA_PERSISTENCE): no application database is configured. When
      persistence is required, choose a host (managed Postgres / SQLite /
      etc.) and an ORM following `.momorph/guidelines/db_guidelines/`.
-->

# MockProject Constitution
<!-- TODO(PROJECT_NAME): rename once the real product name is chosen. -->

## Core Principles

### I. Spec-Driven Development (NON-NEGOTIABLE)

Every feature MUST originate from a written specification before any production code is
written. The required artifact chain is `spec.md` → `plan.md` → `tasks.md` → implementation,
generated and tracked under `.momorph/specs/[FRAME_ID]-[FRAME_NAME]/`. UI navigation and URLs
MUST be sourced from `SCREENFLOW.md` and `group_specs/*_group.md` — guessing or hard-coding
destinations is forbidden. Code that cannot be traced back to an approved spec MUST be
rejected in review.

**Rationale**: This project uses MoMorph to derive specs, tests, and code from Figma
designs. Skipping the spec step breaks that traceability and produces drift between design,
tests, and implementation.

### II. Test-First Development (NON-NEGOTIABLE)

All new behavior MUST follow Red-Green-Refactor TDD: write a failing test, get user/reviewer
approval on the test intent, then implement until the test passes. Integration tests MUST
exist for: new public contracts (API routes, exported services), contract changes, and any
flow crossing module boundaries (UI ↔ logic, service ↔ service, app ↔ external API, app ↔
data layer). Tests MUST run in CI on every PR; a red build blocks merge.

**Rationale**: TDD is mandated by the project workflow guide and prevents regressions in
spec-driven, multi-agent codegen where implementations are frequently regenerated.

### III. Layered Architecture & Thin Boundaries

Server code MUST follow the dependency direction `route handler → controller → service →
repository/utility`. Route handlers MUST stay thin: they map HTTP I/O, perform auth/validation
via composable middleware, and delegate to services. Business logic MUST live in services and
be testable without framework types. DTOs describe shape and serialization only — no business
logic, and sensitive fields (passwords, tokens, secrets) MUST be excluded from response DTOs.
Circular imports and broad barrel files that produce cycles are forbidden.

**Rationale**: Encoded in `.momorph/guidelines/backend.md`. A clear, acyclic dependency
direction keeps services unit-testable and makes route handlers replaceable when the
framework or transport changes.

### IV. Design Tokens Over Hard-Coded Values

All visual values (colors, spacing, radii, typography) MUST be expressed via Tailwind
utilities backed by CSS variables, or via the CSS variables directly when no utility exists.
Components MUST NOT contain raw hex codes, pixel values, or other inline magic numbers for
themable properties. New tokens MUST be added to the global CSS and noted in the relevant
`group_specs/*_group.md` with a one-line rationale.

**Rationale**: Encoded in `.momorph/guidelines/frontend.md`. Centralized tokens make
theming, dark mode, and rebrands tractable and prevent silent design drift across screens.

### V. Type Safety & Convention Conformance

TypeScript MUST run in `strict` mode (no `any` escape hatches without an explicit, commented
justification). ESLint MUST pass with zero warnings on `main`. File and identifier conventions:
kebab-case for non-component module filenames, PascalCase for React components and classes,
camelCase for variables and functions. Formatting: 2-space indentation, single quotes,
~100-character line width. `npm run build` and `npm run lint` MUST succeed before any PR is
merged.

**Rationale**: The repo ships TS strict + ESLint Next configs already; codifying them as a
gate prevents convention erosion as agents and contributors regenerate code.

## Technology Stack & Constraints

The following stack is fixed for this project; deviations MUST go through the amendment
process in Governance:

- **Framework**: Next.js 16 (App Router) with React 19.
- **Language**: TypeScript 5 with `strict: true`. Path alias `@/*` maps to repo root.
- **Styling**: Tailwind CSS v4 with `@tailwindcss/postcss`. Tokens defined as CSS variables
  in the global stylesheet.
- **Linting**: ESLint 9 using `eslint-config-next` (core-web-vitals + typescript presets).
- **Authentication**: **Direct Google OAuth** via `arctic` (state + PKCE) with
  stateless **JWT session cookies** signed with `jose`. The OAuth round trip is
  fully server-side: `GET /auth/sign-in/google` initiates, `GET /auth/callback`
  validates state/PKCE, exchanges the code, decodes the ID token, enforces the
  Sun\* domain whitelist, and issues an HttpOnly `saa-session` cookie. The
  whitelist MUST be enforced server-side; never trust client-side claims.
- **Persistence**: TODO(APP_DATA_PERSISTENCE) — no application database is
  configured. When persistence is required, choose a host and an ORM
  following `.momorph/guidelines/db_guidelines/` (MikroORM, Mongoose, or
  Prisma) and update this section.
- **Testing**: **Vitest** + `@testing-library/react` + `jsdom` for unit and integration
  tests; **Playwright** (`@playwright/test`) for E2E. Test files live under `tests/` with
  the layout `unit/`, `integration/`, `e2e/`. CI MUST run `npm run lint`,
  `npm run typecheck`, `npm run test`, and `npm run test:e2e`.
- **Asset placement**: under `public/assets/{group_name}/{icons|images|logos}/` using
  kebab-case filenames.

Out-of-stack additions (alternative frameworks, runtime, CSS systems) require a
constitution amendment with a written justification and a migration plan.

## Development Workflow & Quality Gates

Every feature MUST proceed through the following gates in order. Each gate is a hard stop:

1. **Specify** — Run `momorph.specs` / `momorph.specify` to produce `spec.md` from a Figma
   frame. Spec MUST list user stories with priorities, acceptance scenarios, and edge cases.
2. **Plan** — Run `momorph.plan`. The plan's "Constitution Compliance Check" MUST pass before
   tasks are generated; any violation MUST be documented in the Violations table with
   justification and rejected alternatives.
3. **Tasks** — Run `momorph.tasks`. Tasks MUST be ordered: Setup → Foundation → User Stories
   (P1 → P2 → P3) → Polish. Tests for a story MUST appear before the implementation tasks
   for that story.
4. **Implement** — Run `momorph.implement`. TDD order: failing test → implementation →
   refactor. Commit per task or logical group.
5. **Test & Review** — `npm run lint` and `npm run build` MUST pass. For E2E changes,
   `momorph.reviewe2e` MUST be run against the diff.
6. **Commit** — Use `momorph.commit` for conventional, descriptive messages.

PR review responsibilities: reviewers MUST verify that (a) every changed file traces to a
task in the active `tasks.md`, (b) the five Core Principles are upheld, and (c) any new
public contract has matching integration tests. Complexity beyond the spec MUST be removed
or justified in the PR description.

## Governance

This constitution supersedes all ad-hoc practices, individual preferences, and inherited
conventions. When this document and any other guideline conflict, this document wins; the
conflicting guideline MUST be updated to align in the same PR.

**Amendment procedure**:

1. Open a PR that edits `.momorph/constitution.md` and updates the Sync Impact Report comment
   at the top of the file with the version bump rationale and propagation checklist.
2. Update every dependent template flagged in the Sync Impact Report in the same PR.
3. The PR MUST be approved by at least one maintainer, and CI (lint + build + tests) MUST
   pass before merge.

**Versioning policy** (semantic versioning applied to governance, not code):

- **MAJOR**: Backward-incompatible removal or redefinition of a principle, or removal of a
  governance rule.
- **MINOR**: New principle or section added, or material expansion of existing guidance.
- **PATCH**: Clarifications, wording, typo fixes, or non-semantic refinements.

**Compliance review**: Maintainers MUST audit a sample of merged PRs each quarter against the
five Core Principles. Persistent violations trigger a constitution amendment to either tighten
enforcement or relax a rule that has proven impractical.

**Runtime guidance**: For day-to-day implementation rules referenced by these principles,
consult `.momorph/guidelines/backend.md`, `.momorph/guidelines/frontend.md`,
`.momorph/guidelines/db_guidelines/`, and `.momorph/guidelines/e2e/`.

**Version**: 1.2.0 | **Ratified**: 2026-05-06 | **Last Amended**: 2026-05-06
