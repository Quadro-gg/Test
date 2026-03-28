import type { Lesson, LessonStep } from "./lesson-types";
import type { TileFace } from "@/lib/tiles";

// ─── Helpers ───────────────────────────────────────────────

function man(v: number): TileFace { return { type: "suited", suit: "man", value: v }; }
function pin(v: number): TileFace { return { type: "suited", suit: "pin", value: v }; }
function sou(v: number): TileFace { return { type: "suited", suit: "sou", value: v }; }
function wind(v: "east" | "south" | "west" | "north"): TileFace { return { type: "wind", value: v }; }
function dragon(v: "white" | "green" | "red"): TileFace { return { type: "dragon", value: v }; }

// ─── Lesson 1: Meet the Tiles ──────────────────────────────

const lesson1: Lesson = {
  id: "meet-the-tiles",
  title: "Meet the Tiles",
  description: "Learn about the three suits and honor tiles in Riichi Mahjong.",
  order: 1,
  xpReward: 50,
  steps: [
    {
      type: "text",
      content: "Welcome to Mahjong Dojo! Riichi Mahjong uses 136 tiles. Let's learn what they are.",
    },
    {
      type: "text",
      content: "There are three numbered suits, each with values 1-9. Each tile has 4 copies, giving 108 suited tiles total.",
    },
    {
      type: "tile-display",
      content: "Man (Characters) — These tiles show a number with the character 萬 (ten-thousand).",
      tiles: [man(1), man(2), man(3), man(4), man(5), man(6), man(7), man(8), man(9)],
    },
    {
      type: "tile-display",
      content: "Pin (Circles) — These tiles show a number with circles (筒).",
      tiles: [pin(1), pin(2), pin(3), pin(4), pin(5), pin(6), pin(7), pin(8), pin(9)],
    },
    {
      type: "tile-display",
      content: "Sou (Bamboo) — These tiles show a number with bamboo sticks (索).",
      tiles: [sou(1), sou(2), sou(3), sou(4), sou(5), sou(6), sou(7), sou(8), sou(9)],
    },
    {
      type: "tile-display",
      content: "Wind tiles — There are four wind tiles. Each appears 4 times in the set.",
      tiles: [wind("east"), wind("south"), wind("west"), wind("north")],
    },
    {
      type: "tile-display",
      content: "Dragon tiles — There are three dragon tiles: White (白), Green (發), and Red (中).",
      tiles: [dragon("white"), dragon("green"), dragon("red")],
    },
    {
      type: "quiz",
      question: "How many total tiles are in a Riichi Mahjong set?",
      options: [{ label: "108" }, { label: "136" }, { label: "144" }, { label: "120" }],
      correctAnswer: 1,
      explanation: "136 tiles: 108 suited (3 suits × 9 values × 4 copies) + 16 winds (4 × 4) + 12 dragons (3 × 4).",
    },
    {
      type: "quiz",
      question: "How many suits are there?",
      options: [{ label: "2" }, { label: "3" }, { label: "4" }, { label: "5" }],
      correctAnswer: 1,
      explanation: "Three suits: Man (Characters), Pin (Circles), and Sou (Bamboo).",
    },
  ],
};

// ─── Lesson 2: Building Blocks ─────────────────────────────

const lesson2: Lesson = {
  id: "building-blocks",
  title: "Building Blocks",
  description: "Learn about sequences (shuntsu) and triplets (koutsu) — the sets that make up a hand.",
  order: 2,
  xpReward: 50,
  steps: [
    {
      type: "text",
      content: "In mahjong, you win by forming your hand into specific groups called 'sets'. There are two types of sets.",
    },
    {
      type: "tile-display",
      content: "Sequence (Shuntsu) — Three consecutive tiles of the same suit. Like a straight in cards.",
      tiles: [man(1), man(2), man(3)],
    },
    {
      type: "tile-display",
      content: "Here's another sequence. Note: sequences wrap around — 8-9-1 is NOT valid.",
      tiles: [sou(4), sou(5), sou(6)],
    },
    {
      type: "tile-display",
      content: "Triplet (Koutsu) — Three identical tiles. These can be any tile, including honors.",
      tiles: [pin(7), pin(7), pin(7)],
    },
    {
      type: "tile-display",
      content: "Honor tiles can form triplets too! But they can never form sequences.",
      tiles: [wind("east"), wind("east"), wind("east")],
    },
    {
      type: "quiz",
      question: "Which of these is a valid sequence?",
      options: [
        { label: "8-9-1 Man", tiles: [man(8), man(9), man(1)] },
        { label: "3-4-5 Pin", tiles: [pin(3), pin(4), pin(5)] },
        { label: "East-South-West", tiles: [wind("east"), wind("south"), wind("west")] },
      ],
      correctAnswer: 1,
      explanation: "3-4-5 Pin is a valid sequence. Sequences don't wrap around (8-9-1 is invalid), and wind tiles can't form sequences.",
    },
    {
      type: "quiz",
      question: "Can honor tiles (winds and dragons) form sequences?",
      options: [{ label: "Yes" }, { label: "No" }],
      correctAnswer: 1,
      explanation: "No! Honor tiles can only form triplets (three of the same tile). Only suited tiles (Man, Pin, Sou) can form sequences.",
    },
  ],
};

