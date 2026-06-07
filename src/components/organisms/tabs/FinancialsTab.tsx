import React from "react";
import Card from "@/components/ui/Card";
import SVGCharts from "../SVGCharts";

interface FinancialsTabProps {
  sales: any[];
  expenses: any[];
  stockItems: any[];
}

export default function FinancialsTab({
  sales,
  expenses,
  stockItems,
}: FinancialsTabProps) {
  const totalRevenueCents = sales.reduce((sum, s) => sum + s.amount, 0);
  const totalExpensesCents = (expenses || []).reduce((sum, e) => sum + e.amount, 0);
  const netMarginPct =
    totalRevenueCents > 0 ? ((totalRevenueCents - totalExpensesCents) / totalRevenueCents) * 100 : 0;
  const stockValuationCents = stockItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="p-4 flex flex-col justify-between h-32">
            <span className="text-[10px] uppercase tracking-wider text-text-secondary font-semibold">
              Total Revenue
            </span>
            <div>
              <h3 className="text-2xl font-mono font-bold text-primary">
                ${(totalRevenueCents / 100).toFixed(2)}
              </h3>
              <p className="text-[9px] text-emerald-400 mt-1 uppercase flex items-center gap-1 font-medium">
                &uarr; Inbound Cashflow
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4 flex flex-col justify-between h-32">
            <span className="text-[10px] uppercase tracking-wider text-text-secondary font-semibold">
              Total Expenses
            </span>
            <div>
              <h3 className="text-2xl font-mono font-bold text-rose-400">
                ${(totalExpensesCents / 100).toFixed(2)}
              </h3>
              <p className="text-[9px] text-text-secondary mt-1 uppercase font-medium">
                Operating costs logged
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4 flex flex-col justify-between h-32">
            <span className="text-[10px] uppercase tracking-wider text-text-secondary font-semibold">
              Net Margin
            </span>
            <div>
              <h3
                className={`text-2xl font-mono font-bold ${
                  netMarginPct >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {netMarginPct.toFixed(1)}%
              </h3>
              <p className="text-[9px] text-text-secondary mt-1 uppercase font-medium">
                Profitability ratio
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4 flex flex-col justify-between h-32">
            <span className="text-[10px] uppercase tracking-wider text-text-secondary font-semibold">
              Stock Valuation
            </span>
            <div>
              <h3 className="text-2xl font-mono font-bold text-text-primary">
                ${(stockValuationCents / 100).toFixed(2)}
              </h3>
              <p className="text-[9px] text-text-secondary mt-1 uppercase font-medium">
                Asset worth in inventory
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* SVG Charts */}
      <SVGCharts sales={sales} expenses={expenses} stockItems={stockItems} />
    </div>
  );
}
