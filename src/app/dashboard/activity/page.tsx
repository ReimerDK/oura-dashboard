"use client";

import { useState, useEffect } from "react";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { ActivityBarChart } from "@/components/charts/ActivityBarChart";
import { ScoreCard } from "@/components/ui/ScoreCard";
import { PeriodSelector } from "@/components/ui/PeriodSelector";
import { getPeriod, type PeriodPreset } from "@/lib/utils";
import { useT } from "@/lib/i18n/TranslationsContext";
import { interpolate } from "@/lib/i18n/interpolate";
import { format, parseISO } from "date-fns";
import type { DailyActivity } from "@/lib/oura/types";

export default function ActivityPage() {
  const t = useT();
  const a = t.activity;
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
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [preset]);

  const scoredData = data.filter((d) => d.score);
  const avgScore = scoredData.length ? Math.round(scoredData.reduce((s, d) => s + (d.score ?? 0), 0) / scoredData.length) : 0;
  const avgSteps = data.length ? Math.round(data.reduce((s, d) => s + (d.steps ?? 0), 0) / data.length) : 0;
  const avgCalories = data.length ? Math.round(data.reduce((s, d) => s + (d.active_calories ?? 0), 0) / data.length) : 0;

  return (
    <div>
      <div className="dash-head lift-in">
        <div>
          <div className="date-label">{a.dateLabel}</div>
          <h1 className="greeting">{a.heading} <em>{a.headingEm}</em></h1>
        </div>
        <PeriodSelector value={preset} onChange={setPreset} t={t.period} />
      </div>

      {loading ? (
        <div style={{ color: "var(--ink-3)", fontFamily: "var(--mono)", fontSize: 13, padding: "40px 0" }}>{t.common.loading}</div>
      ) : (
        <>
          <div className="metric-grid lift-in-2" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            <ScoreCard
              title={a.cards.avgScore}
              score={avgScore || undefined}
              poetry={a.cards.avgScorePoetry}
              color="#B5704A"
              sparkData={data.map((d) => d.score ?? 0).filter(Boolean)}
            />
            <ScoreCard
              title={a.cards.avgSteps}
              poetry={interpolate(a.cards.stepsPerDay, { n: avgSteps.toLocaleString(t.numberLocale) })}
              color="#5C7A4D"
              sparkData={data.map((d) => d.steps ?? 0).filter(Boolean)}
            >
              <div className="card-value" style={{ fontSize: 36 }}>{avgSteps.toLocaleString(t.numberLocale)}</div>
            </ScoreCard>
            <ScoreCard
              title={a.cards.avgCalories}
              poetry={a.cards.caloriesPoetry}
              color="#B5704A"
              sparkData={data.map((d) => d.active_calories ?? 0).filter(Boolean)}
            >
              <div className="card-value" style={{ fontSize: 40 }}>{avgCalories}<span className="card-unit">kcal</span></div>
            </ScoreCard>
          </div>

          <div className="chart-card lift-in-3">
            <div className="chart-toolbar">
              <div>
                <h3 className="chart-title">{a.charts.stepsTitle}</h3>
                <div className="chart-sub">{a.charts.stepsSub}</div>
              </div>
            </div>
            <ActivityBarChart
              data={data.map((d) => ({ day: format(parseISO(d.day), "dd/MM"), value: d.steps ?? 0 }))}
              color="#5C7A4D"
            />
          </div>

          <div className="compare-grid lift-in-4">
            <div className="chart-card" style={{ marginBottom: 0 }}>
              <div className="chart-toolbar">
                <div>
                  <h3 className="chart-title">{a.charts.caloriesTitle}</h3>
                  <div className="chart-sub">{a.charts.caloriesSub}</div>
                </div>
              </div>
              <TrendLineChart
                data={data.map((d) => ({ day: format(parseISO(d.day), "dd/MM"), value: d.active_calories ?? 0 }))}
                color="#B5704A"
                unit=" kcal"
              />
            </div>
            <div className="chart-card" style={{ marginBottom: 0 }}>
              <div className="chart-toolbar">
                <div>
                  <h3 className="chart-title">{a.charts.scoreTitle}</h3>
                  <div className="chart-sub">{a.charts.scoreSub}</div>
                </div>
              </div>
              <TrendLineChart
                data={data.map((d) => ({ day: format(parseISO(d.day), "dd/MM"), value: d.score ?? 0 }))}
                color="#B5704A"
                domain={[0, 100]}
              />
            </div>
          </div>
        </>
      )}
      <div style={{ height: 48 }} />
    </div>
  );
}
