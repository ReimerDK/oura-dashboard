"use client";

import { useState, useEffect } from "react";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { ReadinessRadarChart } from "@/components/charts/ReadinessRadarChart";
import { ScoreCard } from "@/components/ui/ScoreCard";
import { PeriodSelector } from "@/components/ui/PeriodSelector";
import { getPeriod, type PeriodPreset } from "@/lib/utils";
import { useT } from "@/lib/i18n/TranslationsContext";
import { format, parseISO } from "date-fns";
import type { DailyReadiness } from "@/lib/oura/types";

export default function ReadinessPage() {
  const t = useT();
  const r = t.readiness;
  const [preset, setPreset] = useState<PeriodPreset>("30days");
  const [data, setData] = useState<DailyReadiness[]>([]);
  const [selectedDay, setSelectedDay] = useState<DailyReadiness | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { start, end } = getPeriod(preset);
    setLoading(true);
    fetch(`/api/oura/readiness?start=${start}&end=${end}`)
      .then((res) => res.json())
      .then((d) => {
        const arr: DailyReadiness[] = Array.isArray(d) ? d : [];
        setData(arr);
        setSelectedDay(arr.at(-1) ?? null);
      })
      .catch(() => {
        setData([]);
        setSelectedDay(null);
      })
      .finally(() => setLoading(false));
  }, [preset]);

  const scoredData = data.filter((d) => d.score);
  const avgScore = scoredData.length ? Math.round(scoredData.reduce((s, d) => s + (d.score ?? 0), 0) / scoredData.length) : 0;

  return (
    <div>
      <div className="dash-head lift-in">
        <div>
          <div className="date-label">{r.dateLabel}</div>
          <h1 className="greeting">{r.heading} <em>{r.headingEm}</em></h1>
        </div>
        <PeriodSelector value={preset} onChange={setPreset} t={t.period} />
      </div>

      {loading ? (
        <div style={{ color: "var(--ink-3)", fontFamily: "var(--mono)", fontSize: 13, padding: "40px 0" }}>{t.common.loading}</div>
      ) : (
        <>
          <div className="metric-grid lift-in-2" style={{ gridTemplateColumns: "1fr" }}>
            <ScoreCard
              title={r.cards.avgScore}
              score={avgScore || undefined}
              poetry={r.cards.avgScorePoetry}
              color="var(--accent)"
              sparkData={data.map((d) => d.score ?? 0).filter(Boolean)}
            />
          </div>

          <div className="chart-card lift-in-3">
            <div className="chart-toolbar">
              <div>
                <h3 className="chart-title">{r.charts.scoreTitle}</h3>
                <div className="chart-sub">
                  {data.length >= 2
                    ? `${format(parseISO(data[0].day), "d. MMM")} – ${format(parseISO(data[data.length - 1].day), "d. MMM yyyy")}`
                    : t.common.scoreOver}
                </div>
              </div>
            </div>
            <TrendLineChart
              data={data.map((d) => ({ day: format(parseISO(d.day), "dd/MM"), value: d.score ?? 0 }))}
              color="var(--accent)"
              domain={[0, 100]}
            />
          </div>

          <div className="compare-grid lift-in-4">
            <div className="chart-card" style={{ marginBottom: 0 }}>
              <div className="chart-toolbar">
                <div>
                  <h3 className="chart-title">{r.charts.factorsTitle}</h3>
                  <div className="chart-sub" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {r.charts.selectDay}{" "}
                    <select
                      style={{
                        background: "var(--bg-2)", color: "var(--ink)", border: "0.5px solid var(--line)",
                        borderRadius: 6, padding: "2px 8px", fontFamily: "var(--mono)", fontSize: 11,
                      }}
                      value={selectedDay?.day ?? ""}
                      onChange={(e) => setSelectedDay(data.find((d) => d.day === e.target.value) ?? null)}
                    >
                      {data.map((d) => (
                        <option key={d.day} value={d.day}>{format(parseISO(d.day), "dd/MM/yyyy")}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              {selectedDay && <ReadinessRadarChart readiness={selectedDay} />}
            </div>
            <div className="chart-card" style={{ marginBottom: 0 }}>
              <div className="chart-toolbar">
                <div>
                  <h3 className="chart-title">{r.charts.tempTitle}</h3>
                  <div className="chart-sub">{r.charts.tempSub}</div>
                </div>
              </div>
              <TrendLineChart
                data={data
                  .filter((d) => d.temperature_deviation !== undefined)
                  .map((d) => ({ day: format(parseISO(d.day), "dd/MM"), value: parseFloat((d.temperature_deviation ?? 0).toFixed(2)) }))}
                color="#A8514E"
                referenceValue={0}
                unit="°"
              />
            </div>
          </div>
        </>
      )}
      <div style={{ height: 48 }} />
    </div>
  );
}
