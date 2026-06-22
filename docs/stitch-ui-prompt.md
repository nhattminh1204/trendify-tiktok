# Trendify — Stitch UI Generation Specification
### Version 2.0 — Optimized for Screen-by-Screen Generation

> **HOW TO USE THIS DOCUMENT**
> Each screen section is fully self-contained. Copy the entire screen section (from its `---` divider to the next) and paste it into Stitch. Every screen includes its own Global Context block so Stitch can generate a consistent UI without needing other sections. Do not strip the Global Context block — it is required for visual consistency.

---

# PART 1 — GLOBAL PRODUCT VISION

## Product Identity

**Trendify** is a premium AI-powered Creator Intelligence Platform and operating system for professional TikTok creators. It aggregates real-time trend data, audience insights, content planning, and AI generation into a single unified workspace.

## Product Personality

- **Intelligent** — data-forward, metrics-first, never decorative without purpose
- **Professional** — used by serious creators and agencies, not a consumer toy
- **Calm and confident** — no anxiety-inducing red everywhere; warnings are rare and intentional
- **Fast** — every interaction should feel instant; loading states are brief and elegant
- **Trustworthy** — data presented with context, no dark patterns, pricing transparent

## Visual Philosophy

Inspired by **Linear** (density + keyboard-first), **Stripe** (data clarity + type hierarchy), **Notion** (content-first layout), and **Vercel** (dark/light polish, clean deployment UX). The result: a clean, high-information-density SaaS dashboard that respects the user's attention. No gradients except on illustrations. No heavy drop shadows. No unnecessary animations. Every pixel has a reason.

## UX Philosophy

- **Progressive disclosure** — show the most important information first; details on demand
- **2-click rule** — any primary action reachable within 2 clicks from dashboard
- **Immediate feedback** — every mutation shows an optimistic update or loading indicator
- **Scannable layouts** — users should extract key information in under 5 seconds per screen
- **Consistent spatial rhythm** — same padding, same gaps, same type scale across all screens

## Information Density

Medium-high. Similar to Stripe Dashboard or Linear. Cards contain real data, not empty space. Tables are compact. Labels are short and uppercase-tracked. White space is used intentionally for grouping, not padding.

## Interaction Philosophy

- Hover states on all interactive elements (no mystery clicks)
- Focus rings visible for keyboard users (brand-color ring)
- Disabled states clearly communicated (opacity-50, cursor-not-allowed)
- Destructive actions always require confirmation
- Forms validate inline on blur, not on submit only

---

# PART 2 — GLOBAL DESIGN SYSTEM

> This is the single source of truth for all visual decisions. Every screen references this section.

## 2.1 Color Palette

| Token | Hex | Usage |
|---|---|---|
| `brand-500` | `#6366F1` | Progress bars, icons, focus rings |
| `brand-600` | `#4F46E5` | Primary buttons, active nav text |
| `brand-700` | `#4338CA` | Button hover |
| `brand-50` | `#EEF2FF` | Active nav background, AI card tint |
| `brand-100` | `#E0E7FF` | Badge backgrounds |
| `gray-900` | `#111827` | Primary text, headings |
| `gray-700` | `#374151` | Secondary headings |
| `gray-600` | `#4B5563` | Body text |
| `gray-500` | `#6B7280` | Secondary text, labels |
| `gray-400` | `#9CA3AF` | Muted text, placeholders |
| `gray-300` | `#D1D5DB` | Input borders |
| `gray-200` | `#E5E7EB` | Card borders, dividers |
| `gray-100` | `#F3F4F6` | Subtle backgrounds, badge bg |
| `gray-50` | `#F9FAFB` | Page background |
| `white` | `#FFFFFF` | Card surface, sidebar |
| `green-600` | `#16A34A` | Success text |
| `green-100` | `#DCFCE7` | Success badge bg |
| `amber-600` | `#D97706` | Warning text |
| `amber-50` | `#FFFBEB` | Warning card bg |
| `amber-200` | `#FDE68A` | Warning border |
| `red-600` | `#DC2626` | Danger text |
| `red-50` | `#FEF2F2` | Danger card bg |
| `blue-600` | `#2563EB` | Info text |
| `blue-100` | `#DBEAFE` | Info badge bg |
| `violet-600` | `#7C3AED` | AI features text |
| `violet-50` | `#F5F3FF` | AI insight card bg |
| `violet-200` | `#DDD6FE` | AI border |
| `purple-600` | `#9333EA` | Scheduled content |
| `purple-100` | `#F3E8FF` | Scheduled badge bg |

## 2.2 Typography

**Font family:** Inter (Google Fonts), weights 400/500/600/700.

| Role | Size | Weight | Color |
|---|---|---|---|
| Page title | 24px | 700 | gray-900 |
| Section heading | 18px | 600 | gray-900 |
| Card title | 14px | 500 | gray-900 |
| Body | 14px | 400 | gray-600 |
| Label/caption | 12px | 500 | gray-500 |
| Badge text | 11px | 500 | — |
| Table header | 12px | 500 uppercase letter-spacing 0.05em | gray-500 |
| Metric value | 28–30px | 700 | gray-900 |
| Stat value | 22px | 700 | gray-900 |
| Subtitle | 14px | 400 | gray-500 |

Line height: 1.5 for body, 1.2 for headings.

## 2.3 Spacing System

Base unit: 4px. All spacing uses multiples.

| Token | Value |
|---|---|
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-5` | 20px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-12` | 48px |
| `space-16` | 64px |

Card padding: 16–20px. Section gap: 24–32px. Grid gap: 16px. Form field gap: 16px.

## 2.4 Border Radius

| Element | Radius |
|---|---|
| Cards, panels | 12px |
| Buttons, inputs | 8px |
| Badges, pills | 9999px |
| Tooltips | 6px |
| Modals | 16px |
| Avatar | 9999px |

## 2.5 Shadows

| Level | Value | Usage |
|---|---|---|
| Card | `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)` | Default cards |
| Elevated | `0 4px 12px rgba(0,0,0,0.10), 0 2px 4px rgba(0,0,0,0.06)` | Modals, dropdowns |
| Focused | `0 0 0 3px rgba(99,102,241,0.2)` | Input/button focus ring |

## 2.6 Buttons

All buttons: height 36px, border-radius 8px, font 14px/500, padding 0 16px, transition 150ms.

| Variant | Background | Text | Border | Hover |
|---|---|---|---|---|
| Primary | `#4F46E5` | white | none | `#4338CA` |
| Secondary | white | gray-700 | gray-200 | bg gray-50 |
| Ghost | transparent | gray-600 | none | bg gray-100 |
| Danger | `#DC2626` | white | none | `#B91C1C` |
| AI/Violet | `#7C3AED` | white | none | `#6D28D9` |
| Link | transparent | brand-600 | none | underline |

**Size variants:**
- Large: height 40px, padding 0 20px, font 15px
- Small: height 28px, padding 0 10px, font 12px

**States:** disabled → opacity 0.5 + cursor-not-allowed. Loading → spinner 14px + label "Loading…"

## 2.7 Form Inputs

Height: 36px. Border: 1px solid gray-300. Radius: 8px. Padding: 8px 12px. Font: 14px, gray-900. Background: white.

- Placeholder: gray-400
- Focus: border brand-500 + shadow focused (see 2.5)
- Error: border red-500 + error message 12px red-600 below field
- Disabled: bg gray-50, cursor-not-allowed, opacity 0.7

**Select:** same as input + chevron-down icon right-aligned.
**Textarea:** min-height 80px, resize-y.
**Toggle switch:** track 44×24px, thumb 20px circle white, off=gray-200, on=brand-500.

## 2.8 Badges & Status Pills

Padding: 2px 8px. Border-radius: 9999px. Font: 11px/500.

| Semantic | Background | Text |
|---|---|---|
| success / published | green-100 | green-700 |
| warning / declining | amber-100 | amber-700 |
| danger / critical | red-100 | red-700 |
| info / rising | blue-100 | blue-700 |
| default / draft | gray-100 | gray-600 |
| brand / primary | brand-100 | brand-700 |
| scheduled | purple-100 | purple-700 |
| AI | violet-100 | violet-700 |
| peaked | green-100 | green-700 |
| expired | gray-100 | gray-500 |

## 2.9 Cards

Standard card: bg white, border 1px solid gray-200, border-radius 12px, padding 16–20px, shadow card (see 2.5).

**Interactive card** (hover state): border-color brand-400, cursor pointer, transition 150ms.

**Highlight card** (AI/insight): bg violet-50, border violet-200.

**Warning card:** bg amber-50, border amber-200.

**Danger zone card:** bg red-50, border red-200.

## 2.10 Tables

Container: border gray-200, border-radius 12px, overflow-x auto.

Header row: bg gray-50, border-bottom gray-100. Cells: padding 12px 16px, font 12px/500 uppercase tracking-wide, gray-500.

Body rows: bg white, border-bottom gray-100, hover bg gray-50/50. Cells: padding 12px 16px, font 14px, gray-700.

Zebra striping: optional, very subtle (gray-50 on alternate rows).

## 2.11 Empty States

Container: padding 64px 24px, text-align center.

Structure: icon (48px, gray-300) → title (16px/500, gray-500) → subtitle (14px, gray-400) → optional CTA button.

## 2.12 Loading / Skeleton States

Skeleton block: bg gray-100, border-radius matching content, animation pulse (opacity 0.4→0.8→0.4 cycle 1.5s). Never use spinner alone for full-page loads.

Inline spinner: 16px circle, brand-500 stroke, 1 turn/0.8s.

## 2.13 Modals

Overlay: bg rgba(0,0,0,0.4), backdrop-filter blur(2px). Dialog: bg white, border-radius 16px, shadow elevated, max-width 480px, padding 24px. Header: title 18px/600 + × button top-right. Footer: button row right-aligned. ESC closes. Click outside closes (non-destructive only).

## 2.14 Toast Notifications

Position: bottom-right, offset 24px. Width: 360px. Border-radius: 12px. Shadow: elevated. Auto-dismiss: 4s. Stack up to 3.

| Type | Icon | Colors |
|---|---|---|
| Success | check-circle | bg green-50, border green-200, text green-800 |
| Error | x-circle | bg red-50, border red-200, text red-800 |
| Info | info | bg blue-50, border blue-200, text blue-800 |
| Warning | alert-triangle | bg amber-50, border amber-200, text amber-800 |

## 2.15 Progress Bars

Track: bg gray-100, border-radius 9999px. Fill: brand-500 (normal) / amber-500 (warning, >80%) / red-500 (critical, >95%). Height variants: 6px (default), 8px (medium), 12px (large). Transition: width 300ms ease.

## 2.16 Responsive Breakpoints

| Name | Min-width | Grid | Sidebar |
|---|---|---|---|
| Mobile | 0 | 1 col | Hidden (overlay drawer) |
| Tablet | 640px | 2 col | Hidden (overlay drawer) |
| Desktop | 1024px | 3–4 col | Fixed 256px |

---

# PART 3 — GLOBAL APPLICATION SHELL

> Every dashboard and settings screen uses this shell. Auth, onboarding, error, and marketing screens do NOT use this shell.

## 3.1 Sidebar

**Dimensions:** width 256px, height 100vh, position fixed left-0.
**Background:** white. **Right border:** 1px solid gray-200.
**Layout:** flex-col, no scroll.

**Logo Block** (top, padding 24px 20px, border-bottom gray-100):
- "Trendify" — 20px/700, gray-900
- "Creator OS" — 12px/400, gray-500
- Row: logo mark (optional icon 20px brand-500) + text stack

**Navigation** (padding 12px, flex-1):
Each nav item: `display flex, align-items center, gap 10px, padding 8px 12px, border-radius 8px, font 14px/500, transition 150ms`

