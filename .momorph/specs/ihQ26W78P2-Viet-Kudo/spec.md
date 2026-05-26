# Feature Specification: Viết Kudo — Send Kudos Dialog

**Frame ID**: `520:11602`
**Frame Name**: `Viết Kudo`
**Screen ID**: `ihQ26W78P2`
**File Key**: `9ypp4enmFmdK3YAFJLIu6C`
**Figma URL**: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/ihQ26W78P2
**Created**: 2026-05-20
**Status**: Draft

---

## Overview

`Viết Kudo` là **modal composer** cho phép Sunner gửi một Kudos đến đồng đội. Người dùng vào màn từ:

- Sun* Kudos Live Board (`MaZUn5xHXZ`) — pill `A.1_Button ghi nhận`
- Homepage SAA (`i87tDx10uM`) — floating widget hoặc Sun* Kudos banner
- Avatar hover-card "Gửi Kudos" CTA — pre-fills recipient
- Direct URL `/viet-kudo` (placeholder route đã có sẵn)

Modal yêu cầu **người nhận**, **nội dung lời cảm ơn** (rich-text), và **≥1 hashtag**. Cho phép upload tối đa 5 ảnh + mention `@Sunner` trong nội dung. Có option gửi ẩn danh (kèm tên ẩn danh tuỳ chọn). Trên success, modal đóng và Kudos mới xuất hiện ngay đầu feed All Kudos.

**Primary users**: Sunner đã đăng nhập (1 vai trò duy nhất; admin không có override riêng).

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Send a basic Kudos (Priority: P1)

Sunner đã đăng nhập điền recipient + message + ≥1 hashtag, click Gửi, modal đóng, Kudos xuất hiện ở feed.

**Why this priority**: Đây là happy-path duy nhất của màn — bỏ qua thì màn vô nghĩa.

**Independent Test**: Mở `/viet-kudo` (hoặc qua A.1 pill), chọn recipient từ dropdown, gõ message, thêm 1 hashtag, click Gửi → 200 OK → modal đóng → feed prepend.

**Acceptance Scenarios**:

1. **Given** user authenticated + modal open + all required fields filled (recipient + content + ≥1 hashtag), **when** click "Gửi", **then** form posts, modal đóng, Kudos mới prepended vào All Kudos feed (mutation invalidates SWR cache).
2. **Given** user authenticated, **when** mở modal lần đầu, **then** placeholder "Tìm kiếm" hiện ở recipient input, placeholder "Hãy gửi gắm lời cám ơn và ghi nhận đến đồng đội tại đây nhé!" trong textarea, checkbox ẩn danh unchecked, nút Gửi disabled.
3. **Given** user chưa đăng nhập, **when** truy cập `/viet-kudo`, **then** middleware redirect `/login?returnTo=%2Fviet-kudo`.
4. **Given** form đã điền dữ liệu, **when** click "Hủy", **then** modal đóng + dữ liệu KHÔNG được lưu (no draft persistence in v1).
5. **Given** API trả về 5xx, **when** submit, **then** modal vẫn mở, inline toast lỗi "Không thể gửi Kudos. Vui lòng thử lại.", form data preserved.

---

### User Story 2 — Recipient autocomplete (Priority: P1)

Người dùng tìm recipient bằng cách gõ trong "Chọn người nhận" — dropdown gợi ý tên match prefix/contains.

**Why this priority**: Recipient là field bắt buộc; không có lookup thì user không gửi được.

**Independent Test**: Gõ "Nguyễn" → dropdown hiện ≥1 kết quả; click chọn → tên fill input + dropdown close. Gõ chuỗi không khớp → empty state.

**Acceptance Scenarios**:

