# Tasks: Viết Kudo — Send Kudos Dialog

**Frame**: `ihQ26W78P2-Viet-Kudo` (root node `520:11602`)
**Spec**: [`spec.md`](./spec.md)
**Plan**: [`plan.md`](./plan.md)
**Prerequisites**: spec.md ✅, plan.md ✅, design-style.md ❌ (intentionally absent — see plan §Violations; CSS values fetched on-demand from Figma during implementation)

---

## Task Format

```text
- [ ] T### [P?] [Story?] Description | file/path.ts
```

- **[P]**: Can run in parallel (different files, no incomplete dependencies)
- **[Story]**: User story tag (US1–US8) — required only inside user-story phases
- **|**: File path the task creates or modifies

Test-first ordering is mandatory per **Constitution Principle II**. Inside every
user-story phase, the failing test task MUST be observed red before the paired
implementation task is started.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Dependencies, dictionary, type extensions — everything user-story phases depend on.

- [ ] T001 Install runtime deps with `--legacy-peer-deps` (React 19 peer conflict): `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-mention`, `react-markdown@^9`, `remark-gfm@^4`, `rehype-sanitize@^6`, `focus-trap-react@^11` | package.json + package-lock.json
- [ ] T002 [P] Fetch any missing Figma media via `mcp__momorph__list_media_nodes` on screen `ihQ26W78P2`; download into `public/assets/sun-kudos/icons/` (format-toolbar icons + Bold/Italic/Strike/etc if surface). Verify via `file public/assets/sun-kudos/icons/*` and confirm dimensions match Figma | public/assets/sun-kudos/icons/
- [ ] T003 [P] Extend `kudosDialog` namespace in dictionary (vi + en) with all composer copy: dialogTitle, recipientLabel, recipientPlaceholder, recipientRequired, recipientFreeFormError, contentLabel, contentPlaceholder, contentRequired, hashtagLabel, hashtagButtonLabel, hashtagPlaceholder, hashtagRequired, hashtagDuplicateError, hashtagMaxError, imageButtonLabel, imageInvalidTypeError, imageSizeError, anonymousLabel, anonymousAliasPlaceholder, helperText ("Ví dụ: Người truyền động lực cho tôi. Danh hiệu sẽ hiển thị làm tiêu đề Kudos của bạn."), cancelLabel ("Hủy"), submitLabel ("Gửi"), submitToastSuccess, submitErrorMessage, networkErrorMessage, sendingState, formatBold, formatItalic, formatStrike, formatNumberList, formatLink, formatQuote, formatMention | lib/i18n/dictionary.ts
- [ ] T004 [P] Add `getKudosDialogDictionary(locale)` accessor mirroring `getKudosDictionary` | lib/i18n/dictionary.ts
- [ ] T005 [P] Extend `Kudos` type with optional `isAnonymous: boolean` + `anonymousAlias: string | null`; add `ComposerDraft` type (`recipientId`, `message`, `hashtags`, `images`, `isAnonymous`, `anonymousAlias`) and `UploadedImage` type (`id`, `file`, `previewUrl`, `status`) | lib/kudos/types.ts

**Checkpoint**: Deps installed, assets verified, dictionary + types ready. No behavior yet.

---

## Phase 2: Foundation (Blocking Prerequisites)

**Purpose**: Mock backend extensions, Markdown renderer (used by feed cards too), and replacement of the `/viet-kudo` placeholder. Required before any user-story phase.

**⚠️ CRITICAL**: All P1 user stories below depend on this phase completing first.

### Mock store + service + validators

