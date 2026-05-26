# Implementation Plan: Viết Kudo — Send Kudos Dialog

**Frame**: `ihQ26W78P2-Viet-Kudo` (root node `520:11602`)
**Date**: 2026-05-20
**Spec**: [`spec.md`](./spec.md)
**Screenflow**: [`../../contexts/SCREENFLOW.md`](../../contexts/SCREENFLOW.md) (row 6)
**Constitution**: [`../../constitution.md`](../../constitution.md) (v1.2.0)
**Reuses from**: Sun* Kudos Live Board (`../MaZUn5xHXZ-Sun-Kudos-Live-board/`), Login (`../GzbNeVGJHz-Login/`)

---

## Summary

Build the **Viết Kudo** send-Kudos composer that replaces the current
placeholder at `/viet-kudo`. The composer is a **modal dialog** rendered
inside the Sun* Kudos Live Board page (`/sun-kudos`) — opened by the A.1
pill or the cream-card avatar hover-card "Gửi Kudos" CTA. Direct-URL
visits to `/viet-kudo` render the same composer as a standalone page
(modal mode = false; primary CTA navigates back to `/sun-kudos` on
success). One component, two render modes.

Form fields (per spec):

- **Recipient** — autocomplete from `/api/kudos/sunners` (required, no
  free-form, self excluded).
- **Message** — Markdown rich-text editor with Bold/Italic/Strike/
  Numbered list/Link/Quote + `@mention` (required).
- **Hashtags** — 1–5 chips, free-form creation allowed (required ≥1).
- **Images** — 0–5 `.jpg`/`.png` (max 5 MB each).
- **Anonymous toggle** + optional alias text.

Submit → POST `/api/kudos` → mutate SWR cache family
(`/api/kudos/(feed|highlight|spotlight)` + `/api/users/me`) → modal
closes + new Kudos appears at the top of the live board.

The existing mock backend (`lib/kudos/{store,service,validators}.ts`)
already accepts the core fields; this plan extends it with
`isAnonymous`, `anonymousAlias`, and image upload — same single-process
in-memory pattern.

---

## Technical Context

| Item | Choice |
|---|---|
| **Route** | `/viet-kudo` (replaces existing placeholder). The composer also mounts as a modal inside `/sun-kudos` — same component, two parents. |
| **Auth** | Required. Anonymous → `/login?returnTo=%2Fviet-kudo`. |
| **Framework** | TypeScript 5 (strict) / Next.js 16 App Router / React 19 |
| **Styling** | Tailwind CSS v4 + CSS variables in `app/globals.css` |
| **Form state** | Local `useReducer` inside the composer (≥10 state fields + cross-field errors — `useReducer` keeps mutations colocated and reviewable). No external form library. |
| **Data fetching** | `swr` (already in deps) for `/api/kudos/sunners`, `/api/kudos/hashtags`. `mutate` invalidates feed family on submit success. |
| **Rich-text editor** | `@tiptap/react` + `@tiptap/starter-kit` + `@tiptap/extension-link` + `@tiptap/extension-mention` (new deps — see Violations) for Markdown-storable formatting + `@mention` autocomplete. |
| **Markdown render** | `react-markdown` + `remark-gfm` + `rehype-sanitize` (new deps) — used by the live board to render saved Kudos messages with formatting + safe HTML. |
| **Focus-trap** | `focus-trap-react` (new dep) — battle-tested, smaller than rolling our own. Trap activated only in modal mode. |
| **File preview** | `URL.createObjectURL` + thumbnail in client until submit. Submit uploads via multipart to `POST /api/kudos/uploads`; server returns CDN-equivalent URLs that go into the Kudos `images` array. |
| **Testing** | Vitest + Testing Library + jsdom for unit/integration; Playwright for E2E. |
| **i18n** | Extend `lib/i18n/dictionary.ts` with a `kudosDialog` namespace. |

---

## Constitution Compliance Check

*GATE: Must pass before tasks can be generated.*

