import React from "react";
import { AlertTriangle, Plus, Upload } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "../atoms/Button";
import Input from "../atoms/Input";

interface StockTableProps {
  stockItems: any[];
  categories: any[];
  isModifying: boolean;
  setIsModifying: (modifying: boolean) => void;
  canAdjustStock: boolean;
  onOpenDetail: (item: any) => void;
  onAdjustStock: (itemId: string, newQty: number) => void;
  onOpenAddModal: () => void;
  onOpenImportModal: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function StockTable({
  stockItems,
  categories,
  isModifying,
  setIsModifying,
  canAdjustStock,
  onOpenDetail,
  onAdjustStock,
  onOpenAddModal,
  onOpenImportModal,
  searchQuery,
  setSearchQuery,
}: StockTableProps) {
  return (
    <div className="space-y-6 animate-fadeIn flex flex-col h-full">
      {/* Modification banner alert */}
      {isModifying && (
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
              <AlertTriangle className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-200">
                Inventory Modification Mode Active
              </h4>
              <p className="text-[10px] text-amber-400/80 uppercase mt-0.5 font-medium">
                Manual updates, item additions, and bulk spreadsheet imports are unlocked.
              </p>
            </div>
          </div>
          <Button variant="amber" onClick={() => setIsModifying(false)}>
            Finish Modifications
          </Button>
        </div>
      )}

      {/* Top search & actions bar */}
      <div className="pb-5 border-b border-zinc-800/60 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center flex-1">
          <div className="flex items-center gap-2 min-w-[150px]">
            <div
              className={`w-2 h-2 rounded-full ${
                isModifying
                  ? "bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                  : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
              }`}
            />
            <span className="text-xs uppercase tracking-wider text-text-secondary">
              {isModifying ? "Stock (Editing)" : "Stock (Static)"}
            </span>
          </div>
          <Input
            type="text"
            placeholder="Search stock list..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="md:max-w-md"
          />
        </div>

        {canAdjustStock && (
          <div className="flex gap-2 w-full md:w-auto justify-end">
            {!isModifying ? (
              <Button variant="secondary" onClick={() => setIsModifying(true)}>
                Start Modifications
              </Button>
            ) : (
              <>
                <Button variant="secondary" onClick={onOpenImportModal}>
                  <Upload className="w-3.5 h-3.5 text-zinc-400" />
                  Spreadsheet Import
                </Button>
                <Button onClick={onOpenAddModal}>
                  Add Item
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Inventory table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/40 text-[10px] text-text-secondary uppercase tracking-wider">
              <th className="p-4">Item Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Stock Level</th>
              <th className="p-4">Unit</th>
              <th className="p-4">Price</th>
              {isModifying && <th className="p-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {stockItems.map((item) => {
              const category = categories.find((c) => c.id === item.categoryId);
              const isLow = item.quantity <= item.minStock;
              return (
                <tr key={item.id} className="hover:bg-zinc-900/20 transition-colors">
                  <td className="p-4">
                    <button
                      onClick={() => onOpenDetail(item)}
                      className="text-xs font-semibold text-primary hover:text-primary-dark hover:underline block text-left cursor-pointer transition-colors"
                    >
                      {item.name}
                    </button>
                    {isLow && (
                      <span className="inline-flex items-center gap-1 text-[8px] uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded mt-0.5">
                        <AlertTriangle className="w-2.5 h-2.5" /> Low Stock
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-xs text-text-secondary">
                    {category?.name || "Uncategorized"}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-mono font-semibold ${
                          isLow ? "text-rose-400" : "text-text-primary"
                        }`}
                      >
                        {item.quantity}
                      </span>
                      <span className="text-[10px] text-text-muted">/ min {item.minStock}</span>
                    </div>
                  </td>
                  <td className="p-4 text-xs text-text-muted uppercase font-mono">{item.unit}</td>
                  <td className="p-4 text-xs text-text-primary font-mono">
                    ${(item.price / 100).toFixed(2)}
                  </td>
                  {isModifying && (
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onAdjustStock(item.id, item.quantity + 1)}
                          className="text-[10px] bg-zinc-900 hover:bg-zinc-800 px-2.5 py-1 rounded text-text-primary transition-all duration-300 active:scale-[0.95] font-mono border border-zinc-800 hover:border-zinc-700 cursor-pointer"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => onAdjustStock(item.id, Math.max(0, item.quantity - 1))}
                          className="text-[10px] bg-zinc-900 hover:bg-zinc-800 px-2.5 py-1 rounded text-text-primary transition-all duration-300 active:scale-[0.95] font-mono border border-zinc-800 hover:border-zinc-700 cursor-pointer"
                        >
                          -1
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
