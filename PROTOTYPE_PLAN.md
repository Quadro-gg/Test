# Mahjong Dojo — Prototype Build Plan

> Goal: A working, playable prototype with lessons, drills, AI games, and gamification. No social features yet.

---

## Scope: What's IN the Prototype

| Feature | Description |
|---------|-------------|
| **Tile System** | Full 136-tile set rendering, drag-and-drop, responsive layout |
| **Game Engine** | Complete Riichi Mahjong logic (draw, discard, chi/pon/kan, riichi, win detection) |
| **Interactive Lessons** | 5–10 beginner lessons teaching tiles, rules, and basic hands |
| **Drill Mode** | Discard trainer, tenpai quiz, and tile efficiency trainer |
| **AI Games** | Play full 4-player games against basic AI |
| **Gamification** | XP, levels, streaks, and a starter set of achievements |
| **Auth** | Simple sign-up/login to save progress |

## Scope: What's OUT

Social features, multiplayer, clubs, leaderboards, community content hub, shop/monetization, additional mahjong styles (Riichi only for prototype).

---

## Phase 1 — Foundation & Tile System

**Goal:** Project scaffolding, tile data model, and tile rendering on screen.

### Tasks
- [ ] Initialize Next.js 14+ project with TypeScript, Tailwind CSS, App Router
- [ ] Set up Prisma + SQLite (lightweight for prototype, swap to Postgres later)
- [ ] Define tile data model (suit, value, type for all 136 tiles)
- [ ] Build `<Tile>` component with SVG/image rendering
- [ ] Build `<Hand>` component (display 13–14 tiles in a row, sortable)
- [ ] Build `<Discard Pool>` component (grid of discarded tiles)
- [ ] Basic layout shell (nav bar, main content area, mobile-responsive)
- [ ] Set up NextAuth with credentials provider (email/password for now)

### Deliverable
A page where you can see a full set of rendered tiles, drag them around, and log in.

---

## Phase 2 — Game Engine (Core Logic)

**Goal:** All Riichi Mahjong rules implemented as a standalone engine (no UI yet for full games).

### Tasks
- [ ] Wall building and dealing (shuffle 136 tiles, deal 13 to each player)
- [ ] Draw and discard cycle
- [ ] Call detection: Chi, Pon, Kan (open/closed/added)
- [ ] Riichi declaration logic
- [ ] Win detection (agari check — complete hand validation)
- [ ] Yaku evaluation (at least 15 common yaku for the prototype)
- [ ] Basic scoring (han/fu calculation, point distribution)
- [ ] Round flow (dealer rotation, honba sticks, exhaustive draw)
- [ ] Game state manager (tracks all players, wall, dora, round info)
- [ ] Unit tests for all core logic

### Deliverable
A fully testable game engine that can simulate a complete Riichi Mahjong game in the console.

---

## Phase 3 — Interactive Lessons

**Goal:** A lesson system with 5–10 playable beginner lessons.

### Tasks
- [ ] Lesson data format (JSON/MDX — steps, tile displays, quizzes, explanations)
- [ ] `<LessonPlayer>` component (step-through UI with progress bar)
- [ ] `<TileSelector>` interactive widget (tap to select tiles for quiz answers)
- [ ] `<HandBuilder>` widget (drag tiles to form hands during lessons)
- [ ] Lesson content — Rookie track:
  - Lesson 1: Meet the Tiles (suits, honors, bonus)
  - Lesson 2: Building Blocks (sets — sequences and triplets)
  - Lesson 3: What is a Winning Hand? (4 sets + 1 pair)
  - Lesson 4: Your First Game (guided walkthrough)
  - Lesson 5: Calling Tiles (chi, pon, kan explained)
  - Lesson 6: Introduction to Yaku (basic winning conditions)
  - Lesson 7: Riichi — Your Secret Weapon
  - Lesson 8: Scoring Basics (han and points)
- [ ] Lesson completion tracking (save progress per user)
- [ ] XP reward on lesson completion

### Deliverable
A playable lesson track that teaches a complete beginner how to play Riichi Mahjong.

---

## Phase 4 — Drill Mode

**Goal:** Three functional drill types with scoring and feedback.

### Tasks
- [ ] Drill framework (timer, scoring, streak tracking, result screen)
- [ ] **Discard Trainer**
  - Show a 13-tile hand + new draw → pick the best discard
  - Pool of 50+ curated scenarios (hand-authored + generated from real games)
  - Show optimal answer + explanation after each pick
