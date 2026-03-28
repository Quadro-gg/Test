"use client";

import Link from "next/link";
import { ALL_LESSONS } from "@/data/lessons";

export default function LessonsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Lessons</h1>
        <p className="text-gray-600 mt-1">
          Master Riichi Mahjong step by step — from tiles to scoring.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {ALL_LESSONS.map((lesson, i) => (
          <Link
            key={lesson.id}
            href={`/lessons/${lesson.id}`}
            className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-5"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                {i + 1}
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{lesson.title}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {lesson.description}
                </p>
                <span className="inline-block mt-2 text-xs text-emerald-600 font-medium">
                  +{lesson.xpReward} XP
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