// ─── Lesson 3: Winning Hand ────────────────────────────────

const lesson3: Lesson = {
  id: "winning-hand",
  title: "What is a Winning Hand?",
  description: "Learn the basic structure of a complete mahjong hand: 4 sets + 1 pair.",
  order: 3,
  xpReward: 75,
  steps: [
    {
      type: "text",
      content: "A winning hand in mahjong has 14 tiles arranged as: 4 sets + 1 pair. A pair is simply two identical tiles.",
    },
    {
      type: "tile-display",
      content: "Here's a winning hand. Can you spot the 4 sets and 1 pair?",
      tiles: [
        man(1), man(2), man(3),
        pin(4), pin(5), pin(6),
        sou(7), sou(7), sou(7),
        wind("east"), wind("east"), wind("east"),
        dragon("red"), dragon("red"),
      ],
    },
    {
      type: "text",
      content: "That hand had: 1-2-3m (sequence), 4-5-6p (sequence), 7-7-7s (triplet), East-East-East (triplet), Red-Red (pair).",
    },
    {
      type: "text",
      content: "During the game, each player starts with 13 tiles. You draw and discard tiles trying to complete your hand. The 14th tile that completes your hand is your winning tile.",
    },
    {
      type: "quiz",
      question: "How many tiles are in a complete winning hand?",
      options: [{ label: "13" }, { label: "14" }, { label: "15" }, { label: "12" }],
      correctAnswer: 1,
      explanation: "14 tiles: 4 sets of 3 tiles (= 12) + 1 pair of 2 tiles (= 2) = 14 total.",
    },
    {
      type: "quiz",
      question: "What is the basic structure of a winning hand?",
      options: [
        { label: "3 sets + 2 pairs" },
        { label: "4 sets + 1 pair" },
        { label: "5 sets" },
        { label: "2 sets + 4 pairs" },
      ],
      correctAnswer: 1,
      explanation: "The standard winning hand is 4 sets (sequences or triplets) + 1 pair.",
    },
  ],
};

// ─── Lesson 4: Your First Game ─────────────────────────────

const lesson4: Lesson = {
  id: "first-game",
  title: "Your First Game",
  description: "A guided walkthrough of how a mahjong game flows.",
  order: 4,
  xpReward: 75,
  steps: [
    {
      type: "text",
      content: "Riichi Mahjong is played with 4 players. Each player sits at a position named after a wind: East, South, West, North.",
    },
    {
      type: "text",
      content: "The game starts by shuffling all 136 tiles face-down into a 'wall'. Each player draws 13 tiles from the wall.",
    },
    {
      type: "text",
      content: "East player goes first. On your turn: 1) Draw a tile from the wall. 2) Choose one tile to discard face-up.",
    },
    {
      type: "text",
      content: "Play goes counter-clockwise: East → South → West → North → East...",
    },
    {
      type: "text",
      content: "The round ends when: someone completes a winning hand, OR the wall runs out of tiles (a draw).",
    },
    {
      type: "text",
      content: "A full game typically consists of 8 rounds (East 1-4, then South 1-4). The player with the most points at the end wins!",
    },
    {
      type: "quiz",
      question: "How many tiles does each player start with?",
      options: [{ label: "14" }, { label: "13" }, { label: "12" }, { label: "10" }],
      correctAnswer: 1,
      explanation: "Each player starts with 13 tiles and draws a 14th on their turn.",
    },
    {
      type: "quiz",
      question: "Which direction does play go?",
      options: [
        { label: "Clockwise" },
        { label: "Counter-clockwise" },
        { label: "Random" },
      ],
      correctAnswer: 1,
      explanation: "Play goes counter-clockwise: East → South → West → North.",
    },
  ],
};

// ─── Lesson 5: Calling Tiles ───────────────────────────────

