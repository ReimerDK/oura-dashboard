"use client";

import { useState, useEffect } from "react";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { ReadinessRadarChart } from "@/components/charts/ReadinessRadarChart";
import { ScoreCard } from "@/components/ui/ScoreCard";
import { PeriodSelector } from "@/components/ui/PeriodSelector";
import { getPeriod, type PeriodPreset } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import type { DailyReadiness } from "@/lib/oura/types";

export default function ReadinessPage() {
  const [preset, setPreset] = useState<PeriodPreset>("30days");
  const [data, setData] = useState<DailyReadiness[]>([]);
  const [selectedDay, setSelectedDay] = useState<DailyReadiness | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { start, end } = getPeriod(preset);
    setLoading(true);
    fetch(`/api/oura/readiness?start=${start}&end=${end}`)
      .then((r) => r.json())
      .then((d) => {
        const arr: DailyReadiness[] = Array.isArray(d) ? d : [];
        setData(arr);
        setSelectedDay(arr.at(-1) ?? null);
        setLoading(false);
      });
  }, [preset]);

  const avgScore = data.length ? Math.round(data.reduce((s, d) => s + (d.score ?? 0), 0) / data.filter((d) => d.score).length) : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-white">Parathed</h1>
        <PeriodSelector value={preset} onChange={setPreset} />
      </div>

      {loading ? (
        <div className="text-gray-500 text-sm">Henter data…</div>
      ) : (
        <>
          <ScoreCard title="Gns. paratheds-score" score={avgScore || undefined} />

          <div className="bg-gray-900 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">Paratheds-score</h2>
            <TrendLineChart
              data={data.map((d) => ({ day: format(parseISO(d.day), "dd/MM"), value: d.score ?? 0 }))}
              color="#6366f1"
              domain={[0, 100]}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-2">Bidragende faktorer</h2>
              <p className="text-xs text-gray-500 mb-4">
                Vælg dag:{" "}
                <select
                  className="bg-gray-800 text-gray-200 text-xs rounded px-2 py-1 ml-1"
                  value={selectedDay?.day ?? ""}
                  onChange={(e) => setSelectedDay(data.find((d) => d.day === e.target.value) ?? null)}
                >
                  {data.map((d) => (
                    <option key={d.day} value={d.day}>{format(parseISO(d.day), "dd/MM/yyyy")}</option>
                  ))}
                </select>
              </p>
              {selectedDay && <ReadinessRadarChart readiness={selectedDay} />}
            </div>

            <div className="bg-gray-900 rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">Kropstemperatur afvigelse</h2>
              <TrendLineChart
                data={data
                  .filter((d) => d.temperature_deviation !== undefined)
                  .map((d) => ({ day: format(parseISO(d.day), "dd/MM"), value: parseFloat((d.temperature_deviation ?? 0).toFixed(2)) }))}
                color="#f97316"
                referenceValue={0}
                unit="°"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
