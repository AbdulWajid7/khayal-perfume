"use client";

import { useState } from "react";

/**
 * Accounts charts, hand-drawn SVG. Colours are the validated reference categorical
 * slots 1-3 (blue, orange, aqua); identity is never colour-alone (legend + tooltip).
 */
const C = { revenue: "#2a78d6", costs: "#eb6834", net: "#1baf7a", grid: "#e7e3dc", axis: "#8a857c", ink: "#1a1a1a", sub: "#52514e" };

const compact = (n: number) => {
  const a = Math.abs(n);
  const s = a >= 1_000_000 ? `${(a / 1_000_000).toFixed(a >= 10_000_000 ? 0 : 1)}M` : a >= 1000 ? `${Math.round(a / 1000)}k` : `${Math.round(a)}`;
  return `${n < 0 ? "−" : ""}Rs ${s}`;
};
const full = (n: number) => `${n < 0 ? "−" : ""}Rs ${Math.abs(Math.round(n)).toLocaleString("en-PK")}`;

function niceMax(v: number) {
  if (v <= 0) return 1000;
  const p = 10 ** Math.floor(Math.log10(v));
  const n = v / p;
  const steps = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
  return (steps.find((s) => n <= s) ?? 10) * p;
}

/** Rounded data-end on a bar anchored at the baseline. */
function bar(x: number, y0: number, w: number, h: number, up: boolean) {
  const r = Math.min(4, w / 2, Math.abs(h));
  if (Math.abs(h) < 0.5) return "";
  if (up) {
    const top = y0 - h;
    return `M${x},${y0}V${top + r}Q${x},${top} ${x + r},${top}H${x + w - r}Q${x + w},${top} ${x + w},${top + r}V${y0}Z`;
  }
  const bot = y0 + h;
  return `M${x},${y0}V${bot - r}Q${x},${bot} ${x + r},${bot}H${x + w - r}Q${x + w},${bot} ${x + w},${bot - r}V${y0}Z`;
}

function Tooltip({ x, lines, width }: { x: number; lines: [string, string, string?][]; width: number }) {
  const left = Math.min(Math.max(x, 90), width - 90);
  return (
    <div
      className="pointer-events-none absolute top-2 -translate-x-1/2 rounded-lg border border-border bg-pure px-3 py-2 text-xs shadow-md"
      style={{ left: `${(left / width) * 100}%` }}
    >
      {lines.map(([k, v, color], i) => (
        <div key={i} className={`flex items-center gap-2 whitespace-nowrap ${i === 0 ? "font-medium text-ink mb-1" : "text-stone"}`}>
          {color && <span className="inline-block h-2 w-2 rounded-full" style={{ background: color }} />}
          <span>{k}</span>
          {v && <span className="ml-auto pl-3 font-medium text-ink">{v}</span>}
        </div>
      ))}
    </div>
  );
}

export function RevenueCostChart({ months, revenue, costs, net }: { months: string[]; revenue: number[]; costs: number[]; net: number[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 720, H = 260, L = 56, R = 8, T = 16, B = 28;
  const max = niceMax(Math.max(...revenue, ...costs, 1));
  const step = (W - L - R) / months.length;
  const bw = Math.min(18, (step - 10) / 2);
  const y = (v: number) => H - B - (v / max) * (H - T - B);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);
  return (
    <div className="relative">
      <div className="flex gap-4 text-xs text-stone mb-2">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: C.revenue }} />Revenue</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: C.costs }} />Costs (goods sold, expenses, commission)</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" onMouseLeave={() => setHover(null)} role="img" aria-label="Revenue and costs by month">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke={C.grid} strokeWidth={1} />
            <text x={L - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill={C.axis}>{compact(t)}</text>
          </g>
        ))}
        {months.map((m, i) => {
          const cx = L + step * i + step / 2;
          return (
            <g key={m} onMouseEnter={() => setHover(i)}>
              <rect x={L + step * i} y={T} width={step} height={H - T - B} fill={hover === i ? "#f5f0e8" : "transparent"} />
              <path d={bar(cx - bw - 1, y(0), bw, (revenue[i] / max) * (H - T - B), true)} fill={C.revenue} />
              <path d={bar(cx + 1, y(0), bw, (costs[i] / max) * (H - T - B), true)} fill={C.costs} />
              <text x={cx} y={H - 8} textAnchor="middle" fontSize={11} fill={C.axis}>{m}</text>
            </g>
          );
        })}
      </svg>
      {hover !== null && (
        <Tooltip
          width={W}
          x={L + step * hover + step / 2}
          lines={[
            [months[hover], ""],
            ["Revenue", full(revenue[hover]), C.revenue],
            ["Costs", full(costs[hover]), C.costs],
            ["Net profit", full(net[hover])],
          ]}
        />
      )}
    </div>
  );
}

