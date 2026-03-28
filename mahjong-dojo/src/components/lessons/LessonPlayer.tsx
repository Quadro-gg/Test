"use client";

import { useState } from "react";
import type { Lesson, LessonStep } from "@/data/lesson-types";
import type { TileFace } from "@/lib/tiles";
import Tile from "@/components/Tile";
import Hand from "@/components/Hand";

interface LessonPlayerProps {
  lesson: Lesson;
  onComplete: () => void;
}

export default function LessonPlayer({ lesson, onComplete }: LessonPlayerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [quizCount, setQuizCount] = useState(0);

  const step = lesson.steps[currentStep];
  const isLastStep = currentStep === lesson.steps.length - 1;
  const progress = ((currentStep + 1) / lesson.steps.length) * 100;

  function handleAnswer(idx: number) {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    setShowExplanation(true);
    setQuizCount((c) => c + 1);
    if (idx === step.correctAnswer) {
      setCorrectCount((c) => c + 1);
    }
  }

  function handleNext() {
    if (isLastStep) {
      onComplete();
      return;
    }
    setCurrentStep((s) => s + 1);
    setSelectedAnswer(null);
    setShowExplanation(false);
  }

  function canAdvance(): boolean {
    if (step.type === "quiz") return showExplanation;
    return true;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Step {currentStep + 1} of {lesson.steps.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="bg-white rounded-lg shadow p-6 min-h-[200px]">
        <StepContent
          step={step}
          selectedAnswer={selectedAnswer}
          showExplanation={showExplanation}
          onAnswer={handleAnswer}
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => {
            setCurrentStep((s) => Math.max(0, s - 1));
            setSelectedAnswer(null);
            setShowExplanation(false);
          }}
          disabled={currentStep === 0}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-30"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!canAdvance()}
          className="px-6 py-2 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-30"
        >
          {isLastStep ? "Complete Lesson" : "Next"}
        </button>
      </div>
    </div>
  );
}

// ─── Step Content Renderer ─────────────────────────────────

function StepContent({
  step,
  selectedAnswer,
  showExplanation,
  onAnswer,
}: {
  step: LessonStep;
  selectedAnswer: number | null;
  showExplanation: boolean;
  onAnswer: (idx: number) => void;
}) {
  switch (step.type) {
    case "text":
      return (
        <div className="prose prose-sm">
          {step.content?.split("\n").map((line, i) => (
            <p key={i} className="text-gray-700 leading-relaxed">
              {line}
            </p>
          ))}
        </div>
      );

    case "tile-display":
      return (
        <div className="space-y-4">
          {step.content && (
            <p className="text-gray-700 leading-relaxed">{step.content}</p>
          )}
          {step.tiles && (
            <div className="flex gap-1 flex-wrap">
              {step.tiles.map((face, i) => (
                <div
                  key={i}
                  className={
                    step.highlightTiles?.includes(i)
                      ? "ring-2 ring-amber-400 rounded"
                      : ""
                  }
                >
                  <Tile face={face} size="lg" />
                </div>
              ))}
            </div>
          )}
        </div>
      );

    case "quiz":
      return (
        <div className="space-y-4">
          <p className="text-gray-900 font-medium text-lg">{step.question}</p>
          <div className="space-y-2">
            {step.options?.map((option, i) => {
              const isSelected = selectedAnswer === i;
              const isCorrect = i === step.correctAnswer;
              let style = "border-gray-200 hover:border-emerald-400";
              if (showExplanation) {
                if (isCorrect) style = "border-emerald-500 bg-emerald-50";
                else if (isSelected) style = "border-red-400 bg-red-50";
                else style = "border-gray-200 opacity-50";
              } else if (isSelected) {
                style = "border-emerald-500";
              }

              return (
                <button
                  key={i}
                  onClick={() => onAnswer(i)}
                  disabled={selectedAnswer !== null}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${style}`}
                >
                  <span className="text-sm">{option.label}</span>
                  {option.tiles && (
                    <div className="flex gap-0.5 mt-2">
                      {option.tiles.map((face, j) => (
                        <Tile key={j} face={face} size="sm" />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          {showExplanation && step.explanation && (
            <div className={`p-3 rounded-lg text-sm ${
              selectedAnswer === step.correctAnswer
                ? "bg-emerald-50 text-emerald-800"
                : "bg-amber-50 text-amber-800"
            }`}>
              {selectedAnswer === step.correctAnswer ? "Correct! " : "Not quite. "}
              {step.explanation}
            </div>
          )}
        </div>
      );

    default:
      return <p className="text-gray-500">Unknown step type</p>;
  }
}