- [ ] T006 Write failing unit test asserting seed Kudos have `isAnonymous: false` + `anonymousAlias: null` defaults; `insertKudos` accepts new fields and persists them on the canonical record | tests/unit/kudos/store-anonymity.test.ts
- [ ] T007 Extend `lib/kudos/store.ts` — add `isAnonymous` + `anonymousAlias` to internal `Kudos` shape + `insertKudos` accepts both as optional inputs (default false/null); seed records back-fill defaults; `rebuildAggregates` unchanged | lib/kudos/store.ts
- [ ] T008 Extend `lib/kudos/seed-data.ts` if needed so existing fixtures explicitly set `isAnonymous: false` (keeps test snapshots stable) | lib/kudos/seed-data.ts
- [ ] T009 Write failing validator test extending the existing send-Kudos suite: rejects self-recipient with `RECIPIENT_IS_SELF`; accepts `isAnonymous: true` with alias 1–60 chars; accepts `isAnonymous: true` with `alias: null`; rejects alias > 60 chars; strips leading `#` + lowercase dedupes hashtags; rejects images array > 5 | tests/unit/kudos/validators.test.ts
- [ ] T010 Extend `lib/kudos/validators.ts.validateSendKudosBody` per the test in T009 — add anonymity fields + self-recipient check + hashtag normalisation; export an `RecipientIsSelfError` discriminant in the result | lib/kudos/validators.ts
- [ ] T011 Write failing service test extending `service-send.test.ts`: `sendKudos` rejects self-recipient (throws + 400 error code); persists `isAnonymous` + `anonymousAlias`; sender's `kudosSent` still bumps when anonymous (audit) | tests/unit/kudos/service-send.test.ts
- [ ] T012 Extend `lib/kudos/service.ts.sendKudos` — accept extended input shape, reject self-recipient via thrown `RecipientIsSelfError`, pass anonymity fields through `insertKudos` | lib/kudos/service.ts

### Upload route + multipart mock

- [ ] T013 [P] Write failing integration test for `POST /api/kudos/uploads`: 401 anon; multipart `image/jpeg` + `image/png` succeed and return data-URLs; rejects `application/pdf` with 400; rejects file > 5 MB with 400; rejects > 5 files per request with 400 | tests/integration/kudos-uploads-route.test.ts
- [ ] T014 [P] Implement `app/api/kudos/uploads/route.ts` — thin handler: auth → validate FormData entries (MIME magic-byte + size + count) → return `{ urls: string[] }` where urls are data-URLs (mock; real backend swaps to object storage) | app/api/kudos/uploads/route.ts
- [ ] T015 [P] Add `lib/kudos/uploads.types.ts` — exports `UploadResponse = { urls: string[] }` + `MAX_IMAGE_BYTES = 5 * 1024 * 1024` constants; documents the contract so the real-backend swap is mechanical | lib/kudos/uploads.types.ts

### Extend existing send route

- [ ] T016 Write failing integration test extending `kudos-send-route.test.ts`: accepts `isAnonymous: true` + `anonymousAlias`; returns 400 + `RECIPIENT_IS_SELF` on self-recipient; canonical Kudos shape now includes the two new fields | tests/integration/kudos-send-route.test.ts
- [ ] T017 Update `app/api/kudos/route.ts` (POST) — pass new fields through `validateSendKudosBody` and `sendKudos`; map `RecipientIsSelfError` → 400 with `RECIPIENT_IS_SELF` code | app/api/kudos/route.ts

### Markdown renderer (used by Composer preview later AND by feed cards)

- [ ] T018 Write failing unit test for `<KudosMessage>` Markdown renderer: renders Bold/Italic/Strike/Ordered list/Link/Quote correctly; sanitises raw `<script>` tags; converts `@[displayName](id)` mentions to `<a href="/sunner/{id}">@{displayName}</a>` clickable links; preserves whitespace + line breaks | tests/unit/kudos/markdown.test.ts
- [ ] T019 Implement `lib/kudos/markdown.ts` — exports `renderKudosMessage(markdown: string): ReactNode` using `react-markdown` + `remark-gfm` + `rehype-sanitize` with an allowlist tag set; mention plugin transforms `@[name](id)` AST nodes to `<Link>` JSX | lib/kudos/markdown.ts
- [ ] T020 Implement `<KudosMessage>` thin wrapper component that calls `renderKudosMessage` with proper styling classes for inline links and lists | components/kudos/kudos-message.tsx
- [ ] T021 Update `<KudosCreamCard>` to swap the plain `<p>` message render with `<KudosMessage>`; verify existing feed cards still render plain-string seed content correctly | components/kudos/kudos-cream-card.tsx

### Page shell replacement

- [ ] T022 Write failing integration test `viet-kudo-page-auth.test.ts`: anonymous request to `/viet-kudo` redirects to `/login` (returnTo flow) | tests/integration/viet-kudo-page-auth.test.ts
- [ ] T023 Replace placeholder `app/viet-kudo/page.tsx` with auth-gated Server Component that reads `getCurrentUser`, `getLocale`, `getHomepageDictionary`, `getKudosDialogDictionary`, and `searchParams.recipient`; redirects to `/login` if no user; renders `<VietKudoPage>` shell | app/viet-kudo/page.tsx

