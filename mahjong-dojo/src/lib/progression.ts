// ─── XP and Level System ───────────────────────────────────

export interface LevelInfo {
  level: number;
  title: string;
  minXP: number;
  maxXP: number;
}

const LEVEL_THRESHOLDS: { xp: number; title: string }[] = [
  { xp: 0, title: "Beginner" },
  { xp: 100, title: "Novice" },
  { xp: 300, title: "Apprentice" },
  { xp: 600, title: "Student" },
  { xp: 1000, title: "Adept" },
  { xp: 1500, title: "Skilled" },
  { xp: 2200, title: "Expert" },
  { xp: 3000, title: "Master" },
  { xp: 4000, title: "Grandmaster" },
  { xp: 5500, title: "Legend" },
  { xp: 7500, title: "Mahjong Sage" },
  { xp: 10000, title: "Enlightened" },
];

export function getLevelInfo(xp: number): LevelInfo {
  let level = 1;
  let title = LEVEL_THRESHOLDS[0].title;
  let minXP = 0;
  let maxXP = LEVEL_THRESHOLDS[1]?.xp ?? Infinity;

  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i].xp) {
      level = i + 1;
      title = LEVEL_THRESHOLDS[i].title;
      minXP = LEVEL_THRESHOLDS[i].xp;
      maxXP = LEVEL_THRESHOLDS[i + 1]?.xp ?? minXP + 2500;
    }
  }

  return { level, title, minXP, maxXP };
}

export function getXPProgress(xp: number): number {
  const info = getLevelInfo(xp);
  if (info.maxXP === info.minXP) return 1;
  return (xp - info.minXP) / (info.maxXP - info.minXP);
}

// XP rewards
export const XP_REWARDS = {
  lessonComplete: 50,
  lessonCompleteBonus: 25, // for getting all quizzes right
  drillCorrect: 15,
  drillStreak5: 50,
  drillStreak10: 100,
  gameWin: 200,
  gameSecond: 100,
  gameThird: 50,
  gameFourth: 25,
  riichiDeclare: 10,
  firstWin: 50,
  dailyLogin: 25,
  streakBonus3: 50,
  streakBonus7: 100,
  streakBonus30: 500,
};
