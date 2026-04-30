# HuntMap Design Brief
## Visual Design System for Claude Code

---

## Design Philosophy

HuntMap should feel like **an adventure waiting to happen** — not a corporate tool, not a chat interface. Think of it as the love child of AllTrails and Duolingo: map-centric, playful but polished, outdoorsy but modern.

The design should:
- Put the MAP front and center — it's the hero of every screen
- Feel warm and inviting, not cold and techy
- Celebrate accomplishment (completing checkpoints should feel rewarding)
- Be dead simple for beginners but deep enough for power creators
- Look equally great on a phone screen and a desktop browser

---

## Color Palette

### Primary Colors
| Name | Hex | Usage |
|------|-----|-------|
| Forest | `#1A3C34` | Primary brand color. Headers, nav bars, dark backgrounds, primary buttons |
| Evergreen | `#2D6A4F` | Secondary green. Map pins, checkpoint markers, success states, active elements |
| Gold | `#D4A847` | Accent highlight. Stars, achievements, 1st place, premium elements, CTA highlights |
| Campfire | `#E8734A` | Action/energy. Primary CTA buttons, notifications, urgent elements, competitive mode accents |

### Neutral Colors
| Name | Hex | Usage |
|------|-----|-------|
| Parchment | `#F7F5F0` | Page background. Warm off-white that feels like an old treasure map |
| White | `#FFFFFF` | Card backgrounds, input fields, overlays |
| Charcoal | `#1C1C1A` | Primary text color |
| Slate | `#5F5E5A` | Secondary text, captions, timestamps |
| Stone | `#B4B2A9` | Borders, dividers, disabled states |
| Sand | `#D6D3CB` | Light borders, subtle separators |

### Semantic Colors
| Name | Hex | Usage |
|------|-----|-------|
| Trail Blue | `#3B82F6` | Links, info badges, GPS/location indicators |
| Success Green | `#22C55E` | Checkpoint completed, hunt finished, correct answer |
| Warning Amber | `#F59E0B` | Hints used, time running low, caution states |
| Error Red | `#EF4444` | Failed attempt, wrong answer, error messages |

### Themed Color Overrides
The app supports themed hunts. When a themed hunt is active, accent colors can shift:
- **Halloween:** Forest → `#1A1A2E`, Gold → `#FF6B00`, Campfire → `#8B0000`
- **Easter:** Forest → `#4A7C59`, Gold → `#FFD700`, Campfire → `#FF69B4`
- **Christmas:** Forest → `#0C3823`, Gold → `#FFD700`, Campfire → `#C41E3A`
- **Pirate:** Forest → `#2C1810`, Gold → `#DAA520`, Campfire → `#8B0000`

These are optional — the default palette works for everything. Theme overrides are Phase 4+.

---

## Typography

### Font Stack
```
Primary: 'Inter', system-ui, -apple-system, sans-serif
Monospace: 'JetBrains Mono', 'Fira Code', monospace (for codes, data, timers)
```

Inter is free, gorgeous on screens, and has excellent readability at all sizes. It's already popular in modern app design (Linear, Vercel, Raycast all use it).

### Type Scale
| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Page title / Hero headline | 32px | 700 (bold) | Forest `#1A3C34` |
| Section heading | 24px | 600 (semibold) | Charcoal `#1C1C1A` |
| Card title / Subheading | 18px | 600 | Charcoal `#1C1C1A` |
| Body text | 16px | 400 (regular) | Charcoal `#1C1C1A` |
| Secondary / Caption | 14px | 400 | Slate `#5F5E5A` |
| Small label / Tag | 12px | 500 (medium) | Varies by context |
| Overline / Category label | 11px | 600, uppercase, letter-spacing 0.5px | Slate `#5F5E5A` |

### Line Heights
- Headings: 1.2
- Body text: 1.6
- Captions: 1.4

---

## Component Library

### Buttons

**Primary CTA (Campfire)**
```
background: #E8734A
color: #FFFFFF
border-radius: 12px
padding: 14px 28px
font-size: 16px
font-weight: 600
```
Use for: "Start Hunt", "Create Hunt", "Publish", "Join"

