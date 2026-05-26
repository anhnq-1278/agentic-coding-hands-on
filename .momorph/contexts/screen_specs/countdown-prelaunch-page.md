# Screen: Countdown - Prelaunch page

## Screen Info

| Property | Value |
|----------|-------|
| **Figma Frame ID** | 8PJQswPZmU (node `2268:35127`) |
| **Figma Link** | https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/8PJQswPZmU |
| **Screen Group** | Pre-launch / Gating |
| **Status** | discovered |
| **Discovered At** | 2026-05-12 |
| **Last Updated** | 2026-05-12 |

---

## Description

A full-screen pre-launch takeover shown BEFORE the SAA campaign opens. The page displays the Vietnamese label "Sự kiện sẽ bắt đầu sau" ("Event will start in") above a live countdown timer of **Days : Hours : Minutes** rendered as flip-card style digits over a full-bleed brand background image.

Purpose: gate the application during the pre-launch window. Any unauthenticated or authenticated user who lands on the site while `now < campaign.start_at` should see this screen instead of Login / Homepage SAA. When the countdown reaches zero, the app transitions to the normal entry flow (Login if no session, else Homepage SAA).

This screen has NO header, NO footer, NO navigation buttons, NO language switcher, and NO interactive trigger elements in the design — it is a purely passive display.

---

## Navigation Analysis

### Incoming Navigations (From)

| Source Screen | Trigger | Condition |
|---------------|---------|-----------|
| (App entry / any deep link) | Automatic gate redirect | `now < campaign.start_at` (server-determined) |
| Login | Automatic redirect after server check | If user navigates to `/login` before campaign opens |
| Homepage SAA | Automatic redirect | If session is restored but campaign has not started yet |

### Outgoing Navigations (To)

| Target Screen | Trigger Element | Node ID | Confidence | Notes |
|---------------|-----------------|---------|------------|-------|
| Login | Auto-redirect when countdown reaches 0 AND user has no session | (logic, no element) | Medium | Assumption — standard flow when prelaunch ends and user is unauthenticated |
| Homepage SAA | Auto-redirect when countdown reaches 0 AND user has session | (logic, no element) | Medium | Assumption — standard flow when prelaunch ends and user already authenticated |

> No clickable buttons, links, dropdowns, or menus exist in the Figma frame. The only outgoing transitions are time-based / state-based.

### Navigation Rules
- **Back behavior**: Browser back is not meaningful (this is a gate). Re-entry hits the same gate while `now < campaign.start_at`.
- **Deep link support**: Yes — any deep link is intercepted and replaced by this screen while the gate condition holds; original target should be preserved via `returnTo` for after-launch.
- **Auth required**: No. Shown to BOTH unauthenticated and authenticated users during the pre-launch window.

---

## Component Schema

### Layout Structure

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│                  MM_MEDIA_BG Image                   │
│                  + Cover (overlay)                   │
│                                                      │
│                                                      │
│              Sự kiện sẽ bắt đầu sau                  │
│                                                      │
│         ┌────┬────┐  ┌────┬────┐  ┌────┬────┐        │
│         │ 0  │ 0  │  │ 0  │ 0  │  │ 0  │ 0  │        │
│         └────┴────┘  └────┴────┘  └────┴────┘        │
│             DAYS        HOURS       MINUTES          │
│                                                      │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
Screen (Countdown - Prelaunch page)
├── MM_MEDIA_BG Image (Atom — background)
├── Cover (Atom — dim overlay)
└── Bìa (Organism — centered content container)
    └── Frame 487
        └── Frame 523
            └── Countdown time (Organism)
                ├── Label "Sự kiện sẽ bắt đầu sau" (Atom — Text)
                └── Time (Molecule — row of segments)
                    ├── 1_Days (Molecule)
                    │   ├── Frame 485 (row of two flip-cards)
                    │   │   ├── Group 5 (Instance: digit flip-card, componentId 186:2619)
                    │   │   └── Group 4 (Instance: digit flip-card, componentId 186:2619)
                    │   └── DAYS (Atom — label)
                    ├── 2_Hours (Molecule, same structure)
                    └── 3_Minutes (Molecule, same structure)
