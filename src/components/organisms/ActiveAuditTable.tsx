import React, { useState } from "react";
import { CheckCircle, AlertTriangle, Upload, X, Save } from "lucide-react";
import Button from "../atoms/Button";

interface ActiveAuditTableProps {
  stockItems: any[];
  auditItems: any[];
  categories: any[];
  onSaveProgress: (counts: Array<{ stockItemId: string; countedQuantity: number }>) => void;
  onCancelAudit: () => void;
  onFinalizeAudit: () => void;
}

export default function ActiveAuditTable({
  stockItems,
  auditItems,
  categories,
  onSaveProgress,
  onCancelAudit,
  onFinalizeAudit,
}: ActiveAuditTableProps) {
  const [counts, setCounts] = useState<{ [key: string]: number }>(() => {
    const initial: { [key: string]: number } = {};
    auditItems.forEach((ai) => {
      if (ai.countedQuantity !== null) {
        initial[ai.stockItemId] = ai.countedQuantity;
      }
    });
    return initial;
  });

  const [showSummary, setShowSummary] = useState(false);

  const handleCountChange = (stockItemId: string, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      setCounts((prev) => ({ ...prev, [stockItemId]: num }));
    } else if (value === "") {
      const newCounts = { ...counts };
      delete newCounts[stockItemId];
      setCounts(newCounts);
    }
  };

  const handleSave = () => {
    const countsArray = Object.entries(counts).map(([stockItemId, countedQuantity]) => ({
      stockItemId,
      countedQuantity,
    }));
    onSaveProgress(countsArray);
    alert("Progress saved!");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n");
      const newCounts = { ...counts };
      
      lines.forEach(line => {
        const [itemName, qty] = line.split(",").map(s => s.trim());
        if (itemName && qty) {
          const matchedItem = stockItems.find(si => si.name.toLowerCase() === itemName.toLowerCase());
          if (matchedItem) {
            const num = parseFloat(qty);
            if (!isNaN(num)) {
              newCounts[matchedItem.id] = num;
            }
          }
        }
      });
      setCounts(newCounts);
      alert("CSV Uploaded and parsed successfully.");
    };
    reader.readAsText(file);
  };

  const variances = auditItems.map((ai) => {
    const counted = counts[ai.stockItemId] !== undefined ? counts[ai.stockItemId] : null;
    const diff = counted !== null ? counted - ai.expectedQuantity : null;
    const item = stockItems.find((s) => s.id === ai.stockItemId);
    return {
      ...ai,
      itemName: item?.name || "Unknown",
      counted,
      diff,
      costDiff: diff !== null ? diff * ((item?.price || 0) / 100) : null,
    };
  });

  const itemsWithVariance = variances.filter((v) => v.diff !== null && v.diff !== 0);
  const totalCostDiff = itemsWithVariance.reduce((acc, v) => acc + (v.costDiff || 0), 0);

  if (showSummary) {
    return (
      <div className="bg-zinc-950/40 p-6 rounded-2xl border border-zinc-900/60 animate-fadeIn">
        <h3 className="text-lg font-bold text-text-primary uppercase tracking-wider mb-4">
          Audit Summary & Confirmation
        </h3>
        <p className="text-xs text-text-secondary mb-6">
          Review the discrepancies below. Applying these changes will update the live inventory.
        </p>
        
        <div className="space-y-4 mb-8">
          {itemsWithVariance.length === 0 ? (
            <p className="text-emerald-400 text-sm font-bold">No discrepancies found! Perfect stock.</p>
          ) : (
            <table className="w-full text-left text-xs text-text-secondary">
              <thead className="bg-zinc-900/40 text-[10px] uppercase tracking-wider font-bold text-text-primary">
                <tr>
                  <th className="p-3">Item</th>
                  <th className="p-3">Expected</th>
                  <th className="p-3">Counted</th>
                  <th className="p-3">Variance</th>
                  <th className="p-3">Value Diff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/60">
                {itemsWithVariance.map((v) => (
                  <tr key={v.id}>
                    <td className="p-3 font-semibold text-text-primary">{v.itemName}</td>
                    <td className="p-3">{v.expectedQuantity}</td>
                    <td className="p-3">{v.counted}</td>
                    <td className={`p-3 font-bold ${v.diff && v.diff > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {v.diff && v.diff > 0 ? "+" : ""}{v.diff}
                    </td>
                    <td className={`p-3 font-mono ${v.costDiff && v.costDiff > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      ${v.costDiff?.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex justify-between items-center bg-zinc-900/30 p-4 rounded-xl border border-zinc-800">
          <span className="text-sm font-bold uppercase text-text-primary">Total Variance Value</span>
          <span className={`text-xl font-mono font-bold ${totalCostDiff >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            ${totalCostDiff.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button variant="secondary" onClick={() => setShowSummary(false)}>
            Back to Audit
          </Button>
          <Button variant="primary" onClick={onFinalizeAudit}>
            Confirm & Finalize
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-rose-950/20 p-4 rounded-2xl border border-rose-500/20 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Active Stock Audit
          </h3>
          <p className="text-[10px] text-rose-300/70 mt-0.5 uppercase font-medium">
            Inventory is frozen for snapshot comparison. Live sales will be reconciled.
          </p>
        </div>
        <div className="flex gap-2">
          <label className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-text-primary px-3 py-1.5 rounded-xl text-xs uppercase font-bold transition-all duration-300 cursor-pointer flex items-center gap-2">
            <Upload className="w-3.5 h-3.5" /> Upload CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
          </label>
          <Button variant="secondary" onClick={handleSave}>
            <Save className="w-3.5 h-3.5 mr-2" /> Save Draft
          </Button>
          <Button variant="danger" onClick={onCancelAudit}>
            <X className="w-3.5 h-3.5 mr-2" /> Cancel Audit
          </Button>
        </div>
      </div>

      <div className="bg-zinc-950/40 rounded-2xl border border-zinc-900/60 overflow-hidden">
        <table className="w-full text-left text-xs text-text-secondary">
          <thead className="bg-zinc-900/40 text-[10px] uppercase tracking-wider font-bold text-text-primary">
            <tr>
              <th className="p-4 w-1/3">Item Name</th>
              <th className="p-4 w-1/6 text-right">Expected Qty</th>
              <th className="p-4 w-1/4">Counted Qty</th>
              <th className="p-4 w-1/4 text-center">Variance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900/60">
            {auditItems.map((ai) => {
              const item = stockItems.find((s) => s.id === ai.stockItemId);
              const counted = counts[ai.stockItemId];
              const diff = counted !== undefined ? counted - ai.expectedQuantity : null;
              
              return (
                <tr key={ai.id} className="hover:bg-zinc-900/20 transition-colors">
                  <td className="p-4 font-semibold text-text-primary">{item?.name || "Unknown"}</td>
                  <td className="p-4 font-mono text-right">{ai.expectedQuantity}</td>
                  <td className="p-4">
                    <input
                      type="number"
                      step="0.01"
                      className="bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-lg px-3 py-1.5 w-full outline-none transition-all duration-300 font-mono"
                      value={counted !== undefined ? counted : ""}
                      onChange={(e) => handleCountChange(ai.stockItemId, e.target.value)}
                      placeholder="Enter count..."
                    />
                  </td>
                  <td className="p-4 text-center">
                    {diff !== null ? (
                      <span className={`font-bold font-mono px-2 py-1 rounded bg-zinc-950 border ${diff === 0 ? "text-zinc-400 border-zinc-800" : diff > 0 ? "text-emerald-400 border-emerald-900/50" : "text-rose-400 border-rose-900/50"}`}>
                        {diff > 0 ? "+" : ""}{diff}
                      </span>
                    ) : (
                      <span className="text-zinc-600">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end pt-4">
        <Button variant="primary" onClick={() => {
          handleSave();
          setShowSummary(true);
        }}>
          Review & Accept
        </Button>
      </div>
    </div>
  );
}
