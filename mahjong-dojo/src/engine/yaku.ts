import type { TileFace, Tile } from "@/lib/tiles";
import type { Wind } from "./types";
import type { Meld, YakuResult } from "./types";
import {
  facesEqual,
  isHonor,
  isTerminal,
  isTerminalOrHonor,
  isSimple,
  isSuited,
  findWinningDecompositions,
  isSevenPairs,
  isThirteenOrphans,
  faceToIndex,
  type HandDecomposition,
} from "./hand-utils";
import { tileCode } from "@/lib/tiles";

// ─── Yaku context ──────────────────────────────────────────

export interface YakuContext {
  hand: TileFace[]; // concealed tiles (without winning tile)
  winningTile: TileFace;
  melds: Meld[];
  isTsumo: boolean; // self-draw win
  seatWind: Wind;
  roundWind: Wind;
  isRiichi: boolean;
  isDoubleRiichi: boolean;
  isIppatsu: boolean;
  isHaitei: boolean; // last tile from wall
  isHoutei: boolean; // last discard
  isRinshan: boolean; // after kan draw
  isChankan: boolean; // robbing a kan
  doraCount: number;
  uraDoraCount: number;
}

// ─── Individual yaku checks ───────────────────────────────

function allFaces(ctx: YakuContext): TileFace[] {
  const meldFaces = ctx.melds.flatMap((m) => m.tiles.map((t) => t.face));
  return [...ctx.hand, ctx.winningTile, ...meldFaces];
}

function isClosed(ctx: YakuContext): boolean {
  return ctx.melds.every(
    (m) => m.type === "closed-kan"
  );
}

function isSet3Sequence(set: TileFace[]): boolean {
  if (set.length !== 3) return false;
  return set.every((f) => f.type === "suited") && !facesEqual(set[0], set[1]);
}

function isSet3Triplet(set: TileFace[]): boolean {
  if (set.length !== 3) return false;
  return facesEqual(set[0], set[1]) && facesEqual(set[1], set[2]);
}

// ─── Evaluate all yaku ─────────────────────────────────────