1. **Given** modal đã mở, **when** gõ "An" trong recipient input, **then** dropdown hiển thị danh sách Sunner có tên chứa "An" (case-insensitive, accent-insensitive).
2. **Given** dropdown hiển thị kết quả, **when** click một item, **then** tên Sunner fill vào input + dropdown đóng + recipient state lưu Sunner id.
3. **Given** input có khoảng trắng thừa "  Nguyễn  ", **when** gõ, **then** hệ thống trim trước khi lookup; dropdown hiển thị kết quả như "Nguyễn" thuần.
4. **Given** input chứa ký tự đặc biệt "@ # $", **then** dropdown hiển thị empty state hoặc lọc chính xác theo string raw.
5. **Given** preset query param `?recipient={id}`, **when** mở modal, **then** recipient prefilled với Sunner tương ứng (id mapped → displayName); user có thể clear hoặc đổi.
6. **Given** user chỉ gõ free-text không chọn từ dropdown, **when** submit, **then** form reject với inline error "Vui lòng chọn người nhận từ danh sách" — KHÔNG cho free-form người nhận.

---

### User Story 3 — Required-field validation (Priority: P1)

Submit chỉ enabled khi 3 required fields (recipient, message, ≥1 hashtag) hợp lệ. Submit attempt với field rỗng surface inline error + viền đỏ.

**Why this priority**: Form validation là bắt buộc cho data quality + UX rõ ràng.

**Independent Test**: Để trống một trong 3 required → nút Gửi disabled. Force-submit qua API → server trả 400 với error per-field.

**Acceptance Scenarios**:

1. **Given** modal mới mở (tất cả empty), **then** nút Gửi disabled.
2. **Given** recipient + message valid nhưng hashtag = 0, **then** nút Gửi vẫn disabled.
3. **Given** force-submit qua keyboard với recipient empty, **then** field "Người nhận" có border đỏ + label lỗi "Không được để trống"; form KHÔNG submit.
4. **Given** force-submit với content empty, **then** textarea border đỏ + lỗi "Không được để trống".
5. **Given** force-submit với 0 hashtag, **then** hashtag area border đỏ + lỗi "Không được để trống".
6. **Given** server trả 400 với detail per-field, **then** UI map vào đúng field và hiển thị inline.

---

### User Story 4 — Hashtag management (1–5 chips) (Priority: P1)

User thêm hashtag qua nút `+ Hashtag` (dropdown chọn từ existing OR free-input theo tag name). Mỗi tag là 1 chip có nút "x" để xoá. Min 1, max 5.

**Why this priority**: Hashtag là required + drive Spotlight filter + Sun* Kudos board categorization.

**Independent Test**: Thêm 5 tag → nút `+ Hashtag` ẩn (hoặc disabled). Thêm tag thứ 6 bị reject. Xoá 1 tag → còn 4 + nút `+ Hashtag` hiện lại.

**Acceptance Scenarios**:

1. **Given** 0 hashtag, **when** click `+ Hashtag` → chọn "TeamWork", **then** chip "TeamWork" được thêm; counter 1/5.
2. **Given** đã 5 hashtag, **when** click `+ Hashtag`, **then** dropdown KHÔNG mở; UI hiển thị thông báo "Tối đa 5 hashtag".
3. **Given** ≥1 hashtag, **when** click "x" trên chip, **then** chip biến mất; counter giảm.
4. **Given** từ 5 chip xoá còn 4, **then** nút `+ Hashtag` enabled trở lại.
5. **Given** dropdown mở, **when** gõ tag name không có trong danh sách, **then** option "Tạo hashtag mới: '{input}'" hiển thị (free-form allowed) — admin sẽ moderate sau.

---

### User Story 5 — Rich-text message editor (Priority: P2)

Textarea hỗ trợ formatting: Bold, Italic, Strike, Numbered list, Link, Quote. Plus mention `@Sunner` trigger autocomplete giữa input.

**Why this priority**: Nice-to-have; basic plain-text submit vẫn ship được — P1 đã cover required content.

**Independent Test**: Gõ text → bôi đen → click B/I/S → formatting áp dụng. Gõ "@Ng" → mention dropdown. Click Link → URL prompt.

**Acceptance Scenarios**:

1. **Given** text đã gõ + bôi đen, **when** click "B", **then** đoạn text in đậm; click lại bỏ format.
2. **Given** text đã bôi đen, **when** click "I", **then** in nghiêng.
3. **Given** text đã bôi đen, **when** click "S" (Strike), **then** gạch ngang.
4. **Given** multi-line text bôi đen, **when** click Number list, **then** chuyển thành ordered list.
5. **Given** text bôi đen, **when** click Quote, **then** đoạn thành block-quote.
6. **Given** text bôi đen, **when** click Link → nhập URL hợp lệ → confirm, **then** text trở thành hyperlink. URL invalid → reject + thông báo.
7. **Given** caret ở vị trí bất kỳ trong textarea, **when** gõ "@", **then** mention dropdown hiển thị danh sách Sunner; gõ thêm để filter; click 1 item → mention `@{name}` chèn vào caret + dropdown đóng.

---

### User Story 6 — Image upload (0–5 files) (Priority: P2)

User upload tối đa 5 ảnh `.jpg`/`.png` (không bắt buộc). Mỗi ảnh hiển thị thumbnail với nút "x" để xoá. Khi đủ 5, nút `+ Image` ẩn; xoá ảnh → nút hiện lại. Reject file format khác.

**Why this priority**: Optional field, nâng cao chất lượng Kudos nhưng không block flow.

**Independent Test**: Upload 5 ảnh → nút ẩn. Upload .pdf → reject với toast lỗi. Xoá 1 ảnh → nút hiện lại.

**Acceptance Scenarios**:

1. **Given** 0 ảnh, **when** click `+ Image` → chọn 1 file `.jpg`, **then** thumbnail được render; counter 1/5.
2. **Given** 3 ảnh đã upload, **when** click "x" trên thumbnail ảnh thứ 2, **then** ảnh đó biến mất; còn 2 ảnh; thumbnail tự rearrange.
3. **Given** 5 ảnh đã upload, **then** nút `+ Image` ẩn (display: none).
4. **Given** 5 ảnh + nút ẩn, **when** xoá 1 ảnh, **then** nút `+ Image` hiện lại.
5. **Given** file picker, **when** chọn `.pdf`, `.mp4`, `.txt`, hoặc bất kỳ MIME không phải `image/jpeg` | `image/png`, **then** reject + toast "Định dạng file không hợp lệ" + file KHÔNG upload.
6. **Given** file size vượt quá giới hạn (TBD — recommend 5MB), **then** reject + thông báo size; file KHÔNG upload.

---

### User Story 7 — Anonymous send + alias (Priority: P2)

Checkbox "Gửi lời cám ơn và ghi nhận ẩn danh" toggle ON/OFF. Khi ON: hiển thị thêm text-field để nhập alias tuỳ chọn. Sender id ẩn khỏi card hiển thị nhưng vẫn được lưu server-side cho audit.

**Why this priority**: Tăng tự nhiên cho Kudos giữa cá nhân chưa quen biết; không phải required path.

**Independent Test**: Check checkbox → text field "Tên ẩn danh" appear. Uncheck → field disappear (giá trị reset).

**Acceptance Scenarios**:

1. **Given** modal mới mở, **then** checkbox unchecked + alias field hidden.
2. **Given** checkbox unchecked, **when** click, **then** checked + alias field xuất hiện.
3. **Given** checked, **when** uncheck, **then** alias field ẩn + alias value reset về "".
4. **Given** checked + alias filled "Người Bí Ẩn", **when** submit, **then** API nhận `{ isAnonymous: true, anonymousAlias: "Người Bí Ẩn" }`. Card display sẽ show alias thay cho sender real name; underlying senderId vẫn lưu cho audit.
5. **Given** checked + alias EMPTY, **when** submit, **then** API nhận `{ isAnonymous: true, anonymousAlias: null }`; card display dùng default placeholder "Ẩn danh".

---

### User Story 8 — Cancel + close modal (Priority: P1)

User click "Hủy" → modal đóng + form state reset (no draft persistence).

**Why this priority**: Esc-key user expects ngay; phần của flow cơ bản.

**Independent Test**: Điền data + click Hủy → modal đóng + data discarded. Re-open → fresh empty form.

**Acceptance Scenarios**:

1. **Given** modal open with filled data, **when** click "Hủy", **then** modal đóng + state reset.
2. **Given** modal open, **when** nhấn Esc, **then** equivalent click Hủy.
3. **Given** modal open, **when** click backdrop (outside modal), **then** equivalent click Hủy (default behavior; may be opt-out via prop).
4. **Given** modal đã đóng, **when** re-open, **then** form completely fresh — no draft persistence in v1.

---

### Edge Cases

- **Recipient = sender**: ID-7 không cover nhưng spec yêu cầu server reject `recipientId === senderId` với 400 ("Bạn không thể gửi Kudos cho chính mình"). Client cũng filter sender ra khỏi autocomplete dropdown.
- **Concurrent open**: Nếu user mở 2 tab modal cùng lúc + submit 1 tab thành công, tab kia vẫn cho phép submit độc lập (chỉ block khi submit cùng id — không applicable).
- **Network offline**: Submit trả network error → toast "Không có kết nối. Vui lòng thử lại." + form preserved.
- **Hashtag duplicate**: User thêm "TeamWork" hai lần → reject lần 2 với inline "Hashtag đã tồn tại trong danh sách".
- **Hashtag với leading "#"**: User gõ "#TeamWork" → strip "#" prefix trước khi lưu (canonical form không có "#").
- **Locale switch**: Tất cả copy (placeholders, errors, button labels) MUST localize qua `dictionary.ts` (`kudosDialog` namespace mới).
- **Editor formatting persistence**: Bold/Italic/Quote/etc lưu dưới dạng Markdown hoặc HTML — pick một, document explicitly. **Recommended**: Markdown (đơn giản, server-side trivial sanitize). Render-side cần markdown-to-HTML converter có sanitization (XSS protection).
- **Mention scope**: `@` trigger trong textarea KHÔNG cùng pool với recipient autocomplete? Trên thực tế cả hai pull từ Sunner directory; sender filtered out của recipient autocomplete nhưng có thể vẫn mention chính mình trong text (edge case OK).

---

## UI/UX Requirements *(from Figma)*

### Screen Components

| Component | Frame / Node ID | Description | Interactions |
|---|---|---|---|
| Cover backdrop | `520:11605` | Dim overlay over the underlying page | Click → close (per US8 scenario 3) |
| App Header | `520:11606` | Shared chrome | Reused from existing `AppHeader` |
| Mask | `520:11646` | Modal blur/darken mask | View-only |
| Viết KUDO modal | `520:11647` (instance of `520:10673`) | The composer container | Click outside → close |
| A_Title | `I520:11647;520:9870` | Heading "Gửi lời cám ơn và ghi nhận đến đồng đội" | View-only |
| B_Recipient block | `I520:11647;520:9871` | Container of B.1 title + B.2 search | View-only |
| B.1 Title | `I520:11647;520:9872` | Label "Chọn người nhận" (component `416:5550`) | View-only |
| B.2 Search input | `I520:11647;520:9873` | Autocomplete input (component `186:2757`, search-form variant) | Type → dropdown opens with Sunner list; select fills field; required |
| Frame 552 (hashtag block) | `I520:11647;1688:10448` | Block holding "+ Hashtag" button + chips + help text | See US4 |
| Hashtag button | `I520:11647;1688:10437` | `+ Hashtag` (component `186:2757`) | Click → dropdown; required ≥1; max 5 |
| Hashtag Title | `I520:11647;1688:10436` | Label (component `416:5550`) | View-only |
| Helper text | `I520:11647;1688:10447` | "Ví dụ: Người truyền động lực cho tôi. Danh hiệu sẽ hiển thị làm tiêu đề Kudos của bạn." | View-only |
| Content frame | `I520:11647;520:9874` | Container of message textarea + hashtag + image rows | — |
| Nhập kudo (textarea) | `I520:11647;520:9875` | Rich-text editor + format toolbar | See US3 + US5 |
| E_Frame 536 (image row) | `I520:11647;520:9890` | "+ Image" button + thumbnails | See US6 |
| F_Frame 537 (toolbar / footer info) | `I520:11647;520:9896` | 7 children — likely format toolbar (B, I, S, NumList, Link, Quote, Mention) | See US5 |
| G_Gửi ẩn danh | `I520:11647;520:14099` (instance of `520:14092`) | Checkbox + label + optional alias field | See US7 |
| H_Frame 538 (footer buttons) | `I520:11647;520:9905` | Hủy + Gửi buttons | See US1 + US8 |
| H.1 Hủy button | `I520:11647;520:9906` | Cancel (component `186:2757`) | Click → close + reset |
| H.2 Gửi button | `I520:11647;520:9907` | Submit (component `186:1567`, primary) | Click → submit form; disabled until 3 required valid |
| Bìa / Frame 532 (Infor sidebar) | `520:11607` → `520:11608` | Recipient profile preview after selection | View-only — pulls Sunner avatar/title/dept |
| Frame 530 Header Giải thưởng | `520:11632` → `520:11633` | Award context block (campaign header) | View-only |
| Keyvisual | `520:11603` | Underlying keyvisual image | View-only (background) |