| Requirement | Constitution Rule | Status |
|---|---|---|
| Spec exists & traces to Figma | I — Spec-Driven Development | ✅ Compliant — `spec.md` derived from `ihQ26W78P2` |
| Navigation sourced from SCREENFLOW.md | I — Spec-Driven Development | ✅ Compliant — row 6 added |
| Tests written before implementation | II — Test-First (NON-NEGOTIABLE) | 📋 Planned — every validator + reducer + route handler gets a failing test first |
| Layered architecture | III — Layered Architecture | 📋 Planned — `route → service → store` already in place; extend `service.sendKudos` + validators |
| Design tokens, no hex / px magic | IV — Design Tokens | 📋 Planned — extend `app/globals.css` if any new tokens; reuse existing `--color-saa-*` |
| TS strict, ESLint clean, conventions | V — Type Safety | ✅ Compliant — strict mode + kebab-case modules + PascalCase components |
| `npm run build`, `npm run lint`, `npm run test` pass | V — Quality gate | 📋 Planned at each phase checkpoint |
| Auth gating server-enforced | I + V + Security | 📋 Planned — server re-checks session + recipient existence on `POST /api/kudos` |

### Violations

| Violation | Justification | Alternative Rejected |
|---|---|---|
| **Plan written before `design-style.md`** | Same as prior screens. Visual specs are fetched on-demand at implementation per Principle IV. | Frozen `design-style.md` duplicates Figma + rots fast |
| **Plan written before `BACKEND_API_TESTCASES.md`** | No real backend exists yet (constitution `APP_DATA_PERSISTENCE` TODO). Mock route handlers + service tests serve as the contract. | Blocking on infra decisions |
| **New dep: `@tiptap/react` family (~50 kB gz)** | Rich-text + mention autocomplete + Markdown serialization is non-trivial. Tiptap is the canonical choice for React, smaller than Quill/Slate, headless (no opinion on UI), and has a first-party `@mention` extension. | Hand-roll a contentEditable rich-text editor: hundreds of LOC + flaky cross-browser. Slate: more flexible but larger learning curve + bundle. Quill: not React-native, requires wrapper hacks. |
| **New dep: `react-markdown` + `remark-gfm` + `rehype-sanitize` (~30 kB gz)** | Feed cards already render Kudos messages as plain text; this dialog adds formatting → feed must render it. Markdown → React tree with sanitization is the safe path (no `dangerouslySetInnerHTML` with raw HTML). | Render raw HTML with custom sanitizer: tedious + risky XSS surface |
| **New dep: `focus-trap-react` (~5 kB gz)** | Modal a11y requires focus trap; rolling our own is a known footgun (Tab/Shift+Tab cycle, Esc bubbling, return-focus on close). | Hand-roll: known correctness pitfalls |
| **Extend mock store + service** with `isAnonymous`, `anonymousAlias`, `images` (URL list) | Existing `Kudos` type already has `images`; need to add anonymity fields. Mock layered same as before. | Block dialog until real backend lands |

> **No deviations from i18n flow, no new auth library, no new styling system, no new test framework.** Stack pin in constitution §"Technology Stack & Constraints" remains in force.

---

## Architecture Decisions

### Resolutions for spec's flagged "NEEDS CONFIRMATION" items

