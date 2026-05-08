"use client";

import { useState, useEffect } from "react";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { ScoreCard } from "@/components/ui/ScoreCard";
import { PeriodSelector } from "@/components/ui/PeriodSelector";
import { getPeriod, type PeriodPreset } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import type { DailyReadiness, DailySpO2 } from "@/lib/oura/types";

export default function HeartRatePage() {
  const [preset, setPreset] = useState<PeriodPreset>("30days");
  const [readiness, setReadiness] = useState<DailyReadiness[]>([]);
  const [spo2, setSpO2] = useState<DailySpO2[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { start, end } = getPeriod(preset);
    setLoading(true);
    fetch(`/api/oura/heart-rate?start=${start}&end=${end}`)
      .then((r) => r.json())
      .then((d) => {
        setReadiness(Array.isArray(d.readiness) ? d.readiness : []);
        setSpO2(Array.isArray(d.spo2) ? d.spo2 : []);
        setLoading(false);
      });
  }, [preset]);

  const avgHrv = readiness.length
    ? Math.round(readiness.reduce((s, d) => s + (d.contributors?.hrv_balance ?? 0), 0) / readiness.filter((d) => d.contributors?.hrv_balance).length)
    : 0;
  const avgSpO2 = spo2.length
    ? (spo2.reduce((s, d) => s + (d.spo2_percentage?.average ?? 0), 0) / spo2.filter((d) => d.spo2_percentage?.average).length).toFixed(1)
    : "—";

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-white">Puls & HRV</h1>
        <PeriodSelector value={preset} onChange={setPreset} />
      </div>

      {loading ? (
        <div className="text-gray-500 text-sm">Henter data…</div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            <ScoreCard title="Gns. HRV Balance" subtitle={avgHrv ? `${avgHrv}` : "—"} />
            <ScoreCard title="Gns. SpO2" subtitle={`${avgSpO2}%`} />
          </div>

          <div className="bg-gray-900 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">HRV Balance</h2>
            <TrendLineChart
              data={readiness
                .filter((r) => r.contributors?.hrv_balance !== undefined)
                .map((r) => ({ day: format(parseISO(r.day), "dd/MM"), value: r.contributors!.hrv_balance! }))}
              color="#8b5cf6"
              domain={[0, 100]}
            />
          </div>

          <div className="bg-gray-900 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">Hvilepuls (bidrag)</h2>
            <TrendLineChart
              data={readiness
                .filter((r) => r.contributors?.resting_heart_rate !== undefined)
                .map((r) => ({ day: format(parseISO(r.day), "dd/MM"), value: r.contributors!.resting_heart_rate! }))}
              color="#ef4444"
              domain={[0, 100]}
            />
          </div>

          <div className="bg-gray-900 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">Iltmætning SpO2 (%)</h2>
            <TrendLineChart
              data={spo2
                .filter((s) => s.spo2_percentage?.average !== undefined)
                .map((s) => ({ day: format(parseISO(s.day), "dd/MM"), value: s.spo2_percentage!.average! }))}
              color="#06b6d4"
              domain={[90, 100]}
              unit="%"
            />
          </div>
        </>
      )}
    </div>
  );
}
