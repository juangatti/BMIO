import React from "react";
import { Plus } from "lucide-react";
import Button from "../../atoms/Button";
import StatusBadge from "../../molecules/StatusBadge";

interface ReservationsTabProps {
  reservations: any[];
  onOpenAddModal: () => void;
  handleReservationStatus: (id: string, status: "confirmed" | "cancelled") => void;
}

export default function ReservationsTab({
  reservations,
  onOpenAddModal,
  handleReservationStatus,
}: ReservationsTabProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Action Bar */}
      <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/60 flex justify-between items-center">
        <span className="text-xs uppercase tracking-wider text-text-secondary font-semibold">
          Customer Bookings List
        </span>
        <Button onClick={onOpenAddModal}>
          New Booking
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
        </Button>
      </div>

      {/* Bookings List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reservations.map((res) => (
          <div
            key={res.id}
            className="bg-zinc-900/40 border border-zinc-800/40 hover:border-primary/50 p-4 rounded-2xl flex flex-col justify-between h-44 relative group transition-all duration-300"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-semibold text-text-primary truncate max-w-[75%]">
                  {res.customerName}
                </h3>
                <StatusBadge status={res.status} />
              </div>

              <div className="space-y-1 text-xs text-text-secondary">
                <p>
                  <span className="text-text-muted">Table:</span>{" "}
                  <span className="font-semibold text-text-primary">{res.tableNumber}</span>
                </p>
                <p>
                  <span className="text-text-muted">Guests:</span>{" "}
                  <span className="font-semibold text-text-primary">{res.pax} pax</span>
                </p>
                <p>
                  <span className="text-text-muted">Date:</span>{" "}
                  <span className="font-semibold text-primary">
                    {new Date(res.reservationDate).toLocaleString()}
                  </span>
                </p>
                {res.notes && (
                  <p className="text-[10px] text-text-muted italic truncate mt-1">
                    "{res.notes}"
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2 border-t border-zinc-900/60 pt-3 mt-3">
              {res.status !== "confirmed" && (
                <button
                  onClick={() => handleReservationStatus(res.id, "confirmed")}
                  className="flex-1 text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 py-1 rounded-lg font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Confirm
                </button>
              )}
              {res.status !== "cancelled" && (
                <button
                  onClick={() => handleReservationStatus(res.id, "cancelled")}
                  className="flex-1 text-[10px] bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 py-1 rounded-lg font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
