"use client";

import { getLevelInfo, getXPProgress } from "@/lib/progression";

interface XPBarProps {
  xp: number;
}

export default function XPBar({ xp }: XPBarProps) {
  const info = getLevelInfo(xp);
  const progress = getXPProgress(xp);

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-baseline">
        <div>
          <span className="text-lg font-bold">Level {info.level}</span>
          <span className="ml-2 text-sm text-gray-500">{info.title}</span>
        </div>
        <span className="text-sm text-gray-400">
          {xp.toLocaleString()} / {info.maxXP.toLocaleString()} XP
        </span>
      </div>
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(progress * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}
