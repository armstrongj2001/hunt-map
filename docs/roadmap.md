# TREASURE HUNT APP
## Product Roadmap & Technical Architecture
### Working Title: HuntMap

**Version 1.0 | April 2026**
**Jobi Armstrong | Built with Claude**

---

## 1. Product Vision

HuntMap is a mobile-first platform where anyone can create and play interactive treasure hunts and scavenger hunts. Creators build immersive GPS-based experiences with AI-assisted storytelling, and players explore real-world locations to solve clues, scan QR codes, and compete on leaderboards.

The app serves two user types equally: **Creators** who design hunts with maps, checkpoints, clues, and narratives; and **Players** who join hunts, navigate to locations, solve puzzles, and track progress.

---

## 2. Technology Stack

| Layer | Technology & Rationale |
|---|---|
| Mobile Frontend | React Native (Expo) — Single codebase for iOS + Android. Expo simplifies builds, OTA updates, and access to maps/camera/GPS. |
| Backend API | Django + Django REST Framework (Python) — Leverages existing Python skills. Handles auth, models, API endpoints. |
| Database | PostgreSQL + PostGIS — Spatial queries for GPS geofencing, proximity detection, and map-based checkpoint management. |
| AI Engine | Claude API — Generates clue text, riddles, storylines, and hints. All AI output is fully editable by creators. |
| Maps | React Native Maps (Google Maps provider) — Checkpoint pins, player tracking, route visualization. |
| Auth | Django Allauth + JWT tokens — Email/password and social login (Google, Apple). |
| QR Codes | expo-camera (scanning) + python-qrcode (generation) — QR codes link to specific checkpoints. |
| Hosting | Railway or Render (backend) + Expo EAS (mobile builds) — Simple deployment, scales later. |

---

## 3. Development Phases

### Phase 1: Foundation (Weeks 1–4)
**Goal:** Backend API + basic mobile shell with authentication. Get a working login flow and empty map screen.

**Backend Tasks:**
- Initialize Django project with REST framework and PostgreSQL/PostGIS
- User model with registration, login, JWT token auth
- Hunt model: title, description, creator, status (draft/published/archived), game mode (competitive/freeplay)
- Checkpoint model: hunt FK, GPS coordinates, order, clue text, hint text, QR code data
- Team model: hunt FK, name, members, score
- Basic API endpoints: CRUD for hunts, checkpoints, user profile

**Mobile Tasks:**
- Initialize Expo/React Native project
- Auth screens: sign up, login, forgot password
- Bottom tab navigation: Home, Create, Play, Profile
- Empty map screen with GPS location permission
- API service layer connecting to Django backend

**Deliverable:** A user can register, log in, and see a map with their current location.

---

### Phase 2: Hunt Creator (Weeks 5–8)
**Goal:** Full hunt creation flow where a user can build a complete treasure hunt with map, checkpoints, and clues.

**Creator Flow:**
- "New Hunt" wizard: title, description, theme/category, game mode toggle
- Interactive map: tap to drop checkpoint pins, drag to reorder, long-press to edit
- Checkpoint editor: clue text (manual input), hint text, photo upload for location reference
- AI Clue Assistant: button to generate clue/riddle via Claude API based on location name + theme
- AI output appears as editable draft — creator can accept, edit, regenerate, or replace with manual text
- AI Story Generator: input a theme/narrative and auto-generate a storyline connecting all checkpoints
- QR code auto-generation per checkpoint (downloadable/printable PDF)
- Hunt preview mode: walk through the hunt as a player would see it
- Publish flow: generates a shareable join code + deep link

**Deliverable:** A creator can build a full multi-checkpoint hunt with AI-assisted clues, preview it, and publish a join code.

---

### Phase 3: Player Experience (Weeks 9–12)
**Goal:** Players can join, play, and complete treasure hunts with real-time progress tracking.

**Player Flow:**
- Join hunt via code entry, deep link, or QR scan
- Hunt lobby: see description, checkpoint count, estimated time, choose solo or create/join team
- Active hunt map: shows current checkpoint marker (next clue location), hides future checkpoints
- GPS proximity detection: auto-trigger when player is within ~30m of checkpoint
- QR scan option: scan the physical QR code at the checkpoint location to verify arrival
- Clue reveal screen with optional hint button (hint costs points in competitive mode)
- Progress tracker: checkpoints completed, time elapsed, team status
- Hunt completion screen: total time, score, stats summary

**Deliverable:** A player can join a published hunt, navigate to checkpoints via GPS/QR, solve clues, and complete the hunt.

---

### Phase 4: Competition & Social (Weeks 13–16)
**Goal:** Leaderboards, scoring, and social features that make hunts replayable and shareable.

