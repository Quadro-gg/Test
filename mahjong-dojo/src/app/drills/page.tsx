"use client";

import Link from "next/link";

const DRILLS = [
  {
    id: "discard",
    title: "Discard Trainer",
    description: "Given a 14-tile hand, pick the best tile to discard. Build your discard instincts.",
    difficulty: "Beginner",
    icon: "x",
  },
  {
    id: "tenpai",
    title: "Tenpai Quiz",
    description: "Identify all waiting tiles for a tenpai hand. Sharpen your pattern recognition.",
    difficulty: "Intermediate",
    icon: "?",
  },
  {
    id: "efficiency",
    title: "Efficiency Trainer",
    description: "Choose the discard that maximizes tile acceptance. Master tile efficiency.",
    difficulty: "Advanced",
    icon: "#",
  },
];

export default function DrillsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Drills</h1>
        <p className="text-gray-600 mt-1">
          Practice specific skills with instant feedback.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {DRILLS.map((drill) => (
          <Link
            key={drill.id}
            href={`/drills/${drill.id}`}
            className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 text-center"
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl mb-3">
              {drill.icon}
            </div>
            <h2 className="font-semibold text-gray-900">{drill.title}</h2>
            <p className="text-sm text-gray-500 mt-2">{drill.description}</p>
            <span className="inline-block mt-3 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
              {drill.difficulty}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