| # | Question | **Decision** | Rationale |
|---|---|---|---|
| 1 | Recipient = self | **Reject both client-side + server-side**. Filter sender from autocomplete dropdown; server returns 400 if `recipientId === senderId`. | Defence-in-depth |
| 2 | Markdown vs HTML | **Markdown**. Stored as Markdown text in `Kudos.message`. Rendered via `react-markdown` + `rehype-sanitize` on the feed side. | Simpler storage, safer rendering, smaller payloads |
| 3 | File size limit | **5 MB per image** | Matches typical image-upload conventions; fits in mock data-URL constraints |
| 4 | Hashtag free-form | **Allowed in v1**. Strips leading `#`, lowercases for dedupe, displays cased original. Admin moderation deferred to a separate spec. | Lowers friction; admin tools land later |
| 5 | Anonymous alias storage | Server stores both `senderId` (audit) and `anonymousAlias` (display). Feed card renders alias for `isAnonymous=true`; profile link disabled. | Compliance + audit balance |
| 6 | Backdrop click closes | **Yes — default behavior**. Esc also closes. Both trigger Hủy semantics (data discarded, no confirm). | Standard modal UX |
| 7 | Submit destination from `/viet-kudo` | **Navigate to `/sun-kudos`** on success (modal-mode redirect path = parent; standalone-mode redirect = `/sun-kudos`). Toast "Kudos đã được gửi!" shown briefly. | Predictable single destination |
| 8 | Mention render | `@displayName` becomes `<a href="/sunner/{id}">@{displayName}</a>` in rendered HTML; clickable in feed. | Reuses existing profile placeholder route |
| 9 | Image upload timing | **Upload on submit, NOT on file-pick.** Client holds File objects + `URL.createObjectURL` previews; submit triggers multipart POST. Aborts on Hủy = no orphan uploads. | Cleaner cancellation; better UX |
| 10 | Modal width | **720 px desktop max-width**, full-screen <768 px (mobile). | Reads well + matches existing modal patterns in the campaign |

### Frontend approach

#### Page composition

```
app/viet-kudo/page.tsx          (Server Component — auth gate + initial recipient from ?recipient)
└── <VietKudoPage>              (Server Component composition — AppHeader chrome + standalone composer)
    └── <KudosComposer>         client — same component used as a modal in /sun-kudos
        ├── <ComposerTitle>     "Gửi lời cám ơn và ghi nhận đến đồng đội"
        ├── <RecipientPicker>   autocomplete + dropdown (US2)
        ├── <HashtagPicker>     dropdown + chip list (US4)
        ├── <ContentEditor>     Tiptap editor + format toolbar + mention (US5)
        ├── <ImageUploader>     +Image button + thumbnails (US6)
        ├── <AnonymousToggle>   checkbox + alias field (US7)
        └── <ComposerFooter>    Hủy + Gửi (US1 + US8)
```

When mounted inside `/sun-kudos` (via the existing A.1 pill), the page
wraps `<KudosComposer>` in a `<KudosComposerModal>` shell that adds:
backdrop, focus-trap, Esc handler, and the `role="dialog"` semantics.
Mode is controlled by a prop `mode: "modal" | "standalone"`.

#### Form state (useReducer)

```ts
type ComposerState = {
  recipient: { id: string; displayName: string } | null;
  recipientQuery: string;
  contentMarkdown: string;
  hashtags: string[];
  images: UploadedImage[];
  isAnonymous: boolean;
  anonymousAlias: string;
  submitting: boolean;
  errors: Record<keyof ComposerDraft, string | null>;
};

type ComposerAction =
  | { type: 'set-recipient'; recipient: Sunner | null }
  | { type: 'set-recipient-query'; query: string }
  | { type: 'set-content'; markdown: string }
  | { type: 'add-hashtag'; tag: string }
  | { type: 'remove-hashtag'; tag: string }
  | { type: 'add-images'; files: File[] }
  | { type: 'remove-image'; id: string }
  | { type: 'toggle-anonymous' }
  | { type: 'set-alias'; alias: string }
  | { type: 'start-submit' }
  | { type: 'submit-error'; errors: ComposerState['errors'] }
  | { type: 'reset' };
```

The reducer enforces cap rules (≤5 images, ≤5 hashtags, dedupe) inline
so the UI can stay declarative.

#### Mention / autocomplete

Both `<RecipientPicker>` and `<ContentEditor>`'s mention extension call
the same lookup utility `lookupSunners(query, { excludeSenderId })`.
The util uses SWR to fetch `/api/kudos/sunners` once and filters
client-side (the directory is ≤200 entries — overkill to paginate).

#### Submit flow

1. Reducer dispatches `start-submit`; button shows loading state.
2. Upload images via `POST /api/kudos/uploads` (multipart) → returns
   `{ urls: string[] }`.
3. POST `/api/kudos` with `{ recipientId, message, hashtags, images:
   urls, isAnonymous, anonymousAlias }`.
