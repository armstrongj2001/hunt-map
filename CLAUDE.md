# HuntMap — Project Context for Claude Code

## About Me
I'm Jobi — a construction business owner in Denver building this app as a side project. I'm technically advanced but a beginner-level coder. I know Python best and I'm learning React Native/JavaScript as I go.

## How to Work With Me
- **Explain before acting** — tell me what you're about to do and why before writing code
- **Confirm before large changes** — especially file deletions, database changes, or architectural shifts
- **Keep code simple and well-commented** — I need to be able to read and understand everything
- **Break work into small steps** — one task at a time, verify it works, then move on
- **No assumptions** — if something is ambiguous, ask me

## Project Overview
HuntMap is a cross-platform app (iOS, Android, and Web) where anyone can create and play interactive GPS-based treasure hunts and scavenger hunts with AI-assisted storytelling. Two user types: Creators (build hunts) and Players (play hunts). Both roles available to all users.

## Platform Strategy
This is a single Expo codebase that targets three platforms: iOS, Android, and Web.

### What works on ALL platforms (mobile + web):
- Account creation, login, profile management
- Hunt creation wizard (map, checkpoints, clues, stories)
- AI-assisted clue/story/hint generation
- Hunt browsing and discovery
- Join a hunt by code or link
- Leaderboards and team standings
- Creator dashboard and analytics
- Hunt history and completion stats

### What is MOBILE-ONLY:
- Active GPS tracking during a hunt (walking to checkpoints)
- QR code scanning at checkpoints
- Push notifications
- Background location updates

### How to handle mobile-only features on web:
- Show a friendly "Continue on your phone" prompt with a QR code or deep link when a user tries to start playing a hunt in the browser
- The web player dashboard shows hunt progress, but the actual walking/scanning happens on mobile

### Responsive Design Rules:
- Mobile: bottom tab navigation, single-column layouts, touch-optimized
- Web/Desktop: sidebar navigation, multi-column layouts where appropriate (e.g., map + checkpoint list side by side), hover states
- Use `Platform.OS` and `useWindowDimensions()` to adapt layouts
- Creator tools (hunt builder, checkpoint editor) should feel especially good on desktop — big map, spacious forms, drag-and-drop reordering

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend (all platforms) | React Native (Expo) with Expo Web |
| Backend API | Django + Django REST Framework |
| Database | PostgreSQL + PostGIS |
| Auth | djangorestframework-simplejwt + django-allauth |
| AI Engine | Claude API (clue/story/hint generation) |
| Maps (mobile) | react-native-maps (Google Maps provider) |
| Maps (web) | react-leaflet or @react-google-maps/api (conditional swap) |
| QR Codes | expo-camera (scan, mobile only) + python-qrcode (generate, backend) |
| Hosting | Railway or Render (backend) + Expo EAS (mobile) + Vercel or Netlify (web) |

### Map Component Strategy
`react-native-maps` does NOT render on web. We need a platform-aware wrapper:

```
components/
├── Map/
│   ├── index.tsx          ← platform router, exports the right component
│   ├── Map.native.tsx     ← uses react-native-maps (iOS/Android)
│   ├── Map.web.tsx        ← uses react-leaflet or Google Maps JS API
│   └── Map.types.ts       ← shared prop types
```

Use the `.native.tsx` / `.web.tsx` file extension convention — Expo automatically picks the right file per platform. Both components should accept the same props (center, zoom, markers, onMarkerPress, onMapPress, etc.) so the rest of the app doesn't care which platform it's on.

## Project Structure
```
huntmap/
├── CLAUDE.md              ← you are here
├── docs/
│   ├── ai_knowledge_base.md   ← AI hunt design reference (read when building AI features)
│   └── roadmap.md              ← full project roadmap
├── huntmap_api/                ← Django backend
│   ├── config/                 ← Django settings, urls, wsgi
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── users/                  ← Custom user app
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── hunts/                  ← Hunts, checkpoints, teams
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── ai/                     ← Claude API integration (Phase 2)
│   │   ├── services.py
│   │   ├── prompts.py
│   │   └── views.py
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
└── HuntMapMobile/              ← Expo app (iOS + Android + Web)
    ├── src/
    │   ├── api/                ← API client + auth helpers
    │   ├── components/         ← Shared components (incl. platform-aware Map)
    │   ├── navigation/         ← Tab nav + auth navigator
    │   └── screens/            ← Login, SignUp, Home, Create, Play, Profile
    ├── App.js                  ← Entry point
    ├── app.json                ← Expo config (web enabled)
    └── package.json
```

## Data Models

### Users App
**User** (extends AbstractUser)
- email, username, display_name, avatar_url, date_joined

### Hunts App
**Hunt**
- title, description, theme, game_mode (competitive/freeplay), status (draft/published/archived), join_code (unique auto-generated), creator (FK→User), created_at, updated_at

**Checkpoint**
- hunt (FK→Hunt), order (int), latitude (float), longitude (float), clue_text, hint_text, qr_data (UUID auto-generated), photo_url (optional), created_at

**Team**
- hunt (FK→Hunt), name, score (default 0), started_at, completed_at

**TeamMembership**
- team (FK→Team), user (FK→User), role (leader/member), joined_at

**CompletionRecord**
- checkpoint (FK→Checkpoint), user (FK→User), team (FK→Team, nullable), method (GPS/QR), completed_at, hints_used (int)

