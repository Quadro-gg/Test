import type { TileFace, Tile } from "@/lib/tiles";
import { tileCode, tileSortKey } from "@/lib/tiles";
import type { Meld } from "./types";

// ─── Face comparison ───────────────────────────────────────

export function facesEqual(a: TileFace, b: TileFace): boolean {
  if (a.type !== b.type) return false;
  if (a.type === "suited" && b.type === "suited") {
    return a.suit === b.suit && a.value === b.value;
  }
  return a.type === b.type && (a as { value: string }).value === (b as { value: string }).value;
}

/** Group tiles by face code, returning counts */
export function countByFace(tiles: Tile[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const t of tiles) {
    const code = tileCode(t.face);
    map.set(code, (map.get(code) || 0) + 1);
  }
  return map;
}

/** Get unique faces in a set of tiles */
export function uniqueFaces(tiles: Tile[]): TileFace[] {
  const seen = new Set<string>();
  const result: TileFace[] = [];
  for (const t of tiles) {
    const code = tileCode(t.face);
    if (!seen.has(code)) {
      seen.add(code);
      result.push(t.face);
    }
  }
  return result;
}

/** Find tiles in hand matching a given face */
export function findByFace(tiles: Tile[], face: TileFace): Tile[] {
  return tiles.filter((t) => facesEqual(t.face, face));
}

// ─── Suited tile helpers ───────────────────────────────────

export function isSuited(face: TileFace): face is TileFace & { type: "suited" } {
  return face.type === "suited";
}

export function isHonor(face: TileFace): boolean {
  return face.type === "wind" || face.type === "dragon";
}

export function isTerminal(face: TileFace): boolean {
  return face.type === "suited" && (face.value === 1 || face.value === 9);
}

export function isTerminalOrHonor(face: TileFace): boolean {
  return isTerminal(face) || isHonor(face);
}

export function isSimple(face: TileFace): boolean {
  return face.type === "suited" && face.value >= 2 && face.value <= 8;
}

// ─── Agari (win) check ─────────────────────────────────────
// Check if a set of 14 tiles can form a complete hand (4 sets + 1 pair)
// Uses a recursive decomposition approach

export interface HandDecomposition {
  pair: TileFace;
  sets: TileFace[][]; // each set is 3 faces
}

/**
 * Convert tiles to a compact representation for the agari check.
 * Returns [suitCounts, honorCounts] where suitCounts is a 3×9 array
 * and honorCounts is a 7-element array (E,S,W,N,Wh,G,R).
 */
function tilesToCounts(faces: TileFace[]): number[] {
  // 0-8: man, 9-17: pin, 18-26: sou, 27-30: winds, 31-33: dragons
  const counts = new Array(34).fill(0);
  for (const f of faces) {
    counts[faceToIndex(f)]++;
  }
  return counts;
}

export function faceToIndex(face: TileFace): number {
  if (face.type === "suited") {
    const suitOffset = { man: 0, pin: 9, sou: 18 }[face.suit];
    return suitOffset + face.value - 1;
  }
  if (face.type === "wind") {
    return 27 + { east: 0, south: 1, west: 2, north: 3 }[face.value];
  }
  return 31 + { white: 0, green: 1, red: 2 }[face.value];
}

export function indexToFace(idx: number): TileFace {
  if (idx < 27) {
    const suit = (["man", "pin", "sou"] as const)[Math.floor(idx / 9)];
    return { type: "suited", suit, value: (idx % 9) + 1 };
  }
  if (idx < 31) {
    const wind = (["east", "south", "west", "north"] as const)[idx - 27];
    return { type: "wind", value: wind };
  }
  const dragon = (["white", "green", "red"] as const)[idx - 31];
  return { type: "dragon", value: dragon };
}

/**
 * Check if a 14-tile hand is a complete (agari) hand.
 * Returns all valid decompositions.
 */
export function findWinningDecompositions(faces: TileFace[]): HandDecomposition[] {
  const counts = tilesToCounts(faces);
  const results: HandDecomposition[] = [];

  // Try each possible pair
  for (let pairIdx = 0; pairIdx < 34; pairIdx++) {
    if (counts[pairIdx] < 2) continue;

    counts[pairIdx] -= 2;
    const sets: TileFace[][] = [];

    if (extractSets(counts, 0, sets)) {
      results.push({
        pair: indexToFace(pairIdx),
        sets: sets.map((s) => [...s]),
      });
    }

    counts[pairIdx] += 2;
  }

  return results;
}