**Checkpoint**: Backend mocks accept new fields, route handlers extended, Markdown renderer in place, `/viet-kudo` auth-gated. User-story phases can now begin.

---

## Phase 3: User Story 1 — Submit happy path (Priority: P1) 🎯 MVP

**Goal**: Authed Sunner mounts the composer, fills recipient + message + ≥1 hashtag, clicks Gửi, modal/page closes, Kudos appears at the top of `/sun-kudos` feed.

**Independent Test**: Open `/viet-kudo`. Fill 3 required fields with valid data. Click Gửi → 200 OK → navigate back to `/sun-kudos` → new Kudos visible as the first item.

### State + composer reducer (US1 + US3 + US8 share state)

- [ ] T024 [US1] Write failing test for `composer-reducer.test.ts` covering ALL reducer actions (set-recipient, set-recipient-query, set-content, add-hashtag, remove-hashtag, add-images, remove-image, toggle-anonymous, set-alias, start-submit, submit-error, reset). Each action asserts the next state + invariants (no >5 hashtags, no duplicate, no >5 images, alias resets on uncheck) | tests/unit/kudos/composer-reducer.test.ts
- [ ] T025 [US1] Implement `hooks/use-kudos-composer.ts` exporting `useKudosComposer()` with the reducer + memoised dispatch helpers + `submit()` async function | hooks/use-kudos-composer.ts

### Composer shell components (US1 baseline)

- [ ] T026 [P] [US1] Implement `<KudosComposerTitle>` — heading 24px Montserrat 700 white "Gửi lời cám ơn và ghi nhận đến đồng đội" (Figma `I520:11647;520:9870`) | components/kudos/kudos-composer-title.tsx
- [ ] T027 [P] [US1] Implement `<KudosComposerFooter>` — flex row, justify-end, Hủy (secondary outlined) + Gửi (primary yellow). Submit disabled until 3 required valid; calls `onSubmit` prop | components/kudos/kudos-composer-footer.tsx
- [ ] T028 [P] [US1] Implement `<KudosAnonymousToggle>` skeleton — checkbox + label only (alias field stubbed, wired in US7) | components/kudos/kudos-anonymous-toggle.tsx
- [ ] T029 [US1] Implement `<KudosComposer>` server-prop-driven shell composing Title + RecipientPicker (stub) + HashtagPicker (stub) + ContentEditor (plain textarea stub) + ImageUploader (stub, no logic) + AnonymousToggle + Footer; reads `mode: "modal" | "standalone"` and threads initial recipient prop | components/kudos/kudos-composer.tsx

### Standalone page composition

- [ ] T030 [US1] Implement `<VietKudoPage>` server-component composition: AppHeader (`currentPath=/viet-kudo`) + main area with centered `<KudosComposer mode="standalone">` + AppFooter; wraps the composer in `<ToastHost>` for submit feedback | components/kudos/viet-kudo-page.tsx
- [ ] T031 [US1] Wire `app/viet-kudo/page.tsx` to render `<VietKudoPage>` with `searchParams.recipient` threaded through as `initialRecipientId` prop | app/viet-kudo/page.tsx

### Recipient + hashtag input baseline (no autocomplete yet — wired in US2/US4)

- [ ] T032 [US1] Implement `<KudosRecipientPicker>` baseline — labelled text input + (stubbed) dropdown placeholder. Wires to reducer via `setRecipientQuery`. No autocomplete yet (US2). Shows inline error if errors.recipient is set | components/kudos/kudos-recipient-picker.tsx
- [ ] T033 [US1] Implement `<KudosHashtagPicker>` baseline — labelled `+ Hashtag` button stub + chip list rendering current hashtags + inline error. No add-dropdown yet (US4) | components/kudos/kudos-hashtag-picker.tsx
- [ ] T034 [US1] Implement `<KudosContentEditor>` baseline — plain `<textarea>` for now (Tiptap upgrade in US5). Wires to reducer via `setContent`. Inline error when errors.content set | components/kudos/kudos-content-editor.tsx
- [ ] T035 [US1] Implement `<KudosImageUploader>` baseline — `+ Image` button stub + empty thumbnail grid placeholder. No file picker logic yet (US6) | components/kudos/kudos-image-uploader.tsx

### Submit flow (US1)

