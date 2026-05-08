"use client";

import { useState, useEffect } from "react";
import { ComparisonChart } from "@/components/charts/ComparisonChart";
import { PeriodSelector } from "@/components/ui/PeriodSelector";
import { getPeriod, getPriorPeriod, type PeriodPreset } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import type { DailySleep, DailyActivity, DailyReadiness } from "@/lib/oura/types";

type Metric = "sleep" | "activity" | "readiness";

function avg(arr: number[]): number {
  if (!arr.length) return 0;
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}

function delta(a: number, b: number): string {
  if (!b) return "—";
  const pct = Math.round(((a - b) / b) * 100);
  return `${pct >= 0 ? "+" : ""}${pct}%`;
}

function deltaColor(a: number, b: number): string {
  if (!b) return "text-gray-400";
  return a >= b ? "text-emerald-400" : "text-red-400";
}

export default function ComparePage() {
  const [preset, setPreset] = useState<PeriodPreset>("week");
  const [metric, setMetric] = useState<Metric>("sleep");
  const [currentData, setCurrentData] = useState<(DailySleep | DailyActivity | DailyReadiness)[]>([]);
  const [priorData, setPriorData] = useState<(DailySleep | DailyActivity | DailyReadiness)[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const current = getPeriod(preset);
    const prior = getPriorPeriod(preset);
    const endpoint = metric === "sleep" ? "sleep" : metric === "activity" ? "activity" : "readiness";
    setLoading(true);
    Promise.all([
      fetch(`/api/oura/${endpoint}?start=${current.start}&end=${current.end}`).then((r) => r.json()),
      fetch(`/api/oura/${endpoint}?start=${prior.start}&end=${prior.end}`).then((r) => r.json()),
    ]).then(([cur, pri]) => {
      setCurrentData(Array.isArray(cur) ? cur : []);
      setPriorData(Array.isArray(pri) ? pri : []);
      setLoading(false);
    });
  }, [preset, metric]);

  const getScore = (item: DailySleep | DailyActivity | DailyReadiness): number => (item as { score?: number }).score ?? 0;

  const currentScores = currentData.map(getScore).filter(Boolean);
  const priorScores = priorData.map(getScore).filter(Boolean);
  const currentAvg = avg(currentScores);
  const priorAvg = avg(priorScores);

  const current = getPeriod(preset);
  const prior = getPriorPeriod(preset);

  const labelA = `${format(parseISO(current.start), "dd/MM")}–${format(parseISO(current.end), "dd/MM")}`;
  const labelB = `${format(parseISO(prior.start), "dd/MM")}–${format(parseISO(prior.end), "dd/MM")}`;

  const maxLen = Math.max(currentData.length, priorData.length);
  const chartData = Array.from({ length: maxLen }, (_, i) => ({
    offset: i,
    periodA: currentData[i] ? getScore(currentData[i]) : undefined,
    periodB: priorData[i] ? getScore(priorData[i]) : undefined,
  }));

  const metricLabels: Record<Metric, string> = {
    sleep: "Søvnscore",
    activity: "Aktivitetsscore",
    readiness: "Paratheds-score",
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-white">Sammenlign perioder</h1>
        <PeriodSelector value={preset} onChange={setPreset} />
      </div>

      <div className="flex gap-2">
        {(["sleep", "activity", "readiness"] as Metric[]).map((m) => (
          <button
            key={m}
            onClick={() => setMetric(m)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              metric === m ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {metricLabels[m]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-gray-500 text-sm">Henter data…</div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900 rounded-2xl p-5">
              <p className="text-sm text-gray-400 uppercase tracking-wide font-medium">{labelA} (nu)</p>
              <p className="text-4xl font-bold text-white tabular-nums mt-2">{currentAvg}</p>
              <p className={`text-sm font-semibold mt-1 ${deltaColor(currentAvg, priorAvg)}`}>
                {delta(currentAvg, priorAvg)} ift. forrige periode
              </p>
            </div>
            <div className="bg-gray-900 rounded-2xl p-5">
              <p className="text-sm text-gray-400 uppercase tracking-wide font-medium">{labelB} (forrige)</p>
              <p className="text-4xl font-bold text-gray-400 tabular-nums mt-2">{priorAvg}</p>
            </div>
          </div>

          <div className="bg-gray-900 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">
              {metricLabels[metric]} — periodesammenligning
            </h2>
            <ComparisonChart data={chartData} labelA={labelA} labelB={labelB} />
          </div>
        </>
      )}
    </div>
  );
}