### Navigation Flow

- **From**:
  - Sun* Kudos Live Board A.1 pill (`/sun-kudos`)
  - Homepage SAA floating widget + Sun* Kudos banner
  - Cream-card avatar hover-card "Gửi Kudos" CTA — `?recipient={sunnerId}` prefill
  - Direct URL `/viet-kudo`
- **To**:
  - Login (`/login?returnTo=%2Fviet-kudo`) when unauthenticated
  - Sun* Kudos Live Board (`/sun-kudos`) on successful send (modal closes; if entered as full page, navigate back)
  - Same page on Hủy / Esc / backdrop click (modal close only)

### Visual Requirements

- Responsive breakpoints: desktop primary (modal max-width ~720px). Mobile (<768px) — modal goes full-screen.
- Animations: modal fade-in/slide-up; backdrop fade. `prefers-reduced-motion: reduce` → snap in/out.
- Accessibility (WCAG AA):
  - `role="dialog"` + `aria-modal="true"` on the modal frame
  - `aria-labelledby` → A_Title id
  - Focus-trap inside modal while open
  - Escape closes
  - First focus: recipient input
  - Form validation errors announced via `aria-live="polite"`
  - All icon-only buttons have `aria-label`

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Page MUST require authentication. Anonymous → redirect `/login?returnTo=%2Fviet-kudo`.
- **FR-002**: Modal MUST trap focus inside while open; Esc + backdrop click + Hủy all close the modal.
- **FR-003**: Recipient field MUST accept ONLY a Sunner selected from the autocomplete dropdown (no free-form). Lookup is case-insensitive + accent-insensitive.
- **FR-004**: Server MUST reject submission where `recipientId === senderId` with HTTP 400 + i18n error message.
- **FR-005**: Message field MUST support Markdown formatting (Bold / Italic / Strike / Ordered list / Quote / Link) + `@mention`. Rendered output in feed MUST be sanitized HTML.
- **FR-006**: Hashtag field MUST require 1–5 chips. Adding a 6th MUST be rejected with toast "Tối đa 5 hashtag". Duplicate (case-insensitive) hashtags MUST be rejected with inline error.
- **FR-007**: Image upload MUST accept ONLY `image/jpeg` and `image/png`. Reject other MIME types with toast. Max 5 files. Max file size 5 MB (recommended; subject to backend confirmation).
- **FR-008**: Submit button MUST be **disabled** until 3 required fields (recipient + content + ≥1 hashtag) are valid. Disabled state communicated to screen readers via `aria-disabled="true"`.
- **FR-009**: Anonymous checkbox MUST toggle a sibling alias text field. When unchecked, alias is reset and not sent. When checked with empty alias, server defaults to "Ẩn danh" for display.
- **FR-010**: Mention `@` MUST query the same Sunner directory as recipient autocomplete. Inserted token MUST link to the Sunner profile.
- **FR-011**: On successful submit, modal MUST close + invalidate `/api/kudos/feed`, `/api/kudos/highlight`, `/api/kudos/spotlight` SWR caches so the new Kudos appears in the live board.
- **FR-012**: On server 4xx/5xx, modal MUST stay open + show inline + toast errors per-field; form data preserved.
- **FR-013**: All copy MUST come from `dictionary.ts` (`kudosDialog` namespace) keyed by `Locale`.
- **FR-014**: When entering via `?recipient={id}`, recipient MUST prefill if `{id}` is a known Sunner; otherwise ignore (no error).
- **FR-015**: No draft persistence in v1 — closing the modal discards all entered data.

