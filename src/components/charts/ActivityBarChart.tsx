"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface DataPoint {
  day: string;
  value: number;
  score?: number;
}

interface Props {
  data: DataPoint[];
  unit?: string;
  color?: string;
}

export function ActivityBarChart({ data, unit = "", color }: Props) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} unit={unit} />
        <Tooltip
          contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8 }}
          labelStyle={{ color: "#e5e7eb" }}
          formatter={(v) => [`${v}${unit}`]}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={color ?? (entry.score !== undefined ? `var(--color-score-${Math.floor(entry.score / 10) * 10})` : "#6366f1")}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
