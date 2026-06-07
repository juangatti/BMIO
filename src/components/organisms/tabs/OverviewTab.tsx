import React from "react";
import { Box, Beer, DollarSign, Calendar, AlertTriangle } from "lucide-react";
import Alert from "@/components/ui/Alert";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import LedIndicator from "../../atoms/LedIndicator";

interface OverviewTabProps {
  stockAlerts: any[];
  localData: {
    stockItems: any[];
    kegs: any[];
    reservations: any[];
  };
  tapCount: number;
  currentUser: any;
  allowKitchenViewSales: boolean;
  totalSalesUSD: string;
  activeTaps: Array<{
    tapNum: number;
    keg: any | null;
  }>;
  handleReservationStatus: (id: string, status: "confirmed" | "cancelled") => void;
}

export default function OverviewTab({
  stockAlerts,
  localData,
  tapCount,
  currentUser,
  allowKitchenViewSales,
  totalSalesUSD,
  activeTaps,
  handleReservationStatus,
}: OverviewTabProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      {stockAlerts.length > 0 && (
        <Alert
          message={`Attention: ${stockAlerts.length} stock items are below critical limits! Synchronize with suppliers immediately.`}
        />
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Registered Stock Items"
          value={localData.stockItems.length.toString()}
          unit="items"
          icon={Box}
        />
        <StatCard
          label="Active Beer Taps"
          value={localData.kegs.filter((k) => k.status === "tapped").length.toString()}
          unit={`/ ${tapCount} active`}
          icon={Beer}
        />
        {!(currentUser?.role === "kitchen" && !allowKitchenViewSales) ? (
          <StatCard
            label="Today's Sales Cashflow"
            value={totalSalesUSD}
            unit="USD"
            icon={DollarSign}
          />
        ) : (
          <StatCard
            label="Today's Sales Cashflow"
            value="[HIDDEN]"
            unit="Restricted"
            icon={DollarSign}
          />
        )}
        <StatCard
          label="Active Reservations"
          value={localData.reservations.filter((r) => r.status === "confirmed").length.toString()}
          unit="booked"
          icon={Calendar}
        />
      </div>

      {/* Split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left col: Active Taps Quick View */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-display text-text-primary mb-4 flex items-center gap-2">
                <Beer className="text-primary w-5 h-5" /> Taps & Keg Status
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {activeTaps.map(({ tapNum, keg }) => (
                  <div
                    key={tapNum}
                    className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/40 flex flex-col justify-between h-44 relative overflow-hidden group hover:border-zinc-850 transition-all duration-300"
                  >
                    {/* Beer Tap head */}
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xl font-mono font-bold text-zinc-600">#{tapNum}</span>
                      <LedIndicator status={keg ? "warning" : "inactive"} />
                    </div>
                    {keg ? (
                      <div className="flex flex-1 items-center gap-3">
                        {/* Simple Flat Vertical Progress Bar */}
                        <div className="relative w-4 h-24 bg-zinc-900 border border-zinc-800/60 rounded-full overflow-hidden flex-shrink-0 p-[2px]">
                          <div className="h-full w-full bg-zinc-950 rounded-full overflow-hidden relative">
                            <div
                              className="absolute bottom-0 left-0 right-0 bg-primary transition-all duration-500 rounded-full"
                              style={{ height: `${(keg.currentVolume / keg.capacity) * 100}%` }}
                            />
                          </div>
                        </div>

                        <div className="min-w-0 flex-1 flex flex-col justify-between h-full py-1">
                          <div>
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <LedIndicator current={keg.currentVolume} capacity={keg.capacity} className="w-1.5 h-1.5 shrink-0" />
                              <p
                                className="text-xs font-semibold truncate text-text-primary"
                                title={keg.name}
                              >
                                {keg.name}
                              </p>
                            </div>
                            <p className="text-[10px] text-text-secondary font-mono">
                              {keg.currentVolume.toFixed(1)}L / {keg.capacity}L
                            </p>
                          </div>
                          <span className="text-[9px] font-mono text-zinc-500 bg-zinc-900/50 border border-zinc-800/40 px-1.5 py-0.5 rounded w-max">
                            {((keg.currentVolume / keg.capacity) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[9px] font-mono uppercase tracking-wider text-zinc-600 text-center my-auto">
                        Empty Tap
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right col: Stock Alerts & Fast Reservations */}
        <div className="space-y-6">
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-display text-text-primary mb-4 flex items-center gap-2">
                <AlertTriangle className="text-accent w-5 h-5" /> Stock Warnings
              </h2>
              {stockAlerts.length === 0 ? (
                <p className="text-xs text-text-muted uppercase tracking-wider text-center py-4">
                  All stock levels normal
                </p>
              ) : (
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {stockAlerts.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-2 rounded bg-zinc-950 border border-zinc-900"
                    >
                      <div>
                        <p className="text-xs font-semibold text-text-primary">{item.name}</p>
                        <p className="text-[10px] text-accent font-mono">
                          Min: {item.minStock} {item.unit}
                        </p>
                      </div>
                      <span className="text-xs bg-accent/10 text-accent border border-accent/20 px-2 py-1 rounded font-mono">
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h2 className="text-lg font-display text-text-primary mb-4 flex items-center gap-2">
                <Calendar className="text-primary w-5 h-5" /> Pending Bookings
              </h2>
              {localData.reservations.filter((r) => r.status === "pending").length === 0 ? (
                <p className="text-xs text-text-muted uppercase tracking-wider text-center py-4">
                  No pending reservations
                </p>
              ) : (
                <div className="space-y-3">
                  {localData.reservations
                    .filter((r) => r.status === "pending")
                    .map((r) => (
                      <div
                        key={r.id}
                        className="p-3 bg-zinc-950 rounded border border-zinc-900 flex flex-col justify-between"
                      >
                        <div className="flex justify-between items-start">
                          <p className="text-xs font-semibold text-text-primary">
                            {r.customerName}
                          </p>
                          <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded font-mono uppercase">
                            Pending
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-2 text-[10px] text-text-secondary">
                          <span>
                            Pax: {r.pax} | {r.tableNumber}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReservationStatus(r.id, "confirmed")}
                              className="text-emerald-400 hover:text-emerald-300 cursor-pointer"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => handleReservationStatus(r.id, "cancelled")}
                              className="text-rose-400 hover:text-rose-300 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
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
