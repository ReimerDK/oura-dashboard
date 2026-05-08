"use client";

import { type PeriodPreset } from "@/lib/utils";

interface PeriodSelectorProps {
  value: PeriodPreset;
  onChange: (v: PeriodPreset) => void;
}

const options: { value: PeriodPreset; label: string }[] = [
  { value: "week", label: "Denne uge" },
  { value: "month", label: "Denne måned" },
  { value: "30days", label: "Seneste 30 dage" },
  { value: "90days", label: "Seneste 90 dage" },
];

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            value === opt.value
              ? "bg-indigo-600 text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