4. On 200: `swr.mutate` invalidates kudos family + `/api/users/me`.
   Navigate to `/sun-kudos` (standalone) or close modal (modal mode).
   Show toast "Kudos đã được gửi!".
5. On 4xx: dispatch `submit-error` with per-field errors; surface
   inline + toast.
6. On 5xx: toast "Không thể gửi Kudos. Vui lòng thử lại."; form data
   preserved.

### Backend approach (mock layer)

```
app/api/kudos/route.ts                  ← extend to accept isAnonymous + anonymousAlias
app/api/kudos/uploads/route.ts          ← NEW: accepts multipart, echoes data-URLs (mock)
lib/kudos/validators.ts                 ← extend validateSendKudosBody with new fields
lib/kudos/service.ts                    ← extend sendKudos signature
lib/kudos/store.ts                      ← extend Kudos shape with isAnonymous, anonymousAlias
lib/kudos/types.ts                      ← extend Kudos type
```

Per Principle III, the route handler stays thin; all business rules
live in `lib/kudos/service.ts`.

### Integration points

- **Existing services**: `getCurrentUser`, `getViewerId`, `getLocale`,
  `getHomepageDictionary` (for chrome strings) — same as Sun* Kudos.
- **Shared components**: `<AppHeader>`, `<AppFooter>`, `<ToastHost>`,
  `<KudosImageLightbox>` (for preview enlargement).
- **Shared hooks**: `use-clipboard-copy` (if a "Copy Kudos URL" feature
  is added later), but not needed for v1.
- **Existing assets**: `pen.svg`, `send.svg`, `search.svg` (already
  downloaded for Sun* Kudos).

---

## Project Structure

### Documentation (this feature)

```text
.momorph/specs/ihQ26W78P2-Viet-Kudo/
├── spec.md              # Done
├── plan.md              # This file
├── tasks.md             # Next (momorph.tasks)
└── (no design-style.md, no research.md — see Violations)
```

### Source code

```text
app/
├── api/kudos/
│   ├── route.ts                          MODIFY — extend POST body schema
│   └── uploads/route.ts                  NEW — POST multipart image upload
└── viet-kudo/
    └── page.tsx                          REWRITE — replaces placeholder

components/kudos/                         EXTEND
├── kudos-composer.tsx                    NEW — main composer (modal + standalone)
├── kudos-composer-modal.tsx              NEW — modal shell (backdrop + focus-trap + Esc)
├── kudos-composer-title.tsx              NEW — heading section
├── kudos-recipient-picker.tsx            NEW — autocomplete dropdown
├── kudos-hashtag-picker.tsx              NEW — chips + add dropdown
├── kudos-content-editor.tsx              NEW — Tiptap wrapper + toolbar
├── kudos-image-uploader.tsx              NEW — +Image button + thumbnail grid
├── kudos-anonymous-toggle.tsx            NEW — checkbox + alias text-field
└── kudos-composer-footer.tsx             NEW — Hủy + Gửi buttons

components/feedback/
└── toast-host.tsx                        REUSE

hooks/                                    EXTEND
├── use-kudos-composer.ts                 NEW — useReducer + submit + invalidation
└── use-sunner-lookup.ts                  NEW — SWR-backed autocomplete util

lib/kudos/                                EXTEND
├── types.ts                              EXTEND — add `isAnonymous`, `anonymousAlias` to `Kudos`
├── store.ts                              EXTEND — `insertKudos` accepts new fields
├── service.ts                            EXTEND — `sendKudos` signature + image-URL passthrough + self-recipient reject
├── validators.ts                         EXTEND — validateSendKudosBody with anonymity + file URLs
└── markdown.ts                           NEW — Markdown → sanitised HTML renderer (used by feed cards too)

lib/i18n/dictionary.ts                    EXTEND — `kudosDialog` namespace

components/kudos/kudos-cream-card.tsx     MODIFY — render Markdown via `<KudosMessage>` helper
components/kudos/kudos-message.tsx        NEW — `react-markdown` + sanitiser; handles `@mention` → profile link

tests/
├── unit/
│   ├── kudos/
│   │   ├── composer-reducer.test.ts      NEW — all reducer actions + invariants
│   │   ├── validators.test.ts            EXTEND — new fields
│   │   ├── service-send.test.ts          EXTEND — anonymity + self-recipient
│   │   └── markdown.test.ts              NEW — sanitisation + mention rendering
│   └── use-sunner-lookup.test.ts         NEW — exclude-sender + accent-insensitive search
├── integration/
│   ├── kudos-send-route.test.ts          EXTEND — new payload + anonymity
│   ├── kudos-uploads-route.test.ts       NEW — POST /api/kudos/uploads
│   └── viet-kudo-page-auth.test.ts       NEW — anonymous → /login redirect
└── e2e/
    ├── viet-kudo-submit.spec.ts          NEW — US1 happy path
    ├── viet-kudo-validation.spec.ts      NEW — US3 required + max-5 + MIME
    └── viet-kudo-modal.spec.ts           NEW — open from A.1 pill, Esc closes, backdrop closes
```

