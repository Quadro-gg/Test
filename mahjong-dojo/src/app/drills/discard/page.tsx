"use client";

import Link from "next/link";
import DiscardTrainer from "@/components/drills/DiscardTrainer";

export default function DiscardDrillPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/drills" className="hover:text-gray-700">Drills</Link>
        <span>/</span>
        <span className="text-gray-900">Discard Trainer</span>
      </div>
      <h1 className="text-xl font-bold">Discard Trainer</h1>
      <DiscardTrainer />
    </div>
  );
}
