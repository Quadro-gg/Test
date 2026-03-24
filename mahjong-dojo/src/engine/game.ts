import type {
  GameState,
  PlayerState,
  Wind,
  RoundInfo,
  Tile,
  Meld,
  CallOption,
  WinResult,
} from "./types";
import { createFullTileSet, shuffleTiles, sortTiles } from "@/lib/tiles";
import { buildWall, dealHands } from "./types";
import { detectCalls, detectSelfActions } from "./calls";
import { evaluateYaku, type YakuContext } from "./yaku";
import { scoreHand } from "./scoring";
import { facesEqual, findWaits } from "./hand-utils";
import { tileCode } from "@/lib/tiles";

const WINDS: Wind[] = ["east", "south", "west", "north"];

// ─── Initialize a game ────────────────────────────────────

export function createInitialGameState(): GameState {
  const tiles = shuffleTiles(createFullTileSet());
  const { wall: mainWall, deadWall } = buildWall(tiles);
  const { hands, remainingWall } = dealHands(mainWall);

  const players: [PlayerState, PlayerState, PlayerState, PlayerState] = [
    makePlayer("east", hands[0], 25000),
    makePlayer("south", hands[1], 25000),
    makePlayer("west", hands[2], 25000),
    makePlayer("north", hands[3], 25000),
  ];

  return {
    phase: "drawing",
    players,
    wall: remainingWall,
    deadWall,
    doraIndicators: [deadWall[0]], // first dora indicator
    uraDoraIndicators: [deadWall[5]], // first ura dora indicator
    currentPlayer: 0, // East starts
    turnNumber: 0,
    round: {
      roundWind: "east",
      roundNumber: 1,
      honba: 0,
      riichiSticks: 0,
    },
    lastDiscard: null,
  };
}

function makePlayer(wind: Wind, hand: Tile[], points: number): PlayerState {
  return {
    seatWind: wind,
    hand: [...hand],
    melds: [],
    discards: [],
    points,
    riichiDeclared: false,
    riichiTurn: null,
    ippatsu: false,
  };
}

// ─── Game actions ──────────────────────────────────────────

/** Draw a tile from the wall */
export function drawTile(state: GameState): GameState {
  if (state.wall.length === 0) {
    return { ...state, phase: "round-end" };
  }

  const newState = structuredClone(state);
  const tile = newState.wall.shift()!;
  newState.players[newState.currentPlayer].hand.push(tile);
  newState.phase = "discarding";
  newState.turnNumber++;

  return newState;
}

/** Discard a tile from hand */
export function discardTile(state: GameState, tileId: number): GameState {
  const newState = structuredClone(state);
  const player = newState.players[newState.currentPlayer];

  const tileIdx = player.hand.findIndex((t: Tile) => t.id === tileId);
  if (tileIdx === -1) return state;

  const [discarded] = player.hand.splice(tileIdx, 1);
  player.discards.push(discarded);
  newState.lastDiscard = { tile: discarded, player: newState.currentPlayer };

  // Clear ippatsu for all players who haven't had their turn interrupted
  for (const p of newState.players) {
    if (p.ippatsu && p !== player) {
      // Keep ippatsu — it's cleared after their next draw
    }
  }

  newState.phase = "waiting-for-calls";
  return newState;
}

/** Declare riichi (must discard after this) */
export function declareRiichi(state: GameState): GameState {
  const newState = structuredClone(state);
  const player = newState.players[newState.currentPlayer];

  if (player.riichiDeclared) return state;
  if (player.points < 1000) return state;

  // Check tenpai: hand should be 14 tiles, removing any one should give tenpai
  const isTenpai = player.hand.some((_: Tile, i: number) => {
    const remaining = player.hand.filter((_: Tile, j: number) => j !== i).map((t: Tile) => t.face);
    return findWaits(remaining).length > 0;
  });

  if (!isTenpai) return state;

  player.riichiDeclared = true;
  player.riichiTurn = newState.turnNumber;
  player.ippatsu = true;
  player.points -= 1000;
  newState.round.riichiSticks++;

  return newState;
}

