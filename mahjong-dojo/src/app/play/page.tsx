"use client";

import { useGameStore } from "@/engine/game-store";
import GameBoard from "@/components/game/GameBoard";
import type { AIDifficulty } from "@/engine/ai";

const DIFFICULTIES: { value: AIDifficulty; label: string; desc: string }[] = [
  { value: "easy", label: "Easy", desc: "Random discards, never calls" },
  { value: "medium", label: "Medium", desc: "Basic efficiency, calls yakuhai" },
  { value: "hard", label: "Hard", desc: "Optimizes shanten, reads danger" },
];

export default function PlayPage() {
  const {
    state,
    humanPlayer,
    callOptions,
    canRiichi,
    canTsumo,
    showHint,
    gameLog,
    roundResult,
    startGame,
    humanDiscard,
    humanRiichi,
    humanTsumo,
    humanCall,
    humanPass,
    toggleHint,
    nextRound,
  } = useGameStore();

  if (!state) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Play vs AI</h1>
          <p className="text-gray-600 mt-1">
            Play a full 4-player Riichi Mahjong game against AI opponents.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.value}
              onClick={() => startGame(d.value)}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 text-center"
            >
              <h2 className="font-semibold text-lg">{d.label}</h2>
              <p className="text-sm text-gray-500 mt-2">{d.desc}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Play vs AI</h1>
        <button
          onClick={() => useGameStore.setState({ state: null })}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Quit Game
        </button>
      </div>

      <GameBoard
        state={state}
        humanPlayer={humanPlayer}
        callOptions={callOptions}
        canRiichi={canRiichi}
        canTsumo={canTsumo}
        showHint={showHint}
        roundResult={roundResult}
        onDiscard={humanDiscard}
        onRiichi={humanRiichi}
        onTsumo={humanTsumo}
        onCall={humanCall}
        onPass={humanPass}
        onToggleHint={toggleHint}
        onNextRound={nextRound}
      />

      {/* Game log */}
      <details className="text-xs text-gray-500">
        <summary className="cursor-pointer hover:text-gray-700">Game Log</summary>
        <div className="mt-2 bg-white rounded p-3 max-h-40 overflow-y-auto space-y-0.5">
          {gameLog.map((msg, i) => (
            <div key={i}>{msg}</div>
          ))}
        </div>
      </details>
    </div>
  );
}