**Secondary (Forest outline)**
```
background: transparent
color: #1A3C34
border: 1.5px solid #1A3C34
border-radius: 12px
padding: 14px 28px
```
Use for: "Preview", "Save Draft", "Cancel"

**Ghost (minimal)**
```
background: transparent
color: #5F5E5A
border: none
padding: 8px 16px
```
Use for: "Skip", "Maybe Later", inline actions

### Cards

**Hunt Card (discovery feed)**
```
background: #FFFFFF
border-radius: 16px
border: 1px solid #D6D3CB
overflow: hidden
```
- Top: Map thumbnail or hero image (16:9 ratio)
- Bottom: Hunt title (18px bold), creator name, distance, rating stars (Gold), difficulty badge
- Subtle shadow on hover (web): `box-shadow: 0 4px 12px rgba(0,0,0,0.08)`

**Checkpoint Card (creator view)**
```
background: #FFFFFF
border-radius: 12px
border: 1px solid #D6D3CB
padding: 16px
```
- Left: Numbered circle (Evergreen bg, white text)
- Center: Clue preview text, type badge (Riddle/Cipher/Trivia), difficulty badge
- Right: Drag handle (reorder), edit/delete icons

**Stat Card (leaderboard/dashboard)**
```
background: #F7F5F0
border-radius: 12px
padding: 16px
```
- Muted label (12px, Slate)
- Big number (28px, bold, Forest)
- Trend indicator if applicable

### Map Pins

**Checkpoint pin (not yet visited)**
- Evergreen `#2D6A4F` pin shape with white number inside
- Subtle pulse animation to draw attention

**Checkpoint pin (completed)**
- Gold `#D4A847` pin with white checkmark
- Brief celebration burst animation on completion

**Checkpoint pin (current/active)**
- Campfire `#E8734A` pin, slightly larger, with animated ring pulse

**Player location**
- Trail Blue `#3B82F6` dot with semi-transparent blue radius ring

### Badges / Pills

Small colored pills for tagging content:
```
font-size: 12px
font-weight: 500
padding: 4px 12px
border-radius: 20px
```

| Badge | Background | Text Color |
|-------|-----------|------------|
| Easy | `#E8F5E9` | `#2D6A4F` |
| Medium | `#FFF3E0` | `#8B5E34` |
| Hard | `#FCE4EC` | `#C62828` |
| Riddle | `#E8F5E9` | `#2D6A4F` |
| Cipher | `#E8EAF6` | `#3B82F6` |
| Trivia | `#FFF3E0` | `#8B5E34` |
| GPS | `#E6F1FB` | `#185FA5` |
| QR Code | `#F3E5F5` | `#7B1FA2` |
| AI Generated | `#EEEDFE` | `#534AB7` |
| Competitive | `#FCE4EC` | `#C62828` |
| Free Play | `#E8F5E9` | `#2D6A4F` |

### Navigation

**Mobile — Bottom Tab Bar**
```
background: #FFFFFF
border-top: 1px solid #D6D3CB
height: 64px
```
- 4 tabs: Home (compass icon), Create (+ icon), Play (map icon), Profile (person icon)
- Active tab: Evergreen `#2D6A4F` icon + label
- Inactive tab: Stone `#B4B2A9` icon, no label

**Web — Sidebar**
```
background: #1A3C34
width: 240px
color: #FFFFFF
```
- Logo at top
- Nav items with icons: Discover, Create, My Hunts, Profile
- Active item: `background: rgba(255,255,255,0.1)`, Gold left border accent
- Collapsed mode: 64px width, icons only

### Progress Indicators

**Hunt progress bar**
```
background: #D6D3CB (track)
foreground: linear-gradient(90deg, #2D6A4F, #D4A847) (fill)
height: 8px
border-radius: 4px
```

**Checkpoint completion circle**
- Ring that fills as checkpoints complete
- Evergreen ring, Gold fill on completion
- Center shows "4/10" style count

---

## Screen Layouts

### Home / Discover (all platforms)
- **Mobile:** Full-screen map with floating search bar at top, "Hunts near you" card carousel at bottom (peek-up, swipe to expand)
- **Web:** Map takes 60% left, hunt feed list takes 40% right. Search/filter bar above the list.

