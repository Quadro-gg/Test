"use client";

import { useState, useMemo } from "react";
import type { TileFace } from "@/lib/tiles";
import { tileCode } from "@/lib/tiles";
import { DISCARD_SCENARIOS } from "@/data/drill-scenarios";
import type { DiscardScenario } from "@/data/drill-scenarios";
import Tile from "@/components/Tile";
import { useProgressStore } from "@/lib/progress-store";
import { XP_REWARDS } from "@/lib/progression";

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function DiscardTrainer() {
  const scenarios = useMemo(() => shuffleArray(DISCARD_SCENARIOS), []);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [streak, setStreak] = useState(0);
  const { addXP, recordDrill, unlockAchievement } = useProgressStore();

  const scenario = scenarios[currentIdx % scenarios.length];
  const hand = scenario.hand;

  function handleTileClick(idx: number) {
    if (showResult) return;
    setSelected(idx);
  }

  function handleSubmit() {
    if (selected === null) return;
    const selectedFace = hand[selected];
    const isCorrect = tileCode(selectedFace) === tileCode(scenario.bestDiscard);

    const newTotal = score.total + 1;
    const newCorrect = score.correct + (isCorrect ? 1 : 0);
    const newStreak = isCorrect ? streak + 1 : 0;
    setScore({ correct: newCorrect, total: newTotal });
    setStreak(newStreak);
    setShowResult(true);

    recordDrill(isCorrect);
    if (isCorrect) addXP(XP_REWARDS.drillCorrect);
    if (newStreak === 10) unlockAchievement("sharp-eye");
    if (newTotal >= 50) unlockAchievement("drill-sergeant");
    if (newTotal >= 10 && newCorrect / newTotal >= 0.9) unlockAchievement("discard-pro");
  }

  function handleNext() {
    setCurrentIdx((i) => i + 1);
    setSelected(null);
    setShowResult(false);
  }

  const isCorrect =
    selected !== null &&
    tileCode(hand[selected]) === tileCode(scenario.bestDiscard);

  return (
    <div className="space-y-6">
      {/* Stats bar */}
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

      {/* Hand display */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <p className="text-sm text-gray-500">
          You drew the rightmost tile. Which tile should you discard?
        </p>
        <div className="flex gap-1 flex-wrap items-end">
          {hand.slice(0, 13).map((face, i) => (
            <div
              key={i}
              className={`cursor-pointer ${
                selected === i ? "ring-2 ring-amber-400 rounded" : ""
              } ${showResult && tileCode(face) === tileCode(scenario.bestDiscard) ? "ring-2 ring-emerald-400 rounded" : ""}`}
              onClick={() => handleTileClick(i)}
            >
              <Tile face={face} size="lg" />
            </div>
          ))}
          {/* Drawn tile with gap */}
          <div className="ml-3">
            <div
              className={`cursor-pointer ${
                selected === 13 ? "ring-2 ring-amber-400 rounded" : ""
              } ${showResult && tileCode(hand[13]) === tileCode(scenario.bestDiscard) ? "ring-2 ring-emerald-400 rounded" : ""}`}
              onClick={() => handleTileClick(13)}
            >
              <Tile face={hand[13]} size="lg" />
            </div>
          </div>
        </div>

        {/* Action buttons */}
        {!showResult && (
          <button
            onClick={handleSubmit}
            disabled={selected === null}
            className="px-6 py-2 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 disabled:opacity-30 transition-colors"
          >
            Discard Selected
          </button>
        )}

        {/* Result */}
        {showResult && (
          <div className="space-y-3">
            <div
              className={`p-3 rounded-lg text-sm ${
                isCorrect
                  ? "bg-emerald-50 text-emerald-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              <strong>{isCorrect ? "Correct!" : "Not the best choice."}</strong>{" "}
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