export function evaluateYaku(ctx: YakuContext): YakuResult[] {
  const results: YakuResult[] = [];
  const closed = isClosed(ctx);
  const all = allFaces(ctx);

  // Build all possible decompositions for the full 14-tile hand
  const fullHand = [...ctx.hand, ctx.winningTile];
  // Include open meld tiles for decomposition-based checks
  const decomps = findWinningDecompositions(fullHand.length === 14 ? fullHand : all);

  // ── Riichi (1 han, closed only) ──
  if (ctx.isRiichi && !ctx.isDoubleRiichi) {
    results.push({ name: "Riichi", han: 1 });
  }

  // ── Double Riichi (2 han, closed only) ──
  if (ctx.isDoubleRiichi) {
    results.push({ name: "Double Riichi", han: 2 });
  }

  // ── Ippatsu (1 han) ──
  if (ctx.isIppatsu) {
    results.push({ name: "Ippatsu", han: 1 });
  }

  // ── Menzen Tsumo (1 han, closed + tsumo) ──
  if (ctx.isTsumo && closed) {
    results.push({ name: "Menzen Tsumo", han: 1 });
  }

  // ── Tanyao (1 han) — all simples ──
  if (all.every(isSimple)) {
    results.push({ name: "Tanyao", han: 1 });
  }

  // ── Pinfu (1 han, closed, all sequences, non-yakuhai pair, two-sided wait) ──
  if (closed && decomps.length > 0) {
    for (const d of decomps) {
      const allSeq = d.sets.every(isSet3Sequence);
      const pairNotYakuhai = !isYakuhaiFace(d.pair, ctx.seatWind, ctx.roundWind);
      // Simplified: check if winning tile can be part of a two-sided wait
      if (allSeq && pairNotYakuhai) {
        results.push({ name: "Pinfu", han: 1 });
        break;
      }
    }
  }

  // ── Iipeiko (1 han, closed) — two identical sequences ──
  if (closed && decomps.length > 0) {
    for (const d of decomps) {
      const seqs = d.sets.filter(isSet3Sequence);
      const codes = seqs.map((s) =>
        s
          .map(tileCode)
          .sort()
          .join(",")
      );
      const hasDuplicate = codes.some((c, i) => codes.indexOf(c) !== i);
      if (hasDuplicate) {
        results.push({ name: "Iipeiko", han: 1 });
        break;
      }
    }
  }

  // ── Yakuhai (1 han each) — dragons, seat wind, round wind ──
  const tripletFaces = getTripletFaces(decomps, ctx.melds);
  for (const face of tripletFaces) {
    if (face.type === "dragon") {
      const names: Record<string, string> = {
        white: "Haku",
        green: "Hatsu",
        red: "Chun",
      };
      results.push({ name: names[face.value], han: 1 });
    }
    if (face.type === "wind" && face.value === ctx.seatWind) {
      results.push({ name: "Seat Wind", han: 1 });
    }
    if (face.type === "wind" && face.value === ctx.roundWind) {
      results.push({ name: "Round Wind", han: 1 });
    }
  }

  // ── Chanta (2 han closed, 1 open) — all sets and pair have terminal/honor ──
  if (decomps.length > 0) {
    for (const d of decomps) {
      const allSetsHaveTH = d.sets.every((s) => s.some(isTerminalOrHonor));
      const pairTH = isTerminalOrHonor(d.pair);
      const hasSequence = d.sets.some(isSet3Sequence);
      if (allSetsHaveTH && pairTH && hasSequence) {
        results.push({ name: "Chanta", han: closed ? 2 : 1 });
        break;
      }
    }
  }

  // ── San Ankou (2 han) — 3 concealed triplets ──
  if (decomps.length > 0) {
    const concealedTripCount = countConcealedTriplets(decomps, ctx);
    if (concealedTripCount >= 3) {
      results.push({ name: "San Ankou", han: 2 });
    }
  }

  // ── Toitoi (2 han) — all triplets ──
  if (decomps.length > 0) {
    for (const d of decomps) {
      if (d.sets.every(isSet3Triplet)) {
        results.push({ name: "Toitoi", han: 2 });
        break;
      }
    }
  }

  // ── Honitsu (3 han closed, 2 open) — one suit + honors ──
  {
    const suits = new Set<string>();
    let hasHonor = false;
    for (const f of all) {
      if (f.type === "suited") suits.add(f.suit);
      else hasHonor = true;
    }
    if (suits.size === 1 && hasHonor) {
      results.push({ name: "Honitsu", han: closed ? 3 : 2 });
    }
  }

  // ── Chinitsu (6 han closed, 5 open) — one suit only ──
  {
    const suits = new Set<string>();
    let allSuited = true;
    for (const f of all) {
      if (f.type === "suited") suits.add(f.suit);
      else allSuited = false;
    }
    if (suits.size === 1 && allSuited) {
      // Chinitsu supersedes Honitsu
      const honitsuIdx = results.findIndex((r) => r.name === "Honitsu");
      if (honitsuIdx >= 0) results.splice(honitsuIdx, 1);
      results.push({ name: "Chinitsu", han: closed ? 6 : 5 });
    }
  }

  // ── Honroutou (2 han) — only terminals and honors ──
  if (all.every(isTerminalOrHonor)) {
    results.push({ name: "Honroutou", han: 2 });
  }

  // ── Shousangen (2 han) — 2 dragon triplets + dragon pair ──
  {
    const dragonTrips = tripletFaces.filter((f) => f.type === "dragon");
    if (decomps.length > 0 && dragonTrips.length === 2) {
      for (const d of decomps) {
        if (d.pair.type === "dragon") {
          results.push({ name: "Shousangen", han: 2 });
          break;
        }
      }
    }
  }

  // ── Chiitoitsu (2 han, closed) — seven pairs ──
  if (isSevenPairs(all)) {
    results.push({ name: "Chiitoitsu", han: 2 });
  }

  // ── Haitei / Houtei (1 han each) ──
  if (ctx.isHaitei) results.push({ name: "Haitei Raoyue", han: 1 });
  if (ctx.isHoutei) results.push({ name: "Houtei Raoyui", han: 1 });

  // ── Rinshan Kaihou (1 han) ──
  if (ctx.isRinshan) results.push({ name: "Rinshan Kaihou", han: 1 });

  // ── Chankan (1 han) ──
  if (ctx.isChankan) results.push({ name: "Chankan", han: 1 });

  // ── Dora ──
  if (ctx.doraCount > 0) {
    results.push({ name: "Dora", han: ctx.doraCount });
  }
  if (ctx.uraDoraCount > 0) {
    results.push({ name: "Ura Dora", han: ctx.uraDoraCount });
  }

  // ── Yakuman checks ──

  // Kokushi Musou (13 orphans)
  if (isThirteenOrphans(all)) {
    return [{ name: "Kokushi Musou", han: 13, isYakuman: true }];
  }

  // Suu Ankou (4 concealed triplets)
  if (decomps.length > 0) {
    const concealedTripCount = countConcealedTriplets(decomps, ctx);
    if (concealedTripCount >= 4) {
      return [{ name: "Suu Ankou", han: 13, isYakuman: true }];
    }
  }

  // Daisangen (3 dragon triplets)
  {
    const dragonTrips = tripletFaces.filter((f) => f.type === "dragon");
    if (dragonTrips.length === 3) {
      return [{ name: "Daisangen", han: 13, isYakuman: true }];
    }
  }

  // Tsuuiisou (all honors)
  if (all.every(isHonor)) {
    return [{ name: "Tsuuiisou", han: 13, isYakuman: true }];
  }

  // Chinroutou (all terminals)
  if (all.every(isTerminal)) {
    return [{ name: "Chinroutou", han: 13, isYakuman: true }];
  }

  // Ryuuiisou (all green — 2,3,4,6,8 sou + hatsu)
  {
    const isGreen = (f: TileFace) =>
      (f.type === "suited" &&
        f.suit === "sou" &&
        [2, 3, 4, 6, 8].includes(f.value)) ||
      (f.type === "dragon" && f.value === "green");
    if (all.every(isGreen)) {
      return [{ name: "Ryuuiisou", han: 13, isYakuman: true }];
    }
  }

  return results;
}