### Hunt Creator (optimized for web)
- **Web:** Two-panel layout. Left: large interactive map (60%) for dropping pins. Right: checkpoint list + editor panel (40%) with forms, AI generate button, preview.
- **Mobile:** Single column. Map at top (40% height), scrollable checkpoint list below. Tap a checkpoint to open full-screen editor.

### Active Hunt / Player (mobile-primary)
- Full-screen map with current checkpoint highlighted
- Bottom sheet: current clue card (swipe up for full text + hints)
- Top bar: progress dots, timer (if competitive), team name
- **Web:** Shows read-only progress dashboard with map + clue text + leaderboard. "Continue on your phone" CTA.

### Profile
- Avatar, username, stats grid (hunts created, hunts completed, total distance)
- Tab bar: My Hunts | Completed | Achievements
- Grid of hunt cards below

### Landing Page (web only, pre-auth)
- **Hero:** Big headline ("Turn any place into an adventure") + phone mockup showing map with pins + "Get Started Free" CTA
- **How it works:** 3-step: Create → Share → Play, with illustrations
- **Features:** Alternating left/right sections with screenshots: AI Clue Generator, GPS + QR, Competitive Mode, Themed Hunts
- **Social proof:** Placeholder for testimonials/ratings (post-launch)
- **Footer CTA:** "Start your first hunt" + App Store buttons

---

## Design Inspiration References

Tell Claude Code to reference these apps for specific patterns:

| App | What to study |
|-----|--------------|
| **AllTrails** | Map-centric home screen, trail cards with thumbnails + ratings, clean detail pages |
| **Strava** | Leaderboards, activity feeds, achievement badges, social competition UI |
| **Airbnb** | Step-by-step creation wizard, smooth onboarding flow, card-based discovery |
| **Duolingo** | Gamification: progress bars, streak counters, celebration animations, XP/points display |
| **Notion** | Creator tools: clean editors, drag-and-drop reordering, toggle switches |
| **Figma** | Sidebar navigation on web, multi-panel workspace layout |

---

## Spacing System

Use consistent spacing based on a 4px grid:
- `4px` — tight internal gaps (icon to label)
- `8px` — compact spacing (between badges, between small elements)
- `12px` — default gap (grid gaps, card internal padding elements)
- `16px` — standard padding (card padding, section gaps)
- `24px` — comfortable breathing room (between cards, between sections)
- `32px` — major section spacing
- `48px` — page-level section breaks

---

## Animations & Micro-interactions

Keep animations subtle and purposeful:

- **Checkpoint completed:** Gold burst/confetti from the pin, 0.5s duration, then pin turns Gold with checkmark
- **Hunt completed:** Full-screen celebration overlay with stats summary, confetti, and share button
- **Button press:** Slight scale down (0.97) on press, bounce back
- **Card hover (web):** Lift with subtle shadow, 200ms ease
- **Map pin appear:** Fade in + slight bounce from above, staggered per pin
- **Progress bar fill:** Smooth animated fill, 300ms ease-out
- **Pull-to-refresh:** Custom compass animation instead of default spinner

---

## Icon Style

Use **Lucide Icons** (free, clean, consistent) as the icon library:
- Stroke width: 1.5px (matches the app's clean aesthetic)
- Size: 24px default, 20px in nav, 16px inline
- Color: inherits from parent (follows the text color rules above)

Key icons needed:
- Navigation: `compass`, `plus-circle`, `map`, `user`
- Hunts: `map-pin`, `flag`, `trophy`, `clock`, `users`
- Creator: `sparkles` (AI), `qr-code`, `edit`, `grip-vertical` (drag), `eye` (preview)
- Status: `check-circle`, `lock`, `unlock`, `star`

---

## Dark Mode (Phase 5)

Not needed for MVP, but the color system supports it:
- Parchment `#F7F5F0` → Dark surface `#1C1C1A`
- White cards → `#2C2C2A`
- Forest `#1A3C34` stays (works on dark)
- Gold and Campfire stay (they pop on dark backgrounds)
- Text inverts: Charcoal → White, Slate → `#A8A8A4`

---

*This document should be placed at `docs/design_brief.md` in the project. Claude Code should reference it when building any UI component.*
