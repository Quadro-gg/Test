import type { TileFace } from "@/lib/tiles";

// ─── Drill scenario types ──────────────────────────────────

export interface DiscardScenario {
  hand: TileFace[]; // 14 tiles (13 + drawn)
  bestDiscard: TileFace;
  explanation: string;
}

export interface TenpaiScenario {
  hand: TileFace[]; // 13-tile tenpai hand
  waits: TileFace[];
  explanation: string;
}

// ─── Helpers ───────────────────────────────────────────────

function man(v: number): TileFace { return { type: "suited", suit: "man", value: v }; }
function pin(v: number): TileFace { return { type: "suited", suit: "pin", value: v }; }
function sou(v: number): TileFace { return { type: "suited", suit: "sou", value: v }; }
function wind(v: "east" | "south" | "west" | "north"): TileFace { return { type: "wind", value: v }; }
function dragon(v: "white" | "green" | "red"): TileFace { return { type: "dragon", value: v }; }

// ─── Discard Training Scenarios ────────────────────────────

export const DISCARD_SCENARIOS: DiscardScenario[] = [
  {
    hand: [man(1), man(2), man(3), pin(4), pin(5), pin(6), sou(7), sou(8), sou(9), wind("east"), wind("east"), wind("east"), dragon("white"), sou(3)],
    bestDiscard: dragon("white"),
    explanation: "You already have 4 complete sets + a pair of East winds. Discard the isolated White Dragon.",
  },
  {
    hand: [man(2), man(3), man(4), pin(1), pin(3), pin(5), pin(6), pin(7), sou(2), sou(3), sou(4), sou(8), sou(8), pin(9)],
    bestDiscard: pin(9),
    explanation: "9 Pin is isolated with no nearby tiles. Discard it to keep your connected shapes.",
  },
  {
    hand: [man(1), man(1), man(2), man(3), pin(4), pin(5), pin(6), sou(1), sou(2), sou(3), wind("north"), wind("north"), wind("north"), man(9)],
    bestDiscard: man(9),
    explanation: "9 Man is isolated. Your hand is already tenpai without it — discard it to stay ready.",
  },
  {
    hand: [man(3), man(4), man(5), pin(2), pin(3), pin(4), sou(6), sou(7), sou(8), dragon("red"), dragon("red"), dragon("red"), man(1), sou(1)],
    bestDiscard: sou(1),
    explanation: "Both 1 Man and 1 Sou are isolated, but 1 Man can potentially connect with your existing Man tiles. Discard 1 Sou.",
  },
  {
    hand: [man(2), man(3), man(4), man(6), man(7), man(8), pin(3), pin(3), sou(5), sou(6), sou(7), wind("east"), wind("south"), pin(3)],
    bestDiscard: wind("south"),
    explanation: "South Wind is isolated with no value (not your seat/round wind). East Wind is also isolated but keep it in case. Discard South.",
  },
  {
    hand: [man(1), man(2), man(3), pin(5), pin(6), pin(7), sou(3), sou(4), sou(5), man(7), man(8), pin(2), pin(2), man(4)],
    bestDiscard: man(4),
    explanation: "You have 4 complete sets + a pair already. 4 Man creates a duplicate sequence with your existing shapes. Discard it.",
  },
  {
    hand: [man(1), man(9), pin(1), pin(9), sou(1), sou(9), wind("east"), wind("south"), wind("west"), wind("north"), dragon("white"), dragon("green"), dragon("red"), man(5)],
    bestDiscard: man(5),
    explanation: "This is a Thirteen Orphans (kokushi) hand — keep all terminals and honors, discard the 5 Man.",
  },
  {
    hand: [man(2), man(3), man(4), pin(2), pin(2), pin(4), pin(5), pin(6), sou(3), sou(4), sou(5), sou(7), sou(8), sou(9)],
    bestDiscard: pin(4),
    explanation: "Discard 4 Pin. You already have 4-5-6 Pin as a complete sequence. Keeping the pair of 2 Pin is better for your hand shape.",
  },
  {
    hand: [man(1), man(1), man(1), pin(2), pin(3), pin(4), sou(5), sou(5), sou(6), sou(7), sou(8), dragon("green"), dragon("green"), pin(8)],
    bestDiscard: pin(8),
    explanation: "8 Pin is isolated. Your hand has good shape with the Green Dragon pair and connected tiles.",
  },
  {
    hand: [man(3), man(4), man(5), man(7), man(8), man(9), pin(1), pin(2), pin(3), sou(4), sou(5), sou(6), wind("west"), sou(2)],
    bestDiscard: wind("west"),
    explanation: "West Wind is the only isolated tile. Discard it — your hand is tenpai for a great All Sequences (Pinfu) hand.",
  },
  {
    hand: [man(2), man(2), man(3), man(3), pin(5), pin(5), pin(7), pin(7), sou(4), sou(4), sou(9), sou(9), dragon("white"), dragon("white")],
    bestDiscard: dragon("white"),
    explanation: "This is a Seven Pairs hand with 7 pairs already! ...wait, that's 14 tiles and 7 pairs. This hand is already complete!",
  },
  {
    hand: [man(1), man(2), man(3), pin(3), pin(4), pin(5), sou(6), sou(6), sou(6), sou(8), sou(8), sou(8), man(5), man(9)],
    bestDiscard: man(9),
    explanation: "9 Man is isolated and far from your other Man tiles. 5 Man at least connects to potential sequences.",
  },
];

