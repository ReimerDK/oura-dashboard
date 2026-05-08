"use client";

import { useId } from "react";
import Link from "next/link";

interface SparklineProps {
  data: number[];
  color: string;
}

function Sparkline({ data, color }: SparklineProps) {
  const uid = useId().replace(/:/g, "");
  if (data.length < 2) return null;
  const w = 200, h = 50;
  const min = Math.min(...data) - 1;
  const max = Math.max(...data) + 1;
  const sy = (v: number) => h - ((v - min) / (max - min)) * h;
  const sx = (i: number) => (i / (data.length - 1)) * w;

  let d = "";
  for (let i = 0; i < data.length; i++) {
    const x = sx(i), y = sy(data[i]);
    if (i === 0) {
      d += `M${x.toFixed(1)},${y.toFixed(1)}`;
    } else {
      const px = sx(i - 1), py = sy(data[i - 1]);
      const cx1 = px + (x - px) * 0.5;
      const cx2 = x - (x - px) * 0.5;
      d += ` C${cx1.toFixed(1)},${py.toFixed(1)} ${cx2.toFixed(1)},${y.toFixed(1)} ${x.toFixed(1)},${y.toFixed(1)}`;
    }
  }

  const area = `${d} L${w},${h} L0,${h} Z`;
  const lx = w, ly = sy(data[data.length - 1]);
  const gradId = `sg-${uid}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block" }}>
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r="3" fill={color} />
    </svg>
  );
}

interface ScoreCardProps {
  title: string;
  score?: number;
  subtitle?: string;
  poetry?: string;
  color?: string;
  sparkData?: number[];
  delta?: number;
  unit?: string;
  dateRange?: string;
  href?: string;
  children?: React.ReactNode;
}

export function ScoreCard({
  title,
  score,
  subtitle,
  poetry,
  color = "var(--accent)",
  sparkData,
  delta,
  unit = "",
  dateRange,
  href,
  children,
}: ScoreCardProps) {
  const deltaClass = delta === undefined ? "" : delta > 0 ? "up" : delta < 0 ? "down" : "";

  const inner = (
    <div className={`embr-card${href ? " embr-card--link" : ""}`}>
      <div className="card-head">
        <span className="card-name">{title}</span>
        {delta !== undefined && (
          <span className={`card-delta ${deltaClass}`}>
            {delta > 0 ? "▲ " : delta < 0 ? "▼ " : "— "}
            {Math.abs(delta)}{unit}
          </span>
        )}
      </div>
      {score !== undefined && (
        <div className="card-value">
          {score}
          {unit && <span className="card-unit">{unit}</span>}
        </div>
      )}
      {children}
      {(subtitle || poetry) && (
        <div className="card-sub">&ldquo;{poetry ?? subtitle}&rdquo;</div>
      )}
      {sparkData && sparkData.length > 1 && (
        <div className="card-spark">
          <Sparkline data={sparkData} color={color} />
          {dateRange && (
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textAlign: "right", marginTop: 3, letterSpacing: "0.03em" }}>
              {dateRange}
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href} style={{ textDecoration: "none", display: "block" }}>{inner}</Link>;
  }
  return inner;
}
