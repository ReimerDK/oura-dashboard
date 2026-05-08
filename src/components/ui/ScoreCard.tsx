"use client";

import { scoreColor } from "@/lib/utils";

interface ScoreCardProps {
  title: string;
  score?: number;
  subtitle?: string;
  children?: React.ReactNode;
}

export function ScoreCard({ title, score, subtitle, children }: ScoreCardProps) {
  return (
    <div className="bg-gray-900 rounded-2xl p-5 flex flex-col gap-2">
      <p className="text-sm text-gray-400 font-medium uppercase tracking-wide">{title}</p>
      {score !== undefined && (
        <p className={`text-4xl font-bold tabular-nums ${scoreColor(score)}`}>{score}</p>
      )}
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      {children}
    </div>
  );
}
