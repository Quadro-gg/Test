"use client";

import { useProgressStore } from "@/lib/progress-store";
import AchievementGrid from "@/components/dashboard/AchievementGrid";

export default function AchievementsPage() {
  const { unlockedAchievements } = useProgressStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Achievements</h1>
        <p className="text-gray-600 mt-1">
          {unlockedAchievements.length} of 23 unlocked
        </p>
      </div>
      <AchievementGrid unlockedIds={unlockedAchievements} showAll />
    </div>
  );
}
