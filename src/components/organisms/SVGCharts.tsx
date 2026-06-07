import React, { useState } from "react";
import Card from "@/components/ui/Card";

interface SVGChartsProps {
  sales: any[];
  expenses: any[];
  stockItems: any[];
}

export default function SVGCharts({ sales, expenses, stockItems }: SVGChartsProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    label: string;
    revenue: number;
    expense: number;
  } | null>(null);

  const [hoveredSlice, setHoveredSlice] = useState<{
    category: string;
    amount: number;
    percentage: number;
    color: string;
  } | null>(null);

  // SVG Line Chart calculations
  const salesByDate: { [key: string]: number } = {};
  const expensesByDate: { [key: string]: number } = {};

  sales.forEach((sale) => {
    const dateStr = new Date(sale.createdAt).toISOString().split("T")[0];
    salesByDate[dateStr] = (salesByDate[dateStr] || 0) + sale.amount;
  });

  (expenses || []).forEach((exp) => {
    const dateStr = new Date(exp.createdAt).toISOString().split("T")[0];
    expensesByDate[dateStr] = (expensesByDate[dateStr] || 0) + exp.amount;
  });

  const allDates = Array.from(
    new Set([...Object.keys(salesByDate), ...Object.keys(expensesByDate)])
  )
    .sort()
    .slice(-7);

  const chartDates =
    allDates.length > 0
      ? allDates
      : Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return d.toISOString().split("T")[0];
        });

  const chartData = chartDates.map((date) => ({
    date,
    revenue: (salesByDate[date] || 0) / 100,
    expense: (expensesByDate[date] || 0) / 100,
  }));

  const maxVal = Math.max(...chartData.map((d) => Math.max(d.revenue, d.expense)), 50);
  const width = 500;
  const height = 200;
  const padding = 40;

  const getPoints = (key: "revenue" | "expense") => {
    return chartData.map((d, i) => {
      const x = padding + (i * (width - 2 * padding)) / (chartData.length - 1 || 1);
      const y = height - padding - (d[key] * (height - 2 * padding)) / maxVal;
      return { x, y, val: d[key], date: d.date, rawRevenue: d.revenue, rawExpense: d.expense };
    });
  };

  const revenuePoints = getPoints("revenue");
  const expensePoints = getPoints("expense");

  const getPathD = (points: typeof revenuePoints) => {
    if (points.length === 0) return "";
    return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  };

  const getAreaPathD = (points: typeof revenuePoints) => {
    if (points.length === 0) return "";
    const linePath = getPathD(points);
    const first = points[0];
    const last = points[points.length - 1];
    return `${linePath} L ${last.x} ${height - padding} L ${first.x} ${height - padding} Z`;
  };

  const revPath = getPathD(revenuePoints);
  const revArea = getAreaPathD(revenuePoints);
  const expPath = getPathD(expensePoints);
  const expArea = getAreaPathD(expensePoints);

  // SVG Donut calculations
  const expensesByCategory: { [key: string]: number } = {};
  (expenses || []).forEach((exp) => {
    expensesByCategory[exp.category] = (expensesByCategory[exp.category] || 0) + exp.amount;
  });
  const totalExpCents = Object.values(expensesByCategory).reduce((a, b) => a + b, 0);

  const colorsList = [
    "#f59e0b",
    "#3b82f6",
    "#10b981",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#6b7280",
  ];
  const donutData = Object.entries(expensesByCategory).map(([category, amount], idx) => ({
    category,
    amount: amount / 100,
    percentage: totalExpCents > 0 ? (amount / totalExpCents) * 100 : 0,
    color: colorsList[idx % colorsList.length],
  }));

  let cumulativeAngle = 0;

  const getDonutPath = (
    startAngle: number,
    endAngle: number,
    radius: number,
    innerRadius: number,
    cx: number,
    cy: number
  ) => {
    const rad = Math.PI / 180;
    const s = startAngle - 90;
    const e = endAngle - 90;

    const x1 = cx + radius * Math.cos(s * rad);
    const y1 = cy + radius * Math.sin(s * rad);
    const x2 = cx + radius * Math.cos(e * rad);
    const y2 = cy + radius * Math.sin(e * rad);

    const ix1 = cx + innerRadius * Math.cos(s * rad);
    const iy1 = cy + innerRadius * Math.sin(s * rad);
    const ix2 = cx + innerRadius * Math.cos(e * rad);
    const iy2 = cy + innerRadius * Math.sin(e * rad);

    const angleDiff = endAngle - startAngle;
    const largeArc = angleDiff > 180 ? 1 : 0;

    if (angleDiff >= 360) {
      return `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 0 ${cx} ${
        cy + radius
      } A ${radius} ${radius} 0 1 0 ${cx} ${cy - radius} M ${cx} ${
        cy - innerRadius
      } A ${innerRadius} ${innerRadius} 0 1 1 ${cx} ${cy + innerRadius} A ${
        innerRadius
      } ${innerRadius} 0 1 1 ${cx} ${cy - innerRadius} Z`;
    }

    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1} Z`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Revenue vs Expenses Area Chart */}
      <div className="lg:col-span-2 relative">
        <Card>
          <div className="p-6 border-b border-zinc-900/60">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text-primary">
              Revenue vs Expenses
            </h3>
            <p className="text-[10px] text-text-secondary mt-1 uppercase">
              7-Day financial balance graph
            </p>
          </div>

          <div className="p-6 relative">
            {/* Tooltip */}
            {hoveredPoint && (
              <div
                className="absolute bg-zinc-950/85 backdrop-blur-md border border-zinc-800/60 p-3 rounded-xl shadow-2xl text-xs z-20 pointer-events-none transition-all duration-300 ease-out border-t-zinc-700/30"
                style={{
                  left: `${hoveredPoint.x}px`,
                  top: `${hoveredPoint.y - 75}px`,
                  transform: "translateX(-50%)",
                }}
              >
                <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider mb-1.5">
                  {hoveredPoint.label}
                </p>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-primary">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_4px_rgba(245,158,11,0.6)]" />
                    <span className="font-semibold text-[10px]">Rev:</span>
                    <span className="font-mono font-bold text-zinc-100">
                      ${hoveredPoint.revenue.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-rose-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_4px_rgba(239,68,68,0.6)]" />
                    <span className="font-semibold text-[10px]">Exp:</span>
                    <span className="font-mono font-bold text-zinc-100">
                      ${hoveredPoint.expense.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-auto overflow-visible select-none"
            >
              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                const y = padding + ratio * (height - 2 * padding);
                const val = maxVal * (1 - ratio);
                return (
                  <g key={index}>
                    <line
                      x1={padding}
                      y1={y}
                      x2={width - padding}
                      y2={y}
                      className="stroke-zinc-800/40"
                      strokeWidth={0.5}
                      strokeDasharray="4 4"
                    />
                    <text
                      x={padding - 8}
                      y={y + 3}
                      className="fill-text-muted text-[8px] font-mono text-right"
                      style={{ textAnchor: "end" }}
                    >
                      ${val.toFixed(0)}
                    </text>
                  </g>
                );
              })}

              {/* X Axis Labels */}
              {chartData.map((d, i) => {
                const x = padding + (i * (width - 2 * padding)) / (chartData.length - 1 || 1);
                const dateLabel = new Date(d.date).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                });
                return (
                  <text
                    key={i}
                    x={x}
                    y={height - padding + 15}
                    className="fill-text-muted text-[8px] font-mono"
                    style={{ textAnchor: "middle" }}
                  >
                    {dateLabel}
                  </text>
                );
              })}

              {/* Shaded Areas */}
              {revArea && <path d={revArea} fill="url(#revGrad)" />}
              {expArea && <path d={expArea} fill="url(#expGrad)" />}

              {/* Lines */}
              {revPath && (
                <path
                  d={revPath}
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                />
              )}
              {expPath && <path d={expPath} fill="none" stroke="#ef4444" strokeWidth={2} />}

              {/* Interactive Hover Circles */}
              {revenuePoints.map((p, i) => (
                <g key={i}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={4}
                    className="fill-zinc-950 stroke-primary stroke-2 cursor-pointer hover:r-6 transition-all duration-200"
                    onMouseEnter={() =>
                      setHoveredPoint({
                        x: p.x,
                        y: p.y,
                        label: p.date,
                        revenue: p.rawRevenue,
                        expense: p.rawExpense,
                      })
                    }
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  <circle
                    cx={expensePoints[i].x}
                    cy={expensePoints[i].y}
                    r={4}
                    className="fill-zinc-950 stroke-rose-500 stroke-2 cursor-pointer hover:r-6 transition-all duration-200"
                    onMouseEnter={() =>
                      setHoveredPoint({
                        x: expensePoints[i].x,
                        y: expensePoints[i].y,
                        label: p.date,
                        revenue: p.rawRevenue,
                        expense: p.rawExpense,
                      })
                    }
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                </g>
              ))}

              {/* Definitions */}
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
            </svg>

            {/* Chart Legend */}
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary/20 border border-primary"></span>
                <span className="text-[10px] uppercase font-bold text-text-secondary">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500"></span>
                <span className="text-[10px] uppercase font-bold text-text-secondary">Expenses</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Expenses by Category Donut Chart */}
      <div className="relative">
        <Card>
          <div className="flex flex-col justify-between min-h-[340px]">
            <div className="p-6 border-b border-zinc-900/60">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-text-primary">
                Expenses by Category
              </h3>
              <p className="text-[10px] text-text-secondary mt-1 uppercase">
                Breakdown of operational spend
              </p>
            </div>

            <div className="p-6 flex flex-col items-center justify-center flex-1">
              {donutData.length === 0 ? (
                <p className="text-xs text-text-secondary uppercase p-8">No expenses logged yet</p>
              ) : (
                <div className="relative w-48 h-48">
                  <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
                    {donutData.map((slice, i) => {
                      const angle = (slice.percentage / 100) * 360;
                      const startAngle = cumulativeAngle;
                      const endAngle = cumulativeAngle + angle;
                      cumulativeAngle = endAngle;

                      return (
                        <path
                          key={i}
                          d={getDonutPath(startAngle, endAngle, 70, 45, 100, 100)}
                          fill={slice.color}
                          className="cursor-pointer hover:opacity-85 transition-opacity"
                          onMouseEnter={() =>
                            setHoveredSlice({
                              category: slice.category,
                              amount: slice.amount,
                              percentage: slice.percentage,
                              color: slice.color,
                            })
                          }
                          onMouseLeave={() => setHoveredSlice(null)}
                        />
                      );
                    })}
                  </svg>

                  {/* Center Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    {hoveredSlice ? (
                      <>
                        <span
                          className="text-[9px] uppercase tracking-wider text-text-secondary truncate max-w-[90px]"
                          style={{ color: hoveredSlice.color }}
                        >
                          {hoveredSlice.category}
                        </span>
                        <span className="text-base font-bold font-mono text-text-primary mt-0.5">
                          ${hoveredSlice.amount.toFixed(2)}
                        </span>
                        <span className="text-[9px] font-mono text-text-muted mt-0.5">
                          {hoveredSlice.percentage.toFixed(1)}%
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-[9px] uppercase tracking-wider text-text-muted">
                          Log Share
                        </span>
                        <span className="text-xs font-semibold text-text-secondary mt-0.5 uppercase">
                          Hover Slice
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
