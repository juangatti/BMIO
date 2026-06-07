import React from "react";
import { Plus } from "lucide-react";
import Button from "../../atoms/Button";
import StatusBadge from "../../molecules/StatusBadge";

interface PrebatchesTabProps {
  prebatches: any[];
  onOpenAddModal: () => void;
  onConsume: (id: string, amount: number) => void;
  onDelete: (id: string) => void;
}

export default function PrebatchesTab({
  prebatches,
  onOpenAddModal,
  onConsume,
  onDelete,
}: PrebatchesTabProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Action Bar */}
      <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/60 flex justify-between items-center">
        <span className="text-xs uppercase tracking-wider text-text-secondary font-semibold">
          Internal Prebatches / Custom Mixes
        </span>
        <Button onClick={onOpenAddModal}>
          Prep New Batch
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
        </Button>
      </div>

      {/* List of Prebatches */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {prebatches.map((pb) => {
          // Calculate expiration state
          const now = new Date();
          const exp = pb.expirationDate ? new Date(pb.expirationDate) : null;
          const prod = new Date(pb.productionDate);

          let state: "expired" | "warning" | "fresh" = "fresh";
          if (exp && now >= exp) {
            state = "expired";
          } else if (exp) {
            const diffTime = exp.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays <= 3) state = "warning";
          }

          return (
            <div
              key={pb.id}
              className="bg-zinc-900/40 border border-zinc-800/40 hover:border-primary/50 p-4 rounded-2xl flex flex-col justify-between h-52 relative group transition-all duration-300"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-semibold text-text-primary truncate max-w-[70%]">
                    {pb.name}
                  </h3>
                  <StatusBadge status={state} />
                </div>

                <div className="space-y-1 text-xs text-text-secondary">
                  <p>
                    <span className="text-text-muted">Batch ID:</span>{" "}
                    <span className="font-semibold text-text-primary font-mono">
                      {pb.batchId || "N/A"}
                    </span>
                  </p>
                  <p>
                    <span className="text-text-muted">Prepped:</span>{" "}
                    <span className="font-semibold text-text-primary">
                      {prod.toLocaleDateString()}
                    </span>
                  </p>
                  <p>
                    <span className="text-text-muted">Expires:</span>{" "}
                    <span className="font-semibold text-primary">
                      {exp ? exp.toLocaleDateString() : "Never"}
                    </span>
                  </p>

                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-text-secondary mb-1">
                      <span>
                        Volume: {pb.currentQuantityMl}ml / {pb.initialQuantityMl}ml
                      </span>
                      <span>
                        {((pb.currentQuantityMl / pb.initialQuantityMl) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-900">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          state === "expired"
                            ? "bg-rose-500 shadow-[0_0_4px_rgba(239,68,68,0.5)]"
                            : state === "warning"
                            ? "bg-amber-500 shadow-[0_0_4px_rgba(245,158,11,0.5)]"
                            : "bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]"
                        }`}
                        style={{
                          width: `${(pb.currentQuantityMl / pb.initialQuantityMl) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 border-t border-zinc-900/60 pt-3 mt-3">
                <button
                  onClick={() => onConsume(pb.id, 250)}
                  disabled={pb.currentQuantityMl <= 0}
                  className="flex-1 text-[10px] bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:hover:bg-zinc-800 py-1 rounded-lg font-semibold uppercase tracking-wider transition-colors cursor-pointer text-text-primary border border-zinc-750"
                >
                  Use 250ml
                </button>
                <button
                  onClick={() => onDelete(pb.id)}
                  className="text-[10px] border border-rose-500/30 hover:bg-rose-500/10 text-rose-400 px-3 py-1 rounded-lg font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Discard
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