// ─── Tenpai Quiz Scenarios ─────────────────────────────────

export const TENPAI_SCENARIOS: TenpaiScenario[] = [
  {
    hand: [man(1), man(2), man(3), pin(4), pin(5), pin(6), sou(7), sou(8), sou(9), wind("east"), wind("east"), wind("east"), dragon("red")],
    waits: [dragon("red")],
    explanation: "Waiting on Red Dragon to complete the pair. Single tile wait (tanki).",
  },
  {
    hand: [man(1), man(2), man(3), pin(4), pin(5), pin(6), sou(7), sou(8), sou(9), wind("east"), wind("east"), sou(2), sou(3)],
    waits: [sou(1), sou(4)],
    explanation: "Waiting on 1 Sou or 4 Sou to complete the 2-3 Sou sequence. Two-sided wait (ryanmen).",
  },
  {
    hand: [man(2), man(3), man(4), pin(5), pin(6), pin(7), sou(1), sou(2), sou(3), sou(9), sou(9), man(7), man(8)],
    waits: [man(6), man(9)],
    explanation: "Waiting on 6 Man or 9 Man to complete the 7-8 Man sequence.",
  },
  {
    hand: [man(1), man(2), man(3), man(4), man(5), man(6), man(7), man(8), man(9), pin(1), pin(1), pin(1), sou(5)],
    waits: [sou(5)],
    explanation: "Waiting on 5 Sou for the pair. Single tile wait (tanki).",
  },
  {
    hand: [man(3), man(4), pin(2), pin(3), pin(4), sou(6), sou(7), sou(8), wind("north"), wind("north"), wind("north"), dragon("green"), dragon("green")],
    waits: [man(2), man(5)],
    explanation: "Waiting on 2 Man or 5 Man to complete the 3-4 Man sequence.",
  },
  {
    hand: [man(1), man(1), man(2), man(2), pin(3), pin(3), pin(8), pin(8), sou(4), sou(4), sou(7), sou(7), wind("east")],
    waits: [wind("east")],
    explanation: "Seven Pairs hand — waiting on the 7th pair. Need East Wind.",
  },
  {
    hand: [man(4), man(5), man(6), pin(2), pin(3), pin(4), sou(5), sou(6), sou(7), sou(8), sou(8), sou(8), man(3)],
    waits: [man(3)],
    explanation: "Waiting on 3 Man for the pair (tanki wait).",
  },
  {
    hand: [man(1), man(2), man(3), pin(1), pin(2), pin(3), sou(1), sou(2), sou(3), dragon("red"), dragon("red"), man(5), man(6)],
    waits: [man(4), man(7)],
    explanation: "Waiting on 4 Man or 7 Man to complete the sequence.",
  },
  {
    hand: [man(3), man(4), man(5), pin(6), pin(7), pin(8), sou(1), sou(1), sou(1), sou(3), sou(3), sou(4), sou(5)],
    waits: [sou(3), sou(6)],
    explanation: "Waiting on 3 Sou or 6 Sou. The 3 Sou completes a triplet or sequence depending on arrangement.",
  },
  {
    hand: [man(1), man(2), man(3), man(7), man(8), man(9), pin(4), pin(5), pin(6), sou(2), sou(3), sou(4), sou(6)],
    waits: [sou(6)],
    explanation: "Waiting on 6 Sou for the pair (tanki).",
  },
];
