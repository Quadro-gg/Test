// ─── Re-export tile types from lib, plus engine-specific types ──────

export type { Suit, WindValue, DragonValue, TileFace, Tile } from "@/lib/tiles";
export {
  createFullTileSet,
  shuffleTiles,
  sortTiles,
  tileSortKey,
  tileCode,
  tileLabel,
} from "@/lib/tiles";

import type { Tile, TileFace, WindValue } from "@/lib/tiles";

// ─── Game-specific types ───────────────────────────────────

export type Wind = WindValue; // "east" | "south" | "west" | "north"

export interface Meld {
  type: "chi" | "pon" | "open-kan" | "closed-kan" | "added-kan";
  tiles: Tile[];
  /** Which player the tile was called from (for open melds) */
  calledFrom?: number;
}

export interface PlayerState {
  seatWind: Wind;
  hand: Tile[]; // concealed tiles
  melds: Meld[]; // called/declared sets
  discards: Tile[];
  points: number;
  riichiDeclared: boolean;
  riichiTurn: number | null; // turn number when riichi was declared
  ippatsu: boolean; // true until next draw/call after riichi
}

export type GamePhase =
  | "dealing"
  | "drawing"
  | "discarding"
  | "waiting-for-calls"
  | "round-end"
  | "game-end";

export interface RoundInfo {
  roundWind: Wind; // "east" | "south" (= prevailing wind)
  roundNumber: number; // 1-4 within a wind
  honba: number; // consecutive dealer wins/draws
  riichiSticks: number; // unclaimed riichi deposits (1000 pts each)
}

export interface GameState {
  phase: GamePhase;
  players: [PlayerState, PlayerState, PlayerState, PlayerState];
  wall: Tile[];
  deadWall: Tile[];
  doraIndicators: Tile[];
  uraDoraIndicators: Tile[];
  currentPlayer: number; // 0-3
  turnNumber: number;
  round: RoundInfo;
  lastDiscard: { tile: Tile; player: number } | null;
}

// ─── Wall & Deal ───────────────────────────────────────────

export function buildWall(tiles: Tile[]): { wall: Tile[]; deadWall: Tile[] } {
  // Dead wall = last 14 tiles
  const deadWall = tiles.slice(tiles.length - 14);
  const wall = tiles.slice(0, tiles.length - 14);
  return { wall, deadWall };
}

export function dealHands(wall: Tile[]): {
  hands: [Tile[], Tile[], Tile[], Tile[]];
  remainingWall: Tile[];
} {
  const hands: [Tile[], Tile[], Tile[], Tile[]] = [[], [], [], []];
  let idx = 0;

  // Deal 4 tiles × 3 rounds to each player
  for (let round = 0; round < 3; round++) {
    for (let p = 0; p < 4; p++) {
      hands[p].push(...wall.slice(idx, idx + 4));
      idx += 4;
    }
  }
  // Then 1 tile each
  for (let p = 0; p < 4; p++) {
    hands[p].push(wall[idx]);
    idx += 1;
  }

  return { hands, remainingWall: wall.slice(idx) };
}

// ─── Yaku result ───────────────────────────────────────────

export interface YakuResult {
  name: string;
  han: number;
  isYakuman?: boolean;
}

export interface WinResult {
  winner: number;
  loser: number | null; // null = tsumo
  hand: Tile[];
  melds: Meld[];
  winningTile: Tile;
  yaku: YakuResult[];
  han: number;
  fu: number;
  points: number;
  isYakuman: boolean;
}

// ─── Call (chi/pon/kan/ron) option ─────────────────────────

export type CallType = "chi" | "pon" | "kan" | "ron" | "tsumo";

export interface CallOption {
  type: CallType;
  player: number;
  tiles: Tile[]; // tiles from hand used to form the call
  completedMeld?: Meld;
}