```

### Main Components

| Component | Type | Node ID | Description | Reusable |
|-----------|------|---------|-------------|----------|
| MM_MEDIA_BG Image | Atom | 2268:35129 | Full-bleed brand background image | No (page-specific) |
| Cover | Atom | 2268:35130 | Dimming overlay rectangle | Yes |
| Bìa | Organism | 2268:35131 | Centered content container | No |
| Countdown time | Organism | 2268:35136 | Whole countdown block (label + timer) | Yes (also embedded in Homepage SAA hero) |
| Time | Molecule | 2268:35138 | Row of D/H/M segments | Yes |
| 1_Days / 2_Hours / 3_Minutes segment | Molecule | 2268:35139 / 2268:35144 / 2268:35149 | Two flip-cards + unit label | Yes |
| Digit flip-card | Instance | componentId 186:2619 | Single-digit flip-card display | Yes (shared component) |

> The `Countdown time` organism here appears to share lineage with the embedded countdown inside Homepage SAA hero (frame `2167:9035` mms_B1_Countdown time). The digit flip-card component `186:2619` is reused.

---

## Form Fields (If Applicable)

N/A — no form, no input.

---

## API Mapping

### On Screen Load

| API | Method | Purpose | Response Usage |
|-----|--------|---------|----------------|
| /campaign/current | GET | Get campaign `start_at` (and `now` if server provides) to compute remaining time | Drives countdown target timestamp; also lets server tell client to dismiss when 0 |
| /server/time (optional) | GET | Authoritative current server time to prevent clock-skew exploits | Used to compute initial offset between client clock and server clock |

### On User Action

| Action | API | Method | Request Body | Response |
|--------|-----|--------|--------------|----------|
| (none — no interactive elements) | — | — | — | — |

### Error Handling

| Error Code | Message | UI Action |
|------------|---------|-----------|
| 5xx on `/campaign/current` | Cannot determine launch time | Show static "Sự kiện sẽ bắt đầu sau" with placeholder `00 : 00 : 00`; retry with backoff |
| Network offline | — | Continue ticking from last known target; resync when network returns |

---

## State Management

### Local State

| State | Type | Initial | Purpose |
|-------|------|---------|---------|
| targetAt | ISO string \| null | null | Campaign start timestamp from `/campaign/current` |
| now | number (ms) | `Date.now()` | Updated every 1s by interval |
| remaining | `{ days, hours, minutes, seconds }` | computed | Drives the three flip-card segments |
| isPastTarget | boolean | false | When true, fire redirect logic |

### Global State (If Applicable)

| State | Store | Read/Write | Purpose |
|-------|-------|------------|---------|
| campaign | campaignStore | Read | Source of `start_at` so it can be reused on Login / Homepage SAA without refetch |
| session | authStore | Read | Determines redirect target when timer hits zero (Login vs Homepage SAA) |

---

## UI States

### Loading State
- Show the layout with placeholder digits `00 : 00 : 00` and the static label until `/campaign/current` resolves.

### Error State
- Same placeholder — never block visually; retry the campaign fetch silently with exponential backoff.

### Success State (i.e., countdown reaches zero)
- Stop the interval.
- Re-check session via `/auth/session`:
  - If authenticated → redirect to Homepage SAA (`/`).
  - If unauthenticated → redirect to Login (`/login`).
- Optional: fade-out transition before route change.

### Empty State
- N/A.

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Screen reader | Announce remaining time politely; mark numeric region with `aria-live="polite"` and a human-readable label (e.g., "2 days, 5 hours, 12 minutes until event start") |
| Reduced motion | Respect `prefers-reduced-motion` — skip flip animation, cross-fade digits instead |
| Color contrast | Ensure label and digits maintain WCAG AA contrast against the background image (cover overlay handles this) |
| Keyboard navigation | No focusable elements — page is non-interactive |

---

## Responsive Behavior

Out of scope for screenflow phase — desktop frame only is provided (1512px wide). Mobile responsive variant (if any) to be confirmed.

---

## Analytics Events (Optional)

| Event | Trigger | Properties |
|-------|---------|------------|
| prelaunch_view | On mount | `{ campaign_id, remaining_seconds }` |
| prelaunch_unlock | Countdown reaches 0 | `{ campaign_id }` |

---

## Implementation Notes

### Dependencies
- Date library: native `Date` or `date-fns` for diff calc
- Interval: `setInterval(1000)` driving render, plus periodic resync with `/campaign/current` every ~60s to correct drift

### Special Considerations
- Client clock can be wrong / manipulated — always trust server-supplied `start_at` (and ideally `server_now`) to compute offset on mount; tick locally from that offset.
- The design only shows Days / Hours / Minutes (no Seconds). Confirm with design whether seconds should also tick visibly or only every minute.
- Gate logic must live at the route/middleware level so it intercepts ALL entry points (`/`, `/login`, deep links) — not just one route.
- When countdown reaches zero, redirect target must be decided by session state, not hard-coded.
- Reuse the digit flip-card component (`186:2619`) and `Countdown time` organism so it stays consistent with the embedded countdown in the Homepage SAA hero.

---

## Analysis Metadata

| Property | Value |
|----------|-------|
| Analyzed By | Screen Flow Discovery (momorph.screenflow) |
| Analysis Date | 2026-05-12 |
| Needs Deep Analysis | No (single-purpose passive screen) |
| Confidence Score | High for structure / Medium for outgoing redirects (logic-only, no UI element to confirm) |

### Next Steps
- [ ] Confirm with backend: does `/campaign/current` expose `start_at`, `end_at`, AND `server_now`?
- [ ] Confirm gating policy: is the prelaunch gate applied even for admins, or do admins bypass it?
- [ ] Confirm mobile layout (no mobile frame surfaced in this run).
- [ ] Confirm whether the "Countdown time" organism here is the same shared component used in Homepage SAA hero (`mms_B1_Countdown time` frame `2167:9035`) or a visual sibling.
- [ ] Decide post-launch behavior: hard route swap, vs. soft refresh of session + re-render.