const lesson5: Lesson = {
  id: "calling-tiles",
  title: "Calling Tiles",
  description: "Learn how to call Chi, Pon, and Kan to take other players' discards.",
  order: 5,
  xpReward: 75,
  steps: [
    {
      type: "text",
      content: "Normally you can only draw from the wall. But when another player discards, you might be able to 'call' that tile to complete a set!",
    },
    {
      type: "text",
      content: "Chi (チー) — Claim a discard to complete a sequence. You can only chi from the player to your left.",
    },
    {
      type: "tile-display",
      content: "Example: You have 4-5 Pin, and the player to your left discards 6 Pin. You call 'Chi!' to complete the sequence.",
      tiles: [pin(4), pin(5), pin(6)],
      highlightTiles: [2],
    },
    {
      type: "text",
      content: "Pon (ポン) — Claim a discard to complete a triplet. You can pon from ANY player.",
    },
    {
      type: "tile-display",
      content: "Example: You have two 3 Sou, and someone discards a 3 Sou. You call 'Pon!' to form a triplet.",
      tiles: [sou(3), sou(3), sou(3)],
      highlightTiles: [2],
    },
    {
      type: "text",
      content: "Kan (カン) — Declare a set of 4 identical tiles. There are three types: open kan (from a discard), closed kan (all from hand), and added kan (add to an existing pon).",
    },
    {
      type: "text",
      content: "Important: Called sets become 'open' — they're placed face-up and everyone can see them. This affects which winning conditions (yaku) you can claim.",
    },
    {
      type: "quiz",
      question: "Who can you call Chi from?",
      options: [
        { label: "Any player" },
        { label: "Only the player to your left" },
        { label: "Only the dealer" },
      ],
      correctAnswer: 1,
      explanation: "Chi can only be called from the player to your left (the previous player in turn order).",
    },
    {
      type: "quiz",
      question: "What happens when you call a tile?",
      options: [
        { label: "The set stays hidden in your hand" },
        { label: "The set is placed face-up for everyone to see" },
        { label: "You keep the tile but don't form a set" },
      ],
      correctAnswer: 1,
      explanation: "Called sets are placed face-up ('open'). This is important because some winning conditions require a closed hand.",
    },
  ],
};

// ─── Lesson 6: Introduction to Yaku ────────────────────────

const lesson6: Lesson = {
  id: "intro-yaku",
  title: "Introduction to Yaku",
  description: "Learn about yaku — the winning conditions needed to declare a win.",
  order: 6,
  xpReward: 100,
  steps: [
    {
      type: "text",
      content: "Having 4 sets + 1 pair isn't enough to win. You also need at least one 'yaku' — a specific pattern or condition in your hand.",
    },
    {
      type: "text",
      content: "Think of yaku like poker hands. A complete hand with no yaku is like having 5 cards but no pair, straight, or flush. You can't win with nothing!",
    },
    {
      type: "tile-display",
      content: "Tanyao (All Simples) — Every tile is between 2-8. No 1s, 9s, winds, or dragons.",
      tiles: [
        man(2), man(3), man(4),
        pin(3), pin(4), pin(5),
        sou(6), sou(7), sou(8),
        man(5), man(5), man(5),
        pin(7), pin(7),
      ],
    },
    {
      type: "tile-display",
      content: "Yakuhai (Value Tiles) — A triplet of dragons, your seat wind, or the round wind.",
      tiles: [
        dragon("red"), dragon("red"), dragon("red"),
        man(1), man(2), man(3),
        pin(4), pin(5), pin(6),
        sou(7), sou(8), sou(9),
        man(5), man(5),
      ],
    },
    {
      type: "text",
      content: "Each yaku is worth a number of 'han' — points that determine your score. More han = more points!",
    },
    {
      type: "text",
      content: "Common beginner-friendly yaku:\n• Tanyao (1 han) — All simples\n• Yakuhai (1 han) — Dragon/wind triplet\n• Pinfu (1 han) — All sequences, closed hand\n• Riichi (1 han) — Declare ready when tenpai",
    },
    {
      type: "quiz",
      question: "Can you win with a complete hand that has no yaku?",
      options: [{ label: "Yes" }, { label: "No" }],
      correctAnswer: 1,
      explanation: "No! You must have at least one yaku to declare a win. A complete hand with no yaku is called a 'no-ten' or invalid win.",
    },
    {
      type: "quiz",
      question: "Which yaku requires all tiles to be between 2-8?",
      options: [
        { label: "Pinfu" },
        { label: "Tanyao" },
        { label: "Yakuhai" },
      ],
      correctAnswer: 1,
      explanation: "Tanyao (All Simples) requires every tile to be a 'simple' — numbered 2 through 8, with no terminals (1,9) or honors.",
    },
  ],
};

// ─── Lesson 7: Riichi ──────────────────────────────────────

