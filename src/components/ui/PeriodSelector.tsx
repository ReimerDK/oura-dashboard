"use client";

import { type PeriodPreset } from "@/lib/utils";
import type { Translations } from "@/lib/i18n/locales/da";

interface PeriodSelectorProps {
  value: PeriodPreset;
  onChange: (v: PeriodPreset) => void;
  t?: Translations["period"];
}

const defaultLabels: Record<PeriodPreset, string> = {
  week: "Denne uge",
  month: "Denne måned",
  "30days": "Seneste 30 dage",
  "90days": "Seneste 90 dage",
};

export function PeriodSelector({ value, onChange, t }: PeriodSelectorProps) {
  const labels = t
    ? { week: t.week, month: t.month, "30days": t.days30, "90days": t.days90 }
    : defaultLabels;

  const options: { value: PeriodPreset; label: string }[] = [
    { value: "week", label: labels.week },
    { value: "month", label: labels.month },
    { value: "30days", label: labels["30days"] },
    { value: "90days", label: labels["90days"] },
  ];

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
