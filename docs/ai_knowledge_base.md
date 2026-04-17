# HuntMap AI Knowledge Base

## Research Document for Training the In-App AI Hunt Creator

*Version 1.0 — April 2026*
*Reference document for Claude API prompt engineering within HuntMap*

---

## 1. The Anatomy of a Great Treasure Hunt

### Core Design Principles

The best treasure hunts share a set of foundational principles that separate forgettable experiences from unforgettable ones. Here's what the research tells us:

**Start with Purpose, Then Create a "Perceived Purpose"**
Every great hunt has two layers. The real purpose might be a birthday, proposal, team-building event, or just family fun. But the *perceived purpose* is what the player believes — they're an initiate in a secret organization, a detective solving a cold case, a pirate tracking down lost treasure. This narrative wrapper is what turns a sequence of clues into an *adventure*. The AI should always prompt creators to define both layers.

**Anchor Points Are Everything**
The concept of "anchor points" — must-stop locations — is central to good hunt design. The most important anchor point is always the finale. Creators should plan the ending first, then the beginning, then fill in the middle. A good rule of thumb from experienced hunt designers: no location should be more than 15 minutes of travel from the previous one.

**Always Err on the Side of Too Easy**
This is the single most repeated piece of advice across every source. First-time hunt creators almost always make their hunts too hard. Puzzles that seem simple to the creator are often stumbling blocks for players. The AI should default to medium difficulty and include a difficulty slider. When in doubt, make instructions clearer and puzzles simpler.

**Vary the Challenge Types**
Hitting players with nothing but riddles will burn them out. Hitting them with nothing but "go find this" will bore them. The best hunts mix physical challenges, brain teasers, observation tasks, creative prompts, and simple "go here" waypoints. The AI should automatically suggest a varied sequence.

**Keep It Under 2-3 Hours for Beginners**
Brain fatigue is real. For first-time creators, the sweet spot is 2-3 hours with 8-12 checkpoints. Experienced creators can push to 4-6 hours max. The AI should recommend checkpoint counts based on the creator's estimated play time.

**Build In Contingency**
Things go wrong in real-world hunts — a hidden clue gets moved, weather changes, a location closes. The AI should remind creators to think about backup plans, especially for outdoor GPS-based checkpoints.

---

## 2. Gambit Types (Puzzle & Clue Mechanics)

The term "gambit" refers to any mechanic used to propel a player to the next stop. These fall into three main categories, each with multiple subtypes the AI should be able to generate:

### Category A: Dead Drops (Hide & Find)

The creator physically hides something for the player to find. In HuntMap's case, this translates to GPS proximity triggers and QR code placements.

- **Simple waypoint:** Walk to the GPS pin, arrive within radius, clue unlocks
- **QR code scan:** Find and scan a physical QR code at the location
- **Photo verification:** Take a photo of a specific thing at the location (future feature)
- **Observation challenge:** "Count the windows on the red building" — answer unlocks next clue

### Category B: Decodes (Solve to Proceed)

The player must solve a puzzle or decode a message to get the next location or clue.

**Cipher Types the AI Can Generate:**

- **Substitution cipher:** Each letter replaced with a symbol, number, or different letter (A=1, B=2, etc.)
- **Caesar shift:** Letters shifted by a fixed number (A→D, B→E with a shift of 3)
- **Book/Ottendorf cipher:** Numbers reference page-line-word in a given text. Great for location-based hunts near plaques or signs
- **Reverse text:** Message written backwards
- **Mirror writing:** Text that reads correctly in a mirror
- **Morse code:** Dots and dashes
- **Braille patterns:** Tactile code as a visual puzzle
- **Pigpen cipher:** Geometric shapes replacing letters
- **Emoji substitution:** Modern twist — each emoji represents a letter

**Puzzle Types the AI Can Generate:**

