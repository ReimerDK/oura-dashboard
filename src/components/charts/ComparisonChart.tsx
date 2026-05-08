"use client";

import { ComposedChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface DataPoint {
  offset: number;
  periodA?: number;
  periodB?: number;
}

interface Props {
  data: DataPoint[];
  labelA: string;
  labelB: string;
  unit?: string;
}

export function ComparisonChart({ data, labelA, labelB, unit = "" }: Props) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
        <XAxis
          dataKey="offset"
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `Dag ${v + 1}`}
        />
        <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} unit={unit} />
        <Tooltip
          contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8 }}
          labelStyle={{ color: "#e5e7eb" }}
          labelFormatter={(v) => `Dag ${(v as number) + 1}`}
          formatter={(v) => [`${v}${unit}`]}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: "#9ca3af" }} />
        <Line type="monotone" dataKey="periodA" name={labelA} stroke="#6366f1" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
        <Line type="monotone" dataKey="periodB" name={labelB} stroke="#6b7280" strokeWidth={2} dot={false} strokeDasharray="4 2" activeDot={{ r: 4 }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