### Dependencies

| Package | Version | Purpose | Justified |
|---|---|---|---|
| `@tiptap/react` | ^2.x | Rich-text editor base | ✅ |
| `@tiptap/starter-kit` | ^2.x | Bold/Italic/Strike/List/Quote extensions | ✅ |
| `@tiptap/extension-link` | ^2.x | Link insertion | ✅ |
| `@tiptap/extension-mention` | ^2.x | `@` mention autocomplete | ✅ |
| `react-markdown` | ^9.x | Render saved Markdown into the feed | ✅ |
| `remark-gfm` | ^4.x | GFM Markdown (strike, autolink) | ✅ |
| `rehype-sanitize` | ^6.x | HTML sanitisation post-render | ✅ |
| `focus-trap-react` | ^11.x | Modal focus trap | ✅ |

All justifications recorded in the Violations table above.

---

## Implementation Strategy

### Phase 0 — Asset preparation

- All Figma media needed (`pen`, `send`, `search`, sample avatars) was
  downloaded for Sun* Kudos. No new asset fetches required.
- Run `mcp__momorph__list_media_nodes` on `ihQ26W78P2` to confirm no new
  assets surface (e.g. format-toolbar icons). Download any missing
  icons into `public/assets/sun-kudos/icons/` (shared bucket).

### Phase 1 — Setup & Foundation

1. Install 8 deps (Tiptap × 4, react-markdown × 1, remark-gfm × 1,
   rehype-sanitize × 1, focus-trap-react × 1). Use `--legacy-peer-deps`
   to match the React 19 stack.
2. Extend `lib/kudos/types.ts` with `isAnonymous`, `anonymousAlias` on
   `Kudos` + a new `ComposerDraft` type for the form payload.
3. Extend `lib/kudos/store.ts.insertKudos` + seed records to carry the
   new fields (existing records default to `isAnonymous: false`).
4. Extend `lib/kudos/validators.ts.validateSendKudosBody` with the new
   schema (alias 1–60 chars when isAnonymous).
5. Extend `lib/kudos/service.ts.sendKudos` to:
   - Reject self-recipient (HTTP 400, error code `RECIPIENT_IS_SELF`)
   - Persist `isAnonymous` + `anonymousAlias`
   - Hash-strip leading `#` from hashtags + dedupe (case-insensitive)
6. Add `app/api/kudos/uploads/route.ts` — accepts multipart, echoes
   data-URLs back (mock); enforces MIME + size + count.
7. Add `kudosDialog` namespace to `lib/i18n/dictionary.ts` (vi + en).
8. Create `lib/kudos/markdown.ts` + `components/kudos/kudos-message.tsx`
   for rendering Markdown in the feed. Update `kudos-cream-card.tsx` to
   use it.

### Phase 2 — User Stories 1 + 3 + 8 (P1): Submit happy path + validation + cancel

1. Implement `<KudosComposer>` shell with the 7 child components as
   stubs (no logic yet — just layout).
