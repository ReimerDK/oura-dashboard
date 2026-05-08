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
    <div>
      <div className="dash-head lift-in">
        <div>
          <div className="date-label">Søvn</div>
          <h1 className="greeting">Nattens <em>hvile.</em></h1>
        </div>
        <PeriodSelector value={preset} onChange={setPreset} />
      </div>

      {loading ? (
        <div style={{ color: "var(--ink-3)", fontFamily: "var(--mono)", fontSize: 13, padding: "40px 0" }}>Henter data…</div>
      ) : (
        <>
          <div className="metric-grid lift-in-2" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            <ScoreCard
              title="Gns. søvnscore"
              score={avgScore || undefined}
              poetry="kvaliteten af nattens søvn, samlet."
              color="#3F5BAA"
              sparkData={dailySleep.map((s) => s.score ?? 0).filter(Boolean)}
            />
            <ScoreCard
              title="Gns. søvnlængde"
              poetry={formatDuration(avgDuration)}
              color="#3F5BAA"
              sparkData={mainPeriods.map((p) => (p.total_sleep_duration ?? 0) / 3600).filter(Boolean)}
            />
            <ScoreCard
              title="Gns. effektivitet"
              poetry={avgEfficiency ? `${avgEfficiency}% søvneffektivitet` : "ikke nok data."}
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
                <h3 className="chart-title">Søvnscore</h3>
                <div className="chart-sub">Score over valgt periode</div>
              </div>
            </div>
            <TrendLineChart
              data={dailySleep.map((s) => ({ day: format(parseISO(s.day), "dd/MM"), value: s.score ?? 0 }))}
              color="#3F5BAA"
              domain={[0, 100]}
            />
          </div>

          <div className="chart-card lift-in-4">
            <div className="chart-toolbar">
              <div>
                <h3 className="chart-title">Søvnstadier per nat</h3>
                <div className="chart-sub">Fordeling af dyb, REM og let søvn</div>
              </div>
            </div>
            <SleepStagesChart data={mainPeriods} />
          </div>

          <div className="compare-grid">
            <div className="chart-card" style={{ marginBottom: 0 }}>
              <div className="chart-toolbar">
                <div>
                  <h3 className="chart-title">Søvneffektivitet</h3>
                  <div className="chart-sub">Procent af tid i sengen</div>
                </div>
              </div>
              <TrendLineChart
                data={mainPeriods.map((s) => ({ day: format(parseISO(s.day), "dd/MM"), value: s.efficiency ?? 0 }))}
                color="#06b6d4"
                domain={[50, 100]}
                unit="%"
              />
            </div>
            <div className="chart-card" style={{ marginBottom: 0 }}>
              <div className="chart-toolbar">
                <div>
                  <h3 className="chart-title">HRV under søvn</h3>
                  <div className="chart-sub">Gennemsnit i ms</div>
                </div>
              </div>
              <TrendLineChart
                data={mainPeriods.map((s) => ({ day: format(parseISO(s.day), "dd/MM"), value: s.average_hrv ?? 0 }))}
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