/** Recursively extract 4 sets (triplets or sequences) from counts */
function extractSets(counts: number[], startIdx: number, sets: TileFace[][]): boolean {
  if (sets.length === 4) {
    // All tiles should be consumed
    return counts.every((c) => c === 0);
  }

  // Find next non-zero tile
  let idx = startIdx;
  while (idx < 34 && counts[idx] === 0) idx++;
  if (idx >= 34) return false;

  // Try triplet
  if (counts[idx] >= 3) {
    counts[idx] -= 3;
    const face = indexToFace(idx);
    sets.push([face, face, face]);
    if (extractSets(counts, idx, sets)) return true;
    sets.pop();
    counts[idx] += 3;
  }

  // Try sequence (only for suited tiles, and idx must not be 8th or 9th in a suit)
  if (idx < 27) {
    const posInSuit = idx % 9;
    if (posInSuit <= 6 && counts[idx + 1] > 0 && counts[idx + 2] > 0) {
      // Check all 3 are in the same suit
      const suit = Math.floor(idx / 9);
      if (Math.floor((idx + 2) / 9) === suit) {
        counts[idx]--;
        counts[idx + 1]--;
        counts[idx + 2]--;
        sets.push([indexToFace(idx), indexToFace(idx + 1), indexToFace(idx + 2)]);
        if (extractSets(counts, idx, sets)) return true;
        sets.pop();
        counts[idx]++;
        counts[idx + 1]++;
        counts[idx + 2]++;
      }
    }
  }

  return false;
}

// ─── Special hand checks ──────────────────────────────────

/** Seven Pairs (chiitoitsu) — 7 distinct pairs */
export function isSevenPairs(faces: TileFace[]): boolean {
  if (faces.length !== 14) return false;
  const counts = tilesToCounts(faces);
  let pairs = 0;
  for (const c of counts) {
    if (c === 2) pairs++;
    else if (c !== 0) return false;
  }
  return pairs === 7;
}

/** Thirteen Orphans (kokushi) — one of each terminal/honor + 1 duplicate */
export function isThirteenOrphans(faces: TileFace[]): boolean {
  if (faces.length !== 14) return false;
  const counts = tilesToCounts(faces);
  // Terminal/honor indices: 0,8,9,17,18,26,27,28,29,30,31,32,33
  const required = [0, 8, 9, 17, 18, 26, 27, 28, 29, 30, 31, 32, 33];
  let hasPair = false;

  for (const idx of required) {
    if (counts[idx] === 0) return false;
    if (counts[idx] === 2) hasPair = true;
  }

  // Only terminal/honor tiles allowed
  const totalRequired = required.reduce((sum, idx) => sum + counts[idx], 0);
  return totalRequired === 14 && hasPair;
}

/** Check if hand is complete (any form) */
export function isComplete(faces: TileFace[]): boolean {
  if (faces.length !== 14) return false;
  return (
    findWinningDecompositions(faces).length > 0 ||
    isSevenPairs(faces) ||
    isThirteenOrphans(faces)
  );
}

// ─── Shanten calculation ───────────────────────────────────
// Shanten = minimum tiles needed to swap to reach tenpai
// -1 = complete, 0 = tenpai, 1 = iishanten, etc.

export function calculateShanten(faces: TileFace[]): number {
  const counts = tilesToCounts(faces);
  let minShanten = 8; // worst case for 13 tiles

  // Regular hand: 4 mentsu + 1 jantai
  for (let pairIdx = 0; pairIdx < 34; pairIdx++) {
    if (counts[pairIdx] < 2) continue;
    counts[pairIdx] -= 2;
    const { mentsu, partial } = countMentsuAndPartial(counts);
    const s = 8 - 2 * mentsu - partial - 1; // -1 for having the pair
    minShanten = Math.min(minShanten, s);
    counts[pairIdx] += 2;
  }

  // Without pair
  {
    const { mentsu, partial } = countMentsuAndPartial(counts);
    const s = 8 - 2 * mentsu - partial;
    minShanten = Math.min(minShanten, s);
  }

  // Seven pairs
  {
    let pairs = 0;
    let types = 0;
    for (const c of counts) {
      if (c >= 2) pairs++;
      if (c >= 1) types++;
    }
    const s = 6 - pairs;
    minShanten = Math.min(minShanten, s);
  }

  // Thirteen orphans
  {
    const required = [0, 8, 9, 17, 18, 26, 27, 28, 29, 30, 31, 32, 33];
    let found = 0;
    let hasPair = false;
    for (const idx of required) {
      if (counts[idx] >= 1) found++;
      if (counts[idx] >= 2) hasPair = true;
    }
    const s = 13 - found - (hasPair ? 1 : 0);
    minShanten = Math.min(minShanten, s);
  }

  return minShanten;
}