- [ ] T036 [US1] In `use-kudos-composer.ts` implement `submit()` — POST to `/api/kudos` with serialized payload; on 200 → call `swr.mutate` for the kudos cache family (`/^\/api\/kudos\/(feed|highlight|spotlight)/`) and `/api/users/me`; dispatch `reset`; show success toast; for standalone mode → `router.push('/sun-kudos')`; for modal mode → call `onClose` prop | hooks/use-kudos-composer.ts
- [ ] T037 [US1] Wire the Footer's Gửi button to call `submit()`; show spinner while `submitting`; hook keyboard `Enter` on the recipient input to focus the next field (basic UX) | components/kudos/kudos-composer-footer.tsx + components/kudos/kudos-composer.tsx
- [ ] T038 [US1] Add Hủy button behavior → dispatches `reset`; standalone mode → `router.push('/sun-kudos')`; modal mode → `onClose` | components/kudos/kudos-composer-footer.tsx
- [ ] T039 [US1] E2E spec — submit happy path on standalone `/viet-kudo`: fill recipient (typed into the still-stub field, picked by id via test hook), fill content + 1 hashtag, submit, observe redirect + feed-prepend | tests/e2e/viet-kudo-submit.spec.ts

### Verification (US1)

- [ ] T040 [US1] Run `npm run lint && npm run typecheck && npm run test && npm run build`; resolve before checkpoint | (none)

**Checkpoint US1 complete**: Composer ships as standalone page, submits a Kudos end-to-end with a minimum valid payload. Recipient autocomplete, hashtag dropdown, rich-text editor, image upload, anonymous mode are all stubs — added in subsequent phases.

---

## Phase 4: User Story 3 — Required-field validation (Priority: P1)

**Goal**: Submit disabled until 3 required fields valid; force-attempts surface inline errors; server 4xx maps to per-field errors.

**Independent Test**: Open composer, click Gửi while empty → disabled (no-op). Force-submit via API → 400 + per-field error display. Empty content + valid others → still disabled.

- [ ] T041 [US3] Write failing test extending `composer-reducer.test.ts` — `isValid` selector returns false until all 3 required fields satisfy; `submit-error` action dispatches per-field errors into the `errors` map | tests/unit/kudos/composer-reducer.test.ts
- [ ] T042 [US3] Implement `isComposerValid(state)` selector + wire Submit button to `aria-disabled` and `disabled` based on it | hooks/use-kudos-composer.ts + components/kudos/kudos-composer-footer.tsx
- [ ] T043 [US3] Update each input component (`<KudosRecipientPicker>`, `<KudosContentEditor>`, `<KudosHashtagPicker>`) to render inline error message + red border when `errors.{field}` is set | components/kudos/kudos-{recipient-picker,content-editor,hashtag-picker}.tsx
- [ ] T044 [US3] In `submit()` flow handle 400 responses by mapping `details` to the `errors` map via dispatch; preserve form state | hooks/use-kudos-composer.ts
- [ ] T045 [US3] E2E spec — validation: force-submit empty, observe inline errors; fill recipient + content + 0 hashtags, observe Submit still disabled; fill 1 hashtag → enabled | tests/e2e/viet-kudo-validation.spec.ts

**Checkpoint US3 complete**: Validation enforces 3 required fields client-side and surfaces server errors cleanly.

---

## Phase 5: User Story 8 — Cancel + close (Priority: P1)

**Goal**: Esc + backdrop + Hủy all close the composer (modal mode) or navigate back (standalone mode), discarding form data. No draft persistence.

**Independent Test**: Modal mode — open via A.1 pill, fill data, press Esc → modal closes, re-open → fresh state. Standalone — fill data, click Hủy → router.push('/sun-kudos'); navigate back → fresh form.

- [ ] T046 [US8] Write failing test for `kudos-composer-modal.test.tsx` — modal mounts with backdrop, Esc closes, backdrop click closes, focus restored to trigger on close, focus-trap active while open | tests/unit/kudos/kudos-composer-modal.test.tsx
- [ ] T047 [US8] Implement `<KudosComposerModal>` shell using `focus-trap-react`: backdrop div with onClick close, `role="dialog" aria-modal="true" aria-labelledby="kudos-composer-title"`, Escape keydown handler, return-focus to trigger on close | components/kudos/kudos-composer-modal.tsx
- [ ] T048 [US8] Add Esc keyboard handler to `<KudosComposer>` for standalone mode → router.back(); ensure listener cleans up on unmount | components/kudos/kudos-composer.tsx
- [ ] T049 [US8] Wire the existing A.1 pill on `/sun-kudos` (`<KudosSendInputPill>`) — replace `<Link href="/viet-kudo">` with a `<button>` that toggles modal state on `<SunKudosPage>`; mount `<KudosComposerModal>` with `<KudosComposer mode="modal" onClose={...}>` inside the page | components/kudos/kudos-send-input-pill.tsx + components/kudos/sun-kudos-page.tsx
- [ ] T050 [US8] E2E spec — modal open/close paths: open via A.1 pill, Esc closes; open again, backdrop click closes; open again, Hủy closes; open from `?recipient=...` deep link prefills | tests/e2e/viet-kudo-modal.spec.ts