- [ ] **Tenpai Quiz**
  - Show a tenpai hand → identify all winning tiles (waits)
  - Difficulty scaling (simple → complex waits)
- [ ] **Efficiency Trainer**
  - Show a hand → pick the discard that maximizes tile acceptance
  - Show shanten number and acceptance count comparison
- [ ] Drill result screen (accuracy, streak, XP earned)
- [ ] Drill history saved to user profile

### Deliverable
Three playable drill modes with real mahjong scenarios, instant feedback, and progress tracking.

---

## Phase 5 — AI Opponent & Full Game UI

**Goal:** Play a complete 4-player Riichi Mahjong game against AI in the browser.

### Tasks
- [ ] AI player engine:
  - **Easy AI** — random valid discards, never calls
  - **Medium AI** — basic tile efficiency, simple defense
  - **Hard AI** — optimizes shanten, reads danger, calls strategically
- [ ] Game UI components:
  - `<GameBoard>` — full table layout (your hand, 3 opponents, wall, discards)
  - `<ActionBar>` — discard, chi, pon, kan, riichi, tsumo, ron buttons
  - `<ScoreBoard>` — point display for all players
  - `<DoraDisplay>` — dora indicator tiles
  - `<RoundInfo>` — wind, round number, honba, tiles remaining
- [ ] Turn flow UI (highlight active player, animate draws/discards)
- [ ] Call prompts (popup when you can chi/pon/kan/ron)
- [ ] End-of-round results screen (winning hand display, yaku list, points)
- [ ] End-of-game results (final standings, XP reward)
- [ ] Hint toggle (show suggested discard during your turn)
- [ ] Post-game simple review (list of your discards with efficiency ratings)

### Deliverable
A fully playable Riichi Mahjong game in the browser against 3 AI opponents with adjustable difficulty.

---

## Phase 6 — Gamification & Polish

**Goal:** Tie it all together with progression, achievements, and polish.

### Tasks
- [ ] XP system:
  - Lessons: 50–100 XP per completion
  - Drills: 10–30 XP per correct answer
  - Games: 50–200 XP based on placement and performance
  - Level thresholds with title unlocks
- [ ] Daily streak system (calendar UI, streak counter, bonus XP)
- [ ] Achievement system (20 starter achievements):
  - "First Steps" — Complete your first lesson
  - "Sharp Eye" — Get 10 drills correct in a row
  - "Winner Winner" — Win your first AI game
  - "Riichi!" — Declare riichi for the first time
  - "Ippatsu" — Win with ippatsu
  - "Defensive Wall" — Win a game with 0 deal-ins
  - ...and more
- [ ] Achievement notification popups (animated, satisfying)
- [ ] Dashboard / home page:
  - Current level and XP progress bar
  - Streak status
  - Quick-start buttons (continue lesson, random drill, quick match)
  - Recent achievements
- [ ] Loading states, error handling, empty states
- [ ] Animations (tile slides, XP counter, level-up celebration)
- [ ] Sound effects (tile click, win jingle, achievement unlock)
- [ ] Mobile responsiveness pass (test on small screens)

### Deliverable
A polished, gamified prototype where every interaction feels rewarding and progress is tracked.

---

## Tech Decisions for Prototype

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Database | SQLite via Prisma | Zero setup, swap to Postgres when needed |
| Game engine | Pure TypeScript module | Runs server-side and client-side, fully testable |
| Tile rendering | SVG components | Crisp at any size, easy to theme later |
| AI | Rule-based (no ML) | Fast, deterministic, easier to tune difficulty |
| Lessons | JSON data files | Easy to author and iterate, no CMS needed |
| State | Zustand | Lightweight, good for game state |
| Animations | Framer Motion | Works great with React, declarative |

---

## Build Order Summary

```
Phase 1: Foundation ──→ Phase 2: Engine ──→ Phase 3: Lessons
                                    │
                                    ├──→ Phase 4: Drills
                                    │
                                    └──→ Phase 5: AI Games ──→ Phase 6: Polish
```

Phases 3 and 4 can run in parallel once the engine is done.
Phase 5 depends on the engine. Phase 6 ties everything together.

---

## Definition of Done (Prototype)

- [ ] A new user can sign up and log in
- [ ] They can complete beginner lessons and learn the rules
- [ ] They can practice with 3 types of drills
- [ ] They can play a full game against AI at 3 difficulty levels
- [ ] They earn XP, level up, maintain streaks, and unlock achievements
- [ ] It works on desktop and mobile browsers
- [ ] It's fun to use

---

*Ready to build. Let's start with Phase 1.*
