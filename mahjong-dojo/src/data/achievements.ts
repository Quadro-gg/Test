// ─── Achievement Definitions ───────────────────────────────

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "lessons" | "drills" | "games" | "milestones";
}

export const ACHIEVEMENTS: Achievement[] = [
  // Lessons
  { id: "first-steps", title: "First Steps", description: "Complete your first lesson", icon: "📖", category: "lessons" },
  { id: "quick-learner", title: "Quick Learner", description: "Complete 3 lessons", icon: "🎓", category: "lessons" },
  { id: "bookworm", title: "Bookworm", description: "Complete all 8 lessons", icon: "📚", category: "lessons" },
  { id: "perfect-student", title: "Perfect Student", description: "Get all quizzes right in a lesson", icon: "💯", category: "lessons" },

  // Drills
  { id: "sharp-eye", title: "Sharp Eye", description: "Get 10 drills correct in a row", icon: "👁", category: "drills" },
  { id: "drill-sergeant", title: "Drill Sergeant", description: "Complete 50 drill rounds", icon: "🎯", category: "drills" },
  { id: "efficiency-expert", title: "Efficiency Expert", description: "Score 80%+ accuracy in Efficiency Trainer", icon: "⚡", category: "drills" },
  { id: "tenpai-master", title: "Tenpai Master", description: "Identify all waits correctly 5 times in a row", icon: "🔍", category: "drills" },
  { id: "discard-pro", title: "Discard Pro", description: "Score 90%+ accuracy in Discard Trainer", icon: "🃏", category: "drills" },

  // Games
  { id: "first-win", title: "Winner Winner", description: "Win your first AI game", icon: "🏆", category: "games" },
  { id: "riichi-declared", title: "Riichi!", description: "Declare riichi for the first time", icon: "🀄", category: "games" },
  { id: "tsumo-win", title: "Self Made", description: "Win by tsumo", icon: "✨", category: "games" },
  { id: "ron-win", title: "Gotcha!", description: "Win by ron", icon: "💥", category: "games" },
  { id: "mangan-win", title: "Big Hand", description: "Win with mangan or higher", icon: "💎", category: "games" },
  { id: "beat-hard", title: "Challenge Accepted", description: "Win a game on Hard difficulty", icon: "🔥", category: "games" },
  { id: "no-deal-in", title: "Defensive Wall", description: "Finish a game with 0 deal-ins", icon: "🛡", category: "games" },
  { id: "comeback", title: "Comeback Kid", description: "Win a game after being in last place", icon: "📈", category: "games" },

  // Milestones
  { id: "level-5", title: "Rising Star", description: "Reach level 5", icon: "⭐", category: "milestones" },
  { id: "level-10", title: "Shining Bright", description: "Reach level 10", icon: "🌟", category: "milestones" },
  { id: "streak-7", title: "On a Roll", description: "Maintain a 7-day streak", icon: "🔥", category: "milestones" },
  { id: "streak-30", title: "Dedication", description: "Maintain a 30-day streak", icon: "💪", category: "milestones" },
  { id: "xp-1000", title: "XP Collector", description: "Earn 1,000 total XP", icon: "💰", category: "milestones" },
  { id: "xp-5000", title: "XP Hoarder", description: "Earn 5,000 total XP", icon: "🏦", category: "milestones" },
];

export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

export function getAchievementsByCategory(category: Achievement["category"]): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.category === category);
}
