"use client";

import { useState, useEffect } from "react";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { ActivityBarChart } from "@/components/charts/ActivityBarChart";
import { ScoreCard } from "@/components/ui/ScoreCard";
import { PeriodSelector } from "@/components/ui/PeriodSelector";
import { getPeriod, type PeriodPreset } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import type { DailyActivity } from "@/lib/oura/types";

export default function ActivityPage() {
  const [preset, setPreset] = useState<PeriodPreset>("30days");
  const [data, setData] = useState<DailyActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { start, end } = getPeriod(preset);
    setLoading(true);
    fetch(`/api/oura/activity?start=${start}&end=${end}`)
      .then((r) => r.json())
      .then((d) => {
        setData(Array.isArray(d) ? d : []);
        setLoading(false);
      });
  }, [preset]);

  const avgScore = data.length ? Math.round(data.reduce((s, d) => s + (d.score ?? 0), 0) / data.filter((d) => d.score).length) : 0;
  const avgSteps = data.length ? Math.round(data.reduce((s, d) => s + (d.steps ?? 0), 0) / data.length) : 0;
  const avgCalories = data.length ? Math.round(data.reduce((s, d) => s + (d.active_calories ?? 0), 0) / data.length) : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-white">Aktivitet</h1>
        <PeriodSelector value={preset} onChange={setPreset} />
      </div>

      {loading ? (
        <div className="text-gray-500 text-sm">Henter data…</div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            <ScoreCard title="Gns. aktivitetsscore" score={avgScore || undefined} />
            <ScoreCard title="Gns. skridt" subtitle={avgSteps.toLocaleString("da")} />
            <ScoreCard title="Gns. aktive kalorier" subtitle={`${avgCalories} kcal`} />
          </div>

          <div className="bg-gray-900 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">Skridt per dag</h2>
            <ActivityBarChart
              data={data.map((d) => ({ day: format(parseISO(d.day), "dd/MM"), value: d.steps ?? 0 }))}
              color="#10b981"
            />
          </div>

          <div className="bg-gray-900 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">Aktive kalorier</h2>
            <TrendLineChart
              data={data.map((d) => ({ day: format(parseISO(d.day), "dd/MM"), value: d.active_calories ?? 0 }))}
              color="#f59e0b"
              unit=" kcal"
            />
          </div>

          <div className="bg-gray-900 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">Aktivitetsscore</h2>
            <TrendLineChart
              data={data.map((d) => ({ day: format(parseISO(d.day), "dd/MM"), value: d.score ?? 0 }))}
              color="#6366f1"
              domain={[0, 100]}
            />
          </div>
        </>
      )}
    </div>
  );
}