2. Implement `<RecipientPicker>` (US2 partial — fields only, dropdown
   in Phase 3) + `<HashtagPicker>` (US4 partial) + `<ContentEditor>`
   (US5 stub: plain textarea for now) + `<AnonymousToggle>` + Footer.
3. Wire `use-kudos-composer` reducer + submit flow. Submit calls the
   real `POST /api/kudos` end-to-end.
4. Implement `<KudosComposerModal>` shell. Open via state in
   `/sun-kudos` page (replace the existing `<Link>` on A.1 pill with a
   button that toggles modal state).
5. Auth gate: replace the placeholder `/viet-kudo` page with a
   `getCurrentUser()` redirect + `<VietKudoPage>` composition that
   renders the standalone composer.
6. Wire submit → `swr.mutate` cache invalidation.

### Phase 3 — User Story 2 (P1): Recipient autocomplete

1. Implement `use-sunner-lookup` hook (SWR `/api/kudos/sunners` +
   accent-insensitive + case-insensitive + excludeSenderId filter).
2. Wire autocomplete dropdown into `<RecipientPicker>`.
3. Consume `?recipient={id}` from URL (Server Component reads
   `searchParams`, threads through props to client).

### Phase 4 — User Story 4 (P1): Hashtag chips

1. Wire `<HashtagPicker>` dropdown + free-form input + 1–5 cap + dedupe.
2. Implement chip remove (x) button.
3. Show `+ Hashtag` button hide/show based on count.

### Phase 5 — User Story 5 (P2): Rich-text editor

1. Replace plain textarea in `<ContentEditor>` with Tiptap instance +
   StarterKit + Link + Mention extensions.
2. Build the format toolbar (Bold/Italic/Strike/NumberList/Link/Quote)
   that calls `editor.chain().focus().toggle*().run()`.
3. Wire mention extension with `lookupSunners` (the same as recipient
   autocomplete) and serialise to `@id|displayName` token in Markdown.
4. Markdown render helper handles `@id|displayName` → `<a
   href="/sunner/{id}">@{displayName}</a>` (via `react-markdown` custom
   component renderer).

### Phase 6 — User Story 6 (P2): Image upload

1. Implement `<ImageUploader>` with `+ Image` button + 5-slot
   thumbnail grid. `URL.createObjectURL` for preview.
2. Reject non-`image/jpeg|image/png` MIME (client check + server
   magic-byte check on `POST /api/kudos/uploads`).
3. Enforce 5 MB cap (client `file.size` check).
4. Hide/show `+ Image` button based on count.
5. Wire submit to upload first, then post Kudos with returned URLs.

### Phase 7 — User Story 7 (P2): Anonymous send

1. Wire `<AnonymousToggle>` checkbox → reveals/hides alias field.
2. Reset alias on uncheck.
3. Pass `isAnonymous` + `anonymousAlias` in submit payload.
4. Update `<KudosCreamCard>` to render alias when
   `kudos.isAnonymous === true` and disable the avatar link.

### Phase 8 — Polish

1. Accessibility audit:
   - `role="dialog" aria-modal="true"` on modal
   - `aria-labelledby` → composer title id
   - `aria-disabled` on Submit when invalid
   - Focus-trap + return-focus on close
   - Live error region (`aria-live="polite"`)
2. `prefers-reduced-motion` — snap modal in/out.
3. Loading skeletons for autocomplete + hashtag dropdowns.
4. Error boundary around `<KudosComposer>`.
5. Verify all gates green: `npm run lint && npm run typecheck && npm
   run test && npm run build`.

### Risk Assessment

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Tiptap bundle size pushes `/sun-kudos` over 200kB budget | Medium | Low | Code-split: dynamic `import('./kudos-composer')` so the editor only loads when opened |
| Markdown render breaks existing feed cards (currently plain text) | Medium | Medium | Phase 1 task installs the renderer + tests cards still render plain strings unchanged |
| `@mention` token format conflicts with literal `@` in Vietnamese names | Low | Medium | Use `@[displayName](id)` canonical Markdown link form internally; renderer treats it as a mention |
| `URL.createObjectURL` previews leak memory if user uploads many images | Medium | Low | Revoke URLs in cleanup effect on image-remove + unmount |
| Mock multipart upload differs from real backend interface | High | Low | v1 mock echoes data-URLs; document the contract in `lib/kudos/uploads.types.ts` so the swap is mechanical |
| Anonymous alias collisions reveal sender via leaderboard counts | Low | Medium | Alias is display-only; sender stats stay private to admin; leaderboards aggregate non-anonymous Kudos only (confirm with PM) |
| User uploads orphan files on cancel | Low | Low | Upload-on-submit (not on-pick) keeps cancel clean |