export function NetProfitChart({ months, net }: { months: string[]; net: number[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 720, H = 200, L = 56, R = 8, T = 12, B = 26;
  const maxAbs = niceMax(Math.max(...net.map(Math.abs), 1));
  const hasNeg = net.some((v) => v < 0);
  const top = maxAbs, bottom = hasNeg ? -maxAbs : 0;
  const y = (v: number) => T + ((top - v) / (top - bottom)) * (H - T - B);
  const step = (W - L - R) / months.length;
  const bw = Math.min(26, step - 12);
  const ticks = hasNeg ? [bottom, bottom / 2, 0, top / 2, top] : [0, top / 2, top];
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" onMouseLeave={() => setHover(null)} role="img" aria-label="Net profit by month">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke={t === 0 ? C.axis : C.grid} strokeWidth={1} />
            <text x={L - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill={C.axis}>{compact(t)}</text>
          </g>
        ))}
        {months.map((m, i) => {
          const cx = L + step * i + step / 2;
          const h = (Math.abs(net[i]) / (top - bottom)) * (H - T - B);
          return (
            <g key={m} onMouseEnter={() => setHover(i)}>
              <rect x={L + step * i} y={T} width={step} height={H - T - B} fill={hover === i ? "#f5f0e8" : "transparent"} />
              <path d={bar(cx - bw / 2, y(0), bw, h, net[i] >= 0)} fill={C.net} />
              <text x={cx} y={H - 8} textAnchor="middle" fontSize={11} fill={C.axis}>{m}</text>
            </g>
          );
        })}
      </svg>
      {hover !== null && <Tooltip width={W} x={L + step * hover + step / 2} lines={[[months[hover], ""], ["Net profit", full(net[hover]), C.net]]} />}
    </div>
  );
}

export function BalanceChart({ months, balance }: { months: string[]; balance: number[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 720, H = 200, L = 56, R = 28, T = 12, B = 26;
  const lo = Math.min(0, ...balance), hi = niceMax(Math.max(...balance, 1));
  const bottom = lo < 0 ? -niceMax(-lo) : 0;
  const y = (v: number) => T + ((hi - v) / (hi - bottom)) * (H - T - B);
  const step = (W - L - R) / Math.max(1, months.length - 1);
  const x = (i: number) => L + step * i;
  const d = balance.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join("");
  const ticks = bottom < 0 ? [bottom, 0, hi / 2, hi] : [0, hi / 2, hi];
  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label="Cash position at the end of each month"
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const px = ((e.clientX - rect.left) / rect.width) * W;
          setHover(Math.min(months.length - 1, Math.max(0, Math.round((px - L) / step))));
        }}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke={t === 0 ? C.axis : C.grid} strokeWidth={1} />
            <text x={L - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill={C.axis}>{compact(t)}</text>
          </g>
        ))}
        <path d={d} fill="none" stroke={C.revenue} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {months.map((m, i) => (
          <text key={m} x={x(i)} y={H - 8} textAnchor="middle" fontSize={11} fill={C.axis}>{m}</text>
        ))}
        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={T} y2={H - B} stroke={C.axis} strokeDasharray="3 3" />
            <circle cx={x(hover)} cy={y(balance[hover])} r={5} fill={C.revenue} stroke="#fff" strokeWidth={2} />
          </g>
        )}
      </svg>
      {hover !== null && <Tooltip width={W} x={x(hover)} lines={[[months[hover], ""], ["Cash position", full(balance[hover]), C.revenue]]} />}
    </div>
  );
}

/** One measure across items: a ranked list with proportional bars. */
export function BreakdownBars({ rows, empty }: { rows: { label: string; total: number }[]; empty: string }) {
  if (!rows.length) return <p className="text-sm text-stone">{empty}</p>;
  const max = Math.max(...rows.map((r) => r.total), 1);
  const sum = rows.reduce((s, r) => s + r.total, 0);
  return (
    <ul className="space-y-2.5">
      {rows.slice(0, 10).map((r) => (
        <li key={r.label} title={`${r.label}: ${full(r.total)}`}>
          <div className="flex justify-between gap-3 text-sm">
            <span className="text-ink truncate">{r.label}</span>
            <span className="text-ink font-medium whitespace-nowrap">
              {full(r.total)} <span className="text-stone font-normal">· {sum ? Math.round((r.total / sum) * 100) : 0}%</span>
            </span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-cream">
            <div className="h-2 rounded-full" style={{ width: `${Math.max(2, (r.total / max) * 100)}%`, background: C.revenue }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