- **Riddles:** Rhyming or prose clues that describe a location without naming it
- **Anagrams:** Scrambled letters that spell the next location
- **Word searches:** Hidden word in a letter grid reveals the destination
- **Crossword fragments:** Solve mini-crossword, highlighted letters spell the answer
- **Math/logic puzzles:** Solve equations where the answer is a GPS coordinate fragment, a door code, or a clue number
- **Rebus puzzles:** Pictures + letters that combine to form a word
- **Trivia questions:** Answer reveals a number or word needed for the next step
- **Jigsaw/fragment puzzles:** Digital image cut into pieces, assemble to reveal location photo
- **Map coordinates:** Given compass bearing + distance from a known point
- **Pattern recognition:** Complete a number or letter sequence

### Category C: Handoffs (Human Interaction)

A real person delivers a clue or performs a role. In HuntMap's digital context, this could be simulated through:

- **NPC text messages:** In-app "character" sends a clue at the right moment
- **Audio/video clues:** Pre-recorded message from a "character" unlocks at a checkpoint
- **Challenge tasks:** "Tell the barista the secret password" (cooperative with local businesses — future feature)

### The Golden Rule of Gambit Mixing

The AI should never generate a hunt that uses the same gambit type for more than 2 consecutive checkpoints. A great 10-checkpoint hunt might flow like:

1. Riddle → 2. GPS waypoint → 3. Cipher decode → 4. Photo observation → 5. Trivia → 6. Anagram → 7. GPS waypoint → 8. Math puzzle → 9. Riddle → 10. Final reveal

---

## 3. Themed Hunt Templates

The AI should ship with rich themed templates that provide pre-built narrative frameworks, themed clue language, visual style suggestions, and age-appropriate difficulty. Here are the key themes to support:

### Holiday Themes

**Easter**
- Narrative: The Easter Bunny has hidden special eggs around [location], each containing a clue to the Grand Basket
- Clue style: Rhyming couplets, spring/nature imagery, pastel color palette
- Mechanics: Egg-shaped QR codes, springtime riddles, "count the flowers" observation tasks
- Difficulty: Typically family-friendly (ages 5+), offer "little kids" and "big kids" variants
- Finale: Discovery of the Easter basket or golden egg

**Halloween**
- Narrative: A mysterious curse has fallen on [location]. Solve the spooky puzzles to lift it before midnight
- Clue style: Gothic/creepy language, dark humor, monster riddles, potion ingredient collecting
- Mechanics: Blacklight-style reveals (dark UI elements), "haunted" checkpoints, spooky trivia
- Special elements: Curse/spell mechanics where wrong answers trigger a "curse" penalty, monster encounters at waypoints
- Difficulty: Scale from "family spooky" (age 6+) to "teen horror" (age 13+)
- Finale: Break the curse, find the witch's treasure, escape the haunted trail

**Christmas / Holiday Season**
- Narrative: Santa's elves have scattered gifts across [location] and need help collecting them before Christmas Eve
- Clue style: Holiday cheer, carol references, winter imagery, gift-wrapping themes
- Mechanics: "Naughty or Nice" quiz elements, ornament collection, 12-days-of-Christmas progressive challenges
- Finale: Discover the ultimate gift or meet "Santa" at the final location

**Valentine's Day**
- Narrative: Follow the trail of love letters to discover a special surprise
- Clue style: Romantic riddles, heart-themed puzzles, love poetry fragments
- Best for: Couples hunts, proposals, date nights
- Finale: Romantic gesture, gift reveal, dinner reservation

**4th of July / National Holidays**
- Narrative: A patriotic scavenger hunt exploring local history and landmarks
- Clue style: History trivia, flag/symbol puzzles, founding-era ciphers
- Mechanics: Map-based exploration tied to historical markers

### Occasion Themes

**Birthday**
- Narrative: Personalized around the birthday person — their favorite things, inside jokes, meaningful locations
- AI should prompt for: Birthday person's name, age, interests, favorite places, inside jokes
- Clue style: Personal references woven into riddles
- Special mechanic: "Memory lane" checkpoints at locations meaningful to the person
- Finale: Surprise party location, gift reveal, or sentimental message

**Team Building / Corporate**
- Narrative: Mission-based ("Your team has been selected for Operation [X]") or knowledge-based ("Explore our city's hidden gems")
- Clue style: Professional but fun, collaborative challenges, role-based tasks
- Mechanics: Tasks that require different team members' skills, timed challenges, photo evidence submissions
- Special: Include icebreaker questions at checkpoints, trivia about the company/team