/** Process a call (chi/pon/kan/ron) */
export function processCall(state: GameState, call: CallOption): GameState {
  const newState = structuredClone(state);

  if (call.type === "ron") {
    return processWin(newState, call.player, false);
  }

  if (call.type === "tsumo") {
    return processWin(newState, call.player, true);
  }

  const player = newState.players[call.player];

  // Remove used tiles from hand
  for (const usedTile of call.tiles) {
    const idx = player.hand.findIndex((t: Tile) => t.id === usedTile.id);
    if (idx >= 0) player.hand.splice(idx, 1);
  }

  // Add the meld
  if (call.completedMeld) {
    player.melds.push(call.completedMeld);

    // Remove the discard from the discarder's discard pile for pon/chi/open-kan
    if (
      newState.lastDiscard &&
      (call.type === "chi" || call.type === "pon" || call.type === "kan") &&
      call.completedMeld.type !== "closed-kan"
    ) {
      const discardPlayer = newState.players[newState.lastDiscard.player];
      const discardIdx = discardPlayer.discards.findIndex(
        (t: Tile) => t.id === newState.lastDiscard!.tile.id
      );
      if (discardIdx >= 0) discardPlayer.discards.splice(discardIdx, 1);
    }
  }

  // After kan, draw from dead wall
  if (call.type === "kan") {
    if (newState.deadWall.length > 0) {
      const kanDraw = newState.deadWall.pop()!;
      player.hand.push(kanDraw);
      // Reveal new dora indicator
      if (newState.doraIndicators.length < 5 && newState.deadWall.length > 0) {
        newState.doraIndicators.push(
          newState.deadWall[newState.doraIndicators.length]
        );
      }
    }
    newState.phase = "discarding";
    newState.currentPlayer = call.player;
    return newState;
  }

  // After chi/pon, the calling player discards
  newState.phase = "discarding";
  newState.currentPlayer = call.player;

  // Clear ippatsu for all players on any call
  for (const p of newState.players) {
    p.ippatsu = false;
  }

  return newState;
}

/** Skip calls and move to next player */
export function passCalls(state: GameState): GameState {
  const newState = structuredClone(state);
  newState.currentPlayer = (newState.currentPlayer + 1) % 4;
  newState.phase = "drawing";

  // Clear ippatsu for the player who just drew
  newState.players[newState.currentPlayer].ippatsu = false;

  return newState;
}

// ─── Win processing ────────────────────────────────────────

function processWin(state: GameState, winner: number, isTsumo: boolean): GameState {
  const player = state.players[winner];
  const winningTile = isTsumo
    ? player.hand[player.hand.length - 1]
    : state.lastDiscard!.tile;

  const handFaces = player.hand.map((t: Tile) => t.face);
  const loser = isTsumo ? null : state.lastDiscard!.player;

  // Count dora
  const doraCount = countDora(
    [...player.hand, ...(isTsumo ? [] : [winningTile])],
    player.melds,
    state.doraIndicators
  );
  const uraDoraCount = player.riichiDeclared
    ? countDora(
        [...player.hand, ...(isTsumo ? [] : [winningTile])],
        player.melds,
        state.uraDoraIndicators
      )
    : 0;

  const yakuCtx: YakuContext = {
    hand: isTsumo ? handFaces.slice(0, -1) : handFaces,
    winningTile: winningTile.face,
    melds: player.melds,
    isTsumo,
    seatWind: player.seatWind,
    roundWind: state.round.roundWind,
    isRiichi: player.riichiDeclared,
    isDoubleRiichi: player.riichiDeclared && player.riichiTurn === 0,
    isIppatsu: player.ippatsu,
    isHaitei: isTsumo && state.wall.length === 0,
    isHoutei: !isTsumo && state.wall.length === 0,
    isRinshan: false, // simplified
    isChankan: false, // simplified
    doraCount,
    uraDoraCount,
  };

  const yaku = evaluateYaku(yakuCtx);
  if (yaku.length === 0) return state; // no yaku = no win

  const isClosed = player.melds.every((m: Meld) => m.type === "closed-kan");
  const isDealer = player.seatWind === "east";
  const score = scoreHand(
    yaku,
    isTsumo,
    isClosed,
    isDealer,
    state.round.honba
  );

  // Apply point transfers
  if (isTsumo) {
    const [nonDealerPay, dealerPay] = score.payments as [number, number];
    for (let i = 0; i < 4; i++) {
      if (i === winner) {
        state.players[i].points += score.total;
      } else if (state.players[i].seatWind === "east") {
        state.players[i].points -= dealerPay;
      } else {
        state.players[i].points -= nonDealerPay;
      }
    }
  } else {
    state.players[winner].points += score.total;
    state.players[loser!].points -= score.payments as number;
  }

  // Collect riichi sticks
  state.players[winner].points += state.round.riichiSticks * 1000;
  state.round.riichiSticks = 0;

  state.phase = "round-end";
  return state;
}

// ─── Dora counting ─────────────────────────────────────────

