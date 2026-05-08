"use client";

import { useState, useEffect } from "react";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { ActivityBarChart } from "@/components/charts/ActivityBarChart";
import { ScoreCard } from "@/components/ui/ScoreCard";
import { PeriodSelector } from "@/components/ui/PeriodSelector";
import { getPeriod, type PeriodPreset } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import type { DailyActivity } from "@/lib/oura/types";

export default function ActivityPage() {
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
        setLoading(false);
      });
  }, [preset]);

  const avgScore = data.length ? Math.round(data.reduce((s, d) => s + (d.score ?? 0), 0) / data.filter((d) => d.score).length) : 0;
  const avgSteps = data.length ? Math.round(data.reduce((s, d) => s + (d.steps ?? 0), 0) / data.length) : 0;
  const avgCalories = data.length ? Math.round(data.reduce((s, d) => s + (d.active_calories ?? 0), 0) / data.length) : 0;

  return (
    <div>
      <div className="dash-head lift-in">
        <div>
          <div className="date-label">Aktivitet</div>
          <h1 className="greeting">Bevægelse i <em>hverdagen.</em></h1>
        </div>
        <PeriodSelector value={preset} onChange={setPreset} />
      </div>

      {loading ? (
        <div style={{ color: "var(--ink-3)", fontFamily: "var(--mono)", fontSize: 13, padding: "40px 0" }}>Henter data…</div>
      ) : (
        <>
          <div className="metric-grid lift-in-2" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            <ScoreCard
              title="Gns. aktivitetsscore"
              score={avgScore || undefined}
              poetry="bevægelse vævet ind i timerne."
              color="#B5704A"
              sparkData={data.map((d) => d.score ?? 0).filter(Boolean)}
            />
            <ScoreCard
              title="Gns. skridt"
              poetry={`${avgSteps.toLocaleString("da")} skridt per dag.`}
              color="#5C7A4D"
              sparkData={data.map((d) => d.steps ?? 0).filter(Boolean)}
            >
              <div className="card-value" style={{ fontSize: 36 }}>{avgSteps.toLocaleString("da")}</div>
            </ScoreCard>
            <ScoreCard
              title="Gns. aktive kalorier"
              poetry="energi brugt i aktiv bevægelse."
              color="#B5704A"
              sparkData={data.map((d) => d.active_calories ?? 0).filter(Boolean)}
            >
              <div className="card-value" style={{ fontSize: 40 }}>{avgCalories}<span className="card-unit">kcal</span></div>
            </ScoreCard>
          </div>

          <div className="chart-card lift-in-3">
            <div className="chart-toolbar">
              <div>
                <h3 className="chart-title">Skridt per dag</h3>
                <div className="chart-sub">Daglige skridt over valgt periode</div>
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
                  <h3 className="chart-title">Aktive kalorier</h3>
                  <div className="chart-sub">Dagligt forbrug</div>
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
                  <h3 className="chart-title">Aktivitetsscore</h3>
                  <div className="chart-sub">Score over periode</div>
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