**Date Night**
- Narrative: A mystery adventure for two, weaving through restaurants, parks, and memorable spots
- Mechanics: Couples challenges, "tell each other a secret" prompts, scenic photo ops
- Finale: Dinner reservation, rooftop viewpoint, or surprise experience

**Kids' Party (Ages 5-8)**
- Narrative: Simple, exciting, character-driven (pirates, princesses, superheroes, dinosaurs)
- Clue style: Picture-based clues, simple rhymes, very clear directions
- Mechanics: Large GPS radius (50m+), bright visual cues, collection-based (find 5 items)
- Keep to 30-60 minutes, 5-8 checkpoints max

**Kids' Party (Ages 9-13)**
- Narrative: Adventure/mystery-driven (secret agents, wizards, explorers, detectives)
- Clue style: Riddles, simple ciphers, map reading, trivia
- Mechanics: Moderate GPS radius (30m), puzzle variety, team competition
- Keep to 60-90 minutes, 8-12 checkpoints

**Teen / Adult**
- Narrative: Complex storylines, multi-layered puzzles, immersive world-building
- Clue style: Challenging ciphers, layered riddles, red herrings, branching paths
- Mechanics: Tight GPS radius (15-20m), time pressure, competitive scoring
- Can extend to 2-4 hours, 10-20 checkpoints

### Genre / Adventure Themes

**Pirate Treasure**
Full pirate lingo in clues, treasure map aesthetic, "X marks the spot" GPS reveals, compass-based navigation hints, buried treasure finale.

**Detective / Murder Mystery**
Crime scene setup, suspect interviews (NPC messages), evidence collection at each checkpoint, deduction puzzle at the finale.

**Spy / Secret Agent**
Classified mission briefings, code-breaking at every stop, "dead drop" language, timed challenges, agent codenames for players.

**Fantasy Quest**
Medieval/magical language, potion ingredient gathering, spell-casting puzzles (combine clue fragments), dragon/monster encounters, quest reward at the end.

**Sci-Fi / Space**
Alien transmissions to decode, planet-hopping narrative (each checkpoint is a "planet"), futuristic UI aesthetic, coordinate-based navigation.

**Historical Explorer**
Tied to real local history, educational trivia at landmarks, archival photo comparisons, era-specific language.

**Zombie Apocalypse**
Survival narrative, "safe zone" checkpoints, time pressure (zombies are closing in), resource collection mechanics, escape-themed finale.

---

## 4. Competitive Analysis: What Exists & Where HuntMap Wins

### Current Market Landscape

**GooseChase** — The most well-known. Polished UI, 250+ templates, real-time leaderboards. Supports photo/video, text, and GPS missions. Weakness: limited to 3 submission types, no storytelling tools, gets very expensive at scale ($3,000-$4,000 for 100 players), no AI assistance.

**Eventzee** — Enterprise-focused with 7+ task types including photo, video, quiz, GPS, QR code, and text challenges. Highly customizable. Weakness: complex setup, pricing by inquiry only, no narrative/story tools, no AI.

**Actionbound** — Originally an educational tool. Strong multimedia support, offline play, enforced sequencing. Weakness: dated interface, limited in creative control, no AI-assisted creation.

**Scavify** — Corporate team-building focus. Photo stream feature, analytics. Weakness: least flexible game builder, no clue/hint system, no narrative framework.

**Let's Roam** — Pre-built city tour hunts, not a creator platform. Good for tourists but zero customization.

**Huntzzz** — Incorporates storytelling into hunts. Closest to HuntMap's vision but lacks AI, limited in puzzle variety.

### HuntMap's Differentiators

1. **AI-Powered Creation** — No competitor offers AI-assisted clue writing, story generation, or hint creation. This is HuntMap's biggest moat.
2. **Story-First Design** — Most competitors treat hunts as task lists. HuntMap treats them as narratives with a beginning, middle, and end.
3. **Themed Templates with AI Customization** — Pre-built holiday and occasion templates that the AI adapts to the creator's specific locations and preferences.
4. **Puzzle Variety** — 15+ distinct puzzle types automatically varied across a hunt.
5. **Dual Mode (Competitive + Free Play)** — Toggle between timed/scored competitive mode and relaxed exploration mode.
6. **Consumer-First Pricing** — Free for consumers to create and play, with future monetization through premium features.
7. **Progressive Hint System** — AI generates 3-tier hints (subtle nudge → moderate help → near-giveaway) that cost points in competitive mode.

