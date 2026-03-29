"use client";

interface StreakDisplayProps {
  streakDays: number;
}

export default function StreakDisplay({ streakDays }: StreakDisplayProps) {
  // Show last 7 days
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const todayIdx = new Date().getDay(); // 0=Sun
  // Remap: Mon=0, Tue=1, ..., Sun=6
  const remapped = todayIdx === 0 ? 6 : todayIdx - 1;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold text-amber-500">{streakDays}</span>
        <span className="text-sm text-gray-500">day streak</span>
      </div>
      <div className="flex gap-1">
        {days.map((day, i) => {
          const isActive = i <= remapped && streakDays > remapped - i;
          return (
            <div key={i} className="text-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                  isActive
                    ? "bg-amber-400 text-white"
                    : i <= remapped
                    ? "bg-gray-200 text-gray-400"
                    : "bg-gray-100 text-gray-300"
                }`}
              >
                {day}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
