import type { Tile, TileFace } from "@/lib/tiles";
import type { Meld, PlayerState, CallOption } from "./types";
import { facesEqual, isSuited, isComplete, findByFace } from "./hand-utils";

// ─── Detect possible calls on a discard ────────────────────

export function detectCalls(
  discard: Tile,
  player: PlayerState,
  playerIdx: number,
  discardPlayerIdx: number
): CallOption[] {
  const options: CallOption[] = [];
  const hand = player.hand;
  const face = discard.face;

  // ── Pon (any player except discarder) ──
  const matching = findByFace(hand, face);
  if (matching.length >= 2) {
    options.push({
      type: "pon",
      player: playerIdx,
      tiles: matching.slice(0, 2),
      completedMeld: {
        type: "pon",
        tiles: [matching[0], matching[1], discard],
        calledFrom: discardPlayerIdx,
      },
    });
  }

  // ── Kan (open kan from discard) ──
  if (matching.length >= 3) {
    options.push({
      type: "kan",
      player: playerIdx,
      tiles: matching.slice(0, 3),
      completedMeld: {
        type: "open-kan",
        tiles: [...matching.slice(0, 3), discard],
        calledFrom: discardPlayerIdx,
      },
    });
  }

  // ── Chi (only from the player to the left, i.e., previous player) ──
  const isLeftOf = (discardPlayerIdx + 1) % 4 === playerIdx;
  if (isLeftOf && isSuited(face)) {
    const suit = face.suit;
    const val = face.value;

    // Find possible sequences containing this tile
    const seqStarts = [val - 2, val - 1, val].filter((s) => s >= 1 && s + 2 <= 9);
    for (const start of seqStarts) {
      const needed = [start, start + 1, start + 2].filter((v) => v !== val);
      const neededTiles: Tile[] = [];
      let canForm = true;

      for (const v of needed) {
        const found = hand.find(
          (t) =>
            t.face.type === "suited" && t.face.suit === suit && t.face.value === v
        );
        if (found) {
          neededTiles.push(found);
        } else {
          canForm = false;
          break;
        }
      }

      if (canForm && neededTiles.length === 2) {
        options.push({
          type: "chi",
          player: playerIdx,
          tiles: neededTiles,
          completedMeld: {
            type: "chi",
            tiles: [...neededTiles, discard],
            calledFrom: discardPlayerIdx,
          },
        });
      }
    }
  }

  // ── Ron ──
  const testHand = [...hand.map((t) => t.face), face];
  if (testHand.length === 14 || (testHand.length + player.melds.length * 3) === 14) {
    if (isComplete(testHand)) {
      options.push({
        type: "ron",
        player: playerIdx,
        tiles: [],
      });
    }
  }

  return options;
}

// ─── Detect possible self-draw actions ─────────────────────

export function detectSelfActions(player: PlayerState): CallOption[] {
  const options: CallOption[] = [];
  const hand = player.hand;

  // ── Tsumo (win on self-draw) ──
  const faces = hand.map((t) => t.face);
  const meldCount = player.melds.length;
  if (faces.length + meldCount * 3 === 14 && isComplete(faces)) {
    options.push({
      type: "tsumo",
      player: 0, // will be set by caller
      tiles: [],
    });
  }

  // ── Closed Kan ──
  const counts = new Map<string, Tile[]>();
  for (const t of hand) {
    const key = faceKey(t.face);
    const arr = counts.get(key) || [];
    arr.push(t);
    counts.set(key, arr);
  }

  for (const [, tiles] of counts) {
    if (tiles.length === 4) {
      options.push({
        type: "kan",
        player: 0,
        tiles: tiles,
        completedMeld: {
          type: "closed-kan",
          tiles: tiles,
        },
      });
    }
  }

  // ── Added Kan (add to existing pon) ──
  for (const meld of player.melds) {
    if (meld.type === "pon") {
      const matchInHand = hand.find((t) => facesEqual(t.face, meld.tiles[0].face));
      if (matchInHand) {
        options.push({
          type: "kan",
          player: 0,
          tiles: [matchInHand],
          completedMeld: {
            type: "added-kan",
            tiles: [...meld.tiles, matchInHand],
          },
        });
      }
    }
  }

  return options;
}

function faceKey(face: TileFace): string {
  if (face.type === "suited") return `${face.suit}-${face.value}`;
  return `${face.type}-${face.value}`;
}