**Checkpoint US8 complete**: Cancel/close behavior works in both modal and standalone modes with full a11y.

---

## Phase 6: User Story 2 — Recipient autocomplete (Priority: P1)

**Goal**: Recipient input shows live dropdown filtered by user's query; selecting fills the field + caches Sunner id. Server rejects free-form. Self-recipient excluded from list.

**Independent Test**: Type "Nguyễn" → dropdown opens with matching Sunners; pick one → input shows the displayName + chip indicator; submit succeeds with recipientId set.

- [ ] T051 [US2] Write failing test for `use-sunner-lookup.test.ts` — accent-insensitive match ("nguyen" matches "Nguyễn"), case-insensitive, trims whitespace, excludes a given sender id, returns paginated chunks | tests/unit/use-sunner-lookup.test.ts
- [ ] T052 [US2] Implement `hooks/use-sunner-lookup.ts` — SWR over `/api/kudos/sunners` (cached forever during session) + client-side filter with `String.prototype.normalize("NFD")` + diacritic strip; accepts `excludeSenderId` prop | hooks/use-sunner-lookup.ts
- [ ] T053 [US2] Upgrade `<KudosRecipientPicker>` from baseline stub to full autocomplete: opens dropdown on focus/typing, debounce 200ms, keyboard arrow navigation, Enter selects, click selects, Esc closes dropdown, "no results" empty state | components/kudos/kudos-recipient-picker.tsx
- [ ] T054 [US2] Server-side: extend `service.sendKudos` to verify recipientId exists in directory (returns 404 + `RECIPIENT_NOT_FOUND` if not); already rejects self-recipient from earlier extension | lib/kudos/service.ts + tests/unit/kudos/service-send.test.ts (extend)
- [ ] T055 [US2] Wire URL `?recipient={id}` consumption: standalone page passes `initialRecipientId` prop; `<KudosComposer>` on mount looks up the Sunner in the directory and dispatches `setRecipient` if found | components/kudos/kudos-composer.tsx
- [ ] T056 [US2] E2E spec — autocomplete: type → dropdown opens, pick → field filled; type non-matching → empty state; verify self-excluded; verify `?recipient=` prefills | tests/e2e/viet-kudo-recipient.spec.ts

**Checkpoint US2 complete**: Recipient picker fully wired with autocomplete; server enforces recipient existence + non-self.

---

## Phase 7: User Story 4 — Hashtag chips (Priority: P1)

**Goal**: User adds hashtags via `+ Hashtag` button → dropdown shows existing tags + "Create new" option. Min 1, max 5, dedupe.

**Independent Test**: Click `+ Hashtag` → dropdown opens with 12 seed tags; pick "TeamWork" → chip added; click `+ Hashtag` again → "TeamWork" hidden from list; type unknown → "Tạo hashtag mới" option; add 5 → button disabled; remove 1 → re-enabled.

- [ ] T057 [US4] Write failing test for `kudos-hashtag-picker.test.tsx` — dropdown opens, free-form input creates new tag, duplicates rejected, 5-cap respected, remove (x) deletes chip, button hides/shows | tests/unit/kudos/kudos-hashtag-picker.test.tsx
- [ ] T058 [US4] Upgrade `<KudosHashtagPicker>` baseline to full implementation: `+ Hashtag` triggers floating dropdown via `useSWR("/api/kudos/hashtags")`; supports search-as-you-type + "Tạo hashtag mới: '{input}'" option; chips render with `x` button; respects 5-cap (button disabled with tooltip "Tối đa 5 hashtag") | components/kudos/kudos-hashtag-picker.tsx
- [ ] T059 [US4] Wire `add-hashtag` reducer action to strip leading `#`, lowercase-dedupe; surface inline error if duplicate (`hashtagDuplicateError` dictionary key) | hooks/use-kudos-composer.ts
- [ ] T060 [US4] E2E spec — hashtag UX: add from dropdown, add free-form, dedupe rejection, 5-cap, remove (x) restores | tests/e2e/viet-kudo-hashtag.spec.ts