function countMentsuAndPartial(counts: number[]): {
  mentsu: number;
  partial: number;
} {
  let bestMentsu = 0;
  let bestPartial = 0;

  function search(idx: number, mentsu: number, partial: number) {
    // Limit: mentsu + partial <= 4
    const maxUseful = mentsu + partial;
    if (mentsu > bestMentsu || (mentsu === bestMentsu && partial > bestPartial)) {
      bestMentsu = mentsu;
      bestPartial = Math.min(partial, 4 - mentsu);
    }

    if (maxUseful >= 4) return;

    // Find next non-zero
    let i = idx;
    while (i < 34 && counts[i] === 0) i++;
    if (i >= 34) return;

    // Try triplet
    if (counts[i] >= 3) {
      counts[i] -= 3;
      search(i, mentsu + 1, partial);
      counts[i] += 3;
    }

    // Try sequence (suited only)
    if (i < 27 && i % 9 <= 6) {
      if (counts[i + 1] > 0 && counts[i + 2] > 0 && Math.floor(i / 9) === Math.floor((i + 2) / 9)) {
        counts[i]--;
        counts[i + 1]--;
        counts[i + 2]--;
        search(i, mentsu + 1, partial);
        counts[i]++;
        counts[i + 1]++;
        counts[i + 2]++;
      }
    }

    // Try partial: pair
    if (counts[i] >= 2) {
      counts[i] -= 2;
      search(i, mentsu, partial + 1);
      counts[i] += 2;
    }

    // Try partial: adjacent sequence (suited only)
    if (i < 27 && i % 9 <= 7) {
      if (counts[i + 1] > 0 && Math.floor(i / 9) === Math.floor((i + 1) / 9)) {
        counts[i]--;
        counts[i + 1]--;
        search(i, mentsu, partial + 1);
        counts[i]++;
        counts[i + 1]++;
      }
    }

    // Try partial: gap sequence (suited only, e.g., 1-3)
    if (i < 27 && i % 9 <= 6) {
      if (counts[i + 2] > 0 && Math.floor(i / 9) === Math.floor((i + 2) / 9)) {
        counts[i]--;
        counts[i + 2]--;
        search(i, mentsu, partial + 1);
        counts[i]++;
        counts[i + 2]++;
      }
    }

    // Skip this tile
    counts[i]--;
    search(i, mentsu, partial);
    counts[i]++;
  }

  search(0, 0, 0);
  return { mentsu: bestMentsu, partial: Math.min(bestPartial, 4 - bestMentsu) };
}

// ─── Waits (tenpai tiles) ─────────────────────────────────

/** Given a 13-tile hand, find all tiles that complete it */
export function findWaits(faces: TileFace[]): TileFace[] {
  if (faces.length !== 13) return [];
  const waits: TileFace[] = [];

  for (let idx = 0; idx < 34; idx++) {
    const testFaces = [...faces, indexToFace(idx)];
    if (isComplete(testFaces)) {
      waits.push(indexToFace(idx));
    }
  }

  return waits;
}

// ─── Tile acceptance count ─────────────────────────────────

/** Count how many different tiles improve the hand (lower shanten) */
export function tileAcceptance(faces: TileFace[]): {
  count: number;
  tiles: TileFace[];
} {
  const currentShanten = calculateShanten(faces);
  const accepting: TileFace[] = [];

  for (let idx = 0; idx < 34; idx++) {
    const counts = tilesToCounts(faces);
    if (counts[idx] >= 4) continue; // no copies left
    const testFaces = [...faces, indexToFace(idx)];
    if (calculateShanten(testFaces) < currentShanten) {
      accepting.push(indexToFace(idx));
    }
  }

  return { count: accepting.length, tiles: accepting };
}
