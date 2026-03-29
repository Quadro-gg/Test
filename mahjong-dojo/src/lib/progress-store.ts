"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getLevelInfo } from "@/lib/progression";

interface UserProgress {
  xp: number;
  level: number;
  streakDays: number;
  lastActiveDate: string | null;
  completedLessons: string[];
  unlockedAchievements: string[];
  drillStats: {
    totalRounds: number;
    correctAnswers: number;
    bestStreak: number;
    currentStreak: number;
  };
  gameStats: {
    gamesPlayed: number;
    gamesWon: number;
    totalRonWins: number;
    totalTsumoWins: number;
    riichiDeclared: number;
    dealIns: number;
  };

  // Actions
  addXP: (amount: number) => void;
  completeLesson: (lessonId: string) => void;
  recordDrill: (correct: boolean) => void;
  recordGame: (placement: number, stats: { ron?: boolean; tsumo?: boolean; riichi?: boolean; dealIns?: number }) => void;
  unlockAchievement: (id: string) => void;
  checkStreak: () => void;
}

const today = () => new Date().toISOString().split("T")[0];

export const useProgressStore = create<UserProgress>()(
  persist(
    (set, get) => ({
      xp: 0,
      level: 1,
      streakDays: 0,
      lastActiveDate: null,
      completedLessons: [],
      unlockedAchievements: [],
      drillStats: {
        totalRounds: 0,
        correctAnswers: 0,
        bestStreak: 0,
        currentStreak: 0,
      },
      gameStats: {
        gamesPlayed: 0,
        gamesWon: 0,
        totalRonWins: 0,
        totalTsumoWins: 0,
        riichiDeclared: 0,
        dealIns: 0,
      },

      addXP: (amount) => {
        set((s) => {
          const newXP = s.xp + amount;
          const info = getLevelInfo(newXP);
          return { xp: newXP, level: info.level };
        });
      },

      completeLesson: (lessonId) => {
        set((s) => {
          if (s.completedLessons.includes(lessonId)) return s;
          const completed = [...s.completedLessons, lessonId];
          return { completedLessons: completed };
        });
      },

      recordDrill: (correct) => {
        set((s) => {
          const stats = { ...s.drillStats };
          stats.totalRounds++;
          if (correct) {
            stats.correctAnswers++;
            stats.currentStreak++;
            stats.bestStreak = Math.max(stats.bestStreak, stats.currentStreak);
          } else {
            stats.currentStreak = 0;
          }
          return { drillStats: stats };
        });
      },

      recordGame: (placement, stats) => {
        set((s) => {
          const gs = { ...s.gameStats };
          gs.gamesPlayed++;
          if (placement === 1) gs.gamesWon++;
          if (stats.ron) gs.totalRonWins++;
          if (stats.tsumo) gs.totalTsumoWins++;
          if (stats.riichi) gs.riichiDeclared++;
          if (stats.dealIns) gs.dealIns += stats.dealIns;
          return { gameStats: gs };
        });
      },

      unlockAchievement: (id) => {
        set((s) => {
          if (s.unlockedAchievements.includes(id)) return s;
          return { unlockedAchievements: [...s.unlockedAchievements, id] };
        });
      },

      checkStreak: () => {
        const s = get();
        const todayStr = today();

        if (s.lastActiveDate === todayStr) return; // Already checked in today

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        if (s.lastActiveDate === yesterdayStr) {
          // Continuing streak
          set({ streakDays: s.streakDays + 1, lastActiveDate: todayStr });
        } else if (s.lastActiveDate === null || s.lastActiveDate < yesterdayStr) {
          // Streak broken or first time
          set({ streakDays: 1, lastActiveDate: todayStr });
        }
      },
    }),
    {
      name: "mahjong-dojo-progress",
    }
  )
);
