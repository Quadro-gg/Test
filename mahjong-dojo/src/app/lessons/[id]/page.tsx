"use client";

import { use, useState } from "react";
import { getLessonById, ALL_LESSONS } from "@/data/lessons";
import { useProgressStore } from "@/lib/progress-store";
import { XP_REWARDS } from "@/lib/progression";
import LessonPlayer from "@/components/lessons/LessonPlayer";
import Link from "next/link";

export default function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const lesson = getLessonById(id);
  const [completed, setCompleted] = useState(false);
  const { addXP, completeLesson, completedLessons, unlockAchievement } = useProgressStore();

  if (!lesson) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-bold">Lesson not found</h1>
        <Link href="/lessons" className="text-emerald-600 hover:underline mt-2 inline-block">
          Back to lessons
        </Link>
      </div>
    );
  }

  function handleComplete() {
    const alreadyDone = completedLessons.includes(lesson!.id);
    setCompleted(true);

    if (!alreadyDone) {
      addXP(lesson!.xpReward);
      completeLesson(lesson!.id);

      // Achievement checks
      const newCompleted = [...completedLessons, lesson!.id];
      if (newCompleted.length === 1) unlockAchievement("first-steps");
      if (newCompleted.length >= 3) unlockAchievement("quick-learner");
      if (newCompleted.length >= ALL_LESSONS.length) unlockAchievement("bookworm");
    }
  }

  const nextLesson = ALL_LESSONS.find(
    (l) => l.order === lesson.order + 1
  );

  if (completed) {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
          <span className="text-3xl">&#10003;</span>
        </div>
        <h1 className="text-2xl font-bold">Lesson Complete!</h1>
        <p className="text-gray-600">{lesson.title}</p>
        <p className="text-emerald-600 font-semibold">+{lesson.xpReward} XP</p>
        <div className="flex gap-3 justify-center pt-4">
          <Link
            href="/lessons"
            className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
          >
            All Lessons
          </Link>
          {nextLesson && (
            <Link
              href={`/lessons/${nextLesson.id}`}
              className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-600"
              onClick={() => setCompleted(false)}
            >
              Next: {nextLesson.title}
            </Link>
          )}
          <button
            onClick={() => setCompleted(false)}
            className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
          >
            Replay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/lessons" className="hover:text-gray-700">
          Lessons
        </Link>
        <span>/</span>
        <span className="text-gray-900">{lesson.title}</span>
      </div>
      <LessonPlayer lesson={lesson} onComplete={handleComplete} />
    </div>
  );
}
