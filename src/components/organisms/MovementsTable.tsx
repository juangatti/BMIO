import React from "react";
import Card from "@/components/ui/Card";
import Input from "../atoms/Input";
import Select from "../atoms/Select";
import StatusBadge from "../molecules/StatusBadge";

interface MovementsTableProps {
  stockMovements: any[];
  stockItems: any[];
  users: any[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
}

export default function MovementsTable({
  stockMovements,
  stockItems,
  users,
  searchQuery,
  setSearchQuery,
  typeFilter,
  setTypeFilter,
}: MovementsTableProps) {
  const filteredMovements = [...(stockMovements || [])]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .filter((mv) => {
      const item = stockItems.find((si) => si.id === mv.stockItemId);
      const matchesSearch = item
        ? item.name.toLowerCase().includes(searchQuery.toLowerCase())
        : false;
      const matchesType = typeFilter === "All" || mv.type === typeFilter;
      return matchesSearch && matchesType;
    });

  const formatQty = (qty: number, type: string) => {
    if (type === "out") return `-${qty}`;
    if (type === "in") return `+${qty}`;
    return qty >= 0 ? `+${qty}` : `${qty}`;
  };

  return (
    <div className="space-y-6 animate-fadeIn flex flex-col h-full">
      {/* Header / Filter bar */}
      <div className="pb-5 border-b border-zinc-800/60 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-text-primary">
            Stock Movements Audit
          </h3>
          <p className="text-[10px] text-text-secondary mt-0.5 uppercase font-medium">
            Audit trail of all inventory modifications, pours, and adjustments
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Input
            type="text"
            placeholder="Search movements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="sm:w-64"
          />
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="sm:w-40 font-semibold"
          >
            <option value="All">All Types</option>
            <option value="in">In (Stock Additions)</option>
            <option value="out">Out (Pours/Sales)</option>
            <option value="adjustment">Adjustments</option>
          </Select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto flex-1">
        {filteredMovements.length === 0 ? (
          <p className="text-xs text-text-secondary p-8 text-center uppercase tracking-wider">
            No matching stock movements found.
          </p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/40 text-[10px] text-text-secondary uppercase tracking-wider">
                <th className="p-4">Item Name</th>
                <th className="p-4">Type</th>
                <th className="p-4">Quantity Change</th>
                <th className="p-4">Reason</th>
                <th className="p-4">User</th>
                <th className="p-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredMovements.map((movement) => {
                const item = stockItems.find((si) => si.id === movement.stockItemId);
                const user = users.find((u) => u.id === movement.userId);

                return (
                  <tr key={movement.id} className="hover:bg-zinc-900/20 transition-colors">
                    <td className="p-4 text-xs font-semibold text-text-primary">
                      {item?.name || "Deleted Item"}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={movement.type} />
                    </td>
                    <td className="p-4 text-xs font-mono font-bold text-text-primary">
                      {formatQty(movement.quantity, movement.type)} {item?.unit || ""}
                    </td>
                    <td className="p-4 text-xs text-text-secondary">{movement.reason}</td>
                    <td className="p-4 text-xs text-text-secondary">{user?.name || "System"}</td>
                    <td className="p-4 text-xs text-text-muted font-mono">
                      {new Date(movement.createdAt).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
