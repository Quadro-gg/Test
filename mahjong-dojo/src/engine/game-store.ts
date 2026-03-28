"use client";

import { create } from "zustand";
import type { GameState, CallOption } from "./types";
import type { AIDifficulty, AIDecision } from "./ai";
import { getAIDecision, getAICallDecision } from "./ai";
import {
  createInitialGameState,
  drawTile,
  discardTile,
  declareRiichi,
  processCall,
  passCalls,
  getAvailableActions,
  startNextRound,
} from "./game";

interface GameStore {
  state: GameState | null;
  humanPlayer: number; // which seat the human plays (always 0)
  difficulty: AIDifficulty;
  callOptions: CallOption[];
  canRiichi: boolean;
  canTsumo: boolean;
  showHint: boolean;
  gameLog: string[];
  roundResult: string | null;

  // Actions
  startGame: (difficulty: AIDifficulty) => void;
  humanDiscard: (tileId: number) => void;
  humanRiichi: (tileId: number) => void;
  humanTsumo: () => void;
  humanCall: (call: CallOption) => void;
  humanPass: () => void;
  toggleHint: () => void;
  nextRound: () => void;
}

const HUMAN = 0;
const AI_DELAY = 600; // ms between AI actions

export const useGameStore = create<GameStore>((set, get) => ({
  state: null,
  humanPlayer: HUMAN,
  difficulty: "medium",
  callOptions: [],
  canRiichi: false,
  canTsumo: false,
  showHint: false,
  gameLog: [],
  roundResult: null,

  startGame: (difficulty) => {
    const state = createInitialGameState();
    set({
      state,
      difficulty,
      callOptions: [],
      canRiichi: false,
      canTsumo: false,
      gameLog: ["Game started. East 1."],
      roundResult: null,
    });

    // If human is East (seat 0), they draw first
    if (state.currentPlayer === HUMAN) {
      const drawn = drawTile(state);
      const actions = getAvailableActions(drawn);
      set({
        state: drawn,
        canRiichi: actions.canRiichi,
        canTsumo: actions.canTsumo,
        callOptions: actions.callOptions,
      });
    } else {
      // AI starts
      setTimeout(() => runAITurn(get, set), AI_DELAY);
    }
  },

  humanDiscard: (tileId) => {
    const { state } = get();
    if (!state || state.currentPlayer !== HUMAN || state.phase !== "discarding") return;

    const newState = discardTile(state, tileId);
    set({ state: newState, canRiichi: false, canTsumo: false });
    addLog(set, `You discarded a tile.`);

    // Check for AI calls
    processAfterDiscard(get, set);
  },

  humanRiichi: (tileId) => {
    const { state } = get();
    if (!state || state.currentPlayer !== HUMAN) return;

    let newState = declareRiichi(state);
    newState = discardTile(newState, tileId);
    set({ state: newState, canRiichi: false, canTsumo: false });
    addLog(set, `You declared Riichi!`);

    processAfterDiscard(get, set);
  },

  humanTsumo: () => {
    const { state } = get();
    if (!state) return;

    const tsumoCall: CallOption = { type: "tsumo", player: HUMAN, tiles: [] };
    const newState = processCall(state, tsumoCall);
    set({ state: newState, roundResult: "You win by Tsumo!", canTsumo: false });
    addLog(set, `You win by Tsumo!`);
  },

  humanCall: (call) => {
    const { state } = get();
    if (!state) return;

    const newState = processCall(state, call);
    set({ state: newState, callOptions: [] });
    addLog(set, `You called ${call.type}!`);

    // After calling, human needs to discard (unless kan which auto-draws)
    if (newState.phase === "discarding" && newState.currentPlayer === HUMAN) {
      const actions = getAvailableActions(newState);
      set({ canRiichi: actions.canRiichi, canTsumo: actions.canTsumo });
    } else {
      setTimeout(() => runAITurn(get, set), AI_DELAY);
    }
  },

  humanPass: () => {
    const { state } = get();
    if (!state) return;

    set({ callOptions: [] });

    // Move to next player
    const newState = passCalls(state);
    set({ state: newState });

    // Run AI turn
    setTimeout(() => runAITurn(get, set), AI_DELAY);
  },

  toggleHint: () => set((s) => ({ showHint: !s.showHint })),

  nextRound: () => {
    const { state } = get();
    if (!state) return;

    const newState = startNextRound(state, false);
    set({
      state: newState,
      roundResult: null,
      callOptions: [],
      gameLog: [...get().gameLog, `--- New Round ---`],
    });

    if (newState.phase === "game-end") {
      set({ roundResult: "Game Over!" });
      return;
    }

    // Start drawing
    if (newState.currentPlayer === HUMAN) {
      const drawn = drawTile(newState);
      const actions = getAvailableActions(drawn);
      set({
        state: drawn,
        canRiichi: actions.canRiichi,
        canTsumo: actions.canTsumo,
      });
    } else {
      setTimeout(() => runAITurn(get, set), AI_DELAY);
    }
  },
}));

