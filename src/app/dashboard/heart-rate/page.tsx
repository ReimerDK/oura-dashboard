"use client";

import { useState, useEffect } from "react";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { ScoreCard } from "@/components/ui/ScoreCard";
import { PeriodSelector } from "@/components/ui/PeriodSelector";
import { getPeriod, type PeriodPreset } from "@/lib/utils";
import { useT } from "@/lib/i18n/TranslationsContext";
import { format, parseISO } from "date-fns";
import type { DailyReadiness, DailySpO2 } from "@/lib/oura/types";

export default function HeartRatePage() {
  const t = useT();
  const h = t.heartRate;
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
      })
      .catch(() => {
        setReadiness([]);
        setSpO2([]);
      })
      .finally(() => setLoading(false));
  }, [preset]);

  const avgHrv = readiness.length
    ? Math.round(readiness.reduce((s, d) => s + (d.contributors?.hrv_balance ?? 0), 0) / readiness.filter((d) => d.contributors?.hrv_balance).length)
    : 0;
  const avgSpO2 = spo2.length
    ? (spo2.reduce((s, d) => s + (d.spo2_percentage?.average ?? 0), 0) / spo2.filter((d) => d.spo2_percentage?.average).length).toFixed(1)
    : "—";

  return (
    <div>
      <div className="dash-head lift-in">
        <div>
          <div className="date-label">{h.dateLabel}</div>
          <h1 className="greeting">{h.heading} <em>{h.headingEm}</em></h1>
        </div>
        <PeriodSelector value={preset} onChange={setPreset} t={t.period} />
      </div>

      {loading ? (
        <div style={{ color: "var(--ink-3)", fontFamily: "var(--mono)", fontSize: 13, padding: "40px 0" }}>{t.common.loading}</div>
      ) : (
        <>
          <div className="metric-grid lift-in-2" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
            <ScoreCard
              title={h.cards.avgHrv}
              poetry={h.cards.hrvPoetry}
              color="#7A5AB5"
              sparkData={readiness.map((r) => r.contributors?.hrv_balance ?? 0).filter(Boolean)}
            >
              {avgHrv > 0 && <div className="card-value">{avgHrv}<span className="card-unit">ms</span></div>}
            </ScoreCard>
            <ScoreCard
              title={h.cards.avgSpo2}
              poetry={h.cards.spo2Poetry}
              color="#06b6d4"
              sparkData={spo2.map((s) => s.spo2_percentage?.average ?? 0).filter(Boolean)}
            >
              <div className="card-value">{avgSpO2}<span className="card-unit">%</span></div>
            </ScoreCard>
          </div>

          <div className="chart-card lift-in-3">
            <div className="chart-toolbar">
              <div>
                <h3 className="chart-title">{h.charts.hrvTitle}</h3>
                <div className="chart-sub">{h.charts.hrvSub}</div>
              </div>
            </div>
            <TrendLineChart
              data={readiness
                .filter((r) => r.contributors?.hrv_balance !== undefined)
                .map((r) => ({ day: format(parseISO(r.day), "dd/MM"), value: r.contributors!.hrv_balance! }))}
              color="#7A5AB5"
              domain={[0, 100]}
            />
          </div>

          <div className="compare-grid lift-in-4">
            <div className="chart-card" style={{ marginBottom: 0 }}>
              <div className="chart-toolbar">
                <div>
                  <h3 className="chart-title">{h.charts.restingHrTitle}</h3>
                  <div className="chart-sub">{h.charts.restingHrSub}</div>
                </div>
              </div>
              <TrendLineChart
                data={readiness
                  .filter((r) => r.contributors?.resting_heart_rate !== undefined)
                  .map((r) => ({ day: format(parseISO(r.day), "dd/MM"), value: r.contributors!.resting_heart_rate! }))}
                color="#A8514E"
                domain={[0, 100]}
              />
            </div>
            <div className="chart-card" style={{ marginBottom: 0 }}>
              <div className="chart-toolbar">
                <div>
                  <h3 className="chart-title">{h.charts.spo2Title}</h3>
                  <div className="chart-sub">{h.charts.spo2Sub}</div>
                </div>
              </div>
              <TrendLineChart
                data={spo2
                  .filter((s) => s.spo2_percentage?.average !== undefined)
                  .map((s) => ({ day: format(parseISO(s.day), "dd/MM"), value: s.spo2_percentage!.average! }))}
                color="#06b6d4"
                domain={[90, 100]}
                unit="%"
              />
            </div>
          </div>
        </>
      )}
      <div style={{ height: 48 }} />
    </div>
  );
}
