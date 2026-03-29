"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useProgressStore } from "@/lib/progress-store";
import XPBar from "@/components/dashboard/XPBar";
import StreakDisplay from "@/components/dashboard/StreakDisplay";
import AchievementGrid from "@/components/dashboard/AchievementGrid";
import StatsCard from "@/components/dashboard/StatsCard";
import { ALL_LESSONS } from "@/data/lessons";

export default function Home() {
  const {
    xp,
    level,
    streakDays,
    completedLessons,
    unlockedAchievements,
    drillStats,
    gameStats,
    checkStreak,
  } = useProgressStore();

  useEffect(() => {
    checkStreak();
  }, [checkStreak]);

  const nextLesson = ALL_LESSONS.find((l) => !completedLessons.includes(l.id));

  return (
    <div className="space-y-6">
      {/* Welcome / XP */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h1 className="text-2xl font-bold">Mahjong Dojo</h1>
        <XPBar xp={xp} />
        <StreakDisplay streakDays={streakDays} />
      </div>

      {/* Quick start buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {nextLesson && (
          <Link
            href={`/lessons/${nextLesson.id}`}
            className="bg-emerald-700 text-white rounded-lg p-4 text-center hover:bg-emerald-600 transition-colors"
          >
            <div className="text-sm font-medium">Continue Lesson</div>
            <div className="text-xs opacity-80 mt-1">{nextLesson.title}</div>
          </Link>
        )}
        <Link
          href="/drills/discard"
          className="bg-blue-600 text-white rounded-lg p-4 text-center hover:bg-blue-500 transition-colors"
        >
          <div className="text-sm font-medium">Quick Drill</div>
          <div className="text-xs opacity-80 mt-1">Discard Trainer</div>
        </Link>
        <Link
          href="/play"
          className="bg-amber-500 text-white rounded-lg p-4 text-center hover:bg-amber-400 transition-colors"
        >
          <div className="text-sm font-medium">Quick Match</div>
          <div className="text-xs opacity-80 mt-1">vs AI</div>
        </Link>
        <Link
          href="/lessons"
          className="bg-gray-100 text-gray-700 rounded-lg p-4 text-center hover:bg-gray-200 transition-colors"
        >
          <div className="text-sm font-medium">All Lessons</div>
          <div className="text-xs opacity-60 mt-1">{completedLessons.length}/{ALL_LESSONS.length} done</div>
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatsCard
          label="Lessons"
          value={`${completedLessons.length}/${ALL_LESSONS.length}`}
        />
        <StatsCard
          label="Drill Accuracy"
          value={
            drillStats.totalRounds > 0
              ? `${Math.round((drillStats.correctAnswers / drillStats.totalRounds) * 100)}%`
              : "—"
          }
          sub={`${drillStats.totalRounds} rounds`}
        />
        <StatsCard
          label="Games Won"
          value={gameStats.gamesWon}
          sub={`${gameStats.gamesPlayed} played`}
        />
        <StatsCard
          label="Best Streak"
          value={drillStats.bestStreak}
          sub="drills in a row"
        />
      </div>

      {/* Recent achievements */}
      <div className="bg-white rounded-lg shadow p-6 space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Achievements</h2>
          <Link href="/achievements" className="text-sm text-emerald-600 hover:underline">
            View all
          </Link>
        </div>
        <AchievementGrid unlockedIds={unlockedAchievements} />
      </div>
    </div>
  );
}
