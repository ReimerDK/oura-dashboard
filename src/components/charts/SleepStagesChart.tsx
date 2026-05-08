"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, parseISO } from "date-fns";
import type { SleepPeriod } from "@/lib/oura/types";

interface Props {
  data: SleepPeriod[];
}

export function SleepStagesChart({ data }: Props) {
  const chartData = data
    .filter((s) => s.type === "long_sleep" || !s.type)
    .map((s) => ({
      day: format(parseISO(s.day), "dd/MM"),
      Dyb: Math.round((s.deep_sleep_duration ?? 0) / 60),
      REM: Math.round((s.rem_sleep_duration ?? 0) / 60),
      Let: Math.round((s.light_sleep_duration ?? 0) / 60),
      Vågen: Math.round((s.awake_time ?? 0) / 60),
    }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} unit="m" />
        <Tooltip
          contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8 }}
          labelStyle={{ color: "#e5e7eb" }}
          formatter={(v) => [`${v} min`]}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: "#9ca3af" }} />
        <Bar dataKey="Dyb" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
        <Bar dataKey="REM" stackId="a" fill="#8b5cf6" />
        <Bar dataKey="Let" stackId="a" fill="#06b6d4" />
        <Bar dataKey="Vågen" stackId="a" fill="#f97316" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
