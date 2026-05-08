"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface DataPoint {
  day: string;
  value: number;
}

interface Props {
  data: DataPoint[];
  color?: string;
  unit?: string;
  domain?: [number, number];
  referenceValue?: number;
}

export function TrendLineChart({ data, color = "#6366f1", unit = "", domain, referenceValue }: Props) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          axisLine={false}
          tickLine={false}
          domain={domain ?? ["auto", "auto"]}
          unit={unit}
        />
        <Tooltip
          contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8 }}
          labelStyle={{ color: "#e5e7eb" }}
          formatter={(v) => [`${v}${unit}`]}
        />
        {referenceValue && <ReferenceLine y={referenceValue} stroke="#4b5563" strokeDasharray="3 3" />}
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