### Technical Requirements

- **TR-001 (Security)**: Sanitize rich-text content server-side before persisting (escape HTML, allow only the configured tag whitelist).
- **TR-002 (Security)**: Reject self-recipient and unknown-recipient on server (defence-in-depth on top of client filter).
- **TR-003 (Security)**: Validate file MIME via magic-byte check on the server (not just extension or `Content-Type`).
- **TR-004 (Security)**: Generate fresh `Kudos.id` server-side; do NOT accept client id (matches existing pattern in `lib/kudos/service.ts`).
- **TR-005 (State)**: Form state local to modal; on submit success, `swr.mutate` invalidates the kudos cache family (see plan §State Management).
- **TR-006 (Perf)**: Image upload uses multipart/form-data; thumbnails generated client-side via `URL.createObjectURL` for preview; full upload happens on Submit (not on file pick — keeps the modal cancellable without orphaned uploads).
- **TR-007 (Perf)**: Autocomplete dropdown debounced 200ms; uses the in-memory `/api/kudos/sunners` directory cached by SWR.
- **TR-008 (a11y)**: Focus-trap library or custom (e.g. `focus-trap-react`) — pick one; must trap on open, restore focus to the trigger element on close.
- **TR-009 (i18n)**: All inline errors + toasts + placeholders sourced from `dictionary.ts` so VN/EN can switch without code change.

### Key Entities *(if feature involves data)*

- **KudosDraft** (client state, never persisted): { recipientId, recipientDisplayName, contentMarkdown, hashtags: string[], images: File[], isAnonymous, anonymousAlias }
- **SunnerSearchResult**: { id, displayName, avatarUrl, departmentName, title } — subset of `SunnerProfile`
- **HashtagOption**: { tag: string, isExisting: boolean } — `isExisting=false` for free-form new tags
- **UploadedImage** (transient): { id (client-generated), file: File, previewUrl, status: 'pending'|'uploading'|'success'|'error' }

---

## API Dependencies

| Endpoint | Method | Purpose | Status |
|---|---|---|---|
| `/api/auth/session` | GET | Auth gate | Exists |
| `/api/kudos/sunners` | GET | Recipient + mention autocomplete source | Exists (Sun* Kudos page) |
| `/api/kudos/hashtags` | GET | Hashtag dropdown options | Exists |
| `/api/kudos` | POST | Submit Kudos. Body: `{ recipientId, message, hashtags, images, isAnonymous, anonymousAlias }`. Returns the canonical `Kudos`. | Exists (currently accepts `recipientId`, `message`, `hashtags`, `images`; need to extend with `isAnonymous` + `anonymousAlias`) |
| `/api/kudos/uploads` | POST | Multipart image upload — returns CDN URLs to attach to the Kudos payload | Predicted (extend mock to accept image data URLs in v1) |

> Real backend will replace `/api/kudos/uploads` with proper object storage (S3 / Linode); the v1 mock can accept data-URLs and echo them back.

---

## State Management

- **Local component state** (modal-scoped):
  - `recipient: { id, displayName } | null`
  - `recipientQuery: string` (autocomplete input text)
  - `recipientDropdownOpen: boolean`
  - `contentMarkdown: string`
  - `hashtags: string[]`
  - `hashtagDropdownOpen: boolean`
  - `images: UploadedImage[]`
  - `isAnonymous: boolean`
  - `anonymousAlias: string`
  - `submitting: boolean`
  - `errors: Record<keyof KudosDraft, string | null>`
