import { describe, it, expect } from "vitest";
import type { TileFace } from "@/lib/tiles";
import {
  isComplete,
  isSevenPairs,
  isThirteenOrphans,
  calculateShanten,
  findWaits,
  facesEqual,
  findWinningDecompositions,
  isTerminal,
  isHonor,
  isSimple,
} from "../hand-utils";

// Helper to make faces quickly
function man(v: number): TileFace {
  return { type: "suited", suit: "man", value: v };
}
function pin(v: number): TileFace {
  return { type: "suited", suit: "pin", value: v };
}
function sou(v: number): TileFace {
  return { type: "suited", suit: "sou", value: v };
}
function wind(v: "east" | "south" | "west" | "north"): TileFace {
  return { type: "wind", value: v };
}
function dragon(v: "white" | "green" | "red"): TileFace {
  return { type: "dragon", value: v };
}

describe("Face helpers", () => {
  it("facesEqual works for same suited tile", () => {
    expect(facesEqual(man(1), man(1))).toBe(true);
    expect(facesEqual(man(1), man(2))).toBe(false);
    expect(facesEqual(man(1), pin(1))).toBe(false);
  });

  it("facesEqual works for honors", () => {
    expect(facesEqual(wind("east"), wind("east"))).toBe(true);
    expect(facesEqual(wind("east"), wind("south"))).toBe(false);
    expect(facesEqual(dragon("red"), dragon("red"))).toBe(true);
  });

  it("isTerminal, isHonor, isSimple", () => {
    expect(isTerminal(man(1))).toBe(true);
    expect(isTerminal(man(9))).toBe(true);
    expect(isTerminal(man(5))).toBe(false);
    expect(isHonor(wind("east"))).toBe(true);
    expect(isHonor(dragon("red"))).toBe(true);
    expect(isHonor(man(1))).toBe(false);
    expect(isSimple(man(5))).toBe(true);
    expect(isSimple(man(1))).toBe(false);
  });
});

describe("Win detection", () => {
  it("detects a standard winning hand (4 sets + 1 pair)", () => {
    // 123m 456m 789m 111p 11s
    const hand = [
      man(1), man(2), man(3),
      man(4), man(5), man(6),
      man(7), man(8), man(9),
      pin(1), pin(1), pin(1),
      sou(1), sou(1),
    ];
    expect(isComplete(hand)).toBe(true);
  });

  it("detects all-triplets hand", () => {
    // 111m 222p 333s EEE pair:WW
    const hand = [
      man(1), man(1), man(1),
      pin(2), pin(2), pin(2),
      sou(3), sou(3), sou(3),
      wind("east"), wind("east"), wind("east"),
      wind("west"), wind("west"),
    ];
    expect(isComplete(hand)).toBe(true);
  });

  it("rejects incomplete hand", () => {
    const hand = [
      man(1), man(2), man(3),
      man(4), man(5), man(6),
      man(7), man(8), man(9),
      pin(1), pin(1), pin(1),
      sou(1), sou(2), // not a pair
    ];
    expect(isComplete(hand)).toBe(false);
  });

  it("detects seven pairs", () => {
    const hand = [
      man(1), man(1),
      man(3), man(3),
      pin(5), pin(5),
      pin(7), pin(7),
      sou(2), sou(2),
      sou(9), sou(9),
      wind("east"), wind("east"),
    ];
    expect(isSevenPairs(hand)).toBe(true);
    expect(isComplete(hand)).toBe(true);
  });

  it("detects thirteen orphans", () => {
    const hand = [
      man(1), man(9),
      pin(1), pin(9),
      sou(1), sou(9),
      wind("east"), wind("south"), wind("west"), wind("north"),
      dragon("white"), dragon("green"), dragon("red"),
      man(1), // pair
    ];
    expect(isThirteenOrphans(hand)).toBe(true);
  });
});

describe("Shanten", () => {
  it("returns -1 for a complete hand", () => {
    const hand = [
      man(1), man(2), man(3),
      man(4), man(5), man(6),
      man(7), man(8), man(9),
      pin(1), pin(1), pin(1),
      sou(1), sou(1),
    ];
    expect(calculateShanten(hand)).toBe(-1);
  });

  it("returns 0 for a tenpai hand", () => {
    // Waiting for sou(1) to complete pair
    const hand = [
      man(1), man(2), man(3),
      man(4), man(5), man(6),
      man(7), man(8), man(9),
      pin(1), pin(1), pin(1),
      sou(1),
    ];
    expect(calculateShanten(hand)).toBe(0);
  });
});

describe("Waits", () => {
  it("finds waits for a tenpai hand", () => {
    // 123m 456m 789m 111p + ?  — waiting for any pair tile
    const hand = [
      man(1), man(2), man(3),
      man(4), man(5), man(6),
      man(7), man(8), man(9),
      pin(1), pin(1), pin(1),
      sou(1),
    ];
    const waits = findWaits(hand);
    // Should be waiting on sou(1) for pair
    expect(waits.length).toBeGreaterThan(0);
    expect(waits.some((w) => w.type === "suited" && w.suit === "sou" && w.value === 1)).toBe(true);
  });

  it("finds multiple waits", () => {
    // 12m 456m 789m 111p 11s — waiting on 3m (sequence complete)
    const hand = [
      man(1), man(2),
      man(4), man(5), man(6),
      man(7), man(8), man(9),
      pin(1), pin(1), pin(1),
      sou(1), sou(1),
    ];
    const waits = findWaits(hand);
    expect(waits.length).toBeGreaterThanOrEqual(1);
    // Should wait on 3m
    expect(waits.some((w) => w.type === "suited" && w.suit === "man" && w.value === 3)).toBe(true);
  });
});

describe("Decompositions", () => {
  it("finds correct decomposition for simple hand", () => {
    const hand = [
      man(1), man(2), man(3),
      man(4), man(5), man(6),
      man(7), man(8), man(9),
      pin(1), pin(1), pin(1),
      sou(1), sou(1),
    ];
    const decomps = findWinningDecompositions(hand);
    expect(decomps.length).toBeGreaterThan(0);
    expect(decomps[0].sets).toHaveLength(4);
  });
});
