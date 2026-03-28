import type { Tile, TileFace } from "@/lib/tiles";
import { tileCode, tileSortKey } from "@/lib/tiles";
import type { PlayerState, Meld, CallOption, GameState } from "./types";
import { detectCalls, detectSelfActions } from "./calls";
import { calculateShanten, tileAcceptance, facesEqual, isTerminalOrHonor, isHonor, findWaits } from "./hand-utils";

export type AIDifficulty = "easy" | "medium" | "hard";

// ─── AI Decision Interface ─────────────────────────────────

export interface AIDecision {
  type: "discard" | "call" | "riichi" | "tsumo" | "pass";
  tileId?: number; // for discard
  call?: CallOption; // for call
}

// ─── Main AI entry point ───────────────────────────────────

export function getAIDecision(
  state: GameState,
  playerIdx: number,
  difficulty: AIDifficulty
): AIDecision {
  const player = state.players[playerIdx];

  // Check for tsumo (self-draw win)
  const selfActions = detectSelfActions(player);
  const tsumoAction = selfActions.find((a) => a.type === "tsumo");
  if (tsumoAction) {
    return { type: "tsumo" };
  }

  // Decide on discard
  switch (difficulty) {
    case "easy":
      return easyDiscard(player);
    case "medium":
      return mediumDiscard(player, state);
    case "hard":
      return hardDiscard(player, state);
  }
}

/** Decide whether AI should make a call on a discard */
export function getAICallDecision(
  state: GameState,
  playerIdx: number,
  options: CallOption[],
  difficulty: AIDifficulty
): AIDecision {
  const myOptions = options.filter((o) => o.player === playerIdx);
  if (myOptions.length === 0) return { type: "pass" };

  // Always ron
  const ronOption = myOptions.find((o) => o.type === "ron");
  if (ronOption) return { type: "call", call: ronOption };

  switch (difficulty) {
    case "easy":
      // Easy AI never calls
      return { type: "pass" };

    case "medium":
      // Medium calls pon for yakuhai (dragons, winds), skips chi
      return mediumCallDecision(myOptions, state, playerIdx);

    case "hard":
      // Hard evaluates whether calling improves the hand
      return hardCallDecision(myOptions, state, playerIdx);
  }
}

// ─── Easy AI ───────────────────────────────────────────────
// Random valid discard, no strategic thinking

function easyDiscard(player: PlayerState): AIDecision {
  const hand = player.hand;
  const idx = Math.floor(Math.random() * hand.length);
  return { type: "discard", tileId: hand[idx].id };
}

// ─── Medium AI ─────────────────────────────────────────────
// Basic tile efficiency: discard isolated tiles, keep connected ones

function mediumDiscard(player: PlayerState, state: GameState): AIDecision {
  const hand = player.hand;

  // If riichi'd, must discard drawn tile (last in hand)
  if (player.riichiDeclared) {
    return { type: "discard", tileId: hand[hand.length - 1].id };
  }

  // Score each tile: lower = better to discard
  const scores = hand.map((tile, i) => {
    let score = 0;
    const face = tile.face;

    // Isolated honor tiles are bad (unless we have 2+)
    if (isHonor(face)) {
      const count = hand.filter((t) => facesEqual(t.face, face)).length;
      if (count === 1) score -= 10;
      else if (count >= 3) score += 20;
      else score += 5;
    }

    // Terminal tiles are less useful
    if (face.type === "suited" && (face.value === 1 || face.value === 9)) {
      score -= 3;
    }

    // Middle tiles are more useful (more sequence potential)
    if (face.type === "suited" && face.value >= 3 && face.value <= 7) {
      score += 5;
    }

    // Connected tiles (adjacent in same suit) are good
    if (face.type === "suited") {
      for (const other of hand) {
        if (other.id === tile.id) continue;
        if (other.face.type === "suited" && other.face.suit === face.suit) {
          const diff = Math.abs(other.face.value - face.value);
          if (diff === 1) score += 8;
          else if (diff === 2) score += 3;
        }
      }
    }

    // Pairs are decent
    const pairCount = hand.filter((t) => t.id !== tile.id && facesEqual(t.face, face)).length;
    if (pairCount >= 1) score += 6;

    return { tile, score };
  });

  // Discard the tile with the lowest score
  scores.sort((a, b) => a.score - b.score);
  return { type: "discard", tileId: scores[0].tile.id };
}