| State | Background | Text | Icon |
|---|---|---|---|
| Default | transparent | gray-600 | gray-400 |
| Hover | gray-100 | gray-900 | gray-600 |
| Active | brand-50 (#EEF2FF) | brand-700 (#4338CA) | brand-600 |

Icons: 16×16px, stroke-width 1.75, Lucide icon set.

**Nav items in order:**
1. Layout Dashboard → **Dashboard** (`/dashboard`)
2. TrendingUp → **Trends** (`/dashboard/trends`)
3. Users → **Audience** (`/dashboard/audience`)
4. Lightbulb → **Content** (`/dashboard/content`)
5. BarChart3 → **Analytics** (`/dashboard/analytics`)
6. GraduationCap → **Learning** (`/dashboard/learning`)
7. Zap → **AI Engine** (`/dashboard/ai`)
8. — divider (1px gray-100, margin 8px 12px) —
9. Settings → **Settings** (`/settings/account`)

**User Block** (bottom, padding 12px, border-top gray-100):
- Avatar 32px circle (bg brand-100, initials brand-700, 12px/600) + display name (14px/500, gray-900) + email (12px, gray-500, truncate)
- LogOut icon button (16px, gray-400, hover gray-600) — right-aligned

## 3.2 Topbar

**Dimensions:** height 56px, position sticky top-0, z-index 10.
**Background:** white. **Bottom border:** 1px solid gray-100.
**Layout:** flex, align-items center, justify-content space-between, padding 0 32px.

**Left side:** Current page title (16px/600, gray-900).

**Right side** (flex, gap 8px, align-items center):
- **Search button** (optional): icon Search 16px, ghost button, placeholder "Search… ⌘K"
- **Notification bell**: icon Bell 18px, gray-500, hover gray-900. If unread notifications: red dot badge 8px top-right of icon (red-500 bg).
- **Avatar 32px** circle + chevron-down icon. Click → dropdown menu (shadow elevated, border gray-200, rounded-lg, 160px wide):
  - "Account Settings" → `/settings/account`
  - divider
  - "Sign out" (text red-600)

## 3.3 Main Content Area

**Layout:** margin-left 256px (sidebar width). Padding-top 56px (topbar height).
**Inner:** padding 32px. Max-width 1280px, margin 0 auto.
**Background:** gray-50 (#F9FAFB).
**Overflow:** overflow-y auto.

## 3.4 Responsive Shell Behavior

**Desktop (≥1024px):** Sidebar fixed, topbar full-width (minus sidebar), content with left margin.

**Tablet (640–1023px):** Sidebar hidden. Topbar shows hamburger icon (left) + "Trendify" logo (center) + bell + avatar (right). Sidebar becomes overlay drawer (slides in from left, backdrop overlay).

**Mobile (<640px):** Same as tablet. Content padding reduced to 16px.

---

# PART 4 — SCREEN TEMPLATE

Every screen section in this document follows this template. When copying into Stitch, include the complete section.

```
## Screen N — [Name]
URL: [route]
Shell: [Dashboard Shell | Standalone | Settings Shell]

### GLOBAL CONTEXT
[Self-contained design system + shell reminder — always include when pasting into Stitch]

### SCREEN PURPOSE
[UX goal: what should the user achieve, and how fast]

### LAYOUT
[Overall page structure]

### COMPONENTS
[Detailed component specifications]

### STATES
[Loading, Empty, Error, Success states]

### RESPONSIVE BEHAVIOR
[Per-breakpoint layout changes]
```

---

# PART 5 — SCREENS

---

## Screen 1 — Login

**URL:** `/login`
**Shell:** Standalone (no sidebar, no topbar)

---

### GLOBAL CONTEXT

> Copy this block into every Stitch prompt for consistent output.

**Product:** Trendify — AI-powered Creator OS for TikTok. Premium SaaS, professional quality. Inspired by Linear, Stripe, Notion, Vercel.
**Font:** Inter. All weights.
**Page BG:** `#F9FAFB` (gray-50). Card surface: `#FFFFFF`.
**Brand:** `#4F46E5` buttons / `#6366F1` accents / `#EEF2FF` light tint.
**Text:** `#111827` primary / `#6B7280` secondary / `#9CA3AF` muted.
**Borders:** `#E5E7EB`. Inputs: `#D1D5DB`.
**Radius:** Cards 12px, Buttons & Inputs 8px, Badges 9999px.
**Buttons — Primary:** bg `#4F46E5`, text white, hover `#4338CA`, height 36px, radius 8px, font 14px/500.
**Cards:** bg white, border `#E5E7EB`, radius 12px, shadow `0 1px 3px rgba(0,0,0,0.08)`.
**Inputs:** border `#D1D5DB`, radius 8px, height 36px, padding 8px 12px, focus ring brand-500.
**This screen has no sidebar or topbar.** Full-screen centered layout.

---

### SCREEN PURPOSE

Users must be able to sign in to their workspace within 3 interactions: enter email → enter password → click sign in. The screen must feel premium and trustworthy, matching the quality of a Stripe or Linear login page. First impression of the product.

---

### LAYOUT

Full-screen, `min-height: 100vh`, background gray-50, flex center both axes, padding 48px 16px.

Vertical stack centered, max-width 448px, width 100%:
1. Brand block (top)
2. Form card

---

### COMPONENTS

**Brand Block** (margin-bottom 32px, text-align center):
- Logo mark: optional icon or stylized "T" in brand-600, 40px
- "Trendify" — 30px/700, gray-900
- Subtitle: "Sign in to your Creator OS" — 14px/400, gray-600, margin-top 8px

**Form Card** (bg white, border gray-200, radius 12px, shadow card, padding 32px):

*Error Alert* (conditional — only when auth fails):
- bg red-50, border red-200, radius 8px, padding 12px 16px, margin-bottom 20px
- Icon AlertCircle 16px red-500 (inline left) + error message text 14px red-700

*Email field:*
- Label: "Email" — 14px/500, gray-700, margin-bottom 6px
- Input: type email, placeholder `you@example.com`
- Validation error below: 12px, red-600, margin-top 4px

*Password field* (margin-top 16px):
- Label: "Password" — 14px/500, gray-700
- Input: type password, placeholder `••••••••`
- Validation error below: 12px, red-600

*Submit Button* (margin-top 24px, full-width, height 40px):
- Default: "Sign in" — primary button style
- Loading: spinner 14px + "Signing in…" — opacity 0.7

*Footer* (margin-top 20px, text-align center):
- "No account? " + "Create workspace" link — 14px, link brand-600, hover underline

---

### STATES

**Default:** empty form, no errors.
**Loading:** button disabled + spinner, inputs disabled.
**Error:** red alert banner above form with server error message.
**Field error:** red border on invalid field + 12px error message below.

---

### RESPONSIVE BEHAVIOR

**Desktop:** centered card, max-width 448px.
**Tablet/Mobile:** full-width card with 16px horizontal margin, padding reduced to 24px.

---

## Screen 2 — Register

**URL:** `/register`
**Shell:** Standalone (no sidebar, no topbar)

---

### GLOBAL CONTEXT

**Product:** Trendify — AI-powered Creator OS for TikTok. Premium SaaS. Inspired by Linear, Stripe, Notion, Vercel.
**Font:** Inter. **Page BG:** `#F9FAFB`. **Card surface:** `#FFFFFF`.
**Brand:** `#4F46E5` buttons / `#6366F1` accents / `#EEF2FF` light tint.
**Text:** `#111827` / `#6B7280` / `#9CA3AF`. **Borders:** `#E5E7EB`. **Input borders:** `#D1D5DB`.
**Radius:** Cards 12px, Buttons & Inputs 8px, Badges 9999px.
**Primary button:** bg `#4F46E5`, text white, hover `#4338CA`, height 36px, radius 8px, font 14px/500.
**Cards:** bg white, border `#E5E7EB`, radius 12px, shadow `0 1px 3px rgba(0,0,0,0.08)`.
**Inputs:** border `#D1D5DB`, radius 8px, height 36px, padding 8px 12px, focus ring brand-500.
**No sidebar or topbar.** Full-screen centered layout.

---

### SCREEN PURPOSE

New creators set up their workspace in one flow. Must feel welcoming but professional — the promise of a powerful tool starts here. User should complete registration in under 90 seconds. The niche selector helps personalize the experience immediately.

---

### LAYOUT

Full-screen, min-height 100vh, bg gray-50, flex center, padding 48px 16px.

Vertical stack, max-width 448px:
1. Header block
2. Form card

---

### COMPONENTS

**Header Block** (margin-bottom 32px, text-align center):
- "Create your Creator OS" — 30px/700, gray-900
- "Set up your Trendify workspace" — 14px/400, gray-600, margin-top 8px

**Form Card** (bg white, border gray-200, radius 12px, shadow, padding 32px):

*Error Alert* (conditional): same style as Screen 1.

*Workspace name field:*
- Label: "Workspace name" — 14px/500, gray-700
- Input: text, placeholder `My Creator Brand`
- Validation error: 12px red-600

*Email field* (margin-top 16px):
- Label: "Email" — Input: type email, placeholder `you@example.com`

*Password field* (margin-top 16px):
- Label: "Password"
- Input: type password, placeholder `••••••••`
- Helper text below: "Min 8 characters, 1 uppercase, 1 number" — 12px, gray-400
- **Password strength bar** (shows after user starts typing, margin-top 8px):
  - Track: 4 equal segments, radius 2px, gap 4px, height 4px
  - Weak (1 segment red-400) / Fair (2 segments amber-400) / Good (3 segments blue-400) / Strong (4 segments green-500)
  - Label right: "Weak" / "Fair" / "Good" / "Strong" — 11px, matching color

*Primary niche field* (margin-top 16px):
- Label: "Primary niche" + "(optional)" — gray-400, font-normal
- Select dropdown: "Select niche" placeholder + options: Fitness / Cooking / Tech / Beauty / Finance / Education / Entertainment

*Submit button* (margin-top 24px, full-width, height 40px):
- "Create workspace" | Loading: "Creating workspace…"

*Footer* (margin-top 20px, center):
- "Already have an account? " + "Sign in" link — brand-600

---

### STATES

Same pattern as Screen 1. Additional: password strength bar appears dynamically as user types.

---

### RESPONSIVE BEHAVIOR

Same as Screen 1. Form fields stack vertically on all breakpoints.

---

## Screen 3 — Onboarding Wizard

**URL:** `/onboarding`
**Shell:** Standalone (no sidebar, no topbar)

---

### GLOBAL CONTEXT

**Product:** Trendify — AI-powered Creator OS for TikTok. Premium SaaS. Inspired by Linear, Stripe, Notion, Vercel.
**Font:** Inter. **Page BG:** `#F9FAFB`. **Card surface:** `#FFFFFF`.
**Brand:** `#4F46E5` buttons / `#6366F1` accents / `#EEF2FF` light tint.
**Text:** `#111827` / `#6B7280` / `#9CA3AF`. **Borders:** `#E5E7EB`. **Input borders:** `#D1D5DB`.
**Radius:** Cards 12px, Buttons & Inputs 8px, Badges 9999px.
**Primary button:** bg `#4F46E5`, text white, height 40px, full-width for CTAs.
**Cards:** bg white, border `#E5E7EB`, radius 12px, shadow `0 1px 3px rgba(0,0,0,0.08)`.
**Selection card (active):** border `#6366F1`, bg `#EEF2FF`.
**No sidebar or topbar.** Full-screen centered, max-width 600px.

---

### SCREEN PURPOSE

Guide new users to a working, personalized workspace in 4 steps without friction. Each step must be completable in under 10 seconds. Users who complete onboarding activate more features and retain longer. The wizard must feel fast and rewarding, not like a form.

---

### LAYOUT

Full-screen, min-height 100vh, bg gray-50, flex center, padding 48px 16px.

Vertical stack, max-width 600px, width 100%:
1. Step indicator (top)
2. Step content card

---

### COMPONENTS

**Step Indicator** (margin-bottom 32px):
Horizontal row, centered, flex gap 0:
```
  ①——②——③——④
```
Each step node: circle 32px, border-radius 9999px, font 14px/600.
- Completed step: bg brand-600, text white, icon Check 14px inside
- Current step: bg brand-600, text white, number
- Future step: bg white, border 2px gray-200, text gray-400, number

Connector line between nodes: height 2px, flex-1.
- Completed connector: bg brand-600
- Future connector: bg gray-200

Step labels below circles: 12px/500, completed=brand-600, current=gray-900, future=gray-400.
Labels: "Welcome" / "Connect TikTok" / "Choose Niche" / "Done"

---

**Step 1 — Welcome** (card, padding 48px 40px, text-align center):
- Emoji or illustration: "🎉" at 64px (or svg illustration, brand colors)
- Title: "Welcome to Trendify" — 28px/700, gray-900, margin-top 16px
- Body: "Your AI-powered TikTok Creator OS is ready. Let's set things up in 3 quick steps." — 16px/400, gray-600, margin-top 12px, max-width 360px
- Button "Let's go →" — primary, full-width, height 40px, margin-top 32px
- "Skip setup" link — 14px, gray-400, text-align center, margin-top 12px

**Step 2 — Connect TikTok** (card, padding 48px 40px, text-align center):
- TikTok logo icon 40px (black)
- Title: "Connect your TikTok account" — 24px/700, gray-900
- Body: "We'll use this to pull analytics, audience data, and trend performance." — 14px, gray-600, max-width 340px, margin 12px auto
- Button "Connect TikTok" — primary, full-width, height 40px, icon TikTok left
  - Loading state: spinner + "Connecting…"
  - Success state: icon CheckCircle green-500 (20px) + "@username connected" — 16px/500, green-700, bg green-50, border green-200, padding 12px 16px, radius 8px (replaces button temporarily) + "Continue →" button appears
- "I'll connect later" link — 14px, gray-400, margin-top 12px

**Step 3 — Choose Niche** (card, padding 40px):
- Title: "What's your content niche?" — 22px/700, gray-900
- Subtitle: "We'll personalize trend recommendations for you." — 14px, gray-500, margin-top 8px, margin-bottom 24px

Niche grid (2 columns, gap 12px):
Each niche card (padding 16px 12px, border gray-200, radius 12px, cursor pointer, text-align center, flex-col gap 8px):
- Emoji icon 28px
- Label 13px/500, gray-700
- Unselected: bg white, border gray-200
- Selected: bg brand-50, border brand-500, check badge (brand-600, 16px) top-right corner

Niche options: 🏋️ Fitness / 🍳 Cooking / 💻 Tech / 💄 Beauty / 💰 Finance / 🎓 Education / 🎭 Entertainment / 🎮 Gaming

"Continue →" button — primary, full-width, height 40px, margin-top 24px, disabled (opacity 0.5) if no niche selected.

**Step 4 — Done** (card, padding 48px 40px, text-align center):
- Icon CheckCircle2 56px, green-500
- Title: "You're all set!" — 28px/700, gray-900, margin-top 16px
- Body: "Your workspace is ready. Start exploring trending content opportunities." — 14px, gray-600, margin-top 8px

Mini stats row (3 cards, margin 24px 0, flex gap 12px):
Each stat card (bg gray-50, border gray-100, radius 8px, padding 12px, text-align center):
- Value: 18px/700, gray-900
- Label: 12px, gray-500
- Stats: "1,240+" trends tracked / "3" AI models ready / "{niche}" your niche

"Go to Dashboard →" button — primary, full-width, height 40px.

---

### STATES

Step 2 connect: idle → loading → success/error. Step 3: niche grid select/deselect. Step 4: always success state.

---

### RESPONSIVE BEHAVIOR

Card width: max 600px, full-width on mobile (16px margin). Niche grid: 2 cols on all sizes. Step labels hidden on mobile (show only numbers). Step 4 stats: column on mobile.

---

## Screen 4 — TikTok OAuth Callback

**URL:** `/auth/tiktok/callback`
**Shell:** Standalone (no sidebar, no topbar)

---

### GLOBAL CONTEXT

**Product:** Trendify — AI-powered Creator OS for TikTok. Premium SaaS. Inspired by Linear, Stripe, Notion, Vercel.
**Font:** Inter. **Page BG:** `#F9FAFB`. **Surface:** `#FFFFFF`.
**Brand:** `#4F46E5` / `#6366F1` / `#EEF2FF`. **Text:** `#111827` / `#6B7280` / `#9CA3AF`.
**Borders:** `#E5E7EB`. **Radius:** Cards 12px, Buttons 8px.
**Primary button:** bg `#4F46E5`, text white, height 40px, radius 8px.
**Success:** green-500 `#22C55E`. **Error:** red-500 `#EF4444`.
**No sidebar or topbar.** Full-screen centered.

---

### SCREEN PURPOSE

A transitional screen. Users should not have to do anything — the process is automatic. The UI must communicate clearly that something is happening, that it succeeded, or that it failed. Confusion here breaks the onboarding flow.

---

### LAYOUT

Full-screen, min-height 100vh, bg gray-50, flex center (both axes), padding 24px.

Centered content block: max-width 400px, text-align center.

---

### COMPONENTS

**State 1 — Processing (default on page load):**
- Spinner: 48px circle, stroke brand-500, stroke-width 3, rotation animation 0.8s linear infinite
- Title: "Connecting your TikTok account…" — 20px/600, gray-900, margin-top 20px
- Subtitle: "Please wait a moment" — 14px, gray-500, margin-top 8px

**State 2 — Success (replace after ~1.5s):**
- Icon: CheckCircle2 56px, green-500 (filled), with subtle scale-in animation
- Title: "TikTok connected!" — 24px/700, gray-900
- Subtitle: "@username has been linked to your workspace." — 14px, gray-600, margin-top 8px
- Auto-redirect countdown: "Redirecting in 3s…" — 12px, gray-400, margin-top 16px
- OR Button "Go to Dashboard" — primary, margin-top 20px (appears if redirect fails)

**State 3 — Error:**
- Icon: XCircle 56px, red-500, with subtle shake animation
- Title: "Connection failed" — 24px/700, gray-900
- Subtitle: "We couldn't connect your TikTok account. Please try again." — 14px, gray-600
- Error detail (optional): code in gray-400, 12px
- Button "Try again" — primary, margin-top 24px
- Link "Back to settings" — ghost, brand-600, margin-top 8px

---

### STATES

Three mutually exclusive states: Processing → Success or Error. No other states exist on this screen.

---

### RESPONSIVE BEHAVIOR

Same on all breakpoints. Content block is centered and short enough to fit any screen.

---

## Screen 5 — Dashboard Home

**URL:** `/dashboard`
**Shell:** Dashboard Shell (sidebar + topbar)

---

### GLOBAL CONTEXT

**Product:** Trendify — AI-powered Creator OS for TikTok. Premium SaaS. Inspired by Linear, Stripe, Notion, Vercel.
**Font:** Inter. **Page BG:** `#F9FAFB`. **Card surface:** `#FFFFFF`.
**Brand:** `#4F46E5` buttons / `#6366F1` accents / `#EEF2FF` tint.
**Text:** `#111827` / `#6B7280` / `#9CA3AF`. **Borders:** `#E5E7EB`. **Input borders:** `#D1D5DB`.
**Radius:** Cards 12px, Buttons 8px, Badges 9999px. **Shadow:** `0 1px 3px rgba(0,0,0,0.08)`.
**Cards:** bg white, border `#E5E7EB`, radius 12px, padding 16–20px.
**Badges — rising:** blue-100/blue-700 | peaked: green-100/green-700 | declining: amber-100/amber-700 | expired: gray-100/gray-600.
**Progress bars:** track gray-100, fill brand-500, radius 9999px, height 6px.
**APPLICATION SHELL:** Left sidebar 256px fixed (bg white, border-right `#E5E7EB`). Logo "Trendify" 20px/700 + "Creator OS" 12px gray-500. Nav: Dashboard (active) / Trends / Audience / Content / Analytics / Learning / AI Engine / Settings. Active nav: bg `#EEF2FF`, text brand-700. Topbar 56px (bg white, border-bottom `#E5E7EB`): page title left, bell+avatar right. Main content: bg `#F9FAFB`, padding 32px, max-width 1280px.

---

### SCREEN PURPOSE

The command center. Users land here after login and should immediately understand: (1) how their budget is tracking, (2) what is trending right now in their niche. Time-to-insight target: under 5 seconds. Secondary goal: surface navigation to all modules.

---

### LAYOUT

Vertical stack, gap 32px, within main content area:
1. Page header
2. Quick stats row (4 cards)
3. AI Budget widget
4. Trending Now section

---

### COMPONENTS

**Page Header:**
- Title: "Dashboard" — 24px/700, gray-900
- Subtitle: "Your TikTok creator intelligence hub" — 14px, gray-500, margin-top 4px

**Quick Stats Row** (grid 4 columns, gap 16px):
Each card (bg white, border gray-200, radius 12px, padding 16px, flex align-center gap 12px):
- Icon block (32px circle, bg brand-50, flex center): Lucide icon 16px brand-600
- Text block: label 12px/500 uppercase gray-500 + value 20px/700 gray-900 below

Stats:
1. TrendingUp icon → "Trends Tracked" → `1,240`
2. Lightbulb icon → "Active Ideas" → `8`
3. Users icon → "Followers" → `124.5K`
4. Zap icon → "AI Budget Used" → `25%`

**AI Budget Widget** (full-width card):

*Normal state* (budget <80%) — bg white, border gray-200:
- Row: label "AI Budget this month" 14px/500 gray-700 (left) + value "$12.50 / $50.00" 14px/600 gray-900 (right)
- Progress bar (margin-top 10px): track gray-100 h-2 rounded-full, fill brand-500, width = spent%
- Footer row (margin-top 6px): "25.0% used" 12px gray-400 (left) + "$37.50 remaining" 12px gray-400 (right)

*Warning state* (budget ≥80%) — bg amber-50, border amber-200:
- Add AlertTriangle icon 16px amber-500 before label
- Progress bar fill: amber-500
- Text colors upgrade to amber-700

**Trending Now Section:**
- Section header row: "Trending Now" 18px/600 gray-900 (left) + "View all →" link 14px brand-600 hover underline (right)
- Margin-top 4px: subtitle "Live trend data · updated every 15 min" 12px gray-400

*Loading state:* Grid 3 cols, 6 skeleton cards h-24 bg gray-100 rounded-xl animate-pulse

*Data state:* Grid 1→2→3 cols (mobile→tablet→desktop), gap 16px

**Trend Mini-card** (bg white, border gray-200, radius 12px, padding 16px, hover border brand-400, cursor pointer, transition 150ms):
- Row top: "#keywordNoSpaces" 14px/600 gray-900 (left, truncate max-w-[160px]) + status badge (right)
- Row middle: "{niche} · {platform}" 12px gray-400, margin-top 4px
- Progress bar (margin-top 12px): Score bar, track gray-100, fill brand-500, h-1.5
- Row bottom: "Score" 11px gray-400 (left) + "{score}" 12px/600 gray-600 (right)

Status badge colors: rising=blue-100/blue-700, peaked=green-100/green-700, declining=amber-100/amber-700, expired=gray-100/gray-600.

---

### STATES

**Loading:** skeleton cards in Trending Now grid. Quick stats show skeleton too.
**Empty (no trends):** empty state in trending section — icon TrendingUp gray-300 40px + "No trends found yet." + subtitle.
**Budget warning:** amber card variant for budget widget.

---

### RESPONSIVE BEHAVIOR

Quick stats: 2 cols on tablet, 1 col on mobile. Trending grid: 1 col mobile, 2 col tablet, 3 col desktop.

---

## Screen 6 — Trend Intelligence List

**URL:** `/dashboard/trends`
**Shell:** Dashboard Shell (sidebar + topbar)

---

### GLOBAL CONTEXT

**Product:** Trendify — AI-powered Creator OS for TikTok. Premium SaaS. Inspired by Linear, Stripe, Notion, Vercel.
**Font:** Inter. **Page BG:** `#F9FAFB`. **Card surface:** `#FFFFFF`.
**Brand:** `#4F46E5` buttons / `#6366F1` accents / `#EEF2FF` tint.
**Text:** `#111827` / `#6B7280` / `#9CA3AF`. **Borders:** `#E5E7EB`.
**Radius:** Cards 12px, Buttons 8px, Badges 9999px. **Shadow:** `0 1px 3px rgba(0,0,0,0.08)`.
**Cards:** bg white, border `#E5E7EB`, radius 12px, padding 16px. Interactive card hover: border brand-400.
**Score bars:** track gray-100, fill brand-500, radius 9999px, h-1.5. Value 12px/600 gray-600 right-aligned.
**Status badges — rising:** blue-100/blue-700 | peaked: green-100/green-700 | declining: amber-100/amber-700 | expired: gray-100/gray-600.
**Filter pills — active:** bg `#4F46E5`, text white | inactive: bg white, border gray-200, text gray-600, hover border brand-400.
**APPLICATION SHELL:** Sidebar 256px fixed (Trends nav item active). Topbar: "Trend Intelligence" as page title. Main content bg `#F9FAFB`, padding 32px, max-width 1280px.

---

### SCREEN PURPOSE

Users should identify the top-performing trends in their niche within 5 seconds. Secondary goal: compare trend health (velocity vs engagement vs overall score) at a glance without clicking into detail. Filter by niche is the primary interaction.

---

### LAYOUT

Vertical stack, gap 24px:
1. Page header
2. Niche filter bar
3. Sort/filter secondary toolbar
4. Trend grid

---

### COMPONENTS

**Page Header:**
- Row: icon TrendingUp 22px brand-500 + "Trend Intelligence" 24px/700 gray-900 (inline flex, gap 8px)
- Subtitle: "Real-time TikTok trends scored by velocity, volume, and engagement." 14px gray-500, margin-top 4px

**Niche Filter Bar** (flex wrap, gap 8px, padding-bottom 4px, overflow-x auto, hide scrollbar):
Pills: "All" / "Fitness" / "Cooking" / "Tech" / "Beauty" / "Finance"
- Active pill: bg `#4F46E5`, text white, height 32px, padding 0 14px, radius 9999px, 13px/500
- Inactive pill: bg white, border gray-200, text gray-600, height 32px, hover border brand-400

**Secondary Toolbar** (flex, gap 12px, align-items center):
- Dropdown "Sort by": Score / Velocity / Engagement / Newest — secondary button with ChevronDown icon
- Dropdown "Status": All / Rising / Peaked / Declining — secondary button
- Spacer flex-1
- Result count: "124 trends" 13px gray-400

**Trend Grid** (grid 1→2→3 cols, gap 16px):

**Trend Card** (bg white, border gray-200, radius 12px, padding 16px, hover border brand-400, cursor pointer, transition 150ms):

*Card header* (flex, justify-between, align-start, margin-bottom 12px):
- Left: "#keywordNoSpaces" 14px/600 gray-900 (truncate) + "{niche} · {platform}" 12px gray-400 margin-top 3px
- Right: status badge (rounded-full, 11px/500)

*Score bars* (flex-col, gap 6px):
Each row (flex, align-center, gap 8px):
- Label: "Score" / "Velocity" / "Engagement" — 11px/500 gray-400, width 64px, flex-shrink 0
- Track: flex-1, bg gray-100, radius 9999px, h-1.5
- Fill: bg brand-500, h-1.5, radius 9999px, width = value%
- Value: 12px/600 gray-600, width 28px, text-right

*Card footer* (margin-top 12px, border-top gray-50, padding-top 10px):
- "View details →" — 12px brand-600, hover underline

**Empty state** (shown when no trends match filter):
- Icon SearchX 48px gray-300 + "No trends found for this niche yet." 15px/500 gray-500 + subtitle 13px gray-400

---

### STATES

**Loading:** grid of 9 skeleton cards, h-36 animate-pulse.
**Empty:** empty state component as above.
**Filtered empty:** same empty state with "Try a different niche or status filter."

---

### RESPONSIVE BEHAVIOR

Grid: 1 col mobile, 2 cols tablet, 3 cols desktop. Filter bar: horizontal scroll on mobile. Secondary toolbar: stacks vertically on mobile.

---

## Screen 7 — Trend Detail

**URL:** `/dashboard/trends/{id}`
**Shell:** Dashboard Shell (sidebar + topbar)

---

### GLOBAL CONTEXT

**Product:** Trendify — AI-powered Creator OS for TikTok. Premium SaaS. Inspired by Linear, Stripe, Notion, Vercel.
**Font:** Inter. **Page BG:** `#F9FAFB`. **Card surface:** `#FFFFFF`.
**Brand:** `#4F46E5` buttons / `#6366F1` accents / `#EEF2FF` tint.
**Text:** `#111827` / `#6B7280` / `#9CA3AF`. **Borders:** `#E5E7EB`.
**Radius:** Cards 12px, Buttons 8px, Badges 9999px. **Shadow:** `0 1px 3px rgba(0,0,0,0.08)`.
**AI Insight card:** bg `#F5F3FF` (violet-50), border `#DDD6FE` (violet-200), icon/text violet-600 `#7C3AED`.
**Score bars:** track gray-100, fill brand-500, h-2, radius 9999px.
**Status badges:** rising=blue-100/blue-700, peaked=green-100/green-700, declining=amber-100/amber-700, expired=gray-100/gray-600.
**APPLICATION SHELL:** Sidebar 256px fixed (Trends nav active). Topbar: "#fitnessmotivation" as page title. Main content bg `#F9FAFB`, padding 32px, max-width 1280px.

---

### SCREEN PURPOSE

Users drilled into a specific trend to understand its full performance profile and decide whether to create content around it. Decision should be possible within 10 seconds. The AI Insights block should be the most actionable element — it translates data into creator decisions.

---

### LAYOUT

Vertical stack, gap 24px, full-width:
1. Breadcrumb
2. Page header + action
3. Stats row (4 cards)
4. Score breakdown card
5. Trend timeline chart card
6. Related hashtags + AI Insights (2-col: 60% / 40%)

---

### COMPONENTS

**Breadcrumb:** "Trends" link gray-400 hover gray-700 + "/" gray-300 + "#fitnessmotivation" gray-600 — 13px, gap 6px

**Page Header** (flex, justify-between, align-start, flex-wrap, gap 16px):
Left:
- Title: "#fitnessmotivation" — 28px/700, gray-900
- Badge row (margin-top 8px, flex gap 8px, align-center): niche badge + platform badge + status badge + "Detected 3 days ago" 12px gray-400

Right:
- Button "Create content from this trend →" — primary button, icon Lightbulb 14px left

**Stats Row** (grid 4 cols, gap 16px):
Metric card (bg white, border gray-200, radius 12px, padding 20px):
- Label: 12px/500 uppercase tracking-wide gray-500
- Value: 28px/700 gray-900, margin-top 6px
- Sub-label (optional): 12px gray-400

Stats: Trend Score `87 / 100` / Velocity `+23% / day` / Engagement Rate `6.4%` / Est. Reach `2.4M`

**Score Breakdown Card** (bg white, border gray-200, radius 12px, padding 20px):
- Title: "Score Breakdown" 16px/600 gray-900
- 4 metric bars (flex-col gap 10px, margin-top 16px):
  Each row (flex, align-center, gap 12px):
  - Label: 13px/500 gray-600, width 80px
  - Track: flex-1, bg gray-100, h-2, radius 9999px
  - Fill: bg brand-500, h-2, width proportional to points
  - Points value: 13px/600 gray-700, width 36px text-right
  - Bars: Velocity 40pts / Volume 25pts / Engagement 20pts / Recency 15pts

**Trend Timeline Chart Card** (bg white, border gray-200, radius 12px, padding 20px):
- Title: "Score History (7 days)" 16px/600 gray-900
- Chart placeholder area (height 180px, bg gray-50, radius 8px, border gray-100):
  - Line chart: x-axis dates, y-axis score 0–100
  - Line color: brand-500, stroke-width 2
  - Area fill: brand-50 (very light)
  - Tooltip on hover: date + score (white card, shadow)
- If no historical data: placeholder text "Historical data coming soon" — 13px gray-400, centered in chart area

**Bottom Row** (grid 2 cols 60%/40%, gap 16px):

*Left — Related Hashtags card:*
- Title: "Related Hashtags" 16px/600
- Chip list (flex wrap, gap 8px, margin-top 12px): `#fitness` `#workout` `#gym` `#healthylifestyle` `#motivation`
  Each chip: bg gray-100, radius 9999px, padding 4px 12px, 13px/500 gray-700, hover bg gray-200

*Right — AI Insights card* (bg violet-50, border violet-200, radius 12px, padding 20px):
- Header (flex, gap 8px): icon Sparkles 16px violet-600 + "AI Insights" 15px/600 violet-800
- Bullet list (margin-top 12px, flex-col gap 8px):
  Each item (flex, gap 8px, align-start): dot 6px circle violet-400 (margin-top 6px) + text 13px gray-700
  - "Best time to post this trend: Thursday 7–9pm"
  - "Audience overlap with your followers: 68%"
  - "Recommended hook format: Question + Shock stat"
- CTA button (margin-top 16px, full-width): "✨ Generate content idea →" — bg violet-600, text white, radius 8px, height 36px, 13px/500

---

### STATES

**Loading:** all cards show skeleton. Chart area has pulsing gray block.
**No AI insights:** AI card shows "Generating insights…" with spinner.

---

### RESPONSIVE BEHAVIOR

Stats row: 2 cols on tablet, 1 col mobile. Bottom row: single column on tablet+mobile. Chart height reduces to 120px on mobile.

---

## Screen 8 — Audience Intelligence

**URL:** `/dashboard/audience`
**Shell:** Dashboard Shell (sidebar + topbar)

---

### GLOBAL CONTEXT

**Product:** Trendify — AI-powered Creator OS for TikTok. Premium SaaS. Inspired by Linear, Stripe, Notion, Vercel.
**Font:** Inter. **Page BG:** `#F9FAFB`. **Card surface:** `#FFFFFF`.
**Brand:** `#4F46E5` buttons / `#6366F1` accents / `#EEF2FF` tint.
**Text:** `#111827` / `#6B7280` / `#9CA3AF`. **Borders:** `#E5E7EB`.
**Radius:** Cards 12px, Buttons 8px, Badges 9999px. **Shadow:** `0 1px 3px rgba(0,0,0,0.08)`.
**Persona cards:** bg white, border gray-200, radius 12px, padding 20px.
**Interest tags:** bg gray-100, radius 9999px, padding 3px 10px, 12px gray-700.
**Progress bars (location):** track gray-100, fill brand-500, h-2, radius 9999px.
**Warning banner:** bg `#FFFBEB` (amber-50), border `#FDE68A` (amber-200), text amber-700, radius 12px.
**APPLICATION SHELL:** Sidebar 256px fixed (Audience nav active). Topbar: "Audience Intelligence" as page title. Main content bg `#F9FAFB`, padding 32px, max-width 1280px.

---

### SCREEN PURPOSE

Creators need to understand who is watching their content — not just follower counts but personas, interests, and geography. This powers better content targeting. Users should be able to identify their primary audience persona within 15 seconds.

---

### LAYOUT

Vertical stack, gap 24px:
1. Page header
2. Connect prompt (conditional) OR data content
3. Stats row
4. Audience Personas section
5. Top Locations section
6. Age Distribution section

---

### COMPONENTS

**Page Header:**
- Row: icon Users 22px brand-500 + "Audience Intelligence" 24px/700 gray-900
- Subtitle: "Deep understanding of who follows and engages with your content." 14px gray-500

**Connect Prompt** (when no TikTok connected — amber banner, full-width):
- Flex, align-center, gap 12px, padding 16px 20px, bg amber-50, border amber-200, radius 12px
- Icon AlertCircle 20px amber-600 + text "Connect a TikTok account to unlock audience insights." 14px amber-700 + Button "Connect TikTok" primary size-sm (inline right, ml-auto)

**Stats Row** (grid 4 cols, gap 16px — only shown when data exists):
Stat card (bg white, border gray-200, radius 12px, padding 16px):
- Label: 12px/500 uppercase gray-500
- Value: 22px/700 gray-900, margin-top 4px
- Stats: Total Followers `124,500` / 30-day Growth `+2,340` / Engagement Rate `4.82%` / Avg Views / Video `18,200`

**Audience Personas Section:**
- Section title: "Audience Personas" 18px/600 gray-900
- Grid 2 cols, gap 16px

**Persona Card** (bg white, border gray-200, radius 12px, padding 20px):
- Header (flex, justify-between): persona name 15px/600 gray-900 + "Primary" badge brand-100/brand-700 (if primary)
- Meta row: "{ageRange} · {gender} · {engagement}% engagement" — 13px gray-500, margin-top 6px
- Divider (margin 12px 0)
- Interest tags (flex wrap, gap 6px): each tag bg gray-100 radius-full padding 3px 10px 12px/500 gray-700

**Top Locations Section:**
- Section title: "Top Locations" 18px/600 gray-900
- List (flex-col, gap 8px, max 5 items):
  Each row (flex, align-center, gap 12px):
  - Country: 13px/500 gray-700, width 96px, flex-shrink 0
  - Track: flex-1, bg gray-100, h-2, radius-full
  - Fill: bg brand-500, h-2
  - Percentage: 12px/600 gray-500, width 36px, text-right

**Age Distribution Section:**
- Section title: "Age Distribution" 18px/600 gray-900
- Horizontal bar chart (flex-col gap 8px):
  Age groups: 13–17 / 18–24 / 25–34 / 35–44 / 45+
  Each row: label 13px gray-600 width-12 + bar track flex-1 h-2 bg gray-100 + fill brand-500 + % 12px gray-500

---

### STATES

**No TikTok connected:** show connect prompt, hide all data sections.
**Loading:** skeleton cards for stats row, skeleton lines for personas.
**Empty personas:** "Persona data is being analyzed. Check back soon." — centered gray-400.

---

### RESPONSIVE BEHAVIOR

Stats row: 2 cols tablet, 1 col mobile. Personas grid: 1 col on tablet and mobile.

---

## Screen 9 — Content Ideas List

**URL:** `/dashboard/content`
**Shell:** Dashboard Shell (sidebar + topbar)

---

### GLOBAL CONTEXT

**Product:** Trendify — AI-powered Creator OS for TikTok. Premium SaaS. Inspired by Linear, Stripe, Notion, Vercel.
**Font:** Inter. **Page BG:** `#F9FAFB`. **Card surface:** `#FFFFFF`.
**Brand:** `#4F46E5` buttons / `#6366F1` accents / `#EEF2FF` tint.
**Text:** `#111827` / `#6B7280` / `#9CA3AF`. **Borders:** `#E5E7EB`.
**Radius:** Cards 12px, Buttons 8px, Badges 9999px. **Shadow:** `0 1px 3px rgba(0,0,0,0.08)`.
**Status badges — draft:** gray-100/gray-600 | approved: blue-100/blue-700 | scheduled: purple-100/purple-700 | published: green-100/green-700 | archived: gray-100/gray-500.
**AI badge:** bg `#EDE9FE` (violet-100), text violet-700.
**Segmented control (tabs):** active=bg white shadow-sm text gray-900 | inactive=text gray-500 hover text gray-700. Container bg gray-100 radius-xl p-1.
**Create form:** bg white, border brand-200 `#C7D2FE`, radius 12px, padding 20px.
**APPLICATION SHELL:** Sidebar 256px fixed (Content nav active). Topbar: "Content Ideas" as page title. Main content bg `#F9FAFB`, padding 32px, max-width 1280px.

---

### SCREEN PURPOSE

Users manage their full content pipeline here. Primary flow: create idea → approve → schedule. Secondary: browse and filter existing ideas by status. Users should be able to create a new idea in under 3 interactions.

---

### LAYOUT

Vertical stack, gap 20px:
1. Page header with actions
2. Create idea form (collapsible, shown on demand)
3. Status tabs
4. Ideas list

---

### COMPONENTS

**Page Header** (flex, justify-between, align-center, flex-wrap, gap 12px):
Left: icon Lightbulb 22px brand-500 + "Content Ideas" 24px/700 gray-900 + subtitle below
Right (flex gap 8px):
- "✨ AI Generate" button — bg violet-600, text white, icon Sparkles 14px left, height 36px
- "+ New Idea" button — primary, icon Plus 14px left

**Create Idea Form** (collapsible — hidden by default, slides down when "+ New Idea" clicked):
Card bg white, border `#C7D2FE` (brand-200), radius 12px, padding 20px:
- Title: "New Content Idea" 15px/600 gray-900, margin-bottom 16px
- Grid 2 cols, gap 16px:
  - "Title *" — text input, placeholder `5 fitness myths debunked`
  - "Niche *" — select: Fitness / Cooking / Tech / Beauty / Finance
- Full-width margin-top 12px: "Hook (optional)" — input, placeholder `You've been doing this wrong your entire life…`
- Button row (flex, justify-end, gap 8px, margin-top 16px):
  - "Cancel" — ghost button
  - "Create" — primary button, disabled if title empty

**Status Tabs** (segmented control):
Container: bg gray-100, radius 12px, padding 4px, fit-content
Tabs: "All" / "Draft" / "Approved" / "Scheduled" / "Published" / "Archived"
Active tab: bg white, shadow `0 1px 2px rgba(0,0,0,0.06)`, text gray-900, radius 8px, padding 6px 16px, 13px/500
Inactive tab: text gray-500, padding 6px 16px, hover text gray-700

**Ideas List** (flex-col, gap 12px):

**Idea Card** (bg white, border gray-200, radius 12px, padding 16px, flex, gap 16px, hover border gray-300, cursor pointer, transition 150ms):

*Left (flex-1, min-w-0):*
- Badge row (flex, gap 6px, align-center, flex-wrap, margin-bottom 6px):
  - Status badge + niche text (13px gray-400) + "AI" badge (violet, if AI-generated) + "Scheduled: Mon 7pm" (purple badge, if scheduled)
- Title: 14px/500 gray-900
- Hook (if present): 13px italic gray-500, margin-top 4px, truncate max-w-lg `"You've been doing this wrong…"`

*Right (flex-shrink 0, self-center):*
- "Approve" button (only when status = draft): icon CheckCircle 14px + "Approve" — border green-300, text green-700, bg transparent, hover bg green-50, radius 8px, height 32px, padding 0 12px, 13px/500
- No button for other statuses (right column empty)

**Empty state** (when no ideas or filtered list empty):
- Icon Lightbulb 48px gray-300 + "No ideas yet. Create your first one above." 15px/500 gray-500

---

### STATES

**Loading:** 5 skeleton rows h-20 animate-pulse.
**Empty:** empty state as above.
**Create form open:** form card slides in below header.

---

### RESPONSIVE BEHAVIOR

Header: buttons stack below title on mobile. Tabs: horizontal scroll on mobile. Idea card: column layout on mobile (left + right stack vertically).

---

## Screen 10 — Content Idea Detail

**URL:** `/dashboard/content/{id}`
**Shell:** Dashboard Shell (sidebar + topbar)

---

### GLOBAL CONTEXT

**Product:** Trendify — AI-powered Creator OS for TikTok. Premium SaaS. Inspired by Linear, Stripe, Notion, Vercel.
**Font:** Inter. **Page BG:** `#F9FAFB`. **Card surface:** `#FFFFFF`.
**Brand:** `#4F46E5` buttons / `#6366F1` accents / `#EEF2FF` tint.
**Text:** `#111827` / `#6B7280` / `#9CA3AF`. **Borders:** `#E5E7EB`.
**Radius:** Cards 12px, Buttons 8px, Badges 9999px. **Shadow:** `0 1px 3px rgba(0,0,0,0.08)`.
**AI Insight card:** bg violet-50 `#F5F3FF`, border violet-200 `#DDD6FE`, text violet-800.
**Numbered list sections:** border-left 3px solid gray-100, padding-left 12px.
**Status badges:** draft=gray-100/gray-600, approved=blue-100/blue-700, scheduled=purple-100/purple-700, published=green-100/green-700.
**Action buttons secondary:** green border/text for Approve; purple for Schedule; gray ghost for Archive.
**APPLICATION SHELL:** Sidebar 256px fixed (Content nav active). Topbar: idea title truncated as page title. Main content bg `#F9FAFB`, padding 32px, max-width 1280px.

---

### SCREEN PURPOSE

Users review, enrich, and take action on a single content idea. This is the primary workspace for a piece of content. Goal: user should be able to go from idea → approved → scheduled in one screen visit. AI suggestions should be immediately actionable.

---

### LAYOUT

Vertical stack:
1. Breadcrumb
2. Page header + action buttons
3. Two-column body (65% content / 35% metadata sidebar)

---

### COMPONENTS

**Breadcrumb:** "Content" link gray-400 + "/" + "5 fitness myths debunked" gray-600 — 13px

**Page Header** (flex, justify-between, align-start, flex-wrap, gap 16px):
Left:
- Title: "5 fitness myths debunked" — 26px/700 gray-900
- Badge row (margin-top 8px): status badge + niche badge + "AI Generated" violet badge + created date 12px gray-400

Right (flex gap 8px):
- "Approve" — border green-300 text green-700 (only if draft)
- "Schedule" — border purple-300 text purple-700 (only if approved)
- "Archive" — ghost gray

**Two-column layout** (grid 65%/35%, gap 24px, margin-top 24px):

*Left column (flex-col, gap 16px):*

**Hook card** (bg white, border gray-200, radius 12px, padding 20px):
- Header: icon Zap 16px brand-500 + "Hook" 15px/600 gray-900 + edit button icon Pencil 14px gray-400 (top-right, ghost)
- Content: 16px/400 gray-900 italic `"You've been doing this wrong your entire life…"`

**Script Outline card** (bg white, border gray-200, radius 12px, padding 20px):
- Header: icon FileText 16px brand-500 + "Script Outline" 15px/600 gray-900
- Ordered list (flex-col gap 10px, margin-top 12px):
  Each item: number 13px/600 brand-600 + section label 13px/600 gray-900 + timing tag `(0–3s)` 11px gray-400 + content 13px gray-600 below
  1. Hook (0–3s)
  2. Problem setup (3–10s)
  3. Main content (10–45s)
  4. CTA (45–60s)
- If no script: placeholder 13px gray-400 "No script yet." + button "✨ Generate with AI" violet

**Hashtags card** (bg white, border gray-200, radius 12px, padding 20px):
- Header: icon Hash 16px brand-500 + "Hashtags" 15px/600 gray-900
- Chip list (flex wrap, gap 8px, margin-top 12px): each `#tag` bg gray-100 radius-full p 3px 12px 13px gray-700
- Add field + "Suggest with AI" ghost button (inline)

*Right column (flex-col, gap 16px):*

**Details card** (bg white, border gray-200, radius 12px, padding 20px):
- Title: "Details" 14px/600 gray-900
- Row list (flex-col, gap 10px, margin-top 12px):
  Each row: label 12px gray-500 (flex-shrink 0, width 80px) + value 13px/500 gray-900
  - Niche / Status badge / Created / AI Generated

**Linked Trend card** (bg white, border gray-200, radius 12px, padding 16px — if linked):
- "Based on trend" 12px/600 gray-500 uppercase tracking-wide
- Mini trend row: "#trendname" 13px/600 gray-900 + score bar brand-500 + "View trend" link brand-600 12px

**Schedule card** (bg white, border gray-200, radius 12px, padding 20px):
- "Scheduled for" 12px/600 gray-500 uppercase
- If scheduled: "Monday, Jun 24 · 7:00 PM" 14px/500 gray-900 + "Edit" link 12px brand-600
- If not: Button "Pick a time" secondary full-width + datetime picker dropdown

**AI Suggestions card** (bg violet-50, border violet-200, radius 12px, padding 20px):
- Header: icon Sparkles 16px violet-600 + "AI Suggestions" 14px/600 violet-800
- List (flex-col gap 8px, margin-top 12px):
  Each: bullet dot violet-300 + text 13px gray-700 + "Apply" link 12px brand-600 inline
  - "Try opening with a shocking statistic"
  - "Add a poll sticker to boost engagement"
  - "Best hashtag to add: #mythbusting"

---

### STATES

**Loading:** all cards skeleton. Right sidebar skeleton rows.
**Draft + no script:** script outline shows empty state + AI generate CTA.

---

### RESPONSIVE BEHAVIOR

Two-column → single column on tablet and mobile. Right metadata sidebar moves below left content. Header action buttons become icon-only on mobile.

---

## Screen 11 — Content Calendar

**URL:** `/dashboard/content/calendar`
**Shell:** Dashboard Shell (sidebar + topbar)

---

### GLOBAL CONTEXT

**Product:** Trendify — AI-powered Creator OS for TikTok. Premium SaaS. Inspired by Linear, Stripe, Notion, Vercel.
**Font:** Inter. **Page BG:** `#F9FAFB`. **Card surface:** `#FFFFFF`.
**Brand:** `#4F46E5` buttons / `#6366F1` accents / `#EEF2FF` tint.
**Text:** `#111827` / `#6B7280` / `#9CA3AF`. **Borders:** `#E5E7EB`.
**Radius:** Cards 12px, Buttons 8px, Badges 9999px. **Shadow:** `0 1px 3px rgba(0,0,0,0.08)`.
**Calendar content chips — scheduled:** bg purple-100 text purple-700 | published: bg green-100 text green-700.
**Today cell:** border brand-500, day number brand-600 font-bold.
**Calendar grid cells:** border-right and border-bottom gray-100. Day number: 12px gray-400.
**View toggle:** segmented control Month/Week, same style as status tabs.
**APPLICATION SHELL:** Sidebar 256px fixed (Content nav active). Topbar: "Content Calendar" as page title. Main content bg `#F9FAFB`, padding 32px, max-width 1280px.

---

### SCREEN PURPOSE

Creators need a visual overview of their scheduled content to spot gaps and avoid posting clusters. Goal: users should understand their publishing density at a glance. Scheduling should be possible without leaving this screen.

---

### LAYOUT

Vertical stack, gap 16px:
1. Calendar header (navigation + view toggle)
2. Calendar grid (month or week)

---

### COMPONENTS

**Calendar Header** (flex, justify-between, align-center, margin-bottom 16px):
Left: ChevronLeft button (ghost icon) + "June 2026" 20px/600 gray-900 + ChevronRight button (ghost icon)
Center (optional): "Today" button — secondary small
Right: View toggle + "Schedule Idea" primary button

**View Toggle** (segmented control): "Month" / "Week"

---

**Month View Grid:**

Day name header row (grid 7 cols): Mon / Tue / Wed / Thu / Fri / Sat / Sun — 12px/500 gray-400 uppercase, text-center, padding 8px, bg gray-50, border-bottom gray-100.

Calendar grid (grid 7 cols, each cell min-height 100px, border-right and border-bottom gray-100):

Each day cell (padding 8px, vertical stack):
- Day number: 13px/500 gray-400 top-right (today: brand-600 bold, circle bg brand-50 20px)
- Content chips (flex-col gap 4px, margin-top 6px):
  Each chip (radius 6px, padding 3px 8px, 11px/500, truncate, cursor pointer):
  - Scheduled: bg purple-100 text purple-700
  - Published: bg green-100 text green-700
- "+ Add" mini ghost button (12px gray-400, hover brand-600 — appears on hover)

Empty cells: bg white, other-month cells: bg gray-50, day number gray-300.

**Week View Grid:**

7 columns (Mon–Sun), 24 rows (hours 0–23). Header: day name + date (today highlighted brand-50 bg). Left column: hour labels 11px gray-400. Grid cells: 1px gray-100 borders, height 48px per hour.

Content event blocks (absolute positioned within grid, bg purple-100, border-left 3px purple-500, radius 4px, padding 4px 8px):
- Title: 12px/500 purple-800, truncate
- Time: 11px purple-600

---

### STATES

**Loading:** calendar grid skeleton (gray blocks in cells animate-pulse).
**Empty month:** no chips, cells empty — show "No content scheduled this month" overlay.

---

### RESPONSIVE BEHAVIOR

Month view: full-width, cells shrink but maintain structure. Week view: horizontal scroll on mobile. Header: navigation stacks on mobile.

---

## Screen 12 — AI Script Generator

**URL:** `/dashboard/content/generate`
**Shell:** Dashboard Shell (sidebar + topbar)

---

### GLOBAL CONTEXT

**Product:** Trendify — AI-powered Creator OS for TikTok. Premium SaaS. Inspired by Linear, Stripe, Notion, Vercel.
**Font:** Inter. **Page BG:** `#F9FAFB`. **Card surface:** `#FFFFFF`.
**Brand:** `#4F46E5` buttons / `#6366F1` accents / `#EEF2FF` tint.
**Text:** `#111827` / `#6B7280` / `#9CA3AF`. **Borders:** `#E5E7EB`.
**Radius:** Cards 12px, Buttons 8px, Badges 9999px. **Shadow:** `0 1px 3px rgba(0,0,0,0.08)`.
**AI/Violet buttons:** bg `#7C3AED`, text white, hover `#6D28D9`.
**AI output card:** bg white, border violet-200 `#DDD6FE`, radius 12px.
**Hook section border accent:** border-top 3px solid violet-500 in output card.
**Token cost line:** 12px gray-400.
**Toggle switch:** 44×24px, off=gray-200, on=brand-500.
**Radio buttons for format:** custom pill-style selection (selected=brand-50 border brand-500).
**APPLICATION SHELL:** Sidebar 256px fixed (Content nav active). Topbar: "AI Script Generator" as page title. Main content bg `#F9FAFB`, padding 32px, max-width 1280px.

---

### SCREEN PURPOSE

Reduce content creation time from hours to minutes. Users provide a topic and tone; AI handles the creative lift. The interaction must feel fast and responsive — seeing generated output is the moment of delight. Token cost visibility builds trust.

---

### LAYOUT

Two-column, gap 24px (35% input / 65% output), max-width 1200px:
Left: input form card
Right: output preview card

---

### COMPONENTS

**Page Header** (margin-bottom 24px):
Row: icon Sparkles 22px violet-500 + "AI Script Generator" 24px/700 gray-900
Subtitle: "Generate hooks, scripts, and hashtags powered by AI." 14px gray-500

---

**Left — Input Form Card** (bg white, border gray-200, radius 12px, padding 24px):
Title: "Content brief" 15px/600 gray-900, margin-bottom 20px

*Topic / Trend field:*
- Label: "Topic or trend *" 13px/500 gray-700
- Input text, placeholder `e.g. "5 fitness myths debunked"` + "Use a trending topic" link 12px brand-600 below

*Content format* (margin-top 16px):
- Label: "Content format" 13px/500 gray-700
- 3 pill-select options (flex, gap 8px, margin-top 8px):
  Each pill: padding 6px 14px, radius 8px, 13px/500, border
  - Short (15–30s) / Standard (30–60s) / Long (60–90s)
  - Unselected: bg white border gray-200 text gray-600
  - Selected: bg brand-50 border brand-500 text brand-700

*Tone* (margin-top 16px):
- Label: "Tone" + Select dropdown: Energetic / Educational / Funny / Inspiring / Controversial

*Target audience* (margin-top 16px):
- Label: "Target audience" + Select: (from saved personas or "General")

*Toggle row* (margin-top 16px, flex-col gap 12px):
Each row: label 13px/500 gray-700 + description 12px gray-400 below label + Toggle right
- "Include hashtags" — toggle ON
- "Include CTA" — toggle OFF. When ON: text input appears below: placeholder `Subscribe for more…`

*Token cost estimate* (margin-top 20px, border-top gray-100, padding-top 16px):
- "Estimated cost: ~$0.0012 · ~850 tokens" 12px gray-400
- Small info icon InfoCircle 12px gray-300 (tooltip: "Costs may vary by response length")

*Generate button* (margin-top 16px, full-width, height 40px):
- "✨ Generate" — bg violet-600 text white hover violet-700, icon Sparkles left
- Loading: spinner + "Generating…" (animated dots)

---

**Right — Output Preview Card** (bg white, border gray-200, radius 12px, padding 24px, min-height 400px):

*State: Empty (before generate):*
- Centered placeholder (padding-top 80px): icon Bot or Sparkles 48px gray-200 + "Fill in the brief and click Generate" 14px gray-400 + subtitle "Your script will appear here" 13px gray-300

*State: Loading:*
- Skeleton lines: 3px height gray-100, widths varying 60%/90%/75%/85%/50%, gap 12px, animate-pulse

*State: Generated:*

Hook section (border-top 3px violet-500, padding-top 12px, margin-bottom 20px):
- "Hook" 11px/600 violet-600 uppercase tracking-wide
- Content: 16px/500 gray-900

Script section (flex-col gap 12px):
- "Script Outline" 11px/600 gray-500 uppercase tracking-wide
- Numbered items with timing tags (same style as Content Idea Detail)

Hashtags section (margin-top 16px):
- "Hashtags" 11px/600 gray-500 uppercase
- Chip list: bg gray-100 radius-full padding 3px 12px 12px gray-700

Footer (border-top gray-100, padding-top 16px, margin-top 20px, flex, justify-between, align-center):
Left: "842 tokens · $0.0011" 12px gray-400
Right (flex gap 8px):
- "↻ Regenerate" — ghost small, icon RefreshCw
- "Copy all" — ghost small, icon Copy
- "Save as Idea" — primary small

---

### STATES

Output panel has 3 states: Empty / Loading / Generated. Input form: validate on submit (topic required).

---

### RESPONSIVE BEHAVIOR

Two columns → single column on tablet+mobile (form on top, output below). Output card: min-height 300px on mobile.

---

## Screen 13 — Analytics

**URL:** `/dashboard/analytics`
**Shell:** Dashboard Shell (sidebar + topbar)

---

### GLOBAL CONTEXT

**Product:** Trendify — AI-powered Creator OS for TikTok. Premium SaaS. Inspired by Linear, Stripe, Notion, Vercel.
**Font:** Inter. **Page BG:** `#F9FAFB`. **Card surface:** `#FFFFFF`.
**Brand:** `#4F46E5` buttons / `#6366F1` accents / `#EEF2FF` tint.
**Text:** `#111827` / `#6B7280` / `#9CA3AF`. **Borders:** `#E5E7EB`.
**Radius:** Cards 12px, Buttons 8px, Badges 9999px. **Shadow:** `0 1px 3px rgba(0,0,0,0.08)`.
**Metric cards:** large value 28px/700 gray-900, label 12px/500 uppercase tracking-wide gray-500, sub-label 12px gray-400.
**Period selector:** same segmented control style (bg gray-100, active bg white shadow).
**Warning banner:** bg amber-50, border amber-200, text amber-700, radius 12px, padding 16px.
**Top posts table:** container border gray-200 radius-12px, header bg gray-50, rows hover bg gray-50/50.
**APPLICATION SHELL:** Sidebar 256px fixed (Analytics nav active). Topbar: "Analytics" as page title. Main content bg `#F9FAFB`, padding 32px, max-width 1280px.

---

### SCREEN PURPOSE

Creators review performance metrics to understand what's working. The period selector enables comparison. Best posting time is the highest-value insight — it should stand out. Time-to-key-insight: under 8 seconds.

---

### LAYOUT

Vertical stack, gap 24px:
1. Page header + period selector
2. Connect prompt (conditional)
3. KPI cards grid
4. Top performing posts table

---

### COMPONENTS

**Page Header** (flex, justify-between, align-center, flex-wrap, gap 16px):
Left: icon BarChart3 22px brand-500 + "Analytics" 24px/700 gray-900 + subtitle below
Right: Period Selector segmented control: "7 days" / "30 days" / "90 days"
Period selector: bg gray-100, padding 4px, radius 12px. Active: bg white shadow-sm text gray-900 radius 8px padding 6px 16px 13px/500. Inactive: text gray-500.

**Connect Prompt** (amber banner, same as Audience screen — conditional):
"Connect a TikTok account to see analytics." + "Connect TikTok" button inline.

**KPI Cards Grid** (grid 2→4 cols, gap 16px):
Metric Card (bg white, border gray-200, radius 12px, padding 20px):
- Label: 12px/500 uppercase tracking-wide gray-500
- Value: 28px/700 gray-900, margin-top 6px
- Sub-label (optional): 12px gray-400, margin-top 2px

Cards (8 total in 2 rows of 4):
Row 1: Total Views `1,245,800` / Total Likes `89,420` / Total Comments `12,350` / Total Shares `8,900`
Row 2: New Followers `+2,340` / Avg Engagement `4.82%` / Best Day `Thursday` (sub: "highest avg engagement") / Best Hour `7pm` (sub: "highest avg engagement")

*Best Day and Best Hour cards:* add visual accent — left border 3px brand-500, or bg brand-50 to highlight as "recommendation" insight.

**Top Performing Posts** (card, bg white, border gray-200, radius 12px, overflow hidden):
- Card header (padding 16px 20px, border-bottom gray-100): "Top Performing Posts" 16px/600 gray-900 + "View all" link 13px brand-600 right
- Table:
  - Header: Thumbnail / Title / Views / Likes / Eng. Rate / Posted
  - Rows (5): thumbnail 40×40px rounded-6 bg gray-100 + title truncate 13px/500 gray-900 + metrics 13px gray-600 + date 12px gray-400

---

### STATES

**No TikTok connected:** amber prompt only, no cards.
**Loading:** KPI cards skeleton (h-24 animate-pulse), table skeleton rows.
**Period change:** subtle loading state on cards (opacity 0.6 + small spinner) while refetching.

---

### RESPONSIVE BEHAVIOR

KPI grid: 2 cols on tablet, 1 col mobile. Period selector: moves below title on mobile. Table: horizontal scroll on mobile.


---

## Screen 14 — Learning Engine

**URL:** `/dashboard/learning`
**Shell:** Dashboard Shell (sidebar + topbar)

---

### GLOBAL CONTEXT

**Product:** Trendify — AI-powered Creator OS for TikTok. Premium SaaS. Inspired by Linear, Stripe, Notion, Vercel.
**Font:** Inter. **Page BG:** `#F9FAFB`. **Card surface:** `#FFFFFF`.
**Brand:** `#4F46E5` buttons / `#6366F1` accents / `#EEF2FF` tint.
**Text:** `#111827` / `#6B7280` / `#9CA3AF`. **Borders:** `#E5E7EB`.
**Radius:** Cards 12px, Buttons 8px, Badges 9999px. **Shadow:** `0 1px 3px rgba(0,0,0,0.08)`.
**Priority badges — low:** gray-100/gray-600 | medium: blue-100/blue-700 | high: amber-100/amber-700 | critical: red-100/red-700.
**Pattern cards:** bg white, border gray-200, radius 12px, padding 16px.
**Pending badge:** bg brand-100, text brand-700, radius-full 11px/500.
**Apply button:** border green-300, text green-700, hover bg green-50. Dismiss: border gray-200, text gray-500, hover bg gray-50.
**APPLICATION SHELL:** Sidebar 256px fixed (Learning nav active). Topbar: "Learning Engine". Main content bg `#F9FAFB`, padding 32px, max-width 1280px.

---

### SCREEN PURPOSE

Surface the AI feedback loop. Users see pending recommendations with expected impact, and discover which content patterns are working. Time-to-action on top recommendation: under 10 seconds.

---

### LAYOUT

Vertical stack, gap 32px: Page header → Recommendations section → Learned Patterns section.

---

### COMPONENTS

**Page Header:** icon GraduationCap 22px brand-500 + "Learning Engine" 24px/700 gray-900. Subtitle: "AI-detected content patterns and personalized improvement recommendations." 14px gray-500.

**Recommendations Section:**
Header row (flex, align-center, gap 8px): icon Lightbulb 18px amber-500 + "Recommendations" 18px/600 gray-900 + "{n} pending" badge brand-100/brand-700 radius-full 11px/500.

**Recommendation Card** (bg white, border gray-200, radius 12px, padding 16px, flex, gap 16px):
- Left (flex-1): Meta row — priority badge + category 12px gray-400 + "+{n}% expected" 12px/600 green-600 ml-auto. Title 14px/500 gray-900. Description 13px gray-500 margin-top 4px.
- Right (flex-col, gap 6px): "Apply" button (border green-300, text green-700, icon CheckCircle2 14px, hover bg green-50, h-30 px-10 radius-8 12px/500). "Dismiss" button (border gray-200, text gray-500, icon XCircle 14px, hover bg gray-50, same size).

Empty state: icon CheckCircle2 48px gray-300 + "No pending recommendations. Keep creating!" 14px gray-400, centered, padding 48px.

**Learned Patterns Section:**
Title: "Learned Patterns" 18px/600 gray-900. Grid 3 cols (1→2→3 responsive), gap 16px.

**Pattern Card** (bg white, border gray-200, radius 12px, padding 16px):
- Header: category badge bg gray-100 text gray-600 radius-full + "n=47" 12px gray-400 ml-auto.
- Name: 14px/500 gray-900. Description: 13px gray-500 margin-top 4px.
- Footer: "{engagement}% avg engagement · {confidence}% confidence" 12px gray-400.

Empty patterns: icon BookOpen 48px gray-300 + "Patterns will appear once enough content has been analyzed." 14px gray-400.

---

### STATES

Loading: 3 skeleton recommendation rows + 6 skeleton pattern cards. Empty states as described.

---

### RESPONSIVE BEHAVIOR

Patterns: 3 cols desktop, 2 tablet, 1 mobile. Recommendation card: stack vertically on mobile.

---

## Screen 15 — AI Engine

**URL:** `/dashboard/ai`
**Shell:** Dashboard Shell (sidebar + topbar)

---

### GLOBAL CONTEXT

**Product:** Trendify — AI-powered Creator OS for TikTok. Premium SaaS. Inspired by Linear, Stripe, Notion, Vercel.
**Font:** Inter. **Page BG:** `#F9FAFB`. **Card surface:** `#FFFFFF`.
**Brand:** `#4F46E5` buttons / `#6366F1` accents / `#EEF2FF` tint.
**Text:** `#111827` / `#6B7280` / `#9CA3AF`. **Borders:** `#E5E7EB`.
**Radius:** Cards 12px, Buttons 8px, Badges 9999px. **Shadow:** `0 1px 3px rgba(0,0,0,0.08)`.
**Budget normal:** bg white, border gray-200 | warning (>80%): bg amber-50, border amber-200.
**Progress bar:** track gray-200 h-3 radius-full, fill brand-500 (normal) / amber-500 (warning >80%).
**Provider status — active:** green-100/green-700 | fallback: amber-100/amber-700 | disabled: gray-100/gray-500.
**Table:** border gray-200, radius 12px, overflow hidden. Header bg gray-50. Rows hover bg gray-50/50.
**Log status — ok:** green-100/green-700 | fail: red-100/red-700.
**APPLICATION SHELL:** Sidebar 256px fixed (AI Engine nav active). Topbar: "AI Engine". Main content bg `#F9FAFB`, padding 32px, max-width 1280px.

---

### SCREEN PURPOSE

Give creators full visibility into AI costs and provider health. Zero budget surprises. Users identify failed calls and understand cost per feature. Time-to-budget-status: under 3 seconds.

---

### LAYOUT

Vertical stack, gap 24px: Page header → Budget card → Provider status row (3 cols) → Usage summary (2 cols) → Usage log table + pagination.

---

### COMPONENTS

**Page Header:** icon Zap 22px brand-500 + "AI Engine" 24px/700 gray-900. Subtitle 14px gray-500.

**Budget Card** (full-width):
Normal (bg white, border gray-200, radius 12px, padding 20px): Row label "Monthly AI Budget" 14px/600 gray-900 + value "$12.50 / $50.00" 14px/700 right. Progress bar track gray-200 h-3 fill brand-500 width=spent%. Footer: "{spent}% used" 12px gray-400 left + "${remaining} remaining" right.
Warning (bg amber-50, border amber-200): add icon AlertTriangle 16px amber-500 before label. Fill amber-500. Text amber-700.

**Provider Status Row** (grid 3 cols, gap 16px):
Provider Card (bg white, border gray-200, radius 12px, padding 16px): provider name 14px/600 gray-900 + status badge right. Sub-row: "Avg latency" 12px gray-400 + value 12px/600 | "Calls today" + value. Providers: OpenAI / Anthropic / Gemini.

**Usage Summary** (grid 2 cols, gap 16px): Card bg white border radius-12 padding 16px. "Total Tokens (page)" 12px gray-500 + 22px/700 value. "Total Cost" + "$0.0234" value.

**Usage Log Table** (bg white, border gray-200, radius 12px, overflow hidden):
Header bg gray-50: Feature / Provider / Model / Tokens / Cost / Duration / Status — 12px/500 uppercase gray-500 padding 12px 16px.
Rows (border-bottom gray-100, hover bg gray-50/50, padding 12px 16px): Feature 14px/500 gray-900 | Provider 13px gray-500 | Model 12px gray-500 | Tokens/Cost 13px gray-600 | Duration 13px gray-500 | Status badge ok=green/fail=red.
Loading: 8 rows skeleton animate-pulse.

**Pagination** (flex justify-between margin-top 16px): "← Prev" secondary sm + "Page {n}" 13px gray-500 + "Next →" secondary sm. Disabled: opacity 0.4.

---

### STATES

Loading: budget skeleton, provider skeletons, table skeleton rows. Warning: amber budget variant.

---

### RESPONSIVE BEHAVIOR

Provider row: 1 col mobile. Table: horizontal scroll, sticky first col.

---

## Screen 16 — Settings Layout

**URL:** `/settings/*`
**Shell:** Dashboard Shell + settings sub-navigation

---

### GLOBAL CONTEXT

**Product:** Trendify — AI-powered Creator OS for TikTok. Premium SaaS. Inspired by Linear, Stripe, Notion, Vercel.
**Font:** Inter. **Page BG:** `#F9FAFB`. **Card surface:** `#FFFFFF`.
**Brand:** `#4F46E5` / `#EEF2FF`. **Text:** `#111827` / `#6B7280` / `#9CA3AF`. **Borders:** `#E5E7EB`.
**Radius:** Cards 12px, Buttons 8px.
**Settings sub-nav item — active:** text brand-700 bg brand-50 radius 8px | inactive: text gray-600 hover bg gray-100.
**All settings content:** max-width 640px (account/notifications/budget) or 800px (team).
**APPLICATION SHELL:** Sidebar 256px fixed (Settings nav active in main sidebar). Settings sub-nav is a secondary nav inside the content area. Topbar shows current settings section name. Main content bg `#F9FAFB`, padding 32px.

---

### SCREEN PURPOSE

Settings shell is the navigation container for all settings sub-pages. Users switch between settings sections in one click. Sub-nav visually distinguishes settings context from main dashboard navigation.

---

### LAYOUT

Two-column within main content: sub-nav 220px (left) + content flex-1 (right). On tablet/mobile: sub-nav becomes horizontal scroll tabs above content.

---

### COMPONENTS

**Settings Sub-Navigation** (220px, flex-col, gap 2px):
Each item: icon 16px Lucide + label 14px/500, padding 8px 12px, radius 8px, transition 150ms.
Items: User → Account | Link → Connected Accounts | Zap → AI Budget | Bell → Notifications | Building2 → Workspace | CreditCard → Billing | Users → Team.
Active: bg brand-50 text brand-700. Inactive: text gray-600 hover bg gray-100.

**Content area:** renders the specific settings page. Each settings page: flex-col gap 16px, max-width 640px (or 800px for team).

---

### RESPONSIVE BEHAVIOR

Desktop: two-column. Tablet+Mobile: horizontal scroll tabs (icon + short label). Active tab: border-bottom 2px brand-600 text brand-700.

---

## Screen 17 — Settings: Account

**URL:** `/settings/account`
**Shell:** Dashboard Shell + Settings sub-nav (Account active)

---

### GLOBAL CONTEXT

**Product:** Trendify — AI-powered Creator OS for TikTok. Premium SaaS. Inspired by Linear, Stripe, Notion, Vercel.
**Font:** Inter. **Page BG:** `#F9FAFB`. **Card surface:** `#FFFFFF`.
**Brand:** `#4F46E5` / `#EEF2FF`. **Text:** `#111827` / `#6B7280` / `#9CA3AF`. **Borders:** `#E5E7EB`. **Input borders:** `#D1D5DB`.
**Radius:** Cards 12px, Buttons 8px. **Shadow:** `0 1px 3px rgba(0,0,0,0.08)`.
**Password strength bar:** 4 segments h-1 gap-1, Weak=red-400, Fair=amber-400, Good=blue-400, Strong=green-500.
**Email verified badge:** green-100/green-700 | unverified: amber-100/amber-700.
**Danger zone card:** bg red-50, border red-200.
**Settings sub-nav — Account active.** Cards: bg white, border gray-200, radius 12px, padding 24px. Max-width 640px.
**APPLICATION SHELL:** Sidebar 256px. Settings sub-nav. Topbar: "Account".

---

### SCREEN PURPOSE

Manage identity and security. Three concerns: profile (name/email), password, workspace deletion. Danger zone clearly separated. Change name in 2 interactions.

---

### LAYOUT

Vertical stack, max-width 640px, gap 16px: Page title → Profile card → Change Password card → Danger Zone card.

---

### COMPONENTS

**Page Title:** "Account" 24px/700 gray-900 + "Manage your profile and workspace settings." 14px gray-500.

**Profile Card** (bg white, border gray-200, radius 12px, padding 24px):
Title: "Profile" 16px/600 gray-900. Avatar row (flex align-center gap 16px mb-20): circle 64px bg brand-100 initials brand-700 18px/600 + "Change photo" ghost sm + "Remove" link 12px red-600. Fields: "Display name" input + "Email" input read-only (right badge verified/unverified). Save button primary (justify-end row).

**Change Password Card** (same card style): Title "Change Password". Fields: Current password, New password (+ strength bar 4-segment below), Confirm new password. "Update password" primary right-aligned.

**Danger Zone Card** (bg red-50, border red-200, radius 12px, padding 24px): Row icon AlertTriangle 16px red-600 + "Danger Zone" 15px/600 red-700. Divider. Row: "Delete workspace" label + description 12px gray-500 + "Delete workspace" danger button right.

**Delete Confirmation Modal** (max-width 440px, padding 24px): "Delete workspace permanently?" 18px/600. Warning body 14px gray-600. "Type workspace name to confirm:" input. Cancel secondary + "Yes, delete permanently" danger (disabled until name matches).

---

### STATES

Loading: skeleton fields. Save success: toast. Password error: inline field errors.

---

### RESPONSIVE BEHAVIOR

Max-width 640px, full-width mobile. Avatar: stacks on mobile. Fields always full-width.

---

## Screen 18 — Settings: Connected Accounts

**URL:** `/settings/accounts`
**Shell:** Dashboard Shell + Settings sub-nav (Connected Accounts active)

---

### GLOBAL CONTEXT

**Product:** Trendify — AI-powered Creator OS for TikTok. Premium SaaS. Inspired by Linear, Stripe, Notion, Vercel.
**Font:** Inter. **Page BG:** `#F9FAFB`. **Card surface:** `#FFFFFF`.
**Brand:** `#4F46E5` / `#EEF2FF`. **Text:** `#111827` / `#6B7280` / `#9CA3AF`. **Borders:** `#E5E7EB`.
**Radius:** Cards 12px, Buttons 8px, Badges 9999px. **Shadow:** `0 1px 3px rgba(0,0,0,0.08)`.
**Active account badge:** green-100/green-700. **Disconnect:** ghost text red-600 hover bg red-50.
**Connect button:** primary brand-600. **Future platforms card:** bg gray-50, border dashed gray-200.
**Settings sub-nav — Connected Accounts active.** Max-width 640px.
**APPLICATION SHELL:** Sidebar 256px. Settings sub-nav. Topbar: "Connected Accounts".

---

### SCREEN PURPOSE

Connect and manage TikTok accounts. Connect unlocks Audience, Analytics, AI features. Multiple accounts possible. Disconnect is deliberate with data-loss warning.

---

### LAYOUT

Vertical stack, max-width 640px, gap 16px: Page title → TikTok accounts card → Coming soon card.

---

### COMPONENTS

**Page Title:** "Connected Accounts" 24px/700 + subtitle.

**TikTok Accounts Card** (bg white, border gray-200, radius 12px, padding 24px):
Header: TikTok logo 20px + "TikTok" 16px/600 + "{n} connected" badge brand (if accounts). 
Connected account row (flex align-center gap 12px, padding 12px 0, border-bottom gray-100): avatar 40px circle + "@username" 14px/600 + "{followers}" 12px gray-500 + "Active" green badge + "Disconnect" ghost red sm (ml-auto).
Add account row (flex align-center gap 12px, pt-12): icon Plus 16px circle bg gray-100 40px + "Add another account" 14px/500 + "Connect" primary sm ml-auto.
Empty state: TikTok icon 40px gray-300 + "No TikTok account connected" + "Connect your TikTok to start analyzing trends." + "Connect TikTok" primary full-width mt-16.

**Coming Soon Card** (bg gray-50, border dashed gray-200, radius 12px, padding 20px): "More platforms coming soon" 14px/600 gray-500. Platform pills (opacity 0.5): YouTube / Instagram / Twitter/X.

**Disconnect Modal:** "Disconnect @username?" — warning data loss. Cancel + "Disconnect" danger.

---

### STATES

No accounts: empty state. Loading: skeleton rows. Disconnect success: toast + row removed.

---

## Screen 19 — Settings: AI Budget

**URL:** `/settings/ai-budget`
**Shell:** Dashboard Shell + Settings sub-nav (AI Budget active)

---

### GLOBAL CONTEXT

**Product:** Trendify — AI-powered Creator OS for TikTok. Premium SaaS. Inspired by Linear, Stripe, Notion, Vercel.
**Font:** Inter. **Page BG:** `#F9FAFB`. **Card surface:** `#FFFFFF`.
**Brand:** `#4F46E5` / `#EEF2FF`. **Text:** `#111827` / `#6B7280` / `#9CA3AF`. **Borders:** `#E5E7EB`. **Input borders:** `#D1D5DB`.
**Radius:** Cards 12px, Buttons 8px. **Shadow:** `0 1px 3px rgba(0,0,0,0.08)`.
**Budget normal:** bg white border gray-200 | warning: bg amber-50 border amber-200. Progress bar track gray-200 h-3 fill brand-500/amber-500.
**Drag handle:** icon GripVertical 16px gray-300 cursor-grab.
**Toggle switch:** 44×24px off=gray-200 on=brand-500.
**Settings sub-nav — AI Budget active.** Cards: bg white, border gray-200, radius 12px, padding 24px. Max-width 640px.
**APPLICATION SHELL:** Sidebar 256px. Settings sub-nav. Topbar: "AI Budget".

---

### SCREEN PURPOSE

Prevent surprise charges. Current usage card gives context before setting limits. Provider priority enables power-user optimization.

---

### LAYOUT

Vertical stack, max-width 640px, gap 16px: Page title → Current usage card → Budget limit card → Provider priority card → Auto-pause toggles card.

---

### COMPONENTS

**Page Title:** "AI Budget" 24px/700 + "Control your monthly AI spending and provider preferences." 14px gray-500.

**Current Usage Card** (read-only, same style as AI Engine budget card): label "June 2026 Usage" + progress bar + footer.

**Budget Limit Card:** Title "Monthly spending limit" 16px/600. Description 13px gray-500. Input group: label + "$" prefix input number `50.00` + "Save limit" primary button.

**Provider Priority Card:** Title "Provider Priority" 16px/600. Description 13px gray-500. Drag-to-reorder list (flex-col gap 8px mt-16): each row (flex align-center gap 12px, padding 10px 12px, bg gray-50, border gray-100, radius 8px): GripVertical handle 16px + provider logo 20px + name 14px/500 + role badge ("Primary" brand-100/brand-700, "Fallback 1/2" gray) + toggle right.

**Auto-Pause Card:** Title "Alerts & Auto-pause" 16px/600. Toggle rows (flex-col gap 16px mt-12): each row flex justify-between: label 14px/500 + description 12px gray-500 + toggle right. Rows: "Pause AI at 100% budget" ON | "Email alert at 80%" ON.

---

### STATES

Loading: skeleton cards. Save success: toast. Drag: row shadow elevated while dragging.

---

## Screen 20 — Settings: Notifications

**URL:** `/settings/notifications`
**Shell:** Dashboard Shell + Settings sub-nav (Notifications active)

---

### GLOBAL CONTEXT

**Product:** Trendify — AI-powered Creator OS for TikTok. Premium SaaS. Inspired by Linear, Stripe, Notion, Vercel.
**Font:** Inter. **Page BG:** `#F9FAFB`. **Card surface:** `#FFFFFF`.
**Brand:** `#4F46E5` / `#EEF2FF`. **Text:** `#111827` / `#6B7280` / `#9CA3AF`. **Borders:** `#E5E7EB`.
**Radius:** Cards 12px, Buttons 8px. **Shadow:** `0 1px 3px rgba(0,0,0,0.08)`.
**Toggle switch:** 44×24px track, off=gray-200 on=brand-500, thumb white circle 20px. Always right-aligned in rows.
**Toggle rows:** divide-y gray-50. Each row padding 14px 0, flex justify-between align-center.
**Time picker input:** standard input style, width 120px.
**Settings sub-nav — Notifications active.** Max-width 640px.
**APPLICATION SHELL:** Sidebar 256px. Settings sub-nav. Topbar: "Notifications".

---

### SCREEN PURPOSE

Control notification frequency to avoid alert fatigue while staying informed on high-value signals. Quiet hours prevent after-hours disruption. Toggle changes should feel instant.

---

### LAYOUT

Vertical stack, max-width 640px, gap 16px: Page title → In-app notifications card → Email notifications card → Notification schedule card.

---

### COMPONENTS

**Page Title:** "Notifications" 24px/700 + "Choose what you're notified about and when." 14px gray-500.

**In-App Notifications Card** (bg white, border gray-200, radius 12px, padding 24px): Title "In-App Notifications" 16px/600. Description "Shown inside the app in real time." 13px gray-500. Toggle rows (divide-y gray-50): label 14px/500 gray-900 + description 12px gray-500 + toggle right, padding 14px 0.
Rows: "New trending topic" ON | "AI job completed" ON | "Budget warning" ON | "New recommendation" ON | "Content approved" OFF.

**Email Notifications Card** (same structure): "Email Notifications" title. Rows: "Weekly trend digest" ON | "Monthly analytics summary" OFF | "Budget alert email" ON | "Product updates" OFF.

**Notification Schedule Card:** "Quiet Hours" 16px/600 + description. Time range row (flex align-center gap 12px flex-wrap): "From" 13px gray-600 + time input "10:00 PM" + "To" + "08:00 AM". Timezone row mt-12: "Timezone" label + select "Asia/Ho_Chi_Minh (UTC+7)" full-width.

---

### STATES

Toggle change: instant optimistic update, toast on save/error. Loading: skeleton rows.

---

## Screen 21 — Notification Center Panel

**Type:** Overlay panel (slide-in from right or dropdown)
**Trigger:** Click bell icon in Topbar
**Shell:** Appears over Dashboard Shell

---

### GLOBAL CONTEXT

**Product:** Trendify — AI-powered Creator OS for TikTok. Premium SaaS. Inspired by Linear, Stripe, Notion, Vercel.
**Font:** Inter. **Panel surface:** `#FFFFFF`. **Overlay backdrop:** `rgba(0,0,0,0.2)`.
**Brand:** `#4F46E5` / `#EEF2FF`. **Text:** `#111827` / `#6B7280` / `#9CA3AF`. **Borders:** `#E5E7EB`.
**Panel radius:** 16px top-left and bottom-left (right-side drawer). **Shadow:** `0 8px 24px rgba(0,0,0,0.12)`.
**Unread item:** border-left 3px solid `#6366F1`, bg `rgba(99,102,241,0.03)`.
**Read item:** bg white, no left border.
**Icon circles by type:** Trend=bg blue-50 icon blue-500 | AI=bg violet-50 icon violet-500 | Budget=bg amber-50 icon amber-500 | Rec=bg amber-50 icon amber-500 | System=bg gray-100 icon gray-400.
**Filter tab active:** border-bottom 2px brand-600 text brand-700. Inactive: text gray-500.
**Width:** 400px (drawer) or 360px (dropdown). Backdrop closes panel on click.

---

### SCREEN PURPOSE

Surface time-sensitive notifications without requiring navigation. Panel must be scannable — all notifications processable in under 30 seconds. Unread items are immediately distinguishable.

---

### LAYOUT

Right-side slide-in panel, full viewport height, 400px wide. Internal: flex-col — header → filter tabs → scrollable notification list.

---

### COMPONENTS

**Panel Header** (flex justify-between align-center, padding 16px 20px, border-bottom gray-100): "Notifications" 16px/600 gray-900 + "Mark all as read" link 13px brand-600 (if unread) + × close icon button gray-400 hover gray-700.

**Filter Tabs** (flex, border-bottom gray-100, padding 0 16px): All / Unread / Trends / AI / System. Each tab 13px/500 padding 8px 12px cursor-pointer. Active: border-bottom 2px brand-600 text brand-700.

**Notification List** (overflow-y auto, flex-1):

Notification Item (flex gap 12px padding 12px 16px border-bottom gray-50 cursor-pointer hover bg gray-50):
- Icon block (flex-shrink 0): circle 36px, icon 18px centered (color by type).
- Content (flex-1): Title 14px/500 gray-900 (bold if unread) + timestamp 12px gray-400 right. Body 13px gray-600 mt-2 max-2-lines ellipsis. Action link 12px brand-600 mt-4 (e.g. "View trend").

Empty state (padding 48px 24px text-center): icon BellOff 40px gray-300 + "No notifications yet" 14px gray-400.

---

### STATES

All read: mark-all link hidden, items without left border. Filtered empty: "No {type} notifications." Loading: 5 skeleton rows.

---

### RESPONSIVE BEHAVIOR

Desktop: right-side drawer 400px. Tablet/Mobile: full-screen overlay or bottom sheet.

---

## Screen 22 — 404 Not Found

**URL:** Any unmatched route
**Shell:** Standalone (no sidebar, no topbar)

---

### GLOBAL CONTEXT

**Product:** Trendify — AI-powered Creator OS for TikTok. Premium SaaS. Inspired by Linear, Stripe, Notion, Vercel.
**Font:** Inter. **Page BG:** `#F9FAFB`. **Surface:** `#FFFFFF`.
**Brand:** `#4F46E5` buttons. **Text:** `#111827` / `#6B7280` / `#9CA3AF`. **Borders:** `#E5E7EB`.
**Radius:** Buttons 8px. **Primary button:** bg `#4F46E5` text white height 36px radius 8px. **Secondary:** bg white border gray-200.
**No sidebar or topbar.** Full-screen centered.

---

### SCREEN PURPOSE

Recovery moment — reassure the user they haven't lost data and provide one clear path back. Calm and on-brand, not alarming.

---

### LAYOUT

Full-screen, min-height 100vh, bg gray-50, flex center, padding 24px. Centered block max-width 480px text-center.

---

### COMPONENTS

Decorative "404": 120px/800 gray-100 (large, decorative background text). Icon MapX or Compass 56px gray-300. Title: "Page not found" 28px/700 gray-900 mt-16. Body: "The page you're looking for doesn't exist or has been moved." 15px gray-600 mt-8 max-w-360. Buttons row (flex gap 12px justify-center mt-32): "Go to Dashboard" primary + "Go back" secondary. Footer: "Need help? Contact support" 13px brand-600 mt-24.

---

### RESPONSIVE BEHAVIOR

"404" decorative: 80px mobile. Buttons: stack vertically on mobile.

---

## Screen 23 — 500 Error Page

**URL:** Server error or crash
**Shell:** Standalone (no sidebar, no topbar)

---

### GLOBAL CONTEXT

**Product:** Trendify — AI-powered Creator OS for TikTok. Premium SaaS. Inspired by Linear, Stripe, Notion, Vercel.
**Font:** Inter. **Page BG:** `#F9FAFB`. **Text:** `#111827` / `#6B7280` / `#9CA3AF`. **Borders:** `#E5E7EB`.
**Primary button:** bg `#4F46E5` text white height 36px radius 8px, icon RefreshCw left. **Ghost button:** no bg text gray-600.
**No sidebar or topbar.** Full-screen centered.

---

### SCREEN PURPOSE

Honest without being alarming. Give the user one action (refresh), acknowledge the problem, offer an escape. No technical jargon visible to end users.

---

### LAYOUT

Full-screen, bg gray-50, flex center, padding 24px. Centered block max-width 480px text-center.

---

### COMPONENTS

Icon CloudOff or ServerCrash 64px gray-300. Title: "Something went wrong" 28px/700 gray-900 mt-20. Body: "We're having trouble connecting right now. Please try refreshing the page." 15px gray-600 mt-8 max-w-360. Error code: "Error 500 · Internal Server Error" 12px gray-400 mt-12 (subtle, for technical context). Buttons (flex-col gap 10px align-center mt-32): "Refresh page" primary icon RefreshCw + "Contact support" ghost. Status link: "If this keeps happening, check status.trendify.app" 12px gray-400 mt-24.

---

## Screen 24 — Pricing / Plans

**URL:** `/pricing`
**Shell:** Standalone marketing page (simple topbar, no sidebar)

---

### GLOBAL CONTEXT

**Product:** Trendify — AI-powered Creator OS for TikTok. Premium SaaS. Inspired by Linear, Stripe, Notion, Vercel.
**Font:** Inter. **Page BG:** `#F9FAFB`. **Card surface:** `#FFFFFF`.
**Brand:** `#4F46E5` CTAs / `#6366F1` accents / `#EEF2FF` tint.
**Text:** `#111827` / `#6B7280` / `#9CA3AF`. **Borders:** `#E5E7EB`.
**Radius:** Cards 12px, Buttons 8px, Badges 9999px. **Shadow:** `0 1px 3px rgba(0,0,0,0.08)`.
**Featured Pro card:** border brand-500 2px, shadow `0 4px 12px rgba(99,102,241,0.15)`.
**Feature row check:** icon Check 14px brand-600 | not included: icon X 14px gray-300.
**Billing toggle:** pill switch Monthly/Annual, brand-600 when annual. "Save 20%" badge green-100/green-700.
**Simple marketing topbar:** height 56px bg white border-bottom gray-200. Logo left, "Sign in" secondary right.
**No sidebar.** Full-width, inner max-width 1100px centered.

---

### SCREEN PURPOSE

Convert visitors to Pro subscribers. Free (anchor) → Pro (ideal, visually featured) → Enterprise (premium ceiling). Annual toggle creates pricing urgency. Feature comparison removes friction. Decision target: under 60 seconds.

---

### LAYOUT

Vertical stack: Marketing topbar → Header (title + toggle) → Pricing cards 3 cols → FAQ accordion.

---

### COMPONENTS

**Marketing Topbar:** "Trendify" 18px/700 gray-900 left + brand icon. "Sign in" secondary sm right.

**Header Section** (text-center, padding 64px 24px 32px): "Choose your plan" 36px/700 gray-900. "Start free. Scale when you're ready." 18px gray-600 mt-8.

**Billing Toggle** (flex align-center justify-center gap 12px mb-40): "Monthly" 14px/500 gray-700 + pill toggle (52×28 bg gray-200→brand-500) + "Annual" + "Save 20%" badge green-100/green-700 radius-full 11px/600.

**Pricing Cards** (grid 3 cols gap 24px max-width 1000px margin auto):

Free Card (border gray-200, radius 12px, padding 28px): "Free" 22px/700. "$0/mo" 36px/700. Tagline 14px gray-500. Feature list: ✓ 50 trend scans/month, 1 TikTok, 10 ideas, Basic analytics. ✗ AI Script Generator, AI Budget $0. Button "Get started" secondary full-width mt-24.

Pro Card (border brand-500 2px, radius 12px, padding 28px, position relative, shadow featured): "Most Popular" badge (absolute top -12 left 50% translateX -50%: bg brand-600 text white radius-full px-16 py-4 12px/600). "Pro" 22px/700. "$29/mo" 36px/700 (annual: "$23/mo"). Feature list: all Free features + Unlimited trend scans + 3 TikTok accounts + AI Script Generator + AI Budget $50/mo + Learning Engine. Button "Start Pro free trial" primary full-width.

Enterprise Card (border gray-200, radius 12px, padding 28px): "Enterprise" 22px/700. "Custom" 36px/700. All Pro features + Unlimited accounts + Custom AI budget + Unlimited team + Priority support + Custom integrations. Button "Contact sales" secondary full-width.

**FAQ Accordion** (max-width 700px margin 64px auto, flex-col): 5 items, each border-bottom gray-100 padding 16px 0. Question: flex justify-between 15px/500 gray-900 + ChevronDown 16px gray-400 (rotates 180° open). Answer: 14px gray-600 pt-12 (shown when open).

---

### STATES

Toggle: prices animate on switch. Annual: show strikethrough monthly + annual price.

---

### RESPONSIVE BEHAVIOR

Cards: 1 col mobile, 2 col tablet, 3 col desktop. Header: 28px mobile. FAQ: full-width.

---

## Screen 25 — Billing Management

**URL:** `/settings/billing`
**Shell:** Dashboard Shell + Settings sub-nav (Billing active)

---

### GLOBAL CONTEXT

**Product:** Trendify — AI-powered Creator OS for TikTok. Premium SaaS. Inspired by Linear, Stripe, Notion, Vercel.
**Font:** Inter. **Page BG:** `#F9FAFB`. **Card surface:** `#FFFFFF`.
**Brand:** `#4F46E5` / `#EEF2FF`. **Text:** `#111827` / `#6B7280` / `#9CA3AF`. **Borders:** `#E5E7EB`.
**Radius:** Cards 12px, Buttons 8px, Badges 9999px. **Shadow:** `0 1px 3px rgba(0,0,0,0.08)`.
**Plan badge — Pro:** brand-100/brand-700 | Free: gray-100/gray-500.
**Paid badge:** green-100/green-700. **"Cancel" button:** ghost text red-600 hover bg red-50.
**Table:** border gray-200 radius-12 overflow-hidden. Header bg gray-50.
**Settings sub-nav — Billing active.** Max-width 640px.
**APPLICATION SHELL:** Sidebar 256px. Settings sub-nav. Topbar: "Billing".

---

### SCREEN PURPOSE

Build subscription trust: no hidden fees, clear renewal date, instant invoice access. Cancel path visible but not promoted.

---

### LAYOUT

Vertical stack, max-width 640px, gap 16px: Page title → Current plan card → Payment method card → Billing history card.

---

### COMPONENTS

**Page Title:** "Billing" 24px/700 + "Manage your subscription and payment details." 14px gray-500.

**Current Plan Card** (bg white, border gray-200, radius 12px, padding 24px): Title "Current Plan" 16px/600. Row (flex justify-between mt-12): left: "Pro" 20px/700 + plan badge + "Next renewal: Jul 21, 2026" 13px gray-500. Right: "Change plan" secondary sm. Divider. "Cancel subscription" ghost sm text red-600 (float right).

**Payment Method Card** (bg white, border gray-200, radius 12px, padding 24px): Title "Payment Method" 16px/600. Row (flex align-center gap 12px mt-12): card brand icon 32px + "Visa ending in 4242" 14px/500 + "Expires 12/27" 12px gray-500 + "Update card" secondary sm ml-auto.

**Billing History Card** (bg white, border gray-200, radius 12px, overflow hidden): Header padding 16px 20px border-bottom: "Billing History" 16px/600 gray-900. Table: header bg gray-50 (Date/Description/Amount/Status/Invoice 12px/500 uppercase gray-500 p-12 16). Rows (border-bottom gray-50 p-12 16): date 13px gray-600 | description 14px/500 gray-900 | "$29.00" 13px/600 gray-900 | "Paid" green badge | "Download" ghost sm icon Download.

---

### STATES

Loading: skeleton rows. No history: empty state "No invoices yet."

---

## Screen 26 — Team Members

**URL:** `/settings/team`
**Shell:** Dashboard Shell + Settings sub-nav (Team active)

---

### GLOBAL CONTEXT

**Product:** Trendify — AI-powered Creator OS for TikTok. Premium SaaS. Inspired by Linear, Stripe, Notion, Vercel.
**Font:** Inter. **Page BG:** `#F9FAFB`. **Card surface:** `#FFFFFF`.
**Brand:** `#4F46E5` / `#EEF2FF`. **Text:** `#111827` / `#6B7280` / `#9CA3AF`. **Borders:** `#E5E7EB`.
**Radius:** Cards 12px, Buttons 8px, Badges 9999px. **Shadow:** `0 1px 3px rgba(0,0,0,0.08)`.
**Role badges — admin:** brand-100/brand-700 | editor: blue-100/blue-700 | viewer: gray-100/gray-600.
**Status — active:** green-100/green-700 | pending: amber-100/amber-700.
**"Remove" link:** text red-600 hover bg red-50. **"Resend/Change role":** text brand-600.
**"Invite member":** primary button icon UserPlus.
**Modal:** bg white radius 16px shadow elevated padding 24px max-width 480px.
**Settings sub-nav — Team active.** Max-width 800px (wider for table).
**APPLICATION SHELL:** Sidebar 256px. Settings sub-nav. Topbar: "Team".

---

### SCREEN PURPOSE

Admins manage workspace access. Invite quick (one modal). Remove requires confirmation. Pending invites clearly distinguishable from active members.

---

### LAYOUT

Vertical stack, max-width 800px, gap 16px: Page header + Invite button → Members table card.

---

### COMPONENTS

**Page Header** (flex justify-between align-center): "Team Members" 24px/700 + subtitle 14px gray-500. "Invite member" primary button icon UserPlus 14px left.

**Invite Modal** (max-width 480px, padding 24px): "Invite a team member" 18px/600. "Email address" input placeholder `colleague@example.com`. "Role" select Admin/Editor/Viewer. "Send invite" primary + "Cancel" secondary. Footer: "They'll receive an email invite." 12px gray-400.

**Members Table Card** (bg white, border gray-200, radius 12px, overflow hidden):
Table header (bg gray-50): Member / Role / Status / Joined / Actions — 12px/500 uppercase gray-500 p-12 16.

Active member row (flex items, p-12 16, border-bottom gray-50, hover bg gray-50):
- Member: avatar 32px circle bg brand-100 initials brand-700 12px/600 + name 14px/500 gray-900 + "You" badge (if current) + email 12px gray-500.
- Role: badge.
- Status: "Active" green badge.
- Joined: 13px gray-500.
- Actions: "Change role" link brand-600 13px + "Remove" link red-600 13px (not shown for "You").

Pending invite row (dimmed opacity 0.8): email + "Invited by {name}" 12px gray-400 | role badge | "Pending" amber badge | "Resend" brand-600 link + "Revoke" red-600 link.

**Remove modal:** "Remove {name} from workspace?" Cancel + "Remove" danger.

**Empty state:** "No team members yet." + "Invite member" primary.

---

### STATES

Loading: skeleton rows. Invite success: toast + pending row. Remove success: toast + row removed.

---

### RESPONSIVE BEHAVIOR

Table: horizontal scroll mobile. Actions: "…" icon menu on mobile.

---

## Navigation Flow (Complete)

```
/login ──────────────────────────────────────────────────────┐
/register ──────────────────────────────────────────────────→│
                                                             ↓
                                                      /onboarding (4 steps)
                                                             ↓
/dashboard ←─────────────────────────────────────────────────┘
├── /dashboard/trends
│   └── /dashboard/trends/{id}
├── /dashboard/audience
├── /dashboard/content
│   ├── /dashboard/content/{id}
│   ├── /dashboard/content/calendar
│   └── /dashboard/content/generate
├── /dashboard/analytics
├── /dashboard/learning
└── /dashboard/ai

/settings/account      ←── Settings nav item in sidebar
/settings/accounts
/settings/ai-budget
/settings/notifications
/settings/billing
/settings/team

/auth/tiktok/callback → success → /settings/accounts
                      → error   → /settings/accounts?error=1

/pricing → CTA → /register
Logout → /login
Unknown route → 404 page (standalone)
Server error → 500 page (standalone)
```

---

## Complete Screen Index

| # | Group | Screen | URL |
|---|---|---|---|
| 1 | Auth | Login | `/login` |
| 2 | Auth | Register | `/register` |
| 3 | Onboarding | Onboarding Wizard | `/onboarding` |
| 4 | Onboarding | TikTok OAuth Callback | `/auth/tiktok/callback` |
| 5 | Dashboard | Dashboard Home | `/dashboard` |
| 6 | Trends | Trend List | `/dashboard/trends` |
| 7 | Trends | Trend Detail | `/dashboard/trends/{id}` |
| 8 | Audience | Audience Intelligence | `/dashboard/audience` |
| 9 | Content | Content Ideas List | `/dashboard/content` |
| 10 | Content | Content Idea Detail | `/dashboard/content/{id}` |
| 11 | Content | Content Calendar | `/dashboard/content/calendar` |
| 12 | Content | AI Script Generator | `/dashboard/content/generate` |
| 13 | Analytics | Analytics | `/dashboard/analytics` |
| 14 | Learning | Learning Engine | `/dashboard/learning` |
| 15 | AI | AI Engine | `/dashboard/ai` |
| 16 | Settings | Settings Layout | `/settings/*` |
| 17 | Settings | Account | `/settings/account` |
| 18 | Settings | Connected Accounts | `/settings/accounts` |
| 19 | Settings | AI Budget | `/settings/ai-budget` |
| 20 | Settings | Notifications | `/settings/notifications` |
| 21 | Global | Notification Panel | (overlay) |
| 22 | Global | 404 Not Found | — |
| 23 | Global | 500 Error | — |
| 24 | SaaS | Pricing / Plans | `/pricing` |
| 25 | SaaS | Billing Management | `/settings/billing` |
| 26 | SaaS | Team Members | `/settings/team` |

