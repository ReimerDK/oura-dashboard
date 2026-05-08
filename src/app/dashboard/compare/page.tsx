"use client";

import { useState, useEffect } from "react";
import { ComparisonChart } from "@/components/charts/ComparisonChart";
import { PeriodSelector } from "@/components/ui/PeriodSelector";
import { getPeriod, getPriorPeriod, type PeriodPreset } from "@/lib/utils";
import { useT } from "@/lib/i18n/TranslationsContext";
import { interpolate } from "@/lib/i18n/interpolate";
import { format, parseISO } from "date-fns";
import type { DailySleep, DailyActivity, DailyReadiness } from "@/lib/oura/types";

type Metric = "sleep" | "activity" | "readiness";

function avg(arr: number[]): number {
  if (!arr.length) return 0;
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}

function delta(a: number, b: number): string {
  if (!b) return a > 0 ? "+∞%" : "—";
  const pct = Math.round(((a - b) / b) * 100);
  return `${pct >= 0 ? "+" : ""}${pct}%`;
}

export default function ComparePage() {
  const t = useT();
  const c = t.compare;
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
    }).catch(() => {
      setCurrentData([]);
      setPriorData([]);
    }).finally(() => setLoading(false));
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

  return (
    <div>
      <div className="dash-head lift-in">
        <div>
          <div className="date-label">{c.dateLabel}</div>
          <h1 className="greeting">{c.heading} <em>{c.headingEm}</em></h1>
        </div>
        <PeriodSelector value={preset} onChange={setPreset} t={t.period} />
      </div>

      <div className="lift-in-2" style={{ marginBottom: 24 }}>
        <div className="range-group">
          {(["sleep", "activity", "readiness"] as Metric[]).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={metric === m ? "active" : ""}
            >
              {c.metricLabels[m]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ color: "var(--ink-3)", fontFamily: "var(--mono)", fontSize: 13, padding: "40px 0" }}>{t.common.loading}</div>
      ) : (
        <>
          <div className="compare-grid lift-in-3">
            <div className="embr-card" style={{ cursor: "default" }}>
              <div className="card-head">
                <span className="card-name">{labelA} · {c.current}</span>
                <span className={`card-delta ${currentAvg >= priorAvg ? "up" : "down"}`}>
                  {currentAvg >= priorAvg ? "▲ " : "▼ "}{delta(currentAvg, priorAvg)} {c.iftForrige}
                </span>
              </div>
              <div className="card-value">{currentAvg}</div>
              <div className="card-sub">&ldquo;{interpolate(c.currentPeriod, { metric: c.metricLabels[metric].toLowerCase() })}&rdquo;</div>
            </div>
            <div className="embr-card" style={{ cursor: "default" }}>
              <div className="card-head">
                <span className="card-name">{labelB} · {c.prior}</span>
              </div>
              <div className="card-value" style={{ color: "var(--ink-3)" }}>{priorAvg}</div>
              <div className="card-sub">&ldquo;{interpolate(c.priorPeriod, { metric: c.metricLabels[metric].toLowerCase() })}&rdquo;</div>
            </div>
          </div>

          <div className="chart-card lift-in-4">
            <div className="chart-toolbar">
              <div>
                <h3 className="chart-title">{c.metricLabels[metric]}</h3>
                <div className="chart-sub">{interpolate(c.vsLabel, { a: labelA, b: labelB })}</div>
              </div>
            </div>
            <ComparisonChart data={chartData} labelA={labelA} labelB={labelB} />
          </div>
        </>
      )}
      <div style={{ height: 48 }} />
    </div>
  );
}