function getDoraFromIndicator(indicator: Tile): string {
  const face = indicator.face;
  if (face.type === "suited") {
    const nextVal = face.value === 9 ? 1 : face.value + 1;
    return tileCode({ type: "suited", suit: face.suit, value: nextVal });
  }
  if (face.type === "wind") {
    const order: Wind[] = ["east", "south", "west", "north"];
    const nextIdx = (order.indexOf(face.value) + 1) % 4;
    return tileCode({ type: "wind", value: order[nextIdx] });
  }
  const dragonOrder = ["white", "green", "red"] as const;
  const nextIdx = (dragonOrder.indexOf(face.value) + 1) % 3;
  return tileCode({ type: "dragon", value: dragonOrder[nextIdx] });
}

function countDora(hand: Tile[], melds: Meld[], indicators: Tile[]): number {
  const doraCodes = indicators.map(getDoraFromIndicator);
  let count = 0;

  const allTiles = [...hand, ...melds.flatMap((m) => m.tiles)];
  for (const tile of allTiles) {
    const code = tileCode(tile.face);
    for (const doraCode of doraCodes) {
      if (code === doraCode) count++;
    }
  }

  return count;
}

// ─── Get available actions for current state ───────────────

export function getAvailableActions(state: GameState): {
  callOptions: CallOption[];
  canRiichi: boolean;
  canTsumo: boolean;
} {
  const callOptions: CallOption[] = [];
  let canRiichi = false;
  let canTsumo = false;

  if (state.phase === "waiting-for-calls" && state.lastDiscard) {
    // Check each other player for calls
    for (let i = 0; i < 4; i++) {
      if (i === state.lastDiscard.player) continue;
      const options = detectCalls(
        state.lastDiscard.tile,
        state.players[i],
        i,
        state.lastDiscard.player
      );
      callOptions.push(...options);
    }
  }

  if (state.phase === "discarding") {
    const player = state.players[state.currentPlayer];
    const selfActions = detectSelfActions(player);

    canTsumo = selfActions.some((a) => a.type === "tsumo");

    // Check riichi possibility
    if (!player.riichiDeclared && player.points >= 1000) {
      const isClosed = player.melds.every((m) => m.type === "closed-kan");
      if (isClosed) {
        canRiichi = player.hand.some((_, i) => {
          const remaining = player.hand
            .filter((_, j) => j !== i)
            .map((t) => t.face);
          return findWaits(remaining).length > 0;
        });
      }
    }

    // Kan options
    const kanOptions = selfActions.filter((a) => a.type === "kan");
    callOptions.push(...kanOptions);
  }

  return { callOptions, canRiichi, canTsumo };
}

// ─── Start next round ──────────────────────────────────────

export function startNextRound(state: GameState, dealerWon: boolean): GameState {
  const newRound: RoundInfo = { ...state.round };

  if (dealerWon) {
    newRound.honba++;
  } else {
    // Rotate dealer
    if (newRound.roundNumber < 4) {
      newRound.roundNumber++;
    } else {
      // Next wind
      const windIdx = WINDS.indexOf(newRound.roundWind);
      if (windIdx < 1) {
        newRound.roundWind = WINDS[windIdx + 1];
        newRound.roundNumber = 1;
      } else {
        // Game over after South round
        return { ...state, phase: "game-end" };
      }
    }
    newRound.honba = 0;
  }

  // Rebuild and deal
  const tiles = shuffleTiles(createFullTileSet());
  const { wall: mainWall, deadWall } = buildWall(tiles);
  const { hands, remainingWall } = dealHands(mainWall);

  // Rotate seat winds if dealer didn't win
  const getWind = (playerIdx: number): Wind => {
    if (dealerWon) return state.players[playerIdx].seatWind;
    const currentWindIdx = WINDS.indexOf(state.players[playerIdx].seatWind);
    return WINDS[(currentWindIdx + 3) % 4]; // rotate: east->north->west->south
  };

  const newState: GameState = {
    phase: "drawing",
    players: [0, 1, 2, 3].map((i) => ({
      seatWind: getWind(i),
      hand: hands[i],
      melds: [] as Meld[],
      discards: [] as Tile[],
      points: state.players[i].points,
      riichiDeclared: false,
      riichiTurn: null,
      ippatsu: false,
    })) as unknown as [PlayerState, PlayerState, PlayerState, PlayerState],
    wall: remainingWall,
    deadWall,
    doraIndicators: [deadWall[0]],
    uraDoraIndicators: [deadWall[5]],
    currentPlayer: [0, 1, 2, 3].find((i) => getWind(i) === "east") || 0,
    turnNumber: 0,
    round: newRound,
    lastDiscard: null,
  };

  return newState;
}
