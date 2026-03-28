"use client";

import Link from "next/link";
import EfficiencyTrainer from "@/components/drills/EfficiencyTrainer";

export default function EfficiencyDrillPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/drills" className="hover:text-gray-700">Drills</Link>
        <span>/</span>
        <span className="text-gray-900">Efficiency Trainer</span>
      </div>
      <h1 className="text-xl font-bold">Efficiency Trainer</h1>
      <EfficiencyTrainer />
    </div>
  );
}
