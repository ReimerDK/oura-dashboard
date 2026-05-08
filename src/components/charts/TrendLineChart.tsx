"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface DataPoint {
  day: string;
  value: number;
}

interface Props {
  data: DataPoint[];
  color?: string;
  unit?: string;
  domain?: [number, number];
  height?: number;
  referenceValue?: number;
}

export function TrendLineChart({ data, color = "var(--accent)", unit = "", domain, height = 200, referenceValue }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(600);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(() => {
      if (wrapRef.current) setW(wrapRef.current.clientWidth);
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  if (data.length < 2) return <div style={{ height }} />;

  const padL = 36, padR = 12, padT = 10, padB = 22;
  const innerW = Math.max(40, w - padL - padR);
  const innerH = height - padT - padB;

  const values = data.map((d) => d.value);
  const yMin = domain ? domain[0] : Math.min(...values) - 2;
  const yMax = domain ? domain[1] : Math.max(...values) + 2;

  const sx = (i: number) => (i / (data.length - 1)) * innerW;
  const sy = (v: number) => {
    const clamped = Math.min(yMax, Math.max(yMin, v));
    return innerH - ((clamped - yMin) / (yMax - yMin)) * innerH;
  };

  // Build smooth path
  let path = "";
  for (let i = 0; i < data.length; i++) {
    const x = sx(i), y = sy(data[i].value);
    if (i === 0) {
      path += `M${x.toFixed(1)},${y.toFixed(1)}`;
    } else {
      const px = sx(i - 1), py = sy(data[i - 1].value);
      const cx1 = px + (x - px) * 0.5;
      const cx2 = x - (x - px) * 0.5;
      path += ` C${cx1.toFixed(1)},${py.toFixed(1)} ${cx2.toFixed(1)},${y.toFixed(1)} ${x.toFixed(1)},${y.toFixed(1)}`;
    }
  }
  const area = `${path} L${innerW.toFixed(1)},${innerH} L0,${innerH} Z`;

  // Y ticks
  const yTicks = [yMin, (yMin + yMax) / 2, yMax].map((v) => ({ v, y: sy(v) }));

  // X labels — show ~5 evenly spaced
  const xStep = Math.max(1, Math.floor(data.length / 5));
  const xLabels = data
    .map((d, i) => ({ label: d.day, x: sx(i), i }))
    .filter((_, i) => i === 0 || i === data.length - 1 || i % xStep === 0);

  const handleMove = useCallback(
    (e: React.MouseEvent) => {
      if (!wrapRef.current) return;
      const rect = wrapRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - padL;
      if (x < 0 || x > innerW) { setHover(null); return; }
      const idx = Math.round((x / innerW) * (data.length - 1));
      setHover(Math.max(0, Math.min(data.length - 1, idx)));
    },
    [innerW, data.length]
  );

  const cursorX = hover !== null ? sx(hover) : null;
  const cursorY = hover !== null ? sy(data[hover].value) : null;

  const clipId = `clip-${color.replace(/[^a-z0-9]/gi, "")}${innerW}`;

  return (
    <div className="chart-shell" ref={wrapRef} onMouseMove={handleMove} onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${w} ${height}`} style={{ height }}>
        <defs>
          <clipPath id={clipId}>
            <rect x={0} y={0} width={innerW} height={innerH} />
          </clipPath>
        </defs>
        {/* Grid lines */}
        <g className="grid" transform={`translate(${padL},${padT})`}>
          {yTicks.map(({ y }, i) => (
            <line key={i} x1={0} x2={innerW} y1={y} y2={y} />
          ))}
        </g>
        {/* Y axis */}
        <g className="axis" transform={`translate(${padL - 6},${padT})`}>
          {yTicks.map(({ v, y }) => (
            <text key={v} x={0} y={y + 3} textAnchor="end">{Math.round(v)}</text>
          ))}
        </g>
        {/* X axis */}
        <g className="axis" transform={`translate(${padL},${height - padB + 14})`}>
          {xLabels.map(({ label, x }) => (
            <text key={label + x} x={x} y={0} textAnchor="middle">{label}</text>
          ))}
        </g>
        {/* Area + line */}
        <g transform={`translate(${padL},${padT})`} clipPath={`url(#${clipId})`}>
          <path d={area} fill={color} className="series-area" />
          <path d={path} stroke={color} className="series-path" />
          {referenceValue !== undefined && (
            <line
              x1={0} x2={innerW}
              y1={sy(referenceValue)} y2={sy(referenceValue)}
              stroke="var(--ink-3)" strokeWidth={0.5} strokeDasharray="3 4"
            />
          )}
          {/* Cursor */}
          {cursorX !== null && cursorY !== null && (
            <g>
              <line className="cursor-line" x1={cursorX} x2={cursorX} y1={0} y2={innerH} />
              <circle cx={cursorX} cy={cursorY} r={4} fill={color} stroke="var(--paper)" strokeWidth={1.5} />
            </g>
          )}
        </g>
      </svg>

      {hover !== null && (
        <div
          className="chart-tooltip show"
          style={{ left: padL + sx(hover), top: padT + (cursorY ?? 0) - 8 }}
        >
          <div className="tt-date">{data[hover].day}</div>
          <div className="tt-row">
            <span style={{ color }}>●</span>
            <b>{Math.round(data[hover].value)}{unit}</b>
          </div>
        </div>
      )}
    </div>
  );
}