**Checkpoint US4 complete**: Hashtag chips work end-to-end including free-form creation.

---

## Phase 8: User Story 5 — Rich-text editor (Priority: P2)

**Goal**: Replace plain textarea with Tiptap; toolbar buttons (Bold, Italic, Strike, Numbered list, Link, Quote); `@mention` autocomplete inside content. Stored as Markdown.

**Independent Test**: Type "Cảm ơn bạn" → bold via toolbar; type "@Ng" → mention dropdown appears with Sunners; pick one → `@[displayName](id)` token inserted; submit → server receives Markdown; feed card renders bold + mention as clickable link.

- [ ] T061 [US5] Write failing test for `kudos-content-editor.test.tsx` — Tiptap mounts in jsdom; toolbar buttons toggle marks; mention extension triggers on `@`; `getMarkdown()` returns canonical Markdown including `@[name](id)` for mentions | tests/unit/kudos/kudos-content-editor.test.tsx
- [ ] T062 [US5] Upgrade `<KudosContentEditor>` from baseline textarea to Tiptap: install editor with `StarterKit` + `Link` + `Mention` extensions; expose `onChange(markdown)` (use `tiptap-markdown` if it fits or implement a small ProseMirror → Markdown serialiser for the allowed grammar); mention extension uses `use-sunner-lookup` for the suggestion query | components/kudos/kudos-content-editor.tsx
- [ ] T063 [US5] Implement format toolbar component `<KudosContentToolbar>` — 6 icon-buttons (Bold/Italic/Strike/NumList/Link/Quote) that call `editor.chain().focus().toggle*().run()`; Link button opens a small URL prompt overlay | components/kudos/kudos-content-toolbar.tsx
- [ ] T064 [US5] Verify Markdown render path: `<KudosMessage>` correctly renders `@[displayName](id)` as `<Link href="/sunner/{id}">@{displayName}</Link>`; bold/italic/strike render via `remark-gfm`; ordered list + quote render natively | lib/kudos/markdown.ts + tests/unit/kudos/markdown.test.ts (extend)
- [ ] T065 [US5] Code-split: change `kudos-composer.tsx` to dynamic-import `<KudosContentEditor>` via `next/dynamic({ ssr: false })` so Tiptap's ~50kB bundle only loads when the composer opens | components/kudos/kudos-composer.tsx
- [ ] T066 [US5] E2E spec — rich text: type + bold + italic + insert link + add `@mention`; submit; verify feed card shows formatted message + clickable mention | tests/e2e/viet-kudo-richtext.spec.ts

**Checkpoint US5 complete**: Rich-text editor with mention works end-to-end; feed cards render formatted content.

---

## Phase 9: User Story 6 — Image upload (Priority: P2)

**Goal**: User uploads 0–5 `.jpg`/`.png` images via `+ Image` button. Thumbnails render with `x` delete. Reject other MIME + > 5 MB. `+ Image` hides at 5; reshows on remove.

**Independent Test**: Upload 3 valid images → 3 thumbnails. Upload 5 → button hidden. Remove 1 → button re-shown. Upload `.pdf` → reject toast.

- [ ] T067 [US6] Write failing test for `kudos-image-uploader.test.tsx` — File picker opens; valid `.jpg`/`.png` thumbnails render via `URL.createObjectURL`; reject non-image MIME; reject > 5 MB; hide button at 5; remove (x) reduces count + reshows button; cleanup revokes object URLs on unmount | tests/unit/kudos/kudos-image-uploader.test.tsx
- [ ] T068 [US6] Upgrade `<KudosImageUploader>` from baseline stub to full implementation: hidden `<input type="file" accept="image/jpeg,image/png" multiple>`, `+ Image` button triggers file picker, validates MIME + size client-side, generates preview via `URL.createObjectURL`, renders thumbnail grid (5 slots), `x` deletes and revokes URL; counter "{n}/5" | components/kudos/kudos-image-uploader.tsx
- [ ] T069 [US6] Wire submit flow to upload images before posting Kudos: in `submit()` of `use-kudos-composer.ts`, build `FormData` with each `File`, POST to `/api/kudos/uploads`, use returned URLs for the `POST /api/kudos` payload; on upload failure → toast + abort | hooks/use-kudos-composer.ts
- [ ] T070 [US6] E2E spec — image upload: upload 3 → thumbnails appear; upload 2 more → button hides; delete 1 → button reappears; upload `.pdf` → rejected with toast | tests/e2e/viet-kudo-image.spec.ts

