"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface DataPoint {
  day: string;
  value: number;
}

interface Tab {
  key: string;
  label: string;
  data: DataPoint[];
  color: string;
  title: string;
  sub: string;
}

interface Props {
  tabs: Tab[];
}

const PAD_L = 36, PAD_R = 12, PAD_T = 10, PAD_B = 22;
const HEIGHT = 240;

function buildPath(data: DataPoint[], sx: (i: number) => number, sy: (v: number) => number) {
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
  return path;
}

export function TabbedTrendCharts({ tabs }: Props) {
  const [active, setActive] = useState<Set<string>>(new Set([tabs[0]?.key ?? ""]));
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

  function toggle(key: string) {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size === 1) return next; // always keep at least one
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
    setHover(null);
  }

  const activeTabs = tabs.filter((t) => active.has(t.key));
  const isLayered = activeTabs.length > 1;

  // Use the longest dataset for x-axis labels
  const refData = activeTabs.reduce((a, b) => (a.data.length >= b.data.length ? a : b), activeTabs[0]);

  const innerW = Math.max(40, w - PAD_L - PAD_R);
  const innerH = HEIGHT - PAD_T - PAD_B;

  const yMin = 0, yMax = 100;

  const sx = (i: number, len: number) => (len <= 1 ? 0 : (i / (len - 1)) * innerW);
  const sy = (v: number) => {
    const clamped = Math.min(yMax, Math.max(yMin, v));
    return innerH - ((clamped - yMin) / (yMax - yMin)) * innerH;
  };

  const yTicks = [0, 50, 100].map((v) => ({ v, y: sy(v) }));

  const xStep = Math.max(1, Math.floor((refData?.data.length ?? 0) / 5));
  const xLabels = (refData?.data ?? [])
    .map((d, i) => ({ label: d.day, x: sx(i, refData.data.length), i }))
    .filter((_, i) => i === 0 || i === (refData?.data.length ?? 1) - 1 || i % xStep === 0);

  const handleMove = useCallback(
    (e: React.MouseEvent) => {
      if (!wrapRef.current || !refData) return;
      const rect = wrapRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - PAD_L;
      if (x < 0 || x > innerW) { setHover(null); return; }
      const idx = Math.round((x / innerW) * (refData.data.length - 1));
      setHover(Math.max(0, Math.min(refData.data.length - 1, idx)));
    },
    [innerW, refData]
  );

  const clipId = `clip-tabbed-${innerW}`;

  // For single-series title/sub
  const singleTab = !isLayered ? activeTabs[0] : null;

  return (
    <div className="chart-card lift-in-3" style={{ marginBottom: 24 }}>
      <div className="chart-toolbar">
        <div>
          <h3 className="chart-title">
            {isLayered ? "Sammenligning" : singleTab?.title}
          </h3>
          <div className="chart-sub">
            {isLayered ? "Hover for at inspicere en dag" : singleTab?.sub}
          </div>
        </div>
      </div>

      <div className="chart-shell" ref={wrapRef} onMouseMove={handleMove} onMouseLeave={() => setHover(null)}>
        <svg viewBox={`0 0 ${w} ${HEIGHT}`} style={{ height: HEIGHT }}>
          <defs>
            <clipPath id={clipId}>
              <rect x={0} y={0} width={innerW} height={innerH} />
            </clipPath>
          </defs>

          {/* Grid */}
          <g className="grid" transform={`translate(${PAD_L},${PAD_T})`}>
            {yTicks.map(({ y }, i) => (
              <line key={i} x1={0} x2={innerW} y1={y} y2={y} />
            ))}
          </g>

          {/* Y axis */}
          <g className="axis" transform={`translate(${PAD_L - 6},${PAD_T})`}>
            {yTicks.map(({ v, y }) => (
              <text key={v} x={0} y={y + 3} textAnchor="end">{v}</text>
            ))}
          </g>

          {/* X axis */}
          <g className="axis" transform={`translate(${PAD_L},${HEIGHT - PAD_B + 14})`}>
            {xLabels.map(({ label, x }) => (
              <text key={label + x} x={x} y={0} textAnchor="middle">{label}</text>
            ))}
          </g>

          {/* Series — areas first, then lines on top */}
          <g transform={`translate(${PAD_L},${PAD_T})`} clipPath={`url(#${clipId})`}>
            {/* Areas */}
            {activeTabs.map((t) => {
              if (t.data.length < 2) return null;
              const path = buildPath(t.data, (i) => sx(i, t.data.length), sy);
              const area = `${path} L${innerW.toFixed(1)},${innerH} L0,${innerH} Z`;
              return (
                <path
                  key={`area-${t.key}`}
                  d={area}
                  fill={t.color}
                  fillOpacity={isLayered ? 0.12 : 0.08}
                />
              );
            })}
            {/* Lines */}
            {activeTabs.map((t) => {
              if (t.data.length < 2) return null;
              const path = buildPath(t.data, (i) => sx(i, t.data.length), sy);
              return (
                <path
                  key={`line-${t.key}`}
                  d={path}
                  stroke={t.color}
                  strokeWidth={1.5}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              );
            })}

            {/* Cursor */}
            {hover !== null && (
              <line
                className="cursor-line"
                x1={sx(hover, refData?.data.length ?? 1)}
                x2={sx(hover, refData?.data.length ?? 1)}
                y1={0}
                y2={innerH}
              />
            )}
            {hover !== null && activeTabs.map((t) => {
              // find nearest index in this series
              const i = Math.min(hover, t.data.length - 1);
              if (t.data.length < 2) return null;
              return (
                <circle
                  key={`dot-${t.key}`}
                  cx={sx(i, t.data.length)}
                  cy={sy(t.data[i].value)}
                  r={4}
                  fill={t.color}
                  stroke="var(--paper)"
                  strokeWidth={1.5}
                />
              );
            })}
          </g>
        </svg>

        {/* Tooltip */}
        {hover !== null && refData && (
          <div
            className="chart-tooltip show"
            style={{
              left: PAD_L + sx(hover, refData.data.length),
              top: PAD_T + sy(refData.data[hover]?.value ?? 0) - 8,
            }}
          >
            <div className="tt-date">{refData.data[hover]?.day}</div>
            {activeTabs.map((t) => {
              const i = Math.min(hover, t.data.length - 1);
              return (
                <div key={t.key} className="tt-row">
                  <span style={{ color: t.color }}>●</span>
                  <b>{Math.round(t.data[i]?.value ?? 0)}</b>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend / toggle buttons */}
      <div className="legend" style={{ marginTop: 20 }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            className={active.has(t.key) ? "active" : ""}
            onClick={() => toggle(t.key)}
          >
            <span className="dot" style={{ background: t.color }} />
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