### Estimated Complexity

- **Frontend**: High — rich-text editor + autocomplete + chip manager
  + file upload + modal vs standalone composer = many discrete
  surfaces.
- **Backend (mock)**: Medium — extend existing routes with anonymity +
  add upload endpoint.
- **Testing**: High — TDD pass covers reducer invariants, validator
  edge cases, MIME + size enforcement, autocomplete filtering,
  mention serialisation round-trip.

---

## Integration Testing Strategy

### Test Scope

- [x] **Component / module interactions**: `<KudosComposer>` ↔
  `use-kudos-composer` ↔ `POST /api/kudos`. `<ContentEditor>` mention ↔
  `use-sunner-lookup`. `<ImageUploader>` ↔ `POST /api/kudos/uploads`.
- [x] **External dependencies**: Tiptap (use real instance in jsdom;
  smoke test toolbar). react-markdown (snapshot test the rendered
  tree).
- [x] **Data layer**: `lib/kudos/store.ts` ↔ `service.ts` ↔ route
  handlers — extended for anonymity + image URLs.
- [x] **User workflows**: Open modal → autocomplete → format text →
  add hashtag → upload image → submit → feed prepends.

### Test Categories

| Category | Applicable? | Key Scenarios |
|---|---|---|
| UI ↔ Logic | Yes | Reducer dispatch round-trip; mention selection inserts canonical token; chip remove updates count |
| Service ↔ Service | No | Single-process mock |
| App ↔ External API | No | None until real backend |
| App ↔ Data Layer | Yes | New `Kudos` fields persist; self-recipient rejected |
| Cross-platform | Partial | Desktop modal + standalone primary; mobile full-screen smoke test |

### Test Environment

- **Environment**: Local Vitest (unit/integration with jsdom) +
  Playwright headless against `next dev` for E2E.
- **Test data**: existing seed in `lib/kudos/seed-data.ts` (unchanged);
  store reset between tests via `resetStore()`.

### Mocking Strategy

| Dependency | Strategy | Rationale |
|---|---|---|
| Tiptap | Real (jsdom-compat) | Editor manipulation is the point; mock would test nothing |
| `URL.createObjectURL` | Polyfilled in `tests/setup.ts` | jsdom lacks it; trivial polyfill returns a unique string |
| `navigator.clipboard` | Stub | jsdom lacks Clipboard API (already in test setup) |
| `next/navigation` | `vi.mock` | Pattern shared with prior screens |
| File upload | jsdom `File` constructor | Built-in; magic-byte check tested via Buffer assertions in route handler test |

### Test Scenarios Outline

1. **Happy Path**
   - [ ] Submit minimum valid Kudos (recipient + content + 1 hashtag); feed prepends.
   - [ ] Submit with all fields + 5 hashtags + 3 images + anonymous + alias.
2. **Error Handling**
   - [ ] Server 400 on self-recipient → inline error.
   - [ ] Server 5xx on POST → toast + form preserved.
   - [ ] Upload fails (server returns 400 for `.pdf`) → toast + image removed from preview.
3. **Edge Cases**
   - [ ] Hashtag duplicate (case-insensitive) → reject.
   - [ ] Image count exactly 5 → `+ Image` hides; remove 1 → re-shows.
   - [ ] Hashtag count exactly 5 → `+ Hashtag` disabled; remove 1 → re-enables.
   - [ ] Anonymous unchecked discards previous alias on next submit.
   - [ ] `?recipient={id}` prefills; invalid id ignored.
   - [ ] Esc + backdrop + Hủy all close + reset (modal mode).

