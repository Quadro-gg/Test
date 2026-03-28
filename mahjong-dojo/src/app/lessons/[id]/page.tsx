"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { getLessonById } from "@/data/lessons";
import LessonPlayer from "@/components/lessons/LessonPlayer";
import Link from "next/link";

export default function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const lesson = getLessonById(id);
  const [completed, setCompleted] = useState(false);

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
          <button
            onClick={() => {
              setCompleted(false);
            }}
            className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-600"
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
      <LessonPlayer lesson={lesson} onComplete={() => setCompleted(true)} />
    </div>
  );
}
