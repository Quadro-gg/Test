import type { TileFace } from "@/lib/tiles";

// ─── Lesson Data Types ─────────────────────────────────────

export interface LessonStep {
  type: "text" | "tile-display" | "quiz" | "hand-builder" | "tile-select";
  content?: string; // markdown-ish text for "text" steps
  tiles?: TileFace[]; // tiles to display
  highlightTiles?: number[]; // indices into tiles[] to highlight
  question?: string;
  options?: QuizOption[];
  correctAnswer?: number; // index into options
  explanation?: string;
  handSize?: number; // for hand-builder: how many tiles to place
}

export interface QuizOption {
  label: string;
  tiles?: TileFace[]; // optional tile display for this option
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  order: number;
  xpReward: number;
  steps: LessonStep[];
}
