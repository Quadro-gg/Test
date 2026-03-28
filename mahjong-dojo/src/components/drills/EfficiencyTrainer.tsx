"use client";

import { useState, useMemo, useCallback } from "react";
import type { TileFace, Tile as TileType } from "@/lib/tiles";
import { createFullTileSet, shuffleTiles, tileCode } from "@/lib/tiles";
import { calculateShanten, tileAcceptance } from "@/engine/hand-utils";
import Tile from "@/components/Tile";

function generateHand(): { hand: TileFace[]; drawn: TileFace } {
  const tiles = shuffleTiles(createFullTileSet());
  const handTiles = tiles.slice(0, 14);
  const faces = handTiles.map((t) => t.face);
  return { hand: faces.slice(0, 13), drawn: faces[13] };
}

interface DiscardOption {
  face: TileFace;
  index: number;
  acceptance: number;
  shanten: number;
}

export default function EfficiencyTrainer() {
  const [handState, setHandState] = useState(() => generateHand());
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [streak, setStreak] = useState(0);

  const fullHand = [...handState.hand, handState.drawn];

  // Calculate efficiency for each possible discard
  const discardOptions = useMemo(() => {
    const options: DiscardOption[] = [];
    const seen = new Set<string>();

    for (let i = 0; i < fullHand.length; i++) {
      const code = tileCode(fullHand[i]);
      if (seen.has(code)) continue;
      seen.add(code);

      const remaining = fullHand.filter((_, j) => j !== i);
      const shanten = calculateShanten(remaining);
      const { count } = tileAcceptance(remaining);
      options.push({ face: fullHand[i], index: i, acceptance: count, shanten });
    }

    return options.sort((a, b) => {
      if (a.shanten !== b.shanten) return a.shanten - b.shanten;
      return b.acceptance - a.acceptance;
    });
  }, [fullHand]);

  const bestOption = discardOptions[0];

  function handleSubmit() {
    if (selected === null) return;
    const selectedCode = tileCode(fullHand[selected]);
    const isCorrect = discardOptions
      .filter((o) => o.shanten === bestOption.shanten && o.acceptance === bestOption.acceptance)
      .some((o) => tileCode(o.face) === selectedCode);

    setScore((s) => ({
      correct: s.correct + (isCorrect ? 1 : 0),
      total: s.total + 1,
    }));
    setStreak(isCorrect ? streak + 1 : 0);
    setShowResult(true);
  }

  function handleNext() {
    setHandState(generateHand());
    setSelected(null);
    setShowResult(false);
  }

  const selectedOption = selected !== null
    ? discardOptions.find((o) => tileCode(o.face) === tileCode(fullHand[selected]))
    : null;

  return (
    <div className="space-y-6">
      <div className="flex gap-6 text-sm">
        <span className="text-gray-500">
          Score: <strong className="text-gray-900">{score.correct}/{score.total}</strong>
        </span>
        <span className="text-gray-500">
          Accuracy: <strong className="text-gray-900">
            {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%
          </strong>
        </span>
        <span className="text-gray-500">
          Streak: <strong className="text-emerald-600">{streak}</strong>
        </span>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <p className="text-sm text-gray-500">
          Choose the discard that maximizes tile acceptance (most tiles that improve your hand).
        </p>

        {/* Hand display */}
        <div className="flex gap-0.5 flex-wrap items-end">
          {handState.hand.map((face, i) => (
            <div
              key={i}
              className={`cursor-pointer ${
                selected === i ? "ring-2 ring-amber-400 rounded" : ""
              } ${
                showResult && tileCode(face) === tileCode(bestOption.face)
                  ? "ring-2 ring-emerald-400 rounded"
                  : ""
              }`}
              onClick={() => !showResult && setSelected(i)}
            >
              <Tile face={face} size="lg" />
            </div>
          ))}
          <div className="ml-3">
            <div
              className={`cursor-pointer ${
                selected === 13 ? "ring-2 ring-amber-400 rounded" : ""
              } ${
                showResult && tileCode(handState.drawn) === tileCode(bestOption.face)
                  ? "ring-2 ring-emerald-400 rounded"
                  : ""
              }`}
              onClick={() => !showResult && setSelected(13)}
            >
              <Tile face={handState.drawn} size="lg" />
            </div>
          </div>
        </div>

        {/* Shanten display */}
        <div className="text-xs text-gray-400">
          Current shanten: {calculateShanten(fullHand.filter((_, i) => i !== (selected ?? -1)))}
          {selected !== null && selectedOption && (
            <> | Acceptance after discard: {selectedOption.acceptance} tiles</>
          )}
        </div>

        {!showResult && (
          <button
            onClick={handleSubmit}
            disabled={selected === null}
            className="px-6 py-2 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 disabled:opacity-30 transition-colors"
          >
            Discard Selected
          </button>
        )}

        {showResult && (
          <div className="space-y-3">
            <div className="p-3 rounded-lg text-sm bg-gray-50">
              <strong>Best discard:</strong> {tileCode(bestOption.face)} — Shanten: {bestOption.shanten}, Acceptance: {bestOption.acceptance} tiles
              {selectedOption && selectedOption.acceptance !== bestOption.acceptance && (
                <div className="mt-1 text-amber-700">
                  Your choice: {tileCode(selectedOption.face)} — Acceptance: {selectedOption.acceptance} tiles
                  ({bestOption.acceptance - selectedOption.acceptance} fewer)
                </div>
              )}
            </div>

            {/* Top 5 discard options */}
            <details className="text-xs text-gray-500">
              <summary className="cursor-pointer hover:text-gray-700">
                All discard options ranked
              </summary>
              <div className="mt-2 space-y-1">
                {discardOptions.slice(0, 8).map((opt, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Tile face={opt.face} size="sm" />
                    <span>
                      Shanten: {opt.shanten}, Acceptance: {opt.acceptance}
                    </span>
                  </div>
                ))}
              </div>
            </details>

            <button
              onClick={handleNext}
              className="px-6 py-2 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
            >
              Next Hand
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
