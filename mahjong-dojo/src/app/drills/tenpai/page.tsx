"use client";

import Link from "next/link";
import TenpaiQuiz from "@/components/drills/TenpaiQuiz";

export default function TenpaiDrillPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/drills" className="hover:text-gray-700">Drills</Link>
        <span>/</span>
        <span className="text-gray-900">Tenpai Quiz</span>
      </div>
      <h1 className="text-xl font-bold">Tenpai Quiz</h1>
      <TenpaiQuiz />
    </div>
  );
}
