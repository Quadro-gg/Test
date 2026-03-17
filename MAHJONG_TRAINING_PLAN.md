# Mahjong Dojo — Training Site & App Plan

> A fun, gamified mahjong training platform that takes players from total beginner to competitive beast.

---

## Vision

**Mahjong Dojo** is an interactive learning platform that makes mahjong training addictive. Think Duolingo's gamification meets chess.com's training tools — but for mahjong. Players earn XP, unlock achievements, climb leaderboards, and level up through lessons, drills, and AI matches across multiple mahjong styles.

---

## Core Pillars

| Pillar | Description |
|--------|-------------|
| **Fun** | Gamified progression — XP, streaks, achievements, unlockables, and leaderboards keep players hooked |
| **Creative** | Playful UI with character avatars, animated tiles, satisfying sound effects, and personality |
| **Informative** | Deep curriculum covering rules, strategy, tile efficiency, defense, and advanced play |

---

## Supported Mahjong Styles

- **Japanese Riichi Mahjong** — Primary focus (largest competitive community)
- **Chinese Official (MCR)** — International tournament rules
- **Hong Kong Old Style** — Classic Cantonese rules
- **Sichuan Bloody** — Popular regional variant (stretch goal)

Players pick their preferred style; lessons and drills adapt accordingly. Shared concepts (tile recognition, hand-building fundamentals) are taught once and applied across styles.

---

## Target Audience & Skill Levels

### Tier 1 — Rookie (Complete Beginner)
- What are mahjong tiles?
- Basic rules and flow of a game
- Simple hand recognition
- Guided first game with AI

### Tier 2 — Apprentice (Beginner)
- All standard yaku / scoring patterns
- Basic tile efficiency (shanten counting)
- Simple push/fold decisions
- Open vs. closed hand strategy

### Tier 3 — Journeyman (Intermediate)
- Tile efficiency optimization
- Defensive play (suji, kabe, betaori)
- Reading the board and opponents
- Situational strategy (placement, round awareness)

### Tier 4 — Master (Advanced)
- Advanced efficiency and value maximization
- Reading hand progression of opponents
- Tournament strategy and meta-game
- Statistical analysis of play patterns

### Tier 5 — Grandmaster (Expert)
- Competition preparation
- Replay analysis and self-study tools
- Edge-case rules mastery
- Community contribution (create drills, write guides)

---

## Core Features

### 1. Interactive Lessons
- Step-by-step guided tutorials with visual tile manipulation
- "Show, don't tell" — every concept demonstrated with real tile scenarios
- Progress checkpoints and mini-quizzes within each lesson
- Narrated by a cast of character guides (unlockable personalities)

### 2. Puzzle / Drill Mode
- **"What Would You Discard?"** — Given a hand, pick the optimal discard
- **Tenpai Quiz** — Identify what tiles complete the hand
- **Efficiency Trainer** — Maximize tile acceptance count
- **Defense Drills** — Identify safe tiles against a riichi declaration
- **Scoring Calculator** — Practice calculating hand values
- **Speed Mode** — Timed drills for quick decision-making
- Difficulty scales with player level; drills pulled from real game databases

### 3. AI Practice Games
- Full 4-player games against AI opponents
- Adjustable AI difficulty (Rookie through Grandmaster)
- **Hint System** — Toggle real-time suggestions during play
- **Post-Game Review** — AI analyzes every discard, highlights mistakes
- **Scenario Mode** — Start from specific situations (e.g., "you're 4th place in South round")

### 4. Gamification System
- **XP & Levels** — Earn XP from lessons, drills, and games
- **Daily Streaks** — Maintain a streak for bonus rewards
- **Achievements** — 100+ unlockable badges (e.g., "First Riichi!", "Survived a Dealer Repeat", "Perfect Defense Round")
- **Unlockables** — Tile sets, table themes, avatar accessories, character guides
- **Seasonal Events** — Limited-time challenges and cosmetics
- **Titles** — Displayed rank titles earned through performance

### 5. Social & Community
- **User Profiles** — Stats, achievements, match history, favorite style
- **Friends List** — Add friends, see their activity and progress
- **Leaderboards** — Global, regional, friends-only, and per-drill rankings
- **Clubs / Guilds** — Create or join groups, club leaderboards, group challenges
- **Shared Replays** — Save and share notable games with annotations
- **Strategy Hub** — Community-written guides, articles, and discussions
- **Chat** — In-game and lobby chat with emote support

---

## Monetization Ideas (Optional / Future)

| Model | Description |
|-------|-------------|
| **Freemium** | Core lessons and drills free; premium unlocks advanced content, unlimited AI games, and cosmetics |
| **Cosmetic Shop** | Tile skins, table themes, avatars, sound packs |
| **Season Pass** | Seasonal content drops with exclusive rewards |
| **Ad-supported free tier** | Non-intrusive ads for free users, removed with premium |

---

## Tech Stack (Recommended)

