"use client";

import { useState, useEffect } from "react";
import { SleepStagesChart } from "@/components/charts/SleepStagesChart";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { ScoreCard } from "@/components/ui/ScoreCard";
import { PeriodSelector } from "@/components/ui/PeriodSelector";
import { getPeriod, formatDuration, type PeriodPreset } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import type { DailySleep, SleepPeriod } from "@/lib/oura/types";

export default function SleepPage() {
  const [preset, setPreset] = useState<PeriodPreset>("30days");
  const [dailySleep, setDailySleep] = useState<DailySleep[]>([]);
  const [periods, setPeriods] = useState<SleepPeriod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { start, end } = getPeriod(preset);
    setLoading(true);
    Promise.all([
      fetch(`/api/oura/sleep?start=${start}&end=${end}`).then((r) => r.json()),
      fetch(`/api/oura/sleep?start=${start}&end=${end}&type=periods`).then((r) => r.json()),
    ]).then(([daily, sleepPeriods]) => {
      setDailySleep(Array.isArray(daily) ? daily : []);
      setPeriods(Array.isArray(sleepPeriods) ? sleepPeriods : []);
      setLoading(false);
    });
  }, [preset]);

  const mainPeriods = periods.filter((s) => s.type === "long_sleep" || !s.type);
  const avgScore = dailySleep.length ? Math.round(dailySleep.reduce((s, d) => s + (d.score ?? 0), 0) / dailySleep.filter((d) => d.score).length) : 0;
  const avgDuration = mainPeriods.length ? Math.round(mainPeriods.reduce((s, p) => s + (p.total_sleep_duration ?? 0), 0) / mainPeriods.length) : 0;
  const avgEfficiency = mainPeriods.length ? Math.round(mainPeriods.reduce((s, p) => s + (p.efficiency ?? 0), 0) / mainPeriods.filter((p) => p.efficiency).length) : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-white">Søvn</h1>
        <PeriodSelector value={preset} onChange={setPreset} />
      </div>

      {loading ? (
        <div className="text-gray-500 text-sm">Henter data…</div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            <ScoreCard title="Gns. søvnscore" score={avgScore || undefined} />
            <ScoreCard title="Gns. søvnlængde" subtitle={formatDuration(avgDuration)} />
            <ScoreCard title="Gns. effektivitet" subtitle={avgEfficiency ? `${avgEfficiency}%` : "—"} />
          </div>

          <div className="bg-gray-900 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">Søvnscore</h2>
            <TrendLineChart
              data={dailySleep.map((s) => ({ day: format(parseISO(s.day), "dd/MM"), value: s.score ?? 0 }))}
              color="#6366f1"
              domain={[0, 100]}
            />
          </div>

          <div className="bg-gray-900 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">Søvnstadier per nat</h2>
            <SleepStagesChart data={mainPeriods} />
          </div>

          <div className="bg-gray-900 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">Søvneffektivitet (%)</h2>
            <TrendLineChart
              data={mainPeriods.map((s) => ({ day: format(parseISO(s.day), "dd/MM"), value: s.efficiency ?? 0 }))}
              color="#06b6d4"
              domain={[50, 100]}
              unit="%"
            />
          </div>

          <div className="bg-gray-900 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">Gns. HRV under søvn (ms)</h2>
            <TrendLineChart
              data={mainPeriods.map((s) => ({ day: format(parseISO(s.day), "dd/MM"), value: s.average_hrv ?? 0 }))}
              color="#8b5cf6"
            />
          </div>
        </>
      )}
    </div>
  );
}