function mediumCallDecision(
  options: CallOption[],
  state: GameState,
  playerIdx: number
): AIDecision {
  // Pon for dragons and matching wind
  const ponOption = options.find((o) => {
    if (o.type !== "pon" || !o.completedMeld) return false;
    const face = o.completedMeld.tiles[0].face;
    if (face.type === "dragon") return true;
    if (face.type === "wind") {
      const player = state.players[playerIdx];
      return face.value === player.seatWind || face.value === state.round.roundWind;
    }
    return false;
  });

  if (ponOption) return { type: "call", call: ponOption };
  return { type: "pass" };
}

// ─── Hard AI ───────────────────────────────────────────────
// Optimizes shanten, reads danger, calls strategically

function hardDiscard(player: PlayerState, state: GameState): AIDecision {
  const hand = player.hand;

  if (player.riichiDeclared) {
    return { type: "discard", tileId: hand[hand.length - 1].id };
  }

  // Check if we should declare riichi
  if (!player.riichiDeclared && player.points >= 1000) {
    const isClosed = player.melds.every((m) => m.type === "closed-kan");
    if (isClosed) {
      // Find if any discard leaves us tenpai
      for (const tile of hand) {
        const remaining = hand.filter((t) => t.id !== tile.id).map((t) => t.face);
        const waits = findWaits(remaining);
        if (waits.length > 0) {
          return { type: "riichi", tileId: tile.id };
        }
      }
    }
  }

  // Evaluate each discard by resulting shanten + acceptance
  const evaluated = hand.map((tile) => {
    const remaining = hand.filter((t) => t.id !== tile.id).map((t) => t.face);
    const shanten = calculateShanten(remaining);
    const { count } = tileAcceptance(remaining);

    // Danger score: avoid discarding tiles that opponents might want
    let danger = 0;
    for (let i = 0; i < 4; i++) {
      if (i === state.currentPlayer) continue;
      const opponent = state.players[i];
      if (opponent.riichiDeclared) {
        // If opponent declared riichi, avoid their safe tiles
        danger += isDangerous(tile.face, opponent) ? 10 : 0;
      }
    }

    return {
      tile,
      shanten,
      acceptance: count,
      danger,
      score: -shanten * 100 + count * 5 - danger,
    };
  });

  evaluated.sort((a, b) => b.score - a.score);

  // Discard the tile that results in the worst remaining hand (first in sorted = best to keep)
  // We want to discard the one whose REMOVAL results in the best hand
  // So the tile at index 0 is the best discard (highest score after removal)
  return { type: "discard", tileId: evaluated[0].tile.id };
}

function hardCallDecision(
  options: CallOption[],
  state: GameState,
  playerIdx: number
): AIDecision {
  const player = state.players[playerIdx];

  // Always pon yakuhai
  const yakuhaiPon = options.find((o) => {
    if (o.type !== "pon" || !o.completedMeld) return false;
    const face = o.completedMeld.tiles[0].face;
    if (face.type === "dragon") return true;
    if (face.type === "wind") {
      return face.value === player.seatWind || face.value === state.round.roundWind;
    }
    return false;
  });
  if (yakuhaiPon) return { type: "call", call: yakuhaiPon };

  // Evaluate if calling improves shanten
  for (const option of options) {
    if (option.type === "chi" || option.type === "pon") {
      const currentFaces = player.hand.map((t) => t.face);
      const currentShanten = calculateShanten(currentFaces);

      // Simulate the call
      const afterCall = player.hand
        .filter((t) => !option.tiles.some((ot) => ot.id === t.id))
        .map((t) => t.face);
      const afterShanten = calculateShanten(afterCall);

      // Only call if it improves shanten by at least 1
      if (afterShanten < currentShanten - 1) {
        return { type: "call", call: option };
      }
    }
  }

  return { type: "pass" };
}

// ─── Danger assessment ─────────────────────────────────────

function isDangerous(face: TileFace, opponent: PlayerState): boolean {
  // Simple heuristic: tiles not seen in opponent's discards are more dangerous
  const inDiscards = opponent.discards.some((t) => facesEqual(t.face, face));
  if (inDiscards) return false; // suji/safe tile approximation

  // Honor tiles are generally dangerous against riichi
  if (isHonor(face)) return true;

  // Terminal tiles are somewhat dangerous
  if (face.type === "suited" && (face.value === 1 || face.value === 9)) return true;

  return false;
}
