"use client";

import { useState, useEffect } from "react";
import { SleepStagesChart } from "@/components/charts/SleepStagesChart";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { ScoreCard } from "@/components/ui/ScoreCard";
import { PeriodSelector } from "@/components/ui/PeriodSelector";
import { getPeriod, formatDuration, type PeriodPreset } from "@/lib/utils";
import { useT } from "@/lib/i18n/TranslationsContext";
import { interpolate } from "@/lib/i18n/interpolate";
import { format, parseISO } from "date-fns";
import type { DailySleep, SleepPeriod } from "@/lib/oura/types";

export default function SleepPage() {
  const t = useT();
  const s = t.sleep;
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
    }).catch(() => {
      setDailySleep([]);
      setPeriods([]);
    }).finally(() => {
      setLoading(false);
    });
  }, [preset]);

  const mainPeriods = periods.filter((p) => p.type === "long_sleep" || !p.type);
  const scoredSleep = dailySleep.filter((d) => d.score);
  const avgScore = scoredSleep.length ? Math.round(scoredSleep.reduce((a, d) => a + (d.score ?? 0), 0) / scoredSleep.length) : 0;
  const avgDuration = mainPeriods.length ? Math.round(mainPeriods.reduce((a, p) => a + (p.total_sleep_duration ?? 0), 0) / mainPeriods.length) : 0;
  const efficiencyPeriods = mainPeriods.filter((p) => p.efficiency);
  const avgEfficiency = efficiencyPeriods.length ? Math.round(efficiencyPeriods.reduce((a, p) => a + (p.efficiency ?? 0), 0) / efficiencyPeriods.length) : 0;

  return (
    <div>
      <div className="dash-head lift-in">
        <div>
          <div className="date-label">{s.dateLabel}</div>
          <h1 className="greeting">{s.heading} <em>{s.headingEm}</em></h1>
        </div>
        <PeriodSelector value={preset} onChange={setPreset} t={t.period} />
      </div>

      {loading ? (
        <div style={{ color: "var(--ink-3)", fontFamily: "var(--mono)", fontSize: 13, padding: "40px 0" }}>{t.common.loading}</div>
      ) : (
        <>
          <div className="metric-grid lift-in-2" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            <ScoreCard
              title={s.cards.avgScore}
              score={avgScore || undefined}
              poetry={s.cards.avgScorePoetry}
              color="#3F5BAA"
              sparkData={dailySleep.map((d) => d.score ?? 0).filter(Boolean)}
            />
            <ScoreCard
              title={s.cards.avgDuration}
              poetry={formatDuration(avgDuration)}
              color="#3F5BAA"
              sparkData={mainPeriods.map((p) => (p.total_sleep_duration ?? 0) / 3600).filter(Boolean)}
            />
            <ScoreCard
              title={s.cards.avgEfficiency}
              poetry={avgEfficiency ? interpolate(s.cards.efficiencyPoetry, { n: avgEfficiency }) : t.common.notEnoughData}
              color="#06b6d4"
              sparkData={mainPeriods.map((p) => p.efficiency ?? 0).filter(Boolean)}
            >
              {avgEfficiency > 0 && (
                <div className="card-value">{avgEfficiency}<span className="card-unit">%</span></div>
              )}
            </ScoreCard>
          </div>

          <div className="chart-card lift-in-3">
            <div className="chart-toolbar">
              <div>
                <h3 className="chart-title">{s.charts.scoreTitle}</h3>
                <div className="chart-sub">{s.charts.scoreSub}</div>
              </div>
            </div>
            <TrendLineChart
              data={dailySleep.map((d) => ({ day: format(parseISO(d.day), "dd/MM"), value: d.score ?? 0 }))}
              color="#3F5BAA"
              domain={[0, 100]}
            />
          </div>

          <div className="chart-card lift-in-4">
            <div className="chart-toolbar">
              <div>
                <h3 className="chart-title">{s.charts.stagesTitle}</h3>
                <div className="chart-sub">{s.charts.stagesSub}</div>
              </div>
            </div>
            <SleepStagesChart data={mainPeriods} />
          </div>

          <div className="compare-grid">
            <div className="chart-card" style={{ marginBottom: 0 }}>
              <div className="chart-toolbar">
                <div>
                  <h3 className="chart-title">{s.charts.efficiencyTitle}</h3>
                  <div className="chart-sub">{s.charts.efficiencySub}</div>
                </div>
              </div>
              <TrendLineChart
                data={mainPeriods.map((p) => ({ day: format(parseISO(p.day), "dd/MM"), value: p.efficiency ?? 0 }))}
                color="#06b6d4"
                domain={[50, 100]}
                unit="%"
              />
            </div>
            <div className="chart-card" style={{ marginBottom: 0 }}>
              <div className="chart-toolbar">
                <div>
                  <h3 className="chart-title">{s.charts.hrvTitle}</h3>
                  <div className="chart-sub">{s.charts.hrvSub}</div>
                </div>
              </div>
              <TrendLineChart
                data={mainPeriods.map((p) => ({ day: format(parseISO(p.day), "dd/MM"), value: p.average_hrv ?? 0 }))}
                color="#7A5AB5"
              />
            </div>
          </div>
        </>
      )}
      <div style={{ height: 48 }} />
    </div>
  );
}