- **URL state**: `?recipient={id}` prefill consumed on mount (Server Component reads `searchParams`).
- **Server cache invalidation** on successful submit:
  - `mutate(/^\/api\/kudos\/(feed|highlight|spotlight)/)` — wildcard matcher on the key family
  - `mutate('/api/users/me')` — sender stats (kudosSent +1)
  - `mutate('/api/kudos/sunners')` — keeps directory fresh if backend updates `kudosSent` denormalised counts
- **Optimistic updates**: NONE — server returns canonical Kudos record with id + createdAt + isHeartedByCurrentUser; prepending is via cache revalidation (simpler + accurate).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: ≥80% of completed Kudos submissions happen via this modal (vs API direct).
- **SC-002**: Median time-to-submit (modal open → success) ≤ 60 seconds for repeat users.
- **SC-003**: <2% of attempted submissions hit the validation error toast (means form guidance is clear enough).
- **SC-004**: Server-side reject rate for self-recipient/invalid-recipient <0.1% (means client-side filter works).
- **SC-005**: 0 successful submissions with invalid file MIME (server enforces MIME magic-byte validation).

---

## Out of Scope

- **Draft persistence** (auto-save) — v2.
- **Schedule send** (send later) — v2.
- **Multi-recipient** (send to multiple Sunners at once) — v2.
- **Reply / thread** — Kudos are single-shot acknowledgements, not conversations.
- **Edit Kudos after send** — Kudos are immutable; mistakes require admin deletion.
- **Rich-text presets** (templates) — v2.
- **Schedule a hashtag** — admin curates the hashtag catalogue separately.
- **Notifications to recipient** (in-app + email) — handled by the Notifications screen, not this modal.

---

## Dependencies

- [x] `constitution.md` v1.2.0
- [x] `spec.md` for Sun* Kudos Live Board (`MaZUn5xHXZ`) — defines feed cache keys this dialog invalidates
- [x] Existing `/api/kudos/sunners`, `/api/kudos/hashtags`, `/api/kudos` route handlers
- [ ] Markdown rendering library (recommend `react-markdown` + `remark-gfm` + `rehype-sanitize`) — add to plan
- [ ] Focus-trap utility — pick from `focus-trap-react` or hand-roll
- [ ] File-upload strategy: client preview via `URL.createObjectURL` + data-URL on submit (v1 mock); real backend object storage in v2

---

## Notes

### Items needing confirmation before implementation

1. **Recipient = self** — confirmed reject (per spec FR-004); client should also filter sender from dropdown.
2. **Markdown vs HTML** — spec recommends Markdown (simpler, safer). Confirm with frontend lead.
3. **File size limit** — spec recommends 5 MB; confirm with backend (or pick based on object-storage tier).
4. **Hashtag "free-form" creation** — spec allows new tags; confirm admin moderation flow exists.
5. **Anonymous alias storage** — spec stores both `senderId` (audit) and `anonymousAlias` (display); confirm this satisfies legal/privacy.
6. **Backdrop click closes** — default behavior; opt-out per design? Awards Information uses Esc-only.
7. **Submit success behavior**: when modal is reached via direct URL `/viet-kudo`, should we navigate to `/sun-kudos` after submit, or show inline confirmation + auto-close in 2s?
8. **Mention render** — `@displayName` in feed should be a clickable Link to `/sunner/{id}`. Confirm.
9. **Image preview vs upload timing** — spec says upload-on-submit (not on-pick); confirm to avoid orphaned uploads.
10. **Modal width** — Figma frame doesn't expose a fixed width; recommend 720px desktop, full-screen mobile.

### Design references

- Figma frame: `520:11602` — `Viết Kudo`
- Source URL: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/ihQ26W78P2
- Inbound traffic from `MaZUn5xHXZ` A.1 pill + cream-card hover-card CTA (already wired with `?recipient=` query param).
- 56 test cases authored 2026-01-30 — covers access control (auth), layout, validation (required/format/min-max), interactions (autocomplete, mention, format buttons, hashtag chips, image upload, anonymous toggle, submit), and error handling. All Given/When/Then scenarios above derive from or extend that corpus.