**Checkpoint US6 complete**: Image upload supports happy path + all caps + error states.

---

## Phase 10: User Story 7 — Anonymous send (Priority: P2)

**Goal**: Checkbox toggles anonymous mode; alias text field appears/disappears; submit sends `isAnonymous` + `anonymousAlias`. Feed card renders alias instead of sender name.

**Independent Test**: Check checkbox → alias field appears; fill "Người Bí Ẩn"; submit → feed card shows "Người Bí Ẩn" instead of sender's real name; avatar link disabled.

- [ ] T071 [US7] Write failing test extending `composer-reducer.test.ts` — `toggle-anonymous` resets alias on uncheck; `set-alias` only allowed when isAnonymous=true | tests/unit/kudos/composer-reducer.test.ts
- [ ] T072 [US7] Upgrade `<KudosAnonymousToggle>` from baseline checkbox to full: checkbox + label; when checked, render text input "Tên ẩn danh (tuỳ chọn)" with `maxLength=60`; on uncheck reset alias via dispatch | components/kudos/kudos-anonymous-toggle.tsx
- [ ] T073 [US7] Update `<KudosCreamCard>` to handle `isAnonymous: true`: render `kudos.anonymousAlias ?? "Ẩn danh"` as sender displayName; replace sender `<Link href="/sunner/...">` with a non-link `<span>`; mute avatar (e.g. placeholder silhouette or grayscale) | components/kudos/kudos-cream-card.tsx
- [ ] T074 [US7] E2E spec — anonymous flow: check checkbox → alias field; uncheck → field hidden + value reset; submit anonymous → feed renders alias; submit anonymous with empty alias → feed shows "Ẩn danh" default | tests/e2e/viet-kudo-anonymous.spec.ts

**Checkpoint US7 complete**: Anonymous mode end-to-end including feed display.

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, motion, performance, screenflow sync, final gate.