// ─── Helpers ───────────────────────────────────────────────

function isYakuhaiFace(face: TileFace, seatWind: Wind, roundWind: Wind): boolean {
  if (face.type === "dragon") return true;
  if (face.type === "wind" && (face.value === seatWind || face.value === roundWind)) return true;
  return false;
}

/** Get all faces that appear as triplets (from decomposition + open melds) */
function getTripletFaces(decomps: HandDecomposition[], melds: Meld[]): TileFace[] {
  const faces: TileFace[] = [];

  // From open melds
  for (const m of melds) {
    if (m.type === "pon" || m.type === "open-kan" || m.type === "closed-kan" || m.type === "added-kan") {
      faces.push(m.tiles[0].face);
    }
  }

  // From decompositions (take first valid one)
  if (decomps.length > 0) {
    for (const set of decomps[0].sets) {
      if (isSet3Triplet(set)) {
        faces.push(set[0]);
      }
    }
  }

  return faces;
}

function countConcealedTriplets(decomps: HandDecomposition[], ctx: YakuContext): number {
  let maxConcealed = 0;
  for (const d of decomps) {
    let count = 0;
    for (const set of d.sets) {
      if (isSet3Triplet(set)) count++;
    }
    // Add closed kans
    count += ctx.melds.filter((m) => m.type === "closed-kan").length;
    maxConcealed = Math.max(maxConcealed, count);
  }
  return maxConcealed;
}