- Scoring engine: points for completion, speed bonuses, hint penalties
- Live leaderboard per hunt: solo and team rankings with real-time updates
- Hunt feed/discovery: browse public hunts by location, rating, popularity
- Rating & review system for completed hunts
- Creator dashboard: views, completions, average rating, player feedback
- Share hunt results to social media (screenshot card with stats)
- Push notifications: hunt invites, team updates, new hunts nearby

**Deliverable:** Full competitive mode with leaderboards, public hunt discovery, and social sharing.

---

### Phase 5: Polish & Launch Prep (Weeks 17–20)
**Goal:** App Store readiness, performance, and reliability.

- Offline mode: cache active hunt data for areas with poor signal
- Performance optimization: map rendering, image loading, API response times
- Accessibility pass: screen reader support, color contrast, font sizing
- App Store assets: screenshots, description, preview video
- TestFlight / internal beta with 10–20 testers
- Bug fixes and UX refinements from beta feedback
- Analytics integration: track user flows, hunt completion rates, drop-off points
- Submit to Apple App Store + Google Play Store

**Deliverable:** Published app on both app stores.

---

## 4. Core Data Model

| Model | Key Fields | Relationships |
|---|---|---|
| User | email, username, display_name, avatar, date_joined | Has many Hunts (as creator), has many TeamMemberships |
| Hunt | title, description, theme, game_mode, status, join_code, created_at | Belongs to User (creator), has many Checkpoints, has many Teams |
| Checkpoint | hunt_id, order, latitude, longitude, clue_text, hint_text, qr_data, photo_url | Belongs to Hunt, has many CompletionRecords |
| Team | hunt_id, name, score, started_at, completed_at | Belongs to Hunt, has many TeamMemberships |
| TeamMembership | team_id, user_id, role (leader/member), joined_at | Belongs to Team and User |
| CompletionRecord | checkpoint_id, user_id, team_id, method (GPS/QR), completed_at, hints_used | Belongs to Checkpoint, User, and optionally Team |
| HuntStory | hunt_id, narrative_text, ai_generated (bool), edited (bool) | Belongs to Hunt |

---

## 5. AI Integration Design

The Claude API powers three creator-facing features. All AI output is treated as a draft — never auto-published.

### 5a. Clue Generator
- **Input:** checkpoint location name, hunt theme, difficulty preference
- **Output:** 2–3 clue options (riddle, descriptive, cryptic) that the creator can pick, edit, or regenerate
- **Example prompt pattern:** "Write 3 treasure hunt clues for a checkpoint at [Cheesman Park pavilion]. Theme: [Denver history mystery]. Difficulty: [medium]. Return as JSON array."

### 5b. Story/Narrative Generator
- **Input:** list of all checkpoint names/locations + overall theme
- **Output:** a connecting narrative that ties all stops into a cohesive storyline with an intro, per-checkpoint story beats, and a finale

### 5c. Hint Generator
- **Input:** the original clue text + checkpoint location
- **Output:** a progressively easier hint (3 levels: subtle nudge, moderate help, near-giveaway)

---

## 6. Getting Started — First Sprint Plan

**Week 1 focus:** Get both projects initialized, connected, and a user can register via the mobile app.

**Day 1–2: Backend Setup**
- Create Django project: `huntmap_api`
- Configure PostgreSQL + PostGIS
- Install djangorestframework, djangorestframework-simplejwt, django-allauth
- Create User model with registration + login endpoints
- Test with Postman/curl

**Day 3–4: Mobile Setup**
- `npx create-expo-app HuntMap`
- Install react-navigation, react-native-maps, expo-camera, expo-location
- Build auth screens (sign up, login) with API connection
- Build bottom tab navigator (Home, Create, Play, Profile — placeholder screens)

**Day 5: Integration**
- Connect mobile auth flow to Django JWT endpoints
- Display map with user's current GPS location on Home tab
- Commit everything to GitHub repo

---

## 7. Future Monetization Options (Post-Launch)

Kept separate from MVP, but the architecture supports all of these:
- Premium hunt templates and AI-generated themed packs
- Creator subscription for advanced analytics and unlimited AI generations
- Sponsored/branded hunts for businesses and tourism boards
- In-app tip jar for creators
- White-label version for corporate team-building events

---

## 8. Key Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| GPS accuracy indoors/urban canyons | Players can't trigger checkpoints | QR code fallback at every checkpoint; adjustable proximity radius |
| React Native learning curve | Slow development velocity | Expo simplifies setup; Claude Code assists with JS/React patterns |
| App Store review delays | Launch timeline slips | Submit early; use TestFlight for beta; plan 2-week review buffer |
| AI-generated clue quality | Poor user experience | Always editable; multiple options generated; creator approval required |
| Battery drain from continuous GPS | Negative reviews | Use significant-change location updates; batch GPS checks; show battery tips |