**HuntStory**
- hunt (OneToOne→Hunt), narrative_text, ai_generated (bool), edited (bool)

## API Endpoints

### Auth
- `POST /api/auth/register/` — user registration
- `POST /api/auth/login/` — returns JWT token pair
- `POST /api/auth/refresh/` — refresh JWT token

### Users
- `GET /api/users/me/` — current user profile
- `PATCH /api/users/me/` — update profile

### Hunts
- `GET /api/hunts/` — list hunts (filterable: my hunts, public, nearby)
- `POST /api/hunts/` — create hunt (auth required)
- `GET /api/hunts/{id}/` — hunt detail
- `PATCH /api/hunts/{id}/` — update hunt (creator only)
- `DELETE /api/hunts/{id}/` — delete hunt (creator only)
- `GET /api/hunts/join/{code}/` — join a hunt by code

### Checkpoints
- `GET /api/hunts/{id}/checkpoints/` — list checkpoints for a hunt
- `POST /api/hunts/{id}/checkpoints/` — add checkpoint (creator only)
- `PATCH /api/hunts/{id}/checkpoints/{cp_id}/` — update checkpoint
- `DELETE /api/hunts/{id}/checkpoints/{cp_id}/` — delete checkpoint

### Teams
- `POST /api/hunts/{id}/teams/` — create team
- `POST /api/hunts/{id}/teams/{team_id}/join/` — join team
- `GET /api/hunts/{id}/leaderboard/` — hunt leaderboard

### AI (Phase 2)
- `POST /api/ai/generate-clues/` — generate clue options for a checkpoint
- `POST /api/ai/generate-story/` — generate narrative for a hunt
- `POST /api/ai/generate-hints/` — generate tiered hints for a clue

## Backend Dependencies (requirements.txt)
```
django
djangorestframework
djangorestframework-simplejwt
django-allauth
django-cors-headers
django-filter
psycopg2-binary
python-dotenv
python-qrcode
pillow
anthropic
celery
redis
```

## Development Phases

### Phase 1: Foundation (current)
Backend API + cross-platform app shell with auth.
- ✅ Django project setup with PostgreSQL/PostGIS
- ✅ User model + JWT auth endpoints
- ✅ Hunt and Checkpoint models + CRUD endpoints
- ✅ Expo project initialization with web support enabled
- ✅ Auth screens (login/register) working on mobile AND web
- ✅ Bottom tab navigation (mobile)
- ✅ Platform-aware map component (react-native-maps on mobile, placeholder on web)
- Responsive navigation: sidebar on web (Phase 2 priority)
- react-leaflet web map (Phase 2 priority)

### Phase 2: Hunt Creator
Full hunt creation flow with AI-assisted clue/story generation.
- Hunt creation wizard (optimized for desktop web AND mobile)
- Interactive map with checkpoint pin dropping (works on both platforms)
- Checkpoint editor with manual + AI clue generation
- AI story generator connecting all checkpoints
- QR code generation per checkpoint
- Hunt preview and publish flow

### Phase 3: Player Experience
Players join and complete hunts with real-time tracking.
- Join hunt by code/link/QR (all platforms)
- Active hunt map with progressive checkpoint reveals (mobile)
- GPS proximity detection + QR scan verification (mobile)
- Web player dashboard: progress view, leaderboard, "continue on phone" prompt
- Clue display with tiered hint system
- Progress tracking and completion screen

### Phase 4: Competition & Social
Leaderboards, scoring, discovery, sharing.

### Phase 5: Polish & Launch
App Store + web deployment, beta testing, performance optimization.

## Key Decisions Already Made
- **Three platforms from one codebase:** iOS, Android, Web via Expo
- **Web is full-featured for creators**, lightweight dashboard for players, mobile-only for active GPS play
- **Map component is platform-aware:** react-native-maps on mobile, react-leaflet on web, same props interface
- **Responsive navigation:** bottom tabs on mobile, sidebar on desktop/web (sidebar coming in Phase 2)
- Game modes: competitive (scored, timed) AND free-play (relaxed, no scoring) — toggled per hunt
- Players: both solo AND team play supported
- Checkpoint verification: GPS proximity (~30m radius) AND QR code scanning (mobile only)
- AI output: always treated as editable drafts, never auto-published
- All AI-generated content must be fully editable by creators
- Monetization: free for now, architecture supports future premium features
- PostGIS required for spatial queries (geofencing, proximity, nearby hunts)

## Git Info
- GitHub username: armstrongj2001
- Repo: hunt-map
- Commit early and often with clear messages

## Environment
- WSL2 Ubuntu on Windows (machine: jobilegion, user: jobi)
- Python 3.10+
- PostgreSQL with PostGIS extension
- Node.js for Expo/React Native
- Web dev server: `npx expo start --web` (runs on localhost:8081)
- Django dev server: `venv/bin/python manage.py runserver` (runs on localhost:8000)

## Reference Docs
When building AI features, read `docs/ai_knowledge_base.md` first — it contains:
- Treasure hunt design principles and best practices
- 15+ puzzle/clue mechanic types the AI should generate
- Themed template breakdowns (Easter, Halloween, Christmas, Birthday, etc.)
- Competitive analysis of GooseChase, Eventzee, Actionbound, etc.
- AI prompt engineering guidelines for clue/story/hint generation
- Scoring formulas and content pattern libraries
