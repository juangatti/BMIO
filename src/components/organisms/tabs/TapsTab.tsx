import React from "react";
import { Plus } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "../../atoms/Button";
import LedIndicator from "../../atoms/LedIndicator";
import StatusBadge from "../../molecules/StatusBadge";

interface TapsTabProps {
  activeTaps: Array<{
    tapNum: number;
    keg: any | null;
  }>;
  storedKegs: any[];
  otherKegs: any[];
  pouringLiters: number;
  setPouringLiters: (liters: number) => void;
  currentUser: any;
  allowCashierKegManage: boolean;
  tapCount: number;
  onOpenAddKegModal: () => void;
  onPour: (kegId: string) => void;
  onUntap: (kegId: string) => void;
  onEmpty: (kegId: string) => void;
  onTap: (kegId: string, tapNumber: number) => void;
  onReturn: (kegId: string) => void;
}

export default function TapsTab({
  activeTaps,
  storedKegs,
  otherKegs,
  pouringLiters,
  setPouringLiters,
  currentUser,
  allowCashierKegManage,
  tapCount,
  onOpenAddKegModal,
  onPour,
  onUntap,
  onEmpty,
  onTap,
  onReturn,
}: TapsTabProps) {
  const isCashierRestricted = currentUser?.role === "cashier" && !allowCashierKegManage;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top control bar */}
      <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/60 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <span className="text-xs uppercase tracking-wider text-text-secondary font-semibold">
            Simulate Pour Amount:
          </span>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0.1"
              max="2.0"
              step="0.1"
              value={pouringLiters}
              onChange={(e) => setPouringLiters(parseFloat(e.target.value))}
              className="w-32 accent-primary cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-primary">
              {pouringLiters.toFixed(1)} Liters
            </span>
          </div>
        </div>
        {!isCashierRestricted && (
          <Button onClick={onOpenAddKegModal}>
            Register New Keg
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          </Button>
        )}
      </div>

      {/* Layout Taps & Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Taps board */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-display text-text-primary mb-4 uppercase">
                Connected Taps (1-{tapCount})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeTaps.map(({ tapNum, keg }) => (
                  <div
                    key={tapNum}
                    className="bg-zinc-950/50 p-5 rounded-2xl border border-zinc-800/40 flex flex-col justify-between relative overflow-hidden group hover:border-zinc-850 transition-all duration-300"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm font-mono font-bold text-zinc-400">
                        TAP {tapNum}
                      </span>
                      <StatusBadge status={keg ? "tapped" : "idle"} />
                    </div>

                    {keg ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          {/* Simple Flat Vertical Progress Bar */}
                          <div className="relative w-4 h-28 bg-zinc-900 border border-zinc-800/60 rounded-full overflow-hidden flex-shrink-0 p-[2px]">
                            <div className="h-full w-full bg-zinc-950 rounded-full overflow-hidden relative">
                              <div
                                className="absolute bottom-0 left-0 right-0 bg-primary transition-all duration-500 rounded-full"
                                style={{ height: `${(keg.currentVolume / keg.capacity) * 100}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex-1 min-w-0 py-1">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <LedIndicator current={keg.currentVolume} capacity={keg.capacity} className="w-2 h-2 shrink-0" />
                              <h3
                                className="text-sm font-semibold truncate text-text-primary"
                                title={keg.name}
                              >
                                {keg.name}
                              </h3>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-text-secondary font-mono">
                                {keg.currentVolume.toFixed(1)}L / {keg.capacity}L remaining
                              </p>
                              <span className="inline-block text-[9px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded shadow-sm">
                                {((keg.currentVolume / keg.capacity) * 100).toFixed(0)}% Fill
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => onPour(keg.id)}
                            disabled={keg.currentVolume <= 0 || isCashierRestricted}
                            className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-secondary-dark py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 active:scale-[0.98] ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer"
                          >
                            Pour {pouringLiters}L
                          </button>
                          {!isCashierRestricted && (
                            <>
                              <button
                                onClick={() => onUntap(keg.id)}
                                className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-750 text-text-primary px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 active:scale-[0.98] ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer"
                              >
                                Untap
                              </button>
                              <button
                                onClick={() => onEmpty(keg.id)}
                                className="border border-rose-500/30 hover:bg-rose-500/10 text-rose-400 px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 active:scale-[0.98] ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer"
                              >
                                Empty
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="py-4 text-center">
                        <p className="text-xs text-text-muted italic mb-3">
                          No keg active on this tap
                        </p>
                        {storedKegs.length > 0 ? (
                          <div className="flex flex-col gap-1.5 items-center">
                            <span className="text-[10px] text-text-secondary uppercase">
                              Tap Available Stored:
                            </span>
                            <div className="flex flex-wrap gap-1 justify-center max-w-full">
                              {storedKegs.map((sk) => (
                                <button
                                  key={sk.id}
                                  onClick={() => onTap(sk.id, tapNum)}
                                  disabled={isCashierRestricted}
                                  className="text-[10px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-2 py-1 rounded text-text-primary transition-colors truncate max-w-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                  Tap {sk.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-[10px] text-rose-400 uppercase">
                            No stored kegs available. Register or import some!
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Warehouse Stored Kegs */}
        <div className="space-y-6">
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-display text-text-primary mb-4 uppercase">
                Kegs Warehouse
              </h2>
              <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-zinc-900 pb-1 mb-2">
                Stored / Sealed
              </h3>
              {storedKegs.length === 0 ? (
                <p className="text-xs text-text-muted italic py-3">No kegs stored in warehouse</p>
              ) : (
                <div className="space-y-2 mb-6">
                  {storedKegs.map((k) => (
                    <div
                      key={k.id}
                      className="flex justify-between items-center p-2.5 bg-zinc-950 rounded border border-zinc-905"
                    >
                      <div>
                        <p className="text-xs font-semibold text-text-primary">{k.name}</p>
                        <p className="text-[10px] text-text-muted font-mono">{k.capacity}L capacity</p>
                      </div>
                      <StatusBadge status="stored" />
                    </div>
                  ))}
                </div>
              )}

              <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-zinc-900 pb-1 mb-2">
                Other States
              </h3>
              {otherKegs.length === 0 ? (
                <p className="text-xs text-text-muted italic py-3">No other active kegs</p>
              ) : (
                <div className="space-y-2">
                  {otherKegs.map((k) => (
                    <div
                      key={k.id}
                      className="flex justify-between items-center p-2.5 bg-zinc-950 rounded border border-zinc-905"
                    >
                      <div>
                        <p className="text-xs font-semibold text-text-primary">{k.name}</p>
                        <p className="text-[10px] text-text-muted font-mono uppercase">
                          {k.status}
                        </p>
                      </div>
                      <div className="flex gap-2 items-center">
                        <StatusBadge status={k.status} />
                        {k.status === "empty" && !isCashierRestricted && (
                          <button
                            onClick={() => onReturn(k.id)}
                            className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                          >
                            Return
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
