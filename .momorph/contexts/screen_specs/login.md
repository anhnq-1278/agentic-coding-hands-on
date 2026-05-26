# Screen: Login

## Screen Info

| Property | Value |
|----------|-------|
| **Figma Frame ID** | GzbNeVGJHz |
| **Figma Link** | https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz |
| **Screen Group** | Authentication |
| **Status** | discovered |
| **Discovered At** | 2026-05-06 |
| **Last Updated** | 2026-05-06 |

---

## Description

Public entry screen of the SAA 2025 (Sun* Awards) application. Displays the brand keyvisual, a welcome message ("Bắt đầu hành trình của bạn cùng SAA 2025. Đăng nhập để khám phá!" — "Start your journey with SAA 2025. Login to explore!"), and a single primary action that initiates Google OAuth sign-in. Header offers a Language dropdown; footer shows copyright. There is no email/password form — authentication is delegated entirely to Google SSO.

---

## Navigation Analysis

### Incoming Navigations (From)

| Source Screen | Trigger | Condition |
|---------------|---------|-----------|
| App launch (unauthenticated) | Auto-redirect from any protected route | User has no valid session |
| Dropdown-profile (`z4sCl3_Qtk`) | "Logout" item click | After logout → back to Login |
| Dropdown-profile Admin (`54rekaCHG1`) | "Logout" item click | After admin logout → back to Login |
| Error page - 403 (`T3e_iS9PCL`) | Implicit (session expired) | When auth is required but missing |

### Outgoing Navigations (To)

| Target Screen | Trigger Element | Node ID | Confidence | Notes |
|---------------|-----------------|---------|------------|-------|
| Homepage SAA (`i87tDx10uM`) | Button "LOGIN With Google" — submit success | 662:14426 | High | Primary CTA; Google OAuth callback success → land on home |
| Login (self) | Button "LOGIN With Google" — submit failure | 662:14426 | High | Stay on page with error toast on OAuth denial/cancel |
| Language Dropdown (`IiLVGkACbt`) | Header Language button | I662:14391;186:1696 | High | Opens overlay/dropdown for locale switch (vi/en) |

### Conditional / Logic Edges

- **OAuth success** → Homepage SAA (`i87tDx10uM`)
- **OAuth failure / cancel** → stay on Login, surface error toast
- **Already authenticated visit** → auto-redirect to Homepage SAA
- **Domain restriction (Sun\*)** → if Google account is outside allowed domain → stay on Login, show "Access denied" error (related: Error page - 403 `T3e_iS9PCL`)

### Navigation Rules
- **Back behavior**: N/A (entry point)
- **Deep link support**: Yes — `/login`
- **Auth required**: No (this is the unauthenticated gate)

---

## Component Schema

### Layout Structure

```
┌─────────────────────────────────────┐
│  HEADER  [Logo]            [Lang ▾] │
├─────────────────────────────────────┤
│                                      │
│         [Keyvisual / Cover]          │
│                                      │
│      "Bắt đầu hành trình của bạn"   │
│      "cùng SAA 2025. Đăng nhập…"     │
│                                      │
│      [  LOGIN With Google  G ]       │
│                                      │
├─────────────────────────────────────┤
│  Bản quyền thuộc về Sun* © 2025      │
└─────────────────────────────────────┘
```

### Component Hierarchy

```
Login (Frame)
├── mms_C_Keyvisual (Group)
├── mms_A_Header (Organism, instance 186:1602)
│   ├── mms_A.1_Logo
│   └── mms_A.2_Language (Dropdown trigger)
├── mms_B_Bìa (Body)
│   ├── mms_B.1_Key Visual (Root Further Logo)
│   └── Frame 550
│       ├── mms_B.2_content (welcome text)
│       └── mms_B.3_Login
│           └── Button-IC About — "LOGIN With Google" (Atom, 662:14426)
└── mms_D_Footer (Organism, instance 342:1427)
    └── Copyright text
```

### Main Components

| Component | Type | Node ID | Description | Reusable |
|-----------|------|---------|-------------|----------|
| mms_A_Header | Organism | 662:14391 | Top header with logo + language switcher | Yes |
| mms_A.2_Language | Molecule | I662:14391;186:1601 | Language dropdown trigger | Yes |
| mms_B_Bìa | Organism | 662:14393 | Hero/cover body region | No |
| Button-IC About (Login) | Atom | 662:14426 | Google OAuth CTA | Yes (button variant) |
| mms_D_Footer | Organism | 662:14447 | Copyright footer | Yes |

---

## Form Fields

N/A — no input form. Authentication uses Google OAuth redirect flow.

---

## API Mapping

### On Screen Load

| API | Method | Purpose | Response Usage |
|-----|--------|---------|----------------|
| /auth/session | GET | Check existing session | If valid → redirect to Homepage |
| /i18n/locales | GET | Available locales for Language dropdown | Populate dropdown |

### On User Action

| Action | API | Method | Request Body | Response |
|--------|-----|--------|--------------|----------|
| Click "LOGIN With Google" | /auth/google (redirect to Google OAuth) | GET | — | 302 to Google consent |
| OAuth callback | /auth/google/callback | GET | `?code=…&state=…` | `{token, user}` → set session cookie |
| Change Language | /i18n/preference | PUT | `{locale}` | `{ok}` |

### Error Handling

| Error Code | Message | UI Action |
|------------|---------|-----------|
| 401 | OAuth failed | Stay on Login, show error toast |
| 403 | Domain not allowed | Show "Access denied" message |
| 500 | Server error | Show retry option |

---

## State Management

### Local State

| State | Type | Initial | Purpose |
|-------|------|---------|---------|
| isLoading | boolean | false | Disable button while redirecting |
| locale | string | "vi" | Selected language |
| oauthError | string \| null | null | Error returned from callback |

### Global State

| State | Store | Read/Write | Purpose |
|-------|-------|------------|---------|
| user | authStore | Write | Set after OAuth success |
| token | authStore | Write | Save session token |
| locale | uiStore | Read/Write | App-wide locale |

---

## UI States

### Loading State
- Button shows spinner while redirecting to Google
- Disable button to prevent double-click

### Error State
- Toast / inline message under button on OAuth failure
- Distinct message for "domain not allowed" vs generic failure

### Success State
- Redirect to Homepage SAA (`i87tDx10uM`)

### Empty State
- N/A

---

## Analysis Metadata

| Property | Value |
|----------|-------|
| Analyzed By | Screen Flow Discovery (momorph.screenflow) |
| Analysis Date | 2026-05-06 |
| Needs Deep Analysis | No |
| Confidence Score | High |

### TODOs / Unresolved

- [ ] Confirm OAuth callback route name with backend (assumed `/auth/google/callback`).
- [ ] Confirm domain whitelist behavior (Sun* domain restriction → 403 vs inline error).
- [ ] Verify exact Language dropdown screen — both `Language Dropdown` (`IiLVGkACbt`) and `Dropdown-ngôn ngữ` (`hUyaaugye2`) exist; design system reuses one.
- [ ] Determine whether the unauthenticated landing on protected URLs preserves `returnTo` for post-login redirect.

### Next Steps
- [ ] Run `momorph.specs` for deeper component spec
- [ ] Run `momorph.apispecs` to lock `/auth/google` contract