### Phase 1 — Web App
| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | Next.js (React) + TypeScript | SSR for SEO, great DX, huge ecosystem |
| **Styling** | Tailwind CSS + Framer Motion | Rapid UI development + smooth animations |
| **Game Rendering** | HTML5 Canvas or PixiJS | Performant tile rendering and drag-and-drop |
| **State Management** | Zustand | Lightweight, scales well for game state |
| **Backend** | Next.js API Routes + tRPC | Type-safe API, co-located with frontend |
| **Database** | PostgreSQL (via Prisma) | Relational data — users, games, scores, social |
| **Cache / Realtime** | Redis | Leaderboards, sessions, future real-time features |
| **Auth** | NextAuth.js (or Clerk) | OAuth + email, handles sessions |
| **AI Engine** | Custom (TypeScript) | Pluggable AI difficulty with rule-based + ML hybrid |
| **Hosting** | Vercel (frontend) + Railway/Fly.io (services) | Easy deployment, good free tiers |

### Phase 2 — Native App (Future)
| Approach | Technology |
|----------|-----------|
| **Cross-platform** | React Native (or Expo) — share logic with web |
| **Alternative** | Capacitor (wrap the Next.js PWA as a native shell) |

Start as a responsive web app, add PWA features early (offline drills, install prompt), then graduate to native when the product is proven.

---

## Information Architecture

```
Home
├── Learn (Lessons)
│   ├── Pick Your Style (Riichi / MCR / HK / etc.)
│   ├── Lesson Tracks (Rookie → Grandmaster)
│   └── Lesson Detail (interactive tutorial)
├── Train (Drills)
│   ├── Discard Trainer
│   ├── Tenpai Quiz
│   ├── Efficiency Trainer
│   ├── Defense Drills
│   ├── Scoring Practice
│   └── Speed Mode
├── Play (AI Games)
│   ├── Quick Match
│   ├── Custom Game (difficulty, rules, settings)
│   └── Scenario Mode
├── Profile
│   ├── Stats & Progress
│   ├── Achievements
│   ├── Match History & Replays
│   └── Settings
├── Social
│   ├── Leaderboards
│   ├── Friends
│   ├── Clubs
│   └── Strategy Hub (guides & articles)
└── Shop (cosmetics & premium)
```

---

## Development Phases

### Phase 0 — Foundation (Weeks 1–3)
- [ ] Project setup (Next.js, Tailwind, Prisma, Postgres)
- [ ] Tile data models and rendering system
- [ ] Basic game logic engine (hand evaluation, win detection)
- [ ] Auth and user accounts

### Phase 1 — Learn & Train (Weeks 4–8)
- [ ] Lesson content system (markdown/JSON-driven)
- [ ] 10+ interactive lessons for Riichi (Rookie tier)
- [ ] Discard trainer and tenpai quiz drills
- [ ] XP, levels, and basic achievement system
- [ ] Responsive design (mobile-friendly)

### Phase 2 — Play (Weeks 9–13)
- [ ] Full game loop (draw, discard, calls, win)
- [ ] AI opponent engine (basic difficulty levels)
- [ ] Post-game review screen
- [ ] Hint system during gameplay
- [ ] Scoring calculator

### Phase 3 — Social & Polish (Weeks 14–18)
- [ ] User profiles and match history
- [ ] Leaderboards (global + friends)
- [ ] Friends list and clubs
- [ ] Shared replays
- [ ] Strategy Hub (community content)
- [ ] Daily streaks and seasonal events

### Phase 4 — Expand & Native (Weeks 19+)
- [ ] Additional mahjong styles (MCR, HK)
- [ ] Advanced lessons (Tiers 3–5)
- [ ] PWA enhancements (offline mode, push notifications)
- [ ] Native app build (React Native or Capacitor)
- [ ] Multiplayer groundwork (real-time matches with friends)

---

## Key Design Principles

1. **Mobile-first** — Most players will be on phones; design for small screens first
2. **Instant feedback** — Every action gets a response (animations, sounds, XP popups)
3. **Bite-sized sessions** — A drill should take 1–3 minutes; lessons 5–10 minutes
4. **Always progressing** — Every interaction earns something (XP, streak, data)
5. **Low floor, high ceiling** — Easy to start, infinitely deep to master
6. **Personality over sterility** — Characters, humor, and charm over dry instruction

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Day 1 retention | > 50% |
| Day 7 retention | > 25% |
| Lessons completed per user | > 5 in first week |
| Drills per session | > 10 |
| Average session length | 8–15 minutes |
| NPS score | > 50 |

---

## Open Questions

- [ ] Name — "Mahjong Dojo" is a working title. Final name TBD.
- [ ] Art style — Do we want custom character illustrations? What aesthetic?
- [ ] Sound design — Original soundtrack? Tile click sounds? Voice narration?
- [ ] Content pipeline — Who writes the lesson content? AI-assisted + human review?
- [ ] Competitive features — ELO/rating system for AI games? Ranked drills?

---

*This is a living document. Update as decisions are made and features evolve.*