// ─── AI Turn Logic ─────────────────────────────────────────

function runAITurn(get: () => GameStore, set: (partial: Partial<GameStore> | ((s: GameStore) => Partial<GameStore>)) => void) {
  const { state, difficulty } = get();
  if (!state || state.phase === "round-end" || state.phase === "game-end") return;

  const current = state.currentPlayer;
  if (current === HUMAN) {
    // Human's turn — draw and wait
    if (state.phase === "drawing") {
      const drawn = drawTile(state);
      if (drawn.phase === "round-end") {
        set({ state: drawn, roundResult: "Exhaustive draw — no one wins." });
        addLog(set, "Wall exhausted. Draw.");
        return;
      }
      const actions = getAvailableActions(drawn);
      set({
        state: drawn,
        canRiichi: actions.canRiichi,
        canTsumo: actions.canTsumo,
        callOptions: actions.callOptions,
      });
    }
    return;
  }

  // AI's turn
  if (state.phase === "drawing") {
    const drawn = drawTile(state);
    if (drawn.phase === "round-end") {
      set({ state: drawn, roundResult: "Exhaustive draw — no one wins." });
      addLog(set, "Wall exhausted. Draw.");
      return;
    }

    // Check for AI tsumo/riichi/discard
    const decision = getAIDecision(drawn, current, difficulty);

    if (decision.type === "tsumo") {
      const tsumoCall: CallOption = { type: "tsumo", player: current, tiles: [] };
      const result = processCall(drawn, tsumoCall);
      const windNames = ["East", "South", "West", "North"];
      set({
        state: result,
        roundResult: `${windNames[current]} wins by Tsumo!`,
      });
      addLog(set, `${windNames[current]} wins by Tsumo!`);
      return;
    }

    if (decision.type === "riichi" && decision.tileId !== undefined) {
      let riichi = declareRiichi(drawn);
      riichi = discardTile(riichi, decision.tileId);
      const windNames = ["East", "South", "West", "North"];
      addLog(set, `${windNames[current]} declares Riichi!`);
      set({ state: riichi });
      processAfterDiscard(get, set);
      return;
    }

    if (decision.tileId !== undefined) {
      const discarded = discardTile(drawn, decision.tileId);
      set({ state: discarded });
      processAfterDiscard(get, set);
      return;
    }
  }
}

function processAfterDiscard(get: () => GameStore, set: (partial: Partial<GameStore> | ((s: GameStore) => Partial<GameStore>)) => void) {
  const { state, difficulty } = get();
  if (!state || !state.lastDiscard) return;

  const actions = getAvailableActions(state);

  // Check if human can call
  const humanCalls = actions.callOptions.filter((o) => o.player === HUMAN);
  if (humanCalls.length > 0) {
    set({ callOptions: humanCalls });
    return; // Wait for human decision
  }

  // Check if any AI wants to call
  for (const aiIdx of [1, 2, 3]) {
    const aiOptions = actions.callOptions.filter((o) => o.player === aiIdx);
    if (aiOptions.length > 0) {
      const decision = getAICallDecision(state, aiIdx, aiOptions, difficulty);
      if (decision.type === "call" && decision.call) {
        const windNames = ["East", "South", "West", "North"];

        if (decision.call.type === "ron") {
          const result = processCall(state, decision.call);
          set({
            state: result,
            roundResult: `${windNames[aiIdx]} wins by Ron!`,
          });
          addLog(set, `${windNames[aiIdx]} wins by Ron!`);
          return;
        }

        const called = processCall(state, decision.call);
        addLog(set, `${windNames[aiIdx]} calls ${decision.call.type}!`);
        set({ state: called });

        // AI needs to discard after call
        if (called.currentPlayer !== HUMAN) {
          setTimeout(() => {
            const { state: s } = get();
            if (!s || s.currentPlayer === HUMAN) return;
            const aiDiscard = getAIDecision(s, s.currentPlayer, difficulty);
            if (aiDiscard.tileId !== undefined) {
              const afterDiscard = discardTile(s, aiDiscard.tileId);
              set({ state: afterDiscard });
              processAfterDiscard(get, set);
            }
          }, AI_DELAY);
        }
        return;
      }
    }
  }

  // No calls — advance to next player
  const advanced = passCalls(state);
  set({ state: advanced, callOptions: [] });

  // Run next player's turn
  setTimeout(() => runAITurn(get, set), AI_DELAY);
}

function addLog(set: (partial: Partial<GameStore> | ((s: GameStore) => Partial<GameStore>)) => void, msg: string) {
  set((s) => ({ gameLog: [...s.gameLog, msg] }));
}
