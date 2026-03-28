"use client";

import { useState, useMemo } from "react";
import type { TileFace } from "@/lib/tiles";
import { tileCode } from "@/lib/tiles";
import { TENPAI_SCENARIOS } from "@/data/drill-scenarios";
import Tile from "@/components/Tile";

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// All possible tiles for selection
function allUniqueFaces(): TileFace[] {
  const faces: TileFace[] = [];
  for (const suit of ["man", "pin", "sou"] as const) {
    for (let v = 1; v <= 9; v++) {
      faces.push({ type: "suited", suit, value: v });
    }
  }
  for (const v of ["east", "south", "west", "north"] as const) {
    faces.push({ type: "wind", value: v });
  }
  for (const v of ["white", "green", "red"] as const) {
    faces.push({ type: "dragon", value: v });
  }
  return faces;
}

export default function TenpaiQuiz() {
  const scenarios = useMemo(() => shuffleArray(TENPAI_SCENARIOS), []);
  const allFaces = useMemo(() => allUniqueFaces(), []);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedWaits, setSelectedWaits] = useState<Set<string>>(new Set());
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const scenario = scenarios[currentIdx % scenarios.length];
  const correctCodes = new Set(scenario.waits.map(tileCode));

  function toggleTile(face: TileFace) {
    if (showResult) return;
    const code = tileCode(face);
    setSelectedWaits((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  function handleSubmit() {
    const isCorrect =
      selectedWaits.size === correctCodes.size &&
      [...selectedWaits].every((c) => correctCodes.has(c));

    setScore((s) => ({
      correct: s.correct + (isCorrect ? 1 : 0),
      total: s.total + 1,
    }));
    setShowResult(true);
  }

  function handleNext() {
    setCurrentIdx((i) => i + 1);
    setSelectedWaits(new Set());
    setShowResult(false);
  }

  const isCorrect =
    selectedWaits.size === correctCodes.size &&
    [...selectedWaits].every((c) => correctCodes.has(c));

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
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <p className="text-sm text-gray-500">
          This hand is tenpai. Select ALL tiles it's waiting on:
        </p>

        {/* Hand display */}
        <div className="flex gap-0.5 flex-wrap">
          {scenario.hand.map((face, i) => (
            <Tile key={i} face={face} size="lg" />
          ))}
        </div>

        {/* Tile selector */}
        <div>
          <p className="text-xs text-gray-400 mb-2">Click tiles to select waits:</p>
          <div className="flex gap-0.5 flex-wrap">
            {allFaces.map((face, i) => {
              const code = tileCode(face);
              const isSelected = selectedWaits.has(code);
              const isAnswer = correctCodes.has(code);

              let ringClass = "";
              if (showResult && isAnswer) ringClass = "ring-2 ring-emerald-400 rounded";
              else if (showResult && isSelected && !isAnswer) ringClass = "ring-2 ring-red-400 rounded";
              else if (isSelected) ringClass = "ring-2 ring-amber-400 rounded";

              return (
                <div
                  key={i}
                  className={`cursor-pointer ${ringClass} ${showResult && !isSelected && !isAnswer ? "opacity-30" : ""}`}
                  onClick={() => toggleTile(face)}
                >
                  <Tile face={face} size="sm" />
                </div>
              );
            })}
          </div>
        </div>

        {!showResult && (
          <button
            onClick={handleSubmit}
            disabled={selectedWaits.size === 0}
            className="px-6 py-2 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 disabled:opacity-30 transition-colors"
          >
            Check Answer
          </button>
        )}

        {showResult && (
          <div className="space-y-3">
            <div
              className={`p-3 rounded-lg text-sm ${
                isCorrect
                  ? "bg-emerald-50 text-emerald-800"
                  : "bg-amber-50 text-amber-800"
              }`}
            >
              <strong>{isCorrect ? "Perfect!" : "Not quite."}</strong>{" "}
              {scenario.explanation}
            </div>
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
