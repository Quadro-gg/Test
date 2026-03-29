"use client";

import { ACHIEVEMENTS, type Achievement } from "@/data/achievements";

interface AchievementGridProps {
  unlockedIds: string[];
  showAll?: boolean;
}

export default function AchievementGrid({ unlockedIds, showAll = false }: AchievementGridProps) {
  const unlocked = ACHIEVEMENTS.filter((a) => unlockedIds.includes(a.id));
  const locked = ACHIEVEMENTS.filter((a) => !unlockedIds.includes(a.id));
  const display = showAll ? [...unlocked, ...locked] : unlocked.slice(0, 6);

  if (display.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic">
        No achievements yet. Start learning to unlock them!
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {display.map((achievement) => {
        const isUnlocked = unlockedIds.includes(achievement.id);
        return (
          <div
            key={achievement.id}
            className={`p-3 rounded-lg border text-center ${
              isUnlocked
                ? "bg-white border-emerald-200"
                : "bg-gray-50 border-gray-200 opacity-50"
            }`}
          >
            <div className="text-2xl mb-1">{achievement.icon}</div>
            <div className="text-xs font-medium truncate">{achievement.title}</div>
            <div className="text-xs text-gray-400 truncate">{achievement.description}</div>
          </div>
        );
      })}
    </div>
  );
}