### Tooling & Framework

- **Test framework**: Vitest (unit + integration), Playwright (E2E).
- **Supporting tools**: Testing Library, jsdom, `whatwg-fetch`
  polyfill, `File`/`FormData` polyfills (already in test setup or
  trivial to add).
- **CI integration**: existing pipeline — `npm run lint && npm run
  typecheck && npm run test && npm run build`.

### Coverage Goals

| Area | Target | Priority |
|---|---|---|
| Reducer transitions | 100% | High |
| Validator coverage (recipient, alias, hashtags, image MIME/size) | 100% | High |
| Auth gating (anonymous redirect) | 100% | High |
| Markdown sanitization (XSS vectors) | 100% | High |
| Mention serialisation round-trip | 90%+ | High |
| Image upload happy + edge | 80%+ | Medium |
| Tiptap toolbar smoke | 60%+ | Medium |

---

## Dependencies & Prerequisites

### Required before start

- [x] `constitution.md` v1.2.0
- [x] `spec.md` (this PR)
- [x] Sun* Kudos Live Board spec & implementation (cache key contracts
  already defined in `lib/kudos/cache-keys.ts`)
- [ ] `research.md` — N/A (patterns established by Sun* Kudos; no
  novel architecture)
- [ ] API contracts — defined inline in `lib/kudos/service.ts`;
  formalised in `BACKEND_API_TESTCASES.md` when persistence lands
- [ ] Database migrations — N/A in v1 (in-memory mock)

### External dependencies

- **`/sun-kudos` page** — must mount the composer modal via state on
  the A.1 pill click (replaces the `<Link href="/viet-kudo">` current
  behaviour).
- **`/sunner/[userId]` profile** — referenced by mention render; route
  is already a placeholder.

### Internal blockers

- None. All required infrastructure (auth gate, dictionary, mock
  backend, shared chrome) exists.

---

## Open Questions

- [ ] Admin moderation of free-form hashtags — separate spec or
  inline-via-`/api/kudos/hashtags` allowlist?
- [ ] Toast position when modal is open (above modal? attached to
  modal? page-level?). Recommend page-level via existing `<ToastHost>`
  at the page root.
- [ ] Aria-live region copy for validation errors — single combined
  message or per-field?
- [ ] How does the existing Send-Kudos pill button on the cream-card
  hover-card pass the `recipient` query — already implemented as
  `<Link href="/viet-kudo?recipient={id}">`; confirm semantics.

---

## Next Steps

After plan approval:

1. **Run** `/momorph.tasks` to generate the task breakdown from this plan.
2. **Review** tasks.md for `[P]` parallelization tags.
3. **Begin** implementation following Phase 0 → Phase 8 order.

---

## Notes

### Why one component, two modes

The composer renders identically in both the modal (in-page on
`/sun-kudos`) and the standalone (`/viet-kudo`). One props-controlled
component avoids drift. The `mode` prop only changes:

- whether the composer is wrapped in a `<KudosComposerModal>` shell
  with backdrop/focus-trap;
- the submit success destination (close modal vs router.push).

### Why Tiptap over Slate / Quill

- **Slate**: lower-level. We'd hand-roll Bold/Italic/etc + mention.
  Tiptap ships those as extensions.
- **Quill**: not React-native; needs wrapper hacks; Markdown export
  isn't first-class.
- **Tiptap**: headless (no UI lock-in), strong React story, first-
  party `@mention` extension, Markdown via `tiptap-markdown` if we
  want canonical Markdown output (alternative: convert ProseMirror
  state to Markdown ad-hoc, simpler for our limited grammar).

### Why upload on submit, not on pick

Uploading on pick orphans files when the user clicks Hủy. Uploading on
submit guarantees that every persisted image belongs to a real Kudos.
Trade-off: submit takes longer when many images selected; acceptable
because the user is intentionally finishing the action.

### What's out of scope

Reiterated from spec: draft persistence, schedule send, multi-
recipient, reply/thread, edit-after-send, presets, admin hashtag
moderation UI, notifications to recipient.
