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
    <div className="range-group">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={value === opt.value ? "active" : ""}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
