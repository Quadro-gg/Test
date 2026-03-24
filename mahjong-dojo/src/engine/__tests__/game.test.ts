import { describe, it, expect } from "vitest";
import {
  createInitialGameState,
  drawTile,
  discardTile,
  getAvailableActions,
  passCalls,
} from "../game";
import { buildWall, dealHands } from "../types";
import { createFullTileSet, shuffleTiles } from "@/lib/tiles";

describe("Game initialization", () => {
  it("creates a valid initial game state", () => {
    const state = createInitialGameState();

    // 4 players, each with 13 tiles
    for (const player of state.players) {
      expect(player.hand).toHaveLength(13);
      expect(player.melds).toHaveLength(0);
      expect(player.discards).toHaveLength(0);
      expect(player.points).toBe(25000);
    }

    // Correct winds
    expect(state.players[0].seatWind).toBe("east");
    expect(state.players[1].seatWind).toBe("south");
    expect(state.players[2].seatWind).toBe("west");
    expect(state.players[3].seatWind).toBe("north");

    // Wall should have remaining tiles
    // 136 - 14 dead wall - 52 dealt = 70
    expect(state.wall.length).toBe(70);
    expect(state.deadWall).toHaveLength(14);

    // Round info
    expect(state.round.roundWind).toBe("east");
    expect(state.round.roundNumber).toBe(1);
    expect(state.round.honba).toBe(0);

    // Game starts with drawing phase for east player
    expect(state.currentPlayer).toBe(0);
    expect(state.phase).toBe("drawing");
  });
});

describe("Wall building", () => {
  it("splits tiles into wall and dead wall", () => {
    const tiles = shuffleTiles(createFullTileSet());
    const { wall, deadWall } = buildWall(tiles);
    expect(wall).toHaveLength(122); // 136 - 14
    expect(deadWall).toHaveLength(14);
  });
});

describe("Dealing", () => {
  it("deals 13 tiles to each player", () => {
    const tiles = shuffleTiles(createFullTileSet());
    const { wall } = buildWall(tiles);
    const { hands, remainingWall } = dealHands(wall);

    for (const hand of hands) {
      expect(hand).toHaveLength(13);
    }
    expect(remainingWall).toHaveLength(122 - 52); // 70
  });
});

describe("Draw and discard cycle", () => {
  it("draws a tile and adds it to player hand", () => {
    const state = createInitialGameState();
    const newState = drawTile(state);

    expect(newState.players[0].hand).toHaveLength(14);
    expect(newState.wall.length).toBe(state.wall.length - 1);
    expect(newState.phase).toBe("discarding");
  });

  it("discards a tile from hand", () => {
    let state = createInitialGameState();
    state = drawTile(state);

    const tileToDiscard = state.players[0].hand[0];
    const newState = discardTile(state, tileToDiscard.id);

    expect(newState.players[0].hand).toHaveLength(13);
    expect(newState.players[0].discards).toHaveLength(1);
    expect(newState.phase).toBe("waiting-for-calls");
  });

  it("passes calls and moves to next player", () => {
    let state = createInitialGameState();
    state = drawTile(state);
    state = discardTile(state, state.players[0].hand[0].id);
    state = passCalls(state);

    expect(state.currentPlayer).toBe(1);
    expect(state.phase).toBe("drawing");
  });
});

describe("Full turn cycle", () => {
  it("completes a full round of 4 player turns", () => {
    let state = createInitialGameState();

    for (let turn = 0; turn < 4; turn++) {
      state = drawTile(state);
      expect(state.players[state.currentPlayer].hand).toHaveLength(14);

      const tileToDiscard = state.players[state.currentPlayer].hand[0];
      state = discardTile(state, tileToDiscard.id);
      expect(state.players[(state.currentPlayer)].discards).toHaveLength(1);

      state = passCalls(state);
    }

    // Should be back to player 0
    expect(state.currentPlayer).toBe(0);
  });
});