- [ ] T075 [P] ARIA pass — `<KudosComposerModal>` `role="dialog"` `aria-modal="true"` `aria-labelledby="kudos-composer-title"`; `<KudosComposerFooter>` Submit `aria-disabled` reflects validity; toast `role="status" aria-live="polite"`; toolbar icon-buttons have `aria-label`; mention dropdown `role="listbox"`; recipient + hashtag dropdowns `aria-expanded` | components/kudos/*.tsx
- [ ] T076 [P] `prefers-reduced-motion` audit — disable modal slide animation, snap toast in/out, instant dropdown reveal | components/kudos/*.tsx
- [ ] T077 [P] Loading + skeleton states — recipient autocomplete shows spinner during initial fetch; hashtag dropdown shows skeleton rows; image upload shows progress text per thumbnail | components/kudos/*.tsx
- [ ] T078 [P] Error boundary wrapping `<KudosComposer>` so unexpected errors don't crash `/sun-kudos` (modal mode) or freeze `/viet-kudo` (standalone) | components/kudos/kudos-composer-error-boundary.tsx
- [ ] T079 [P] Bundle size verification — confirm `/sun-kudos` initial JS ≤ 200 kB gz after dynamic-import code-split (`npm run build` + inspect `.next/build-manifest.json`); confirm `/viet-kudo` initial JS ≤ 240 kB gz (composer loads eagerly there) | (none)
- [ ] T080 Sync `SCREENFLOW.md` Discovery Log + confirm row 6 already accurate (added during specify step) | .momorph/contexts/SCREENFLOW.md
- [ ] T081 Final gate: `npm run lint && npm run typecheck && npm run test && npm run test:e2e && npm run build` ALL pass | (none)

---

## Dependency Graph

```
Phase 1 (Setup) ─┐
                 ├──> Phase 2 (Foundation) ─┐
                                            ├──> Phase 3 (US1 MVP) ─┐
                                            │                       ├──> Phase 4 (US3) ─┐
                                            │                       ├──> Phase 5 (US8) ─┤
                                            │                       │                   ├──> Phase 11 (Polish)
                                            │                       ├──> Phase 6 (US2) ─┤
                                            │                       ├──> Phase 7 (US4) ─┤
                                            │                       ├──> Phase 8 (US5) ─┤
                                            │                       ├──> Phase 9 (US6) ─┤
                                            │                       └──> Phase 10 (US7)
```

- **Phases 4–10 are independent once Phase 3 (US1) lands** — each upgrades a stub to its full implementation in a different component file. They can be executed in parallel by different developers.
- **Phase 5 (US8 modal)** can run alongside Phase 4 (US3) — different components.
- **Phase 8 (US5 rich-text)** has the largest single-file impact (`<KudosContentEditor>` rewrite); recommend doing it after Phase 6 + 7 stabilise.

---

## Parallel Execution Examples

### Within Phase 2 (Foundation)

- T006, T009, T011, T013, T016, T018, T022 are all FAILING test tasks across independent files — write them all first (all 7 can be done in parallel by one developer or split across developers).
- T007/T008/T010/T012/T014/T015/T017/T019–T021/T023 are the paired implementations — each unblocks its test.

### Within Phase 3 (US1)

- T026, T027, T028 are file-disjoint component stubs — parallel.
- T032, T033, T034, T035 likewise — parallel after their stubs land.
- T029 (composer shell) depends on the above; T030, T031 depend on T029.

### Within Phase 11 (Polish)

- T075, T076, T077, T078, T079 are file-disjoint cross-cutting concerns — fully parallel.

---

## Implementation Strategy

### Minimum Viable Product (MVP)

**MVP = Phases 1 + 2 + 3.** After Phase 3 (US1), the composer ships as a standalone page that submits a minimum valid Kudos end-to-end. Stubbed surfaces (autocomplete, hashtag dropdown, rich-text, image upload, anonymous) are visible but no-op — sufficient for an internal demo + early user feedback while later phases land.

### Suggested incremental delivery

1. **Day 1**: Phase 1 (Setup) + Phase 2 (Foundation). Mock backend extends + Markdown renderer + page shell.
2. **Day 2–3**: Phase 3 (US1). Composer ships standalone with stubs.
3. **Day 4**: Phase 4 (US3 validation) + Phase 5 (US8 cancel/close + modal mount). P1 stories complete.
4. **Day 5**: Phase 6 (US2 autocomplete) + Phase 7 (US4 hashtag chips). All P1 complete; P2 starts.
5. **Day 6–7**: Phase 8 (US5 rich-text editor — largest single phase).
6. **Day 8**: Phase 9 (US6 image upload).
7. **Day 9**: Phase 10 (US7 anonymous).
8. **Day 10**: Phase 11 (polish + final gate).

### Test discipline

- Every implementation task has a paired failing-test task that **MUST** be observed red before implementation begins (Constitution Principle II).
- E2E specs go last in each user-story phase — they validate the full vertical slice.
- `npm run lint && npm run typecheck && npm run test && npm run build` MUST be green at each Checkpoint.

---

## Notes

### Out-of-scope dependencies (placeholder routes still used)

- `/sunner/[userId]` — mention render targets it; still a placeholder; full Profile spec deferred.
- `/sun-kudos/[kudosId]` — not directly used by this composer.

### Why MVP at Phase 3

Phase 3 (US1) gets to a submit-successful round-trip with `recipientId` typed via test hook + plain message + 1 hashtag. UX is rough but the spine is in place. Subsequent phases each upgrade one stub to its full implementation, so each phase ships a usable improvement.

### Code-split rationale (T065)

Without dynamic-import, Tiptap (~50 kB gz) loads on every `/sun-kudos` visit even though most users never open the composer. `next/dynamic({ ssr: false })` defers the load until the modal opens — keeps the Live Board bundle within the 200 kB target.

### Counts

- **Total tasks**: 81 (T001 – T081)
- **Setup (Phase 1)**: 5 tasks (T001–T005)
- **Foundation (Phase 2)**: 18 tasks (T006–T023)
- **US1 (Phase 3, P1 — MVP)**: 17 tasks (T024–T040)
- **US3 (Phase 4, P1)**: 5 tasks (T041–T045)
- **US8 (Phase 5, P1)**: 5 tasks (T046–T050)
- **US2 (Phase 6, P1)**: 6 tasks (T051–T056)
- **US4 (Phase 7, P1)**: 4 tasks (T057–T060)
- **US5 (Phase 8, P2)**: 6 tasks (T061–T066)
- **US6 (Phase 9, P2)**: 4 tasks (T067–T070)
- **US7 (Phase 10, P2)**: 4 tasks (T071–T074)
- **Polish (Phase 11)**: 7 tasks (T075–T081)