const lesson7: Lesson = {
  id: "riichi",
  title: "Riichi — Your Secret Weapon",
  description: "Learn about the riichi declaration — a powerful move unique to Japanese Mahjong.",
  order: 7,
  xpReward: 100,
  steps: [
    {
      type: "text",
      content: "Riichi (立直) is the signature move of Japanese Mahjong. When you're one tile away from winning (tenpai) and your hand is closed, you can declare 'Riichi!'",
    },
    {
      type: "text",
      content: "To declare riichi: 1) Your hand must be closed (no calls). 2) You must be tenpai (one tile from winning). 3) You pay 1,000 points as a deposit.",
    },
    {
      type: "text",
      content: "Benefits of riichi:\n• It's worth 1 han (a winning condition on its own!)\n• You get access to Ura Dora (bonus tiles revealed if you win)\n• If you win within one turn cycle, you get Ippatsu (+1 han)",
    },
    {
      type: "text",
      content: "Risks of riichi:\n• You can't change your hand anymore — tiles you draw are auto-discarded\n• You lose 1,000 points if you don't win\n• Other players know you're close to winning and will play defensively",
    },
    {
      type: "text",
      content: "'Tenpai' means your hand is one tile away from complete. The tiles that would complete your hand are called your 'waits'.",
    },
    {
      type: "tile-display",
      content: "This hand is tenpai. It's waiting on 3 Man or 6 Man to complete a sequence.",
      tiles: [
        man(4), man(5),
        pin(1), pin(2), pin(3),
        sou(7), sou(8), sou(9),
        wind("north"), wind("north"), wind("north"),
        dragon("white"), dragon("white"),
      ],
    },
    {
      type: "quiz",
      question: "What do you need to declare Riichi?",
      options: [
        { label: "A closed hand that is tenpai" },
        { label: "Any hand that is tenpai" },
        { label: "A hand with 3 yaku" },
      ],
      correctAnswer: 0,
      explanation: "Riichi requires a closed hand (no calls except closed kan) that is tenpai (one tile from winning). You also need at least 1,000 points to pay the deposit.",
    },
    {
      type: "quiz",
      question: "What is 'Ippatsu'?",
      options: [
        { label: "Winning on your first turn" },
        { label: "Winning within one turn cycle after declaring riichi" },
        { label: "Declaring riichi with 5 han" },
      ],
      correctAnswer: 1,
      explanation: "Ippatsu is a bonus han (+1) you get if you win within one full turn cycle after declaring riichi, as long as no one calls a tile in between.",
    },
  ],
};

// ─── Lesson 8: Scoring Basics ──────────────────────────────

const lesson8: Lesson = {
  id: "scoring-basics",
  title: "Scoring Basics",
  description: "Learn how han and fu translate into points.",
  order: 8,
  xpReward: 100,
  steps: [
    {
      type: "text",
      content: "Scoring in Riichi Mahjong is based on two values: Han (番) — from yaku and dora, and Fu (符) — from the hand structure.",
    },
    {
      type: "text",
      content: "Don't worry about memorizing exact numbers! The key milestones are what matter:",
    },
    {
      type: "text",
      content: "Mangan (満貫) — 5 han. A strong hand! Pays 8,000 from one player (ron) or ~2,000-4,000 each (tsumo).",
    },
    {
      type: "text",
      content: "Haneman (跳満) — 6-7 han. Pays 12,000 ron.\nBaiman (倍満) — 8-10 han. Pays 16,000 ron.\nSanbaiman (三倍満) — 11-12 han. Pays 24,000 ron.\nYakuman (役満) — 13+ han. The jackpot! Pays 32,000 ron.",
    },
    {
      type: "text",
      content: "The dealer ('East') pays and receives more. If the dealer wins, they collect 50% more points!",
    },
    {
      type: "text",
      content: "Ron vs Tsumo:\n• Ron — Win off another player's discard. That player pays the full amount.\n• Tsumo — Win by self-draw. All three other players split the payment.",
    },
    {
      type: "text",
      content: "Dora tiles are bonus han! The dora indicator on the wall shows which tile is the dora. Each dora in your hand adds +1 han to your score.",
    },
    {
      type: "quiz",
      question: "How many han is Mangan worth?",
      options: [{ label: "3 han" }, { label: "5 han" }, { label: "8 han" }, { label: "13 han" }],
      correctAnswer: 1,
      explanation: "Mangan is the scoring limit at 5 han. It's often the first big score goal for beginners.",
    },
    {
      type: "quiz",
      question: "If you win by Ron, who pays?",
      options: [
        { label: "All three other players split it" },
        { label: "The player who discarded the winning tile" },
        { label: "The dealer always pays" },
      ],
      correctAnswer: 1,
      explanation: "With Ron, the player who discarded your winning tile pays the full amount. With Tsumo (self-draw), all three others split the payment.",
    },
  ],
};

// ─── Export all lessons ────────────────────────────────────

export const ALL_LESSONS: Lesson[] = [
  lesson1,
  lesson2,
  lesson3,
  lesson4,
  lesson5,
  lesson6,
  lesson7,
  lesson8,
];

export function getLessonById(id: string): Lesson | undefined {
  return ALL_LESSONS.find((l) => l.id === id);
}
