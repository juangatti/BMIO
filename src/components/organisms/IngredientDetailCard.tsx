import React from "react";
import { AlertTriangle } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "../atoms/Button";
import Input from "../atoms/Input";
import Select from "../atoms/Select";

interface IngredientDetailCardProps {
  item: {
    id: string;
    name: string;
    categoryId: string;
    quantity: number;
    unit: string;
    price: number;
    minStock: number;
    createdAt: any;
  };
  categories: any[];
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  detailForm: {
    name: string;
    categoryId: string;
    quantity: number;
    unit: string;
    price: number;
    minStock: number;
  };
  setDetailForm: (form: any) => void;
  onSave: () => void;
  onCancel: () => void;
  onBackToIngredients: () => void;
  isFormDirty: () => boolean;
}

export default function IngredientDetailCard({
  item,
  categories,
  isEditing,
  setIsEditing,
  detailForm,
  setDetailForm,
  onSave,
  onCancel,
  onBackToIngredients,
  isFormDirty,
}: IngredientDetailCardProps) {
  const category = categories.find((c) => c.id === item.categoryId);
  const isLow = item.quantity <= item.minStock;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header bar */}
      <div className="bg-zinc-950/40 p-4 rounded-2xl border border-zinc-900/60 flex justify-between items-center">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
          <button
            onClick={onBackToIngredients}
            className="hover:text-zinc-200 transition-colors cursor-pointer"
          >
            Ingredients
          </button>
          <span>/</span>
          <span className="text-primary font-bold">{item.name}</span>
        </div>

        <div className="flex gap-2">
          {!isEditing ? (
            <Button variant="secondary" onClick={() => setIsEditing(true)}>
              Edit File
            </Button>
          ) : (
            <>
              <Button variant="secondary" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={onSave}>
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="p-6 space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary pb-3 border-b border-zinc-900">
                Technical Profile (Ficha Técnica)
              </h3>

              {!isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <span className="block text-[9px] uppercase tracking-wide text-text-muted mb-0.5">
                      Ingredient Name
                    </span>
                    <span className="text-sm font-bold text-text-primary">{item.name}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wide text-text-muted mb-0.5">
                      Category Section
                    </span>
                    <span className="text-sm font-semibold text-text-secondary font-mono tracking-wider uppercase">
                      {category?.name || "Uncategorized"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wide text-text-muted mb-0.5">
                      Stock Unit Metric
                    </span>
                    <span className="text-sm font-semibold text-text-secondary uppercase font-mono">
                      {item.unit}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wide text-text-muted mb-0.5">
                      Minimum Stock Threshold
                    </span>
                    <span className="text-sm font-mono font-semibold text-text-primary">
                      {item.minStock}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wide text-text-muted mb-0.5">
                      Cost Valuation (Price)
                    </span>
                    <span className="text-sm font-mono font-semibold text-text-primary">
                      ${(item.price / 100).toFixed(2)} USD
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wide text-text-muted mb-0.5">
                      Current Stock Level
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-sm font-mono font-bold ${isLow ? "text-rose-400" : "text-text-primary"}`}>
                        {item.quantity}
                      </span>
                      {isLow && (
                        <span className="inline-flex items-center gap-1 text-[8px] uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded">
                          <AlertTriangle className="w-2.5 h-2.5" /> Low Stock
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase text-text-secondary mb-1">
                      Ingredient Name
                    </label>
                    <Input
                      type="text"
                      value={detailForm.name}
                      onChange={(e) => setDetailForm({ ...detailForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-text-secondary mb-1">
                      Category
                    </label>
                    <Select
                      value={detailForm.categoryId}
                      onChange={(e) => setDetailForm({ ...detailForm, categoryId: e.target.value })}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-text-secondary mb-1">
                      Quantity Level
                    </label>
                    <Input
                      type="number"
                      step="any"
                      value={detailForm.quantity}
                      onChange={(e) =>
                        setDetailForm({ ...detailForm, quantity: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-text-secondary mb-1">
                      Unit
                    </label>
                    <Input
                      type="text"
                      value={detailForm.unit}
                      onChange={(e) => setDetailForm({ ...detailForm, unit: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-text-secondary mb-1">
                      Price (USD)
                    </label>
                    <Input
                      type="number"
                      step="any"
                      value={detailForm.price}
                      onChange={(e) =>
                        setDetailForm({ ...detailForm, price: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-text-secondary mb-1">
                      Min Stock Threshold
                    </label>
                    <Input
                      type="number"
                      step="any"
                      value={detailForm.minStock}
                      onChange={(e) =>
                        setDetailForm({ ...detailForm, minStock: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <div className="p-6 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                System Metadata
              </h4>
              <div className="space-y-2.5 divide-y divide-zinc-900">
                <div className="pt-2 flex justify-between items-center text-[10px]">
                  <span className="text-text-muted uppercase">Ingredient ID</span>
                  <span className="font-mono text-text-secondary truncate max-w-[120px]">
                    {item.id}
                  </span>
                </div>
                <div className="pt-2 flex justify-between items-center text-[10px]">
                  <span className="text-text-muted uppercase">Created At</span>
                  <span className="font-mono text-text-secondary">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="pt-2 flex justify-between items-center text-[10px]">
                  <span className="text-text-muted uppercase">Status check</span>
                  <span
                    className={`font-semibold uppercase ${
                      isLow ? "text-rose-400" : "text-emerald-400"
                    }`}
                  >
                    {isLow ? "Replenish Stock" : "Sufficient"}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
