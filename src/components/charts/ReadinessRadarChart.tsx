"use client";

import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";
import type { DailyReadiness } from "@/lib/oura/types";

interface Props {
  readiness: DailyReadiness;
}

const labels: Record<string, string> = {
  activity_balance: "Aktivitet",
  body_temperature: "Temperatur",
  hrv_balance: "HRV",
  previous_day_activity: "Gårsdagens aktivitet",
  previous_night: "Gårsdagens søvn",
  recovery_index: "Restituering",
  resting_heart_rate: "Hvilepuls",
  sleep_balance: "Søvnbalance",
};

export function ReadinessRadarChart({ readiness }: Props) {
  const data = Object.entries(readiness.contributors ?? {}).map(([key, value]) => ({
    subject: labels[key] ?? key,
    value: value ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data}>
        <PolarGrid stroke="#374151" />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#9ca3af" }} />
        <Tooltip
          contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8 }}
          labelStyle={{ color: "#e5e7eb" }}
        />
        <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