---

## 5. AI Prompt Engineering Guidelines

### How the AI Should Behave Inside HuntMap

**Clue Generation Prompts Should Include:**
- The checkpoint's location name and type (park, building, monument, etc.)
- The overall hunt theme and narrative
- Target audience age range
- Desired difficulty level (1-5 scale)
- The previous clue type (to ensure variety)
- Whether this is competitive or free-play mode

**Output Format for Clues:**
The AI should always return multiple options so the creator can choose:
- Option A: A rhyming riddle (4-6 lines)
- Option B: A descriptive prose clue (2-3 sentences)
- Option C: A themed puzzle (cipher, anagram, or trivia appropriate to the theme)

**Story Generation Should:**
- Create a compelling opening "hook" that establishes the perceived purpose
- Write a unique narrative beat for each checkpoint that advances the story
- Build tension/excitement toward the finale
- Match language and tone to the selected theme and age group
- Include character names and dialogue when appropriate

**Hint Generation Should:**
- Level 1 hint: Vague, directional ("You're looking for something near water")
- Level 2 hint: More specific ("Check the east side of the fountain area")
- Level 3 hint: Near-giveaway ("It's at the base of the stone fountain next to the park bench")

**Safety & Appropriateness:**
- Never generate clues that direct players to unsafe locations (highways, private property, construction zones)
- Age-appropriate language always matched to the selected audience
- No horror/violence content for kids' themes
- Cultural sensitivity in holiday themes (offer secular variants)
- Include accessibility notes when locations may have mobility challenges

---

## 6. Hunt Scoring & Mechanics Reference

### Competitive Mode Scoring

- **Base completion points:** 100 per checkpoint
- **Speed bonus:** Up to 50 bonus points for completing within par time
- **Hint penalty:** -25 points per hint used (Level 1: -10, Level 2: -25, Level 3: -50)
- **Streak bonus:** 10 bonus points per consecutive checkpoint completed without hints
- **First-to-complete bonus:** 25 bonus points for the first player/team to reach a checkpoint
- **Puzzle difficulty multiplier:** Easy = 1x, Medium = 1.5x, Hard = 2x base points

### Free Play Mode

- No scoring, no time pressure
- Hints are free and unlimited
- Story/narrative emphasis over competition
- "Completion badges" instead of points
- Photo memory collection at each checkpoint

---

## 7. Content Library: Starter Clue Patterns

### Riddle Patterns

- "I [describe what the location does/has], but I am not [misdirection]. Find me where [specific hint]."
- "Tall/short, old/new, [adjective pairs that describe the location]. Seek the place where [unique feature]."
- "[Number] steps from [landmark], face the [direction]. What [sensory detail] greets you there?"

### Cipher Starter Patterns

- A=1 substitution with a themed twist ("Each letter is a [theme item] number")
- Caesar shift with the shift number hidden in the previous clue
- First-letter-of-each-word in a paragraph that spells the location

### Themed Language Banks

- **Pirate:** "Ahoy, matey! Set sail toward… / Buried beneath… / The captain's log reveals…"
- **Detective:** "The evidence suggests… / Witness reports indicate… / Case file #[X] points to…"
- **Fantasy:** "The ancient scroll whispers of… / Beyond the enchanted… / The wizard's map reveals…"
- **Sci-Fi:** "Incoming transmission from… / Coordinates locked on… / Scanner detects anomaly at…"
- **Holiday (Easter):** "The bunny's trail leads to… / Hidden among the spring blooms… / Crack this egg to find…"
- **Holiday (Halloween):** "The spirits haunt the place where… / Beware the shadows near… / The witch's brew requires something from…"

---

*This document should be loaded as system context for all Claude API calls within HuntMap's hunt creation workflow. Update as new themes, mechanics, and user feedback dictate.*
